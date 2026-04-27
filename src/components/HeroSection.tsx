import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 animate-pulse" style={{ animationDuration: '4s' }} />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="container relative z-10 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Phishing Detection & Prevention Platform</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Stay Protected From
          <br />
          <span className="text-destructive">Phishing Attacks</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Learn to identify phishing attempts, understand preventive measures, and use our detection tool to protect yourself and your organization
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Button 
            variant="hero" 
            size="lg"
            onClick={() => navigate('/detector')}
            className="text-lg px-8"
          >
            <Shield className="w-5 h-5" />
            Try Phishing Detector
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => scrollToSection('examples')}
            className="text-lg px-8"
          >
            <AlertTriangle className="w-5 h-5" />
            View Examples
          </Button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="p-6 rounded-lg bg-card/50 backdrop-blur border border-border">
            <div className="text-4xl font-bold text-destructive mb-2">3.4B+</div>
            <div className="text-sm text-muted-foreground">Phishing emails sent daily</div>
          </div>
          <div className="p-6 rounded-lg bg-card/50 backdrop-blur border border-border">
            <div className="text-4xl font-bold text-warning mb-2">36%</div>
            <div className="text-sm text-muted-foreground">Of breaches involve phishing</div>
          </div>
          <div className="p-6 rounded-lg bg-card/50 backdrop-blur border border-border">
            <div className="text-4xl font-bold text-success mb-2">90.9%</div>
            <div className="text-sm text-muted-foreground">Detection accuracy rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};
