
import { GoogleGenAI, Type } from "@google/genai";

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
          // Fix: Use propertyOrdering instead of required in responseSchema
          propertyOrdering: ["accuracy", "status", "context"]
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
 * Implements the user's exact "Visual Refinement" requirements.
 */
export const cleanProductImage = async (base64Data: string, mimeType: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Exact prompt requested by user
    const cleaningPrompt = `Edit this product image for my app: remove all extra wording, UI text, badges, prices, ratings, and background text. Keep only the text that is printed on the actual product packaging/label.
    Requirements:
    1. Crop to the product only (no phone status bar, Amazon page text, borders, or extra white space).
    2. Keep the product label and branding sharp and readable.
    3. Clean pure background (solid white).
    4. Center the product, consistent scale across images.
    5. Do not add any new text or graphics.`;

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
    const prompt = `High-quality realistic professional product photography of "${productName}" by ${brand}. 
    Description: ${description}. 
    The product is in its original retail packaging, shown clearly on a clean, minimal, warm taupe studio background. 
    Natural soft studio lighting, sharp focus. 8k resolution.`;

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
    // Fix: Mandatory check for API key selection when using gemini-3-pro-image-preview
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }
    
    // Fix: Always create a fresh instance right before use to capture latest API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Find actual visual appearance of "${storeName}" at "${address}" in Houston's ${neighborhood}. 
    Then, generate a high-end, professional architectural photograph of this specific storefront. 
    Architecture: Modern boutique, elegant sign. Golden hour lighting. 8k.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        },
        // Fix: Use 'googleSearch' instead of 'google_search' to match @google/genai ToolUnion type
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
    // Fix: If request fails due to missing entity, prompt user to select key again
    if (error.message && error.message.includes("Requested entity was not found.")) {
       await (window as any).aistudio.openSelectKey();
    }
    throw error;
  }
};
