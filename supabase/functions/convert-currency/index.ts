import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Popular currencies with their symbols
const CURRENCIES = {
  INR: { symbol: '₹', name: 'Indian Rupee' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham' },
  THB: { symbol: '฿', name: 'Thai Baht' },
};

// Fallback rates if API fails (approximate rates as of 2024)
const FALLBACK_RATES: Record<string, number> = {
  'USD_INR': 83.5,
  'EUR_INR': 90.5,
  'GBP_INR': 105.0,
  'JPY_INR': 0.56,
  'AUD_INR': 54.0,
  'CAD_INR': 61.0,
  'SGD_INR': 62.0,
  'AED_INR': 22.7,
  'THB_INR': 2.35,
  'INR_USD': 0.012,
  'INR_EUR': 0.011,
  'INR_GBP': 0.0095,
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

    const { from, to, amount } = await req.json();
    
    if (!from || !to) {
      throw new Error("Missing required parameters: from, to");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check cached rate first
    const { data: cachedRate } = await supabase
      .from("currency_rates")
      .select("rate, updated_at")
      .eq("base_currency", from)
      .eq("target_currency", to)
      .single();

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    if (cachedRate && new Date(cachedRate.updated_at) > oneHourAgo) {
      console.log("Using cached rate:", cachedRate.rate);
      const convertedAmount = amount ? amount * cachedRate.rate : null;
      
      return new Response(JSON.stringify({
        success: true,
        data: {
          from,
          to,
          rate: cachedRate.rate,
          amount: amount || null,
          convertedAmount,
          currencies: CURRENCIES
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to fetch fresh rates from a free API
    let rate: number;
    try {
      // Using exchangerate-api.com free tier (or similar)
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${from}`
      );
      
      if (response.ok) {
        const data = await response.json();
        rate = data.rates[to];
        
        // Cache the rate
        await supabase
          .from("currency_rates")
          .upsert({
            base_currency: from,
            target_currency: to,
            rate,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'base_currency,target_currency'
          });
      } else {
        throw new Error("Exchange rate API unavailable");
      }
    } catch (apiError) {
      console.log("Using fallback rate");
      // Use fallback rate
      const key = `${from}_${to}`;
      const reverseKey = `${to}_${from}`;
      
      if (FALLBACK_RATES[key]) {
        rate = FALLBACK_RATES[key];
      } else if (FALLBACK_RATES[reverseKey]) {
        rate = 1 / FALLBACK_RATES[reverseKey];
      } else if (from === to) {
        rate = 1;
      } else {
        // Try to convert through INR
        const fromToINR = FALLBACK_RATES[`${from}_INR`] || (1 / FALLBACK_RATES[`INR_${from}`]) || 1;
        const INRToTo = FALLBACK_RATES[`INR_${to}`] || (1 / FALLBACK_RATES[`${to}_INR`]) || 1;
        rate = fromToINR * INRToTo;
      }
    }

    const convertedAmount = amount ? amount * rate : null;

    return new Response(JSON.stringify({
      success: true,
      data: {
        from,
        to,
        rate,
        amount: amount || null,
        convertedAmount,
        currencies: CURRENCIES
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in convert-currency function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
