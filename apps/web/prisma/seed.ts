import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
const prisma = new PrismaClient();

const INDIAN_FIRST_NAMES = [
  "Priya", "Rahul", "Ananya", "Arjun", "Sneha", "Vikram", "Kavya", "Rohit",
  "Nisha", "Amit", "Pooja", "Kiran", "Divya", "Suresh", "Meera", "Rajesh",
  "Anjali", "Deepak", "Sunita", "Manish", "Rekha", "Sanjay", "Neha", "Arun",
  "Shweta", "Vijay", "Lakshmi", "Sunil", "Radha", "Ravi", "Geeta", "Ashok",
  "Poonam", "Naveen", "Usha", "Manoj", "Suman", "Prakash", "Mamta", "Vinod",
  "Seema", "Girish", "Aarti", "Ramesh", "Nidhi", "Dinesh", "Jaya", "Harish",
  "Tanya", "Nikhil", "Ruchika", "Gaurav", "Pallavi", "Sameer", "Preeti", "Tarun",
  "Ritika", "Abhinav", "Shreya", "Kartik", "Ishaan", "Aditi", "Vivek", "Tanvi"
];

const INDIAN_LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Joshi", "Agarwal",
  "Mehta", "Shah", "Malhotra", "Kapoor", "Nair", "Reddy", "Pillai", "Rao",
  "Iyer", "Menon", "Bose", "Ghosh", "Mukherjee", "Banerjee", "Das", "Roy",
  "Chatterjee", "Desai", "Jain", "Saxena", "Pandey", "Mishra", "Tiwari", "Dubey"
];

const CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata",
  "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur",
  "Nagpur", "Indore", "Bhopal", "Visakhapatnam", "Chandigarh", "Coimbatore"
];

const TAGS_POOL = [
  "loyal", "high_value", "new_customer", "dormant", "vip",
  "sale_shopper", "full_price_buyer", "repeat_buyer", "one_time_buyer",
  "referral", "social_follower", "app_user", "newsletter_subscriber"
];

function randomIndianName(): string {
  const first = INDIAN_FIRST_NAMES[Math.floor(Math.random() * INDIAN_FIRST_NAMES.length)];
  const last = INDIAN_LAST_NAMES[Math.floor(Math.random() * INDIAN_LAST_NAMES.length)];
  return `${first} ${last}`;
}

function randomTags(): string[] {
  const count = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...TAGS_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomOrderAmount(customerType: "high" | "mid" | "low"): number {
  switch (customerType) {
    case "high": return Math.floor(Math.random() * 8000) + 2000;  // 2000-10000
    case "mid":  return Math.floor(Math.random() * 2000) + 500;   // 500-2500
    case "low":  return Math.floor(Math.random() * 500) + 100;    // 100-600
  }
}

function randomPastDate(daysAgo: { min: number; max: number }): Date {
  const days = Math.floor(Math.random() * (daysAgo.max - daysAgo.min)) + daysAgo.min;
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function main() {
  console.log("🌱 Seeding EMVO database...");

  // Clear existing data
  await prisma.messageEvent.deleteMany();
  await prisma.message.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.segment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();

  console.log("🗑️  Cleared existing data");

  const customers = [];

  // Segment 1: High-value + recently dormant (good for win-back)
  // 150 customers with high spend, last order 60-120 days ago
  for (let i = 0; i < 150; i++) {
    const name = randomIndianName();
    customers.push({
      name,
      email: faker.internet.email({ firstName: name.split(" ")[0], lastName: name.split(" ")[1] }).toLowerCase(),
      phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      city: CITIES[Math.floor(Math.random() * CITIES.length)],
      tags: [...new Set([...randomTags(), "dormant", "high_value"])],
      orderCount: Math.floor(Math.random() * 5) + 3,
      orderDateRange: { min: 60, max: 120 },
      customerType: "high" as const,
    });
  }

  // Segment 2: Active loyal customers (good for upsell/loyalty)
  // 180 customers, recent orders within 30 days, moderate-high spend
  for (let i = 0; i < 180; i++) {
    const name = randomIndianName();
    customers.push({
      name,
      email: faker.internet.email({ firstName: name.split(" ")[0], lastName: name.split(" ")[1] }).toLowerCase(),
      phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      city: CITIES[Math.floor(Math.random() * CITIES.length)],
      tags: [...new Set([...randomTags(), "loyal", "repeat_buyer"])],
      orderCount: Math.floor(Math.random() * 8) + 4,
      orderDateRange: { min: 1, max: 30 },
      customerType: "mid" as const,
    });
  }

  // Segment 3: One-time buyers (good for re-engagement)
  // 120 customers, only 1-2 orders, 30-90 days ago
  for (let i = 0; i < 120; i++) {
    const name = randomIndianName();
    customers.push({
      name,
      email: faker.internet.email({ firstName: name.split(" ")[0], lastName: name.split(" ")[1] }).toLowerCase(),
      phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      city: CITIES[Math.floor(Math.random() * CITIES.length)],
      tags: [...new Set([...randomTags(), "one_time_buyer"])],
      orderCount: Math.floor(Math.random() * 2) + 1,
      orderDateRange: { min: 30, max: 90 },
      customerType: "low" as const,
    });
  }

  // Segment 4: VIP / ultra high-value customers
  // 50 customers with very high spend, recent
  for (let i = 0; i < 50; i++) {
    const name = randomIndianName();
    customers.push({
      name,
      email: faker.internet.email({ firstName: name.split(" ")[0], lastName: name.split(" ")[1] }).toLowerCase(),
      phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      city: ["Mumbai", "Delhi", "Bengaluru"][Math.floor(Math.random() * 3)],
      tags: [...new Set([...randomTags(), "vip", "high_value", "loyal"])],
      orderCount: Math.floor(Math.random() * 10) + 8,
      orderDateRange: { min: 1, max: 45 },
      customerType: "high" as const,
    });
  }

  console.log(`📦 Creating ${customers.length} customers...`);

  // Insert customers and their orders
  let insertedCount = 0;
  const emailsSeen = new Set<string>();

  for (const c of customers) {
    // Deduplicate emails
    if (emailsSeen.has(c.email)) {
      c.email = `${Date.now()}_${Math.random().toString(36).slice(2)}@emvo-demo.com`;
    }
    emailsSeen.add(c.email);

    const customer = await prisma.customer.create({
      data: {
        name: c.name,
        email: c.email,
        phone: c.phone,
        city: c.city,
        tags: c.tags,
      },
    });

    // Create orders for this customer
    const orderPromises = [];
    for (let j = 0; j < c.orderCount; j++) {
      // Most recent order matches the target range; earlier orders are older
      const dateRange =
        j === 0
          ? c.orderDateRange
          : { min: c.orderDateRange.max, max: c.orderDateRange.max + 180 };

      orderPromises.push(
        prisma.order.create({
          data: {
            customerId: customer.id,
            totalAmount: randomOrderAmount(c.customerType),
            status: Math.random() > 0.05 ? "completed" : "returned",
            orderedAt: randomPastDate(dateRange),
          },
        })
      );
    }
    await Promise.all(orderPromises);
    insertedCount++;
  }

  console.log(`✅ Inserted ${insertedCount} customers with orders`);

  // Seed sample segments
  await prisma.segment.createMany({
    data: [
      {
        name: "High-Value Dormant Customers",
        description: "Spent ₹5000+ but inactive for 60+ days",
        nlQuery: "customers who spent more than ₹5000 but haven't purchased in 60 days",
        filterJson: { totalSpendGte: 5000, daysSinceLastOrderGte: 60 },
        audienceSize: 142,
      },
      {
        name: "Active Loyal Shoppers",
        description: "Purchased in last 30 days with 4+ orders",
        nlQuery: "loyal customers who bought in the last 30 days",
        filterJson: { daysSinceLastOrderLte: 30, minOrders: 4 },
        audienceSize: 168,
      },
      {
        name: "VIP Mumbai Customers",
        description: "High-value customers in Mumbai",
        nlQuery: "VIP customers in Mumbai",
        filterJson: { totalSpendGte: 8000, cities: ["Mumbai"] },
        audienceSize: 18,
      },
    ],
  });

  console.log("✅ Seeded sample segments");
  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
