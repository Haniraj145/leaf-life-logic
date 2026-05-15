import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/site/Layout";
import { CircularGauge } from "@/components/site/CircularGauge";
import { FadeIn } from "@/components/site/FadeIn";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useLiveSensor } from "@/hooks/useLiveData";
import {
  Activity, Droplets, Thermometer, Sun, FlaskConical, Waves, Cpu,
  Camera, Gauge, Wifi, WifiOff, Zap, CloudRain, Leaf, AlertTriangle
} from "lucide-react";
import {
  ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid,
  BarChart, Bar, RadialBarChart, RadialBar, Legend
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Live Dashboard — HydroNova" },
      { name: "description", content: "Real-time IoT monitoring of pH, EC, temperature, humidity, water and pumps for your HydroNova system." },
    ],
  }),
  component: Dashboard,
});

/* ── rolling time-series hook ── */
function useTimeSeries(value: number, label: string) {
  const [data, setData] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({ t: i, v: +(value + (Math.random() - 0.5) * 2).toFixed(2), name: label }))
  );
  useEffect(() => {
    const id = setInterval(() => {
      setData((d) => [...d.slice(1), { t: d[d.length - 1].t + 1, v: value, name: label }]);
    }, 2000);
    return () => clearInterval(id);
  }, [value, label]);
  return data;
}

/* ── DASHBOARD ── */
function Dashboard() {
  const sensor = useLiveSensor();
  const phSeries = useTimeSeries(sensor.ph_level, "pH");
  const ecSeries = useTimeSeries(sensor.ec_level, "EC");
  const tempSeries = useTimeSeries(sensor.temperature, "Temp");
  const humSeries = useTimeSeries(sensor.humidity, "Humidity");
  const [lastSync, setLastSync] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setLastSync((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [sensor]);
  useEffect(() => { setLastSync(0); }, [sensor.created_at]);

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Smart Dashboard</p>
            <h1 className="mt-1 text-4xl font-bold">Live System Monitoring</h1>
            <p className="mt-2 text-muted-foreground">All sensors streaming in real-time from your HydroNova unit.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-accent/15 text-accent hover:bg-accent/15">
              <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-accent" /> Live · synced {lastSync}s ago
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <Wifi className="h-3 w-3 text-accent" /> Connected
            </Badge>
          </div>
        </div>

        {/* ── Live Sensor Gauges ── */}
        <FadeIn>
          <Card className="mt-8 bg-gradient-deep p-8 text-primary-foreground shadow-glow">
            <div className="mb-4 flex items-center gap-2 text-sm text-white/60">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              Live sensor feed — data refreshes every 2 seconds
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
              <CircularGauge value={mapRange(sensor.ph_level, 5.5, 7, 0, 100)} display={sensor.ph_level.toFixed(1)} label="pH Level" unit="optimal" color="oklch(0.75 0.18 200)" size={140} />
              <CircularGauge value={mapRange(sensor.ec_level, 1.2, 2.4, 0, 100)} display={sensor.ec_level.toFixed(1)} label="EC (mS/cm)" unit="nutrients" color="oklch(0.78 0.20 145)" size={140} />
              <CircularGauge value={mapRange(sensor.temperature, 18, 35, 0, 100)} display={`${sensor.temperature.toFixed(1)}°`} label="Temperature" unit="ideal" color="oklch(0.72 0.18 60)" size={140} />
              <CircularGauge value={sensor.humidity} display={`${Math.round(sensor.humidity)}%`} label="Humidity" unit="balanced" color="oklch(0.70 0.15 230)" size={140} />
              <CircularGauge value={sensor.water_level} display={`${Math.round(sensor.water_level)}%`} label="Water Tank" unit={sensor.water_level > 70 ? "full" : "refill soon"} color="oklch(0.65 0.18 230)" size={140} />
              <CircularGauge value={sensor.light_intensity} display={`${Math.round(sensor.light_intensity)}%`} label="Light Intensity" unit="grow mode" color="oklch(0.78 0.20 145)" size={140} />
            </div>
          </Card>
        </FadeIn>

        {/* ── Live Status Cards ── */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <LiveCard icon={<Zap className="h-5 w-5" />} title="Pump Status" value={sensor.pump_status ? "Running" : "Off"} status={sensor.pump_status ? "active" : "inactive"} sub="Auto-cycle every 30 min" />
          <LiveCard icon={<Sun className="h-5 w-5" />} title="Grow Light" value={sensor.light_status ? `ON · ${Math.round(sensor.light_intensity)}%` : "OFF"} status={sensor.light_status ? "active" : "inactive"} sub="16h on / 8h off cycle" />
          <LiveCard icon={<FlaskConical className="h-5 w-5" />} title="NPK Levels" value={`${sensor.nutrient_n} / ${sensor.nutrient_p} / ${sensor.nutrient_k}`} status="active" sub="N · P · K (ppm)" />
          <LiveCard icon={<Camera className="h-5 w-5" />} title="Camera AI" value="Scanning" status="active" sub="Last scan: 2m ago · Healthy" />
        </div>

        {/* ── Trend Charts ── */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <ChartCard title="pH trend" icon={<Droplets className="h-4 w-4" />} data={phSeries} stroke="oklch(0.65 0.18 230)" />
          <ChartCard title="EC nutrient concentration" icon={<FlaskConical className="h-4 w-4" />} data={ecSeries} stroke="oklch(0.72 0.20 145)" />
          <ChartCard title="Temperature (°C)" icon={<Thermometer className="h-4 w-4" />} data={tempSeries} stroke="oklch(0.72 0.18 60)" />
          <ChartCard title="Humidity (%)" icon={<Waves className="h-4 w-4" />} data={humSeries} stroke="oklch(0.70 0.15 230)" />
        </div>

        {/* ── NPK Bar Chart + Camera Feed ── */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <FadeIn>
            <Card className="border-border/60 bg-card/60 p-6 backdrop-blur">
              <h3 className="flex items-center gap-2 text-lg font-semibold"><FlaskConical className="h-5 w-5 text-accent" /> NPK Nutrient Breakdown</h3>
              <p className="mt-1 text-sm text-muted-foreground">Live nutrient levels detected from the reservoir sensor.</p>
              <div className="mt-4 h-56">
                <ResponsiveContainer>
                  <BarChart data={[
                    { name: "Nitrogen (N)", value: sensor.nutrient_n, fill: "oklch(0.65 0.18 230)" },
                    { name: "Phosphorus (P)", value: sensor.nutrient_p, fill: "oklch(0.72 0.20 145)" },
                    { name: "Potassium (K)", value: sensor.nutrient_k, fill: "oklch(0.72 0.18 60)" },
                  ]}>
                    <CartesianGrid stroke="color-mix(in oklab, var(--border) 60%, transparent)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis unit=" ppm" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card className="relative overflow-hidden border-border/60 bg-gradient-deep p-2 text-primary-foreground shadow-glow">
              <div className="relative aspect-video overflow-hidden rounded-2xl">
                <img src="https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=1200&q=80" alt="Live camera feed" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-xs backdrop-blur">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> LIVE · Camera 01
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 backdrop-blur"><Leaf className="mr-1 inline h-3 w-3 text-accent" />Healthy 96%</span>
                  <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 backdrop-blur"><Camera className="mr-1 inline h-3 w-3 text-accent" />1080p HD</span>
                  <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 backdrop-blur"><Activity className="mr-1 inline h-3 w-3 text-accent" />AI Active</span>
                </div>
              </div>
            </Card>
          </FadeIn>
        </div>

        {/* ── System Controls + Activity ── */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card className="border-border/60 bg-card/60 p-6 backdrop-blur">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><Cpu className="h-5 w-5 text-accent" /> System Controls</h3>
            <ul className="mt-5 space-y-4">
              <Toggle label="Water pump" defaultChecked />
              <Toggle label="Auto nutrient dosing" defaultChecked />
              <Toggle label="Grow light" defaultChecked />
              <Toggle label="Night mode" />
              <Toggle label="Push notifications" defaultChecked />
              <Toggle label="Camera AI scanning" defaultChecked />
            </ul>
          </Card>
          <Card className="border-border/60 bg-card/60 p-6 backdrop-blur">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><Activity className="h-5 w-5 text-accent" /> Recent Activity</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                { t: "Pump cycle completed", time: "1m ago", color: "bg-accent" },
                { t: "Nutrient solution topped up (+120ml)", time: "12m ago", color: "bg-water" },
                { t: "Light intensity raised to 80%", time: "1h ago", color: "bg-amber-400" },
                { t: "Daily AI plant scan: All healthy", time: "3h ago", color: "bg-accent" },
                { t: "Water tank refilled", time: "1d ago", color: "bg-water" },
                { t: "Camera detected minor leaf spot — alert sent", time: "2d ago", color: "bg-amber-400" },
                { t: "NPK auto-dose: +50ml N solution", time: "3d ago", color: "bg-accent" },
              ].map((a) => (
                <li key={a.t} className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 px-4 py-3">
                  <span className={`h-2 w-2 rounded-full ${a.color}`} />
                  <span className="flex-1">{a.t}</span>
                  <span className="text-xs text-muted-foreground">{a.time}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* ── Environment Overview ── */}
        <FadeIn>
          <Card className="mt-8 border-border/60 bg-card/60 p-6 backdrop-blur">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><CloudRain className="h-5 w-5 text-accent" /> Environment Overview</h3>
            <p className="mt-1 text-sm text-muted-foreground">Current ambient conditions around your hydroponic system.</p>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <EnvCard label="Air Temp" value={`${sensor.temperature.toFixed(1)}°C`} icon={<Thermometer className="h-5 w-5" />} status={sensor.temperature > 26 ? "warning" : "ok"} />
              <EnvCard label="Humidity" value={`${Math.round(sensor.humidity)}%`} icon={<Waves className="h-5 w-5" />} status={sensor.humidity > 70 ? "warning" : "ok"} />
              <EnvCard label="Water pH" value={sensor.ph_level.toFixed(1)} icon={<Droplets className="h-5 w-5" />} status={sensor.ph_level > 6.8 || sensor.ph_level < 5.8 ? "warning" : "ok"} />
              <EnvCard label="EC Level" value={`${sensor.ec_level.toFixed(1)} mS`} icon={<Gauge className="h-5 w-5" />} status="ok" />
            </div>
          </Card>
        </FadeIn>
      </section>
    </Layout>
  );
}

/* ── Sub-components ── */

function LiveCard({ icon, title, value, status, sub }: { icon: React.ReactNode; title: string; value: string; status: "active" | "inactive"; sub: string }) {
  return (
    <FadeIn>
      <Card className="group border-border/60 bg-card/60 p-5 backdrop-blur transition hover:-translate-y-1 hover:shadow-leaf">
        <div className="flex items-center gap-3">
          <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl shadow-glow ${status === "active" ? "bg-gradient-aqua text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {icon}
          </span>
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-lg font-bold">{value}</p>
          </div>
          {status === "active" && <span className="ml-auto h-2.5 w-2.5 animate-pulse rounded-full bg-accent" />}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{sub}</p>
      </Card>
    </FadeIn>
  );
}

function EnvCard({ label, value, icon, status }: { label: string; value: string; icon: React.ReactNode; status: "ok" | "warning" }) {
  return (
    <div className={`rounded-2xl border p-4 ${status === "warning" ? "border-amber-400/40 bg-amber-400/5" : "border-border/60 bg-background/50"}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={status === "warning" ? "text-amber-400" : "text-accent"}>{icon}</span>
        {label}
        {status === "warning" && <AlertTriangle className="ml-auto h-3.5 w-3.5 text-amber-400" />}
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <li className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 px-4 py-3">
      <span className="font-medium">{label}</span>
      <Switch defaultChecked={defaultChecked} />
    </li>
  );
}

function ChartCard({ title, icon, data, stroke }: { title: string; icon: React.ReactNode; data: { t: number; v: number }[]; stroke: string }) {
  return (
    <Card className="border-border/60 bg-card/60 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><span className="text-accent">{icon}</span>{title}</h3>
        <span className="font-display text-2xl font-bold">{data[data.length - 1].v}</span>
      </div>
      <div className="mt-4 h-48">
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`g-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.5} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="color-mix(in oklab, var(--border) 60%, transparent)" vertical={false} />
            <XAxis dataKey="t" hide />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} labelStyle={{ display: "none" }} />
            <Area type="monotone" dataKey="v" stroke={stroke} strokeWidth={2.5} fill={`url(#g-${title})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return Math.round(((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin);
}
