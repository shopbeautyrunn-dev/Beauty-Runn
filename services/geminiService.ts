import { GoogleGenAI, Type } from "@google/genai";
import { GroundingSource } from "../types";

/**
 * Uses Gemini 2.5 Flash with Search and Maps grounding to act as a Beauty Concierge.
 * Gemini 2.5 series is required for Google Maps grounding support.
 */
export const askBeautyConcierge = async (prompt: string, userLat?: number, userLng?: number) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const config: any = {
      tools: [{ googleSearch: {} }, { googleMaps: {} }],
      systemInstruction: "You are the Beauty Runn Concierge, an elite AI advisor for Houston's local beauty scene. You help users find local independent beauty supply stores, recommend products (hair extensions, braiding hair, wigs, tools) for specific needs, and explain Houston neighborhood shopping zones (001-104). STRICT RULES: 1. ALWAYS prioritize local, independent shops over major chains (Sally, Ulta, Sephora, Walmart). 2. Use Google Search grounding for any real-time pricing or inventory queries. 3. Use Google Maps grounding to provide directions or proximity info. 4. Maintain a luxury, helpful, and professional tone."
    };

    if (userLat && userLng) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: userLat,
            longitude: userLng
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: config,
    });

    const text = response.text || "I'm sorry, I couldn't find an answer for that right now. Try rephrasing your beauty request!";
    
    // Extract grounding URLs for UI display
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        } else if (chunk.maps) {
          sources.push({ title: chunk.maps.title, uri: chunk.maps.uri });
        }
      });
    }

    return { text, sources };
  } catch (error) {
    console.error("Concierge AI Error:", error);
    return { text: "I'm having a little trouble connecting to my beauty database. Please check your network and try again!", sources: [] };
  }
};

/**
 * Uses Gemini to validate a store's neighborhood presence and status
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
      Return a JSON summary.`,
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
 * Uses Gemini 2.5 Flash Image to clean and refine a raw product screenshot.
 */
export const cleanProductImage = async (base64Data: string, mimeType: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const cleaningPrompt = `Edit this product image: remove all extra wording, UI text, and backgrounds. Keep only the product and its packaging labels. Solid white background.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: cleaningPrompt }
        ]
      },
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
    console.error("Image Cleaning Error:", error);
    return null;
  }
};

/**
 * Generates a realistic product photography visual for a beauty item.
 */
export const generateRealisticProductVisual = async (productName: string, brand: string, description: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Professional 8k product photography of "${productName}" by ${brand}. ${description}. Warm studio background.`;

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
 */
export const generateStorefrontImage = async (storeName: string, address: string, neighborhood: string) => {
  try {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Find visual appearance of "${storeName}" at "${address}" in Houston's ${neighborhood}. Then generate high-end architectural photography of it. Golden hour.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        },
        tools: [{ googleSearch: {} }] 
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data returned from Gemini");
  } catch (error: any) {
    console.error("Storefront Generation Error:", error);
    if (error.message && error.message.includes("Requested entity was not found.")) {
       await (window as any).aistudio.openSelectKey();
    }
    throw error;
  }
};