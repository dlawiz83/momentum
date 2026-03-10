import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Video, TrendingUp, CheckCircle2 } from "lucide-react";
import AppHeader from "@/components/AppHeader";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-primary font-medium mb-4 tracking-wide uppercase text-sm">
              Your weekly growth, visualized
            </p>
            <h1 className="text-5xl md:text-7xl font-serif leading-tight mb-6">
              Small wins build
              <br />
              <span className="text-primary">real momentum</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Log your daily achievements in seconds. Every week, get a cinematic 
              recap video that shows how far you've come.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="brand" size="xl" asChild>
                <Link to="/signup">
                  Start tracking <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="brand-outline" size="lg" asChild>
                <Link to="/dashboard">See a demo</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-surface-warm">
        <div className="container max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg">Three steps to visible progress</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Log daily wins",
                desc: "Capture achievements in under 5 seconds. A workout, a lesson learned, a bug fixed.",
              },
              {
                icon: TrendingUp,
                title: "Watch patterns emerge",
                desc: "See your week take shape. Track consistency and growth across categories.",
              },
              {
                icon: Video,
                title: "Get your recap",
                desc: "Every week, receive a short cinematic video summarizing your progress and growth.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-card rounded-xl p-8 border border-border shadow-sm"
              >
                <div className="w-12 h-12 rounded-lg bg-brand-light flex items-center justify-center mb-5">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-serif mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why small wins */}
      <section className="py-24">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                Why small wins matter
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Research shows that tracking small achievements increases motivation 
                by making progress visible. Most people underestimate how much they 
                accomplish in a week.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Momentum makes your effort tangible — not with streaks or 
                pressure, but with calm reflection.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {[
                "See visible progress every week",
                "Build consistency without pressure",
                "Reflect on growth, not productivity",
                "Private and personal — just for you",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 bg-brand-light rounded-lg px-5 py-4"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-surface-warm">
        <div className="container max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Start building momentum
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Your first weekly recap is just 7 days away.
            </p>
            <Button variant="brand" size="xl" asChild>
              <Link to="/signup">
                Create free account <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-serif text-foreground">Momentum</span>
            <span>· Small wins, real progress</span>
          </div>
          <p>© {new Date().getFullYear()} Momentum. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
