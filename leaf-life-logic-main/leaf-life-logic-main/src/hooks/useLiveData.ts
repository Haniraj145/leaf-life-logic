import { useEffect, useState, useCallback } from "react";
import { supabase, type SensorData, type FarmData, type BucketData, type PlantScanData } from "@/lib/supabase";

// Simulated fallback data when Supabase isn't configured
const DEMO_SENSOR: SensorData = {
  id: "demo-1", farm_id: "f1", temperature: 24.6, humidity: 65,
  ph_level: 6.2, ec_level: 1.8, water_level: 84, light_intensity: 80,
  pump_status: true, light_status: true,
  nutrient_n: 42, nutrient_p: 18, nutrient_k: 36, created_at: new Date().toISOString(),
};

const DEMO_FARMS: FarmData[] = [
  { id: "f1", name: "Vertical Lettuce Farm", status: "Active", location: "Brooklyn, NY", plants: 124, water_usage: "12 L/day", temperature: "23.4°C", health: 96, image_url: "https://images.unsplash.com/photo-1585238342070-61ee6dadcfde?w=900&q=80" },
  { id: "f2", name: "Strawberry Hydro Farm", status: "Active", location: "Austin, TX", plants: 86, water_usage: "9 L/day", temperature: "25.1°C", health: 91, image_url: "https://images.unsplash.com/photo-1543528176-61b239494933?w=900&q=80" },
  { id: "f3", name: "Tomato Smart Farm", status: "Offline", location: "Denver, CO", plants: 48, water_usage: "—", temperature: "—", health: 0, image_url: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=900&q=80" },
  { id: "f4", name: "Indoor Herb Farm", status: "Active", location: "Seattle, WA", plants: 64, water_usage: "6 L/day", temperature: "22.8°C", health: 98, image_url: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=900&q=80" },
];

const DEMO_SCANS: PlantScanData[] = [
  { id: "s1", farm_id: "f1", plant_name: "Lettuce · Pod #03", health_score: 96, disease_detected: "None", color_status: "Vibrant green", growth_rate: "+4.2%/day", day: 14, npk_n: 42, npk_p: 18, npk_k: 36, dry_leaf: false, nutrient_deficiency: "None", image_url: "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=1200&q=80", created_at: new Date().toISOString() },
  { id: "s2", farm_id: "f2", plant_name: "Strawberry · Pod #07", health_score: 89, disease_detected: "Minor spots", color_status: "Healthy green", growth_rate: "+3.1%/day", day: 22, npk_n: 38, npk_p: 22, npk_k: 40, dry_leaf: false, nutrient_deficiency: "Low Phosphorus", image_url: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=1200&q=80", created_at: new Date().toISOString() },
];

function isSupabaseConfigured() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && url !== "https://your-project.supabase.co";
}

/** Live sensor data — streams from Supabase realtime or falls back to simulated drift */
export function useLiveSensor() {
  const [data, setData] = useState<SensorData>(DEMO_SENSOR);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      // Fetch latest row
      supabase.from("sensor_data").select("*").order("created_at", { ascending: false }).limit(1)
        .then(({ data: rows }) => { if (rows?.[0]) setData(rows[0]); });

      // Subscribe to realtime inserts
      const channel = supabase.channel("sensor-live")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "sensor_data" },
          (payload) => setData(payload.new as SensorData))
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    } else {
      // Demo mode: drift values every 2s
      const id = setInterval(() => {
        setData((prev) => ({
          ...prev,
          temperature: drift(prev.temperature, 22, 27),
          humidity: drift(prev.humidity, 55, 75),
          ph_level: drift(prev.ph_level, 5.5, 7.0),
          ec_level: drift(prev.ec_level, 1.2, 2.4),
          water_level: drift(prev.water_level, 60, 100),
          light_intensity: drift(prev.light_intensity, 50, 100),
          nutrient_n: drift(prev.nutrient_n, 30, 55),
          nutrient_p: drift(prev.nutrient_p, 10, 30),
          nutrient_k: drift(prev.nutrient_k, 25, 50),
          created_at: new Date().toISOString(),
        }));
      }, 2000);
      return () => clearInterval(id);
    }
  }, []);

  return data;
}

/** Farms list — from Supabase or demo */
export function useFarms() {
  const [farms, setFarms] = useState<FarmData[]>(DEMO_FARMS);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (isSupabaseConfigured()) {
      const { data } = await supabase.from("farms").select("*");
      if (data) setFarms(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const addFarm = async (name: string, location: string) => {
    const farm: FarmData = {
      id: `f${Date.now()}`, name, location, status: "Active",
      plants: 0, water_usage: "0 L/day", temperature: "24.0°C", health: 100,
      image_url: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=900&q=80",
    };
    if (isSupabaseConfigured()) {
      await supabase.from("farms").insert(farm);
      refetch();
    } else {
      setFarms((prev) => [farm, ...prev]);
    }
  };

  return { farms, loading, addFarm, refetch };
}

/** Buckets for a farm */
export function useBuckets(farmId: string | null) {
  const [buckets, setBuckets] = useState<BucketData[]>([]);

  useEffect(() => {
    if (!farmId) return;
    if (isSupabaseConfigured()) {
      supabase.from("buckets").select("*").eq("farm_id", farmId)
        .then(({ data }) => { if (data) setBuckets(data); });
    } else {
      // demo buckets
      const demo: Record<string, BucketData[]> = {
        f1: [{ id: "b1", farm_id: "f1", name: "Bucket A1", crop: "Romaine", ph: 6.1, ec: 1.7, status: "Active" }, { id: "b2", farm_id: "f1", name: "Bucket A2", crop: "Butterhead", ph: 6.3, ec: 1.8, status: "Active" }],
        f2: [{ id: "b3", farm_id: "f2", name: "Bucket S1", crop: "Albion", ph: 6.0, ec: 1.5, status: "Active" }],
        f4: [{ id: "b4", farm_id: "f4", name: "Bucket H1", crop: "Basil", ph: 6.2, ec: 1.6, status: "Active" }, { id: "b5", farm_id: "f4", name: "Bucket H2", crop: "Mint", ph: 6.4, ec: 1.5, status: "Active" }, { id: "b6", farm_id: "f4", name: "Bucket H3", crop: "Cilantro", ph: 6.1, ec: 1.7, status: "Active" }],
      };
      setBuckets(demo[farmId] || []);
    }
  }, [farmId]);

  const addBucket = async (name: string, crop: string) => {
    if (!farmId) return;
    const bucket: BucketData = { id: `b${Date.now()}`, farm_id: farmId, name, crop, ph: 6.2, ec: 1.6, status: "Active" };
    if (isSupabaseConfigured()) {
      await supabase.from("buckets").insert(bucket);
    }
    setBuckets((prev) => [...prev, bucket]);
  };

  return { buckets, addBucket };
}

/** Plant scan results */
export function usePlantScans() {
  const [scans, setScans] = useState<PlantScanData[]>(DEMO_SCANS);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase.from("plant_scans").select("*").order("created_at", { ascending: false }).limit(10)
        .then(({ data }) => { if (data) setScans(data); });
    }
  }, []);

  return scans;
}

function drift(current: number, min: number, max: number): number {
  const next = current + (Math.random() - 0.5) * (max - min) * 0.08;
  return +Math.min(max, Math.max(min, next)).toFixed(2);
}
