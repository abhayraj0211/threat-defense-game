import { Navbar } from "@/components/Navbar";
import { PhishingExamples } from "@/components/PhishingExamples";
import { Shield } from "lucide-react";

const Examples = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero header */}
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="relative container max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Threat Library</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Phishing Attack <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Examples</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-world phishing patterns broken down so you can spot them before they catch you.
          </p>
        </div>
      </header>

      <PhishingExamples />

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

export default Examples;
