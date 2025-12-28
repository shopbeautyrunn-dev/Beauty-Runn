
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the GoogleGenAI client using the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartProductSearch = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User is searching for professional beauty products in the "Beauty Runn" app with this query: "${query}". 
      Based on their intent, suggest specific product categories or salon-grade items they might be looking for. 
      Return the results in a helpful, vibrant, and professional beauty-expert tone.`,
      config: {
        maxOutputTokens: 150,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return "Curating professional beauty selections for you...";
  }
};

export const getBeautyAssistantResponse = async (userMessage: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction: "You are Beauty Runn's professional concierge. You assist salon owners and beauty enthusiasts with supply orders, logistics, and professional product recommendations. Your tone is energetic, professional, and concise. Reference the app as 'Beauty Runn'.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Assistant Error:", error);
    return "Our concierge service is at your disposal. How can I help your Runn today?";
  }
};
