import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, Lock, Eye, RefreshCw, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

type Tip = {
  icon: typeof Shield;
  title: string;
  description: string;
  actions: string[];
  details: string;
  examples: string[];
};

export const PreventionTips = () => {
  const [openTip, setOpenTip] = useState<Tip | null>(null);

  const tips: Tip[] = [
    {
      icon: Eye,
      title: "Verify the Sender",
      description: "Always check the sender's email address carefully",
      actions: [
        "Look for slight misspellings in the domain",
        "Hover over links to see the actual URL",
        "Check if the domain matches the official website",
        "Be suspicious of generic greetings",
      ],
      details:
        "Attackers often impersonate trusted brands by using lookalike domains. A single swapped character (rn vs m, 0 vs o) is easy to miss at a glance. Always inspect the full email address — not just the display name — and confirm it matches the legitimate domain you've used before.",
      examples: [
        "support@arnaz0n.com (fake) vs support@amazon.com (real)",
        "no-reply@paypa1.com (fake) vs no-reply@paypal.com (real)",
        "Display name 'Microsoft' but actual address is random@gmail.com",
      ],
    },
    {
      icon: Lock,
      title: "Use Strong Authentication",
      description: "Enable multi-factor authentication (MFA) on all accounts",
      actions: [
        "Use authenticator apps instead of SMS",
        "Enable biometric authentication when available",
        "Use unique passwords for each account",
        "Consider using a password manager",
      ],
      details:
        "Even if your password is stolen in a phishing attack, MFA blocks the attacker from logging in. Authenticator apps (TOTP) and hardware keys (FIDO2) are far more secure than SMS, which can be intercepted via SIM-swap attacks. A password manager generates and stores unique credentials so one breach doesn't cascade.",
      examples: [
        "Google Authenticator, Authy, or 1Password for TOTP codes",
        "YubiKey or Titan Key for hardware-based MFA",
        "Bitwarden, 1Password, or KeePass for password management",
      ],
    },
    {
      icon: Shield,
      title: "Think Before You Click",
      description: "Never click suspicious links or download unknown attachments",
      actions: [
        "Manually type URLs instead of clicking links",
        "Scan attachments with antivirus software",
        "Verify requests through official channels",
        "Don't trust urgent or threatening messages",
      ],
      details:
        "A single click can install malware or land you on a credential-harvesting page. Hover over links to preview the destination. When in doubt, navigate directly by typing the official URL into your browser. Treat .zip, .exe, .scr, and macro-enabled Office files as guilty until proven safe.",
      examples: [
        "Hovering reveals: 'Click here' → http://malicious-site.tk/login",
        "Invoice.pdf.exe — double extension to disguise an executable",
        "Word doc asking to 'Enable Editing' to run hidden macros",
      ],
    },
    {
      icon: RefreshCw,
      title: "Keep Software Updated",
      description: "Regular updates patch security vulnerabilities",
      actions: [
        "Enable automatic updates for OS and browsers",
        "Update security software regularly",
        "Keep all applications up to date",
        "Use supported software versions only",
      ],
      details:
        "Phishing payloads often exploit known vulnerabilities in browsers, PDF readers, and Office apps. Vendors release patches monthly — running outdated software leaves the door wide open. Auto-updates remove the burden of remembering, and end-of-life software should be replaced because it no longer receives fixes.",
      examples: [
        "Browser zero-days exploited within hours of disclosure",
        "Outdated Adobe Reader vulnerable to malicious PDFs",
        "Windows 7 / older macOS no longer receiving security patches",
      ],
    },
    {
      icon: AlertCircle,
      title: "Recognize Red Flags",
      description: "Be aware of common phishing indicators",
      actions: [
        "Urgency and pressure tactics",
        "Too good to be true offers",
        "Requests for sensitive information",
        "Poor grammar and spelling errors",
      ],
      details:
        "Phishing relies on emotional manipulation — fear, greed, urgency, curiosity. Legitimate organizations rarely ask you to act within minutes, never request passwords by email, and proofread their messages. If something feels off, trust that instinct and verify before acting.",
      examples: [
        "'Your account will be closed in 24 hours unless you verify now'",
        "'Congratulations! You won $1,000,000 — claim immediately'",
        "'Dear costumer, kindly update you're informations urgent'",
      ],
    },
    {
      icon: CheckCircle2,
      title: "Verify Before Acting",
      description: "Confirm through official channels before responding",
      actions: [
        "Call the company directly using official numbers",
        "Log in through official websites, not email links",
        "Verify with IT department for work emails",
        "Report suspicious emails to security team",
      ],
      details:
        "When you receive an unexpected request — a wire transfer, password reset, invoice change — pause and verify out-of-band. Look up the company's phone number from their official website, not from the email itself. For workplace requests, confirm with the sender via a separate channel like Teams, Slack, or in person.",
      examples: [
        "CEO email asking for urgent gift cards → call the CEO directly",
        "Bank alert about suspicious activity → log in via the bank's app",
        "Vendor changing payment details → confirm via known phone number",
      ],
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-success">Prevention</span> Best Practices
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Click any card to explore detailed guidance and real-world examples
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <button
                key={index}
                onClick={() => setOpenTip(tip)}
                className="text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-success rounded-xl"
              >
                <Card className="h-full border-2 hover:border-success/50 hover:shadow-lg transition-all cursor-pointer group-hover:-translate-y-1 duration-200">
                  <CardHeader>
                    <div className="p-3 rounded-lg bg-success/10 w-fit mb-3 group-hover:bg-success/20 transition-colors">
                      <Icon className="w-6 h-6 text-success" />
                    </div>
                    <CardTitle className="text-xl flex items-center justify-between gap-2">
                      <span>{tip.title}</span>
                      <ArrowRight className="w-4 h-4 text-success opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </CardTitle>
                    <CardDescription>{tip.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tip.actions.map((action, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-xs font-medium text-success/80 group-hover:text-success">
                      Read more →
                    </p>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>

        <div className="mt-12 p-8 rounded-xl bg-gradient-to-r from-success/10 to-primary/10 border-2 border-success/20">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-success/20">
              <Shield className="w-8 h-8 text-success" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Security Awareness Training</h3>
              <p className="text-muted-foreground mb-4">
                Regular training and awareness programs are crucial for maintaining a strong security posture.
                Organizations should conduct periodic phishing simulations and educational sessions to keep
                employees vigilant against evolving threats.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-success/20 text-sm font-medium">
                  Monthly Training
                </span>
                <span className="px-3 py-1 rounded-full bg-success/20 text-sm font-medium">
                  Phishing Simulations
                </span>
                <span className="px-3 py-1 rounded-full bg-success/20 text-sm font-medium">
                  Security Updates
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!openTip} onOpenChange={(open) => !open && setOpenTip(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {openTip && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-lg bg-success/10">
                    <openTip.icon className="w-6 h-6 text-success" />
                  </div>
                  <DialogTitle className="text-2xl">{openTip.title}</DialogTitle>
                </div>
                <DialogDescription className="text-base">
                  {openTip.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-2">
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Why it matters</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {openTip.details}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-foreground">Action checklist</h4>
                  <ul className="space-y-2">
                    {openTip.actions.map((action, i) => (
                      <li key={i} className="text-sm flex items-start gap-2 p-2 rounded-md bg-success/5">
                        <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-foreground">Real-world examples</h4>
                  <ul className="space-y-2">
                    {openTip.examples.map((ex, i) => (
                      <li
                        key={i}
                        className="text-sm flex items-start gap-2 p-3 rounded-md bg-destructive/5 border border-destructive/20 font-mono"
                      >
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span>{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
