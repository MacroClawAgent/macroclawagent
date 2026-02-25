import { Navbar } from "@/components/marketing/Navbar";
import { Hero } from "@/components/marketing/Hero";
import { ProcessFlow } from "@/components/marketing/ProcessFlow";
import { TrustSignals } from "@/components/marketing/TrustSignals";
import { Footer } from "@/components/marketing/Footer";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <Navbar />
      <Hero />
      <ProcessFlow />
      <TrustSignals />

      <Footer />
    </main>
  );
}
