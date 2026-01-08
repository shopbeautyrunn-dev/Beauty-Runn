import { BeautyVendor, Product, Area, ZipCode } from './types';

export const COLORS = {
  primary: '#C48B8B',
  secondary: '#EDE4DB',
  accent: '#1A1A1A',
  success: '#10B981',
  error: '#EF4444'
};

/**
 * Service Areas based on provided Houston Zones
 */
export const AREAS: Area[] = [
  { id: '001', city: 'Houston', area_name: 'HOUSTON – INNER LOOP & CENTRAL', area_type: 'zone', zip_codes: ['77002', '77003', '77004', '77005', '77006', '77007', '77008', '77019', '77030', '77098'] },
  { id: '002', city: 'Houston', area_name: 'HOUSTON – NORTH', area_type: 'zone', zip_codes: ['77009', '77022', '77037', '77060', '77067', '77073', '77076', '77088', '77091'] },
  { id: '003', city: 'Houston', area_name: 'HOUSTON – SOUTH', area_type: 'zone', zip_codes: ['77021', '77033', '77047', '77048', '77051', '77061', '77075'] },
  { id: '004', city: 'Houston', area_name: 'HOUSTON – EAST', area_type: 'zone', zip_codes: ['77011', '77012', '77013', '77015', '77017', '77020', '77023', '77029'] },
  { id: '005', city: 'Houston', area_name: 'HOUSTON – WEST', area_type: 'zone', zip_codes: ['77024', '77042', '77043', '77056', '77057', '77063', '77077', '77079', '77080', '77094'] },
  { id: '006', city: 'Houston', area_name: 'HOUSTON – SOUTHWEST', area_type: 'zone', zip_codes: ['77031', '77035', '77036', '77045', '77053', '77054', '77071', '77072', '77074', '77081', '77085', '77096', '77099'] },
  { id: '007', city: 'Houston', area_name: 'HOUSTON – NORTHWEST', area_type: 'zone', zip_codes: ['77018', '77040', '77041', '77055', '77092'] },
  { id: '101', city: 'Various', area_name: 'NORTH / NORTHEAST (SUBURBS)', area_type: 'region', zip_codes: ['77338', '77339', '77345', '77346', '77373', '77379', '77380', '77381', '77386', '77388', '77389', '77396'] },
  { id: '102', city: 'Various', area_name: 'WEST / NORTHWEST (SUBURBS)', area_type: 'region', zip_codes: ['77449', '77450', '77493', '77494', '77429', '77433', '77375', '77377'] },
  { id: '103', city: 'Various', area_name: 'SOUTH / SOUTHEAST (SUBURBS)', area_type: 'region', zip_codes: ['77581', '77584', '77478', '77479', '77498', '77459', '77489', '77573', '77546', '77598'] },
  { id: '104', city: 'Various', area_name: 'EAST (SUBURBS)', area_type: 'region', zip_codes: ['77520', '77521', '77530', '77536', '77502', '77503', '77504', '77505', '77506'] }
];

export const ZIP_CODES: ZipCode[] = [
  // ZONE 001 - INNER LOOP
  { zip: '77002', city: 'Houston', state: 'TX', area_id: '001', neighborhood: 'Downtown', lat: 29.7568, lng: -95.3656 },
  { zip: '77003', city: 'Houston', state: 'TX', area_id: '001', neighborhood: 'EaDo', lat: 29.7497, lng: -95.3478 },
  { zip: '77004', city: 'Houston', state: 'TX', area_id: '001', neighborhood: 'Third Ward', lat: 29.7248, lng: -95.3637 },
  { zip: '77006', city: 'Houston', state: 'TX', area_id: '001', neighborhood: 'Montrose', lat: 29.7400, lng: -95.3900 },
  { zip: '77007', city: 'Houston', state: 'TX', area_id: '001', neighborhood: 'Rice Military / Washington Corridor', lat: 29.7715, lng: -95.4122 },
  { zip: '77008', city: 'Houston', state: 'TX', area_id: '001', neighborhood: 'The Heights', lat: 29.8000, lng: -95.4100 },
  { zip: '77019', city: 'Houston', state: 'TX', area_id: '001', neighborhood: 'River Oaks / Upper Kirby', lat: 29.7550, lng: -95.4000 },
  
  // ZONE 002 - NORTH
  { zip: '77037', city: 'Houston', state: 'TX', area_id: '002', neighborhood: 'Aldine', lat: 29.9000, lng: -95.3800 },
  { zip: '77060', city: 'Houston', state: 'TX', area_id: '002', neighborhood: 'Greater Greenspoint', lat: 29.9300, lng: -95.4100 },
  { zip: '77073', city: 'Houston', state: 'TX', area_id: '002', neighborhood: 'North Houston Neighborhood', lat: 29.9800, lng: -95.3900 },

  // ZONE 003 - SOUTH
  { zip: '77021', city: 'Houston', state: 'TX', area_id: '003', neighborhood: 'South Park / South Houston Neighborhood', lat: 29.6942, lng: -95.3421 },
  { zip: '77033', city: 'Houston', state: 'TX', area_id: '003', neighborhood: 'Sunnyside', lat: 29.6700, lng: -95.3500 },

  // ZONE 006 - SOUTHWEST
  { zip: '77036', city: 'Houston', state: 'TX', area_id: '006', neighborhood: 'Sharpstown', lat: 29.7042, lng: -95.5323 },
  { zip: '77074', city: 'Houston', state: 'TX', area_id: '006', neighborhood: 'Braeburn', lat: 29.6800, lng: -95.5100 },

  // REGION 101 - NORTH SUBURBS
  { zip: '77338', city: 'Humble', state: 'TX', area_id: '101', neighborhood: 'Humble North', lat: 29.9900, lng: -95.2600 },
  { zip: '77380', city: 'Spring', state: 'TX', area_id: '101', neighborhood: 'The Woodlands', lat: 30.1600, lng: -95.4500 },

  // REGION 102 - WEST SUBURBS
  { zip: '77449', city: 'Katy', state: 'TX', area_id: '102', neighborhood: 'Katy North', lat: 29.8322, lng: -95.7563 },
  { zip: '77494', city: 'Katy', state: 'TX', area_id: '102', neighborhood: 'Cinco Ranch', lat: 29.7400, lng: -95.8200 },

  // REGION 103 - SOUTH SUBURBS
  { zip: '77584', city: 'Pearland', state: 'TX', area_id: '103', neighborhood: 'Shadow Creek Ranch', lat: 29.5500, lng: -95.3800 },
  { zip: '77573', city: 'League City', state: 'TX', area_id: '103', neighborhood: 'Victory Lakes', lat: 29.4900, lng: -95.1000 },

  // REGION 104 - EAST SUBURBS
  { zip: '77521', city: 'Baytown', state: 'TX', area_id: '104', neighborhood: 'Baytown North', lat: 29.7800, lng: -94.9500 }
];

export const VENDORS: BeautyVendor[] = [
  {
    place_id: 'ChIJR6E-MhK_QIYRR5_pT78-eX4',
    id: 'ChIJR6E-MhK_QIYRR5_pT78-eX4',
    name: 'Beauty Empire - Griggs',
    address: '5086 Griggs Rd',
    city: 'Houston', state: 'TX', zipCode: '77021',
    lat: 29.6942, lng: -95.3421,
    phone: '713-747-1234',
    image: 'https://images.unsplash.com/photo-1512496011931-d21d88a3e55a?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    user_ratings_total: 852,
    deliveryTime: '15-20 min',
    category: 'Independent',
    categories: ['Braiding Hair', 'Styling Products'],
    description: 'A neighborhood staple in the South Houston zone.',
    zone_id: '003',
    neighborhood: 'South Houston Neighborhood',
    is_major_chain: false,
    tags: ['local_independent', 'braiding_hair'],
    last_synced_at: Date.now(),
    isAIVerified: true,
    pricingTier: 'STANDARD'
  },
  {
    place_id: 'ChIJVXUq-nS_QIYRv9-p-123xyz',
    id: 'ChIJVXUq-nS_QIYRv9-p-123xyz',
    name: 'Beauty Empire - Almeda',
    address: '4410 Almeda Rd',
    city: 'Houston', state: 'TX', zipCode: '77004',
    lat: 29.7288, lng: -95.3789,
    phone: '713-529-1234',
    image: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    user_ratings_total: 412,
    deliveryTime: '10-15 min',
    category: 'Independent',
    categories: ['Luxe Hair', 'Premium Skincare'],
    description: 'Favorite local shop in the Third Ward area.',
    zone_id: '001',
    neighborhood: 'Third Ward',
    is_major_chain: false,
    tags: ['local_independent', 'wigs'],
    last_synced_at: Date.now(),
    isAIVerified: true,
    pricingTier: 'PREMIUM'
  },
  {
    place_id: 'ChIJ7-katy-beauty-ind',
    id: 'ChIJ7-katy-beauty-ind',
    name: 'Katy Glamour Hub',
    address: '21000 Katy Fwy',
    city: 'Katy', state: 'TX', zipCode: '77449',
    lat: 29.8322, lng: -95.7563,
    phone: '281-555-9988',
    image: 'https://images.unsplash.com/photo-1512496011931-d21d88a3e55a?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    user_ratings_total: 124,
    deliveryTime: '25-30 min',
    category: 'Independent',
    categories: ['Hair Bundles', 'Color'],
    description: 'Premier independent beauty supply in West Houston Suburbs.',
    zone_id: '102',
    neighborhood: 'Katy North',
    is_major_chain: false,
    tags: ['local_independent', 'hair_bundles'],
    last_synced_at: Date.now(),
    isAIVerified: true,
    pricingTier: 'STANDARD'
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
  }
];