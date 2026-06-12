import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Quick dashboard stats endpoint
export async function GET() {
  try {
    const [
      totalCustomers,
      totalCampaigns,
      activeCampaigns,
      recentCampaigns,
      messageStats,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: "sending" } }),
      prisma.campaign.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          segment: { select: { name: true, audienceSize: true } },
          _count: { select: { messages: true } },
        },
      }),
      prisma.message.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    // Aggregate all-time message funnel
    const allTimeFunnel: Record<string, number> = {};
    let totalMessages = 0;
    for (const row of messageStats) {
      allTimeFunnel[row.status] = row._count.status;
      totalMessages += row._count.status;
    }

    const delivered = allTimeFunnel.delivered || 0;
    const opened = allTimeFunnel.opened || 0;
    const clicked = allTimeFunnel.clicked || 0;
    const converted = allTimeFunnel.converted || 0;

    const overallDeliveryRate =
      totalMessages > 0 ? (delivered + opened + clicked + converted) / totalMessages : 0;

    return NextResponse.json({
      stats: {
        totalCustomers,
        totalCampaigns,
        activeCampaigns,
        totalMessages,
        overallDeliveryRate,
      },
      recentCampaigns,
      allTimeFunnel,
    });
  } catch (error) {
    console.error("[/api/dashboard] Error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
