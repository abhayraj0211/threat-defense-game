import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Mail, ShieldCheck, UserX } from "lucide-react";

/**
 * Contact section locked inside a "safe box".
 * A little scammer character runs across the screen, snatches the box,
 * and drags the user back to the home page — a playful demo of how
 * easily contact info can be stolen if you trust the wrong source.
 */
export const ContactSection = () => {
  const navigate = useNavigate();
  const [stealing, setStealing] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Loop: every ~9s, the scammer runs across, grabs, and "navigates" home.
  useEffect(() => {
    const tick = () => {
      setStealing(true);
      timerRef.current = window.setTimeout(() => {
        // If the user is already on home, this is a no-op.
        // If they're scrolled deep in contact, send them back to /
        navigate("/");
        setStealing(false);
      }, 6800);
    };

    const interval = window.setInterval(tick, 14000);
    return () => {
      window.clearInterval(interval);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [navigate]);

  const developers = [
    { name: "Akshita", role: "Developer", phone: "+91 98765 43210" },
    { name: "Abhayraj", role: "Developer", phone: "+91 91234 56780" },
  ];

  return (
    <section id="contact" className="relative py-20 px-4 overflow-hidden">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Contact
            </span>{" "}
            the Team
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Reach out to the developers behind Phishing Defense — but watch closely,
            scammers love unprotected contact details.
          </p>
        </div>

        {/* The "safe box" containing contact info */}
        <div className="relative">
          <Card
            className={`relative border-2 border-primary/30 shadow-xl overflow-hidden transition-transform duration-500 ${
              stealing ? "animate-shake-x" : ""
            }`}
          >
            {/* Lock badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 border border-success/30 text-success text-xs font-semibold z-10">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Contacts
            </div>

            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border">
              <CardTitle>Developers</CardTitle>
              <CardDescription>
                Built with care by students passionate about cyber safety.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
              {developers.map((dev) => (
                <div
                  key={dev.name}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">{dev.name}</div>
                      <div className="text-xs text-muted-foreground">{dev.role}</div>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4 text-accent" />
                      <span className="font-mono">{dev.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4 text-accent" />
                      <span className="font-mono text-xs">
                        {dev.name.toLowerCase()}@phishingdefense.app
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="md:col-span-2 p-4 rounded-xl border border-warning/30 bg-warning/5 text-sm text-muted-foreground">
                <span className="font-semibold text-warning">Note:</span>{" "}
                These numbers are samples for demo purposes. In real life, never share
                personal contact details on untrusted websites.
              </div>
            </CardContent>
          </Card>

          {/* The scammer character */}
          <div
            aria-hidden
            className={`pointer-events-none absolute -top-4 left-0 z-20 ${
              stealing ? "animate-scammer-run opacity-100" : "opacity-0"
            }`}
            style={{ animationDuration: "6.8s" }}
          >
            <div className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-destructive/20 border-2 border-destructive shadow-lg">
                <UserX className="w-8 h-8 text-destructive" />
              </div>
              <div className="mt-1 px-2 py-0.5 rounded-md bg-destructive text-destructive-foreground text-[10px] font-bold whitespace-nowrap">
                SCAMMER!
              </div>
              {/* "Stolen" envelope being dragged */}
              <div className="mt-1 p-1.5 rounded-md bg-warning/30 border border-warning">
                <Mail className="w-4 h-4 text-warning" />
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 italic">
          Tip: A scammer runs by every few seconds and "drags" you back home —
          a playful reminder that phishing always lurks in the background.
        </p>
      </div>
    </section>
  );
};
