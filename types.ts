
export type AppRole = 'CUSTOMER' | 'DRIVER' | 'VENDOR' | 'ADMIN' | 'EDITOR';
export type DriverTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export type DriverOnboardingStatus = 'NOT_STARTED' | 'BACKGROUND_CHECK' | 'DOCUMENTS' | 'VEHICLE_INFO' | 'TERMS' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface BeautyVendor {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  image: string;
  rating: number;
  deliveryTime: string;
  category: string;
  categories: string[];
  description: string;
  city: string;
  zipCode: string;
  neighborhood?: string;
  isSmallChain?: boolean;
  topSellerIds?: string[];
  distance?: number;
  velocity?: number; // Minutes for sorting
}

export interface MarketComparison {
  retailAvg?: number;
  localLow?: number;
  localHigh?: number;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  tagline?: string;
  priceRange: { min: number; max: number };
  marketComparison?: MarketComparison;
  image: string;
  fallbackImage?: string;
  description: string;
  category: string;
  salesVolume?: number;
  options?: {
    colors?: string[];
    lengths?: string[];
    types?: string[];
  };
}

export interface CartItem extends Product {
  quantity: number;
  selectedOptions?: {
    color?: string;
    length?: string;
    type?: string;
  };
}

export enum OrderStatus {
  PENDING = 'PENDING',
  HOLD_PAID = 'HOLD_PAID',
  RUNNER_AT_STORE = 'RUNNER_AT_STORE',
  PURCHASING = 'PURCHASING',
  PRICE_CONFIRMED = 'PRICE_CONFIRMED',
  PICKING_UP = 'PICKING_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface OrderFees {
  shelfPriceEstimate: number;
  runnFee: number;
  serviceFee: number;
  urgencySurcharge?: number;
  authHoldTotal: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  fees: OrderFees;
  receiptAmount?: number;
  status: OrderStatus;
  customerId: string;
  vendorId: string;
  timestamp: number;
  address: string;
  allowSubstitutes: boolean;
  driverInfo?: {
    name: string;
    image: string;
    carModel: string;
    rating: number;
    phone: string;
  };
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'order' | 'promo' | 'message';
  timestamp: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
}

export interface DriverApplication {
  fullName: string;
  dob: string;
  ssn: string;
  address: string;
  email: string;
  documents: {
    license: string | null;
    ssnCard: string | null;
    insurance: string | null;
  };
  consentBackgroundCheck: boolean;
  status: DriverOnboardingStatus;
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

export interface SupportTicket {
  id: string;
  customerId: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  timestamp: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'ACTIVE' | 'AWAY' | 'OFFLINE';
}
