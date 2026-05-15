import { createClient } from "@supabase/supabase-js";

// Replace with your Supabase project URL and anon key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types for sensor data coming from Supabase
export type SensorData = {
  id: string;
  farm_id: string;
  temperature: number;
  humidity: number;
  ph_level: number;
  ec_level: number;
  water_level: number;
  light_intensity: number;
  pump_status: boolean;
  light_status: boolean;
  nutrient_n: number;
  nutrient_p: number;
  nutrient_k: number;
  created_at: string;
};

export type FarmData = {
  id: string;
  name: string;
  status: "Active" | "Offline";
  location: string;
  plants: number;
  water_usage: string;
  temperature: string;
  health: number;
  image_url: string;
};

export type BucketData = {
  id: string;
  farm_id: string;
  name: string;
  crop: string;
  ph: number;
  ec: number;
  status: "Active" | "Offline";
};

export type PlantScanData = {
  id: string;
  farm_id: string;
  plant_name: string;
  health_score: number;
  disease_detected: string;
  color_status: string;
  growth_rate: string;
  day: number;
  npk_n: number;
  npk_p: number;
  npk_k: number;
  dry_leaf: boolean;
  nutrient_deficiency: string;
  image_url: string;
  created_at: string;
};
