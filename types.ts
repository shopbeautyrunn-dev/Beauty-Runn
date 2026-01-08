
export type AppRole = 'CUSTOMER' | 'DRIVER' | 'VENDOR' | 'ADMIN' | 'OWNER';
export type DriverTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export type DeliverySpeed = 'STANDARD' | 'EXPEDITED';

export type DriverOnboardingStatus = 'NOT_STARTED' | 'INTRO' | 'PERSONAL_INFO' | 'DOCUMENTS' | 'VEHICLE_INFO' | 'BACKGROUND_CHECK' | 'AGREEMENT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  sources?: GroundingSource[];
}

export interface Area {
  id: string; // zone_id
  city: string;
  area_name: string;
  area_type: 'zone' | 'region';
  zip_codes: string[];
}

export interface ZipCode {
  zip: string;
  city: string;
  state: string;
  neighborhood: string;
  lat: number;
  lng: number;
  area_id: string; // zone_id
}

export interface BeautyVendor {
  place_id: string; // primary key
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
  hours_json?: string;
  rating: number;
  user_ratings_total?: number;
  zone_id: string;
  neighborhood: string;
  is_major_chain: boolean;
  tags: string[]; // local_independent, wigs, braiding_hair, nail_supply, etc.
  photo_resource_name?: string;
  image: string; // photo_url (cached)
  last_synced_at: number;
  
  // App-specific UI fields
  id: string; // same as place_id
  deliveryTime: string;
  category: string;
  categories: string[];
  description: string;
  distance?: number;
  isAIVerified?: boolean;
  pricingTier?: 'STANDARD' | 'PREMIUM' | 'ECONOMY';
  unmapped_zip?: boolean;
  velocity?: number;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  brand: string;
  priceRange: { min: number; max: number };
  image: string;
  description: string;
  category: string;
  options?: {
    colors?: string[];
  };
  isBestSeller?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedOptions?: {
    color?: string;
  };
}

export enum OrderStatus {
  PENDING = 'PENDING',
  HOLD_PAID = 'HOLD_PAID',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface OrderFees {
  shelfPriceEstimate: number;
  runnFee: number;
  serviceFee: number;
  urgencySurcharge?: number;
  speedSurcharge?: number;
  authHoldTotal: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  fees: OrderFees;
  status: OrderStatus;
  customerId: string;
  vendorId: string;
  timestamp: number;
  address: string;
  allowSubstitutes: boolean;
  deliverySpeed?: DeliverySpeed;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'order' | 'promo' | 'message' | 'success';
  timestamp: number;
}

export interface DriverApplication {
  fullName: string;
  email: string;
  status: DriverOnboardingStatus;
  dob?: string;
  phone?: string;
  address?: string;
  zipCode?: string;
  ssn?: string;
  documents: {
    licenseFront: string | null;
    licenseBack: string | null;
    ssnCard: string | null;
    insurance: string | null;
  };
  vehicle: {
    make: string;
    model: string;
    year: string;
    plate: string;
  };
  consentBackgroundCheck: boolean;
  signature: string;
}

export interface AdminStats {
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  activeDrivers: number;
  pendingApplications: number;
  activeOrders: number;
  avgRating: number;
  revenueGrowth: number;
}
