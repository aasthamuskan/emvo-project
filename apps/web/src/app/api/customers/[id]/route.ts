import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { orderedAt: "desc" },
          take: 20,
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            campaign: { select: { id: true, name: true, channel: true } },
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Calculate derived stats
    const totalSpend = customer.orders.reduce(
      (sum: number, o: { totalAmount: { toString: () => string } }) => sum + Number(o.totalAmount),
      0
    );
    const lastOrder = customer.orders[0] ?? null;

    return NextResponse.json({
      ...customer,
      totalSpend,
      lastOrderAt: lastOrder?.orderedAt ?? null,
    });
  } catch (error) {
    console.error("[/api/customers/:id] Error:", error);
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
  }
}
