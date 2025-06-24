import { createGoogleGenerativeAI } from "@ai-sdk/google";

const provider = createGoogleGenerativeAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });
   
export const google_model = provider("gemini-2.5-flash");