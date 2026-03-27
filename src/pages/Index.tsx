import { HeroSection } from "@/components/HeroSection";
import { PhishingExamples } from "@/components/PhishingExamples";
import { PreventionTips } from "@/components/PreventionTips";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <PhishingExamples />
      <PreventionTips />
      
      <footer className="py-8 px-4 border-t border-border bg-card">
        <div className="container max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Phishing Defense Platform. Educational purposes only. Stay vigilant, stay safe.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
