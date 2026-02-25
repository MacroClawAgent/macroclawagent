import { Navbar } from "@/components/marketing/Navbar";
import { Hero } from "@/components/marketing/Hero";
import { ProcessFlow } from "@/components/marketing/ProcessFlow";
import { TrustSignals } from "@/components/marketing/TrustSignals";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <Navbar />
      <Hero />
      <ProcessFlow />
      <TrustSignals />

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦀</span>
            <span className="font-bold text-green-100">MacroClawAgent</span>
          </div>
          <p className="text-sm text-green-300/40">
            © 2026 MacroClawAgent. Built for athletes who eat with intention.
          </p>
          <div className="flex gap-6 text-sm text-green-300/50">
            <a href="#" className="hover:text-green-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-green-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-green-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
