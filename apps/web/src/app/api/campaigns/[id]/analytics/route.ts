import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCampaignInsight } from "@/lib/openai";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        status: true,
        channel: true,
        aiInsight: true,
        launchedAt: true,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Aggregate message status counts
    const statusCounts = await prisma.message.groupBy({
      by: ["status"],
      where: { campaignId: id },
      _count: { status: true },
    });

    const funnel: Record<string, number> = {
      queued: 0,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      failed: 0,
    };

    let total = 0;
    for (const row of statusCounts) {
      funnel[row.status] = (funnel[row.status] || 0) + row._count.status;
      total += row._count.status;
    }

    // Calculate rates (denominator = total messages sent/attempted)
    const attempted = total - funnel.queued;
    const rates = {
      deliveryRate: attempted > 0 ? funnel.delivered / attempted : 0,
      openRate: funnel.delivered > 0 ? funnel.opened / funnel.delivered : 0,
      clickRate: funnel.opened > 0 ? funnel.clicked / funnel.opened : 0,
      conversionRate: funnel.clicked > 0 ? funnel.converted / funnel.clicked : 0,
    };

    // Auto-complete campaign if all messages have reached terminal state
    const terminalCount =
      funnel.delivered +
      funnel.opened +
      funnel.clicked +
      funnel.converted +
      funnel.failed;

    let aiInsight = campaign.aiInsight;

    if (
      campaign.status === "sending" &&
      attempted > 0 &&
      terminalCount >= attempted * 0.95 // 95% threshold — account for stragglers
    ) {
      // Generate AI insight before marking complete
      if (!aiInsight) {
        try {
          aiInsight = await generateCampaignInsight({
            campaignName: campaign.name,
            channel: campaign.channel,
            totalMessages: total,
            deliveryRate: rates.deliveryRate,
            openRate: rates.openRate,
            clickRate: rates.clickRate,
            conversionRate: rates.conversionRate,
          });

          await prisma.campaign.update({
            where: { id },
            data: { status: "completed", aiInsight },
          });
        } catch (err) {
          console.error("[Analytics] Failed to generate insight:", err);
          await prisma.campaign.update({
            where: { id },
            data: { status: "completed" },
          });
        }
      }
    }

    return NextResponse.json({
      campaignId: id,
      campaignName: campaign.name,
      status: campaign.status,
      channel: campaign.channel,
      totalMessages: total,
      funnel,
      rates,
      aiInsight,
    });
  } catch (error) {
    console.error("[/api/campaigns/:id/analytics] Error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
