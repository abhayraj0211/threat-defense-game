import { Mail, Fish, Link2, AlertTriangle, KeyRound, ShieldAlert } from "lucide-react";

/**
 * Decorative, full-page background watermark.
 * Pastel-colored phishing-themed envelopes hang from hooks via ropes
 * and sway gently. Pointer-events disabled so it never interferes with UI.
 */

type Hanging = {
  left: string;          // horizontal position (%)
  ropeHeight: number;    // px length of rope
  size: number;          // envelope box size in px
  delay: string;         // animation-delay
  duration: string;      // animation-duration
  Icon: typeof Mail;
  tone: string;          // tailwind text color class for the icon
  bg: string;            // background tint class
};

const HANGINGS: Hanging[] = [
  { left: "6%",  ropeHeight: 80,  size: 56, delay: "0s",   duration: "5s", Icon: Mail,          tone: "text-primary/60",     bg: "bg-primary/10" },
  { left: "18%", ropeHeight: 140, size: 64, delay: "0.8s", duration: "6s", Icon: Fish,          tone: "text-warning/60",     bg: "bg-warning/10" },
  { left: "30%", ropeHeight: 60,  size: 48, delay: "1.4s", duration: "4.5s", Icon: KeyRound,    tone: "text-accent/60",      bg: "bg-accent/10" },
  { left: "44%", ropeHeight: 110, size: 60, delay: "0.4s", duration: "5.5s", Icon: Mail,        tone: "text-destructive/50", bg: "bg-destructive/10" },
  { left: "58%", ropeHeight: 90,  size: 52, delay: "2s",   duration: "4.8s", Icon: Link2,       tone: "text-success/60",     bg: "bg-success/10" },
  { left: "72%", ropeHeight: 160, size: 68, delay: "1.2s", duration: "6.5s", Icon: AlertTriangle, tone: "text-warning/60",   bg: "bg-warning/10" },
  { left: "84%", ropeHeight: 70,  size: 50, delay: "0.6s", duration: "5.2s", Icon: ShieldAlert, tone: "text-primary/55",     bg: "bg-primary/10" },
  { left: "94%", ropeHeight: 120, size: 58, delay: "1.8s", duration: "5.8s", Icon: Mail,        tone: "text-accent/55",      bg: "bg-accent/10" },
];

export const PhishingWatermark = () => {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-50"
    >
      {/* Top "ceiling beam" — subtle horizontal line for hooks to hang from */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

      {HANGINGS.map((h, i) => {
        const Icon = h.Icon;
        return (
          <div
            key={i}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: h.left, transform: "translateX(-50%)" }}
          >
            {/* Hook */}
            <div className="w-3 h-3 rounded-full border-2 border-foreground/25 bg-background/60 -mb-[1px]" />

            {/* Rope */}
            <div
              className="w-[2px] bg-gradient-to-b from-foreground/30 to-foreground/15"
              style={{ height: `${h.ropeHeight}px` }}
            />

            {/* Swaying envelope/icon */}
            <div
              className="origin-top animate-sway-slow"
              style={{
                animationDelay: h.delay,
                animationDuration: h.duration,
              }}
            >
              <div
                className={`mt-1 rounded-xl border border-foreground/15 backdrop-blur-sm flex items-center justify-center shadow-lg ${h.bg}`}
                style={{ width: `${h.size}px`, height: `${h.size}px` }}
              >
                <Icon
                  className={h.tone}
                  style={{ width: `${h.size * 0.5}px`, height: `${h.size * 0.5}px` }}
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Floating background blobs for soft pastel atmosphere */}
      <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl animate-float-y" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-float-y"
        style={{ animationDelay: "2s" }}
      />
    </div>
  );
};
