import { NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Rate limit: 10 requests per hour per IP
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, "1h"),
    })
  : null;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    
    // 1. Rate Limiting
    if (ratelimit) {
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Please try again in an hour." },
          { 
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            }
          }
        );
      }
    }

    const { trade, item_name, story } = await req.json();

    // Input Validation
    if (!trade || !item_name || !story) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. AI Generation or Mock
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      console.warn("DEEPSEEK_API_KEY missing, returning mock response");
      // High-fidelity mock based on trade
      const mockStatement = `This ${item_name} will help me double my daily ${trade} output and allow me to train my first apprentice by December.`;
      
      return NextResponse.json({
        statement: mockStatement,
        source: "ai_generated",
        is_mock: true
      });
    }

    // Real DeepSeek API Call
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are BuildBridge AI, helping Nigerian tradespeople articulate their business impact to backers. Generate a 1-sentence, high-integrity impact statement in the first person. Tone: professional, specific, and dignified. Max 200 characters."
          },
          {
            role: "user",
            content: `Trade: ${trade}\nItem: ${item_name}\nStory: ${story}\nGenerate the impact statement.`
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "DeepSeek API failed");
    }

    const data = await response.json();
    const statement = data.choices[0].message.content.trim().replace(/^"(.*)"$/, '$1');

    return NextResponse.json({
      statement: statement.slice(0, 200),
      source: "ai_generated"
    });

  } catch (error: any) {
    console.error("Impact generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate impact statement. Please try writing one manually." },
      { status: 500 }
    );
  }
}
