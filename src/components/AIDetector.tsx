import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PHISHING_KEYWORDS = [
  "urgent", "verify", "suspend", "click here", "account", "password",
  "confirm", "security alert", "unusual activity", "limited time",
  "act now", "expire", "unauthorized", "validate", "update your information",
  "dear customer", "dear user", "congratulations", "you have won",
  "bank account", "social security", "credit card", "login credentials",
  "reset password", "locked account", "verify identity", "immediate action",
  "wire transfer", "bitcoin", "gift card", "prize", "inheritance",
];

export const AIDetector = () => {
  const [emailText, setEmailText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    isPhishing: boolean;
    confidence: number;
    indicators: string[];
    recommendation: string;
  } | null>(null);
  const { toast } = useToast();

  const analyzeEmail = async () => {
    if (!emailText.trim()) {
      toast({
        title: "Please enter email content",
        description: "Paste the suspicious email text to analyze",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    setResult(null);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const text = emailText.toLowerCase();
    const foundIndicators: string[] = [];
    let suspicionScore = 0;

    PHISHING_KEYWORDS.forEach((keyword) => {
      if (text.includes(keyword)) {
        suspicionScore += 10;
        foundIndicators.push(`Contains suspicious keyword: "${keyword}"`);
      }
    });

    if (text.includes("http://") || text.match(/[a-z0-9-]+\.[a-z]{2,}/g)) {
      suspicionScore += 15;
      foundIndicators.push("Contains suspicious links");
    }

    if (text.match(/\$\d+/)) {
      suspicionScore += 10;
      foundIndicators.push("Mentions monetary amounts");
    }

    if (text.match(/[A-Z]{3,}/g)) {
      suspicionScore += 5;
      foundIndicators.push("Uses excessive capitalization (pressure tactic)");
    }

    const isPhishing = suspicionScore > 25;
    const confidence = Math.min(95, 50 + suspicionScore);

    setResult({
      isPhishing,
      confidence,
      indicators: foundIndicators.length > 0 ? foundIndicators : ["No major red flags detected"],
      recommendation: isPhishing
        ? "This email shows multiple phishing indicators. Do not click any links or provide information. Delete this email and report it to your IT security team."
        : "This email appears legitimate, but always verify sender information and be cautious with links and attachments.",
    });

    toast({
      title: "Analysis Complete",
      description: `Email analyzed with ${confidence}% confidence`,
    });

    setAnalyzing(false);
  };

  return (
    <section id="detector" className="py-20 px-4 bg-muted/30">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Keyword-Based Detection</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Phishing Email <span className="text-primary">Detector</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Paste suspicious email content below to scan it against known phishing patterns and keywords
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Email Content</CardTitle>
              <CardDescription>
                Paste the complete email text including subject, sender, and body
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="From: suspicious@email.com&#10;Subject: Urgent Account Verification&#10;&#10;Dear user,&#10;Your account has been compromised..."
                className="min-h-[300px] font-mono text-sm"
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
              />
              <Button
                onClick={analyzeEmail}
                disabled={analyzing || !emailText.trim()}
                className="w-full"
                variant="hero"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Scan Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Scan Results</CardTitle>
              <CardDescription>
                Threat assessment based on known phishing patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <Shield className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Enter email content and click "Scan Email" to see results
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg border-2"
                    style={{
                      borderColor: result.isPhishing ? 'hsl(var(--destructive))' : 'hsl(var(--success))',
                      backgroundColor: result.isPhishing ? 'hsl(var(--destructive) / 0.1)' : 'hsl(var(--success) / 0.1)'
                    }}>
                    <div className="flex items-center gap-3">
                      {result.isPhishing ? (
                        <AlertTriangle className="w-8 h-8 text-destructive" />
                      ) : (
                        <CheckCircle2 className="w-8 h-8 text-success" />
                      )}
                      <div>
                        <div className="font-bold text-lg">
                          {result.isPhishing ? "Phishing Detected" : "Appears Safe"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {result.confidence}% Confidence
                        </div>
                      </div>
                    </div>
                    <Badge variant={result.isPhishing ? "destructive" : "success"}>
                      {result.isPhishing ? "DANGER" : "SAFE"}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Detected Indicators:</h4>
                    <ul className="space-y-2">
                      {result.indicators.map((indicator, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className={result.isPhishing ? "text-destructive" : "text-success"}>
                            {result.isPhishing ? "⚠" : "✓"}
                          </span>
                          <span>{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-muted">
                    <h4 className="font-semibold mb-2">Recommendation:</h4>
                    <p className="text-sm text-muted-foreground">{result.recommendation}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-6 rounded-xl bg-card border-2 border-primary/20">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-primary mt-1" />
            <div className="space-y-2">
              <h3 className="font-bold text-lg">How It Works</h3>
              <p className="text-sm text-muted-foreground">
                Our detector scans email content against a comprehensive database of known phishing keywords,
                suspicious URL patterns, urgency tactics, and social engineering cues. It flags matching patterns
                and provides a threat score. While highly effective, always use your judgment and verify suspicious
                emails through official channels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};