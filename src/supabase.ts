import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mnaghwiawwdpdmmaqoex.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uYWdod2lhd3dkcGRtbWFxb2V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0ODM0MTEsImV4cCI6MjA5NTA1OTQxMX0.liBsfsA-5EPVhVVR6ISDNAZAvakZ01tTfg6UcB020rk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);