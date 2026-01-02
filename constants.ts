
import { BeautyVendor, Product } from './types';

export const COLORS = {
  primary: '#C48B8B',
  secondary: '#EDE4DB',
  accent: '#1A1A1A',
  success: '#10B981',
  error: '#EF4444'
};

export const CATEGORIES = [
  'Hair Extensions & Wigs',
  'Braiding Hair / Synthetic Hair',
  'Hair Care & Styling Products',
  'Hair Tools',
  'Hair Accessories',
  'Hair Color / Dye',
  'Skincare / Beauty Essentials'
];

export const FALLBACKS = {
  storefront: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=800',
  wigs: 'https://images.unsplash.com/photo-1565193298357-3079934f891b?auto=format&fit=crop&q=80&w=600',
  braiding: 'https://images.unsplash.com/photo-1594433030833-220736bb5ba3?auto=format&fit=crop&q=80&w=600',
  styling: 'https://images.unsplash.com/photo-1626015568770-071c77840134?auto=format&fit=crop&q=80&w=600',
  tools: 'https://images.unsplash.com/photo-1593702295094-ada74bc4a149?auto=format&fit=crop&q=80&w=600',
  accessories: 'https://images.unsplash.com/photo-1590159763121-7c9ff3121ef0?auto=format&fit=crop&q=80&w=600',
  color: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600',
  skincare: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600'
};

export const VENDORS: BeautyVendor[] = [
  {
    id: 'hou-empire-griggs',
    name: 'Beauty Empire - Griggs',
    address: '5086 Griggs Rd, Houston, TX 77021',
    lat: 29.6942, lng: -95.3421,
    image: 'https://images.unsplash.com/photo-1555529731-118a0976d0a1?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    deliveryTime: '12-15 min',
    velocity: 12,
    category: 'Local Beauty Supply',
    categories: ['Hair Extensions & Wigs', 'Braiding Hair / Synthetic Hair', 'Hair Care & Styling Products'],
    city: 'Houston', zipCode: '77021', neighborhood: 'Sunnyside',
    description: 'A recognizable neighborhood anchor on Griggs Rd, identified by its bright retail facade.',
    pricingTier: 'STANDARD',
    isAIVerified: true
  },
  {
    id: 'hou-almeda-beauty',
    name: 'Almeda Beauty Supply',
    address: '4410 Almeda Rd, Houston, TX 77004',
    lat: 29.7288, lng: -95.3789,
    image: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    deliveryTime: '10-18 min',
    velocity: 15,
    category: 'Neighborhood Store',
    categories: ['Skincare / Beauty Essentials', 'Hair Care & Styling Products', 'Hair Tools'],
    city: 'Houston', zipCode: '77004', neighborhood: '3rd Ward',
    description: 'A 3rd Ward favorite located in the historic Almeda corridor shopping strip.',
    pricingTier: 'PREMIUM',
    isAIVerified: true
  }
];

export const PRODUCTS: Product[] = [
  { 
    id: 'p-xpression-ultra', 
    vendorId: 'any', 
    name: 'X-Pression Ultra Braid (3X Pack)', 
    brand: 'X-Pression',
    tagline: 'Retail-Ready Standard Packaging',
    // Using the provided image style: clear packaging, visible product, professional retail sleeve.
    image: 'https://m.media-amazon.com/images/I/71u9S+OqX9L._SL1500_.jpg', 
    category: 'Braiding Hair / Synthetic Hair', 
    description: '100% Kanekalon, Hot Water Set, 3X Super Braid Value Pack. Clear retail sleeve with orange/green branding.',
    priceRange: { min: 4.99, max: 7.49 },
    notes: 'Standard Houston neighborhood pricing. Verified for Sunnyside/3rd Ward.'
  },
  { 
    id: 'p-ezbraid-spetra', 
    vendorId: 'any', 
    name: 'EZ-Braid Spetra Fiber', 
    brand: 'EZ-Braid',
    tagline: 'Standard Retail Sleeve',
    image: 'https://m.media-amazon.com/images/I/719h8iOEqIL._SL1500_.jpg', 
    category: 'Braiding Hair / Synthetic Hair', 
    description: 'Antimicrobial EZ-Braid hair in authentic factory packaging. Professional retail presentation.',
    priceRange: { min: 5.49, max: 7.99 }
  },
  { 
    id: 'p-mielle-oil', 
    vendorId: 'any', 
    name: 'Mielle Rosemary Mint Scalp & Hair Oil', 
    brand: 'Mielle',
    tagline: 'Retail Bottle with Dropper',
    image: 'https://m.media-amazon.com/images/I/61M7M7Y6CFL._SL1500_.jpg', 
    category: 'Hair Care & Styling Products', 
    description: 'Iconic 2oz green glass bottle. Authentic Mielle retail packaging.',
    priceRange: { min: 9.99, max: 13.50 }
  },
  { 
    id: 'p-andis-toutliner', 
    vendorId: 'any', 
    name: 'Andis T-Outliner Trimmer', 
    brand: 'Andis',
    tagline: 'Professional Retail Display Box',
    image: 'https://m.media-amazon.com/images/I/61Cg-v6I1zL._SL1500_.jpg', 
    category: 'Hair Tools', 
    description: 'Genuine Andis professional trimmer in original retail display box.',
    priceRange: { min: 65.00, max: 94.99 }
  }
];
