import "server-only";

import Groq from "groq-sdk";

const groqApiKey = process.env.GROQ_API_KEY;

function getGroq(): Groq {
  if (!groqApiKey) {
    throw new Error("GROQ_API_KEY is not set. Add it to your environment variables.");
  }
  return new Groq({ apiKey: groqApiKey });
}

const ANALYSIS_MODEL = "llama-3.3-70b-versatile";

export type SurveyReportAiSummary = {
  overview: string;
  keyFindings: string[];
  riskAreas: string[];
  opportunities: string[];
  recommendedInterventions: string[];
  priorityActions: string[];
};

export async function generateSurveyReportSummary(
  dataSummary: Record<string, unknown>,
  totalResponses: number,
): Promise<SurveyReportAiSummary> {
  const groq = getGroq();

  const prompt = `You are a senior institutional survey analyst producing an executive report for the National Ozone Unit (NOU) and HEVACRAZ, working under the guidance of UNEP. Your audience is government officials, UNEP programme officers, and HEVACRAZ leadership.

Analyse the following RAC (Refrigeration and Air Conditioning) technician survey data from Zimbabwe. This is NOT a revenue, sales, orders, or payment report — it is a technician workforce skills and readiness assessment.

Focus your analysis on:
- National workforce profile: who responded, where they are, their experience levels
- Skills gaps: formal training rates, certification levels, confidence in traditional vs low-GWP refrigerants
- Regional disparities: differences across Zimbabwe's provinces in training, tools access, and readiness
- Tools and equipment: access to tools, spare parts, low-GWP refrigerants, recovery equipment, PPE
- Key challenges: daily operational hurdles, load shedding impact, market obstacles (import costs, forex, counterfeit products)
- Safety and compliance: PPE access, EHS barriers, recovery equipment usage
- Readiness for the transition to low-GWP refrigerants under the Kigali Amendment to the Montreal Protocol

Total technicians surveyed: ${totalResponses}

Survey data summary (JSON):
\`\`\`json
${JSON.stringify(dataSummary, null, 2)}
\`\`\`

Provide specific, evidence-based observations referencing actual data points (percentages, counts, provincial disparities, Likert scores).

Respond with a JSON object containing exactly six fields:
1. "overview" — a 3-5 sentence executive summary written in the style of a UN/institutional assessment report. Describe the overall workforce readiness, key strengths, and critical gaps. Mention provincial distribution and any notable disparities.
2. "keyFindings" — an array of 5-7 key findings. Each must be a specific, evidence-based statement referencing actual percentages or counts from the data. Include at least one province-specific finding if data shows regional variation.
3. "riskAreas" — an array of 2-4 risk areas. Examples: low certification rates, poor PPE access in certain provinces, low confidence in low-GWP refrigerants, market obstacles affecting service quality.
4. "opportunities" — an array of 2-4 opportunities. Examples: demand for upskilling, high engagement rates, potential for targeted provincial interventions, youth or gender inclusion opportunities.
5. "recommendedInterventions" — an array of 3-5 specific, actionable interventions for NOU/HEVACRAZ consideration based solely on the data provided. Example: "Province-specific training programmes in provinces with the highest training gaps."
6. "priorityActions" — an array of 2-3 immediate priority actions ranked by urgency.

Do NOT invent data. If the data shows gaps, state them. If data is insufficient for a conclusion, say so. Write in a professional, analytical tone appropriate for a UN partner organisation report.

Return ONLY valid JSON, no markdown formatting.`;

  const completion = await groq.chat.completions.create({
    model: ANALYSIS_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content ?? "{}";

  try {
    const parsed = JSON.parse(text) as Partial<SurveyReportAiSummary>;
    return {
      overview: parsed.overview ?? "No analysis available.",
      keyFindings: parsed.keyFindings ?? [],
      riskAreas: parsed.riskAreas ?? [],
      opportunities: parsed.opportunities ?? [],
      recommendedInterventions: parsed.recommendedInterventions ?? [],
      priorityActions: parsed.priorityActions ?? [],
    };
  } catch {
    return {
      overview: "Failed to generate analysis summary.",
      keyFindings: [],
      riskAreas: [],
      opportunities: [],
      recommendedInterventions: [],
      priorityActions: [],
    };
  }
}
