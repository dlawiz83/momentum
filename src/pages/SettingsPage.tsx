import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";
import { Download, LogOut } from "lucide-react";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [exporting, setExporting] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile?.display_name) setDisplayName(profile.display_name);
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated!");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      const [logsRes, recapsRes] = await Promise.all([
        supabase
          .from("daily_logs")
          .select("*")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("weekly_recaps")
          .select("*")
          .eq("user_id", user!.id)
          .order("week_start", { ascending: false }),
      ]);

      if (logsRes.error) throw logsRes.error;
      if (recapsRes.error) throw recapsRes.error;

      // Parse recap summary JSON for cleaner export
      const recaps = (recapsRes.data || []).map((r) => {
        try {
          const parsed = JSON.parse(r.summary_text || "{}");
          return { ...r, summary_text: parsed };
        } catch {
          return r;
        }
      });

      const exportData = {
        exported_at: new Date().toISOString(),
        user: { email: user?.email, display_name: profile?.display_name },
        daily_logs: logsRes.data || [],
        weekly_recaps: recaps,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `momentum-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported!");
    } catch (err) {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pt-24 pb-16 px-4">
        <div className="container max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-serif mb-8">Settings</h1>
          </motion.div>

          <div className="space-y-8">
            {/* Profile */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl border border-border p-6 shadow-sm"
            >
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-5">
                Profile
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Name
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-muted/50 border-0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Email
                  </label>
                  <Input
                    value={user?.email || ""}
                    className="bg-muted/50 border-0"
                    disabled
                  />
                </div>
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => updateProfile.mutate()}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </motion.section>

            {/* Data */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl border border-border p-6 shadow-sm"
            >
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-5">
                Data
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Export your data</p>
                  <p className="text-xs text-muted-foreground">
                    Download all your logs and recaps as JSON
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={exporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exporting ? "Exporting..." : "Export"}
                </Button>
              </div>
            </motion.section>

            {/* Account */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl border border-border p-6 shadow-sm"
            >
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-5">
                Account
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Sign out</p>
                  <p className="text-xs text-muted-foreground">
                    Sign out of your Momentum account
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </div>
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
