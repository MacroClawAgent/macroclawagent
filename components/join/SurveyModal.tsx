"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, CheckCircle2, Check, Sparkles, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SURVEY_STEPS } from "@/lib/survey-questions";
import type { Question } from "@/lib/survey-questions";

// ─── Types ────────────────────────────────────────────────────────────────────

type Answers = Record<string, string | string[]>;

interface SurveyModalProps {
  isOpen: boolean;
  /** Called when the user closes the modal without completing */
  onClose: () => void;
  /** Called after the survey is successfully submitted */
  onComplete: () => void;
  /** Pre-fill from waitlist signup so we can link the records */
  waitlistEmail?: string;
}

// ─── Animation variants ───────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 48 : -48,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -48 : 48,
    opacity: 0,
  }),
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Pill button used for single / multi select options */
function OptionPill({
  label,
  selected,
  onClick,
  multi,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex items-center gap-2.5 w-full px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all duration-150 cursor-pointer"
      style={selected
        ? { borderColor: "#F29A69", backgroundColor: "rgba(242,154,105,0.08)", color: "#C4693A", boxShadow: "0 1px 4px rgba(242,154,105,0.15)" }
        : { borderColor: "#CFC7C2", backgroundColor: "#FFFDFB", color: "#4A454A" }
      }
    >
      {/* Check indicator */}
      <span
        className={`flex-shrink-0 w-[18px] h-[18px] rounded-${multi ? "sm" : "full"} border-2 flex items-center justify-center transition-all duration-150`}
        style={selected
          ? { borderColor: "#F29A69", backgroundColor: "#F29A69" }
          : { borderColor: "#CFC7C2", backgroundColor: "#FFFDFB" }
        }
      >
        {selected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
      </span>
      <span className="flex-1 leading-snug">{label}</span>
    </button>
  );
}

/** Renders a single question based on its type */
function QuestionBlock({
  question,
  answers,
  onSingle,
  onMultiToggle,
  onText,
  onAutoAdvance,
}: {
  question: Question;
  answers: Answers;
  onSingle: (id: string, val: string) => void;
  onMultiToggle: (id: string, val: string) => void;
  onText: (id: string, val: string) => void;
  /** Called after a single-select answer so the step can auto-advance when ready */
  onAutoAdvance?: () => void;
}) {
  const value = answers[question.id];
  const selectedArr = Array.isArray(value) ? value : [];
  const selectedStr = typeof value === "string" ? value : "";

  const handleSinglePick = (id: string, val: string) => {
    onSingle(id, val);
    // Auto-advance: brief delay so the selection highlight is visible first
    if (onAutoAdvance) setTimeout(onAutoAdvance, 340);
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-base font-bold leading-snug" style={{ color: "#4A454A" }}>{question.label}</p>
        {question.helperText && (
          <p className="text-xs mt-1" style={{ color: "#7C7472" }}>{question.helperText}</p>
        )}
      </div>

      {/* Single select — auto-advances on pick */}
      {question.type === "single" && question.options && (
        <div className="flex flex-col gap-2">
          {question.options.map((opt) => (
            <OptionPill
              key={opt}
              label={opt}
              selected={selectedStr === opt}
              onClick={() => handleSinglePick(question.id, opt)}
            />
          ))}
        </div>
      )}

      {/* Multi select */}
      {question.type === "multi" && question.options && (
        <div className="flex flex-col gap-2">
          {question.options.map((opt) => (
            <OptionPill
              key={opt}
              label={opt}
              selected={selectedArr.includes(opt)}
              onClick={() => onMultiToggle(question.id, opt)}
              multi
            />
          ))}
        </div>
      )}

      {/* Short text */}
      {question.type === "short_text" && (
        <input
          type="text"
          value={selectedStr}
          onChange={(e) => onText(question.id, e.target.value)}
          placeholder={question.placeholder}
          className="w-full px-4 py-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all duration-150"
          style={{ borderColor: "#CFC7C2", backgroundColor: "#FFFDFB", color: "#4A454A" }}
          onFocus={e => { e.currentTarget.style.borderColor = "#F29A69"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(242,154,105,0.15)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "#CFC7C2"; e.currentTarget.style.boxShadow = "none"; }}
        />
      )}

      {/* Long text */}
      {question.type === "long_text" && (
        <textarea
          value={selectedStr}
          onChange={(e) => onText(question.id, e.target.value)}
          placeholder={question.placeholder}
          rows={4}
          className="w-full px-4 py-3.5 rounded-xl border text-sm focus:outline-none transition-all duration-150 resize-none"
          style={{ borderColor: "#CFC7C2", backgroundColor: "#FFFDFB", color: "#4A454A" }}
          onFocus={e => { e.currentTarget.style.borderColor = "#F29A69"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(242,154,105,0.15)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "#CFC7C2"; e.currentTarget.style.boxShadow = "none"; }}
        />
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function SurveyModal({ isOpen, onClose, onComplete, waitlistEmail }: SurveyModalProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const totalSteps = SURVEY_STEPS.length;
  const currentStep = SURVEY_STEPS[stepIndex];

  // Apply conditional show/hide logic within the current step
  const visibleQuestions = currentStep.questions.filter((q) => {
    if (!q.showIf) return true;
    const ans = answers[q.showIf.questionId];
    // If the referenced answer equals the excludeValue, hide this question
    return ans !== q.showIf.excludeValue;
  });

  // Validation: all required+visible questions must have a non-empty answer
  const isStepValid = visibleQuestions
    .filter((q) => q.required)
    .every((q) => {
      const ans = answers[q.id];
      if (Array.isArray(ans)) return ans.length > 0;
      return Boolean(ans && String(ans).trim());
    });

  // Auto-advance is enabled when the step has exactly one visible single-select question
  // (multi-question steps always require the explicit Next button)
  const autoAdvanceEnabled =
    visibleQuestions.length === 1 && visibleQuestions[0].type === "single";

  // Progress: 0–100 across steps (submitted = 100)
  const progress = submitted ? 100 : Math.round((stepIndex / totalSteps) * 100);

  // ── Answer handlers ────────────────────────────────────────────────────────

  const handleSingle = useCallback((id: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  }, []);

  const handleMultiToggle = useCallback((id: string, val: string) => {
    setAnswers((prev) => {
      const current = (prev[id] as string[]) ?? [];
      return {
        ...prev,
        [id]: current.includes(val) ? current.filter((v) => v !== val) : [...current, val],
      };
    });
  }, []);

  const handleText = useCallback((id: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  }, []);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const scrollToTop = () => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  };

  const goNext = async () => {
    if (stepIndex < totalSteps - 1) {
      setDirection(1);
      setStepIndex((i) => i + 1);
      scrollToTop();
    } else {
      await handleSubmit();
    }
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setDirection(-1);
      setStepIndex((i) => i - 1);
      scrollToTop();
    }
  };

  // ── Supabase submit ────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const client = createClient();

      const payload = {
        waitlist_email: waitlistEmail ?? null,
        completed: true,
        // Step 1
        age_range: (answers.age_range as string) || null,
        user_type: (answers.user_type as string) || null,
        primary_goal: (answers.primary_goal as string) || null,
        exercise_frequency: (answers.exercise_frequency as string) || null,
        // Step 2
        tracking_habit: (answers.tracking_habit as string) || null,
        tracking_app: (answers.tracking_app as string) || null,
        tracking_frustration: (answers.tracking_frustration as string) || null,
        has_paid_for_tracking_app: (answers.has_paid_for_tracking_app as string) || null,
        confidence_in_targets: (answers.confidence_in_targets as string) || null,
        // Step 3
        weekly_grocery_spend: (answers.weekly_grocery_spend as string) || null,
        meal_planning_habit: (answers.meal_planning_habit as string) || null,
        grocery_shopping_mode: (answers.grocery_shopping_mode as string) || null,
        overspend_frequency: (answers.overspend_frequency as string) || null,
        off_goal_food_frequency: (answers.off_goal_food_frequency as string) || null,
        grocery_annoyance: (answers.grocery_annoyance as string) || null,
        // Step 4
        disconnected_area: (answers.disconnected_area as string) || null,
        automation_preferences: (answers.automation_preferences as string[]) || [],
        fall_off_reason: (answers.fall_off_reason as string) || null,
        // Step 5
        ai_interest: (answers.ai_interest as string) || null,
        top_value_prop: (answers.top_value_prop as string) || null,
        try_triggers: (answers.try_triggers as string[]) || [],
        grocery_integration_importance: (answers.grocery_integration_importance as string) || null,
        grocery_delivery_interest: (answers.grocery_delivery_interest as string) || null,
        // Step 6
        willingness_to_pay: (answers.willingness_to_pay as string) || null,
        too_expensive_threshold: (answers.too_expensive_threshold as string) || null,
        beta_interest: (answers.beta_interest as string) || null,
        must_get_right: (answers.must_get_right as string) || null,
        // Step 7
        extra_feedback: (answers.extra_feedback as string) || null,
      };

      const { error } = await client.from("survey_responses").insert(payload);
      if (error) {
        // Log but don't block — still show thank-you so user isn't penalised
        console.error("[Jonno] Survey insert error:", error.message);
      }
    } catch (err) {
      console.error("[Jonno] Survey submit exception:", err);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
      onComplete();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        // Backdrop
        <motion.div
          key="survey-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          // Click outside to close
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitted) onClose();
          }}
        >
          {/* Dimmed background */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative z-10 w-full max-w-xl rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            style={{ backgroundColor: "#FFFDFB" }}
            style={{ maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className="flex-shrink-0 px-6 pt-6 pb-4" style={{ borderBottom: "1px solid #E8DDD8" }}>
              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(239,217,204,0.5)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: "#F29A69" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <span className="text-xs font-semibold tabular-nums whitespace-nowrap" style={{ color: "#7C7472" }}>
                  {submitted ? "Done" : `${stepIndex + 1} / ${totalSteps}`}
                </span>
              </div>

              {/* Step label + close button */}
              <div className="flex items-start justify-between gap-4">
                {!submitted && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "#F29A69" }}>
                      Step {stepIndex + 1} — {currentStep.id.replace(/_/g, " ")}
                    </p>
                    <h2 className="text-xl font-black leading-tight" style={{ color: "#4A454A" }}>
                      {currentStep.title}
                    </h2>
                    <p className="text-sm mt-0.5" style={{ color: "#7C7472" }}>{currentStep.subtitle}</p>
                  </div>
                )}
                {/* Close button — always visible */}
                {!submitted && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150"
                    style={{ backgroundColor: "#FAF4EF", color: "#7C7472" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#EFD9CC")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#FAF4EF")}
                    aria-label="Close survey"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* ── Scrollable content ── */}
            <div ref={contentRef} className="flex-1 overflow-y-auto overscroll-contain">
              <AnimatePresence mode="wait" custom={direction}>
                {submitted ? (
                  /* Thank-you state */
                  <motion.div
                    key="thankyou"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 280, damping: 22 }}
                    className="flex flex-col items-center text-center gap-6 px-8 py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "rgba(242,154,105,0.10)", border: "1px solid rgba(242,154,105,0.30)" }}
                    >
                      <CheckCircle2 className="w-10 h-10" style={{ color: "#F29A69" }} />
                    </motion.div>

                    <div>
                      <div className="flex items-center justify-center gap-1.5 mb-3">
                        <Sparkles className="w-4 h-4" style={{ color: "#F29A69" }} />
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#F29A69" }}>
                          Survey complete
                        </span>
                        <Sparkles className="w-4 h-4" style={{ color: "#F29A69" }} />
                      </div>
                      <h3 className="text-2xl font-black leading-tight mb-2" style={{ color: "#4A454A" }}>
                        Thank you — you&apos;re shaping Jonno.
                      </h3>
                      <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "#7C7472" }}>
                        Every response directly influences what we build. You&apos;re entered into
                        the <strong style={{ color: "#4A454A" }}>$200 gift card draw</strong> at
                        launch. We&apos;ll be in touch.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 w-full text-left rounded-2xl p-4" style={{ backgroundColor: "#FAF4EF", border: "1px solid #E8DDD8" }}>
                      {[
                        "Your responses have been saved",
                        "You're entered in the $200 draw",
                        "Beta access waiting for you at launch",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#F29A69" }} />
                          <p className="text-sm" style={{ color: "#7C7472" }}>{item}</p>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={onClose}
                      className="px-8 py-3 rounded-full text-white text-sm font-bold transition-all duration-150"
                      style={{ background: "linear-gradient(135deg, #F29A69 0%, #E88367 100%)", boxShadow: "0 4px 16px rgba(242,154,105,0.30)" }}
                    >
                      Close
                    </button>
                  </motion.div>
                ) : (
                  /* Question step */
                  <motion.div
                    key={stepIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="px-6 py-6 flex flex-col gap-6"
                  >
                    {visibleQuestions.map((question) => (
                      <QuestionBlock
                        key={question.id}
                        question={question}
                        answers={answers}
                        onSingle={handleSingle}
                        onMultiToggle={handleMultiToggle}
                        onText={handleText}
                        onAutoAdvance={autoAdvanceEnabled ? goNext : undefined}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Footer navigation ── */}
            {!submitted && (
              <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between gap-3" style={{ borderTop: "1px solid #E8DDD8", backgroundColor: "#FFFDFB" }}>
                {/* Back */}
                <button
                  type="button"
                  onClick={goBack}
                  disabled={stepIndex === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
                  style={stepIndex === 0
                    ? { color: "#CFC7C2", cursor: "not-allowed" }
                    : { color: "#7C7472" }
                  }
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                {/* Skip (only on non-required steps, e.g. last step) */}
                {stepIndex === totalSteps - 1 && !isStepValid && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="text-sm transition-colors duration-150 underline underline-offset-2"
                    style={{ color: "#7C7472" }}
                  >
                    Skip & finish
                  </button>
                )}

                {/* Next / Submit */}
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!isStepValid || submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 ml-auto"
                  style={isStepValid && !submitting
                    ? { background: "linear-gradient(135deg, #F29A69 0%, #E88367 100%)", color: "white", boxShadow: "0 4px 12px rgba(242,154,105,0.30)" }
                    : { backgroundColor: "#FAF4EF", color: "#CFC7C2", cursor: "not-allowed" }
                  }
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving…
                    </>
                  ) : stepIndex === totalSteps - 1 ? (
                    "Submit →"
                  ) : (
                    "Next →"
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
