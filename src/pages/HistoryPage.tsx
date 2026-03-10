import { motion } from "framer-motion";
import { Play, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppHeader from "@/components/AppHeader";
import { format, parseISO } from "date-fns";

const HistoryPage = () => {
  const { user } = useAuth();

  const { data: recaps = [], isLoading } = useQuery({
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

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pt-24 pb-16 px-4">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-serif mb-2">History</h1>
            <p className="text-muted-foreground mb-8">All your weekly recaps in one place</p>
          </motion.div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse h-24" />
              ))}
            </div>
          ) : recaps.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-12 text-center shadow-sm"
            >
              <p className="text-muted-foreground mb-2">No recaps yet</p>
              <p className="text-sm text-muted-foreground">
                Generate your first recap from the{" "}
                <Link to="/recaps" className="text-primary hover:underline">Recaps page</Link>
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {recaps.map((recap, i) => (
                <motion.div
                  key={recap.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
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
                        {format(parseISO(recap.week_start), "MMM d")} – {format(parseISO(recap.week_end), "MMM d, yyyy")}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {recap.summary_text || "No summary available"}
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
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;
