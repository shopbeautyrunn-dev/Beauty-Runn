
export type AppRole = 'CUSTOMER' | 'DRIVER' | 'VENDOR' | 'ADMIN' | 'EDITOR';
export type DriverTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export type DriverOnboardingStatus = 'NOT_STARTED' | 'BACKGROUND_CHECK' | 'DOCUMENTS' | 'VEHICLE_INFO' | 'TERMS' | 'APPROVED';

export interface DriverEarnings {
  total: number;
  basePay: number;
  tips: number;
  incentives: number;
  pendingBalance: number;
}

export interface Incentive {
  id: string;
  title: string;
  description: string;
  amount: number;
  requirement: number;
  progress: number;
  type: 'streak' | 'volume' | 'distance';
}

export interface BeautyVendor {
  id: string;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  category: string;
  description: string;
  city: 'Houston' | 'Dallas' | 'San Antonio' | 'New Orleans' | 'Austin' | 'Killeen' | 'Port Arthur' | 'Beaumont' | 'Columbus';
  zipCode: string;
  neighborhood?: string;
  topBrands?: string[];
  isMajorHub?: boolean;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

export interface DriverBenefit {
  id: string;
  title: string;
  description: string;
  category: string;
  discount: string;
  partnerName: string;
  icon: string;
}

export interface CustomItem {
  description: string;
  allowSubstitutes: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  HOLD_PAID = 'HOLD_PAID',
  RUNNER_AT_STORE = 'RUNNER_AT_STORE',
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
  total: number;
  finalPrice?: number;
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
  deliverySpeed?: 'STANDARD' | 'RUSH' | 'SCHEDULED';
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
  role: 'ADMIN' | 'EDITOR';
  lastActive: number;
}
