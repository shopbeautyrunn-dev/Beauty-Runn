
import { BeautyVendor, Product, Incentive } from './types';

// Coordinates for Texas Hubs
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Houston': { lat: 29.7604, lng: -95.3698 },
  'Dallas': { lat: 32.7767, lng: -96.7970 },
  'Austin': { lat: 30.2672, lng: -97.7431 },
  'San Antonio': { lat: 29.4241, lng: -98.4936 },
  'Fort Worth': { lat: 32.7555, lng: -97.3308 },
  'Killeen': { lat: 31.1171, lng: -97.7278 },
  'Port Arthur': { lat: 29.8849, lng: -93.9399 },
  'Beaumont': { lat: 30.0802, lng: -94.1266 }
};

export const DRIVER_INCENTIVES: Incentive[] = [
  {
    id: 'inc-vaca',
    title: 'Beauty Runn Getaway',
    description: 'Get 5 new Runners to join. Each must complete 15 Runns/mo and stay for 90 days.',
    amount: 'Free Vacation',
    requirement: 5,
    progress: 0,
    type: 'referral'
  },
  {
    id: 'inc-1',
    title: 'Runner Starter Bonus',
    description: 'Complete 3 runs in your first 24 hours.',
    amount: 25.00,
    requirement: 3,
    progress: 0,
    type: 'volume'
  },
  {
    id: 'inc-2',
    title: 'Beauty Hustler Streak',
    description: 'Complete 5 consecutive deliveries without cancellation.',
    amount: 50.00,
    requirement: 5,
    progress: 2,
    type: 'streak'
  }
];

// Texas Zip Map
export const ZIP_MAP: Record<string, string> = {
  '77001': 'Houston', '77002': 'Houston', '77003': 'Houston', '77004': 'Houston', '77015': 'Houston',
  '77036': 'Houston', '77021': 'Houston', '77088': 'Houston', '77026': 'Houston', '77060': 'Houston',
  '77449': 'Katy', '77494': 'Katy',
  '77478': 'Sugar Land', '77479': 'Sugar Land',
  '77338': 'Humble', '77396': 'Humble',
  '77584': 'Pearland', '77581': 'Pearland',
  '77429': 'Cypress', '77433': 'Cypress',
  '77379': 'Spring', '77388': 'Spring',
  '75201': 'Dallas', '78701': 'Austin', '78201': 'San Antonio',
  '77520': 'Baytown', '77521': 'Baytown',
  '77502': 'Pasadena', '77504': 'Pasadena'
};

const IMAGES = {
  sally: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800',
  ulta: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800',
  sephora: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=800',
  walmart: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&q=80&w=800',
  local: [
    'https://images.unsplash.com/photo-1595425283999-cc3903f56bc2?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800'
  ],
};

const generateMajorBrands = () => {
  const vendors: BeautyVendor[] = [];
  const cities: Array<'Houston' | 'Dallas' | 'Austin' | 'San Antonio' | 'Fort Worth' | 'Killeen' | 'Port Arthur' | 'Beaumont'> = 
    ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'Killeen', 'Port Arthur', 'Beaumont'];
  
  cities.forEach(city => {
    vendors.push({
      id: `sally-${city.toLowerCase()}`,
      name: 'Sally Beauty Supply',
      image: IMAGES.sally,
      rating: 4.5,
      deliveryTime: '20-30 min',
      category: 'Major Retailer',
      city: city,
      zipCode: '',
      description: 'Professional hair color and care.',
      isMajorHub: true,
      topSellerIds: ['p-outre-xp-3x', 'p14', 'p15', 'p-ht-1', 'p-he-1']
    });

    vendors.push({
      id: `ulta-${city.toLowerCase()}`,
      name: 'Ulta Beauty',
      image: IMAGES.ulta,
      rating: 4.8,
      deliveryTime: '25-40 min',
      category: 'Major Retailer',
      city: city,
      zipCode: '',
      description: 'The premier destination for cosmetics and tools.',
      isMajorHub: true,
      topSellerIds: ['p17', 'p18', 'p-ht-2', 'p-he-2', 'p13']
    });
  });

  return vendors;
};

const generateLocalBrands = () => {
  const localVendors: BeautyVendor[] = [
    // Houston
    {
      id: 'local-hou-77002-downtown',
      name: 'Downtown Glam Supplies',
      image: IMAGES.local[0],
      rating: 4.8,
      deliveryTime: '15-25 min',
      category: 'Local Beauty Supply',
      city: 'Houston',
      zipCode: '77002',
      neighborhood: 'Downtown',
      description: 'Serving the heart of Houston with premium essentials.',
      isMajorHub: false,
      topSellerIds: ['p-outre-xp-3x', 'p-he-1', 'p-he-2', 'p11', 'p14']
    },
    // Baytown
    {
      id: 'local-bay-77521-baytown',
      name: 'Baytown Beauty Supply',
      image: IMAGES.local[1],
      rating: 4.6,
      deliveryTime: '20-35 min',
      category: 'Local Beauty Supply',
      city: 'Houston',
      zipCode: '77521',
      neighborhood: 'Baytown',
      description: 'Your local expert for extensions and braids in Baytown.',
      isMajorHub: false,
      topSellerIds: ['p-outre-xp-3x', 'p11', 'p14', 'p-ht-1']
    },
    // Pasadena
    {
      id: 'local-pas-77504-pasadena',
      name: 'Pasadena Hair & Beauty',
      image: IMAGES.local[2],
      rating: 4.7,
      deliveryTime: '15-30 min',
      category: 'Local Beauty Supply',
      city: 'Houston',
      zipCode: '77504',
      neighborhood: 'Pasadena',
      description: 'Best local rates on hair dye and styling tools in Pasadena.',
      isMajorHub: false,
      topSellerIds: ['p15', 'p16', 'p-ht-2', 'p-he-3']
    }
  ];

  return localVendors;
};

export const VENDORS: BeautyVendor[] = [
  ...generateMajorBrands(),
  ...generateLocalBrands()
];

export const PRODUCTS: Product[] = [
  // --- BRAIDING HAIR ---
  { 
    id: 'p-outre-xp-3x', 
    vendorId: 'any', 
    name: 'Outre X-Pression Pre-Stretched 3X', 
    image: 'https://images.unsplash.com/photo-1629732047847-50bad75599e5?auto=format&fit=crop&q=80&w=400', 
    category: 'Braiding Hair', 
    description: '100% Kanekalon 52" pre-stretched braiding hair. Pre-layered for time-saving and natural finish. 3 bundles per pack.',
    priceRange: { min: 5.99, max: 8.50 },
    marketComparison: { sally: 8.99, amazon: 7.25, retailAvg: 8.12 },
    options: {
      colors: ['1B (Jet Black)', '2 (Dark Brown)', '4 (Medium Brown)', '27 (Honey Blonde)', '30 (Light Auburn)', 'BUG (Burgundy)', '613 (Platinum)'],
      lengths: ['52"']
    },
    salesVolume: 4500 
  },
  { 
    id: 'p11', 
    vendorId: 'any', 
    name: 'Ruwa Water Resistant Braid', 
    image: 'https://images.unsplash.com/photo-1594433030833-220736bb5ba3?auto=format&fit=crop&q=80&w=400', 
    category: 'Braiding Hair', 
    description: 'Quick-dry, pre-stretched braiding hair. Great for active styles and water-friendly looks.',
    priceRange: { min: 5.99, max: 8.99 },
    marketComparison: { sally: 9.49, amazon: 8.00, retailAvg: 8.75 },
    options: {
      colors: ['1', '1B', '2', '4', '33', '99J'],
    },
    salesVolume: 2400 
  },

  // --- HAIR EXTENSIONS ---
  { 
    id: 'p-he-1', 
    vendorId: 'any', 
    name: '100% Virgin Brazilian Bundles', 
    image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=400', 
    category: 'Hair Extensions', 
    description: 'Grade 12A human hair extensions. Double wefted and tangle-free bundles.',
    priceRange: { min: 45.00, max: 120.00 },
    marketComparison: { ulta: 155.00, amazon: 65.00, retailAvg: 110.00 },
    options: {
      lengths: ['12"', '16"', '20"', '24"', '28"'],
      types: ['Straight', 'Body Wave', 'Deep Wave']
    },
    salesVolume: 1800 
  },
  { 
    id: 'p-he-2', 
    vendorId: 'any', 
    name: 'Clip-In Human Hair Set', 
    image: 'https://images.unsplash.com/photo-1620331311520-246422ff83f9?auto=format&fit=crop&q=80&w=400', 
    category: 'Hair Extensions', 
    description: '7-piece human hair clip-in set for instant volume and length. Silicone-lined clips for secure hold.',
    priceRange: { min: 89.00, max: 149.00 },
    marketComparison: { ulta: 199.00, amazon: 95.00, retailAvg: 147.00 },
    options: {
      colors: ['Jet Black', 'Natural Brown', 'Honey Blonde'],
      lengths: ['18"', '22"']
    },
    salesVolume: 1100 
  },

  // --- HAIR DYE ---
  { 
    id: 'p14', 
    vendorId: 'any', 
    name: 'Adore Semi-Permanent Color', 
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400', 
    category: 'Hair Dye', 
    description: 'Professional semi-permanent hair color with no ammonia, no peroxide, and no alcohol.',
    priceRange: { min: 5.50, max: 8.00 },
    marketComparison: { sally: 8.49, amazon: 7.25, retailAvg: 7.85 },
    options: {
      colors: ['Honey Brown', 'Cinnamon', 'Crimson', 'Jet Black']
    },
    salesVolume: 2900 
  },
  { 
    id: 'p15', 
    vendorId: 'any', 
    name: 'Wella Color Charm Toner', 
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400', 
    category: 'Hair Dye', 
    description: 'Liquid permanent toner for professional salon results. Neutralizes brassiness.',
    priceRange: { min: 8.99, max: 12.99 },
    marketComparison: { sally: 14.29, amazon: 11.50, retailAvg: 12.90 },
    options: {
      colors: ['T18 White Lady', 'T14 Pale Ash', 'T11 Lightest Beige']
    },
    salesVolume: 2600 
  },

  // --- HOT TOOLS ---
  { 
    id: 'p-ht-1', 
    vendorId: 'any', 
    name: 'Pro Ionic Hair Dryer', 
    image: 'https://images.unsplash.com/photo-1522338140262-f46f5913618a?auto=format&fit=crop&q=80&w=400', 
    category: 'Hot Tools', 
    description: 'Salon-grade 1875W ionic hair dryer for fast drying and frizz reduction.',
    priceRange: { min: 45.00, max: 85.00 },
    marketComparison: { ulta: 120.00, amazon: 55.00, retailAvg: 87.50 },
    salesVolume: 2100 
  },
  { 
    id: 'p-ht-2', 
    vendorId: 'any', 
    name: 'Ceramic Flat Iron 1"', 
    image: 'https://images.unsplash.com/photo-1554519934-e32b1629d9ee?auto=format&fit=crop&q=80&w=400', 
    category: 'Hot Tools', 
    description: 'Professional ceramic styling iron for smooth, shiny finishes. Heats up to 450°F.',
    priceRange: { min: 35.00, max: 120.00 },
    marketComparison: { ulta: 160.00, sally: 99.00, amazon: 45.00, retailAvg: 101.00 },
    options: {
      types: ['Digital Control', 'Manual Dial']
    },
    salesVolume: 1950 
  }
];

export const COLORS = {
  primary: '#D63384',
  secondary: '#1A1A1A',
  accent: '#D4AF37',
  light: '#FDFCFB',
  dark: '#111111',
  success: '#008345'
};
