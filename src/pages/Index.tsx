import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { PhishingExamples } from "@/components/PhishingExamples";
import { PreventionTips } from "@/components/PreventionTips";
import { ContactSection } from "@/components/ContactSection";
import { PhishingWatermark } from "@/components/PhishingWatermark";

const Index = () => {
  return (
    <div className="relative min-h-screen">
      {/* Animated phishing-themed watermark behind everything */}
      <PhishingWatermark />

      {/* All real content sits above the watermark */}
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <div id="examples">
          <PhishingExamples />
        </div>
        <PreventionTips />
        <ContactSection />

        <footer className="py-8 px-4 border-t border-border bg-card">
          <div className="container max-w-7xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Phishing Defense Platform. Built by Akshita & Abhayraj. Stay vigilant, stay safe.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
