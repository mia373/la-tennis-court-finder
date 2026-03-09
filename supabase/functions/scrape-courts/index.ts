import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CourtSource {
  id: string;
  name: string;
  source_url: string;
  booking_url: string;
}

async function scrapeCourtPage(
  sourceUrl: string,
  firecrawlKey: string
): Promise<{ status: "available" | "limited" | "full" | "unknown"; available: number | null; total: number | null; nextAvailableTime: string | null; raw: string }> {
  try {
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: sourceUrl,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 2000,
      }),
    });

    if (!response.ok) {
      console.warn(`Firecrawl returned ${response.status} for ${sourceUrl}`);
      return { status: "unknown", available: null, total: null, nextAvailableTime: null, raw: "" };
    }

    const data = await response.json();
    const markdown: string = data?.data?.markdown ?? data?.markdown ?? "";

    return parseAvailabilityFromMarkdown(markdown);
  } catch (err) {
    console.error("Firecrawl error:", err);
    return { status: "unknown", available: null, total: null, nextAvailableTime: null, raw: "" };
  }
}

function parseAvailabilityFromMarkdown(
  text: string
): { status: "available" | "limited" | "full" | "unknown"; available: number | null; total: number | null; nextAvailableTime: string | null; raw: string } {
  const lower = text.toLowerCase();

  // Look for "X courts available" or "X of Y courts"
  const courtsMatch = lower.match(/(\d+)\s+(?:of\s+(\d+)\s+)?court[s]?\s+available/i);
  const availMatch = lower.match(/(\d+)\s+available\s+court/i);
  const noCourtMatch =
    lower.includes("no courts available") ||
    lower.includes("fully booked") ||
    lower.includes("0 available");
  
  let available: number | null = null;
  let total: number | null = null;
  let status: "available" | "limited" | "full" | "unknown" = "unknown";

  if (courtsMatch) {
    available = parseInt(courtsMatch[1]);
    if (courtsMatch[2]) total = parseInt(courtsMatch[2]);
  } else if (availMatch) {
    available = parseInt(availMatch[1]);
  }

  if (noCourtMatch) {
    status = "full";
    available = 0;
  } else if (available !== null) {
    if (available === 0) {
      status = "full";
    } else if (total !== null && available / total < 0.3) {
      status = "limited";
    } else {
      status = "available";
    }
  } else if (lower.includes("available") && !lower.includes("not available")) {
    status = "available";
  } else if (lower.includes("full") || lower.includes("no availability")) {
    status = "full";
  }

  // Parse next available time from common patterns
  let nextAvailableTime: string | null = null;
  
  // Match patterns like "next available: 2:00 PM", "available at 3:30 pm", "next slot: 10:00 AM"
  const timePatterns = [
    /next\s+(?:available|slot|opening)[:\s]+(\d{1,2}:\d{2}\s*[ap]m)/i,
    /available\s+(?:at|from)\s+(\d{1,2}:\d{2}\s*[ap]m)/i,
    /(\d{1,2}:\d{2}\s*[ap]m)\s+(?:available|open)/i,
    /book\s+(?:at|for)\s+(\d{1,2}:\d{2}\s*[ap]m)/i,
  ];
  
  for (const pattern of timePatterns) {
    const match = text.match(pattern);
    if (match) {
      nextAvailableTime = match[1].trim().toUpperCase();
      break;
    }
  }

  // If no specific time found, look for time slots in general (first time that appears in an "available" context)
  if (!nextAvailableTime) {
    const timeSlotMatch = text.match(/(\d{1,2}:\d{2}\s*[ap]m)/i);
    if (timeSlotMatch && (lower.includes("available") || lower.includes("open") || lower.includes("book"))) {
      nextAvailableTime = timeSlotMatch[1].trim().toUpperCase();
    }
  }

  return { status, available, total, nextAvailableTime, raw: text.slice(0, 500) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: courts, error: fetchError } = await supabase
    .from("court_sources")
    .select("id, name, source_url, booking_url")
    .eq("is_active", true);

  if (fetchError || !courts) {
    console.error("Failed to fetch courts:", fetchError);
    return new Response(
      JSON.stringify({ error: "Failed to fetch court sources" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const results: Array<{ name: string; status: string; error?: string }> = [];

  for (const court of courts as CourtSource[]) {
    try {
      let result;
      if (firecrawlKey) {
        result = await scrapeCourtPage(court.source_url, firecrawlKey);
      } else {
        result = { status: "unknown" as const, available: null, total: null, nextAvailableTime: null, raw: "" };
      }

      const { error: insertError } = await supabase
        .from("court_availability_snapshots")
        .insert({
          court_source_id: court.id,
          status: result.status,
          available_courts: result.available,
          total_courts: result.total,
          details: {
            raw_preview: result.raw,
            next_available_time: result.nextAvailableTime,
          },
          observed_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error(`Insert error for ${court.name}:`, insertError);
        results.push({ name: court.name, status: result.status, error: insertError.message });
      } else {
        results.push({ name: court.name, status: result.status });
      }
    } catch (err) {
      console.error(`Error processing ${court.name}:`, err);
      results.push({ name: court.name, status: "error", error: String(err) });
    }
  }

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
