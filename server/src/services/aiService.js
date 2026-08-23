import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export const generatePreVisitSummary = async (symptoms) => {
  if (!symptoms || !symptoms.trim()) {
    throw new Error("Symptoms are required for AI analysis");
  }

  const prompt = `
Analyse the following patient symptoms and return a structured
pre-visit summary for a doctor.

Symptoms:
${symptoms}

Return ONLY valid JSON in exactly this format:

{
  "urgencyLevel": "Low",
  "chiefComplaint": "brief description",
  "suggestedQuestions": [
    "question 1",
    "question 2",
    "question 3"
  ]
}

Rules:
- urgencyLevel must be exactly one of: Low, Medium, High
- chiefComplaint should be concise
- suggestedQuestions must contain exactly 3 questions
- Do not include markdown
- Do not include explanations outside the JSON
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt
    });

    const text = response.text?.trim();

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const result = JSON.parse(cleanedText);

    if (
      !["Low", "Medium", "High"].includes(result.urgencyLevel)
    ) {
      throw new Error("Invalid urgency level returned by AI");
    }

    if (
      !result.chiefComplaint ||
      !Array.isArray(result.suggestedQuestions) ||
      result.suggestedQuestions.length !== 3
    ) {
      throw new Error("Invalid AI response structure");
    }

    return result;

  } catch (error) {
    console.error("Pre-visit AI error:", error);

    return null;
  }
};

export const generatePostVisitSummary = async (clinicalNotes) => {
  if (!clinicalNotes || !clinicalNotes.trim()) {
    throw new Error("Clinical notes are required for AI analysis");
  }

  const prompt = `
Convert the following clinical notes into a patient-friendly summary.

Clinical Notes:
${clinicalNotes}

Return ONLY valid JSON in exactly this format:

{
  "patientSummary": "clear and simple explanation of the visit",
  "medicationSchedule": "simple explanation of how medications should be taken",
  "followUpSteps": "clear follow-up instructions for the patient"
}

Rules:
- Use simple language that a patient can understand.
- Do not invent medications or medical information that is not present in the notes.
- If medication information is not present, say "No medication instructions provided."
- If follow-up information is not present, say "No specific follow-up instructions provided."
- Do not include markdown.
- Do not include explanations outside the JSON.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt
    });

    const text = response.text?.trim();

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const result = JSON.parse(cleanedText);

    if (
      !result.patientSummary ||
      !result.medicationSchedule ||
      !result.followUpSteps
    ) {
      throw new Error("Invalid post-visit AI response structure");
    }

    return result;

  } catch (error) {
    console.error("Post-visit AI error:", error);

    return null;
  }
};