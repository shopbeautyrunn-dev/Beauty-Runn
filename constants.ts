
import { BeautyVendor, Product } from './types';

export const COLORS = {
  primary: '#C48B8B',
  secondary: '#EDE4DB',
  accent: '#1A1A1A',
  success: '#10B981',
  error: '#EF4444'
};

// Exact categories as requested by user
export const CATEGORIES = [
  'Hair Extensions & Wigs',
  'Braiding Hair / Synthetic Hair',
  'Hair Care & Styling Products',
  'Hair Tools',
  'Hair Accessories',
  'Hair Color / Dye',
  'Skincare / Beauty Essentials'
];

// Master Fallback Images
export const FALLBACKS = {
  storefront: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=800', // Classic Beauty Supply Interior
  wigs: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&q=80&w=600',
  braiding: 'https://images.unsplash.com/photo-1594433030833-220736bb5ba3?auto=format&fit=crop&q=80&w=600',
  styling: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=600',
  tools: 'https://images.unsplash.com/photo-1522338140262-f46f5513243a?auto=format&fit=crop&q=80&w=600',
  accessories: 'https://images.unsplash.com/photo-1590159763121-7c9ff3121ef0?auto=format&fit=crop&q=80&w=600',
  color: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600',
  skincare: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600'
};

/**
 * Master Houston Neighborhood Store Database
 * Each entry paired with high-quality storefront/interior imagery representing the brand.
 */
export const VENDORS: BeautyVendor[] = [
  {
    id: 'store-77021-empire',
    name: 'Beauty Empire',
    address: '5086 Griggs Rd, Houston, TX 77021',
    lat: 29.6942, lng: -95.3421,
    image: 'https://images.unsplash.com/photo-1595425283999-cc3903f56bc2?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    deliveryTime: '10-15 min',
    velocity: 12,
    category: 'Local Beauty Supply',
    categories: ['Hair Extensions & Wigs', 'Braiding Hair / Synthetic Hair', 'Hair Care & Styling Products', 'Hair Accessories'],
    city: 'Houston', zipCode: '77021', neighborhood: 'Sunnyside',
    description: 'A neighborhood staple for professional braiding hair and extensions.'
  },
  {
    id: 'store-77021-gem',
    name: 'Sunnyside Beauty Gem',
    address: '4205 Reed Rd, Houston, TX 77051',
    lat: 29.6744, lng: -95.3670,
    image: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    deliveryTime: '15-20 min',
    velocity: 15,
    category: 'Local Beauty Supply',
    categories: ['Hair Extensions & Wigs', 'Hair Color / Dye', 'Hair Tools'],
    city: 'Houston', zipCode: '77021', neighborhood: 'Sunnyside',
    description: 'Known for large inventory of lace front wigs and braiding supplies.'
  },
  {
    id: 'store-77004-almeda',
    name: 'Almeda Beauty Supply',
    address: '4410 Almeda Rd, Houston, TX 77004',
    lat: 29.7288, lng: -95.3789,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    deliveryTime: '12-18 min',
    velocity: 12,
    category: 'Neighborhood Store',
    categories: ['Skincare / Beauty Essentials', 'Hair Care & Styling Products', 'Hair Tools', 'Hair Accessories'],
    city: 'Houston', zipCode: '77004', neighborhood: '3rd Ward',
    description: 'Curated selection of natural hair care and premium skincare essentials.'
  },
  {
    id: 'store-77004-cleburne',
    name: '3rd Ward Beauty Collective',
    address: '3200 Cleburne St, Houston, TX 77004',
    lat: 29.7215, lng: -95.3590,
    image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    deliveryTime: '10-15 min',
    velocity: 10,
    category: 'Local Beauty Supply',
    categories: ['Braiding Hair / Synthetic Hair', 'Hair Color / Dye', 'Hair Accessories'],
    city: 'Houston', zipCode: '77004', neighborhood: '3rd Ward',
    description: 'Highly accessible local store serving the TSU/UH student population.'
  },
  {
    id: 'store-77026-lyons',
    name: 'Lyons Avenue Beauty Mart',
    address: '3815 Lyons Ave, Houston, TX 77020',
    lat: 29.7785, lng: -95.3344,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    deliveryTime: '15-25 min',
    velocity: 18,
    category: 'Local Beauty Supply',
    categories: ['Hair Extensions & Wigs', 'Braiding Hair / Synthetic Hair', 'Hair Tools', 'Hair Care & Styling Products', 'Hair Accessories'],
    city: 'Houston', zipCode: '77026', neighborhood: '5th Ward',
    description: 'Reliable neighborhood source for all pro hair and braiding needs.'
  },
  {
    id: 'store-77036-bellaire',
    name: 'Bellaire Beauty Center',
    address: '7850 Bellaire Blvd, Houston, TX 77036',
    lat: 29.7042, lng: -95.5323,
    image: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    deliveryTime: '20-25 min',
    velocity: 22,
    category: 'Local Beauty Supply',
    categories: ['Hair Tools', 'Skincare / Beauty Essentials', 'Hair Accessories', 'Hair Color / Dye', 'Hair Care & Styling Products'],
    city: 'Houston', zipCode: '77036', neighborhood: 'Sharpstown',
    description: 'Extensive range of salon tools and international skincare brands.'
  },
  {
    id: 'store-77060-point',
    name: 'Greenspoint Community Hair',
    address: '16611 Northchase Dr, Houston, TX 77060',
    lat: 29.9405, lng: -95.4056,
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=800',
    rating: 4.5,
    deliveryTime: '25-30 min',
    velocity: 28,
    category: 'Neighborhood Store',
    categories: ['Hair Extensions & Wigs', 'Braiding Hair / Synthetic Hair', 'Hair Tools', 'Hair Accessories'],
    city: 'Houston', zipCode: '77060', neighborhood: 'Greenspoint',
    description: 'Large warehouse-style store with deep stock of all hair types.'
  },
  {
    id: 'store-77008-heights',
    name: 'Heights Beauty & Wigs',
    address: '1533 N Shepherd Dr, Houston, TX 77008',
    lat: 29.7981, lng: -95.4101,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    deliveryTime: '15-20 min',
    velocity: 15,
    category: 'Neighborhood Store',
    categories: ['Hair Extensions & Wigs', 'Hair Care & Styling Products', 'Hair Tools', 'Hair Accessories', 'Skincare / Beauty Essentials'],
    city: 'Houston', zipCode: '77008', neighborhood: 'The Heights',
    description: 'Premier destination in the Heights for professional styling tools and wigs.'
  },
  {
    id: 'store-77019-river',
    name: 'River Oaks Luxe Beauty',
    address: '1964 W Gray St, Houston, TX 77019',
    lat: 29.7551, lng: -95.4056,
    image: 'https://images.unsplash.com/photo-1620331311520-246422ff82f9?auto=format&fit=crop&q=80&w=800',
    rating: 5.0,
    deliveryTime: '20-30 min',
    velocity: 25,
    category: 'Boutique Beauty Supply',
    categories: ['Skincare / Beauty Essentials', 'Hair Care & Styling Products', 'Hair Tools', 'Hair Accessories'],
    city: 'Houston', zipCode: '77019', neighborhood: 'River Oaks',
    description: 'High-end aesthetic essentials and premium professional hair tools.'
  },
  {
    id: 'store-77036-sharpstown',
    name: 'Sharpstown Beauty Supply Mart',
    address: '7500 Bellaire Blvd, Houston, TX 77036',
    lat: 29.7022, lng: -95.5123,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    deliveryTime: '15-20 min',
    velocity: 18,
    category: 'Local Beauty Supply',
    categories: ['Hair Care & Styling Products', 'Hair Tools', 'Hair Accessories', 'Skincare / Beauty Essentials', 'Hair Color / Dye'],
    city: 'Houston', zipCode: '77036', neighborhood: 'Sharpstown',
    description: 'Serving the Sharpstown community with a wide array of local beauty favorites.'
  }
];

// Product Registry with accurate branding and imagery
export const PRODUCTS: Product[] = [
  // 1. Hair Extensions & Wigs
  { 
    id: 'p-bobbi-boss-wig', 
    vendorId: 'any', 
    name: 'Bobbi Boss Human Hair', 
    tagline: 'Premium Human Hair Wig',
    image: 'https://images.unsplash.com/photo-1565193298357-3079934f891b?auto=format&fit=crop&q=80&w=600',
    fallbackImage: FALLBACKS.wigs,
    category: 'Hair Extensions & Wigs', 
    description: 'Authentic Bobbi Boss luxury human hair with pre-plucked hairline.',
    priceRange: { min: 85.00, max: 250.00 }
  },
  { 
    id: 'p-outre-wig', 
    vendorId: 'any', 
    name: 'Outre HD Lace Front', 
    tagline: 'Melted Lace Front',
    image: 'https://images.unsplash.com/photo-1595475207225-428b62bda831?auto=format&fit=crop&q=80&w=600',
    fallbackImage: FALLBACKS.wigs,
    category: 'Hair Extensions & Wigs', 
    description: 'High-definition Outre lace for a seamless, natural finish.',
    priceRange: { min: 45.00, max: 95.00 }
  },

  // 2. Braiding Hair / Synthetic Hair
  { 
    id: 'p-xp-braid', 
    vendorId: 'any', 
    name: 'X-Pression Ultra', 
    tagline: 'X-Pression Braiding Hair',
    image: 'https://images.unsplash.com/photo-1594433030833-220736bb5ba3?auto=format&fit=crop&q=80&w=600', 
    fallbackImage: FALLBACKS.braiding,
    category: 'Braiding Hair / Synthetic Hair', 
    description: 'Original X-Pression Ultra 3X pre-stretched braiding hair.',
    priceRange: { min: 5.49, max: 9.99 }
  },
  { 
    id: 'p-freetress-wave', 
    vendorId: 'any', 
    name: 'Freetress Water Wave', 
    tagline: 'Synthetic Crochet Braid',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=600', 
    fallbackImage: FALLBACKS.braiding,
    category: 'Braiding Hair / Synthetic Hair', 
    description: 'Freetress bulk hair for passion twists and crochet styles.',
    priceRange: { min: 6.99, max: 12.50 }
  },

  // 3. Hair Care & Styling Products
  { 
    id: 'p-mielle-oil', 
    vendorId: 'any', 
    name: 'Mielle Organics Oil', 
    tagline: 'Rosemary Mint Scalp Oil',
    image: 'https://images.unsplash.com/photo-1626015568770-071c77840134?auto=format&fit=crop&q=80&w=600', 
    fallbackImage: FALLBACKS.styling,
    category: 'Hair Care & Styling Products', 
    description: 'Viral Rosemary Mint scalp and hair strengthening oil.',
    priceRange: { min: 9.99, max: 14.50 }
  },
  { 
    id: 'p-cantu-cream', 
    vendorId: 'any', 
    name: 'Cantu Shea Butter', 
    tagline: 'Curl Activator Cream',
    image: 'https://images.unsplash.com/photo-1598440441974-9092408c5c4e?auto=format&fit=crop&q=80&w=600', 
    fallbackImage: FALLBACKS.styling,
    category: 'Hair Care & Styling Products', 
    description: 'Define and moisturize natural curls with pure shea butter.',
    priceRange: { min: 7.50, max: 11.99 }
  },

  // 4. Hair Tools
  { 
    id: 'p-andis-clipper', 
    vendorId: 'any', 
    name: 'Andis T-Outliner', 
    tagline: 'Professional Trimmer',
    image: 'https://images.unsplash.com/photo-1593702295094-ada74bc4a149?auto=format&fit=crop&q=80&w=600', 
    fallbackImage: FALLBACKS.tools,
    category: 'Hair Tools', 
    description: 'Andis professional corded trimmer for precise lineups.',
    priceRange: { min: 65.00, max: 89.00 }
  },
  { 
    id: 'p-babyliss-dryer', 
    vendorId: 'any', 
    name: 'BaBylissPRO Nano', 
    tagline: 'Ionic Hair Dryer',
    image: 'https://images.unsplash.com/photo-1522338140262-f46f5513243a?auto=format&fit=crop&q=80&w=600', 
    fallbackImage: FALLBACKS.tools,
    category: 'Hair Tools', 
    description: 'High-speed professional hair dryer for salon results.',
    priceRange: { min: 89.00, max: 125.00 }
  },

  // 5. Hair Accessories
  { 
    id: 'p-denman-brush', 
    vendorId: 'any', 
    name: 'Denman D3 Brush', 
    tagline: '7-Row Styling Brush',
    image: 'https://images.unsplash.com/photo-1590159763121-7c9ff3121ef0?auto=format&fit=crop&q=80&w=600', 
    fallbackImage: FALLBACKS.accessories,
    category: 'Hair Accessories', 
    description: 'The ultimate brush for defining curls and smoothing hair.',
    priceRange: { min: 18.00, max: 25.00 }
  },

  // 6. Hair Color / Dye
  { 
    id: 'p-adore-color', 
    vendorId: 'any', 
    name: 'Adore Semi-Permanent', 
    tagline: 'Semi-Permanent Dye',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600', 
    fallbackImage: FALLBACKS.color,
    category: 'Hair Color / Dye', 
    description: 'Gentle, semi-permanent color with vibrant shine.',
    priceRange: { min: 4.99, max: 8.50 }
  },

  // 7. Skincare / Beauty Essentials
  { 
    id: 'p-palmers-cocoa', 
    vendorId: 'any', 
    name: "Palmer's Cocoa Butter", 
    tagline: 'Moisturizing Body Oil',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600', 
    fallbackImage: FALLBACKS.skincare,
    category: 'Skincare / Beauty Essentials', 
    description: 'Instantly absorbs to soothe dry, stressed skin.',
    priceRange: { min: 8.99, max: 14.50 }
  }
];
