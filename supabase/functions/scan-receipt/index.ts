import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const createFallbackData = () => ({
  amount: 0,
  currency: "INR",
  description: "Scanned receipt",
  date: null as string | null,
  category: "other",
  items: [] as unknown[],
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Request received:", req.method);
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: true,
          data: createFallbackData(),
          warning: "Not signed in. Open Add Expense and fill details manually.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let imageBase64: string | undefined;
    try {
      const body = await req.json();
      imageBase64 = body?.imageBase64;
    } catch {
      return new Response(
        JSON.stringify({
          success: true,
          data: createFallbackData(),
          warning: "Invalid request body.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return new Response(
        JSON.stringify({
          success: true,
          data: createFallbackData(),
          warning: "No image provided.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const AI_API_KEY = Deno.env.get("AI_API_KEY") || Deno.env.get("LOVABLE_API_KEY");
    console.log("AI API Key presence:", !!AI_API_KEY);

    if (!AI_API_KEY) {
      return new Response(
        JSON.stringify({
          success: true,
          data: createFallbackData(),
          warning: "Receipt extraction is not configured. Edit amounts on the next screen.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
            content: `You are an expert receipt scanner. Extract the following information from receipt images:
- Total amount (number only, no currency symbol)
- Currency (INR, USD, EUR, etc.)
- Description/Store name
- Date (in YYYY-MM-DD format if visible)
- Category (food, transport, shopping, entertainment, utilities, rent, travel, health, other)
- Individual items with prices if visible

Respond ONLY with a valid JSON object in this exact format:
{
  "amount": 0,
  "currency": "INR",
  "description": "",
  "date": null,
  "category": "other",
  "items": []
}

If you cannot extract certain information, use null or reasonable defaults.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Please analyze this receipt and extract the expense details." },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:")
                    ? imageBase64
                    : `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status, await response.text());
      return new Response(
        JSON.stringify({
          success: true,
          data: createFallbackData(),
          warning: "Could not read receipt automatically. Fill in details on the next screen.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let extractedData;
    try {
      console.log("Parsing AI response content...");
      const jsonMatch = String(content || "").match(/\{[\s\S]*\}/);
      extractedData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch (e) {
      console.error("JSON parse error:", e);
      extractedData = createFallbackData();
    }

    console.log("Scan successful, returning data.");
    return new Response(JSON.stringify({ success: true, data: extractedData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in scan-receipt function:", error);
    return new Response(
      JSON.stringify({
        success: true,
        data: createFallbackData(),
        warning: "Scan failed. Fill in details on the next screen.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
