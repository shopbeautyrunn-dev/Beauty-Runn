
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Uses Gemini to validate a store's neighborhood presence and status
 * without illegal scraping, relying on model training data and tools.
 */
export const validateStoreAuthenticity = async (storeName: string, address: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a neighborhood validation for the following Houston retail location:
      Store: "${storeName}"
      Address: "${address}"
      
      Verify if this is a known neighborhood anchor for beauty supply. 
      Return a JSON-like summary including:
      1. Neighborhood accuracy (High/Med/Low)
      2. Verification Status
      3. Brief neighborhood context (e.g., "Well-known staple in the historic 3rd Ward area").`,
      config: {
        maxOutputTokens: 200,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            accuracy: { type: Type.STRING },
            status: { type: Type.STRING },
            context: { type: Type.STRING }
          },
          required: ["accuracy", "status", "context"]
        }
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Validation Error:", error);
    return { accuracy: "N/A", status: "PENDING", context: "Verification in progress..." };
  }
};

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

export const generateStorefrontImage = async (storeName: string, neighborhood: string) => {
  try {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `A professional, high-end storefront of a beauty supply store named "${storeName}" in the ${neighborhood} neighborhood of Houston. The store sign is elegant and prominently displays "${storeName}". The architecture is modern and inviting, featuring large clean windows with high-end beauty displays inside. Soft cinematic lighting, golden hour, architectural photography, 8k resolution, consistent with a luxury delivery app aesthetic.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Storefront Generation Error:", error);
    throw error;
  }
};

export const getMarketPriceEstimation = async (productName: string, category: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What is the typical average retail price range for "${productName}" in the "${category}" category at local independent beauty supply stores in Houston, TX? Provide only the range in USD, e.g. "$4.99 - $6.99".`,
      config: {
        maxOutputTokens: 50
      }
    });
    return response.text;
  } catch (error) {
    console.error("Price Estimation Error:", error);
    return "Market price varies by store location.";
  }
};
