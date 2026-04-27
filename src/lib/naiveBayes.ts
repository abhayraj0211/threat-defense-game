// Tiny in-browser Multinomial Naive Bayes trained on a small labeled email corpus.
// Built for educational comparison vs keyword + AI engines.

type Label = "phishing" | "safe";

const PHISHING_TRAINING: string[] = [
  "Urgent: Your account has been suspended. Click here to verify your identity immediately.",
  "Dear customer, your bank account is locked. Confirm your details within 24 hours.",
  "Congratulations! You have won a $1000 gift card. Claim your prize now.",
  "Your PayPal account has unusual activity. Login to secure your account.",
  "Final notice: your subscription will expire today. Update your payment information.",
  "We detected a login from a new device. Verify it was you by clicking this link.",
  "Your package delivery failed. Please confirm your address to reschedule shipping.",
  "Microsoft support: your computer is infected with a virus. Call this number now.",
  "IRS notice: you are eligible for a tax refund. Submit your bank details to claim.",
  "Apple ID locked due to suspicious activity. Verify your account immediately.",
  "Your Netflix subscription has been put on hold. Update your billing details now.",
  "Action required: confirm your email address or your account will be deleted.",
  "Bank alert: unauthorized transaction detected. Click to dispute and recover funds.",
  "You have a pending wire transfer. Provide your bank credentials to release funds.",
  "Limited time offer! Double your investment with our crypto opportunity.",
  "Amazon: your order could not be delivered. Verify shipping address now.",
  "Security alert: change your password immediately to protect your account.",
  "Your inheritance of $5,000,000 is waiting. Reply with your personal details.",
  "Verify your account now or lose access permanently within 24 hours.",
  "Click here to claim your free iPhone 15. Limited stock available.",
  "WhatsApp account verification: enter the 6 digit OTP you just received.",
  "KYC update pending. Submit your Aadhaar and PAN to keep your account active.",
  "Your UPI account will be suspended. Update your UPI PIN immediately.",
  "Govt grant approved. Pay processing fee of $50 to receive your funds.",
  "Court notice: legal action will be taken if you do not respond in 24 hours.",
  "Your card has been blocked due to suspicious activity. Reactivate now.",
  "Police complaint registered against you. Click the link to view details.",
  "FedEx: customs clearance fee required to release your package.",
  "Job offer with $5000 weekly salary. Send your resume and bank details.",
  "Your domain is about to expire. Renew through this link to avoid losing it.",
  "Important: your CEO needs you to buy gift cards urgently. Reply ASAP.",
  "You have unread secure messages from your bank. Login to view immediately.",
  "Verification required for your social media account. Confirm identity now.",
  "Your cloud storage is full. Upgrade now or lose all your files.",
  "Reset your password by clicking on this link within the next hour.",
  "We need to confirm your billing details. Update your card on file.",
  "Suspicious sign in attempt detected. Verify it was you to keep your account safe.",
  "You have a refund of $250 pending. Provide your card details to receive it.",
  "Your Office 365 license has expired. Renew immediately to avoid disruption.",
  "Action needed: re-authenticate your email account or lose all messages.",
  "Pay the small fee and unlock your unclaimed lottery winnings of one million dollars.",
  "Your iCloud has been compromised. Sign in here to secure your photos and data.",
  "Bank security: confirm your OTP, CVV and card number to stop fraud transactions.",
  "Free crypto airdrop! Connect your wallet to claim your tokens.",
  "Your boss needs an urgent favor — are you available to help right now?",
  "Tax authority: pay outstanding dues today to avoid arrest warrant.",
  "Document shared with you. Sign in with your Microsoft credentials to view it.",
  "Final reminder: account verification expires today. Complete it now.",
  "Update your shipping information to receive your prize delivery.",
  "Suspicious purchase of $999 detected. Click here to dispute the charge.",
];

const SAFE_TRAINING: string[] = [
  "Hi team, sharing the meeting notes from today's standup. Let me know your thoughts.",
  "Reminder: lunch and learn tomorrow at noon in the main conference room.",
  "Thanks for the great presentation yesterday. Looking forward to working together.",
  "Your monthly newsletter is here with product updates and team announcements.",
  "Welcome to the team! Here is your onboarding checklist for the first week.",
  "Project update: phase one is complete. Moving on to phase two next Monday.",
  "Could you please review the attached design draft before our Friday meeting?",
  "Happy birthday from all of us at the office. Hope you have a wonderful day.",
  "The quarterly report has been published on the company portal for review.",
  "Just confirming our coffee chat for Thursday at 3 pm. See you then.",
  "Following up on our conversation last week about the marketing roadmap.",
  "Here is the agenda for tomorrow's planning workshop. See attachment.",
  "Your appointment with Dr. Smith is confirmed for May 5th at 10 am.",
  "Thanks for signing up. Your subscription is active and ready to use.",
  "Reminder that the office will be closed on Monday for the public holiday.",
  "Could we move our 2 pm meeting to 3 pm? I have a small conflict.",
  "Your invoice for May has been generated and is available in the dashboard.",
  "Looking forward to seeing you at the conference next month in Mumbai.",
  "Sharing the recipe we talked about last weekend. Enjoy and let me know.",
  "Just a quick note to say thank you for your help with the launch.",
  "Please find the contract draft attached for your legal team to review.",
  "Mom, can you pick up some milk and bread on your way home today?",
  "Sprint retro is scheduled for Friday at 4 pm. Please add your notes.",
  "Reminder: performance reviews are due by the end of this month.",
  "The library books you reserved are ready to pick up at the front desk.",
  "Thanks again for dinner last night. We had a really lovely time.",
  "Your flight booking is confirmed. Boarding pass attached to this email.",
  "Hey, are you free this weekend? We were thinking of going hiking.",
  "I have updated the shared spreadsheet with the latest survey responses.",
  "The meeting room booking has been confirmed for Wednesday morning.",
  "Wishing you and your family a wonderful holiday season this year.",
  "Please find the minutes of yesterday's board meeting attached.",
  "Just wanted to check in and see how you are doing this week.",
  "The new coffee machine has arrived in the breakroom. Enjoy!",
  "Reminder to submit your timesheets before Friday end of day.",
  "Your support ticket has been resolved. Please reply if you need further help.",
  "Quick question about the budget proposal — do you have five minutes today?",
  "Thanks for the referral. The candidate had a great first interview.",
  "Sharing the photos from our team offsite last weekend. So much fun.",
  "Your order has shipped and will arrive between Tuesday and Thursday.",
  "Hope you had a relaxing weekend. Catching up on emails this morning.",
  "The product roadmap review is scheduled for next Tuesday at 10 am.",
  "Let me know what time works best for you to discuss the proposal.",
  "Thanks for the kind words. It was a pleasure working with you on this.",
  "Reminder that company swag is available in the lobby until Friday.",
  "Could you share the slide deck from last week's all hands meeting?",
  "We loved your portfolio. Are you available for a 30 minute interview?",
  "Just confirming the dinner reservation for Saturday at 7 pm for four.",
  "Hey, the test results came back fine. Nothing to worry about.",
  "Sharing the link to the recording in case you missed today's session.",
];

// ---------- Tokenization ----------
const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && t.length < 30);

// ---------- Train ----------
type Model = {
  vocab: Set<string>;
  classCounts: Record<Label, number>;
  wordCounts: Record<Label, Record<string, number>>;
  totalWords: Record<Label, number>;
};

const train = (): Model => {
  const model: Model = {
    vocab: new Set(),
    classCounts: { phishing: 0, safe: 0 },
    wordCounts: { phishing: {}, safe: {} },
    totalWords: { phishing: 0, safe: 0 },
  };

  const ingest = (docs: string[], label: Label) => {
    for (const doc of docs) {
      model.classCounts[label] += 1;
      const tokens = tokenize(doc);
      for (const tok of tokens) {
        model.vocab.add(tok);
        model.wordCounts[label][tok] = (model.wordCounts[label][tok] ?? 0) + 1;
        model.totalWords[label] += 1;
      }
    }
  };

  ingest(PHISHING_TRAINING, "phishing");
  ingest(SAFE_TRAINING, "safe");
  return model;
};

const MODEL = train();
export const NB_TRAINING_SIZE =
  PHISHING_TRAINING.length + SAFE_TRAINING.length;
export const NB_VOCAB_SIZE = MODEL.vocab.size;

// ---------- Predict ----------
export type NBPrediction = {
  isPhishing: boolean;
  confidence: number; // 0..100, confidence in PHISHING class
  topPhishingTokens: string[];
  topSafeTokens: string[];
  totalDocs: number;
};

export const predictNaiveBayes = (text: string): NBPrediction => {
  const tokens = tokenize(text);
  const totalDocs = MODEL.classCounts.phishing + MODEL.classCounts.safe;
  const vocabSize = MODEL.vocab.size;

  // Log-priors
  let logPhishing = Math.log(MODEL.classCounts.phishing / totalDocs);
  let logSafe = Math.log(MODEL.classCounts.safe / totalDocs);

  // Track per-token contribution (log-likelihood ratio)
  const contribution: Record<string, number> = {};

  for (const tok of tokens) {
    const pCount = MODEL.wordCounts.phishing[tok] ?? 0;
    const sCount = MODEL.wordCounts.safe[tok] ?? 0;
    // Laplace smoothing
    const pProb = (pCount + 1) / (MODEL.totalWords.phishing + vocabSize);
    const sProb = (sCount + 1) / (MODEL.totalWords.safe + vocabSize);
    logPhishing += Math.log(pProb);
    logSafe += Math.log(sProb);
    contribution[tok] =
      (contribution[tok] ?? 0) + (Math.log(pProb) - Math.log(sProb));
  }

  // Convert to probability via stable softmax
  const max = Math.max(logPhishing, logSafe);
  const expP = Math.exp(logPhishing - max);
  const expS = Math.exp(logSafe - max);
  const probPhishing = expP / (expP + expS);

  const isPhishing = probPhishing > 0.5;
  const confidence = Math.round(
    (isPhishing ? probPhishing : 1 - probPhishing) * 100,
  );

  const sorted = Object.entries(contribution).sort((a, b) => b[1] - a[1]);
  const topPhishingTokens = sorted
    .filter(([, v]) => v > 0)
    .slice(0, 5)
    .map(([k]) => k);
  const topSafeTokens = sorted
    .filter(([, v]) => v < 0)
    .slice(-5)
    .reverse()
    .map(([k]) => k);

  return {
    isPhishing,
    confidence,
    topPhishingTokens,
    topSafeTokens,
    totalDocs,
  };
};
