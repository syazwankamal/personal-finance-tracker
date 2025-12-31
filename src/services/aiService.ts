import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ExtractedExpense {
    name: string;
    amount: number;
    category: string;
    date: string; // ISO string
    notes: string;
    confidence: "high" | "low";
    missingFields: string[];
}

const SYSTEM_PROMPT = `
You are a personal finance assistant. Your job is to extract expense data from natural language input.
The user is spending in Malaysian Ringgit (RM).

Current Categories: {CATEGORIES}
Current Date: {CURRENT_DATE}

Output ONLY a JSON object with this schema:
{
  "name": "string (merchant or item name)",
  "amount": number (positive float),
  "category": "string (must be one of the provided categories, or 'Others')",
  "date": "string (ISO 8601 format)",
  "notes": "string (any additional context)",
  "confidence": "high" | "low",
  "missingFields": ["list of important missing fields like 'amount' or 'category'"]
}

If the user says something ambiguous, set confidence to "low" and list the missing fields.
If only an amount is provided, name it "Miscellaneous".
If no amount is provided, set it to 0 and list 'amount' in missingFields.
`;

export const extractExpenseWithAI = async (
    apiKey: string,
    input: string,
    categories: string[]
): Promise<ExtractedExpense> => {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = SYSTEM_PROMPT
        .replace("{CATEGORIES}", categories.join(", "))
        .replace("{CURRENT_DATE}", new Date().toISOString());

    const result = await model.generateContent([prompt, `User Input: "${input}"`]);
    const response = await result.response;
    const text = response.text();

    // Clean up JSON if Gemini wraps it in markdown blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("Could not parse AI response as JSON");
    }

    return JSON.parse(jsonMatch[0]) as ExtractedExpense;
};
