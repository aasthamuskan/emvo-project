import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAudienceCustomerIds, getCustomersByIds } from "@/lib/audience";
import { sendMessageBatch } from "@/lib/channel-client";

const CRM_BASE_URL =
  process.env.NEXTAUTH_URL ||
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch campaign + segment
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { segment: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    if (campaign.status !== "draft") {
      return NextResponse.json(
        { error: `Campaign is already ${campaign.status}` },
        { status: 409 }
      );
    }
    if (!campaign.segment || !campaign.segment.filterJson) {
      return NextResponse.json(
        { error: "Campaign has no segment filters configured" },
        { status: 400 }
      );
    }

    // Get audience customer IDs
    const filters = campaign.segment.filterJson as Record<string, unknown>;
    const customerIds = await getAudienceCustomerIds(filters as any);

    if (customerIds.length === 0) {
      return NextResponse.json(
        { error: "No customers match this segment's filters" },
        { status: 400 }
      );
    }

    // Get customer details for personalization
    const customers = await getCustomersByIds(customerIds);

    // Mark campaign as sending
    await prisma.campaign.update({
      where: { id },
      data: { status: "sending", launchedAt: new Date() },
    });

    // Materialize messages (one per customer, personalized)
    const messageData = customers.map((customer) => ({
      campaignId: id,
      customerId: customer.id,
      channel: campaign.channel,
      body: campaign.messageBody.replace(/\[NAME\]/g, customer.name.split(" ")[0]),
      status: "queued",
    }));

    // Batch insert messages
    await prisma.message.createMany({ data: messageData });

    // Fetch created message IDs
    const messages = await prisma.message.findMany({
      where: { campaignId: id },
      select: { id: true, customerId: true, body: true },
    });

    // Update segment audience size
    await prisma.segment.update({
      where: { id: campaign.segment.id },
      data: { audienceSize: customers.length },
    });

    // Build payload for channel service
    const customerMap = new Map(customers.map((c) => [c.id, c]));
    const outboundMessages = messages.map((msg: { id: string; customerId: string; body: string }) => {
      const customer = customerMap.get(msg.customerId);
      return {
        message_id: msg.id,
        customer_phone: customer?.phone ?? "",
        channel: campaign.channel,
        body: msg.body,
        callback_url: `${CRM_BASE_URL}/api/receipt`,
      };
    });

    // Send to channel service (fire and forget — it responds async via callbacks)
    sendMessageBatch(outboundMessages).catch((err) => {
      console.error("[Send] Channel service error:", err.message);
      // Don't fail the campaign — callbacks may still work after service recovers
    });

    return NextResponse.json({
      ok: true,
      campaignId: id,
      messagesQueued: messages.length,
    });
  } catch (error) {
    console.error("[/api/campaigns/:id/send] Error:", error);
    // If something went wrong after we started, mark campaign failed
    const { id } = await params;
    await prisma.campaign.update({
      where: { id },
      data: { status: "failed" },
    }).catch(() => {});
    return NextResponse.json({ error: "Failed to launch campaign" }, { status: 500 });
  }
}
