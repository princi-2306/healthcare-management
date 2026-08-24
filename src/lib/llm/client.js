import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 2;

/**
 * Call the Gemini LLM with timeout and retry logic
 */
export async function callLLM({
  systemPrompt,
  userMessage,
  maxTokens = 1024,
  temperature = 0.3,
  timeout = DEFAULT_TIMEOUT,
  retries = MAX_RETRIES,
}) {
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-3.6-flash",
        systemInstruction: systemPrompt,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature,
        },
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
      });

      clearTimeout(timeoutId);

      const response = result.response;
      let text = response.text() || "";

      // Strip markdown block formatting if present (```json ... ```)
      text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();

      return {
        success: true,
        text,
        usage: {
          inputTokens: response.usageMetadata?.promptTokenCount,
          outputTokens: response.usageMetadata?.candidatesTokenCount,
        },
      };
    } catch (error) {
      lastError = error;
      console.error(
        `LLM call attempt ${attempt + 1} failed:`,
        error.message
      );

      if (attempt < retries) {
        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || "LLM call failed after all retries",
  };
}

export default genAI;
