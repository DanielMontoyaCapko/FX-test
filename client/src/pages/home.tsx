import Header from "@/components/header";
import Hero from "@/components/hero";
import Security from "@/components/security";
import Downloads from "@/components/downloads";
import FinalCTA from "@/components/final-cta";
import Footer from "@/components/footer";

import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function Home() {
  useScrollToTop();
  return (
    <div className={[
      "min-h-screen text-white relative",
      "bg-gradient-to-br from-black via-[#0A1713] to-[#0E2A1F]",
      "before:pointer-events-none before:absolute before:inset-0",
      "before:bg-[radial-gradient(80%_60%_at_110%_-10%,rgba(16,185,129,0.18),transparent),radial-gradient(60%_40%_at_-20%_110%,rgba(16,185,129,0.12),transparent)]",
    ].join(" ")}>
      <div className="relative z-10">
        <Header />
        <Hero />
        <Security />
        <Downloads />
        <FinalCTA />
        <Footer />
      </div>
    </div>
  );
}
