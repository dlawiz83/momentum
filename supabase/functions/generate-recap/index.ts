import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function generateAIContent(
  logs: any[],
  daysActive: number,
  topCategory: string,
  weekStart: string,
  weekEnd: string,
): Promise<{
  reflection: string;
  shortReflection: string;
  highlights: string[];
}> {
  const logTexts = logs
    .map((l, i) => `${i + 1}. [${l.category || "Other"}] ${l.text}`)
    .join("\n");

  const prompt = `You are a warm personal growth coach. Analyze these weekly achievement logs and return a JSON response only.

Week: ${weekStart} to ${weekEnd}
Days active: ${daysActive}/7
Top focus: ${topCategory}
Logs:
${logTexts}

Return ONLY valid JSON with this exact structure:
{
  "reflection": "A warm, personal 3-sentence motivational reflection. Reference their actual activities. Be encouraging and specific. Second person.",
  "shortReflection": "One powerful, poetic sentence (max 20 words) that captures the essence of their week. No clichés.",
  "highlights": ["3 to 5 short highlight phrases (max 8 words each) that capture the most meaningful moments from their logs. Extract the essence, not the raw text."]
}`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.75,
        response_format: { type: "json_object" },
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);

  return {
    reflection: content.reflection || "",
    shortReflection: content.shortReflection || "",
    highlights: Array.isArray(content.highlights)
      ? content.highlights.slice(0, 5)
      : [],
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate week range (Monday to Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekStartStr = weekStart.toISOString().split("T")[0];
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    // Check if recap already exists
    const { data: existing } = await supabase
      .from("weekly_recaps")
      .select("id")
      .eq("user_id", user.id)
      .eq("week_start", weekStartStr)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ message: "Recap already exists", id: existing.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch this week's logs
    const { data: logs, error: logsError } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", weekStart.toISOString())
      .lte("created_at", weekEnd.toISOString())
      .order("created_at", { ascending: true });

    if (logsError) throw logsError;

    if (!logs || logs.length === 0) {
      return new Response(JSON.stringify({ message: "No logs this week" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate stats
    const uniqueDays = new Set(
      logs.map((l: any) => new Date(l.created_at).toISOString().split("T")[0]),
    ).size;

    const categoryCounts: Record<string, number> = {};
    logs.forEach((l: any) => {
      const cat = l.category || "Other";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const topCategory = Object.entries(categoryCounts).sort(
      (a, b) => b[1] - a[1],
    )[0][0];

    // Generate AI content
    const { reflection, shortReflection, highlights } = await generateAIContent(
      logs,
      uniqueDays,
      topCategory,
      weekStartStr,
      weekEndStr,
    );

    // Store highlights and shortReflection in summary_text as JSON
    // Full reflection goes in summary_text, extras in a structured format
    const summaryData = JSON.stringify({
      reflection,
      shortReflection,
      highlights,
    });

    // Insert recap
    const { data: recap, error: insertError } = await supabase
      .from("weekly_recaps")
      .insert({
        user_id: user.id,
        week_start: weekStartStr,
        week_end: weekEndStr,
        summary_text: summaryData,
        total_entries: logs.length,
        days_active: uniqueDays,
        top_category: topCategory,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ recap }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
