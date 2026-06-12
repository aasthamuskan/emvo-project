import axios from "axios";
import {
  CHANNEL_PROBABILITIES,
  LIFECYCLE_DELAYS,
  Channel,
  EventType,
} from "./probabilities";

interface MessagePayload {
  message_id: string;
  customer_phone: string;
  channel: Channel;
  body: string;
  callback_url: string;
}

interface CallbackPayload {
  message_id: string;
  event: EventType;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollDice(probability: number): boolean {
  return Math.random() < probability;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fireCallback(
  callbackUrl: string,
  payload: CallbackPayload,
  attempt = 1
): Promise<void> {
  try {
    await axios.post(callbackUrl, payload, {
      timeout: 10000,
      headers: { "Content-Type": "application/json", "X-Source": "emvo-channel-service" },
    });
    console.log(`[Callback] ✓ ${payload.event} → ${payload.message_id} (attempt ${attempt})`);
  } catch (err) {
    const maxRetries = 3;
    if (attempt < maxRetries) {
      const backoff = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.warn(`[Callback] ✗ ${payload.event} → ${payload.message_id} — retrying in ${backoff}ms (attempt ${attempt}/${maxRetries})`);
      await delay(backoff);
      await fireCallback(callbackUrl, payload, attempt + 1);
    } else {
      console.error(`[Callback] ✗ ${payload.event} → ${payload.message_id} — DEAD LETTER after ${maxRetries} attempts`);
    }
  }
}

export async function simulateMessageLifecycle(msg: MessagePayload): Promise<void> {
  const ch = msg.channel as Channel;
  const probs = CHANNEL_PROBABILITIES;

  // Step 1: SENT (always)
  await delay(rand(LIFECYCLE_DELAYS.sent.min, LIFECYCLE_DELAYS.sent.max));
  await fireCallback(msg.callback_url, {
    message_id: msg.message_id,
    event: "sent",
    timestamp: new Date().toISOString(),
  });

  // Step 2: DELIVERED or FAILED
  const isDelivered = rollDice(probs.delivery[ch]);
  if (!isDelivered) {
    await delay(rand(LIFECYCLE_DELAYS.failed.min, LIFECYCLE_DELAYS.failed.max));
    await fireCallback(msg.callback_url, {
      message_id: msg.message_id,
      event: "failed",
      timestamp: new Date().toISOString(),
      metadata: { reason: "carrier_error" },
    });
    return;
  }

  await delay(rand(LIFECYCLE_DELAYS.delivered.min, LIFECYCLE_DELAYS.delivered.max));
  await fireCallback(msg.callback_url, {
    message_id: msg.message_id,
    event: "delivered",
    timestamp: new Date().toISOString(),
  });

  // Step 3: OPENED?
  if (!rollDice(probs.open[ch])) return;

  await delay(rand(LIFECYCLE_DELAYS.opened.min, LIFECYCLE_DELAYS.opened.max));
  await fireCallback(msg.callback_url, {
    message_id: msg.message_id,
    event: "opened",
    timestamp: new Date().toISOString(),
  });

  // Step 4: CLICKED?
  if (!rollDice(probs.click[ch])) return;

  await delay(rand(LIFECYCLE_DELAYS.clicked.min, LIFECYCLE_DELAYS.clicked.max));
  await fireCallback(msg.callback_url, {
    message_id: msg.message_id,
    event: "clicked",
    timestamp: new Date().toISOString(),
    metadata: { url: "https://shop.brand.com/offer" },
  });

  // Step 5: CONVERTED?
  if (!rollDice(probs.convert[ch])) return;

  await delay(rand(LIFECYCLE_DELAYS.converted.min, LIFECYCLE_DELAYS.converted.max));
  await fireCallback(msg.callback_url, {
    message_id: msg.message_id,
    event: "converted",
    timestamp: new Date().toISOString(),
    metadata: { order_value: rand(500, 5000) },
  });
}
