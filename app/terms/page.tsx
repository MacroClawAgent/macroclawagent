import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#08090D]">
      <Navbar />
      <main className="pt-16">
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6">
            {/* Header */}
            <div className="mb-12">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">Legal</p>
              <h1 className="text-4xl font-black text-slate-100 mb-3">Terms of Service</h1>
              <p className="text-sm text-slate-500">Last updated: February 18, 2026</p>
            </div>

            <div className="glass-card p-8 md:p-12">
              <p className="text-slate-400 leading-relaxed mb-8">
                These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of MacroClawAgent
                (the &ldquo;Service&rdquo;) operated by MacroClawAgent (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). By accessing or
                using the Service, you agree to be bound by these Terms.
              </p>

              <section className="mb-10">
                <h2 className="text-xl font-bold text-slate-100 mb-4">1. Acceptance of Terms</h2>
                <p className="text-slate-400 leading-relaxed">
                  By creating an account or using any part of the Service, you confirm that you are at
                  least 13 years of age, have read and understood these Terms, and agree to be bound
                  by them. If you do not agree to these Terms, you may not use the Service.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-bold text-slate-100 mb-4">2. Account Registration</h2>
                <p className="text-slate-400 leading-relaxed mb-3">
                  To access most features of the Service, you must create an account. You agree to:
                </p>
                <ul className="space-y-2 text-slate-400 mb-4">
                  <li className="flex items-start gap-2"><span className="text-indigo-400 mt-1">•</span>Provide accurate, current, and complete information during registration</li>
                  <li className="flex items-start gap-2"><span className="text-indigo-400 mt-1">•</span>Maintain and promptly update your account information</li>
                  <li className="flex items-start gap-2"><span className="text-indigo-400 mt-1">•</span>Keep your password confidential and not share it with others</li>
                  <li className="flex items-start gap-2"><span className="text-indigo-400 mt-1">•</span>Notify us immediately of any unauthorised use of your account</li>
                  <li className="flex items-start gap-2"><span className="text-indigo-400 mt-1">•</span>Accept responsibility for all activities that occur under your account</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-bold text-slate-100 mb-4">3. Subscriptions and Billing</h2>
                <p className="text-slate-400 leading-relaxed mb-3">
                  Certain features of the Service require a paid subscription (Pro or Elite plans). By
                  subscribing, you agree to the following:
                </p>
                <ul className="space-y-2 text-slate-400 mb-4">
                  <li className="flex items-start gap-2"><span className="text-indigo-400 mt-1">•</span>Subscriptions are billed monthly or annually in advance</li>
                  <li className="flex items-start gap-2"><span className="text-indigo-400 mt-1">•</span>Subscriptions automatically renew unless cancelled before the renewal date</li>
                  <li className="flex items-start gap-2"><span className="text-indigo-400 mt-1">•</span>You may cancel at any time; cancellations take effect at the end of the current billing period</li>
                  <li className="flex items-start gap-2"><span className="text-indigo-400 mt-1">•</span>We do not offer refunds for partial billing periods, except where required by applicable law</li>
                  <li className="flex items-start gap-2"><span className="text-indigo-400 mt-1">•</span>We reserve the right to change pricing with 30 days notice to existing subscribers</li>
                </ul>
                <p className="text-slate-400 leading-relaxed">
                  Free trial periods, where offered, convert to paid subscriptions at the end of the
                  trial unless cancelled before expiry. Trial eligibility is limited to new accounts.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-bold text-slate-100 mb-4">4. Acceptable Use</h2>
                <p className="text-slate-400 leading-relaxed mb-3">You agree not to use the Service to:</p>
                <ul className="space-y-2 text-slate-400">
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span>Violate any applicable laws or regulations</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span>Attempt to gain unauthorised access to our systems or other users&apos; accounts</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span>Transmit malware, viruses, or other harmful code</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span>Abuse the AI system with the intent to generate harmful, illegal, or deceptive content</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span>Scrape, crawl, or systematically extract data from the Service</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span>Use the Service in any way that could damage, disable, or impair our infrastructure</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span>Resell, redistribute, or sublicence access to the Service</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-bold text-slate-100 mb-4">5. Health Disclaimer</h2>
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
                  <p className="text-sm text-amber-300 font-semibold mb-1">Important</p>
                  <p className="text-sm text-amber-300/80">
                    MacroClawAgent is a nutrition tracking and planning tool. It is not a medical device,
                    medical service, or a substitute for professional medical or dietary advice.
                  </p>
                </div>
                <p className="text-slate-400 leading-relaxed mb-3">
                  The macro targets, meal recommendations, and AI guidance provided by the Service are
                  based on publicly available sports nutrition research and your self-reported data.
                  They are intended for healthy adults pursuing athletic performance goals and are
                  not suitable for:
                </p>
                <ul className="space-y-2 text-slate-400 mb-4">
                  <li className="flex items-start gap-2"><span className="text-amber-400 mt-1">•</span>Individuals with eating disorders or a history of disordered eating</li>
                  <li className="flex items-start gap-2"><span className="text-amber-400 mt-1">•</span>Individuals with metabolic conditions, diabetes, or other medical conditions requiring clinical dietary management</li>
                  <li className="flex items-start gap-2"><span className="text-amber-400 mt-1">•</span>Pregnant or breastfeeding individuals</li>
                  <li className="flex items-start gap-2"><span className="text-amber-400 mt-1">•</span>Individuals under 18 without parental supervision and medical approval</li>
                </ul>
                <p className="text-slate-400 leading-relaxed">
                  Always consult a qualified healthcare professional or registered dietitian before
                  making significant changes to your diet, especially if you have any medical conditions
                  or are taking medications.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-bold text-slate-100 mb-4">6. Intellectual Property</h2>
                <p className="text-slate-400 leading-relaxed mb-3">
                  The Service, including its software, design, content, trademarks, and the &ldquo;Claw Agent&rdquo;
                  branding, is owned by MacroClawAgent and protected by intellectual property laws.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  You retain ownership of any data you input into the Service (meal logs, profile data,
                  etc.). By using the Service, you grant us a limited licence to process this data
                  solely to provide the Service to you.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-bold text-slate-100 mb-4">7. Third-Party Integrations</h2>
                <p className="text-slate-400 leading-relaxed">
                  The Service integrates with Strava, Uber Eats, and other third-party platforms.
                  Your use of those integrations is also subject to the respective third-party terms
                  of service. We are not responsible for the availability, accuracy, or practices of
                  third-party services. Connecting or disconnecting a third-party integration is
                  always your choice.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-bold text-slate-100 mb-4">8. Disclaimer of Warranties</h2>
                <p className="text-slate-400 leading-relaxed">
                  THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND,
                  EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY,
                  FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE
                  SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS. USE OF
                  THE SERVICE IS AT YOUR OWN RISK.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-bold text-slate-100 mb-4">9. Limitation of Liability</h2>
                <p className="text-slate-400 leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, MACROCLAWAGENT SHALL NOT BE
                  LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
                  INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF
                  OR IN CONNECTION WITH YOUR USE OF THE SERVICE, EVEN IF WE HAVE BEEN ADVISED OF
                  THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT
                  YOU PAID FOR THE SERVICE IN THE 12 MONTHS PRECEDING THE CLAIM.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-bold text-slate-100 mb-4">10. Governing Law</h2>
                <p className="text-slate-400 leading-relaxed">
                  These Terms are governed by the laws of the State of California, United States,
                  without regard to conflict of law principles. Any disputes arising under these
                  Terms shall be resolved in the courts of San Francisco County, California, and
                  you consent to personal jurisdiction in those courts.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-bold text-slate-100 mb-4">11. Changes to Terms</h2>
                <p className="text-slate-400 leading-relaxed">
                  We reserve the right to modify these Terms at any time. When we make material changes,
                  we will notify you via email and update the &ldquo;Last updated&rdquo; date above. Continued use of
                  the Service after changes take effect constitutes acceptance of the revised Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-100 mb-4">12. Contact</h2>
                <p className="text-slate-400 leading-relaxed">
                  For questions about these Terms, contact us at:{" "}
                  <a href="mailto:legal@macroclawagent.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                    legal@macroclawagent.com
                  </a>
                </p>
              </section>
            </div>

            <div className="mt-8 flex gap-4 text-sm">
              <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Privacy Policy →
              </Link>
              <Link href="/faq" className="text-slate-500 hover:text-slate-300 transition-colors">
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
