import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { faker } from "@faker-js/faker";

const INDIAN_NAMES = [
  "Priya Sharma", "Rahul Verma", "Ananya Gupta", "Arjun Singh", "Sneha Kumar",
  "Vikram Patel", "Kavya Joshi", "Rohit Agarwal", "Nisha Mehta", "Amit Shah",
  "Pooja Malhotra", "Kiran Kapoor", "Divya Nair", "Suresh Reddy", "Meera Pillai",
  "Rajesh Rao", "Anjali Iyer", "Deepak Menon", "Sunita Bose", "Manish Ghosh",
  "Rekha Mukherjee", "Sanjay Banerjee", "Neha Das", "Arun Roy", "Shweta Desai",
  "Vijay Jain", "Lakshmi Saxena", "Sunil Pandey", "Radha Mishra", "Ravi Tiwari",
  "Geeta Dubey", "Ashok Chatterjee", "Poonam Srivastava", "Naveen Yadav", "Usha Tripathi",
  "Manoj Chauhan", "Suman Rajput", "Prakash Sharma", "Mamta Verma", "Vinod Gupta",
  "Seema Singh", "Girish Kumar", "Aarti Patel", "Ramesh Joshi", "Nidhi Agarwal",
  "Dinesh Mehta", "Jaya Shah", "Harish Malhotra", "Tanya Kapoor", "Nikhil Nair",
  "Ruchika Reddy", "Gaurav Pillai", "Pallavi Rao", "Sameer Iyer", "Preeti Menon",
  "Tarun Bose", "Ritika Ghosh", "Abhinav Mukherjee", "Shreya Banerjee", "Kartik Das",
  "Ishaan Roy", "Aditi Desai", "Vivek Jain", "Tanvi Saxena", "Rohan Pandey",
  "Swati Mishra", "Yash Tiwari", "Priyanka Dubey", "Kabir Chatterjee", "Zara Srivastava",
  "Harsh Yadav", "Simran Tripathi", "Dev Chauhan", "Aisha Rajput", "Nitin Sharma",
  "Divya Kapoor", "Ajay Nair", "Sunaina Reddy", "Karan Pillai", "Meghna Rao",
  "Akash Iyer", "Parul Menon", "Siddharth Bose", "Jyoti Ghosh", "Varun Das"
];

const CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata",
  "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Indore", "Chandigarh"
];

const TAGS_POOL = [
  "loyal", "high_value", "new_customer", "dormant", "vip",
  "sale_shopper", "full_price_buyer", "repeat_buyer", "one_time_buyer", "app_user"
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randBetween(a: number, b: number) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}
function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}
function randomTags(forceTags: string[] = []): string[] {
  const extra = [...TAGS_POOL].sort(() => Math.random() - 0.5).slice(0, randBetween(1, 2));
  return [...new Set([...forceTags, ...extra])];
}

export async function GET() {
  try {
    const existingCount = await prisma.customer.count();
    if (existingCount > 0) {
      return NextResponse.json({
        message: `Already seeded — ${existingCount} customers exist.`,
        customers: existingCount,
      });
    }

    // ─── Build all customer + order data in memory first ───────────────────
    type CustomerSpec = {
      name: string; email: string; phone: string; city: string; tags: string[];
      orders: { totalAmount: number; status: string; orderedAt: Date }[];
    };

    const specs: CustomerSpec[] = [];
    const emailsSeen = new Set<string>();

    function makeCustomer(
      idx: number,
      forceTags: string[],
      orderCount: number,
      firstOrderDaysMin: number,
      firstOrderDaysMax: number,
      laterOrderDaysMax: number,
      spendMin: number,
      spendMax: number
    ): CustomerSpec {
      const name = INDIAN_NAMES[idx % INDIAN_NAMES.length];
      let email = faker.internet.email({ firstName: name.split(" ")[0], lastName: `${idx}` }).toLowerCase();
      if (emailsSeen.has(email)) email = `u${idx}_${Date.now()}@emvo-demo.com`;
      emailsSeen.add(email);

      const orders = [];
      for (let j = 0; j < orderCount; j++) {
        const minD = j === 0 ? firstOrderDaysMin : firstOrderDaysMax;
        const maxD = j === 0 ? firstOrderDaysMax : laterOrderDaysMax;
        orders.push({
          totalAmount: randBetween(spendMin, spendMax),
          status: Math.random() > 0.05 ? "completed" : "returned",
          orderedAt: daysAgo(randBetween(minD, maxD)),
        });
      }

      return {
        name,
        email,
        phone: `+91${randBetween(7000000000, 9999999999)}`,
        city: pick(CITIES),
        tags: randomTags(forceTags),
        orders,
      };
    }

    // Segment 1: High-value dormant (140 customers)
    for (let i = 0; i < 140; i++) {
      specs.push(makeCustomer(i, ["high_value", "dormant"], randBetween(3, 7), 60, 150, 365, 2000, 10000));
    }
    // Segment 2: Active loyal (160 customers)
    for (let i = 0; i < 160; i++) {
      specs.push(makeCustomer(i + 200, ["loyal", "repeat_buyer"], randBetween(4, 12), 1, 30, 365, 800, 5000));
    }
    // Segment 3: One-time buyers (120 customers)
    for (let i = 0; i < 120; i++) {
      specs.push(makeCustomer(i + 400, ["one_time_buyer"], 1, 30, 90, 90, 300, 2000));
    }
    // Segment 4: VIP (80 customers)
    for (let i = 0; i < 80; i++) {
      specs.push(makeCustomer(i + 600, ["vip", "high_value", "loyal"], randBetween(8, 20), 1, 45, 365, 5000, 25000));
    }

    // ─── Bulk insert customers ──────────────────────────────────────────────
    await prisma.customer.createMany({
      data: specs.map((s) => ({
        name: s.name,
        email: s.email,
        phone: s.phone,
        city: s.city,
        tags: s.tags,
      })),
      skipDuplicates: true,
    });

    // Fetch back with IDs
    const customers = await prisma.customer.findMany({
      select: { id: true, email: true },
    });
    const emailToId = new Map(customers.map((c) => [c.email, c.id]));

    // ─── Bulk insert all orders ─────────────────────────────────────────────
    const allOrders: { customerId: string; totalAmount: number; status: string; orderedAt: Date }[] = [];
    for (const spec of specs) {
      const customerId = emailToId.get(spec.email);
      if (!customerId) continue;
      for (const order of spec.orders) {
        allOrders.push({ customerId, ...order });
      }
    }

    // Insert in chunks of 500 to avoid request size limits
    const CHUNK = 500;
    for (let i = 0; i < allOrders.length; i += CHUNK) {
      await prisma.order.createMany({
        data: allOrders.slice(i, i + CHUNK),
        skipDuplicates: true,
      });
    }

    // ─── Seed sample segments ───────────────────────────────────────────────
    await prisma.segment.createMany({
      data: [
        {
          name: "High-Value Dormant Customers",
          description: "Spent ₹5000+ but inactive for 60+ days",
          nlQuery: "customers who spent more than ₹5000 but haven't purchased in 60 days",
          filterJson: { totalSpendGte: 5000, daysSinceLastOrderGte: 60 },
          audienceSize: 128,
        },
        {
          name: "Active Loyal Shoppers",
          description: "Purchased in last 30 days with 4+ orders",
          nlQuery: "loyal customers who bought in the last 30 days with 4 or more orders",
          filterJson: { daysSinceLastOrderLte: 30, minOrders: 4 },
          audienceSize: 156,
        },
        {
          name: "VIP Customers",
          description: "High-spend customers with 8+ orders",
          nlQuery: "VIP customers who have placed 8 or more orders",
          filterJson: { totalSpendGte: 8000, minOrders: 8 },
          audienceSize: 72,
        },
      ],
      skipDuplicates: true,
    });

    return NextResponse.json({
      message: "Database seeded successfully ✅",
      customers: specs.length,
      orders: allOrders.length,
    });
  } catch (error) {
    console.error("[/api/seed] Error:", error);
    return NextResponse.json(
      { error: "Seed failed: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
