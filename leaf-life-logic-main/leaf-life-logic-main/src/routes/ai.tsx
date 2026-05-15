import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Layout } from "@/components/site/Layout";
import { FadeIn } from "@/components/site/FadeIn";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircularGauge } from "@/components/site/CircularGauge";
import { usePlantScans, useLiveSensor } from "@/hooks/useLiveData";
import {
  Bug, Camera, Droplets, Leaf, FlaskConical, Activity, Sun,
  AlertTriangle, CheckCircle, Brain, Cpu, Eye, ArrowRight, Scan
} from "lucide-react";

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
  const scans = usePlantScans();
  const sensor = useLiveSensor();

  const detections = [
    { i: Bug, t: "Leaf Disease Detection", desc: "Convolutional neural network spots blight, mildew, powdery spots and fungal infections before they spread.", v: "0 issues", ok: true },
    { i: Activity, t: "Growth Tracking", desc: "Measures daily delta in canopy area, height and leaf count for precise growth rate analysis.", v: "+4.2% / day", ok: true },
    { i: Sun, t: "Color Analysis", desc: "Spectral analysis verifies vibrancy of leaf chlorophyll, detecting early signs of stress.", v: "Vibrant green", ok: true },
    { i: Leaf, t: "Dry Leaf Detection", desc: "Identifies wilting, curling, and browning patterns using edge detection and thermal analysis.", v: "None detected", ok: true },
    { i: FlaskConical, t: "Nutrient Deficiency", desc: "Analyzes yellowing patterns, interveinal chlorosis and tip burn to identify lacking nutrients.", v: "Balanced", ok: true },
    { i: Droplets, t: "NPK Value Estimation", desc: "Predicts Nitrogen-Phosphorus-Potassium levels from leaf color, texture and growth patterns.", v: `${sensor.nutrient_n} / ${sensor.nutrient_p} / ${sensor.nutrient_k} ppm`, ok: true },
  ];

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Plant Detection · Camera AI</p>
        <h1 className="mt-1 text-4xl font-bold">See What Your Plants Are Saying</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">A 1080p HD camera streams to an on-device ML model that continuously evaluates plant health, detects diseases, and monitors nutrient levels.</p>

        {/* AI Capability Cards */}
        <FadeIn>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <AIStatCard icon={<Brain className="h-5 w-5" />} label="AI Model" value="YOLOv8 + CNN" />
            <AIStatCard icon={<Camera className="h-5 w-5" />} label="Resolution" value="1080p HD" />
            <AIStatCard icon={<Cpu className="h-5 w-5" />} label="Inference" value="< 200ms" />
            <AIStatCard icon={<Scan className="h-5 w-5" />} label="Scans Today" value="147" />
          </div>
        </FadeIn>

        {/* Live Camera + Detections */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <FadeIn>
            <Card className="relative overflow-hidden border-border/60 bg-gradient-deep p-2 text-primary-foreground shadow-glow">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <img src="https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=1200&q=80" alt="Plant scan" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <ScannerOverlay />
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs backdrop-blur">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-accent" /> AI scanning — live
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

        {/* More Detection Cards */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {detections.slice(3).map((d, i) => (
            <FadeIn key={d.t} delay={i * 0.05}>
              <DetectionCard {...d} />
            </FadeIn>
          ))}
        </div>

        {/* Live Plant Scan Results from Supabase */}
        <div className="mt-12">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Recent Scans</p>
            <h2 className="mt-1 text-3xl font-bold">AI Scan History</h2>
            <p className="mt-2 text-muted-foreground">Real-time plant scan results from the onboard camera AI system.</p>
          </FadeIn>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {scans.map((scan, i) => (
              <FadeIn key={scan.id} delay={i * 0.05}>
                <Card className="overflow-hidden border-border/60 bg-card/60 backdrop-blur">
                  <div className="relative h-48 overflow-hidden">
                    <img src={scan.image_url} alt={scan.plant_name} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute left-4 top-4">
                      <Badge className={scan.health_score > 80 ? "bg-accent/90 text-accent-foreground" : "bg-amber-400/90 text-black"}>
                        <span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                        {scan.health_score > 80 ? "Healthy" : "Attention"}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-4 text-white">
                      <h3 className="text-lg font-semibold">{scan.plant_name}</h3>
                      <p className="text-xs text-white/80">Day {scan.day} · {scan.growth_rate}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <ScanMetric label="Health" value={`${scan.health_score}%`} ok={scan.health_score > 80} />
                      <ScanMetric label="Color" value={scan.color_status} ok={scan.color_status.includes("green") || scan.color_status.includes("Vibrant")} />
                      <ScanMetric label="Disease" value={scan.disease_detected} ok={scan.disease_detected === "None"} />
                      <ScanMetric label="N" value={`${scan.npk_n} ppm`} ok />
                      <ScanMetric label="P" value={`${scan.npk_p} ppm`} ok />
                      <ScanMetric label="K" value={`${scan.npk_k} ppm`} ok />
                    </div>
                    {scan.nutrient_deficiency !== "None" && (
                      <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/5 p-3 text-sm">
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                        <span className="text-muted-foreground">Deficiency: <strong className="text-foreground">{scan.nutrient_deficiency}</strong></span>
                      </div>
                    )}
                    {scan.dry_leaf && (
                      <div className="mt-3 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
                        <Leaf className="h-4 w-4 text-destructive" />
                        <span className="text-muted-foreground">Dry leaves detected — check watering schedule</span>
                      </div>
                    )}
                  </div>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Live NPK Gauges */}
        <FadeIn>
          <Card className="mt-12 bg-gradient-deep p-8 text-primary-foreground shadow-glow">
            <h3 className="text-xl font-bold">Live NPK Nutrient Gauges</h3>
            <p className="mt-1 text-sm text-white/60">Real-time nutrient levels from the reservoir sensor, verified by camera AI.</p>
            <div className="mt-6 grid grid-cols-3 gap-6 md:grid-cols-6">
              <CircularGauge value={mapRange(sensor.nutrient_n, 20, 60, 0, 100)} display={`${sensor.nutrient_n}`} label="Nitrogen (N)" unit="ppm" color="oklch(0.65 0.18 230)" size={120} />
              <CircularGauge value={mapRange(sensor.nutrient_p, 5, 35, 0, 100)} display={`${sensor.nutrient_p}`} label="Phosphorus (P)" unit="ppm" color="oklch(0.72 0.20 145)" size={120} />
              <CircularGauge value={mapRange(sensor.nutrient_k, 15, 55, 0, 100)} display={`${sensor.nutrient_k}`} label="Potassium (K)" unit="ppm" color="oklch(0.72 0.18 60)" size={120} />
              <CircularGauge value={mapRange(sensor.ph_level, 5.5, 7, 0, 100)} display={sensor.ph_level.toFixed(1)} label="pH Level" unit="optimal" color="oklch(0.75 0.18 200)" size={120} />
              <CircularGauge value={mapRange(sensor.ec_level, 1.2, 2.4, 0, 100)} display={sensor.ec_level.toFixed(1)} label="EC Level" unit="mS/cm" color="oklch(0.70 0.15 230)" size={120} />
              <CircularGauge value={sensor.water_level} display={`${Math.round(sensor.water_level)}%`} label="Water Level" unit="tank" color="oklch(0.65 0.18 230)" size={120} />
            </div>
          </Card>
        </FadeIn>

        {/* CTA */}
        <FadeIn>
          <Card className="mt-12 flex flex-wrap items-center justify-between gap-4 border-border/60 bg-card/60 p-8 backdrop-blur">
            <div>
              <h3 className="text-2xl font-semibold">Want to see live sensor data?</h3>
              <p className="mt-1 text-muted-foreground">Head to the dashboard for real-time monitoring of your entire system.</p>
            </div>
            <Link to="/dashboard"><Button size="lg" className="bg-gradient-brand text-primary-foreground shadow-glow">Open Dashboard <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
          </Card>
        </FadeIn>
      </section>
    </Layout>
  );
}

/* ── Helpers ── */

function AIStatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="flex items-center gap-3 border-border/60 bg-card/60 p-4 backdrop-blur">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-bold">{value}</p>
      </div>
    </Card>
  );
}

function ScanMetric({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 font-semibold">
        {ok ? <CheckCircle className="h-3.5 w-3.5 text-accent" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
        {value}
      </p>
    </div>
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
      {["left-6 top-6", "right-6 top-6", "left-6 bottom-6", "right-6 bottom-6"].map((p) => (
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
    <Card className="h-full border-border/60 bg-card/60 p-5 backdrop-blur transition hover:-translate-y-1 hover:shadow-leaf">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow"><Icon className="h-5 w-5" /></span>
      <p className="mt-3 font-semibold">{t}</p>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <p className="mt-3 text-sm font-semibold text-accent">{v}</p>
    </Card>
  );
}

function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return Math.round(((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin);
}
