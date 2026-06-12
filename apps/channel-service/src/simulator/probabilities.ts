// Probability config for message lifecycle simulation
export const CHANNEL_PROBABILITIES = {
  // Base delivery rates per channel
  delivery: {
    whatsapp: 0.96,
    sms: 0.92,
    email: 0.88,
    rcs: 0.94,
  },
  // Open rate (of delivered)
  open: {
    whatsapp: 0.72,
    sms: 0.65,
    email: 0.38,
    rcs: 0.68,
  },
  // Click rate (of opened)
  click: {
    whatsapp: 0.32,
    sms: 0.18,
    email: 0.22,
    rcs: 0.28,
  },
  // Conversion rate (of clicked)
  convert: {
    whatsapp: 0.12,
    sms: 0.08,
    email: 0.09,
    rcs: 0.11,
  },
} as const;

// Delay ranges in milliseconds for realistic async simulation
export const LIFECYCLE_DELAYS = {
  sent: { min: 100, max: 500 },
  delivered: { min: 500, max: 2000 },
  opened: { min: 3000, max: 12000 },
  clicked: { min: 8000, max: 25000 },
  converted: { min: 20000, max: 60000 },
  failed: { min: 200, max: 800 },
} as const;

export type Channel = keyof typeof CHANNEL_PROBABILITIES.delivery;
export type EventType = "sent" | "delivered" | "opened" | "clicked" | "converted" | "failed";
