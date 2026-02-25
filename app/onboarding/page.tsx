"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  User,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";

type Gender = "male" | "female" | "other" | "prefer_not_to_say";
type Unit = "metric" | "imperial";

interface FormData {
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

const TOTAL_STEPS = 3;

const genderOptions: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [form, setForm] = useState<FormData>({
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

  const set = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Redirect away if profile is already complete (or if not logged in)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const check = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }
        const { data: profile } = await supabase
          .from("users")
          .select("profile_complete")
          .eq("id", user.id)
          .single();
        if (profile?.profile_complete) router.push("/dashboard");
      } catch { /* ignore */ }
    };
    check();
  }, [router]);

  // Weight in kg (store as kg regardless of unit)
  const weightKg =
    form.unit === "imperial"
      ? parseFloat(form.weight) * 0.453592
      : parseFloat(form.weight);

  // Height in cm
  const heightCm =
    form.unit === "imperial"
      ? parseInt(form.height_ft || "0") * 30.48 + parseInt(form.height_in || "0") * 2.54
      : parseFloat(form.height_cm);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please drop an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);

    try {
      let avatar_url = "";

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

      const payload: Record<string, unknown> = {
        full_name: form.full_name,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        weight_kg: form.weight ? weightKg : null,
        height_cm: (form.height_cm || form.height_ft) ? heightCm : null,
        unit_preference: form.unit,
        profile_complete: true,
      };
      if (avatar_url) payload.avatar_url = avatar_url;

      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save profile");
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  };

  const canProceedStep1 = form.full_name.trim().length >= 2;
  const canProceedStep2 =
    form.unit === "metric"
      ? form.weight.trim() && form.height_cm.trim()
      : form.weight.trim() && form.height_ft.trim();

  return (
    <div className="min-h-screen bg-[#08090D] flex flex-col items-center justify-center px-6 py-12">
      {/* Decorative orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-900/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-violet-900/08 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="text-3xl">🦀</span>
          <h1 className="text-2xl font-black text-slate-100 mt-3 tracking-tight">
            Let&apos;s set up your profile
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full overflow-hidden bg-white/[0.07]"
            >
              <motion.div
                className="h-full bg-indigo-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: i < step ? "100%" : "0%" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <AnimatePresence mode="wait">
            {/* STEP 1 — Identity */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5"
              >
                <div>
                  <h2 className="text-lg font-bold text-slate-100 mb-1">Tell us about you</h2>
                  <p className="text-slate-500 text-sm">We&apos;ll personalise your experience.</p>
                </div>

                {/* Full name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Full Name
                  </label>
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
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Date of Birth <span className="text-slate-600 normal-case font-normal">(optional)</span>
                  </label>
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
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Gender <span className="text-slate-600 normal-case font-normal">(optional)</span>
                  </label>
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
              </motion.div>
            )}

            {/* STEP 2 — Body Metrics */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5"
              >
                <div>
                  <h2 className="text-lg font-bold text-slate-100 mb-1">Body metrics</h2>
                  <p className="text-slate-500 text-sm">Used to calculate your calorie targets.</p>
                </div>

                {/* Unit toggle */}
                <div className="flex rounded-xl bg-white/[0.05] p-1 gap-1">
                  {(["metric", "imperial"] as Unit[]).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => {
                        set("unit", u);
                        set("weight", "");
                        set("height_cm", "");
                        set("height_ft", "");
                        set("height_in", "");
                      }}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        form.unit === u
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {u === "metric" ? "Metric (kg / cm)" : "Imperial (lbs / ft)"}
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
                    max={form.unit === "metric" ? 300 : 660}
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
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Height (cm)
                    </label>
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
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Height
                    </label>
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
              </motion.div>
            )}

            {/* STEP 3 — Profile Photo */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5"
              >
                <div>
                  <h2 className="text-lg font-bold text-slate-100 mb-1">Profile photo</h2>
                  <p className="text-slate-500 text-sm">Optional. JPG, PNG or WEBP, max 5MB.</p>
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="relative cursor-pointer rounded-2xl border-2 border-dashed border-white/10 hover:border-indigo-500/40 transition-all duration-200 overflow-hidden"
                  style={{ minHeight: 200 }}
                >
                  {avatarPreview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatarPreview}
                        alt="Preview"
                        className="w-full h-56 object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAvatarPreview(null);
                          setAvatarFile(null);
                        }}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/[0.05] flex items-center justify-center">
                        <Upload className="w-7 h-7 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-300">
                          Drop an image here, or click to browse
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          JPG, PNG, WEBP · max 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!isSupabaseConfigured() && (
                  <p className="text-xs text-amber-400/80 text-center">
                    Photo upload requires Supabase to be configured.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-xs text-red-400 text-center"
            >
              {error}
            </motion.p>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center gap-3 mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => { setStep((s) => s - 1); setError(null); }}
                className="h-12 px-5 rounded-xl border border-white/10 text-sm font-medium text-slate-400 hover:text-slate-200 hover:border-white/20 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                onClick={() => { setStep((s) => s + 1); setError(null); }}
                className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Complete Setup
                  </>
                )}
              </button>
            )}
          </div>

          {/* Skip on step 3 */}
          {step === TOTAL_STEPS && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="w-full mt-3 text-xs text-slate-600 hover:text-slate-400 transition-colors flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              Skip photo for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
