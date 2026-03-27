import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle, CheckCircle2, Shield, Loader2, ArrowLeft,
  Clock, Mail, Search, Activity, Database, Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PHISHING_KEYWORDS = [
  "urgent", "verify", "suspend", "click here", "account", "password",
  "confirm", "security alert", "unusual activity", "limited time",
  "act now", "expire", "unauthorized", "validate", "update your information",
  "dear customer", "dear user", "congratulations", "you have won",
  "bank account", "social security", "credit card", "login credentials",
  "reset password", "locked account", "verify identity", "immediate action",
  "wire transfer", "bitcoin", "gift card", "prize", "inheritance",
];

type ScanResult = {
  isPhishing: boolean;
  confidence: number;
  indicators: string[];
  recommendation: string;
};

type RecentScan = {
  id: string;
  email_content: string;
  is_phishing: boolean;
  confidence: number;
  indicators: string[];
  created_at: string;
};

const Detector = () => {
  const [emailText, setEmailText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [loadingRecents, setLoadingRecents] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentScans();
  }, []);

  const fetchRecentScans = async () => {
    setLoadingRecents(true);
    const { data, error } = await supabase
      .from("phishing_scans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setRecentScans(data as RecentScan[]);
    }
    setLoadingRecents(false);
  };

  const analyzeEmail = async () => {
    if (!emailText.trim()) {
      toast({
        title: "Email content required",
        description: "Paste the suspicious email text to analyze",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    setResult(null);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const text = emailText.toLowerCase();
    const foundIndicators: string[] = [];
    let suspicionScore = 0;

    PHISHING_KEYWORDS.forEach((keyword) => {
      if (text.includes(keyword)) {
        suspicionScore += 10;
        foundIndicators.push(`Keyword detected: "${keyword}"`);
      }
    });

    if (text.includes("http://") || text.match(/[a-z0-9-]+\.[a-z]{2,}/g)) {
      suspicionScore += 15;
      foundIndicators.push("Suspicious URL patterns found");
    }

    if (text.match(/\$\d+/)) {
      suspicionScore += 10;
      foundIndicators.push("Monetary value references detected");
    }

    if (text.match(/[A-Z]{3,}/g)) {
      suspicionScore += 5;
      foundIndicators.push("Excessive capitalization (urgency tactic)");
    }

    if (text.match(/!{2,}/)) {
      suspicionScore += 5;
      foundIndicators.push("Multiple exclamation marks (pressure tactic)");
    }

    if (text.match(/@[a-z0-9.-]+\.[a-z]{2,}/g)) {
      const emails = text.match(/@[a-z0-9.-]+\.[a-z]{2,}/g) || [];
      const suspicious = emails.filter(e =>
        e.includes("secure") || e.includes("support") || e.includes("admin") || e.includes("noreply")
      );
      if (suspicious.length > 0) {
        suspicionScore += 10;
        foundIndicators.push("Suspicious sender domain patterns");
      }
    }

    const isPhishing = suspicionScore > 25;
    const confidence = Math.min(98, 45 + suspicionScore);

    const scanResult: ScanResult = {
      isPhishing,
      confidence,
      indicators: foundIndicators.length > 0 ? foundIndicators : ["No major red flags detected"],
      recommendation: isPhishing
        ? "⚠️ HIGH RISK: This email exhibits multiple phishing characteristics. Do NOT click any links, do NOT provide personal information. Delete immediately and report to your IT security team."
        : "✅ LOW RISK: This email appears relatively safe. However, always verify sender identity and exercise caution with links and attachments.",
    };

    setResult(scanResult);

    // Store in database
    await supabase.from("phishing_scans").insert({
      email_content: emailText.substring(0, 2000),
      is_phishing: isPhishing,
      confidence,
      indicators: foundIndicators,
      recommendation: scanResult.recommendation,
    });

    // Refresh recents
    fetchRecentScans();

    toast({
      title: "Scan Complete",
      description: `Threat level: ${isPhishing ? "HIGH" : "LOW"} (${confidence}% confidence)`,
    });

    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Phishing Detector</h1>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Database className="w-3 h-3" />
            {recentScans.length} Scans Recorded
          </Badge>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{recentScans.length}</div>
                <div className="text-xs text-muted-foreground">Total Scans</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <div className="text-2xl font-bold text-destructive">
                  {recentScans.filter(s => s.is_phishing).length}
                </div>
                <div className="text-xs text-muted-foreground">Threats Found</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-success">
                  {recentScans.filter(s => !s.is_phishing).length}
                </div>
                <div className="text-xs text-muted-foreground">Safe Emails</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Activity className="w-5 h-5 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {PHISHING_KEYWORDS.length}
                </div>
                <div className="text-xs text-muted-foreground">Keywords Active</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Scanner Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  <CardTitle>Email Scanner</CardTitle>
                </div>
                <CardDescription>
                  Paste complete email content including headers, subject line, and body
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={"From: suspicious@email.com\nSubject: Urgent Account Verification Required\n\nDear customer,\nYour account has been compromised. Click here to verify your identity immediately..."}
                  className="min-h-[220px] font-mono text-sm bg-muted/30"
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {emailText.length} characters
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setEmailText(""); setResult(null); }}
                      disabled={!emailText}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={analyzeEmail}
                      disabled={analyzing || !emailText.trim()}
                      variant="hero"
                      size="sm"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4" />
                          Run Scan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  <CardTitle>Scan Results</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {!result ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Shield className="w-16 h-16 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">
                      Paste an email above and click "Run Scan" to analyze
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Verdict */}
                    <div
                      className="flex items-center justify-between p-5 rounded-xl border-2"
                      style={{
                        borderColor: result.isPhishing ? 'hsl(var(--destructive))' : 'hsl(var(--success))',
                        backgroundColor: result.isPhishing ? 'hsl(var(--destructive) / 0.08)' : 'hsl(var(--success) / 0.08)',
                      }}
                    >
                      <div className="flex items-center gap-4">
                        {result.isPhishing ? (
                          <div className="p-3 rounded-full bg-destructive/20">
                            <AlertTriangle className="w-8 h-8 text-destructive" />
                          </div>
                        ) : (
                          <div className="p-3 rounded-full bg-success/20">
                            <CheckCircle2 className="w-8 h-8 text-success" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-xl">
                            {result.isPhishing ? "⚠ Phishing Detected" : "✓ Appears Safe"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Confidence: {result.confidence}%
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={result.isPhishing ? "destructive" : "success"}
                        className="text-sm px-4 py-1"
                      >
                        {result.isPhishing ? "HIGH RISK" : "LOW RISK"}
                      </Badge>
                    </div>

                    {/* Confidence Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Threat Level</span>
                        <span className="text-muted-foreground">{result.confidence}%</span>
                      </div>
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${result.confidence}%`,
                            backgroundColor: result.isPhishing ? 'hsl(var(--destructive))' : 'hsl(var(--success))',
                          }}
                        />
                      </div>
                    </div>

                    {/* Indicators */}
                    <div>
                      <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                        Detected Indicators
                      </h4>
                      <div className="space-y-2">
                        {result.indicators.map((indicator, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 text-sm"
                          >
                            <span className={`mt-0.5 ${result.isPhishing ? "text-destructive" : "text-success"}`}>
                              {result.isPhishing ? "⚠" : "✓"}
                            </span>
                            <span>{indicator}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="p-4 rounded-xl bg-muted border">
                      <h4 className="font-semibold mb-2 text-sm">Recommendation</h4>
                      <p className="text-sm text-muted-foreground">{result.recommendation}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Scans Sidebar */}
          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Recent Scans</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={fetchRecentScans}>
                    <Loader2 className={`w-3 h-3 ${loadingRecents ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingRecents ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : recentScans.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No scans yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Scan an email to see results here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {recentScans.map((scan) => (
                      <div
                        key={scan.id}
                        className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors cursor-default"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant={scan.is_phishing ? "destructive" : "success"}
                            className="text-xs"
                          >
                            {scan.is_phishing ? "PHISHING" : "SAFE"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {scan.confidence}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                          {scan.email_content.substring(0, 100)}...
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(scan.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Keywords Reference */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="text-lg">Active Keywords</CardTitle>
                <CardDescription>Patterns being scanned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {PHISHING_KEYWORDS.slice(0, 15).map((kw) => (
                    <Badge key={kw} variant="outline" className="text-xs">
                      {kw}
                    </Badge>
                  ))}
                  <Badge variant="secondary" className="text-xs">
                    +{PHISHING_KEYWORDS.length - 15} more
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detector;
