import "server-only";

import Groq from "groq-sdk";

const groqApiKey = process.env.GROQ_API_KEY;

function getGroq(): Groq {
  if (!groqApiKey) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it to your environment variables.",
    );
  }
  return new Groq({ apiKey: groqApiKey });
}

const ANALYSIS_MODEL = "llama-3.3-70b-versatile";

export type AnalysisResult = {
  summary: string;
  flags: string[];
  recommendation: string;
};

/**
 * Analyze a flagged (or any) submission to identify potential issues or
 * highlight red flags. Returns a structured assessment.
 */
export async function analyzeSubmission(
  survey: Record<string, unknown>,
): Promise<AnalysisResult> {
  const groq = getGroq();

  const prompt = `You are an AI assistant for the National Ozone Unit (NOU) and HEVACRAZ RAC Technician Registry in Zimbabwe.
Analyse the following technician survey submission and provide a structured assessment.

Survey data (JSON):
\`\`\`json
${JSON.stringify(survey, null, 2)}
\`\`\`

Respond with a JSON object containing exactly three fields:
1. "summary" — a 2-3 sentence plain-text summary of the technician's profile and anything notable.
2. "flags" — an array of short flag descriptions if there are any concerns (e.g., missing email, unusual values, inconsistent answers, potential duplicate). If everything looks normal, return an empty array.
3. "recommendation" — a short plain-text recommendation: "approve", "request more info", or "flag for manual review".

Return ONLY valid JSON, no markdown formatting.`;

  const completion = await groq.chat.completions.create({
    model: ANALYSIS_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content ?? "{}";

  try {
    const parsed = JSON.parse(text) as Partial<AnalysisResult>;
    return {
      summary: parsed.summary ?? "No analysis available.",
      flags: parsed.flags ?? [],
      recommendation: parsed.recommendation ?? "manual review",
    };
  } catch {
    return {
      summary: "Failed to parse AI response.",
      flags: [],
      recommendation: "manual review",
    };
  }
}

export type InsightSummary = {
  overview: string;
  keyFindings: string[];
  recommendations: string[];
};

/**
 * Generate a natural-language summary/overview of the insights data.
 * Useful for the admin insights page or report exports.
 */
export async function generateInsightSummary(
  sampleSize: number,
  dataSummary: Record<string, unknown>,
): Promise<InsightSummary> {
  const groq = getGroq();

  const prompt = `You are an AI data analyst for the NOU and HEVACRAZ RAC Technician Registry in Zimbabwe.
Analyse the following survey analytics data and produce a concise executive summary.

Sample size: ${sampleSize.toLocaleString()}

Data summary (JSON):
\`\`\`json
${JSON.stringify(dataSummary, null, 2)}
\`\`\`

Respond with a JSON object containing exactly three fields:
1. "overview" — a 2-3 sentence plain-text overview of the current state of the technician workforce.
2. "keyFindings" — an array of 3-5 key findings, each a short phrase or sentence.
3. "recommendations" — an array of 2-3 actionable recommendations for NOU/HEVACRAZ.

Return ONLY valid JSON, no markdown formatting.`;

  const completion = await groq.chat.completions.create({
    model: ANALYSIS_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content ?? "{}";

  try {
    const parsed = JSON.parse(text) as Partial<InsightSummary>;
    return {
      overview: parsed.overview ?? "No overview available.",
      keyFindings: parsed.keyFindings ?? [],
      recommendations: parsed.recommendations ?? [],
    };
  } catch {
    return {
      overview: "Failed to parse AI response.",
      keyFindings: [],
      recommendations: [],
    };
  }
}
