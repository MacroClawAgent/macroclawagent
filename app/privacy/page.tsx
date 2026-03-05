import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-16">
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6">
            {/* Header */}
            <div className="mb-12">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Legal</p>
              <h1 className="text-4xl font-black text-gray-900 mb-3">Privacy Policy</h1>
              <p className="text-sm text-gray-500">Last updated: February 18, 2026</p>
            </div>

            <div className="light-card p-8 md:p-12 prose-legal">
              <p className="text-gray-600 leading-relaxed mb-8">
                Jonno (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, and protect your information when you
                use our service at macroclawagent.com and any related applications (the &ldquo;Service&rdquo;).
              </p>

              <section className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>

                <h3 className="text-base font-semibold text-gray-800 mb-2">Account Information</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  When you create an account, we collect your email address and, optionally, your
                  full name, date of birth, gender, body weight, height, and a profile photo. This
                  information is stored in Supabase, our database and authentication provider.
                </p>

                <h3 className="text-base font-semibold text-gray-800 mb-2">Strava Activity Data</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  If you connect your Strava account, we access your activity data via the Strava
                  OAuth API. This includes activity type, duration, distance, average heart rate,
                  and estimated calorie burn. We use this data to calculate your daily TDEE and
                  personalise your macro targets. We do not access your private notes, saved routes,
                  or social activity on Strava. You can disconnect Strava at any time from your
                  account settings.
                </p>

                <h3 className="text-base font-semibold text-gray-800 mb-2">Meal and Nutrition Data</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We store the meals you log, including food items, portion sizes, and macro data.
                  This is used to track your daily nutrition and provide personalised AI recommendations.
                </p>

                <h3 className="text-base font-semibold text-gray-800 mb-2">AI Interaction Data</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  When you interact with the Jonno Agent, your messages and our responses are processed
                  via the Anthropic Claude API. Anthropic processes this data to generate responses.
                  According to Anthropic&apos;s API terms, content sent via the API is not used to train
                  their models by default. Please review{" "}
                  <a href="https://www.anthropic.com/legal/privacy" className="text-blue-600 hover:text-blue-500 transition-colors" target="_blank" rel="noopener noreferrer">
                    Anthropic&apos;s Privacy Policy
                  </a>{" "}
                  for full details.
                </p>

                <h3 className="text-base font-semibold text-gray-800 mb-2">Uber Eats / Delivery Data</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  When you use the Uber Eats cart builder, we access restaurant menu data and
                  availability via the Uber Direct API. We do not store your Uber account credentials,
                  payment information, or order history. Cart data is transient and used only to
                  facilitate the meal recommendation. Review{" "}
                  <a href="https://www.uber.com/legal/en/document/?name=privacy-notice" className="text-blue-600 hover:text-blue-500 transition-colors" target="_blank" rel="noopener noreferrer">
                    Uber&apos;s Privacy Policy
                  </a>{" "}
                  for their data practices.
                </p>

                <h3 className="text-base font-semibold text-gray-800 mb-2">Usage Data</h3>
                <p className="text-gray-600 leading-relaxed">
                  We collect anonymised usage data (page visits, feature usage, error logs) via
                  Vercel Analytics to improve the product. This data is not personally identifiable
                  and is not sold to third parties.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    Provide and improve the Jonno service
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    Calculate personalised macro and calorie targets from your training data
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    Power the Jonno Agent AI with context about your nutrition and training
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    Build macro-matched Uber Eats carts on your behalf
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    Send transactional emails (account confirmation, password reset)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    Analyse aggregate usage patterns to improve the product (anonymised only)
                  </li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  We do not sell your personal data to third parties. We do not use your health or
                  nutrition data for advertising.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">3. Data Storage and Security</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Your data is stored in Supabase (PostgreSQL database hosted on AWS). Supabase
                  implements encryption at rest and in transit (TLS 1.2+), row-level security (RLS)
                  policies, and SOC 2 Type II compliance. Your data is only accessible to you and
                  cannot be read by other users.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Profile photos are stored in Supabase Storage with public URL access for display,
                  but no user can enumerate or access another user&apos;s avatar. API keys for Strava,
                  Uber, and Anthropic are stored as environment variables and are never exposed
                  client-side.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">4. Your Rights</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Depending on your location, you may have the following rights regarding your personal data:
                </p>
                <ul className="space-y-2 text-gray-600 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <strong className="text-gray-700">Access:</strong> Request a copy of your personal data
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <strong className="text-gray-700">Correction:</strong> Update or correct inaccurate data in your profile
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <strong className="text-gray-700">Deletion:</strong> Request deletion of your account and all associated data
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <strong className="text-gray-700">Portability:</strong> Export your data in machine-readable format
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <strong className="text-gray-700">Disconnection:</strong> Revoke Strava or other third-party connections at any time
                  </li>
                </ul>
                <p className="text-gray-600 leading-relaxed">
                  To exercise these rights, email us at{" "}
                  <a href="mailto:privacy@macroclawagent.com" className="text-blue-600 hover:text-blue-500 transition-colors">
                    privacy@macroclawagent.com
                  </a>
                  . We will respond within 30 days.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
                <p className="text-gray-600 leading-relaxed">
                  We retain your data for as long as your account is active. If you delete your account,
                  we permanently delete all associated personal data within 30 days. Anonymised aggregate
                  data (usage statistics) may be retained indefinitely.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">6. Third-Party Services</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Jonno integrates with the following third-party services. Each has its own
                  privacy policy:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-1">•</span>
                    <strong className="text-gray-700">Strava:</strong> Activity and health data — strava.com/legal/privacy
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">•</span>
                    <strong className="text-gray-700">Uber:</strong> Delivery and restaurant data — uber.com/legal/privacy
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <strong className="text-gray-700">Anthropic:</strong> AI processing — anthropic.com/legal/privacy
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <strong className="text-gray-700">Supabase:</strong> Database and auth — supabase.com/privacy
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-600 mt-1">•</span>
                    <strong className="text-gray-700">Vercel:</strong> Hosting and analytics — vercel.com/legal/privacy-policy
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">7. Children&apos;s Privacy</h2>
                <p className="text-gray-600 leading-relaxed">
                  Jonno is not directed at individuals under the age of 13. We do not
                  knowingly collect personal information from children under 13. If you believe
                  we have inadvertently collected such information, please contact us immediately
                  at{" "}
                  <a href="mailto:privacy@macroclawagent.com" className="text-blue-600 hover:text-blue-500 transition-colors">
                    privacy@macroclawagent.com
                  </a>
                  .
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">8. Changes to This Policy</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this Privacy Policy from time to time. When we make material changes,
                  we will notify you by email (to the address on your account) or by a prominent notice
                  on the Service. Your continued use of the Service after changes take effect constitutes
                  your acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">9. Contact</h2>
                <p className="text-gray-600 leading-relaxed">
                  For privacy questions or data requests, contact us at:{" "}
                  <a href="mailto:privacy@macroclawagent.com" className="text-blue-600 hover:text-blue-500 transition-colors">
                    privacy@macroclawagent.com
                  </a>
                </p>
              </section>
            </div>

            <div className="mt-8 flex gap-4 text-sm">
              <Link href="/terms" className="text-blue-600 hover:text-blue-500 transition-colors">
                Terms of Service →
              </Link>
              <Link href="/faq" className="text-gray-500 hover:text-gray-700 transition-colors">
                FAQ →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
