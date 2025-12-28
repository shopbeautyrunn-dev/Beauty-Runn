
import { BeautyVendor, Product, DriverBenefit, Incentive } from './types';

// Coordinates for major hubs in requested regions
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Houston': { lat: 29.7604, lng: -95.3698 },
  'Dallas': { lat: 32.7767, lng: -96.7970 },
  'Austin': { lat: 30.2672, lng: -97.7431 },
  'San Antonio': { lat: 29.4241, lng: -98.4936 },
  'Fort Worth': { lat: 32.7555, lng: -97.3308 },
  'New Orleans': { lat: 29.9511, lng: -90.0715 },
  'Columbus': { lat: 32.4610, lng: -84.9877 }, // Columbus, GA
  'Killeen': { lat: 31.1171, lng: -97.7278 },
  'Port Arthur': { lat: 29.8849, lng: -93.9399 },
  'Beaumont': { lat: 30.0802, lng: -94.1266 }
};

export const DRIVER_INCENTIVES: Incentive[] = [
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

// Map of common Zip Codes to City names for auto-resolution
export const ZIP_MAP: Record<string, string> = {
  // Texas - Houston
  '77001': 'Houston', '77002': 'Houston', '77003': 'Houston', '77004': 'Houston', '77015': 'Houston',
  // Texas - Dallas
  '75201': 'Dallas', '75202': 'Dallas', '75203': 'Dallas', '75204': 'Dallas', '75205': 'Dallas',
  // Texas - Austin
  '78701': 'Austin', '78702': 'Austin', '78703': 'Austin', '78704': 'Austin', '78705': 'Austin',
  // Texas - San Antonio
  '78201': 'San Antonio', '78202': 'San Antonio', '78205': 'San Antonio',
  // Louisiana - New Orleans
  '70112': 'New Orleans', '70113': 'New Orleans', '70114': 'New Orleans', '70115': 'New Orleans', '70116': 'New Orleans', '70130': 'New Orleans',
  // Georgia - Columbus
  '31901': 'Columbus', '31902': 'Columbus', '31903': 'Columbus', '31904': 'Columbus', '31905': 'Columbus', '31906': 'Columbus', '31907': 'Columbus'
};

export const VENDORS: BeautyVendor[] = [
  {
    id: 'v1',
    name: 'Sally Beauty Supply',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800',
    rating: 4.5,
    deliveryTime: '20-30 min',
    category: 'Hair & Salon',
    city: 'Houston',
    zipCode: '77002',
    neighborhood: 'Downtown',
    description: 'Professional-grade hair color, care, and styling tools.',
    isMajorHub: true
  },
  {
    id: 'v-ga1',
    name: 'Columbus Glam Depot',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    deliveryTime: '15-25 min',
    category: 'Full Supply',
    city: 'Columbus',
    zipCode: '31901',
    neighborhood: 'Uptown',
    description: 'Georgia\'s premier beauty distribution center.',
    isMajorHub: true
  },
  {
    id: 'v-la1',
    name: 'NOLA Curls & Color',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    deliveryTime: '10-20 min',
    category: 'Textured Hair',
    city: 'New Orleans',
    zipCode: '70130',
    neighborhood: 'Garden District',
    description: 'Specializing in care for natural textures and vivid colors.',
    isMajorHub: true
  },
  {
    id: 'v11',
    name: 'Uptown Beauty Supply',
    image: 'https://images.unsplash.com/photo-1595425283999-cc3903f56bc2?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    deliveryTime: '15-25 min',
    category: 'Hair & Cosmetics',
    city: 'Houston',
    zipCode: '77015',
    neighborhood: 'Northshore',
    description: 'Specializing in extensions, wigs, and professional braiding supplies.',
    isMajorHub: true
  },
  {
    id: 'v12',
    name: 'Pro Braiding Boutique',
    image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    deliveryTime: '10-20 min',
    category: 'Hair',
    city: 'Houston',
    zipCode: '77015',
    neighborhood: 'Uvalde',
    description: 'The destination for professional braiding hair and edge controls.',
    isMajorHub: false
  },
  {
    id: 'v3',
    name: 'Ulta Beauty',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    deliveryTime: '25-35 min',
    category: 'Cosmetics',
    city: 'Dallas',
    zipCode: '75201',
    neighborhood: 'Downtown',
    description: 'The premier destination for all things beauty.',
    isMajorHub: true
  }
];

export const PRODUCTS: Product[] = [
  { 
    id: 'p1', 
    vendorId: 'v11', 
    name: 'X-Pression Pre-Stretched', 
    price: 5.99, 
    image: 'https://images.unsplash.com/photo-1629732047847-50bad75599e5?auto=format&fit=crop&q=80&w=400', 
    category: 'Braiding Hair', 
    description: '48 inch pre-stretched synthetic braiding hair.' 
  },
  { 
    id: 'p2', 
    vendorId: 'v11', 
    name: 'Sensationnel Empress Wig', 
    price: 45.00, 
    image: 'https://images.unsplash.com/photo-1595425283999-cc3903f56bc2?auto=format&fit=crop&q=80&w=400', 
    category: 'Synthetic Hair', 
    description: 'Lace front synthetic wig, heat resistant fiber.' 
  },
  { 
    id: 'p3', 
    vendorId: 'v11', 
    name: 'Raw Indian Loose Wave', 
    price: 110.00, 
    image: 'https://images.unsplash.com/photo-1594433030833-220736bb5ba3?auto=format&fit=crop&q=80&w=400', 
    category: 'Human Hair', 
    description: '100% Raw Indian human hair, 20 inch bundle.' 
  },
  { 
    id: 'p4', 
    vendorId: 'v11', 
    name: 'Brazilian Body Wave 3pc', 
    price: 185.00, 
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=400', 
    category: 'Bundles', 
    description: 'Grade 12A Brazilian Body Wave 3 bundle deal.' 
  },
  { 
    id: 'p5', 
    vendorId: 'v11', 
    name: 'Outre Velvet Remi', 
    price: 32.99, 
    image: 'https://images.unsplash.com/photo-1519735897302-3f62986423ca?auto=format&fit=crop&q=80&w=400', 
    category: 'Packaged Hair', 
    description: '10 inch Remi human hair blend weave.' 
  },
  { 
    id: 'p6', 
    vendorId: 'v12', 
    name: 'Ebin 24h Edge Tamer', 
    price: 12.99, 
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400', 
    category: 'Other Beauty Essentials', 
    description: 'Extreme firm hold edge control for styling.' 
  },
  { 
    id: 'p7', 
    vendorId: 'v12', 
    name: 'Lace Tint Spray', 
    price: 14.50, 
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=400', 
    category: 'Other Beauty Essentials', 
    description: 'Medium brown lace tint for seamless wig blending.' 
  },
  { 
    id: 'p8', 
    vendorId: 'v1', 
    name: 'Pro Ionic Blow Dryer', 
    price: 85.00, 
    image: 'https://images.unsplash.com/photo-1522338140262-f46f5913618a?auto=format&fit=crop&q=80&w=400', 
    category: 'Hot Tools', 
    description: 'Professional 2200W ionic dryer for fast salon results.' 
  },
  { 
    id: 'p9', 
    vendorId: 'v1', 
    name: 'Ceramic Flat Iron', 
    price: 65.00, 
    image: 'https://images.unsplash.com/photo-1522337094846-8a818192de1f?auto=format&fit=crop&q=80&w=400', 
    category: 'Hot Tools', 
    description: '1-inch ceramic plates for smooth, frizz-free hair.' 
  },
  { 
    id: 'p10', 
    vendorId: 'v3', 
    name: 'Shampoo & Conditioner Duo', 
    price: 34.00, 
    image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&q=80&w=400', 
    category: 'Shampoo & Conditioner', 
    description: 'Hydrating salon-grade set for all hair types.' 
  },
  { 
    id: 'p11', 
    vendorId: 'v12', 
    name: 'Ghost Bond XL Glue', 
    price: 22.99, 
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=400', 
    category: 'Lace Adhesives/ Bond Glue', 
    description: 'Strong hold lace adhesive for wigs and hair systems.' 
  },
  { 
    id: 'p12', 
    vendorId: 'v-la1', 
    name: 'Silk Sleep Bonnet', 
    price: 15.99, 
    image: 'https://images.unsplash.com/photo-1595535373192-fc8935bc82c0?auto=format&fit=crop&q=80&w=400', 
    category: 'Headwraps & Hair Ties', 
    description: 'Premium satin bonnet to preserve hairstyles overnight.' 
  },
  { 
    id: 'p13', 
    vendorId: 'v-la1', 
    name: 'Stocking Wave Cap', 
    price: 4.99, 
    image: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&q=80&w=400', 
    category: 'Headwraps & Hair Ties', 
    description: 'Breathable wave cap for styling and maintenance.' 
  },
  { 
    id: 'p14', 
    vendorId: 'v-ga1', 
    name: '3D Mink Eyelashes', 
    price: 18.00, 
    image: 'https://images.unsplash.com/photo-1583241475878-38e7df5d469a?auto=format&fit=crop&q=80&w=400', 
    category: 'Other Beauty Essentials', 
    description: 'Hand-crafted voluminous mink lashes.' 
  },
  { 
    id: 'p15', 
    vendorId: 'v11', 
    name: 'Sew-in Needle & Thread', 
    price: 7.50, 
    image: 'https://images.unsplash.com/photo-1506806732259-39c2d7168935?auto=format&fit=crop&q=80&w=400', 
    category: 'Other Beauty Essentials', 
    description: 'Heavy duty C-curve needles and black nylon thread.' 
  },
  { 
    id: 'p16', 
    vendorId: 'v3', 
    name: 'Precision Tweezers', 
    price: 12.00, 
    image: 'https://images.unsplash.com/photo-1621333100102-13ad9ee18c31?auto=format&fit=crop&q=80&w=400', 
    category: 'Other Beauty Essentials', 
    description: 'Slant-tip tweezers for perfect brow shaping.' 
  },
  { 
    id: 'p17', 
    vendorId: 'v12', 
    name: 'Styling Comb Set', 
    price: 9.99, 
    image: 'https://images.unsplash.com/photo-1590540179852-2110a54f813a?auto=format&fit=crop&q=80&w=400', 
    category: 'Other Beauty Essentials', 
    description: 'Heat resistant rat-tail and styling combs.' 
  },
  { 
    id: 'p18', 
    vendorId: 'v-ga1', 
    name: 'Bulk Rubber Bands', 
    price: 3.50, 
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400', 
    category: 'Headwraps & Hair Ties', 
    description: 'Non-break elastic bands for braiding and ponytails.' 
  },
  { 
    id: 'p19', 
    vendorId: 'v11', 
    name: 'Hold Me Tight Hair Ties', 
    price: 4.50, 
    image: 'https://images.unsplash.com/photo-1582101344686-30239023190f?auto=format&fit=crop&q=80&w=400', 
    category: 'Headwraps & Hair Ties', 
    description: 'Seamless snag-free hair ties for all hair volumes.' 
  },
  { 
    id: 'p20', 
    vendorId: 'v1', 
    name: 'Professional Permanent Dye', 
    price: 15.00, 
    image: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&q=80&w=400', 
    category: 'Hair Dye', 
    description: 'Vibrant, long-lasting professional hair color.' 
  },
  { 
    id: 'p21', 
    vendorId: 'v-la1', 
    name: 'Semi-Permanent Color Wash', 
    price: 12.50, 
    image: 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&q=80&w=400', 
    category: 'Hair Dye', 
    description: 'Gentle semi-permanent wash for refreshing tones.' 
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
