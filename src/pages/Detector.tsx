import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertTriangle, CheckCircle2, Shield, Loader2,
  Clock, Mail, Search, Activity, Database, Eye, Sparkles,
  Brain, Zap, ScanLine, Layers, Calculator,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import {
  predictNaiveBayes,
  NB_TRAINING_SIZE,
  NB_VOCAB_SIZE,
} from "@/lib/naiveBayes";

const PHISHING_KEYWORDS = [
  // Urgency / pressure
  "urgent", "immediate action", "act now", "act immediately", "expire", "expires today",
  "limited time", "last chance", "final notice", "deadline", "within 24 hours",
  "respond now", "do not ignore", "time sensitive", "important update",
  // Account / credential bait
  "verify", "verify your account", "verify identity", "validate", "validate your account",
  "confirm", "confirm your identity", "confirm your account", "update your information",
  "update your account", "reset password", "password reset", "change password",
  "login credentials", "your account", "account suspended", "account locked",
  "locked account", "suspended", "suspend", "deactivated", "reactivate",
  "unauthorized access", "unauthorized login", "unusual activity", "suspicious activity",
  "security alert", "security warning", "security notice", "security breach",
  // Click / link bait
  "click here", "click below", "click the link", "follow this link",
  "tap here", "open attachment", "download attachment", "view document",
  "review and confirm", "sign in here", "log in to continue",
  // Generic greetings
  "dear customer", "dear user", "dear client", "dear member", "dear account holder",
  "valued customer", "to whom it may concern",
  // Money / prizes / scams
  "congratulations", "you have won", "you've won", "winner", "lottery",
  "prize", "claim your prize", "claim now", "free gift", "gift card",
  "voucher", "cash prize", "jackpot", "inheritance", "beneficiary",
  "unclaimed funds", "wire transfer", "bank transfer", "money transfer",
  "transfer fee", "processing fee", "tax clearance", "western union",
  "bitcoin", "cryptocurrency", "crypto wallet", "investment opportunity",
  "guaranteed returns", "double your money", "risk free",
  // Banking / payment
  "bank account", "credit card", "debit card", "card blocked", "card expired",
  "kyc update", "kyc pending", "complete kyc", "pan card", "aadhaar",
  "upi pin", "otp", "share otp", "your otp is", "atm pin",
  "cvv", "net banking", "internet banking", "ifsc",
  // Identity / personal info
  "social security", "ssn", "date of birth", "mother's maiden name",
  "personal information", "sensitive information", "billing information",
  // Tech support / malware
  "your computer is infected", "virus detected", "malware detected",
  "microsoft support", "apple support", "tech support", "system warning",
  "drivers outdated", "license expired",
  // Delivery / logistics scams
  "package delivery", "package on hold", "shipment", "delivery failed",
  "customs clearance", "tracking number", "redelivery",
  // Common impersonations
  "irs", "income tax refund", "tax refund", "government grant",
  "police complaint", "court notice", "legal action",
  // Social engineering tells
  "do not share this", "keep this confidential", "between us only",
  "i need a favor", "are you available",
];


type DetectionMode = "ai" | "keyword" | "bayes";

type ScanResult = {
  isPhishing: boolean;
  confidence: number;
  indicators: string[];
  recommendation: string;
  riskLevel?: string;
  summary?: string;
  source: "ai" | "keyword" | "bayes";
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
  const [mode, setMode] = useState<DetectionMode>("ai");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [loadingRecents, setLoadingRecents] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

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

  const runKeywordScan = (): ScanResult => {
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

    const isPhishing = suspicionScore > 25;
    const confidence = Math.min(98, 45 + suspicionScore);

    return {
      isPhishing,
      confidence,
      indicators: foundIndicators.length > 0 ? foundIndicators : ["No major red flags detected"],
      recommendation: isPhishing
        ? "⚠️ HIGH RISK: This email exhibits multiple phishing characteristics. Do NOT click any links or provide personal information."
        : "✅ LOW RISK: This email appears relatively safe. Always verify sender identity and exercise caution.",
      source: "keyword",
    };
  };

  const runAIScan = async (): Promise<ScanResult> => {
    const { data, error } = await supabase.functions.invoke("analyze-email", {
      body: { emailContent: emailText },
    });

    if (error) throw error;

    if (data?.error) {
      if (data.error.includes("Rate limit")) {
        toast({
          title: "Rate limit reached",
          description: "Falling back to keyword scan. Try AI again shortly.",
          variant: "destructive",
        });
      } else if (data.error.includes("credits")) {
        toast({
          title: "AI credits exhausted",
          description: "Falling back to keyword scan.",
          variant: "destructive",
        });
      } else {
        throw new Error(data.error);
      }
      return runKeywordScan();
    }

    return {
      isPhishing: !!data.isPhishing,
      confidence: Math.round(data.confidence ?? 0),
      indicators: Array.isArray(data.indicators) && data.indicators.length > 0
        ? data.indicators
        : ["No specific indicators returned"],
      recommendation: data.recommendation ?? "",
      riskLevel: data.riskLevel,
      summary: data.summary,
      source: "ai",
    };
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

    let scanResult: ScanResult;

    try {
      if (mode === "ai") {
        scanResult = await runAIScan();
      } else {
        // Brief artificial delay so the UX feels intentional
        await new Promise((r) => setTimeout(r, 400));
        scanResult = runKeywordScan();
      }
    } catch (err) {
      console.error("AI analysis failed, using keyword fallback:", err);
      toast({
        title: "AI unavailable",
        description: "Using keyword-based scan as fallback.",
        variant: "destructive",
      });
      scanResult = runKeywordScan();
    }

    setResult(scanResult);

    await supabase.from("phishing_scans").insert({
      email_content: emailText.substring(0, 2000),
      is_phishing: scanResult.isPhishing,
      confidence: scanResult.confidence,
      indicators: scanResult.indicators,
      recommendation: scanResult.recommendation,
    });

    fetchRecentScans();

    toast({
      title: `Scan Complete (${scanResult.source === "ai" ? "AI" : "Keyword"})`,
      description: `Threat level: ${scanResult.isPhishing ? "HIGH" : "LOW"} (${scanResult.confidence}% confidence)`,
    });

    setAnalyzing(false);
  };

  const stats = [
    {
      label: "Total Scans",
      value: recentScans.length,
      icon: ScanLine,
      tone: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
    },
    {
      label: "Threats Found",
      value: recentScans.filter((s) => s.is_phishing).length,
      icon: AlertTriangle,
      tone: "from-destructive/20 to-destructive/5",
      iconColor: "text-destructive",
      valueClass: "text-destructive",
    },
    {
      label: "Safe Emails",
      value: recentScans.filter((s) => !s.is_phishing).length,
      icon: CheckCircle2,
      tone: "from-success/20 to-success/5",
      iconColor: "text-success",
      valueClass: "text-success",
    },
    {
      label: "Active Keywords",
      value: PHISHING_KEYWORDS.length,
      icon: Activity,
      tone: "from-warning/20 to-warning/5",
      iconColor: "text-warning",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Header */}
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-accent/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 rounded-full blur-[120px] opacity-60" />
        <div className="relative container max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Email Threat Analyzer</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                Phishing{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Detector
                </span>
              </h1>
              <p className="text-muted-foreground max-w-xl">
                Compare AI-powered analysis with classic keyword detection. Paste any suspicious email to see how each engine responds.
              </p>
            </div>
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 backdrop-blur-sm">
              <Database className="w-3.5 h-3.5" />
              {recentScans.length} Scans Recorded
            </Badge>
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Card
                key={s.label}
                className={`relative overflow-hidden border bg-gradient-to-br ${s.tone}`}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-background/70 backdrop-blur-sm shadow-sm">
                    <Icon className={`w-5 h-5 ${s.iconColor}`} />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${s.valueClass ?? ""}`}>
                      {s.value}
                    </div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Scanner Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <CardTitle>Email Scanner</CardTitle>
                </div>
                <CardDescription>
                  Choose a detection engine, paste an email, and run the scan to see how it's classified.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                {/* Mode Tabs */}
                <Tabs value={mode} onValueChange={(v) => setMode(v as DetectionMode)}>
                  <TabsList className="grid w-full grid-cols-2 h-auto p-1">
                    <TabsTrigger value="ai" className="gap-2 py-2.5">
                      <Brain className="w-4 h-4" />
                      <span className="font-semibold">AI Analysis</span>
                    </TabsTrigger>
                    <TabsTrigger value="keyword" className="gap-2 py-2.5">
                      <Zap className="w-4 h-4" />
                      <span className="font-semibold">Keyword Engine</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="ai" className="mt-4">
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <Sparkles className="w-4 h-4" />
                        Powered by GPT — Contextual Understanding
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Reads the email like a human analyst. Understands tone, intent and social-engineering patterns
                        even when no obvious keywords are present. Slower, but catches sophisticated and personalized attacks.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="keyword" className="mt-4">
                    <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-warning">
                        <Layers className="w-4 h-4" />
                        Rule-Based — Keyword & Pattern Matching
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Checks the email against {PHISHING_KEYWORDS.length} known phishing keywords plus URL, capitalization
                        and punctuation rules. Instant and offline-friendly, but misses cleverly worded or novel attacks.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <Textarea
                  placeholder={"From: suspicious@email.com\nSubject: Urgent Account Verification Required\n\nDear customer,\nYour account has been compromised. Click here to verify your identity immediately..."}
                  className="min-h-[220px] font-mono text-sm bg-muted/30 resize-none"
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
                          {mode === "ai" ? <Brain className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                          Run {mode === "ai" ? "AI" : "Keyword"} Scan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparison strip — great for expo demos */}
            <Card className="border bg-gradient-to-br from-muted/40 to-background">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm uppercase tracking-wider">
                    AI vs Keyword — Quick Comparison
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-primary/20 p-4 bg-background/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">AI Analysis</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      <li className="flex gap-2"><span className="text-success">+</span> Understands meaning & context</li>
                      <li className="flex gap-2"><span className="text-success">+</span> Catches new, unseen scams</li>
                      <li className="flex gap-2"><span className="text-success">+</span> Explains its reasoning</li>
                      <li className="flex gap-2"><span className="text-destructive">−</span> Slower, needs internet</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-warning/20 p-4 bg-background/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-warning" />
                      <span className="font-semibold text-sm">Keyword Engine</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      <li className="flex gap-2"><span className="text-success">+</span> Instant, no API calls</li>
                      <li className="flex gap-2"><span className="text-success">+</span> Predictable & transparent</li>
                      <li className="flex gap-2"><span className="text-destructive">−</span> Misses reworded attacks</li>
                      <li className="flex gap-2"><span className="text-destructive">−</span> No context awareness</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="border-b border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <Eye className="w-4 h-4 text-primary" />
                  </div>
                  <CardTitle>Scan Results</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {!result ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 rounded-full bg-muted/50 mb-4">
                      <Shield className="w-12 h-12 text-muted-foreground/40" />
                    </div>
                    <p className="text-muted-foreground font-medium">
                      No scan yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Paste an email above and run a scan to see results.
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

                    {/* Engine + Risk Level */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        {result.source === "ai" ? (
                          <>
                            <Sparkles className="w-3 h-3 text-primary" />
                            AI Analysis (GPT)
                          </>
                        ) : (
                          <>
                            <Search className="w-3 h-3" />
                            Keyword Engine
                          </>
                        )}
                      </Badge>
                      {result.riskLevel && (
                        <Badge variant="outline" className="uppercase">
                          {result.riskLevel} risk
                        </Badge>
                      )}
                    </div>

                    {result.summary && (
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                        <span className="font-semibold">AI Summary: </span>
                        {result.summary}
                      </div>
                    )}

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
            <Card className="border-2 shadow-md">
              <CardHeader className="border-b border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Recent Scans</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={fetchRecentScans}>
                    <Loader2 className={`w-3 h-3 ${loadingRecents ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
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
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-4 h-4 text-warning" />
                  Active Keyword Dataset
                </CardTitle>
                <CardDescription>
                  {PHISHING_KEYWORDS.length} patterns the keyword engine watches for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto pr-1">
                  {PHISHING_KEYWORDS.map((kw) => (
                    <Badge key={kw} variant="outline" className="text-xs font-normal">
                      {kw}
                    </Badge>
                  ))}
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
