import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        segment: { select: { id: true, name: true, audienceSize: true } },
        _count: { select: { messages: true } },
      },
    });
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("[/api/campaigns GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, channel, messageBody, segmentId, filterJson, nlQuery, audienceSize } = body;

    if (!name || !channel || !messageBody) {
      return NextResponse.json(
        { error: "name, channel, and messageBody are required" },
        { status: 400 }
      );
    }

    // If no segmentId provided, create a new segment from the filter
    let resolvedSegmentId = segmentId;
    if (!segmentId && filterJson) {
      const segment = await prisma.segment.create({
        data: {
          name: `${name} — Audience`,
          nlQuery: nlQuery || null,
          filterJson: filterJson,
          audienceSize: audienceSize || null,
        },
      });
      resolvedSegmentId = segment.id;
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        channel,
        messageBody,
        segmentId: resolvedSegmentId || null,
        status: "draft",
      },
      include: {
        segment: true,
      },
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error("[/api/campaigns POST] Error:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
