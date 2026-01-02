
import { GoogleGenAI } from "@google/genai";

// Houston ZIP center coordinates (Approximated for high-performance mapping)
export const HOUSTON_ZIP_COORDS: Record<string, { lat: number, lng: number }> = {
  '77002': { lat: 29.7568, lng: -95.3656 }, // Downtown
  '77004': { lat: 29.7248, lng: -95.3637 }, // 3rd Ward
  '77021': { lat: 29.6892, lng: -95.3486 }, // Sunnyside
  '77026': { lat: 29.8016, lng: -95.3323 }, // 5th Ward
  '77060': { lat: 29.9405, lng: -95.4056 }, // Greenspoint
  '77008': { lat: 29.8055, lng: -95.4144 }, // The Heights
  '77581': { lat: 29.5636, lng: -95.2860 }, // Pearland
  '77478': { lat: 29.6010, lng: -95.6025 }, // Sugar Land
  '77019': { lat: 29.7551, lng: -95.4056 }, // River Oaks
  '77036': { lat: 29.7042, lng: -95.5323 }, // Sharpstown
};

// Houston Bounding Box for SVG Projections
export const HOUSTON_BOUNDS = {
  minLat: 29.5, maxLat: 30.1,
  minLng: -95.7, maxLng: -95.2
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3958.8; // Radius of Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const validateStoresWithGemini = async (zip: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Search for local beauty supply stores near Houston ZIP ${zip}. Verify their real addresses and current status.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: HOUSTON_ZIP_COORDS[zip] || HOUSTON_ZIP_COORDS['77002']
          }
        }
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Location Validation Error:", error);
    return null;
  }
};
