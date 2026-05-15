import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Layout } from "@/components/site/Layout";
import { FadeIn } from "@/components/site/FadeIn";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Droplets, FlaskConical, Activity, Sprout, Camera, ArrowRight,
  Waves, Zap, Bot, Gauge, Sun, Thermometer, Bell, Cpu
} from "lucide-react";
import howWorks from "@/assets/hydronova-howitworks.png";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How HydroNova Works" },
      { name: "description", content: "From water tank setup to AI growth monitoring — see the full HydroNova workflow." },
    ],
  }),
  component: How,
});

function How() {
  const steps = [
    { i: Droplets, t: "Water Tank Setup", d: "Fill the reservoir with clean water. Level sensors confirm depth instantly and alert you when refills are needed. The tank is food-grade, UV-resistant and holds up to 20 liters.", color: "oklch(0.65 0.18 230)" },
    { i: FlaskConical, t: "Nutrient Mixing", d: "The auto-doser precisely blends a balanced N-P-K solution to the optimal EC level. It continuously monitors concentration and adjusts in real-time — no manual mixing needed.", color: "oklch(0.72 0.20 145)" },
    { i: Activity, t: "Pump Circulation", d: "A whisper-quiet pump aerates and circulates nutrients to every root zone on a smart timer. The pump cycles every 30 minutes and can be controlled from the dashboard.", color: "oklch(0.72 0.18 60)" },
    { i: Sprout, t: "Root Absorption", d: "Bare roots drink directly from the nutrient film — no soil, no waste, up to 2× faster uptake. The soilless environment eliminates soil-borne pests entirely.", color: "oklch(0.78 0.20 145)" },
    { i: Camera, t: "Plant Growth Monitoring", d: "A 1080p AI camera + array of IoT sensors track leaf color, canopy height, disease markers and health score 24/7. Alerts are pushed to your phone in real-time.", color: "oklch(0.75 0.18 200)" },
  ];

  const techStack = [
    { i: Cpu, t: "ESP32 Controller", d: "Low-power microcontroller runs the entire sensor array and pump logic." },
    { i: Gauge, t: "pH / EC Probes", d: "Industrial-grade electrodes measure acidity and conductivity continuously." },
    { i: Thermometer, t: "DHT22 Sensor", d: "Precision temperature and humidity readings every second." },
    { i: Waves, t: "Ultrasonic Level", d: "Non-contact water level measurement with ±1mm accuracy." },
    { i: Sun, t: "LDR + LED Array", d: "Ambient light sensing with full-spectrum grow LED control." },
    { i: Bot, t: "YOLOv8 AI Model", d: "On-device plant health inference in under 200ms per frame." },
  ];

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">How It Works</p>
        <h1 className="mt-1 text-4xl font-bold">A Continuous Loop of Smart Growth</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Sensors → Camera → Controller → Pump → Roots → App. The system never stops optimizing your plants for maximum yield.</p>

        {/* Workflow Image */}
        <FadeIn>
          <Card className="mt-10 overflow-hidden border-border/60 bg-card/60 p-2 backdrop-blur">
            <img src={howWorks} alt="HydroNova workflow diagram" className="rounded-xl" />
          </Card>
        </FadeIn>

        {/* Animated Flow Diagram */}
        <FadeIn>
          <Card className="mt-10 overflow-hidden border-border/60 bg-gradient-deep p-8 text-primary-foreground shadow-glow">
            <h3 className="text-xl font-bold">Animated Workflow</h3>
            <p className="mt-1 text-sm text-white/60">Watch how data flows through the HydroNova system in real-time.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 md:gap-0">
              {["Sensors", "Controller", "Cloud", "AI Engine", "Actuators", "Plants", "App"].map((node, idx) => (
                <div key={node} className="flex items-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1, type: "spring" }}
                    className="relative flex h-16 w-20 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-xs font-semibold backdrop-blur md:h-20 md:w-24 md:text-sm"
                  >
                    <motion.div
                      className="absolute -inset-px rounded-2xl border-2 border-accent/0"
                      animate={{ borderColor: ["oklch(0.78 0.20 145 / 0)", "oklch(0.78 0.20 145 / 0.6)", "oklch(0.78 0.20 145 / 0)"] }}
                      transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                    />
                    {node}
                  </motion.div>
                  {idx < 6 && (
                    <motion.div
                      className="mx-1 text-accent md:mx-2"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.2 }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </FadeIn>

        {/* Steps Timeline */}
        <div className="relative mt-12">
          <div className="absolute left-6 top-0 hidden h-full w-px bg-gradient-to-b from-accent via-primary to-transparent md:block" />
          <ol className="space-y-6">
            {steps.map((s, idx) => (
              <FadeIn key={s.t} delay={idx * 0.05}>
                <motion.li
                  whileHover={{ x: 4 }}
                  className="relative grid gap-4 rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur md:grid-cols-[120px_1fr] md:pl-20"
                >
                  <div className="absolute left-0 top-6 hidden h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground shadow-glow md:flex">
                    <s.i className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-3xl font-bold text-gradient-brand">0{idx + 1}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{s.t}</h3>
                    <p className="mt-1 text-muted-foreground">{s.d}</p>
                  </div>
                </motion.li>
              </FadeIn>
            ))}
          </ol>
        </div>

        {/* Tech Stack */}
        <div className="mt-16">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Technology</p>
            <h2 className="mt-1 text-3xl font-bold">The Hardware Behind HydroNova</h2>
            <p className="mt-2 text-muted-foreground">Every component is carefully selected for reliability, accuracy and low power consumption.</p>
          </FadeIn>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {techStack.map((tech, i) => (
              <FadeIn key={tech.t} delay={i * 0.05}>
                <Card className="group h-full border-border/60 bg-card/60 p-6 backdrop-blur transition hover:-translate-y-1 hover:shadow-leaf">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-aqua text-primary-foreground shadow-glow">
                    <tech.i className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{tech.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{tech.d}</p>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Feedback Loop CTA */}
        <FadeIn>
          <Card className="mt-12 flex flex-wrap items-center justify-between gap-4 border-border/60 bg-gradient-deep p-8 text-primary-foreground shadow-glow">
            <div>
              <h3 className="text-2xl font-bold">Continuous Feedback Loop</h3>
              <p className="mt-1 text-white/80">Every reading tunes the next decision. Healthier plants, higher yields, less waste — fully automated.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
                Sensors <ArrowRight className="h-4 w-4" /> AI <ArrowRight className="h-4 w-4" /> Pump <ArrowRight className="h-4 w-4" /> Plants
              </div>
              <Link to="/dashboard"><Button className="bg-accent text-accent-foreground hover:bg-accent/90">See Live Data</Button></Link>
            </div>
          </Card>
        </FadeIn>
      </section>
    </Layout>
  );
}
