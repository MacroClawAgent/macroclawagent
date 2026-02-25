"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

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

const genderOptions: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [form, setForm] = useState<ProfileData>({
    full_name: "",
    date_of_birth: "",
    gender: "",
    weight: "",
    height_cm: "",
    height_ft: "",
    height_in: "",
    unit: "metric",
    avatar_url: "",
  });

  const set = (field: keyof ProfileData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Load current profile
  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return; }
    const load = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }

        const { data } = await supabase
          .from("users")
          .select("full_name, date_of_birth, gender, weight_kg, height_cm, unit_preference, avatar_url")
          .eq("id", user.id)
          .single();

        if (data) {
          const isImperial = data.unit_preference === "imperial";
          setForm({
            full_name: data.full_name ?? "",
            date_of_birth: data.date_of_birth ?? "",
            gender: (data.gender as Gender) ?? "",
            weight: data.weight_kg
              ? isImperial
                ? (data.weight_kg / 0.453592).toFixed(1)
                : data.weight_kg.toString()
              : "",
            height_cm: data.height_cm && !isImperial ? data.height_cm.toString() : "",
            height_ft: data.height_cm && isImperial ? Math.floor(data.height_cm / 30.48).toString() : "",
            height_in: data.height_cm && isImperial ? Math.round((data.height_cm % 30.48) / 2.54).toString() : "",
            unit: isImperial ? "imperial" : "metric",
            avatar_url: data.avatar_url ?? "",
          });
          if (data.avatar_url) setAvatarPreview(data.avatar_url);
        }
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const weightKg =
    form.unit === "imperial"
      ? parseFloat(form.weight) * 0.453592
      : parseFloat(form.weight);

  const heightCm =
    form.unit === "imperial"
      ? parseInt(form.height_ft || "0") * 30.48 + parseInt(form.height_in || "0") * 2.54
      : parseFloat(form.height_cm);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB"); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      let avatar_url = form.avatar_url;

      if (isSupabaseConfigured() && avatarFile) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const ext = avatarFile.name.split(".").pop();
          const path = `${user.id}/avatar.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(path, avatarFile, { upsert: true });
          if (!uploadError) {
            const { data } = supabase.storage.from("avatars").getPublicUrl(path);
            avatar_url = data.publicUrl;
          }
        }
      }

      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          date_of_birth: form.date_of_birth || null,
          gender: form.gender || null,
          weight_kg: form.weight ? weightKg : null,
          height_cm: (form.height_cm || form.height_ft) ? heightCm : null,
          unit_preference: form.unit,
          avatar_url,
          profile_complete: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090D] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090D]">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#08090D]/80 border-b border-white/[0.07]">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <span className="font-semibold text-slate-100 text-sm">Edit Profile</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card p-8 flex flex-col gap-6"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-24 h-24 rounded-2xl object-cover border border-white/10"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setAvatarPreview(null); setAvatarFile(null); set("avatar_url", ""); }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center group-hover:border-indigo-500/60 transition-colors">
                  <Upload className="w-7 h-7 text-indigo-400" />
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500">Click to change photo · max 5MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="h-px bg-white/[0.07]" />

          {/* Full name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              placeholder="Jane Doe"
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/60 transition-all"
            />
          </div>

          {/* Date of birth */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Date of Birth</label>
            <input
              type="date"
              value={form.date_of_birth}
              onChange={(e) => set("date_of_birth", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-slate-100 outline-none focus:border-indigo-500/60 transition-all [color-scheme:dark]"
            />
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Gender</label>
            <div className="grid grid-cols-2 gap-2">
              {genderOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("gender", opt.value)}
                  className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    form.gender === opt.value
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-white/[0.04] border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/[0.07]" />

          {/* Unit toggle */}
          <div className="flex rounded-xl bg-white/[0.05] p-1 gap-1">
            {(["metric", "imperial"] as Unit[]).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => set("unit", u)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  form.unit === u
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {u === "metric" ? "Metric" : "Imperial"}
              </button>
            ))}
          </div>

          {/* Weight */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Weight ({form.unit === "metric" ? "kg" : "lbs"})
            </label>
            <input
              type="number"
              min={20}
              step={0.1}
              value={form.weight}
              onChange={(e) => set("weight", e.target.value)}
              placeholder={form.unit === "metric" ? "70.0" : "154"}
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/60 transition-all"
            />
          </div>

          {/* Height */}
          {form.unit === "metric" ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Height (cm)</label>
              <input
                type="number"
                min={100}
                max={250}
                value={form.height_cm}
                onChange={(e) => set("height_cm", e.target.value)}
                placeholder="175"
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/60 transition-all"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Height</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min={3}
                    max={8}
                    value={form.height_ft}
                    onChange={(e) => set("height_ft", e.target.value)}
                    placeholder="5"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/60 transition-all pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">ft</span>
                </div>
                <div className="relative flex-1">
                  <input
                    type="number"
                    min={0}
                    max={11}
                    value={form.height_in}
                    onChange={(e) => set("height_in", e.target.value)}
                    placeholder="10"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/60 transition-all pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">in</span>
                </div>
              </div>
            </div>
          )}

          {/* Feedback */}
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <p className="text-xs text-emerald-300">Profile saved successfully.</p>
            </div>
          )}

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </motion.div>
      </main>
    </div>
  );
}
