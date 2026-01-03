
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
  product: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600'
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
    image: 'https://m.media-amazon.com/images/I/71u9S+OqX9L._SL1500_.jpg', 
    category: 'Braiding Hair / Synthetic Hair', 
    description: '100% Kanekalon, Hot Water Set, 3X Super Braid Value Pack. Clear retail sleeve with orange/green branding.',
    priceRange: { min: 4.99, max: 7.49 },
    isBestSeller: true,
    isTrending: true,
    stockLevel: 85
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
    priceRange: { min: 5.49, max: 7.99 },
    isOnSale: true,
    salePrice: 4.99,
    stockLevel: 12
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
    priceRange: { min: 9.99, max: 13.50 },
    isTrending: true,
    stockLevel: 45
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
    priceRange: { min: 65.00, max: 94.99 },
    isBestSeller: true,
    stockLevel: 8
  },
  {
    id: 'p-shea-curl-smoothie',
    vendorId: 'any',
    name: 'Shea Moisture Curl Enhancing Smoothie',
    brand: 'Shea Moisture',
    tagline: 'Authentic 12oz Tub',
    image: 'https://m.media-amazon.com/images/I/71K1j6S-w+L._SL1500_.jpg',
    category: 'Hair Care & Styling Products',
    description: 'The original Coconut & Hibiscus formula in the classic orange retail jar.',
    priceRange: { min: 11.99, max: 14.99 },
    isBestSeller: true,
    stockLevel: 120
  },
  {
    id: 'p-edge-booster',
    vendorId: 'any',
    name: 'Edge Booster Strong Hold Gel',
    brand: 'Style Factor',
    tagline: 'Retail Scented Jar',
    image: 'https://m.media-amazon.com/images/I/61qH3W3W9yL._SL1000_.jpg',
    category: 'Hair Care & Styling Products',
    description: 'Professional-grade edge control in the signature blue/black packaging.',
    priceRange: { min: 7.99, max: 10.99 },
    isTrending: true,
    stockLevel: 5
  },
  {
    id: 'p-freetress-waterwave',
    vendorId: 'any',
    name: 'Freetress Water Wave 22"',
    brand: 'Freetress',
    tagline: 'Bulk Crochet Packaging',
    image: 'https://m.media-amazon.com/images/I/81xUfK4uLGL._SL1500_.jpg',
    category: 'Braiding Hair / Synthetic Hair',
    description: 'Synthetic crochet hair in the standard yellow/red Freetress sleeve.',
    priceRange: { min: 6.99, max: 8.99 },
    isOnSale: true,
    salePrice: 5.99,
    stockLevel: 30
  },
  {
    id: 'p-wahl-senior',
    vendorId: 'any',
    name: 'Wahl Professional 5-Star Senior',
    brand: 'Wahl',
    tagline: 'Heavy-Duty Retail Box',
    image: 'https://m.media-amazon.com/images/I/71f7M+9XqGL._SL1500_.jpg',
    category: 'Hair Tools',
    description: 'Cordless professional clipper in original Wahl retail packaging.',
    priceRange: { min: 145.00, max: 180.00 },
    isBestSeller: true,
    stockLevel: 4
  }
];
