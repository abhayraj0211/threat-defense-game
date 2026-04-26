import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, Lock, Eye, RefreshCw, AlertCircle, CheckCircle2, ArrowRight, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";

type Lang = "en" | "hi";

type Localized = {
  title: string;
  description: string;
  actions: string[];
  details: string;
  examples: string[];
};

type Tip = {
  icon: typeof Shield;
  en: Localized;
  hi: Localized;
};

export const PreventionTips = () => {
  const [openTip, setOpenTip] = useState<Tip | null>(null);
  // Per-card language map (id -> lang)
  const [cardLang, setCardLang] = useState<Record<number, Lang>>({});
  const [dialogLang, setDialogLang] = useState<Lang>("en");

  const tips: Tip[] = [
    {
      icon: Eye,
      en: {
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
      hi: {
        title: "भेजने वाले को सत्यापित करें",
        description: "हमेशा भेजने वाले का ईमेल पता ध्यान से जाँचें",
        actions: [
          "डोमेन में छोटी-मोटी स्पेलिंग गलतियाँ देखें",
          "लिंक पर माउस ले जाकर असली URL देखें",
          "जाँचें कि डोमेन आधिकारिक वेबसाइट से मिलता है या नहीं",
          "सामान्य अभिवादन से सावधान रहें",
        ],
        details:
          "हमलावर अक्सर मिलते-जुलते डोमेन का उपयोग करके भरोसेमंद ब्रांडों की नकल करते हैं। एक बदला हुआ अक्षर (rn बनाम m, 0 बनाम o) पहली नज़र में आसानी से छूट जाता है। केवल डिस्प्ले नाम नहीं, पूरा ईमेल पता जाँचें।",
        examples: [
          "support@arnaz0n.com (नकली) बनाम support@amazon.com (असली)",
          "no-reply@paypa1.com (नकली) बनाम no-reply@paypal.com (असली)",
          "नाम 'Microsoft' पर पता random@gmail.com है",
        ],
      },
    },
    {
      icon: Lock,
      en: {
        title: "Use Strong Authentication",
        description: "Enable multi-factor authentication (MFA) on all accounts",
        actions: [
          "Use authenticator apps instead of SMS",
          "Enable biometric authentication when available",
          "Use unique passwords for each account",
          "Consider using a password manager",
        ],
        details:
          "Even if your password is stolen in a phishing attack, MFA blocks the attacker from logging in. Authenticator apps (TOTP) and hardware keys (FIDO2) are far more secure than SMS, which can be intercepted via SIM-swap attacks.",
        examples: [
          "Google Authenticator, Authy, or 1Password for TOTP codes",
          "YubiKey or Titan Key for hardware-based MFA",
          "Bitwarden, 1Password, or KeePass for password management",
        ],
      },
      hi: {
        title: "मज़बूत प्रमाणीकरण का उपयोग करें",
        description: "सभी खातों पर मल्टी-फ़ैक्टर ऑथेंटिकेशन (MFA) सक्षम करें",
        actions: [
          "SMS के बजाय ऑथेंटिकेटर ऐप का उपयोग करें",
          "जहाँ उपलब्ध हो, बायोमेट्रिक प्रमाणीकरण चालू करें",
          "हर खाते के लिए अलग पासवर्ड रखें",
          "पासवर्ड मैनेजर का उपयोग करें",
        ],
        details:
          "अगर पासवर्ड चोरी भी हो जाए, तो MFA हमलावर को लॉगिन से रोकता है। ऑथेंटिकेटर ऐप और हार्डवेयर कीज़ SMS से कहीं ज़्यादा सुरक्षित हैं, क्योंकि SIM-स्वैप हमले से SMS पकड़ा जा सकता है।",
        examples: [
          "TOTP कोड के लिए Google Authenticator, Authy, या 1Password",
          "हार्डवेयर MFA के लिए YubiKey या Titan Key",
          "पासवर्ड के लिए Bitwarden, 1Password, या KeePass",
        ],
      },
    },
    {
      icon: Shield,
      en: {
        title: "Think Before You Click",
        description: "Never click suspicious links or download unknown attachments",
        actions: [
          "Manually type URLs instead of clicking links",
          "Scan attachments with antivirus software",
          "Verify requests through official channels",
          "Don't trust urgent or threatening messages",
        ],
        details:
          "A single click can install malware or land you on a credential-harvesting page. Hover over links to preview the destination. When in doubt, navigate directly by typing the official URL into your browser.",
        examples: [
          "Hovering reveals: 'Click here' → http://malicious-site.tk/login",
          "Invoice.pdf.exe — double extension to disguise an executable",
          "Word doc asking to 'Enable Editing' to run hidden macros",
        ],
      },
      hi: {
        title: "क्लिक करने से पहले सोचें",
        description: "संदिग्ध लिंक पर क्लिक न करें और अनजान अटैचमेंट डाउनलोड न करें",
        actions: [
          "लिंक पर क्लिक के बजाय URL खुद टाइप करें",
          "अटैचमेंट को एंटीवायरस से स्कैन करें",
          "आधिकारिक ज़रिये से अनुरोध की पुष्टि करें",
          "जल्दी या डरावने संदेशों पर भरोसा न करें",
        ],
        details:
          "एक क्लिक से मैलवेयर इंस्टॉल हो सकता है या आप पासवर्ड चुराने वाले पेज पर पहुँच सकते हैं। लिंक पर माउस ले जाकर असली पता देखें। संदेह हो तो खुद ब्राउज़र में URL टाइप करें।",
        examples: [
          "होवर पर दिखे: 'Click here' → http://malicious-site.tk/login",
          "Invoice.pdf.exe — दो एक्सटेंशन से छुपी हुई exe फ़ाइल",
          "Word फ़ाइल जो 'Enable Editing' दबाने को कहे और मैक्रो चलाए",
        ],
      },
    },
    {
      icon: RefreshCw,
      en: {
        title: "Keep Software Updated",
        description: "Regular updates patch security vulnerabilities",
        actions: [
          "Enable automatic updates for OS and browsers",
          "Update security software regularly",
          "Keep all applications up to date",
          "Use supported software versions only",
        ],
        details:
          "Phishing payloads often exploit known vulnerabilities in browsers, PDF readers, and Office apps. Vendors release patches monthly — running outdated software leaves the door wide open.",
        examples: [
          "Browser zero-days exploited within hours of disclosure",
          "Outdated Adobe Reader vulnerable to malicious PDFs",
          "Windows 7 / older macOS no longer receiving security patches",
        ],
      },
      hi: {
        title: "सॉफ़्टवेयर अपडेट रखें",
        description: "नियमित अपडेट सुरक्षा खामियों को ठीक करते हैं",
        actions: [
          "OS और ब्राउज़र के ऑटो-अपडेट चालू करें",
          "सुरक्षा सॉफ़्टवेयर समय-समय पर अपडेट करें",
          "सभी ऐप्स को अप-टू-डेट रखें",
          "केवल सपोर्टेड वर्शन ही उपयोग करें",
        ],
        details:
          "फ़िशिंग पेलोड अक्सर ब्राउज़र, PDF रीडर और Office ऐप्स की पुरानी खामियों का फ़ायदा उठाते हैं। कंपनियाँ हर महीने पैच जारी करती हैं — पुराना सॉफ़्टवेयर खुला दरवाज़ा होता है।",
        examples: [
          "ब्राउज़र की ज़ीरो-डे ख़ामियाँ कुछ ही घंटों में इस्तेमाल",
          "पुराना Adobe Reader, ख़तरनाक PDF का शिकार",
          "Windows 7 / पुराने macOS को अब सुरक्षा अपडेट नहीं मिलते",
        ],
      },
    },
    {
      icon: AlertCircle,
      en: {
        title: "Recognize Red Flags",
        description: "Be aware of common phishing indicators",
        actions: [
          "Urgency and pressure tactics",
          "Too good to be true offers",
          "Requests for sensitive information",
          "Poor grammar and spelling errors",
        ],
        details:
          "Phishing relies on emotional manipulation — fear, greed, urgency, curiosity. Legitimate organizations rarely ask you to act within minutes, never request passwords by email, and proofread their messages.",
        examples: [
          "'Your account will be closed in 24 hours unless you verify now'",
          "'Congratulations! You won $1,000,000 — claim immediately'",
          "'Dear costumer, kindly update you're informations urgent'",
        ],
      },
      hi: {
        title: "ख़तरे के संकेत पहचानें",
        description: "आम फ़िशिंग संकेतों से वाकिफ़ रहें",
        actions: [
          "जल्दबाज़ी और दबाव की रणनीति",
          "हद से ज़्यादा अच्छे लगने वाले ऑफ़र",
          "संवेदनशील जानकारी की माँग",
          "ख़राब व्याकरण और स्पेलिंग गलतियाँ",
        ],
        details:
          "फ़िशिंग भावनाओं पर खेलती है — डर, लालच, जल्दबाज़ी, उत्सुकता। असली संगठन कभी मिनटों में काम करने को नहीं कहते, ईमेल पर पासवर्ड नहीं माँगते, और संदेश ढंग से लिखते हैं।",
        examples: [
          "'अभी वेरीफ़ाई न किया तो 24 घंटे में खाता बंद हो जाएगा'",
          "'बधाई! आपने ₹1 करोड़ जीते — तुरंत क्लेम करें'",
          "'प्रिय कस्टमर, कृपया अपकी जानकारी जल्दी अपडेट करे'",
        ],
      },
    },
    {
      icon: CheckCircle2,
      en: {
        title: "Verify Before Acting",
        description: "Confirm through official channels before responding",
        actions: [
          "Call the company directly using official numbers",
          "Log in through official websites, not email links",
          "Verify with IT department for work emails",
          "Report suspicious emails to security team",
        ],
        details:
          "When you receive an unexpected request — a wire transfer, password reset, invoice change — pause and verify out-of-band. Look up the company's phone number from their official website, not from the email itself.",
        examples: [
          "CEO email asking for urgent gift cards → call the CEO directly",
          "Bank alert about suspicious activity → log in via the bank's app",
          "Vendor changing payment details → confirm via known phone number",
        ],
      },
      hi: {
        title: "कार्रवाई से पहले पुष्टि करें",
        description: "जवाब देने से पहले आधिकारिक माध्यम से पुष्टि करें",
        actions: [
          "कंपनी को आधिकारिक नंबर पर सीधे कॉल करें",
          "ईमेल लिंक के बजाय आधिकारिक वेबसाइट से लॉगिन करें",
          "ऑफ़िस ईमेल के लिए IT डिपार्टमेंट से पुष्टि करें",
          "संदिग्ध ईमेल सुरक्षा टीम को रिपोर्ट करें",
        ],
        details:
          "जब कोई अप्रत्याशित अनुरोध आए — पैसा भेजना, पासवर्ड रीसेट, बिल बदलाव — रुकें और दूसरे माध्यम से पुष्टि करें। ईमेल में दिए नंबर पर नहीं, आधिकारिक वेबसाइट से नंबर लें।",
        examples: [
          "CEO के नाम से गिफ़्ट कार्ड माँगने वाला ईमेल → खुद CEO को कॉल करें",
          "बैंक का संदिग्ध अलर्ट → बैंक के अपने ऐप से लॉगिन करें",
          "वेंडर का पेमेंट डिटेल बदलने का अनुरोध → ज्ञात नंबर पर पुष्टि करें",
        ],
      },
    },
  ];

  const sectionT = {
    en: {
      title: "Prevention",
      titleSuffix: " Best Practices",
      subtitle: "Click any card to explore detailed guidance and real-world examples",
      readMore: "Read more →",
      whyMatters: "Why it matters",
      checklist: "Action checklist",
      examples: "Real-world examples",
    },
    hi: {
      title: "रोकथाम",
      titleSuffix: " के सर्वोत्तम तरीक़े",
      subtitle: "विस्तार से जानने के लिए किसी भी कार्ड पर क्लिक करें",
      readMore: "और पढ़ें →",
      whyMatters: "यह क्यों ज़रूरी है",
      checklist: "कार्यवाही सूची",
      examples: "असली उदाहरण",
    },
  };

  // Use English meta-text by default for the section header (matches site default)
  const meta = sectionT.en;

  return (
    <section className="relative py-20 px-4">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-success">{meta.title}</span>
            {meta.titleSuffix}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {meta.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            const lang: Lang = cardLang[index] ?? "en";
            const t = tip[lang];
            const labels = sectionT[lang];

            return (
              <Card
                key={index}
                className="h-full border-2 hover:border-success/50 hover:shadow-lg transition-all group hover:-translate-y-1 duration-200 flex flex-col"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-3 rounded-lg bg-success/10 w-fit mb-3 group-hover:bg-success/20 transition-colors">
                      <Icon className="w-6 h-6 text-success" />
                    </div>
                    {/* Language toggle per card */}
                    <div className="flex items-center gap-1 p-0.5 rounded-md bg-muted text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCardLang({ ...cardLang, [index]: "en" });
                        }}
                        className={`px-2 py-1 rounded ${
                          lang === "en"
                            ? "bg-success text-success-foreground font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCardLang({ ...cardLang, [index]: "hi" });
                        }}
                        className={`px-2 py-1 rounded ${
                          lang === "hi"
                            ? "bg-success text-success-foreground font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        हिं
                      </button>
                    </div>
                  </div>
                  <CardTitle className="text-xl flex items-center justify-between gap-2">
                    <span>{t.title}</span>
                    <ArrowRight className="w-4 h-4 text-success opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </CardTitle>
                  <CardDescription>{t.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-2 flex-1">
                    {t.actions.map((action, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      setDialogLang(lang);
                      setOpenTip(tip);
                    }}
                    className="mt-4 text-xs font-medium text-success/80 hover:text-success text-left focus:outline-none"
                  >
                    {labels.readMore}
                  </button>
                </CardContent>
              </Card>
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
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-success/10">
                      <openTip.icon className="w-6 h-6 text-success" />
                    </div>
                    <DialogTitle className="text-2xl">
                      {openTip[dialogLang].title}
                    </DialogTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Languages className="w-4 h-4 text-muted-foreground" />
                    <Button
                      size="sm"
                      variant={dialogLang === "en" ? "default" : "ghost"}
                      onClick={() => setDialogLang("en")}
                    >
                      EN
                    </Button>
                    <Button
                      size="sm"
                      variant={dialogLang === "hi" ? "default" : "ghost"}
                      onClick={() => setDialogLang("hi")}
                    >
                      हिं
                    </Button>
                  </div>
                </div>
                <DialogDescription className="text-base">
                  {openTip[dialogLang].description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-2">
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">
                    {sectionT[dialogLang].whyMatters}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {openTip[dialogLang].details}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-foreground">
                    {sectionT[dialogLang].checklist}
                  </h4>
                  <ul className="space-y-2">
                    {openTip[dialogLang].actions.map((action, i) => (
                      <li key={i} className="text-sm flex items-start gap-2 p-2 rounded-md bg-success/5">
                        <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-foreground">
                    {sectionT[dialogLang].examples}
                  </h4>
                  <ul className="space-y-2">
                    {openTip[dialogLang].examples.map((ex, i) => (
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
