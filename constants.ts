import { BeautyVendor, Product, Area, ZipCode } from './types';

export const COLORS = {
  primary: '#C48B8B',
  secondary: '#EDE4DB',
  accent: '#1A1A1A',
  success: '#10B981',
  error: '#EF4444'
};

export const AREAS: Area[] = [
  { 
    id: 'area-inner-loop', 
    city: 'Houston', 
    area_name: 'Inner Loop & Central', 
    area_type: 'NEIGHBORHOOD', 
    zip_codes: [
      '77002', '77003', '77004', '77005', '77006', 
      '77007', '77008', '77010', '77019', '77021', 
      '77027', '77030', '77046', '77098'
    ] 
  },
  { id: 'area-katy', city: 'Katy', area_name: 'West Houston & Katy', area_type: 'SUBURB', zip_codes: ['77494', '77449', '77450'] },
  { id: 'area-sharpstown', city: 'Houston', area_name: 'Southwest Houston', area_type: 'NEIGHBORHOOD', zip_codes: ['77036', '77074'] }
];

export const ZIP_CODES: ZipCode[] = [
  { zip: '77002', city: 'Houston', state: 'TX', area_id: 'area-inner-loop', lat: 29.7568, lng: -95.3656 },
  { zip: '77003', city: 'Houston', state: 'TX', area_id: 'area-inner-loop', lat: 29.7497, lng: -95.3478 },
  { zip: '77004', city: 'Houston', state: 'TX', area_id: 'area-inner-loop', lat: 29.7248, lng: -95.3637 },
  { zip: '77005', city: 'Houston', state: 'TX', area_id: 'area-inner-loop', lat: 29.7184, lng: -95.4250 },
  { zip: '77006', city: 'Houston', state: 'TX', area_id: 'area-inner-loop', lat: 29.7400, lng: -95.3900 },
  { zip: '77007', city: 'Houston', state: 'TX', area_id: 'area-inner-loop', lat: 29.7715, lng: -95.4122 },
  { zip: '77019', city: 'Houston', state: 'TX', area_id: 'area-inner-loop', lat: 29.7550, lng: -95.4000 },
  { zip: '77021', city: 'Houston', state: 'TX', area_id: 'area-inner-loop', lat: 29.6942, lng: -95.3421 },
  { zip: '77098', city: 'Houston', state: 'TX', area_id: 'area-inner-loop', lat: 29.7330, lng: -95.4150 },
  { zip: '77449', city: 'Katy', state: 'TX', area_id: 'area-katy', lat: 29.8322, lng: -95.7563 },
  { zip: '77036', city: 'Houston', state: 'TX', area_id: 'area-sharpstown', lat: 29.7042, lng: -95.5323 }
];

export const VENDORS: BeautyVendor[] = [
  {
    id: 'hou-empire-griggs',
    name: 'Beauty Empire - Griggs',
    address: '5086 Griggs Rd',
    city: 'Houston', state: 'TX', zipCode: '77021',
    lat: 29.6942, lng: -95.3421,
    phone: '713-747-1234',
    place_id: 'ChIJR6E-MhK_QIYRR5_pT78-eX4',
    image: 'https://images.unsplash.com/photo-1512496011931-d21d88a3e55a?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    user_ratings_total: 852,
    deliveryTime: '12-15 min',
    category: 'Independent',
    categories: ['Braiding Hair', 'Styling Products'],
    description: 'A beloved neighborhood staple in the Third Ward area.',
    area_id: 'area-inner-loop',
    tags: ['local_independent'],
    isAIVerified: true,
    pricingTier: 'STANDARD'
  },
  {
    id: 'hou-empire-almeda',
    name: 'Beauty Empire - Almeda',
    address: '4410 Almeda Rd',
    city: 'Houston', state: 'TX', zipCode: '77004',
    lat: 29.7288, lng: -95.3789,
    phone: '713-529-1234',
    place_id: 'ChIJVXUq-nS_QIYRv9-p-123xyz',
    image: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    user_ratings_total: 412,
    deliveryTime: '10-18 min',
    category: 'Independent',
    categories: ['Luxe Hair', 'Premium Skincare'],
    description: 'Boutique favorites serving Midtown and the Museum District.',
    area_id: 'area-inner-loop',
    tags: ['local_independent'],
    isAIVerified: true,
    pricingTier: 'PREMIUM'
  },
  {
    id: 'hou-queen-beauty',
    name: 'Queen Beauty Supply',
    address: '3415 Dowling St',
    city: 'Houston', state: 'TX', zipCode: '77004',
    lat: 29.7350, lng: -95.3680,
    phone: '713-222-1111',
    place_id: 'ChIJQueenBeauty777',
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    user_ratings_total: 215,
    deliveryTime: '15-20 min',
    category: 'Independent',
    categories: ['Synthetic Hair', 'Nail Lacquer'],
    description: 'Local favorite known for unique hair accessories.',
    area_id: 'area-inner-loop',
    tags: ['local_independent'],
    isAIVerified: true,
    pricingTier: 'STANDARD'
  },
  {
    id: 'hou-montrose-luxe',
    name: 'Montrose Luxe Aesthetics',
    address: '1200 Westheimer Rd',
    city: 'Houston', state: 'TX', zipCode: '77006',
    lat: 29.7430, lng: -95.3950,
    phone: '713-555-8888',
    place_id: 'ChIJMontroseLuxe888',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800',
    rating: 5.0,
    user_ratings_total: 98,
    deliveryTime: '8-12 min',
    category: 'Independent',
    categories: ['Professional Tools', 'Cosmeceuticals'],
    description: 'High-end beauty essentials in the heart of Montrose.',
    area_id: 'area-inner-loop',
    tags: ['local_independent'],
    isAIVerified: true,
    pricingTier: 'PREMIUM'
  }
];

export const PRODUCTS: Product[] = [
  { 
    id: 'p-outre-xpression-3x-42', 
    vendorId: 'any', 
    name: 'Outre X-Pression Braid Pre Stretched Braid 42" 3X', 
    brand: 'Outre',
    priceRange: { min: 14.99, max: 18.99 },
    image: 'https://m.media-amazon.com/images/I/71Y87tS87UL._SL1500_.jpg', 
    category: 'Braiding Hair / Synthetic Hair', 
    description: 'Pre-stretched 42 inch braiding hair. 3X Multipack.',
    options: { colors: ['1', '1B', '2', '4', '27', '30', 'T1B/350'] }
  },
  {
    id: 'p-mielle-oil',
    vendorId: 'any',
    name: 'Mielle Rosemary Mint Scalp & Hair Strengthening Oil',
    brand: 'Mielle Organics',
    priceRange: { min: 9.99, max: 12.99 },
    image: 'https://m.media-amazon.com/images/I/61Nl-HhA7dL._SL1500_.jpg',
    category: 'Hair Care & Styling Products',
    description: 'Infused with Biotin and encourages growth for all hair types.',
    isBestSeller: true
  }
];