import { GoogleGenAI } from "@google/genai";
import { Area, ZipCode, BeautyVendor } from "../types";
import { AREAS, ZIP_CODES, VENDORS } from "../constants";

// Cache for zip code results to improve performance
const zipCache: Record<string, BeautyVendor[]> = {};

export const HOUSTON_BOUNDS = {
  minLat: 29.5,
  maxLat: 30.1,
  minLng: -95.9,
  maxLng: -95.0
};

export const HOUSTON_ZIP_COORDS: Record<string, { lat: number, lng: number }> = ZIP_CODES.reduce((acc, z) => ({
  ...acc,
  [z.zip]: { lat: z.lat, lng: z.lng }
}), {});

/**
 * Calculates distance between two points in miles using Haversine formula
 */
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

/**
 * Store Discovery Engine
 * Prioritizes:
 * 1. Exact Zip Matches
 * 2. Neighborhood Area Matches
 * 3. Proximity Fallback
 */
export const getStoresByZip = (userZip: string, radiusMiles: number = 10, includeMajorChains: boolean = false): BeautyVendor[] => {
  const cacheKey = `${userZip}-${radiusMiles}-${includeMajorChains}`;
  if (zipCache[cacheKey]) return zipCache[cacheKey];

  const userZipData = ZIP_CODES.find(z => z.zip === userZip);
  if (!userZipData) return [];

  const userAreaId = userZipData.area_id;
  const { lat: uLat, lng: uLng } = userZipData;

  // Filter for local independent shops only
  const filteredVendors = includeMajorChains 
    ? VENDORS 
    : VENDORS.filter(v => v.tags.includes('local_independent') || v.tags.includes('small_chain_local'));

  // Calculate distances
  const vendorsWithDist = filteredVendors.map(v => ({
    ...v,
    distance: calculateDistance(uLat, uLng, v.lat, v.lng)
  }));

  // Grouping results
  const groupA = vendorsWithDist.filter(v => v.zipCode === userZip);
  const groupB = vendorsWithDist.filter(v => v.zipCode !== userZip && v.area_id === userAreaId);
  const groupC = vendorsWithDist.filter(v => 
    v.zipCode !== userZip && 
    v.area_id !== userAreaId && 
    (v.distance || 0) <= radiusMiles
  );

  // Default sorting: Distance -> Rating Count -> Rating
  const sortFunc = (a: any, b: any) => {
    if (a.distance !== b.distance) return (a.distance || 0) - (b.distance || 0);
    if (b.user_ratings_total !== a.user_ratings_total) return (b.user_ratings_total || 0) - (a.user_ratings_total || 0);
    return b.rating - a.rating;
  };

  const results = [
    ...groupA.sort(sortFunc),
    ...groupB.sort(sortFunc),
    ...groupC.sort(sortFunc)
  ];

  zipCache[cacheKey] = results;
  return results;
};

/**
 * Store Discovery Tool using Gemini 2.5 series model for Maps grounding.
 * Finds favorite local beauty supply stores in Houston.
 */
export const validateStoresWithGemini = async (zip: string) => {
  try {
    const zipRecord = ZIP_CODES.find(z => z.zip === zip);
    const coords = zipRecord ? { lat: zipRecord.lat, lng: zipRecord.lng } : { lat: 29.7568, lng: -95.3656 };
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find local, independent beauty supply stores near ZIP ${zip}. 
      Focus on neighborhood shops, hair stores, and braiding supply.
      STRICT EXCLUSION: Major chains like Sally, Ulta, Sephora, or Walmart.
      REQUIRED: Store Name, Address, and a short description of their specialty.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: coords.lat,
              longitude: coords.lng
            }
          }
        }
      },
    });
    return response.text;
  } catch (error) {
    console.error("Discovery Error:", error);
    return null;
  }
};

export const bulkImportAreas = async (csvContent: string): Promise<{ success: boolean, count: number }> => {
  return new Promise(resolve => setTimeout(() => resolve({ success: true, count: csvContent.split('\n').length - 1 }), 1200));
};

export const findAreaByZip = (zip: string): Area | null => {
  const z = ZIP_CODES.find(x => x.zip === zip);
  if (!z) return null;
  return AREAS.find(a => a.id === z.area_id) || null;
};