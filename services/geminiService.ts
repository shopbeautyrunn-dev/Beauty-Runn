
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
        thinkingConfig: { thinkingBudget: 100 },
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

/**
 * Generates a realistic product photography visual for a beauty item.
 * Uses gemini-2.5-flash-image for standard catalog quality.
 */
export const generateRealisticProductVisual = async (productName: string, brand: string, description: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `High-quality realistic professional product photography of "${productName}" by ${brand}. 
    Description: ${description}. 
    The product is in its original retail packaging, shown clearly on a clean, minimal, warm taupe studio background that matches a high-end beauty app. 
    Natural soft studio lighting, sharp focus on packaging details, authentic labels, elegant presentation. 8k resolution.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
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
    return null;
  } catch (error) {
    console.error("Product Visual Generation Error:", error);
    return null;
  }
};

/**
 * Generates a Grounded Storefront Visual.
 * Uses google_search tool to find actual visual info about the store 
 * and then generates a reconstructed high-fidelity image.
 */
export const generateStorefrontImage = async (storeName: string, address: string, neighborhood: string) => {
  try {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // First, we prompt the model to "look up" the actual appearance using Search Grounding
    // and then generate based on that visual data.
    const prompt = `Use Google Search to find the actual visual appearance, signage, and storefront architecture of the beauty supply store "${storeName}" located at "${address}" in Houston's ${neighborhood} neighborhood. 
    Then, generate a high-end, professional architectural photograph of this specific storefront. 
    The image should feature the store's actual sign and building style. 
    Aesthetic: Luxurious, clean, cinematic lighting, golden hour. 8k resolution. 
    If specific details are unavailable, generate a professional architectural placeholder with the sign clearly displaying "${storeName}" on an elegant warm-taupe storefront.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        },
        // Fix: Use 'google_search' tool key for image generation grounding tasks per guidelines
        tools: [{ google_search: {} }] 
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    throw new Error("No image data returned from Gemini");
  } catch (error) {
    console.error("Storefront Generation Error:", error);
    throw error;
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

export const getMarketPriceEstimation = async (productName: string, category: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What is the typical average retail price range for "${productName}" in the "${category}" category at local independent beauty supply stores in Houston, TX? Provide only the range in USD, e.g. "$4.99 - $6.99".`,
      config: {
        // Fix: Always set thinkingBudget when maxOutputTokens is configured to avoid empty responses
        maxOutputTokens: 50,
        thinkingConfig: { thinkingBudget: 25 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Price Estimation Error:", error);
    return "Market price varies by store location.";
  }
};
