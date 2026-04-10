import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { expenses, totalSpent, categories, timeframe } = await req.json();
    const AI_API_KEY = Deno.env.get("AI_API_KEY") || Deno.env.get("LOVABLE_API_KEY");
    console.log("AI API Key presence:", !!AI_API_KEY);
    
    if (!AI_API_KEY) {
      throw new Error("AI_API_KEY is not configured");
    }

    console.log("Generating spending insights...");

    // Build context for AI
    const expensesSummary = expenses.map((e: any) => 
      `${e.description}: ₹${e.amount} (${e.category})`
    ).join('\n');

    const categoryBreakdown = Object.entries(categories)
      .map(([cat, amount]) => `${cat}: ₹${amount}`)
      .join(', ');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-1.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a friendly personal finance advisor for EquiPay, an expense splitting app. Analyze the user's spending patterns and provide:
1. A brief summary of their spending habits (2-3 sentences)
2. 3 specific, actionable tips to save money based on their actual expenses
3. Any unusual spending patterns you notice
4. A motivational message about their financial journey

Keep your response concise, friendly, and helpful. Use emojis sparingly. Format with clear sections.
Respond in JSON format:
{
  "summary": "...",
  "tips": ["tip1", "tip2", "tip3"],
  "insights": ["insight1", "insight2"],
  "motivation": "..."
}`
          },
          {
            role: "user",
            content: `Here's my spending data for the ${timeframe}:

Total spent: ₹${totalSpent}

Category breakdown: ${categoryBreakdown}

Recent expenses:
${expensesSummary}

Please analyze my spending and give me personalized advice.`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log("AI response:", content);

    // Parse the JSON response
    let insights;
    try {
      console.log("Parsing AI response content...");
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        insights = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      insights = {
        summary: "I analyzed your spending patterns.",
        tips: ["Track your daily expenses", "Set a monthly budget", "Look for subscription savings"],
        insights: ["Your spending is distributed across multiple categories"],
        motivation: "Every small step counts towards financial freedom! 💪"
      };
    }

    return new Response(JSON.stringify({ success: true, data: insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in spending-insights function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
