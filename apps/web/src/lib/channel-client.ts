import axios from "axios";

const CHANNEL_SERVICE_URL =
  process.env.CHANNEL_SERVICE_URL || "http://localhost:3001";

export interface OutboundMessage {
  message_id: string;
  customer_phone: string;
  channel: string;
  body: string;
  callback_url: string;
}

export interface SendBatchResponse {
  accepted: number;
  queued: boolean;
  message: string;
}

/**
 * Send a batch of messages to the Channel Service.
 * The channel service accepts immediately and fires callbacks async.
 */
export async function sendMessageBatch(
  messages: OutboundMessage[]
): Promise<SendBatchResponse> {
  const response = await axios.post<SendBatchResponse>(
    `${CHANNEL_SERVICE_URL}/send`,
    { messages },
    {
      timeout: 30000,
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
}
