export interface User {
  id: number;
  email: string;
  name: string;
  role: 'owner' | 'manager' | 'chef' | 'waiter' | 'cashier' | 'delivery' | 'customer';
  branch?: string;
  phone?: string;
  loyaltyPoints?: number;
  createdAt?: string | Date;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  name: string;
  description?: string;
  price: string;
  imageUrl?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isAvailable?: boolean;
  preparationTime?: number;
  spiceLevel?: number; // 0 (Mild) to 3 (Spicy)
  allergens?: string;
}

export interface OrderItem {
  id?: number;
  orderId?: number;
  menuItemId: number;
  quantity: number;
  unitPrice: string;
  notes?: string;
  status?: 'pending' | 'cooking' | 'ready' | 'served' | 'cancelled';
}

export interface Order {
  id: number;
  customerId?: number | null;
  customerName?: string;
  customerEmail?: string;
  tableId?: number | null;
  orderType: 'dine-in' | 'delivery';
  address?: string | null;
  status: 'pending' | 'accepted' | 'cooking' | 'ready' | 'served' | 'out_for_delivery' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'upi' | 'cod' | 'counter_billing';
  totalAmount: string;
  gstAmount: string;
  discountAmount: string;
  finalAmount: string;
  couponCode?: string | null;
  notes?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  branch: string;
  isPaidOnline?: boolean;
}

export interface Table {
  id: number;
  tableNumber: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  branch: string;
  currentOrderId?: number | null;
}

export interface Coupon {
  id: number;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  minOrderAmount: string;
  expiryDate: string;
  isActive: boolean;
}

export interface Reservation {
  id: number;
  customerId?: number;
  customerName: string;
  customerPhone: string;
  tableId?: number;
  reservationTime: string | Date;
  guestCount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'seated';
  notes?: string;
  branch: string;
}

export interface Payment {
  id: number;
  orderId?: number;
  amount: string;
  paymentMethod: 'cash' | 'card' | 'upi' | 'wallet';
  status: 'completed' | 'pending' | 'refunded';
  transactionId?: string;
  createdAt: string | Date;
}

export interface DashboardData {
  users: User[];
  menuItems: MenuItem[];
  categories: any[];
  orders: Order[];
  orderItems: OrderItem[];
  tables: Table[];
  coupons: Coupon[];
  reservations: Reservation[];
  payments: Payment[];
  expenses: any[];
  inventory: any[];
  shifts: any[];
}

export interface GatewayConfig {
  merchantUpiId: string;
  merchantName: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  autoSettlement: boolean;
  payoutBank: string;
}
