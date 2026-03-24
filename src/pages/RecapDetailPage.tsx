import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Calendar, Award, TrendingUp, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, getDay } from "date-fns";
import AppHeader from "@/components/AppHeader";
import { RecapVideoPlayer } from "@/components/recap-video/RecapVideoPlayer";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const getMostActiveDay = (logs: any[]): string => {
  if (!logs.length) return "N/A";
  const counts: Record<string, number> = {};
  logs.forEach((l) => {
    const day = DAYS[getDay(new Date(l.created_at))];
    counts[day] = (counts[day] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
};

const getFocusAreas = (logs: any[], topCategory: string): string[] => {
  const allCategories = [...new Set(logs.map((l) => l.category || "Other"))];
  const others = allCategories.filter((c) => c !== topCategory);
  const areas: string[] = [];
  if (others.length > 0)
    areas.push(`Invest more time in ${others[0].toLowerCase()}`);
  areas.push("Rest and recovery between active days");
  areas.push(`Keep building on your ${topCategory.toLowerCase()} momentum`);
  return areas;
};

const parseSummary = (summaryText: string | null) => {
  if (!summaryText)
    return { reflection: "", shortReflection: "", highlights: [] };
  try {
    const parsed = JSON.parse(summaryText);
    return {
      reflection: parsed.reflection || summaryText,
      shortReflection: parsed.shortReflection || "",
      highlights: parsed.highlights || [],
    };
  } catch {
    return { reflection: summaryText, shortReflection: "", highlights: [] };
  }
};

const RecapDetailPage = () => {
  const { id } = useParams();
  const [showVideo, setShowVideo] = useState(false);

  const { data: recap, isLoading } = useQuery({
    queryKey: ["recap-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_recaps")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: weekLogs = [] } = useQuery({
    queryKey: ["recap-logs", recap?.week_start],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .gte("created_at", recap.week_start)
        .lte("created_at", recap.week_end)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!recap,
  });

  if (isLoading)
    return <div className="p-10 text-center">Loading recap...</div>;
  if (!recap) return <div className="p-10 text-center">Recap not found</div>;

  const { reflection, shortReflection, highlights } = parseSummary(
    recap.summary_text ?? null,
  );

  const videoData = {
    userName: "You",
    weekStart: format(parseISO(recap.week_start), "MMMM d"),
    weekEnd: format(parseISO(recap.week_end), "MMMM d, yyyy"),
    daysActive: recap.days_active ?? 0,
    totalEntries: recap.total_entries ?? 0,
    topCategory: recap.top_category ?? "General",
    summaryText: shortReflection || reflection,
    entries:
      highlights.length > 0
        ? highlights
        : weekLogs.slice(0, 5).map((l) => l.text),
    focusAreas: getFocusAreas(weekLogs, recap.top_category || "General"),
    mostActiveDay: getMostActiveDay(weekLogs),
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="pt-24 pb-16 px-4">
        <div className="container max-w-3xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-3xl font-serif mb-2">Weekly Recap</h1>
            <p className="text-muted-foreground mb-8">
              {format(parseISO(recap.week_start), "MMMM d")} –{" "}
              {format(parseISO(recap.week_end), "MMMM d, yyyy")}
            </p>
          </motion.div>

          {/* Video */}
          <motion.div className="mb-8">
            {showVideo ? (
              <RecapVideoPlayer data={videoData} />
            ) : (
              <div className="bg-foreground/5 rounded-2xl aspect-video flex items-center justify-center border border-border">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Play className="h-8 w-8 text-primary ml-1" />
                  </div>
                  <p className="text-lg mb-4">
                    Your weekly recap video is ready
                  </p>
                  <button
                    onClick={() => setShowVideo(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg"
                  >
                    <Video className="inline mr-2 h-4 w-4" />
                    Watch recap
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-card p-5 rounded-xl text-center border">
              <Calendar className="mx-auto mb-2" />
              <p className="text-xl">{recap.days_active}/7</p>
              <p className="text-xs text-muted-foreground">Days active</p>
            </div>

            <div className="bg-card p-5 rounded-xl text-center border">
              <Award className="mx-auto mb-2" />
              <p className="text-xl">{recap.total_entries}</p>
              <p className="text-xs text-muted-foreground">Entries</p>
            </div>

            <div className="bg-card p-5 rounded-xl text-center border">
              <TrendingUp className="mx-auto mb-2" />
              <p className="text-xl">{recap.top_category || "—"}</p>
              <p className="text-xs text-muted-foreground">Top focus</p>
            </div>
          </div>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="bg-card p-6 rounded-xl border mb-8">
              <h2 className="mb-4 text-sm text-muted-foreground uppercase">
                Key Moments
              </h2>
              {highlights.map((h: string, i: number) => (
                <p key={i} className="text-sm mb-2">
                  • {h}
                </p>
              ))}
            </div>
          )}

          {/* Reflection */}
          <div className="bg-muted p-6 rounded-xl mb-8">
            <h2 className="mb-3 text-sm uppercase text-muted-foreground">
              Reflection
            </h2>
            <p className="italic">"{reflection}"</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecapDetailPage;
