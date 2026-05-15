import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/site/Layout";
import { FadeIn } from "@/components/site/FadeIn";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useFarms, useBuckets } from "@/hooks/useLiveData";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
  Plus, MapPin, Droplets, Thermometer, Sprout, Container, Activity,
  Wifi, WifiOff, Leaf, BarChart3, Zap, Eye
} from "lucide-react";

export const Route = createFileRoute("/farms")({
  head: () => ({
    meta: [
      { title: "Farms — HydroNova" },
      { name: "description", content: "Manage all your hydroponic farms and grow buckets connected to HydroNova." },
    ],
  }),
  component: Farms,
});

function Farms() {
  const { farms, addFarm } = useFarms();
  const [openAdd, setOpenAdd] = useState(false);
  const [activeFarmId, setActiveFarmId] = useState<string | null>(null);
  const activeFarm = farms.find((f) => f.id === activeFarmId) || null;

  const totalPlants = farms.reduce((a, f) => a + f.plants, 0);
  const activeFarms = farms.filter((f) => f.status === "Active").length;
  const avgHealth = Math.round(farms.filter((f) => f.status === "Active").reduce((a, f) => a + f.health, 0) / (activeFarms || 1));

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Connected Farms</p>
            <h1 className="mt-1 text-4xl font-bold">Your Hydroponic Network</h1>
            <p className="mt-2 text-muted-foreground">Monitor every farm and bucket in real-time.</p>
          </div>
          <AddFarmDialog open={openAdd} onOpenChange={setOpenAdd} onAdd={addFarm} />
        </div>

        {/* Network Stats */}
        <FadeIn>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard icon={<Sprout className="h-5 w-5" />} label="Total Farms" value={`${farms.length}`} color="bg-gradient-brand" />
            <StatCard icon={<Leaf className="h-5 w-5" />} label="Total Plants" value={`${totalPlants}`} color="bg-gradient-aqua" />
            <StatCard icon={<Wifi className="h-5 w-5" />} label="Active Farms" value={`${activeFarms}`} color="bg-gradient-brand" />
            <StatCard icon={<Activity className="h-5 w-5" />} label="Avg Health" value={`${avgHealth}%`} color="bg-gradient-aqua" />
          </div>
        </FadeIn>

        {/* Farm Grid */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {farms.map((farm, i) => (
            <FadeIn key={farm.id} delay={i * 0.05}>
              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
                <Card className="overflow-hidden border-border/60 bg-card/60 backdrop-blur transition hover:shadow-leaf">
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden">
                    <img src={farm.image_url} alt={farm.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute left-4 top-4"><StatusBadge status={farm.status} /></div>
                    <div className="absolute bottom-3 left-4 text-white">
                      <h3 className="text-lg font-semibold">{farm.name}</h3>
                      <p className="flex items-center gap-1 text-xs text-white/80"><MapPin className="h-3 w-3" />{farm.location}</p>
                    </div>
                  </div>
                  {/* Stats */}
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <Stat icon={<Sprout className="h-4 w-4" />} label="Plants" value={`${farm.plants}`} />
                      <Stat icon={<Droplets className="h-4 w-4" />} label="Water" value={farm.water_usage} />
                      <Stat icon={<Thermometer className="h-4 w-4" />} label="Temp" value={farm.temperature} />
                      <Stat icon={<BarChart3 className="h-4 w-4" />} label="Health" value={`${farm.health}%`} />
                    </div>
                    {/* Health Bar */}
                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>Overall Health</span>
                        <span className="font-semibold text-foreground">{farm.health}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${farm.health}%` }} transition={{ duration: 1 }}
                          className={`h-full ${farm.health > 70 ? "bg-gradient-aqua" : farm.health > 40 ? "bg-amber-400" : "bg-destructive"}`} />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setActiveFarmId(farm.id)}>
                        <Container className="mr-1 h-4 w-4" /> Buckets
                      </Button>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        {/* Buckets Dialog */}
        <BucketsDialog farmId={activeFarmId} farmName={activeFarm?.name || ""} onOpenChange={(o) => !o && setActiveFarmId(null)} />
      </section>
    </Layout>
  );
}

/* ── Sub-components ── */

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <Card className="flex items-center gap-4 border-border/60 bg-card/60 p-5 backdrop-blur">
      <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-primary-foreground shadow-glow ${color}`}>{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: "Active" | "Offline" }) {
  return (
    <Badge className={status === "Active" ? "bg-accent/90 text-accent-foreground hover:bg-accent/90" : "bg-muted text-muted-foreground hover:bg-muted"}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${status === "Active" ? "bg-white animate-pulse" : "bg-muted-foreground"}`} />
      {status === "Active" ? <><Wifi className="mr-1 h-3 w-3" /> Active</> : <><WifiOff className="mr-1 h-3 w-3" /> Offline</>}
    </Badge>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/50 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="text-accent">{icon}</span>{label}</div>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function AddFarmDialog({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (name: string, loc: string) => void }) {
  const [name, setName] = useState("");
  const [loc, setLoc] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-gradient-brand text-primary-foreground shadow-glow"><Plus className="mr-1 h-4 w-4" /> Add Farm</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add a New Farm</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Farm name</Label><Input placeholder="e.g. Rooftop Greens" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Location</Label><Input placeholder="City, Country" value={loc} onChange={(e) => setLoc(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button onClick={() => { if (name && loc) { onAdd(name, loc); setName(""); setLoc(""); onOpenChange(false); } }}
            className="bg-gradient-brand text-primary-foreground">Create Farm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BucketsDialog({ farmId, farmName, onOpenChange }: { farmId: string | null; farmName: string; onOpenChange: (o: boolean) => void }) {
  const { buckets, addBucket } = useBuckets(farmId);
  const [bName, setBName] = useState("");
  const [crop, setCrop] = useState("");
  return (
    <Dialog open={!!farmId} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{farmName} · Buckets</DialogTitle></DialogHeader>
        <AnimatePresence>
          {farmId && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {buckets.length === 0 && <p className="col-span-2 text-sm text-muted-foreground">No buckets yet — add one below.</p>}
                {buckets.map((b) => (
                  <motion.div key={b.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border/60 bg-card/60 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold"><Container className="h-4 w-4 text-accent" />{b.name}</div>
                      <Badge variant="outline">{b.crop}</Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <span>pH <span className="font-semibold text-foreground">{b.ph}</span></span>
                      <span>EC <span className="font-semibold text-foreground">{b.ec}</span></span>
                      <span>Status <span className={`font-semibold ${b.status === "Active" ? "text-accent" : "text-muted-foreground"}`}>{b.status}</span></span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="rounded-xl border border-dashed border-border p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><Plus className="h-4 w-4 text-accent" /> Add a Bucket</p>
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <Input placeholder="Bucket name" value={bName} onChange={(e) => setBName(e.target.value)} />
                  <Input placeholder="Crop (e.g. Basil)" value={crop} onChange={(e) => setCrop(e.target.value)} />
                  <Button onClick={() => { if (bName && crop) { addBucket(bName, crop); setBName(""); setCrop(""); } }}
                    className="bg-gradient-brand text-primary-foreground">Add</Button>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
