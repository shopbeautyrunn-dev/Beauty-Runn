
import { GoogleGenAI, Type } from "@google/genai";

export const getSmartProductSearch = async (query: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User is searching for professional beauty products in Houston via the "Beauty Runn" app: "${query}". 
      Suggest local neighborhood beauty supplies or salon-grade items found in Houston (e.g., 5th Ward, Sunnyside, Greenspoint). 
      Keep recommendations strictly limited to beauty: hair, wigs, extensions, tools.`,
      config: {
        maxOutputTokens: 250,
        thinkingConfig: { thinkingBudget: 100 },
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return "Curating Houston's finest beauty selections...";
  }
};

export const getBeautyAssistantResponse = async (userMessage: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction: "You are the lead concierge for Beauty Runn, a luxury beauty delivery service in Houston, TX. You have deep knowledge of Houston neighborhoods (Baytown, Sunnyside, etc.) and professional styling. Tone: Energetic, luxury-focused, professional. Strictly beauty products only.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Assistant Error:", error);
    return "Houston Beauty Runn concierge is standing by.";
  }
};
