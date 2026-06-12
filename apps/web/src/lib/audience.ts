import { prisma } from "./prisma";

export interface AudienceFilters {
  totalSpendGte?: number;
  totalSpendLte?: number;
  daysSinceLastOrderGte?: number;
  daysSinceLastOrderLte?: number;
  minOrders?: number;
  maxOrders?: number;
  cities?: string[];
  tags?: string[];
}

/**
 * Count customers matching the given audience filters.
 * Uses raw SQL for complex aggregation queries that Prisma can't express cleanly.
 */
export async function countAudience(filters: AudienceFilters): Promise<number> {
  const conditions: string[] = ["1=1"];
  const values: unknown[] = [];
  let paramIdx = 1;

  // Build subquery for spend + recency filters
  const havingClauses: string[] = [];

  if (filters.totalSpendGte !== undefined) {
    havingClauses.push(`SUM(o.total_amount) >= $${paramIdx}`);
    values.push(filters.totalSpendGte);
    paramIdx++;
  }
  if (filters.totalSpendLte !== undefined) {
    havingClauses.push(`SUM(o.total_amount) <= $${paramIdx}`);
    values.push(filters.totalSpendLte);
    paramIdx++;
  }
  if (filters.daysSinceLastOrderGte !== undefined) {
    havingClauses.push(
      `MAX(o.ordered_at) <= NOW() - INTERVAL '1 day' * $${paramIdx}`
    );
    values.push(filters.daysSinceLastOrderGte);
    paramIdx++;
  }
  if (filters.daysSinceLastOrderLte !== undefined) {
    havingClauses.push(
      `MAX(o.ordered_at) >= NOW() - INTERVAL '1 day' * $${paramIdx}`
    );
    values.push(filters.daysSinceLastOrderLte);
    paramIdx++;
  }
  if (filters.minOrders !== undefined) {
    havingClauses.push(`COUNT(o.id) >= $${paramIdx}`);
    values.push(filters.minOrders);
    paramIdx++;
  }
  if (filters.maxOrders !== undefined) {
    havingClauses.push(`COUNT(o.id) <= $${paramIdx}`);
    values.push(filters.maxOrders);
    paramIdx++;
  }

  // Direct customer attribute filters
  if (filters.cities && filters.cities.length > 0) {
    conditions.push(`c.city = ANY($${paramIdx}::text[])`);
    values.push(filters.cities);
    paramIdx++;
  }
  if (filters.tags && filters.tags.length > 0) {
    conditions.push(`c.tags && $${paramIdx}::text[]`);
    values.push(filters.tags);
    paramIdx++;
  }

  const whereClause = conditions.join(" AND ");
  const havingClause =
    havingClauses.length > 0 ? `HAVING ${havingClauses.join(" AND ")}` : "";

  let query: string;

  if (havingClauses.length > 0) {
    // Need to join orders for aggregation filters
    query = `
      SELECT COUNT(*) as count FROM (
        SELECT c.id
        FROM customers c
        JOIN orders o ON o.customer_id = c.id
        WHERE ${whereClause}
        GROUP BY c.id
        ${havingClause}
      ) matched
    `;
  } else {
    // Simple customer-only query
    query = `
      SELECT COUNT(*) as count
      FROM customers c
      WHERE ${whereClause}
    `;
  }

  const result = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    query,
    ...values
  );
  return Number(result[0]?.count ?? 0);
}

/**
 * Get customer IDs matching the given audience filters.
 * Used when materializing messages for a campaign.
 */
export async function getAudienceCustomerIds(
  filters: AudienceFilters
): Promise<string[]> {
  const conditions: string[] = ["1=1"];
  const values: unknown[] = [];
  let paramIdx = 1;

  const havingClauses: string[] = [];

  if (filters.totalSpendGte !== undefined) {
    havingClauses.push(`SUM(o.total_amount) >= $${paramIdx}`);
    values.push(filters.totalSpendGte);
    paramIdx++;
  }
  if (filters.totalSpendLte !== undefined) {
    havingClauses.push(`SUM(o.total_amount) <= $${paramIdx}`);
    values.push(filters.totalSpendLte);
    paramIdx++;
  }
  if (filters.daysSinceLastOrderGte !== undefined) {
    havingClauses.push(
      `MAX(o.ordered_at) <= NOW() - INTERVAL '1 day' * $${paramIdx}`
    );
    values.push(filters.daysSinceLastOrderGte);
    paramIdx++;
  }
  if (filters.daysSinceLastOrderLte !== undefined) {
    havingClauses.push(
      `MAX(o.ordered_at) >= NOW() - INTERVAL '1 day' * $${paramIdx}`
    );
    values.push(filters.daysSinceLastOrderLte);
    paramIdx++;
  }
  if (filters.minOrders !== undefined) {
    havingClauses.push(`COUNT(o.id) >= $${paramIdx}`);
    values.push(filters.minOrders);
    paramIdx++;
  }
  if (filters.maxOrders !== undefined) {
    havingClauses.push(`COUNT(o.id) <= $${paramIdx}`);
    values.push(filters.maxOrders);
    paramIdx++;
  }

  if (filters.cities && filters.cities.length > 0) {
    conditions.push(`c.city = ANY($${paramIdx}::text[])`);
    values.push(filters.cities);
    paramIdx++;
  }
  if (filters.tags && filters.tags.length > 0) {
    conditions.push(`c.tags && $${paramIdx}::text[]`);
    values.push(filters.tags);
    paramIdx++;
  }

  const whereClause = conditions.join(" AND ");
  const havingClause =
    havingClauses.length > 0 ? `HAVING ${havingClauses.join(" AND ")}` : "";

  let query: string;

  if (havingClauses.length > 0) {
    query = `
      SELECT c.id, c.name
      FROM customers c
      JOIN orders o ON o.customer_id = c.id
      WHERE ${whereClause}
      GROUP BY c.id
      ${havingClause}
    `;
  } else {
    query = `
      SELECT c.id, c.name
      FROM customers c
      WHERE ${whereClause}
    `;
  }

  const result = await prisma.$queryRawUnsafe<{ id: string; name: string }[]>(
    query,
    ...values
  );
  return result.map((r) => r.id);
}

/**
 * Get customer basic info for message personalization.
 */
export async function getCustomersByIds(
  ids: string[]
): Promise<{ id: string; name: string; phone: string | null; email: string }[]> {
  return prisma.customer.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, phone: true, email: true },
  });
}
