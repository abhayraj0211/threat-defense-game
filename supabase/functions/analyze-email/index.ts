import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emailContent } = await req.json();

    if (!emailContent || typeof emailContent !== "string") {
      return new Response(
        JSON.stringify({ error: "emailContent is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert cybersecurity analyst specializing in phishing email detection.
Analyze the provided email content for phishing indicators including:
- Social engineering tactics (urgency, fear, authority impersonation)
- Suspicious URLs, domains, or sender addresses
- Requests for sensitive information (passwords, SSN, credit cards)
- Grammar/spelling anomalies typical of phishing
- Brand impersonation
- Unusual attachments or download requests
- Mismatched display names vs actual addresses
- Generic greetings, suspicious offers, or threats

Be precise, thorough, and conservative. Only mark as phishing when there are clear indicators.`;

    const userPrompt = `Analyze this email and respond with a structured assessment:

---EMAIL START---
${emailContent.substring(0, 6000)}
---EMAIL END---`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-5-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "report_phishing_assessment",
                description:
                  "Report the phishing analysis results in a structured format.",
                parameters: {
                  type: "object",
                  properties: {
                    isPhishing: {
                      type: "boolean",
                      description:
                        "True if the email is likely a phishing attempt.",
                    },
                    confidence: {
                      type: "number",
                      description:
                        "Confidence score from 0 to 100 indicating certainty of the verdict.",
                    },
                    riskLevel: {
                      type: "string",
                      enum: ["low", "medium", "high", "critical"],
                      description: "Overall risk level.",
                    },
                    indicators: {
                      type: "array",
                      items: { type: "string" },
                      description:
                        "List of specific phishing indicators found in the email (3-8 items). Each should be a clear, concise observation.",
                    },
                    recommendation: {
                      type: "string",
                      description:
                        "Actionable recommendation for the user (2-3 sentences).",
                    },
                    summary: {
                      type: "string",
                      description:
                        "One-sentence summary of why this email is or isn't phishing.",
                    },
                  },
                  required: [
                    "isPhishing",
                    "confidence",
                    "riskLevel",
                    "indicators",
                    "recommendation",
                    "summary",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "report_phishing_assessment" },
          },
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please wait a moment and try again.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error:
              "AI credits exhausted. Please add credits to continue using AI analysis.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const data = await response.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "AI did not return a structured response" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-email error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
