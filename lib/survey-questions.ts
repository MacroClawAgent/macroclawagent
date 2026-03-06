// Survey question configuration for Jonno waitlist survey.
// Add new questions here — the modal reads this config at runtime.

export type QuestionType = "single" | "multi" | "short_text" | "long_text";

export interface ConditionalRule {
  /** Show this question only when the referenced question's answer is NOT this value */
  questionId: string;
  excludeValue: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  helperText?: string;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  showIf?: ConditionalRule;
}

export interface SurveyStep {
  id: string;
  title: string;
  subtitle: string;
  questions: Question[];
}

export const SURVEY_STEPS: SurveyStep[] = [
  // ─────────────────────────────────────────────────
  // STEP 1 · About the user
  // ─────────────────────────────────────────────────
  {
    id: "about",
    title: "About you",
    subtitle: "Help us understand who Jonno is really built for.",
    questions: [
      {
        id: "age_range",
        type: "single",
        label: "What is your age range?",
        options: ["18–24", "25–34", "35–44", "45+"],
        required: true,
      },
      {
        id: "user_type",
        type: "single",
        label: "Which best describes you?",
        options: ["Student", "Full-time employee", "Fitness / gym-focused", "Parent", "Other"],
        required: true,
      },
      {
        id: "primary_goal",
        type: "single",
        label: "What is your primary goal right now?",
        options: [
          "Build muscle",
          "Lose fat",
          "Maintain weight",
          "Eat healthier",
          "Save money on food",
          "Save time",
          "Improve performance / training",
          "Other",
        ],
        required: true,
      },
      {
        id: "exercise_frequency",
        type: "single",
        label: "How many days per week do you usually exercise?",
        options: ["0", "1–2", "3–4", "5–6", "7+"],
        required: true,
      },
    ],
  },

  // ─────────────────────────────────────────────────
  // STEP 2 · Tracking habits
  // ─────────────────────────────────────────────────
  {
    id: "tracking",
    title: "Tracking habits",
    subtitle: "We want to understand how you currently manage nutrition.",
    questions: [
      {
        id: "tracking_habit",
        type: "single",
        label: "Do you currently track calories or macros?",
        options: ["Yes, daily", "Sometimes", "I used to, but stopped", "Never"],
        required: true,
      },
      {
        id: "tracking_app",
        type: "short_text",
        label: "What app do you use to track?",
        helperText: "Only shown when you track or used to track.",
        placeholder: "e.g. MyFitnessPal, Cronometer, MacroFactor…",
        showIf: { questionId: "tracking_habit", excludeValue: "Never" },
      },
      {
        id: "tracking_frustration",
        type: "single",
        label: "What is your biggest frustration with tracking?",
        options: [
          "It takes too long",
          "It feels too manual",
          "It is hard to stay consistent",
          "Macro targets feel confusing",
          "Grocery planning is separate",
          "I do not track",
          "Other",
        ],
        required: true,
      },
      {
        id: "has_paid_for_tracking_app",
        type: "single",
        label: "Have you ever paid for a nutrition or tracking app?",
        options: ["Yes, subscription", "Yes, one-time purchase", "No"],
        required: true,
      },
      {
        id: "confidence_in_targets",
        type: "single",
        label: "How confident are you that your calorie or macro targets are right for you?",
        options: ["Very confident", "Somewhat confident", "Not very confident", "Not sure at all"],
        required: true,
      },
    ],
  },

  // ─────────────────────────────────────────────────
  // STEP 3 · Meal planning + grocery habits
  // ─────────────────────────────────────────────────
  {
    id: "grocery",
    title: "Meal planning & groceries",
    subtitle: "Tell us about how you shop and plan your meals.",
    questions: [
      {
        id: "weekly_grocery_spend",
        type: "single",
        label: "Roughly how much do you spend on groceries each week?",
        options: ["Under $80", "$80–$120", "$120–$180", "$180+"],
        required: true,
      },
      {
        id: "meal_planning_habit",
        type: "single",
        label: "Do you usually plan meals before grocery shopping?",
        options: ["Yes, every week", "Sometimes", "No"],
        required: true,
      },
      {
        id: "grocery_shopping_mode",
        type: "single",
        label: "How do you usually shop for groceries?",
        options: ["In-store only", "Mostly in-store", "Mostly online", "Fully online"],
        required: true,
      },
      {
        id: "overspend_frequency",
        type: "single",
        label: "Do you ever overspend because you did not plan properly?",
        options: ["Often", "Sometimes", "Rarely", "Never"],
        required: true,
      },
      {
        id: "off_goal_food_frequency",
        type: "single",
        label: "How often do you buy food that does not match your nutrition goals?",
        options: ["Very often", "Sometimes", "Rarely", "Never"],
        required: true,
      },
      {
        id: "grocery_annoyance",
        type: "single",
        label: "What is most annoying about grocery shopping for your goals?",
        options: [
          "Choosing what to buy",
          "Comparing prices",
          "Matching food to macros",
          "Planning meals",
          "Sticking to budget",
          "Time spent shopping",
          "Other",
        ],
        required: true,
      },
    ],
  },

  // ─────────────────────────────────────────────────
  // STEP 4 · Product pain points
  // ─────────────────────────────────────────────────
  {
    id: "pain_points",
    title: "Your pain points",
    subtitle: "Where does the current system fall apart for you?",
    questions: [
      {
        id: "disconnected_area",
        type: "single",
        label: "What feels the most disconnected right now?",
        options: [
          "Tracking macros",
          "Planning meals",
          "Budgeting groceries",
          "Adjusting calories weekly",
          "Staying consistent",
          "All of it",
        ],
        required: true,
      },
      {
        id: "automation_preferences",
        type: "multi",
        label: "Which parts of the process would you most want automated?",
        helperText: "Select all that apply.",
        options: [
          "Building meal plans",
          "Adjusting calories / macros",
          "Grocery list creation",
          "Budget optimisation",
          "Meal suggestions",
          "Tracking simplification",
          "Price comparison",
          "Reordering groceries",
        ],
        required: true,
      },
      {
        id: "fall_off_reason",
        type: "single",
        label: "What usually causes you to fall off track?",
        options: [
          "Lack of time",
          "Motivation drops",
          "Grocery costs",
          "Meal planning effort",
          "Tracking effort",
          "Social events / eating out",
          "Not seeing results",
          "Other",
        ],
        required: true,
      },
    ],
  },

  // ─────────────────────────────────────────────────
  // STEP 5 · Interest in Jonno
  // ─────────────────────────────────────────────────
  {
    id: "jonno_interest",
    title: "Interest in Jonno",
    subtitle: "Let's understand what excites you most about this.",
    questions: [
      {
        id: "ai_interest",
        type: "single",
        label:
          "If AI could build your weekly meal plan, adjust calories automatically, generate your grocery list, and optimise for your budget — would you use it?",
        options: ["Yes, immediately", "Maybe", "Probably not"],
        required: true,
      },
      {
        id: "top_value_prop",
        type: "single",
        label: "Which Jonno value proposition matters most to you?",
        options: [
          "Saves me time",
          "Saves me money",
          "Helps me hit physique or fitness goals",
          "Makes nutrition easier",
          "Connects planning with grocery shopping",
          "Makes tracking more automatic",
        ],
        required: true,
      },
      {
        id: "try_triggers",
        type: "multi",
        label: "What would make you most likely to try Jonno?",
        helperText: "Select all that apply.",
        options: [
          "Saves me time",
          "Saves me money",
          "Helps me hit physique or fitness goals",
          "Makes tracking more automatic",
          "Connects directly to grocery shopping",
          "Gives me personalised meal plans",
          "Other",
        ],
        required: true,
      },
      {
        id: "grocery_integration_importance",
        type: "single",
        label: "How important is grocery integration to you?",
        options: ["Extremely important", "Pretty important", "Nice to have", "Not important"],
        required: true,
      },
      {
        id: "grocery_delivery_interest",
        type: "single",
        label: "Would you want Jonno to connect directly to grocery stores or delivery services?",
        options: ["Yes", "Maybe", "No"],
        required: true,
      },
    ],
  },

  // ─────────────────────────────────────────────────
  // STEP 6 · Pricing + early adopter signal
  // ─────────────────────────────────────────────────
  {
    id: "pricing",
    title: "Pricing & early access",
    subtitle: "Help us get the pricing model right from day one.",
    questions: [
      {
        id: "willingness_to_pay",
        type: "single",
        label: "Would you pay $10–$20/month for an AI nutrition system that combines tracking and groceries?",
        options: ["Yes", "Maybe", "No"],
        required: true,
      },
      {
        id: "too_expensive_threshold",
        type: "single",
        label: "At what monthly price would Jonno start to feel too expensive?",
        options: ["Under $10", "$10–$15", "$15–$20", "$20–$30", "$30+"],
        required: true,
      },
      {
        id: "beta_interest",
        type: "single",
        label: "Would you be interested in being an early beta user and giving feedback?",
        options: ["Yes", "Maybe", "No"],
        required: true,
      },
      {
        id: "must_get_right",
        type: "long_text",
        label: "If there was one thing Jonno absolutely had to get right for you to use it, what would it be?",
        placeholder: "Be honest — this directly shapes what we build first…",
      },
    ],
  },

  // ─────────────────────────────────────────────────
  // STEP 7 · Final
  // ─────────────────────────────────────────────────
  {
    id: "final",
    title: "One last thing",
    subtitle: "Completely optional — but we read every single response.",
    questions: [
      {
        id: "extra_feedback",
        type: "long_text",
        label: "Anything else you wish nutrition or grocery apps did better?",
        placeholder: "Vent away — we're listening…",
      },
    ],
  },
];
