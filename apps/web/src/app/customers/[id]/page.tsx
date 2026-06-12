"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, ShoppingBag, MessageSquare } from "lucide-react";
import Link from "next/link";
import { formatCurrency, timeAgo, CHANNEL_ICONS } from "@/lib/utils";

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  tags: string[];
  createdAt: string;
  totalSpend: number;
  lastOrderAt: string | null;
  orders: {
    id: string;
    totalAmount: number;
    status: string;
    orderedAt: string;
  }[];
  messages: {
    id: string;
    status: string;
    channel: string;
    body: string;
    createdAt: string;
    campaign: { id: string; name: string; channel: string };
  }[];
}

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: customer, isLoading } = useQuery<CustomerProfile>({
    queryKey: ["customer", id],
    queryFn: () => fetch(`/api/customers/${id}`).then((r) => r.json()),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} />
      </div>
    );
  }

  if (!customer || (customer as any).error) {
    return (
      <div className="p-8 text-center" style={{ color: "var(--text-muted)" }}>
        Customer not found.
      </div>
    );
  }

  return (
    <div className="min-h-full p-8">
      <Link
        href="/customers"
        className="inline-flex items-center gap-2 text-sm mb-6 hover:opacity-80 transition-opacity"
        style={{ color: "var(--text-secondary)" }}
      >
        <ArrowLeft size={14} />
        All Customers
      </Link>

      {/* Profile header */}
      <div className="flex items-start gap-4 mb-8">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white" }}
        >
          {customer.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {customer.name}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {customer.email} {customer.phone ? `· ${customer.phone}` : ""}{" "}
            {customer.city ? `· ${customer.city}` : ""}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {customer.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--bg-border)" }}
              >
                {tag.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Spend", value: formatCurrency(customer.totalSpend), color: "#60a5fa" },
          { label: "Total Orders", value: String(customer.orders.length), color: "#a78bfa" },
          { label: "Last Order", value: customer.lastOrderAt ? timeAgo(customer.lastOrderAt) : "Never", color: "#34d399" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-4">
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order history */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag size={14} style={{ color: "var(--text-muted)" }} />
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              Order History
            </h2>
          </div>
          <div className="space-y-2">
            {customer.orders.slice(0, 10).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-2 border-b"
                style={{ borderColor: "var(--bg-border)" }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {formatCurrency(order.totalAmount)}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(order.orderedAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full capitalize"
                  style={{
                    background: order.status === "completed" ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)",
                    color: order.status === "completed" ? "#34d399" : "#f87171",
                  }}
                >
                  {order.status}
                </span>
              </div>
            ))}
            {customer.orders.length === 0 && (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No orders yet.</p>
            )}
          </div>
        </div>

        {/* Campaign messages */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={14} style={{ color: "var(--text-muted)" }} />
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              Message History
            </h2>
          </div>
          <div className="space-y-3">
            {customer.messages.slice(0, 8).map((msg) => (
              <div
                key={msg.id}
                className="p-3 rounded-lg border"
                style={{ background: "var(--bg-surface)", borderColor: "var(--bg-border)" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <Link
                    href={`/campaigns/${msg.campaign.id}`}
                    className="text-xs font-medium hover:opacity-80"
                    style={{ color: "#60a5fa" }}
                  >
                    {msg.campaign.name}
                  </Link>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {CHANNEL_ICONS[msg.channel]} {timeAgo(msg.createdAt)}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {msg.body.length > 100 ? msg.body.slice(0, 100) + "…" : msg.body}
                </p>
                <p className="text-xs mt-1.5 capitalize" style={{ color: "var(--text-muted)" }}>
                  Status: {msg.status}
                </p>
              </div>
            ))}
            {customer.messages.length === 0 && (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No messages sent to this customer yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
