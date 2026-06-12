import { Router, Request, Response } from "express";
import { simulateMessageLifecycle } from "../simulator/lifecycle";

export const sendRouter = Router();

interface MessageInput {
  message_id: string;
  customer_phone: string;
  channel: string;
  body: string;
  callback_url: string;
}

interface SendRequestBody {
  messages: MessageInput[];
}

sendRouter.post("/", async (req: Request<{}, {}, SendRequestBody>, res: Response) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  // Validate each message has required fields
  const required = ["message_id", "channel", "body", "callback_url"];
  for (const msg of messages) {
    for (const field of required) {
      if (!msg[field as keyof MessageInput]) {
        res.status(400).json({ error: `Missing field: ${field}` });
        return;
      }
    }
  }

  // Respond immediately — we process async
  res.json({
    accepted: messages.length,
    queued: true,
    message: "Messages accepted for simulation",
  });

  // Fire-and-forget: simulate each message lifecycle independently
  // Use staggered start to simulate realistic batch processing
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const staggerDelay = Math.floor(i / 10) * 200; // stagger by 200ms per batch of 10

    setTimeout(() => {
      simulateMessageLifecycle({
        message_id: msg.message_id,
        customer_phone: msg.customer_phone || "",
        channel: msg.channel as any,
        body: msg.body,
        callback_url: msg.callback_url,
      }).catch((err) => {
        console.error(`[Send] Lifecycle error for ${msg.message_id}:`, err);
      });
    }, staggerDelay);
  }

  console.log(`[Send] Accepted ${messages.length} messages for simulation`);
});
