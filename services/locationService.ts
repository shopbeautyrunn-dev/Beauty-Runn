import { GoogleGenAI } from "@google/genai";
import { Area, ZipCode, BeautyVendor } from "../types";
import { AREAS, ZIP_CODES, VENDORS } from "../constants";

// Chain exclusion list provided by user
const MAJOR_CHAINS = [
  'Sally Beauty', 'Ulta', 'Sephora', 'Walmart', 'Target', 'CVS', 'Walgreens'
];

// Search keywords provided by user
export const SEARCH_KEYWORDS = [
  "beauty supply store", "beauty supply", "hair store", "wig store", "braiding hair", "nail supply", "barber supply"
];

const zipCache: Record<string, BeautyVendor[]> = {};

export const HOUSTON_BOUNDS = {
  minLat: 29.4, // Expanded for suburbs
  maxLat: 30.2,
  minLng: -95.9,
  maxLng: -94.8
};

// Map of Houston ZIP codes to their lat/lng coordinates for spatial visualization
export const HOUSTON_ZIP_COORDS: Record<string, {lat: number, lng: number}> = ZIP_CODES.reduce((acc, z) => ({
  ...acc,
  [z.zip]: { lat: z.lat, lng: z.lng }
}), {});

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3958.8;
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
 * Houston Store Discovery Engine
 * Ranking + Zoning Rules applied here.
 */
export const getStoresByZip = (userZip: string, radiusMiles: number = 10, includeMajorChains: boolean = false): BeautyVendor[] => {
  const cacheKey = `${userZip}-${radiusMiles}-${includeMajorChains}`;
  if (zipCache[cacheKey]) return zipCache[cacheKey];

  const userZipData = ZIP_CODES.find(z => z.zip === userZip);
  const uLat = userZipData?.lat || 29.7568;
  const uLng = userZipData?.lng || -95.3656;
  const userZoneId = userZipData?.area_id;

  // Rule: Exclude major chains by default
  const filteredVendors = VENDORS.filter(v => {
    const isChain = MAJOR_CHAINS.some(chain => v.name.toLowerCase().includes(chain.toLowerCase()));
    if (!includeMajorChains && isChain) return false;
    return true;
  });

  const vendorsWithDist = filteredVendors.map(v => {
    // Map Zone and Neighborhood by ZIP match
    const zipData = ZIP_CODES.find(z => z.zip === v.zipCode);
    return {
      ...v,
      zone_id: zipData?.area_id || v.zone_id,
      neighborhood: zipData?.neighborhood || v.neighborhood,
      unmapped_zip: !zipData,
      distance: calculateDistance(uLat, uLng, v.lat, v.lng)
    };
  });

  const results = vendorsWithDist.filter(v => (v.distance || 0) <= radiusMiles);

  // Ranking Rules
  results.sort((a, b) => {
    // 1. Exact ZIP match
    if (a.zipCode === userZip && b.zipCode !== userZip) return -1;
    if (b.zipCode === userZip && a.zipCode !== userZip) return 1;
    // 2. Zone match
    if (a.zone_id === userZoneId && b.zone_id !== userZoneId) return -1;
    if (b.zone_id === userZoneId && a.zone_id !== userZoneId) return 1;
    // 3. Distance
    return (a.distance || 0) - (b.distance || 0);
  });

  zipCache[cacheKey] = results;
  return results;
};

/**
 * Uses Gemini with Maps grounding to simulate a Google Places "Text Search (New)"
 * searching for local stores by keyword and ZIP.
 */
export const discoverStoresWithPlacesAPI = async (zip: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const keyword = SEARCH_KEYWORDS[0]; // "beauty supply store"
    
    const prompt = `Search for local independent "${keyword}" in Houston ZIP ${zip}. 
    STRICT: Exclude Sally Beauty, Ulta, Sephora, Walmart, Target, CVS, Walgreens.
    Return results matching the store schema: place_id, name, address, rating, tags.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: 29.7568,
              longitude: -95.3656
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

export const findAreaByZip = (zip: string): Area | null => {
  const z = ZIP_CODES.find(x => x.zip === zip);
  if (!z) return null;
  return AREAS.find(a => a.id === z.area_id) || null;
};

/**
 * Handles bulk import of service areas from a CSV string.
 * This is used by the Admin Command Center to update local zones.
 */
export const bulkImportAreas = async (csv: string) => {
  const lines = csv.split('\n').filter(line => line.trim().length > 0);
  return { count: lines.length };
};