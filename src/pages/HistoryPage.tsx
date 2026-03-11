import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  ChevronRight,
  Laugh,
  Smile,
  Meh,
  Frown,
  Angry,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppHeader from "@/components/AppHeader";
import { format, parseISO, isToday, isYesterday } from "date-fns";

const moodIcon = (mood: string) => {
  const cls = "h-4 w-4 flex-shrink-0 mt-0.5";
  switch (mood) {
    case "Great":
      return <Laugh className={`${cls} text-yellow-500`} />;
    case "Okay":
      return <Meh className={`${cls} text-blue-400`} />;
    case "Tough":
      return <Frown className={`${cls} text-orange-400`} />;
    default:
      return <Meh className={`${cls} text-blue-400`} />;
  }
};

const categoryColor: Record<string, string> = {
  Learning: "bg-blue-100 text-blue-700",
  Health: "bg-green-100 text-green-700",
  Career: "bg-purple-100 text-purple-700",
  Fitness: "bg-orange-100 text-orange-700",
  Reading: "bg-yellow-100 text-yellow-700",
  Work: "bg-indigo-100 text-indigo-700",
  Personal: "bg-pink-100 text-pink-700",
  Coding: "bg-cyan-100 text-cyan-700",
  Other: "bg-rose-100 text-rose-600",
};

const parseSummary = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return { reflection: text };
  }
};

const formatDayLabel = (dateStr: string) => {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMM d");
};

const HistoryPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"recaps" | "logs">("recaps");

  const { data: recaps = [], isLoading: recapsLoading } = useQuery({
    queryKey: ["recaps-history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_recaps")
        .select("*")
        .order("week_start", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["logs-history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && activeTab === "logs",
  });

  const groupedLogs = logs.reduce((acc: Record<string, typeof logs>, log) => {
    const day = log.created_at.split("T")[0];
    if (!acc[day]) acc[day] = [];
    acc[day].push(log);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pt-24 pb-16 px-4">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-serif mb-2">History</h1>
            <p className="text-muted-foreground mb-6">
              Your journey, one win at a time
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted/50 rounded-xl p-1 mb-8 w-fit">
            {(["recaps", "logs"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  activeTab === tab
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "recaps" ? "Weekly Recaps" : "Daily Logs"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* RECAPS TAB */}
            {activeTab === "recaps" && (
              <motion.div
                key="recaps"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {recapsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-card rounded-xl border border-border p-6 animate-pulse h-24"
                      />
                    ))}
                  </div>
                ) : recaps.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-12 text-center shadow-sm">
                    <p className="text-muted-foreground mb-2">No recaps yet</p>
                    <p className="text-sm text-muted-foreground">
                      Generate your first recap from the{" "}
                      <Link
                        to="/recaps"
                        className="text-primary hover:underline"
                      >
                        Recaps page
                      </Link>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recaps.map((recap, i) => {
                      const summary = parseSummary(recap.summary_text || "");
                      return (
                        <motion.div
                          key={recap.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                        >
                          <Link
                            to="/recaps"
                            className="group bg-card rounded-xl border border-border p-6 shadow-sm flex items-center gap-5 hover:border-primary/30 hover:shadow-md transition-all block"
                          >
                            <div className="w-14 h-14 rounded-xl bg-brand-light flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                              <Play className="h-5 w-5 text-primary ml-0.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-serif text-lg mb-1">
                                {format(parseISO(recap.week_start), "MMM d")} –{" "}
                                {format(
                                  parseISO(recap.week_end),
                                  "MMM d, yyyy",
                                )}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {summary.reflection ||
                                  summary.shortReflection ||
                                  "No summary available"}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span>{recap.total_entries} entries</span>
                                <span>·</span>
                                <span>{recap.days_active} days active</span>
                                {recap.top_category && (
                                  <>
                                    <span>·</span>
                                    <span>{recap.top_category}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* LOGS TAB */}
            {activeTab === "logs" && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {logsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-card rounded-xl border border-border p-6 animate-pulse h-20"
                      />
                    ))}
                  </div>
                ) : logs.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-12 text-center shadow-sm">
                    <p className="text-muted-foreground mb-2">No logs yet</p>
                    <p className="text-sm text-muted-foreground">
                      Start logging from the{" "}
                      <Link
                        to="/dashboard"
                        className="text-primary hover:underline"
                      >
                        Dashboard
                      </Link>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(groupedLogs).map(([day, dayLogs], i) => (
                      <motion.div
                        key={day}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-semibold text-foreground">
                            {formatDayLabel(day)}
                          </span>
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-xs text-muted-foreground">
                            {dayLogs.length}{" "}
                            {dayLogs.length === 1 ? "win" : "wins"}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {dayLogs.map((log) => (
                            <div
                              key={log.id}
                              className="bg-card rounded-xl border border-border px-5 py-4 flex items-start gap-4 shadow-sm"
                            >
                              {moodIcon(log.mood)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground leading-relaxed">
                                  {log.text}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor[log.category] || categoryColor["Other"]}`}
                                  >
                                    {log.category || "Other"}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(parseISO(log.created_at), "h:mm a")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;
