
export type AppRole = 'CUSTOMER' | 'DRIVER' | 'VENDOR' | 'ADMIN' | 'OWNER';
export type DriverTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export type DeliverySpeed = 'STANDARD' | 'EXPEDITED';

export type DriverOnboardingStatus = 'NOT_STARTED' | 'INTRO' | 'PERSONAL_INFO' | 'DOCUMENTS' | 'VEHICLE_INFO' | 'BACKGROUND_CHECK' | 'AGREEMENT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

// Added Message interface to fix import error in ChatInterface
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
}

export interface Area {
  id: string;
  city: string;
  area_name: string;
  area_type: 'NEIGHBORHOOD' | 'SUBURB';
  county?: string;
  zip_codes: string[];
}

export interface ZipCode {
  zip: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  area_id: string;
}

export interface BeautyVendor {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
  hours?: string;
  place_id?: string;
  image: string;
  primaryPhotoUrl?: string;
  photoGalleryUrls?: string[];
  googleMapsUrl?: string;
  rating: number;
  user_ratings_total?: number;
  deliveryTime: string;
  category: string;
  categories: string[];
  description: string;
  neighborhood?: string;
  area_id?: string;
  tags: ('local_independent' | 'small_chain_local' | 'major_chain')[];
  distance?: number;
  velocity?: number; 
  isAIVerified?: boolean;
  isActive?: boolean;
  pricingTier?: 'STANDARD' | 'PREMIUM' | 'ECONOMY';
  verificationNotes?: string;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  brand: string;
  tagline?: string;
  priceRange: { min: number; max: number };
  image: string;
  description: string;
  category: string;
  stockLevel?: number; 
  isTrending?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  options?: {
    colors?: string[];
  };
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
  // Added optional surcharges used in pricingService
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

// Expanded DriverApplication with full onboarding details to fix Property 'documents' does not exist error
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
