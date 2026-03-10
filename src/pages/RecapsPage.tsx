import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Calendar,
  Award,
  TrendingUp,
  RefreshCw,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";
import { format, startOfWeek, endOfWeek, parseISO, getDay } from "date-fns";
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

const isSunday = () => new Date().getDay() === 0;

const getNextSunday = () => {
  const d = new Date();
  const daysUntilSunday = 7 - d.getDay();
  d.setDate(d.getDate() + daysUntilSunday);
  return format(d, "MMMM d");
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

const RecapsPage = () => {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();
  const [showVideo, setShowVideo] = useState(false);

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: recap, isLoading } = useQuery({
    queryKey: ["latest-recap", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_recaps")
        .select("*")
        .order("week_start", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: weekLogs = [] } = useQuery({
    queryKey: ["week-logs-recap", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .gte("created_at", weekStart.toISOString())
        .lte("created_at", weekEnd.toISOString())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const generateRecap = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "generate-recap",
        {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        },
      );
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.message === "No logs this week") {
        toast.info("No logs this week to generate a recap");
      } else {
        toast.success("Recap generated! 🎬");
        setShowVideo(false);
        queryClient.invalidateQueries({ queryKey: ["latest-recap"] });
        queryClient.invalidateQueries({ queryKey: ["recaps-history"] });
      }
    },
    onError: (error: any) =>
      toast.error(error?.message || JSON.stringify(error)),
  });

  const displayWeekStart = recap
    ? format(parseISO(recap.week_start), "MMMM d")
    : format(weekStart, "MMMM d");
  const displayWeekEnd = recap
    ? format(parseISO(recap.week_end), "MMMM d")
    : format(weekEnd, "MMMM d");

  const userName = profile?.display_name?.split(" ")[0] || "You";
  const topCategory = recap?.top_category ?? "General";
  const { reflection, shortReflection, highlights } = parseSummary(
    recap?.summary_text ?? null,
  );

  const videoData = recap
    ? {
        userName,
        weekStart: format(parseISO(recap.week_start), "MMMM d"),
        weekEnd: format(parseISO(recap.week_end), "MMMM d, yyyy"),
        daysActive: recap.days_active ?? 0,
        totalEntries: recap.total_entries ?? 0,
        topCategory,
        summaryText: shortReflection || reflection,
        entries:
          highlights.length > 0
            ? highlights
            : weekLogs.slice(0, 5).map((l) => l.text),
        focusAreas: getFocusAreas(weekLogs, topCategory),
        mostActiveDay: getMostActiveDay(weekLogs),
      }
    : null;

  const recapAlreadyExists = !!recap;

  const renderButton = () => {
    if (recapAlreadyExists) {
      return (
        <div className="flex items-center gap-2 text-sm text-primary font-medium">
          <Award className="h-4 w-4" />
          Recap generated ✓
        </div>
      );
    }
    if (isSunday()) {
      return (
        <Button
          variant="brand"
          size="sm"
          onClick={() => generateRecap.mutate()}
          disabled={generateRecap.isPending}
        >
          <RefreshCw
            className={`h-4 w-4 mr-1 ${generateRecap.isPending ? "animate-spin" : ""}`}
          />
          Generate recap
        </Button>
      );
    }
    return (
      <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
         Available Sunday, {getNextSunday()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pt-24 pb-16 px-4">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-serif">Weekly Recap</h1>
              {renderButton()}
            </div>
            <p className="text-muted-foreground mb-8">
              {displayWeekStart} – {displayWeekEnd}, {today.getFullYear()}
            </p>
          </motion.div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl border border-border p-6 animate-pulse h-24"
                />
              ))}
            </div>
          ) : !recap ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-12 text-center shadow-sm"
            >
              <Play className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-xl font-serif mb-2">No recap yet</h2>
              <p className="text-muted-foreground mb-6">
                {isSunday()
                  ? "Log some daily wins, then generate your weekly recap"
                  : "Keep logging your wins all week — your recap will be ready on Sunday"}
              </p>
              {isSunday() ? (
                <Button
                  variant="brand"
                  onClick={() => generateRecap.mutate()}
                  disabled={generateRecap.isPending}
                >
                  Generate my first recap
                </Button>
              ) : (
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted px-5 py-3 rounded-lg">
                  Come back Sunday, {getNextSunday()}
                </div>
              )}
            </motion.div>
          ) : (
            <>
              {/* Video section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                {showVideo && videoData ? (
                  <RecapVideoPlayer data={videoData} />
                ) : (
                  <div className="relative bg-foreground/5 rounded-2xl aspect-video overflow-hidden border border-border flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Play className="h-8 w-8 text-primary ml-1" />
                      </div>
                      <p className="text-lg font-serif text-foreground/70 mb-2">
                        Your weekly recap video is ready
                      </p>
                      <p className="text-sm text-muted-foreground mb-6">
                        A cinematic summary of your week
                      </p>
                      <Button
                        variant="brand"
                        onClick={() => setShowVideo(true)}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Watch your recap
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-3 gap-4 mb-8"
              >
                {[
                  {
                    icon: Calendar,
                    label: "Days active",
                    value: `${recap.days_active}/7`,
                  },
                  {
                    icon: Award,
                    label: "Total entries",
                    value: String(recap.total_entries),
                  },
                  {
                    icon: TrendingUp,
                    label: "Top focus",
                    value: recap.top_category || "—",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-card rounded-xl border border-border p-5 text-center shadow-sm"
                  >
                    <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-serif mb-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </motion.div>

              {/* AI Highlights */}
              {highlights.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-card rounded-xl p-6 mb-8 border border-border shadow-sm"
                >
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                    Key Moments
                  </h2>
                  <div className="space-y-2">
                    {highlights.map((h: string, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        <p className="text-sm text-foreground/80">{h}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Reflection */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-brand-light rounded-xl p-8 mb-8 border border-brand-muted"
              >
                <h2 className="text-sm font-medium text-primary uppercase tracking-wide mb-3">
                  Reflection
                </h2>
                <p className="text-base leading-relaxed text-foreground/80 font-serif italic">
                  "{reflection}"
                </p>
              </motion.div>

              {/* Week's entries */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                  This week's entries
                </h2>
                {weekLogs.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No entries this week
                  </p>
                ) : (
                  <div className="space-y-3">
                    {weekLogs.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 bg-card rounded-lg border border-border p-4 shadow-sm"
                      >
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <p className="text-sm flex-1">{entry.text}</p>
                        <span className="text-xs text-muted-foreground bg-brand-light px-2 py-0.5 rounded-full">
                          {entry.category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default RecapsPage;
