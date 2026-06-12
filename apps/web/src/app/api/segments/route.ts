import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const segments = await prisma.segment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { campaigns: true } },
      },
    });
    return NextResponse.json({ segments });
  } catch (error) {
    console.error("[/api/segments GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch segments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, nlQuery, filterJson, audienceSize } = body;

    if (!name || !filterJson) {
      return NextResponse.json(
        { error: "name and filterJson are required" },
        { status: 400 }
      );
    }

    const segment = await prisma.segment.create({
      data: { name, description, nlQuery, filterJson, audienceSize },
    });

    return NextResponse.json({ segment }, { status: 201 });
  } catch (error) {
    console.error("[/api/segments POST] Error:", error);
    return NextResponse.json({ error: "Failed to create segment" }, { status: 500 });
  }
}
