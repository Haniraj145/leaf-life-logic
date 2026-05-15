import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Layout } from "@/components/site/Layout";
import { FadeIn } from "@/components/site/FadeIn";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bug, Camera, Droplets, Leaf, FlaskConical, Activity, Sun } from "lucide-react";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "AI Plant Vision — HydroNova" },
      { name: "description", content: "AI-powered camera detects disease, growth, color, dry leaves, nutrient deficiency and NPK values." },
    ],
  }),
  component: AI,
});

function AI() {
  const detections = [
    { i: Bug, t: "Leaf disease", desc: "Convolutional model spots blight, mildew & spots.", v: "0 issues", ok: true },
    { i: Activity, t: "Growth tracking", desc: "Daily delta in canopy area & height.", v: "+4.2% / day", ok: true },
    { i: Sun, t: "Color analysis", desc: "Verifies vibrancy of leaf chlorophyll.", v: "Vibrant green", ok: true },
    { i: Leaf, t: "Dry leaf detection", desc: "Flags wilting before it spreads.", v: "None", ok: true },
    { i: FlaskConical, t: "Nutrient deficiency", desc: "Detects yellowing patterns to identify lacking nutrients.", v: "Balanced", ok: true },
    { i: Droplets, t: "NPK estimation", desc: "Predicts N-P-K levels from leaf appearance.", v: "42 / 18 / 36 ppm", ok: true },
  ];
  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Plant Detection · Camera AI</p>
        <h1 className="mt-1 text-4xl font-bold">See what your plants are saying</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">A 1080p HD camera streams to an on-device ML model that continuously evaluates plant health.</p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <FadeIn>
            <Card className="relative overflow-hidden border-border/60 bg-gradient-deep p-2 text-primary-foreground shadow-glow">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <img src="https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=1200&q=80" alt="Plant scan" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <ScannerOverlay />
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs backdrop-blur">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-accent" /> AI scanning
                </div>
                <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2 text-xs">
                  <Tag icon={<Camera className="h-3 w-3" />} label="HD camera" />
                  <Tag icon={<Bug className="h-3 w-3" />} label="0 diseases" />
                  <Tag icon={<Leaf className="h-3 w-3" />} label="Healthy 96%" />
                </div>
              </div>
            </Card>
          </FadeIn>
          <div className="grid gap-4">
            {detections.slice(0, 3).map((d, i) => (
              <FadeIn key={d.t} delay={i * 0.05}>
                <DetectionRow {...d} />
              </FadeIn>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {detections.slice(3).map((d, i) => (
            <FadeIn key={d.t} delay={i * 0.05}>
              <DetectionCard {...d} />
            </FadeIn>
          ))}
        </div>
      </section>
    </Layout>
  );
}

function Tag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center justify-center gap-1 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 backdrop-blur">
      <span className="text-accent">{icon}</span>{label}
    </div>
  );
}

function ScannerOverlay() {
  return (
    <>
      <motion.div
        initial={{ y: "0%" }} animate={{ y: ["0%", "100%", "0%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-x-0 top-0 h-px bg-accent shadow-[0_0_20px_4px_var(--leaf)]"
      />
      <div className="absolute inset-6 rounded-2xl border border-accent/40" />
      {[
        "left-6 top-6", "right-6 top-6", "left-6 bottom-6", "right-6 bottom-6",
      ].map((p) => (
        <div key={p} className={`absolute ${p} h-4 w-4 border-accent`}>
          <div className="absolute inset-0 border-l-2 border-t-2 border-accent" />
        </div>
      ))}
    </>
  );
}

function DetectionRow({ i: Icon, t, desc, v, ok }: { i: typeof Bug; t: string; desc: string; v: string; ok: boolean }) {
  return (
    <Card className="flex items-start gap-4 border-border/60 bg-card/60 p-5 backdrop-blur">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-aqua text-primary-foreground shadow-glow"><Icon className="h-5 w-5" /></span>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{t}</p>
          <Badge className={ok ? "bg-accent/15 text-accent hover:bg-accent/15" : "bg-destructive/15 text-destructive"}>{v}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
    </Card>
  );
}

function DetectionCard({ i: Icon, t, desc, v }: { i: typeof Bug; t: string; desc: string; v: string; ok?: boolean }) {
  return (
    <Card className="h-full border-border/60 bg-card/60 p-5 backdrop-blur">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow"><Icon className="h-5 w-5" /></span>
      <p className="mt-3 font-semibold">{t}</p>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <p className="mt-3 text-sm font-semibold text-accent">{v}</p>
    </Card>
  );
}
