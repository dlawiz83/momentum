import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Smile, Meh, Frown, Sparkles, Dumbbell, BookOpen, Briefcase, Code, Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from "date-fns";

const categories = [
  { label: "Learning", icon: BookOpen },
  { label: "Fitness", icon: Dumbbell },
  { label: "Work", icon: Briefcase },
  { label: "Coding", icon: Code },
  { label: "Personal", icon: Heart },
  { label: "Other", icon: Sparkles },
];

const moods = [
  { label: "Great", icon: Smile },
  { label: "Okay", icon: Meh },
  { label: "Tough", icon: Frown },
];

const DashboardPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [logText, setLogText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["daily-logs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addLog = useMutation({
    mutationFn: async (entry: { text: string; category: string; mood: string }) => {
      const { error } = await supabase.from("daily_logs").insert({
        user_id: user!.id,
        text: entry.text,
        category: entry.category,
        mood: entry.mood,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-logs"] });
      toast.success("Win logged! 🎉");
    },
    onError: () => toast.error("Failed to log entry"),
  });

  const deleteLog = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("daily_logs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["daily-logs"] }),
    onError: () => toast.error("Failed to delete"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logText.trim()) return;
    addLog.mutate({
      text: logText.trim(),
      category: selectedCategory || "Other",
      mood: selectedMood || "Okay",
    });
    setLogText("");
    setSelectedCategory(null);
    setSelectedMood(null);
  };

  const thisWeekLogs = logs.filter((log) => {
    const logDate = parseISO(log.created_at);
    return logDate >= weekStart && logDate <= weekEnd;
  });

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  const getTimeLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isSameDay(date, today)) return format(date, "h:mm a");
    return format(date, "MMM d");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pt-24 pb-16 px-4">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
              {format(today, "EEEE")}
            </p>
            <h1 className="text-3xl font-serif">{format(today, "MMMM d, yyyy")}</h1>
          </motion.div>

          {/* Quick log input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-6 mb-6 shadow-sm"
          >
            <form onSubmit={handleSubmit}>
              <div className="flex gap-3 mb-4">
                <Input
                  value={logText}
                  onChange={(e) => setLogText(e.target.value)}
                  placeholder="What did you accomplish today?"
                  className="flex-1 h-12 text-base bg-muted/50 border-0 focus-visible:ring-primary"
                />
                <Button type="submit" variant="brand" size="default" className="h-12 px-5" disabled={addLog.isPending}>
                  <Plus className="h-4 w-4 mr-1" /> Log
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setSelectedCategory(selectedCategory === cat.label ? null : cat.label)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedCategory === cat.label
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-brand-light hover:text-primary"
                    }`}
                  >
                    <cat.icon className="h-3 w-3" />
                    {cat.label}
                  </button>
                ))}
                <div className="w-px h-5 bg-border mx-1" />
                {moods.map((mood) => (
                  <button
                    key={mood.label}
                    type="button"
                    onClick={() => setSelectedMood(selectedMood === mood.label ? null : mood.label)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedMood === mood.label
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-brand-light hover:text-primary"
                    }`}
                  >
                    <mood.icon className="h-3 w-3" />
                    {mood.label}
                  </button>
                ))}
              </div>
            </form>
          </motion.div>

          {/* Weekly progress */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-6 mb-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">This week</h2>
              <span className="text-sm font-medium text-primary">{thisWeekLogs.length} entries</span>
            </div>
            <div className="flex items-end gap-3 justify-between">
              {weekDays.map((day, i) => {
                const dayLogs = thisWeekLogs.filter((l) => isSameDay(parseISO(l.created_at), day));
                const count = Math.min(dayLogs.length, 3);
                const isToday = isSameDay(day, today);
                return (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-full flex flex-col items-center gap-1">
                      {[...Array(3)].map((_, j) => (
                        <div
                          key={j}
                          className={`w-full h-3 rounded-sm transition-colors ${
                            j < count ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs ${isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>
                      {dayLabels[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Log entries */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
              Recent entries
            </h2>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse h-20" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-8 text-center shadow-sm">
                <p className="text-muted-foreground mb-1">No entries yet</p>
                <p className="text-sm text-muted-foreground">Log your first win above!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-card rounded-xl border border-border p-5 shadow-sm flex items-start gap-4 group"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium mb-1">{log.text}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="bg-brand-light text-primary px-2 py-0.5 rounded-full font-medium">
                            {log.category}
                          </span>
                          <span>{getTimeLabel(log.created_at)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteLog.mutate(log.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
