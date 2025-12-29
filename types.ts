
export type AppRole = 'CUSTOMER' | 'DRIVER' | 'VENDOR' | 'ADMIN' | 'EDITOR';
export type DriverTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export type DriverOnboardingStatus = 'NOT_STARTED' | 'BACKGROUND_CHECK' | 'DOCUMENTS' | 'VEHICLE_INFO' | 'TERMS' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface DriverEarnings {
  total: number;
  basePay: number;
  tips: number;
  incentives: number;
  pendingBalance: number;
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
  userId: string;
  userName: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: number;
}

export interface Incentive {
  id: string;
  title: string;
  description: string;
  amount: number | string;
  requirement: number;
  progress: number;
  type: 'streak' | 'volume' | 'distance' | 'referral';
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

export interface BeautyVendor {
  id: string;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  category: string;
  description: string;
  city: 'Houston' | 'Dallas' | 'San Antonio' | 'Austin' | 'Killeen' | 'Port Arthur' | 'Beaumont' | 'Fort Worth';
  zipCode: string;
  neighborhood?: string;
  topBrands?: string[];
  isMajorHub?: boolean;
  isSmallChain?: boolean;
  topSellerIds?: string[];
}

export interface MarketComparison {
  sally?: number;
  ulta?: number;
  amazon?: number;
  retailAvg?: number;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  price?: number; 
  priceRange?: { min: number; max: number };
  marketComparison?: MarketComparison;
  image: string;
  description: string;
  category: string;
  salesVolume?: number;
  options?: {
    colors?: string[];
    lengths?: string[];
    types?: string[];
  };
}

export interface CustomItem {
  description: string;
  allowSubstitutes: boolean;
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
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  PICKING_UP = 'PICKING_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface Order {
  id: string;
  items: CartItem[];
  customRequest?: CustomItem;
  holdFee: number;
  receiptAmount?: number;
  serviceFee?: number;
  adjustedTotal?: number;
  status: OrderStatus;
  customerId: string;
  customerName?: string;
  driverId?: string;
  driverInfo?: {
    name: string;
    image: string;
    carModel: string;
    carColor: string;
    licensePlate: string;
    rating: number;
  };
  vendorId: string;
  timestamp: number;
  dateString?: string;
  address: string;
  rating?: number;
  specialInstructions?: string;
  allowSubstitutes: boolean;
  deliveryPhoto?: string;
  deliveryPhotoConfirmed?: boolean;
  deliveryPhotoUrl?: string;
  deliverySpeed?: 'STANDARD' | 'RUSH' | 'SCHEDULED';
  lastMinuteItems?: CartItem[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'order' | 'promo' | 'message';
  timestamp: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'SUPPORT';
  lastActive: number;
}
