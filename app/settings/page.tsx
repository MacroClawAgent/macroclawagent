"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { AppShell } from "@/components/app/AppShell";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import {
  User, Target, Link2, Bell, CreditCard,
  Upload, X, Loader2, CheckCircle2, AlertCircle,
  ShoppingBag, Check, Crown, Zap, RefreshCw,
} from "lucide-react";

type Tab = "profile" | "goals" | "integrations" | "notifications" | "billing";
type Gender = "male" | "female" | "other" | "prefer_not_to_say";
type Unit = "metric" | "imperial";

interface ProfileData {
  full_name: string;
  date_of_birth: string;
  gender: Gender | "";
  weight: string;
  height_cm: string;
  height_ft: string;
  height_in: string;
  unit: Unit;
  avatar_url: string;
}

interface GoalData {
  calorie_goal: string;
  protein_goal: string;
  carbs_goal: string;
  fat_goal: string;
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
  { id: "goals", label: "Goals", icon: <Target className="w-4 h-4" /> },
  { id: "integrations", label: "Integrations", icon: <Link2 className="w-4 h-4" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  { id: "billing", label: "Billing", icon: <CreditCard className="w-4 h-4" /> },
];

const genderOptions: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stravaAthleteId, setStravaAthleteId] = useState<string | null>(null);
  const [stravaSyncing, setStravaSyncing] = useState(false);
  const [stravaSuccess, setStravaSuccess] = useState(false);
  const [stravaError, setStravaError] = useState<string | null>(null);
  const [stravaNotConfigured, setStravaNotConfigured] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [notifications, setNotifications] = useState({ email: true, push: false, weekly: true, plan: true });

  const [form, setForm] = useState<ProfileData>({
    full_name: "", date_of_birth: "", gender: "",
    weight: "", height_cm: "", height_ft: "", height_in: "",
    unit: "metric", avatar_url: "",
  });
  const [goals, setGoals] = useState<GoalData>({
    calorie_goal: "2000", protein_goal: "120", carbs_goal: "250", fat_goal: "70",
  });

  const set = (field: keyof ProfileData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Handle redirect-back from Strava OAuth (read URL params client-side)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") as Tab | null;
    const connected = params.get("connected");
    const err = params.get("error");
    if (tab) setActiveTab(tab);
    if (connected === "true") setStravaSuccess(true);
    if (err === "strava_denied") setStravaError("Strava authorisation was cancelled.");
    if (err === "strava_error") setStravaError("Strava connection failed. Please try again.");
    if (err === "strava_not_configured") setStravaNotConfigured(true);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return; }
    const load = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }
        const { data } = await supabase
          .from("users")
          .select("full_name,date_of_birth,gender,weight_kg,height_cm,unit_preference,avatar_url,calorie_goal,protein_goal,carbs_goal,fat_goal,strava_athlete_id")
          .eq("id", user.id).single();
        if (data) {
          const isImperial = data.unit_preference === "imperial";
          setForm({
            full_name: data.full_name ?? "", date_of_birth: data.date_of_birth ?? "",
            gender: (data.gender as Gender) ?? "",
            weight: data.weight_kg ? (isImperial ? (data.weight_kg / 0.453592).toFixed(1) : data.weight_kg.toString()) : "",
            height_cm: data.height_cm && !isImperial ? data.height_cm.toString() : "",
            height_ft: data.height_cm && isImperial ? Math.floor(data.height_cm / 30.48).toString() : "",
            height_in: data.height_cm && isImperial ? Math.round((data.height_cm % 30.48) / 2.54).toString() : "",
            unit: isImperial ? "imperial" : "metric", avatar_url: data.avatar_url ?? "",
          });
          if (data.avatar_url) setAvatarPreview(data.avatar_url);
          setStravaAthleteId(data.strava_athlete_id ?? null);
          setGoals({
            calorie_goal: (data.calorie_goal ?? 2000).toString(),
            protein_goal: (data.protein_goal ?? 120).toString(),
            carbs_goal: (data.carbs_goal ?? 250).toString(),
            fat_goal: (data.fat_goal ?? 70).toString(),
          });
        }
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    load();
  }, [router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB"); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(false);
    try {
      let avatar_url = form.avatar_url;
      if (isSupabaseConfigured() && avatarFile) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const ext = avatarFile.name.split(".").pop();
          const path = `${user.id}/avatar.${ext}`;
          const { error: uploadError } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
          if (!uploadError) {
            const { data } = supabase.storage.from("avatars").getPublicUrl(path);
            avatar_url = data.publicUrl;
          }
        }
      }
      const weightKg = form.unit === "imperial" ? parseFloat(form.weight) * 0.453592 : parseFloat(form.weight);
      const heightCm = form.unit === "imperial"
        ? parseInt(form.height_ft || "0") * 30.48 + parseInt(form.height_in || "0") * 2.54
        : parseFloat(form.height_cm);

      const payload = activeTab === "goals"
        ? { calorie_goal: parseInt(goals.calorie_goal), protein_goal: parseInt(goals.protein_goal), carbs_goal: parseInt(goals.carbs_goal), fat_goal: parseInt(goals.fat_goal) }
        : { full_name: form.full_name, date_of_birth: form.date_of_birth || null, gender: form.gender || null, weight_kg: form.weight ? weightKg : null, height_cm: (form.height_cm || form.height_ft) ? heightCm : null, unit_preference: form.unit, avatar_url, profile_complete: true };

      const res = await fetch("/api/profile/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed to save"); }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Account</p>
          <h1 className="text-2xl font-black text-slate-100">Settings</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tab sidebar */}
          <div className="lg:w-52 flex flex-row lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
            {tabs.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => { setActiveTab(id); setSuccess(false); setError(null); }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === id
                    ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                    : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 min-w-0">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>

              {/* ── PROFILE TAB ── */}
              {activeTab === "profile" && (
                <div className="glass-card p-6 rounded-2xl flex flex-col gap-5">
                  <h2 className="text-base font-bold text-slate-100">Personal Information</h2>

                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                      {avatarPreview ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover border border-white/10" />
                          <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-5 h-5 text-white" />
                          </div>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setAvatarPreview(null); setAvatarFile(null); set("avatar_url", ""); }}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-400 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center group-hover:border-indigo-500/60 transition-colors">
                          <Upload className="w-6 h-6 text-indigo-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">Profile Photo</p>
                      <p className="text-xs text-slate-500 mt-0.5">JPG, PNG or WEBP · max 5MB</p>
                      <button onClick={() => fileInputRef.current?.click()} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Change photo</button>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileSelect} className="hidden" />
                  </div>

                  <div className="h-px bg-white/[0.07]" />

                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Full Name</label>
                    <input type="text" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Jane Doe"
                      className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/60 transition-all" />
                  </div>

                  {/* DOB */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Date of Birth</label>
                    <input type="date" value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-slate-100 outline-none focus:border-indigo-500/60 transition-all [color-scheme:dark]" />
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Gender</label>
                    <div className="grid grid-cols-2 gap-2">
                      {genderOptions.map((opt) => (
                        <button key={opt.value} type="button" onClick={() => set("gender", opt.value)}
                          className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-all border ${form.gender === opt.value ? "bg-indigo-600 border-indigo-500 text-white" : "bg-white/[0.04] border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-white/[0.07]" />

                  {/* Units */}
                  <div className="flex rounded-xl bg-white/[0.05] p-1 gap-1">
                    {(["metric", "imperial"] as Unit[]).map((u) => (
                      <button key={u} type="button" onClick={() => set("unit", u)}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${form.unit === u ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25" : "text-slate-400 hover:text-slate-200"}`}>
                        {u === "metric" ? "Metric (kg/cm)" : "Imperial (lbs/ft)"}
                      </button>
                    ))}
                  </div>

                  {/* Weight */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Weight ({form.unit === "metric" ? "kg" : "lbs"})</label>
                    <input type="number" min={20} step={0.1} value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder={form.unit === "metric" ? "70.0" : "154"}
                      className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/60 transition-all" />
                  </div>

                  {/* Height */}
                  {form.unit === "metric" ? (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Height (cm)</label>
                      <input type="number" min={100} max={250} value={form.height_cm} onChange={(e) => set("height_cm", e.target.value)} placeholder="175"
                        className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/60 transition-all" />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Height</label>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <input type="number" min={3} max={8} value={form.height_ft} onChange={(e) => set("height_ft", e.target.value)} placeholder="5"
                            className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/60 transition-all pr-10" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">ft</span>
                        </div>
                        <div className="relative flex-1">
                          <input type="number" min={0} max={11} value={form.height_in} onChange={(e) => set("height_in", e.target.value)} placeholder="10"
                            className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/60 transition-all pr-10" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">in</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Feedback + save */}
                  {error && <div className="flex items-center gap-2.5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl"><AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" /><p className="text-xs text-red-300">{error}</p></div>}
                  {success && <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /><p className="text-xs text-emerald-300">Profile saved successfully.</p></div>}
                  <button type="button" onClick={handleSave} disabled={saving}
                    className="h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" />Save Changes</>}
                  </button>
                </div>
              )}

              {/* ── GOALS TAB ── */}
              {activeTab === "goals" && (
                <div className="glass-card p-6 rounded-2xl flex flex-col gap-5">
                  <h2 className="text-base font-bold text-slate-100">Daily Nutrition Goals</h2>
                  <p className="text-sm text-slate-500 -mt-2">These targets will be used by the Claw Agent when generating your meal plans.</p>

                  {[
                    { key: "calorie_goal", label: "Daily Calories", unit: "kcal", color: "text-orange-400", min: 1200, max: 5000, desc: "Total daily energy intake" },
                    { key: "protein_goal", label: "Protein", unit: "g", color: "text-emerald-400", min: 50, max: 300, desc: "Target grams per day" },
                    { key: "carbs_goal", label: "Carbohydrates", unit: "g", color: "text-amber-400", min: 50, max: 600, desc: "Target grams per day" },
                    { key: "fat_goal", label: "Fat", unit: "g", color: "text-violet-400", min: 20, max: 200, desc: "Target grams per day" },
                  ].map(({ key, label, unit, color, min, max, desc }) => (
                    <div key={key} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-semibold text-slate-200">{label}</label>
                          <p className="text-xs text-slate-600">{desc}</p>
                        </div>
                        <span className={`text-lg font-black ${color}`}>{goals[key as keyof GoalData]}<span className="text-xs text-slate-500 font-normal ml-1">{unit}</span></span>
                      </div>
                      <input type="range" min={min} max={max} step={key === "calorie_goal" ? 50 : 5}
                        value={goals[key as keyof GoalData]}
                        onChange={(e) => setGoals((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="w-full accent-indigo-500 h-2 rounded-full" />
                      <div className="flex justify-between text-[10px] text-slate-700">
                        <span>{min}{unit}</span><span>{max}{unit}</span>
                      </div>
                    </div>
                  ))}

                  {error && <div className="flex items-center gap-2.5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl"><AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" /><p className="text-xs text-red-300">{error}</p></div>}
                  {success && <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /><p className="text-xs text-emerald-300">Goals saved successfully.</p></div>}
                  <button type="button" onClick={handleSave} disabled={saving}
                    className="h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" />Save Goals</>}
                  </button>
                </div>
              )}

              {/* ── INTEGRATIONS TAB ── */}
              {activeTab === "integrations" && (
                <div className="flex flex-col gap-4">

                  {/* Strava success / error banners */}
                  {stravaSuccess && (
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <p className="text-xs text-emerald-300">Strava connected! Your activities have been imported.</p>
                      <button onClick={() => setStravaSuccess(false)} className="ml-auto text-slate-600 hover:text-slate-400"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                  {stravaError && (
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <p className="text-xs text-red-300">{stravaError}</p>
                      <button onClick={() => setStravaError(null)} className="ml-auto text-slate-600 hover:text-slate-400"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                  {stravaNotConfigured && (
                    <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-300 leading-relaxed">
                        <strong>Strava not configured.</strong> Add <code className="font-mono">STRAVA_CLIENT_ID</code> and{" "}
                        <code className="font-mono">STRAVA_CLIENT_SECRET</code> to your Vercel environment variables, then redeploy.
                      </p>
                      <button onClick={() => setStravaNotConfigured(false)} className="ml-auto text-slate-600 hover:text-slate-400 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  )}

                  {/* Strava card */}
                  <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <Image src="/strava.png" alt="Strava" width={28} height={28} className="object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-100">Strava</p>
                      <p className="text-xs text-slate-500 mt-0.5">Sync your activities and performance data</p>
                      <p className={`text-xs font-semibold mt-1 ${stravaAthleteId ? "text-emerald-400" : "text-slate-500"}`}>
                        {stravaAthleteId ? `Connected · Athlete #${stravaAthleteId}` : "Not connected"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {stravaAthleteId && (
                        <button
                          onClick={async () => {
                            setStravaSyncing(true);
                            try {
                              const res = await fetch("/api/strava/sync", { method: "POST" });
                              const d = await res.json();
                              if (res.ok) setStravaSuccess(true);
                              else setStravaError(d.error ?? "Sync failed");
                            } catch { setStravaError("Sync failed"); }
                            finally { setStravaSyncing(false); }
                          }}
                          disabled={stravaSyncing}
                          className="px-3 py-2 rounded-xl text-xs font-semibold border bg-white/[0.04] border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] transition-all disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${stravaSyncing ? "animate-spin" : ""}`} />
                          {stravaSyncing ? "Syncing…" : "Sync Now"}
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          if (stravaAthleteId) {
                            await fetch("/api/strava/disconnect", { method: "DELETE" });
                            setStravaAthleteId(null);
                            setStravaSuccess(false);
                          } else {
                            window.location.href = "/api/strava/connect";
                          }
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                          stravaAthleteId
                            ? "bg-white/[0.04] border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5"
                            : "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500"
                        }`}
                      >
                        {stravaAthleteId ? "Disconnect" : "Connect"}
                      </button>
                    </div>
                  </div>

                  {/* Uber Eats card */}
                  <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-100">Uber Eats</p>
                      <p className="text-xs text-slate-500 mt-0.5">Order macro-matched meals directly from your plan</p>
                      <p className="text-xs font-semibold mt-1 text-slate-500">Not connected</p>
                    </div>
                    <button className="px-4 py-2 rounded-xl text-sm font-semibold border bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 transition-all">
                      Connect
                    </button>
                  </div>

                  <div className="glass-card p-5 rounded-2xl border border-dashed border-white/[0.08]">
                    <p className="text-sm font-semibold text-slate-400">More integrations coming soon</p>
                    <p className="text-xs text-slate-600 mt-1">Garmin, Wahoo, MyFitnessPal, and Apple Health are on the roadmap.</p>
                  </div>
                </div>
              )}

              {/* ── NOTIFICATIONS TAB ── */}
              {activeTab === "notifications" && (
                <div className="glass-card p-6 rounded-2xl flex flex-col gap-4">
                  <h2 className="text-base font-bold text-slate-100">Notification Preferences</h2>

                  {[
                    { key: "email", label: "Email Notifications", desc: "Receive daily meal plan summaries via email" },
                    { key: "push", label: "Push Notifications", desc: "Browser notifications for agent messages" },
                    { key: "weekly", label: "Weekly Report", desc: "Summary of your training and nutrition each Sunday" },
                    { key: "plan", label: "Meal Plan Ready", desc: "Notify me when the agent finishes my meal plan" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-white/[0.06] last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                        className={`relative w-11 h-6 rounded-full transition-all duration-200 ${notifications[key as keyof typeof notifications] ? "bg-indigo-600" : "bg-white/[0.1]"}`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${notifications[key as keyof typeof notifications] ? "left-[22px]" : "left-0.5"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ── BILLING TAB ── */}
              {activeTab === "billing" && (
                <div className="flex flex-col gap-4">
                  {/* Current plan */}
                  <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Current Plan</p>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-black text-slate-100">Free</h2>
                          <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-xs text-slate-400 border border-white/[0.1]">Active</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-100">$0</p>
                        <p className="text-xs text-slate-500">per month</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {["5 meal plans per month", "Strava sync (last 7 days)", "Basic macro tracking", "Community support"].map((f) => (
                        <div key={f} className="flex items-center gap-2 text-sm text-slate-400">
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />{f}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pro plan */}
                  <div className="glass-card p-6 rounded-2xl glow-border relative overflow-hidden">
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25">
                      <Crown className="w-3 h-3 text-indigo-300" />
                      <span className="text-[11px] font-bold text-indigo-300">Most Popular</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-indigo-400" />
                      <p className="text-xs text-indigo-400 uppercase tracking-wider font-semibold">Pro Plan</p>
                    </div>
                    <div className="flex items-end gap-1 mb-4">
                      <span className="text-3xl font-black text-slate-100">$12</span>
                      <span className="text-slate-500 text-sm mb-1">/month</span>
                    </div>
                    <div className="flex flex-col gap-2 mb-5">
                      {["Unlimited meal plans", "Full Strava history sync", "Real-time Claw Agent chat", "Uber Eats cart automation", "Advanced macro analytics", "Priority support"].map((f) => (
                        <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                          <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />{f}
                        </div>
                      ))}
                    </div>
                    <button className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20">
                      Upgrade to Pro
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
