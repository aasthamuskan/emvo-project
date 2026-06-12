// Shared TypeScript types used across the EMVO web app

export type Channel = "whatsapp" | "sms" | "email" | "rcs";

export type MessageStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "converted"
  | "failed";

export type CampaignStatus = "draft" | "sending" | "completed" | "failed";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  tags: string[];
  createdAt: string;
  _count?: {
    orders: number;
  };
  totalSpend?: number;
  lastOrderAt?: string | null;
}

export interface Order {
  id: string;
  customerId: string;
  totalAmount: number;
  status: string;
  orderedAt: string;
  createdAt: string;
}

export interface Segment {
  id: string;
  name: string;
  description: string | null;
  nlQuery: string | null;
  filterJson: Record<string, unknown>;
  audienceSize: number | null;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  segmentId: string | null;
  channel: Channel;
  messageBody: string;
  status: CampaignStatus;
  scheduledAt: string | null;
  launchedAt: string | null;
  createdAt: string;
  segment?: Segment;
  _count?: {
    messages: number;
  };
}

export interface Message {
  id: string;
  campaignId: string;
  customerId: string;
  channel: Channel;
  body: string;
  status: MessageStatus;
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  convertedAt: string | null;
  failedAt: string | null;
  createdAt: string;
  customer?: Customer;
}

export interface CampaignAnalytics {
  campaignId: string;
  campaignName: string;
  status: CampaignStatus;
  channel: Channel;
  totalMessages: number;
  funnel: {
    queued: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    failed: number;
  };
  rates: {
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  };
  aiInsight?: string;
}

export interface AIPlanResult {
  intent: string;
  filters: AudienceFilters;
  audienceCount: number;
  suggestedChannel: Channel;
  campaignName: string;
  messageVariants: MessageVariant[];
  aiReasoning: string;
}

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

export interface MessageVariant {
  id: string;
  body: string;
}

export interface ReceiptPayload {
  message_id: string;
  event: MessageStatus;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
