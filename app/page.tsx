import { Navbar } from "@/components/marketing/Navbar";
import { Hero } from "@/components/marketing/Hero";
import { LogoMarquee } from "@/components/marketing/LogoMarquee";
import { BentoShowcase } from "@/components/marketing/BentoShowcase";
import { ProcessFlow } from "@/components/marketing/ProcessFlow";
import { Testimonials } from "@/components/marketing/Testimonials";
import { TrustSignals } from "@/components/marketing/TrustSignals";
import { Footer } from "@/components/marketing/Footer";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <Navbar />
      <Hero />
      <LogoMarquee />
      <BentoShowcase />
      <ProcessFlow />
      <Testimonials />
      <TrustSignals />
      <Footer />
    </main>
  );
}
