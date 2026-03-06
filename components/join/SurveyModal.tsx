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
      className={`
        group relative flex items-center gap-2.5 w-full px-4 py-3 rounded-xl border text-sm font-medium text-left
        transition-all duration-150 cursor-pointer
        ${
          selected
            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100"
            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
        }
      `}
    >
      {/* Check indicator */}
      <span
        className={`
          flex-shrink-0 w-4.5 h-4.5 w-[18px] h-[18px] rounded-${multi ? "sm" : "full"} border-2 flex items-center justify-center transition-all duration-150
          ${selected ? "border-blue-500 bg-blue-500" : "border-gray-300 bg-white"}
        `}
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
}: {
  question: Question;
  answers: Answers;
  onSingle: (id: string, val: string) => void;
  onMultiToggle: (id: string, val: string) => void;
  onText: (id: string, val: string) => void;
}) {
  const value = answers[question.id];
  const selectedArr = Array.isArray(value) ? value : [];
  const selectedStr = typeof value === "string" ? value : "";

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold text-gray-900 leading-snug">{question.label}</p>
        {question.helperText && (
          <p className="text-xs text-gray-400 mt-0.5">{question.helperText}</p>
        )}
      </div>

      {/* Single select */}
      {question.type === "single" && question.options && (
        <div className="flex flex-col gap-2">
          {question.options.map((opt) => (
            <OptionPill
              key={opt}
              label={opt}
              selected={selectedStr === opt}
              onClick={() => onSingle(question.id, opt)}
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
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-150"
        />
      )}

      {/* Long text */}
      {question.type === "long_text" && (
        <textarea
          value={selectedStr}
          onChange={(e) => onText(question.id, e.target.value)}
          placeholder={question.placeholder}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-150 resize-none"
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
            className="relative z-10 w-full max-w-xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-100">
              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-400 tabular-nums whitespace-nowrap">
                  {submitted ? "Done" : `${stepIndex + 1} / ${totalSteps}`}
                </span>
              </div>

              {/* Step label + close button */}
              <div className="flex items-start justify-between gap-4">
                {!submitted && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-0.5">
                      Step {stepIndex + 1} — {currentStep.id.replace(/_/g, " ")}
                    </p>
                    <h2 className="text-xl font-black text-gray-900 leading-tight">
                      {currentStep.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">{currentStep.subtitle}</p>
                  </div>
                )}
                {/* Close button — always visible */}
                {!submitted && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors duration-150"
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
                      className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </motion.div>

                    <div>
                      <div className="flex items-center justify-center gap-1.5 mb-3">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
                          Survey complete
                        </span>
                        <Sparkles className="w-4 h-4 text-amber-400" />
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 leading-tight mb-2">
                        Thank you — you&apos;re shaping Jonno.
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                        Every response directly influences what we build. You&apos;re entered into
                        the <strong className="text-gray-700">$200 gift card draw</strong> at
                        launch. We&apos;ll be in touch.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 w-full text-left bg-gray-50 border border-gray-200 rounded-2xl p-4">
                      {[
                        "Your responses have been saved",
                        "You're entered in the $200 draw",
                        "Beta access waiting for you at launch",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <p className="text-sm text-gray-600">{item}</p>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={onClose}
                      className="px-8 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold transition-colors duration-150"
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
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Footer navigation ── */}
            {!submitted && (
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-white">
                {/* Back */}
                <button
                  type="button"
                  onClick={goBack}
                  disabled={stepIndex === 0}
                  className={`
                    flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
                    ${
                      stepIndex === 0
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                {/* Skip (only on non-required steps, e.g. last step) */}
                {stepIndex === totalSteps - 1 && !isStepValid && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors duration-150 underline underline-offset-2"
                  >
                    Skip & finish
                  </button>
                )}

                {/* Next / Submit */}
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!isStepValid || submitting}
                  className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 ml-auto
                    ${
                      isStepValid && !submitting
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }
                  `}
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
