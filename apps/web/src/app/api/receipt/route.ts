import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Map incoming event types to message status + timestamp field
const EVENT_TO_STATUS: Record<string, { status: string; field: string }> = {
  sent: { status: "sent", field: "sentAt" },
  delivered: { status: "delivered", field: "deliveredAt" },
  opened: { status: "opened", field: "openedAt" },
  clicked: { status: "clicked", field: "clickedAt" },
  converted: { status: "converted", field: "convertedAt" },
  failed: { status: "failed", field: "failedAt" },
};

// Status precedence — only advance, never go backwards
const STATUS_ORDER = [
  "queued", "sent", "delivered", "opened", "clicked", "converted", "failed"
];

function isStatusAdvancement(current: string, incoming: string): boolean {
  const currentIdx = STATUS_ORDER.indexOf(current);
  const incomingIdx = STATUS_ORDER.indexOf(incoming);
  // Failed can always be set; otherwise must advance
  return incoming === "failed" || incomingIdx > currentIdx;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message_id, event, timestamp, metadata } = body;

    if (!message_id || !event) {
      return NextResponse.json(
        { error: "message_id and event are required" },
        { status: 400 }
      );
    }

    const mapping = EVENT_TO_STATUS[event];
    if (!mapping) {
      return NextResponse.json(
        { error: `Unknown event type: ${event}` },
        { status: 400 }
      );
    }

    // Fetch current message to check status
    const message = await prisma.message.findUnique({
      where: { id: message_id },
      select: { id: true, status: true, campaignId: true },
    });

    if (!message) {
      // Message not found — could be a duplicate callback for a deleted campaign
      console.warn(`[Receipt] Message not found: ${message_id}`);
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Always log the event (immutable audit trail)
    await prisma.messageEvent.create({
      data: {
        messageId: message_id,
        eventType: event,
        payload: metadata || {},
        receivedAt: timestamp ? new Date(timestamp) : new Date(),
      },
    });

    // Only update message status if it's an advancement (idempotent)
    if (isStatusAdvancement(message.status, mapping.status)) {
      await prisma.message.update({
        where: { id: message_id },
        data: {
          status: mapping.status,
          [mapping.field]: timestamp ? new Date(timestamp) : new Date(),
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[/api/receipt] Error:", error);
    // Return 500 so channel service retries
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
