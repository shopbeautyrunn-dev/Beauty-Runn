
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
      topSellerIds: ['p-outre-xp-3x', 'p-ht-2', 'p-dye-wella', 'p-he-clipin']
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
      topSellerIds: ['p-he-bundles', 'p-ht-1', 'p-dye-adore', 'p-ruwa-braid']
    });
  });

  return vendors;
};

const generateLocalBrands = () => {
  const localVendors: BeautyVendor[] = [
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
      topSellerIds: ['p-outre-xp-3x', 'p-dye-adore', 'p-he-bundles']
    },
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
      topSellerIds: ['p-outre-xp-3x', 'p-ruwa-braid', 'p-ht-1']
    },
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
      topSellerIds: ['p-dye-wella', 'p-dye-adore', 'p-ht-2']
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
    image: 'https://images.unsplash.com/photo-1594433030833-220736bb5ba3?auto=format&fit=crop&q=80&w=400', 
    category: 'Braiding Hair', 
    description: '52" Pre-stretched human-feel braiding hair. The standard for Houston stylists.',
    priceRange: { min: 5.49, max: 7.99 },
    marketComparison: { sally: 8.99, amazon: 7.50, retailAvg: 8.25 },
    options: {
      colors: ['1B', '2', '4', '27', '30', 'BUG', '613'],
      lengths: ['52"']
    },
    salesVolume: 8500 
  },
  { 
    id: 'p-ruwa-braid', 
    vendorId: 'any', 
    name: 'Ruwa 3X Pre-Stretched Braid', 
    image: 'https://images.unsplash.com/photo-1629732047847-50bad75599e5?auto=format&fit=crop&q=80&w=400', 
    category: 'Braiding Hair', 
    description: 'Water resistant, lightweight, and fast drying. Great for Houston humidity.',
    priceRange: { min: 6.99, max: 8.50 },
    marketComparison: { sally: 9.49, amazon: 8.25, retailAvg: 8.87 },
    options: {
      colors: ['1', '1B', '2', '4', '99J'],
      lengths: ['48"']
    },
    salesVolume: 4200 
  },

  // --- HAIR DYE ---
  { 
    id: 'p-dye-adore', 
    vendorId: 'any', 
    name: 'Adore Semi-Permanent Hair Color', 
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400', 
    category: 'Hair Dye', 
    description: 'The Houston local favorite. No ammonia, no alcohol, no peroxide.',
    priceRange: { min: 4.99, max: 6.50 },
    marketComparison: { sally: 7.99, amazon: 7.25, retailAvg: 7.62 },
    options: {
      colors: ['Honey Brown', 'Jet Black', 'Crimson', 'Cinnamon', 'Cajun Spice']
    },
    salesVolume: 9800 
  },
  { 
    id: 'p-dye-wella', 
    vendorId: 'any', 
    name: 'Wella Color Charm Liquid Toner', 
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400', 
    category: 'Hair Dye', 
    description: 'Professional liquid toner for salon results. The T18 White Lady specialist.',
    priceRange: { min: 7.50, max: 9.99 },
    marketComparison: { sally: 12.49, amazon: 11.50, retailAvg: 11.99 },
    options: {
      colors: ['T18 White Lady', 'T14 Pale Ash', 'T11 Lightest Beige']
    },
    salesVolume: 5600 
  },

  // --- HAIR EXTENSIONS ---
  { 
    id: 'p-he-bundles', 
    vendorId: 'any', 
    name: 'Virgin Brazilian Bundle Set (3pcs)', 
    image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=400', 
    category: 'Hair Extensions', 
    description: '100% Unprocessed human hair bundles. Silky, thick, and durable.',
    priceRange: { min: 55.00, max: 95.00 },
    marketComparison: { ulta: 165.00, amazon: 75.00, retailAvg: 120.00 },
    options: {
      lengths: ['18"', '20"', '22"', '24"'],
      types: ['Body Wave', 'Straight', 'Deep Wave']
    },
    salesVolume: 3100 
  },
  { 
    id: 'p-he-clipin', 
    vendorId: 'any', 
    name: 'Remi Human Hair Clip-In Set', 
    image: 'https://images.unsplash.com/photo-1620331311520-246422ff83f9?auto=format&fit=crop&q=80&w=400', 
    category: 'Hair Extensions', 
    description: '7-piece instant length set. Easy application for home styling.',
    priceRange: { min: 75.00, max: 130.00 },
    marketComparison: { ulta: 185.00, amazon: 95.00, retailAvg: 140.00 },
    options: {
      colors: ['Jet Black', 'Natural Brown', 'Blonde Mix'],
      lengths: ['18"', '22"']
    },
    salesVolume: 2200 
  },

  // --- HOT TOOLS ---
  { 
    id: 'p-ht-1', 
    vendorId: 'any', 
    name: 'Professional Ionic Hair Dryer', 
    image: 'https://images.unsplash.com/photo-1522338140262-f46f5913618a?auto=format&fit=crop&q=80&w=400', 
    category: 'Hot Tools', 
    description: 'Fast-drying ionic technology. Used in top Houston salons.',
    priceRange: { min: 35.00, max: 65.00 },
    marketComparison: { ulta: 110.00, sally: 85.00, amazon: 55.00, retailAvg: 83.33 },
    salesVolume: 1800 
  },
  { 
    id: 'p-ht-2', 
    vendorId: 'any', 
    name: 'Ceramic Flat Iron 1"', 
    image: 'https://images.unsplash.com/photo-1554519934-e32b1629d9ee?auto=format&fit=crop&q=80&w=400', 
    category: 'Hot Tools', 
    description: 'Sleek ceramic plates for 450°F styling. Instant heat-up.',
    priceRange: { min: 25.00, max: 55.00 },
    marketComparison: { ulta: 140.00, sally: 95.00, amazon: 45.00, retailAvg: 93.33 },
    salesVolume: 2500 
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
