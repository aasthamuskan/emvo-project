import OpenAI from "openai";

// ── AI Provider ─────────────────────────────────────────────
// Uses Groq (free, fast) when GROQ_API_KEY is set,
// otherwise falls back to OpenAI with OPENAI_API_KEY.
// Groq is OpenAI-SDK-compatible — only baseURL + model differ.
// Get a free Groq key at: https://console.groq.com
// ────────────────────────────────────────────────────────────

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      // Groq: free, no credit card, ~500 req/day free tier
      _client = new OpenAI({
        apiKey: groqKey,
        baseURL: "https://api.groq.com/openai/v1",
      });
    } else {
      // Fallback: standard OpenAI
      _client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }
  return _client;
}

// Groq model to use (free tier). Options:
//   "llama-3.1-8b-instant"   — fastest, great for structured JSON
//   "llama-3.3-70b-versatile" — most capable, still free
//   "gemma2-9b-it"           — Google Gemma, fast
const GROQ_MODEL = "llama-3.3-70b-versatile";
const OPENAI_MODEL = "gpt-4o-mini";

function getModel(): string {
  return process.env.GROQ_API_KEY ? GROQ_MODEL : OPENAI_MODEL;
}

export interface ParsedCampaignPlan {
  intent: string;
  filters: {
    totalSpendGte?: number;
    totalSpendLte?: number;
    daysSinceLastOrderGte?: number;
    daysSinceLastOrderLte?: number;
    minOrders?: number;
    maxOrders?: number;
    cities?: string[];
    tags?: string[];
  };
  suggestedChannel: "whatsapp" | "sms" | "email" | "rcs";
  campaignName: string;
  messageVariants: { id: string; body: string }[];
  aiReasoning: string;
}

const SYSTEM_PROMPT = `You are an AI assistant for EMVO, a CRM for consumer brands. 
Your job is to parse a marketer's natural language campaign request into a structured plan.

Extract:
1. Intent (e.g. win_back, upsell, loyalty_reward, new_arrivals, flash_sale)
2. Customer filters (spend, recency, order count, city, tags)
3. Best messaging channel for this intent
4. A compelling campaign name
5. Two message variants (personalized, with [NAME] placeholder)
6. Brief reasoning for your choices

Rules:
- Days since last order means: customer's most recent order was that many days ago or more
- Indian brand context: use ₹ for currency amounts, warm/personal tone
- WhatsApp is best for win-back and personalized offers
- SMS is best for flash sales and urgency
- Email is best for newsletters and loyalty
- RCS for rich media experiences
- Messages should be concise, warm, and include a clear CTA
- Include [NAME] as placeholder for personalization
- Max 300 chars per message variant

Respond ONLY with valid JSON matching this exact schema:
{
  "intent": string,
  "filters": {
    "totalSpendGte": number | null,
    "totalSpendLte": number | null,
    "daysSinceLastOrderGte": number | null,
    "daysSinceLastOrderLte": number | null,
    "minOrders": number | null,
    "maxOrders": number | null,
    "cities": string[] | null,
    "tags": string[] | null
  },
  "suggestedChannel": "whatsapp" | "sms" | "email" | "rcs",
  "campaignName": string,
  "messageVariants": [
    { "id": "A", "body": string },
    { "id": "B", "body": string }
  ],
  "aiReasoning": string
}`;

export async function parseCampaignIntent(
  query: string
): Promise<ParsedCampaignPlan> {
  const openai = getClient();
  const completion = await openai.chat.completions.create({
    model: getModel(),
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: query },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0].message.content;
  if (!raw) throw new Error("No response from OpenAI");

  const parsed = JSON.parse(raw);

  // Normalize nulls to undefined
  const filters = parsed.filters || {};
  return {
    intent: parsed.intent,
    filters: {
      totalSpendGte: filters.totalSpendGte ?? undefined,
      totalSpendLte: filters.totalSpendLte ?? undefined,
      daysSinceLastOrderGte: filters.daysSinceLastOrderGte ?? undefined,
      daysSinceLastOrderLte: filters.daysSinceLastOrderLte ?? undefined,
      minOrders: filters.minOrders ?? undefined,
      maxOrders: filters.maxOrders ?? undefined,
      cities: filters.cities ?? undefined,
      tags: filters.tags ?? undefined,
    },
    suggestedChannel: parsed.suggestedChannel,
    campaignName: parsed.campaignName,
    messageVariants: parsed.messageVariants,
    aiReasoning: parsed.aiReasoning,
  };
}

export async function generateCampaignInsight(params: {
  campaignName: string;
  channel: string;
  totalMessages: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}): Promise<string> {
  const openai = getClient();
  const prompt = `Generate a 2-sentence marketing insight for this campaign result:
Campaign: "${params.campaignName}" via ${params.channel.toUpperCase()}
Audience: ${params.totalMessages} recipients
Delivery Rate: ${(params.deliveryRate * 100).toFixed(1)}%
Open Rate: ${(params.openRate * 100).toFixed(1)}%
Click Rate: ${(params.clickRate * 100).toFixed(1)}%
Conversion Rate: ${(params.conversionRate * 100).toFixed(1)}%

Write 2 concise sentences: one highlighting the strongest metric, one actionable recommendation for the next campaign. Be specific, data-driven, and positive in tone.`;

  const completion = await openai.chat.completions.create({
    model: getModel(),
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 120,
  });

  return completion.choices[0].message.content?.trim() ?? "Campaign completed successfully.";
}
