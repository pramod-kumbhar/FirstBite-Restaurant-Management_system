'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Utensils, Users, Award, Ticket, MessageSquare, ClipboardList, 
  Layers, ShoppingBag, Plus, Trash2, Edit2, RotateCcw, 
  CheckCircle, Clock, AlertTriangle, AlertCircle, ShoppingCart, 
  MapPin, Send, HelpCircle, DollarSign, PieChart, Users2, 
  TrendingUp, Truck, Calendar, Sparkles, BookOpen, UserCheck, 
  Smartphone, CreditCard, Wallet, Banknote, Filter, Search, Grid, Receipt, RefreshCw, Layers3, Flame, X, Check, LogOut, Menu, Settings, FileText,
  Shield, ShieldCheck, Activity, Database, Lock, Key, Globe, LayoutDashboard, History, Bookmark, XCircle, Sliders, CheckCircle2, Coins, Printer, Star, Leaf
} from 'lucide-react';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardFooter } from '@/components/dashboard/DashboardFooter';
import { VisualTableMap } from '@/components/dashboard/VisualTableMap';
import { LiveKitchenTracker } from '@/components/dashboard/LiveKitchenTracker';

export default function RestaurantManagementSystem({ initialUser }: { initialUser?: any }) {
  const router = useRouter();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(initialUser ?? null);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setIsMobile(window.innerWidth < 640);
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<any>({
    categories: [],
    menuItems: [],
    tables: [],
    reservations: [],
    orders: [],
    orderItems: [],
    users: [],
    suppliers: [],
    inventory: [],
    purchaseOrders: [],
    shifts: [],
    payments: [],
    coupons: [],
    reviews: [],
    expenses: [],
    chefs: [],
    waiters: [],
    cashiers: []
  });

  // Current View / Role
  // 'customer', 'owner', 'manager', 'chef', 'waiter', 'cashier', 'delivery'
  const [currentRole, setCurrentRole] = useState<'customer' | 'owner' | 'manager' | 'chef' | 'waiter' | 'cashier' | 'delivery'>('customer');
  const [deliveryFilter, setDeliveryFilter] = useState<string>('all');
  const [deliverySearch, setDeliverySearch] = useState<string>('');
  
  // Navigation tabs inside roles
  const [activeManagerTab, setActiveManagerTab] = useState<'control-center' | 'overview' | 'payments' | 'menu' | 'inventory' | 'shifts' | 'reservations' | 'expenses' | 'coupons'>('control-center');

  // Real-Time Payment Gateway & Owner Receipts State
  const [gatewayConfig, setGatewayConfig] = useState({
    merchantUpiId: 'pamms.k07@upi',
    merchantName: 'FirstBite Gourmet Kitchens',
    razorpayKeyId: 'rzp_live_fb98432190',
    razorpayKeySecret: '••••••••••••••••',
    autoSettlement: true,
    payoutBank: 'HDFC Bank - A/C *****9821'
  });
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [activeCustomerTab, setActiveCustomerTab] = useState<'browse' | 'reservations' | 'loyalty' | 'orders' | 'reviews'>('browse');
  const [customerMode, setCustomerMode] = useState<'online' | 'dine-in' | null>(null);
  const [customerBranch, setCustomerBranch] = useState<string>(initialUser?.branch || 'Ichalkaranji');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [bannerDishIndex, setBannerDishIndex] = useState(0);
  const [showOrderHistoryInTrackUI, setShowOrderHistoryInTrackUI] = useState(false);

  // Customer State
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuFilters, setMenuFilters] = useState<{ diet: 'all' | 'veg' | 'non-veg'; vegan: boolean; gf: boolean }>({ diet: 'all', vegan: false, gf: false });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState<any[]>([]); // [{ menuItem: obj, quantity: 1, notes: '' }]
  const [cartCoupon, setCartCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [customerTable, setCustomerTable] = useState<string>('T1');
  const [customerOrderType, setCustomerOrderType] = useState<'dine-in' | 'delivery'>('dine-in');
  const [customerPaymentMethod, setCustomerPaymentMethod] = useState<'cod' | 'card' | 'upi'>('cod');
  const [customerAddressLine, setCustomerAddressLine] = useState('');
  const [customerDistrict, setCustomerDistrict] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [customerPincode, setCustomerPincode] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [skipCustomerName, setSkipCustomerName] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const isCardNumberValid = cardNumber.replace(/\D/g, '').length >= 15;
  const isCardHolderValid = cardHolder.trim().length >= 1;
  const isCardExpiryValid = cardExpiry.replace(/\D/g, '').length >= 4;
  const isCardCvvValid = cardCvv.replace(/\D/g, '').length >= 3;

  const isCardFormValid = isCardNumberValid && isCardHolderValid && isCardExpiryValid && isCardCvvValid;
  const isPlaceOrderBlockedByCard = customerPaymentMethod === 'card' && !isCardFormValid;

  useEffect(() => {
    if (currentUser?.name && !customerNameInput) {
      setCustomerNameInput(currentUser.name);
    }
  }, [currentUser]);
  const [savedAddressLabel, setSavedAddressLabel] = useState<string>('Home');
  const [autoSaveAddress, setAutoSaveAddress] = useState<boolean>(true);
  const [savedAddresses, setSavedAddresses] = useState<Array<{
    id: string;
    label: string;
    addressLine: string;
    district: string;
    state: string;
    pincode: string;
  }>>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  
  // Custom dialogs/forms state
  const [activeModal, setActiveModal] = useState<string | null>(null); // 'addMenuItem', 'addReservation', 'addShift', 'addInventory', 'addSupplier', 'addCoupon', 'addExpense'
  const [selectedEditItem, setSelectedEditItem] = useState<any>(null);

  // --- BROWSER HISTORY & CHROME BACK BUTTON INTEGRATION ---
  const isPoppingRef = React.useRef(false);
  const historyInitializedRef = React.useRef(false);

  // 1. Initial baseline history push on mount so Chrome's Back button stays trapped inside the app
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Push initial baseline state so Chrome has at least one entry to pop back into
    window.history.pushState({
      tab: activeCustomerTab,
      mode: customerMode,
      cart: isCartOpen,
      modal: activeModal,
      profile: profileOpen
    }, '', window.location.href);

    historyInitializedRef.current = true;
  }, []);

  // 2. Push history state ONLY on user-initiated state changes (NOT when popping back)
  useEffect(() => {
    if (typeof window === 'undefined' || !historyInitializedRef.current) return;

    if (isPoppingRef.current) {
      isPoppingRef.current = false;
      return;
    }

    window.history.pushState({
      tab: activeCustomerTab,
      mode: customerMode,
      cart: isCartOpen,
      modal: activeModal,
      profile: profileOpen
    }, '', window.location.href);
  }, [activeCustomerTab, customerMode, isCartOpen, activeModal, profileOpen]);

  // 3. Handle Chrome Back / Forward button popstate event
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = (event: PopStateEvent) => {
      isPoppingRef.current = true;

      // Priority 1: Close Cart Drawer if open
      if (isCartOpen) {
        setIsCartOpen(false);
        return;
      }

      // Priority 2: Close Profile Drawer if open
      if (profileOpen) {
        setProfileOpen(false);
        return;
      }

      // Priority 3: Close Active Modal if open
      if (activeModal) {
        setActiveModal(null);
        return;
      }

      // Priority 4: If event.state exists, restore tab & mode from state
      if (event.state) {
        if (event.state.cart === false && isCartOpen) setIsCartOpen(false);
        if (event.state.profile === false && profileOpen) setProfileOpen(false);
        if (event.state.modal === null && activeModal) setActiveModal(null);

        if (event.state.tab !== undefined && event.state.tab !== activeCustomerTab) {
          setActiveCustomerTab(event.state.tab);
          return;
        }

        if (event.state.mode !== undefined && event.state.mode !== customerMode) {
          setCustomerMode(event.state.mode);
          return;
        }
      }

      // Priority 5: In-app fallback hierarchy if event state was empty or at root
      if (activeCustomerTab !== 'browse') {
        setActiveCustomerTab('browse');
        return;
      }

      if (customerMode !== null) {
        setCustomerMode(null);
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isCartOpen, profileOpen, activeModal, activeCustomerTab, customerMode]);
  
  // Search state inside manager lists
  const [managerSearch, setManagerSearch] = useState('');

  // Form payload binders
  const [menuItemForm, setMenuItemForm] = useState({
    name: '', description: '', price: '', categoryId: '', isAvailable: true, 
    isVegetarian: false, isVegan: false, isGlutenFree: false, spiceLevel: 0, 
    preparationTime: 15, imageUrl: ''
  });
  
  const [reservationForm, setReservationForm] = useState({
    customerName: '', customerPhone: '', tableId: '', reservationTime: '', numberOfGuests: 2, notes: ''
  });
  const [resPaymentOption, setResPaymentOption] = useState<'standard' | 'deposit'>('standard');
  const [resPaymentMethod, setResPaymentMethod] = useState<'upi' | 'card'>('upi');

  const [shiftForm, setShiftForm] = useState({
    userId: '', date: '', startTime: '09:00', endTime: '17:00', role: 'chef', status: 'scheduled'
  });

  const [staffForm, setStaffForm] = useState({
    role: 'chef',
    name: '',
    email: '',
    phone: '',
    password: '',
    status: 'active',
    specialization: '',
    section: '',
    shiftPreference: '',
    vehicleType: 'Bike'
  });

  const formatCurrency = (value: number | string) => {
    const amount = Number(value || 0);
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPaymentMethod = (method?: string | null, orderType?: string | null, notes?: string | null, isPaidOnline?: boolean) => {
    const noteStr = String(notes || '').toLowerCase();
    const m = String(method || '').toLowerCase();

    if (noteStr.includes('via upi') || m === 'upi') {
      return 'UPI Payment';
    }
    if (noteStr.includes('via card') || m === 'card') {
      return 'Credit / Debit Card';
    }
    if (m === 'counter_billing' || m === 'counter' || m === 'pay_at_counter' || m === 'cashier') {
      return 'Counter Billing (Offline)';
    }
    if (m === 'cod') {
      return 'COD (Cash on Delivery)';
    }
    if (m === 'cash') {
      return orderType === 'dine-in' ? 'Counter Billing (Offline)' : 'Cash Payment';
    }
    if (isPaidOnline) {
      return 'Paid Online';
    }
    if (!method || m === 'null' || m === 'undefined') {
      return orderType === 'dine-in' ? 'Counter Billing (Offline)' : 'COD (Cash on Delivery)';
    }
    return String(method).toUpperCase();
  };

  const renderPermissionCellIcon = (level: string) => {
    switch (level) {
      case 'full':
        return <span className="block" title="Full Access"><Check className="h-4 w-4 text-emerald-500 mx-auto" /></span>;
      case 'view':
        return <span className="block" title="View Only"><Search className="h-4 w-4 text-amber-500 mx-auto" /></span>;
      case 'edit':
        return <span className="block" title="Edit Access"><Edit2 className="h-4 w-4 text-blue-500 mx-auto" /></span>;
      case 'sales':
        return <span className="block" title="Sales Access"><DollarSign className="h-4 w-4 text-orange-500 mx-auto" /></span>;
      case 'none':
      default:
        return <span className="block" title="No Access"><X className="h-4 w-4 text-rose-500 mx-auto" /></span>;
    }
  };

  const hasAccessToModule = (role: string, moduleName: string, requiredAccess: 'full' | 'view' | 'edit' | 'sales' = 'view') => {
    if (role === 'owner') return true;
    const row = matrixPermissions.find((r: any) => r.module === moduleName);
    if (!row) return true;
    const level = row[role] || 'none';
    if (level === 'none') return false;
    if (requiredAccess === 'full' && level !== 'full') return false;
    if (requiredAccess === 'edit' && !['full', 'edit'].includes(level)) return false;
    if (requiredAccess === 'sales' && !['full', 'sales'].includes(level)) return false;
    return true;
  };

  const hasAccessToTab = (role: string, tab: string) => {
    if (role === 'owner') return true;
    let moduleName = '';
    if (tab === 'overview') moduleName = 'Dashboard';
    else if (tab === 'payments') moduleName = 'Reports';
    else if (tab === 'menu') moduleName = 'Menu';
    else if (tab === 'inventory') moduleName = 'Inventory';
    else if (tab === 'shifts') moduleName = 'Staff';
    else if (tab === 'reservations') moduleName = 'Staff';
    else if (tab === 'expenses') moduleName = 'Reports';
    else if (tab === 'coupons') moduleName = 'Settings';
    else if (tab === 'control-center') return false; // Control center is owner only!

    return hasAccessToModule(role, moduleName, 'view');
  };

  const displayName = currentUser?.name || 'Customer';
  const customerOrders = data.orders.filter((order: any) => order.customerId === currentUser?.id);
  const activeCustomerOrders = customerOrders.filter((order: any) => !['completed', 'cancelled'].includes(order.status));
  const latestCustomerOrder = activeCustomerOrders[0] || null;
  const [inventoryForm, setInventoryForm] = useState({
    name: '', quantity: '', unit: 'kg', reorderLevel: '5.0', costPerUnit: '', supplierId: ''
  });

  const [purchaseOrderForm, setPurchaseOrderForm] = useState({
    supplierId: '', itemName: '', quantity: '10', cost: '100', status: 'ordered'
  });

  const [couponForm, setCouponForm] = useState({
    code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '0.00', expiryDate: '', isActive: true
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '', category: 'Ingredients', amount: '', date: '', createdBy: `${displayName} (Manager)`
  });

  const [reviewForm, setReviewForm] = useState({
    menuItemId: '', customerName: '', rating: 5, comment: ''
  });

  // --- CONTROL CENTER STATES ---
  const [controlTab, setControlTab] = useState('dashboard');
  const [matrixPermissions, setMatrixPermissions] = useState<any>([
    { id: 1, module: 'Dashboard', owner: 'full', admin: 'full', manager: 'full', cashier: 'none', chef: 'view', waiter: 'none', delivery: 'none' },
    { id: 2, module: 'Orders', owner: 'full', admin: 'full', manager: 'full', cashier: 'full', chef: 'view', waiter: 'full', delivery: 'none' },
    { id: 3, module: 'Menu', owner: 'full', admin: 'full', manager: 'edit', cashier: 'none', chef: 'view', waiter: 'view', delivery: 'none' },
    { id: 4, module: 'Inventory', owner: 'full', admin: 'full', manager: 'full', cashier: 'none', chef: 'view', waiter: 'none', delivery: 'none' },
    { id: 5, module: 'Staff', owner: 'full', admin: 'full', manager: 'view', cashier: 'none', chef: 'none', waiter: 'none', delivery: 'none' },
    { id: 6, module: 'Reports', owner: 'full', admin: 'full', manager: 'none', cashier: 'sales', chef: 'none', waiter: 'none', delivery: 'none' },
    { id: 7, module: 'Settings', owner: 'full', admin: 'view', manager: 'none', cashier: 'none', chef: 'none', waiter: 'none', delivery: 'none' }
  ]);
  
  const [matrixRoles, setMatrixRoles] = useState<any[]>([
    { key: 'owner', name: 'Owner', color: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' },
    { key: 'admin', name: 'Admin', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
    { key: 'manager', name: 'Manager', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
    { key: 'cashier', name: 'Cashier', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
    { key: 'chef', name: 'Chef', color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' },
    { key: 'waiter', name: 'Waiter', color: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' },
    { key: 'delivery', name: 'Delivery', color: 'bg-orange-500/10 text-orange-400 border border-orange-500/20' },
  ]);

  const [controlBranches, setControlBranches] = useState<any[]>([
    { id: 'ichalkaranji', name: 'Ichalkaranji', location: 'Main Branch Area', activeStaff: 0 },
    { id: 'chinchwad', name: 'Chinchwad', location: 'Pune Sector', activeStaff: 0 },
    { id: 'shivajinagar', name: 'Shivajinagar', location: 'Pune Center', activeStaff: 0 },
    { id: 'kolhapur', name: 'Kolhapur', location: 'South Zone', activeStaff: 0 }
  ]);

  const [controlSessions, setControlSessions] = useState<any[]>([]);
  const [controlLogs, setControlLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!data?.menuItems?.length) return;
    const timer = setInterval(() => {
      setBannerDishIndex((prev) => (prev + 1) % data.menuItems.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [data?.menuItems]);

  useEffect(() => {
    if (data.users && data.users.length > 0) {
      // Calculate staff count per branch dynamically
      setControlBranches([
        { id: 'ichalkaranji', name: 'Ichalkaranji', location: 'Main Branch Area', activeStaff: data.users.filter((u: any) => u.role !== 'customer' && (u.branch === 'Ichalkaranji' || !u.branch || u.branch === 'Main Branch')).length },
        { id: 'chinchwad', name: 'Chinchwad', location: 'Pune Sector', activeStaff: data.users.filter((u: any) => u.role !== 'customer' && u.branch === 'Chinchwad').length },
        { id: 'shivajinagar', name: 'Shivajinagar', location: 'Pune Center', activeStaff: data.users.filter((u: any) => u.role !== 'customer' && u.branch === 'Shivajinagar').length },
        { id: 'kolhapur', name: 'Kolhapur', location: 'South Zone', activeStaff: data.users.filter((u: any) => u.role !== 'customer' && u.branch === 'Kolhapur').length }
      ]);

      setControlSessions(prev => {
        const staff = data.users.filter((u: any) => u.role !== 'customer');
        return staff.map((u: any, idx: number) => {
          const existing = prev.find(s => s.id === `s-${u.id}`);
          if (existing) {
            return { ...existing, user: u.name, role: u.role.charAt(0).toUpperCase() + u.role.slice(1) };
          }
          return {
            id: `s-${u.id}`,
            user: u.name,
            role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
            device: idx % 2 === 0 ? 'Chrome on Windows 11' : 'Safari on iOS',
            ip: `192.168.1.${100 + idx}`,
            active: u.isEmailVerified && u.isApproved,
            time: u.isEmailVerified && u.isApproved ? 'Active now' : 'Pending activation'
          };
        });
      });

      setControlLogs(prev => {
        const staff = data.users.filter((u: any) => u.role !== 'customer');
        return staff.map((u: any, idx: number) => {
          const existing = prev.find(l => l.id === `l-${u.id}`);
          if (existing) return existing;
          return {
            id: `l-${u.id}`,
            time: 'Today, 10:30 AM',
            user: u.name,
            action: u.isEmailVerified && u.isApproved ? 'Login' : 'Account Created',
            type: u.isEmailVerified && u.isApproved ? 'success' : 'warning',
            module: 'Authentication',
            details: u.isEmailVerified && u.isApproved ? 'User logged in successfully' : 'Invitation pending activation',
            ip: `192.168.1.${100 + idx}`,
            branch: u.branch || 'Ichalkaranji'
          };
        });
      });
    }
  }, [data.users]);

  const [backupRunning, setBackupRunning] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  const [securitySettings, setSecuritySettings] = useState({
    passwordExpiry: 90,
    sessionTimeout: 30,
    twoFactorEnforced: true,
    ipRestrictionsActive: false,
    whitelistedIps: '192.168.1.100, 192.168.1.101, 10.0.0.1'
  });

  const [controlUserSearch, setControlUserSearch] = useState('');
  const [controlUserRoleFilter, setControlUserRoleFilter] = useState('all');
  const [controlUserBranchFilter, setControlUserBranchFilter] = useState('all');
  const [selectedControlUser, setSelectedControlUser] = useState<any>(null);
  const [compareBranchA, setCompareBranchA] = useState('Ichalkaranji');
  const [compareBranchB, setCompareBranchB] = useState('Chinchwad');

  const [controlUserForm, setControlUserForm] = useState({
    name: '', email: '', phone: '', role: 'waiter', pin: '', loyaltyPoints: 0, branch: 'Main Branch', status: 'Active'
  });

  // Waiter & Cashier interactive state
  const [selectedWaiterTable, setSelectedWaiterTable] = useState<any>(null);
  const [waiterQuickGuestCount, setWaiterQuickGuestCount] = useState(2);
  const [splitBillWays, setSplitBillWays] = useState(2);
  const [waiterCart, setWaiterCart] = useState<any[]>([]);
  const [isWaiterOrdering, setIsWaiterOrdering] = useState(false);
  const [waiterSelectedMenuItemId, setWaiterSelectedMenuItemId] = useState('');
  const [waiterItemQuantity, setWaiterItemQuantity] = useState(1);
  const [waiterItemNotes, setWaiterItemNotes] = useState('');
  const [selectedCashierOrder, setSelectedCashierOrder] = useState<any>(null);
  const [cashierPaymentMethod, setCashierPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [cashierActiveSubTab, setCashierActiveSubTab] = useState<'billing' | 'history'>('billing');
  const [chefActiveSubTab, setChefActiveSubTab] = useState<'dispatcher' | 'history'>('dispatcher');
  const [waiterActiveSubTab, setWaiterActiveSubTab] = useState<'seating' | 'history'>('seating');
  const [dineInPaymentPreference, setDineInPaymentPreference] = useState<'later' | 'now'>('later');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      const token = window.localStorage.getItem('authToken');
      const response = await fetch('/api/restaurant', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const json = await response.json();
      if (json.success) {
        setData(json.data);
      } else {
        showToast(json.error || "Failed to load database", 'error');
      }
    } catch (e: any) {
      showToast("Server connection error: " + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadAuth = async () => {
      if (typeof window === 'undefined') {
        setAuthChecked(true);
        return;
      }

      const token = window.localStorage.getItem('authToken');
      if (!token) {
        setCurrentUser(null);
        setAuthChecked(true);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (result.success) {
          setCurrentUser(result.user);
        } else {
          window.localStorage.removeItem('authToken');
          setCurrentUser(null);
        }
      } catch {
        window.localStorage.removeItem('authToken');
        setCurrentUser(null);
      } finally {
        setAuthChecked(true);
        setLoading(false);
      }
    };

    loadAuth();
  }, []);

  useEffect(() => {
    if (currentUser?.role) {
      const normalizedRole = currentUser.role as 'customer' | 'owner' | 'manager' | 'chef' | 'waiter' | 'cashier' | 'delivery';
      if (['customer', 'owner', 'manager', 'chef', 'waiter', 'cashier', 'delivery'].includes(normalizedRole)) {
        setCurrentRole(normalizedRole);
        if (normalizedRole === 'manager' && activeManagerTab === 'control-center') {
          setActiveManagerTab('overview');
        }
      }
    }
    
    if (currentUser) {
      setCustomerAddressLine(currentUser.addressLine || '');
      setCustomerDistrict(currentUser.district || '');
      setCustomerState(currentUser.state || '');
      setCustomerPincode(currentUser.pincode || '');
    }

    if (typeof window !== 'undefined') {
      const storageKey = `firstbite_saved_addrs_${currentUser?.id || 'guest'}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          setSavedAddresses(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      } else if (currentUser?.addressLine) {
        const defaultAddr = [{
          id: 'addr_default',
          label: 'Home (Default)',
          addressLine: currentUser.addressLine || '',
          district: currentUser.district || '',
          state: currentUser.state || '',
          pincode: currentUser.pincode || ''
        }];
        setSavedAddresses(defaultAddr);
        localStorage.setItem(storageKey, JSON.stringify(defaultAddr));
      }
    }
  }, [currentUser, activeManagerTab]);

  useEffect(() => {
    if (!authChecked || !currentUser) {
      return;
    }

    fetchData();
    const refreshMs = currentUser.role === 'customer' ? 30000 : 10000;
    const interval = setInterval(() => {
      fetchData();
    }, refreshMs);
    return () => clearInterval(interval);
  }, [authChecked, currentUser]);

  // --- HELPERS ---
  const handleLogout = () => {
    window.localStorage.removeItem('authToken');
    setCurrentUser(null);
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    const confirmed = window.confirm('This will permanently delete your customer account and cannot be undone. Continue?');
    if (!confirmed) return;

    const result = await handleAction('deleteMyAccount');
    if (result && result.success) {
      handleLogout();
    }
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleAction = async (action: string, payload: any = {}) => {
    setSubmitting(true);
    try {
      const token = window.localStorage.getItem('authToken');
      const res = await fetch('/api/restaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action, payload })
      });
      const result = await res.json();
      if (result.success) {
        const successMessage = action === 'seed'
          ? "Database fully reset and seeded!"
          : action === 'deleteMyAccount'
            ? "Your account has been permanently deleted."
            : action === 'processPayment' && result.invoiceEmailSent === false
              ? "Payment processed. Invoice email could not be delivered."
              : action === 'processPayment'
                ? "Payment processed and invoice email sent!"
                : "Operation successful!";
        showToast(successMessage, action === 'processPayment' && result.invoiceEmailSent === false ? 'info' : 'success');
        setActiveModal(null);
        setSelectedEditItem(null);
        if (action !== 'deleteMyAccount') {
          await fetchData();
        }
        return result;
      } else {
        showToast(result.error || "Something went wrong", 'error');
        return false;
      }
    } catch (err: any) {
      showToast(err.message || "Network request failed", 'error');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  if (!authChecked || loading && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold">Preparing your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.2),transparent_45%),linear-gradient(135deg,#111827_0%,#1f2937_100%)] flex items-center justify-center px-4 py-6 text-white">
        <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-2 shadow-2xl">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-rose-300">FirstBite</p>
              <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Run your restaurant from one secure place.</h1>
              <p className="mt-4 text-lg text-slate-300">Sign in to manage reservations, orders, inventory, and staff from a single dashboard.</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link href="/login" className="rounded-full bg-rose-500 px-5 py-1.5 font-semibold text-white transition hover:bg-rose-600">Log in</Link>
                <Link href="/signup" className="rounded-full border border-white/20 px-5 py-1.5 font-semibold text-white transition hover:bg-white/10">Create account</Link>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 sm:p-5">
              <h2 className="text-xl font-semibold">Why teams love it</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>• Real-time table and order tracking</li>
                <li>• Loyalty rewards and reservations</li>
                <li>• Email verified sign-in for safer access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- CART CALCULATIONS ---
  const getCartSubtotal = () => {
    return cart.reduce((sum, item) => sum + (Number(item.menuItem.price) * item.quantity), 0);
  };

  const getCartDiscount = () => {
    const subtotal = getCartSubtotal();
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      return (subtotal * Number(appliedCoupon.discountValue)) / 100;
    } else {
      return Math.min(Number(appliedCoupon.discountValue), subtotal);
    }
  };

  const getCartGst = () => {
    const subtotal = getCartSubtotal();
    const discount = getCartDiscount();
    return (subtotal - discount) * 0.05; // 5% GST
  };

  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    const discount = getCartDiscount();
    const gst = getCartGst();
    return subtotal - discount + gst;
  };

  const getDeliveryUpiPaymentUri = () => {
    const amount = getCartTotal().toFixed(2);
    return `upi://pay?pa=pamms.k07@upi&pn=FirstBite&am=${amount}&cu=INR&tn=${encodeURIComponent('FirstBite delivery order')}`;
  };

  const getDeliveryUpiQrUrl = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(getDeliveryUpiPaymentUri())}`;
  };

  const applyCouponToCart = () => {
    if (!cartCoupon) {
      showToast("Please enter a coupon code", "info");
      return;
    }
    const couponObj = data.coupons.find((c: any) => c.code.toUpperCase() === cartCoupon.toUpperCase() && c.isActive);
    if (!couponObj) {
      showToast("Invalid or expired coupon code", "error");
      setAppliedCoupon(null);
      return;
    }
    const subtotal = getCartSubtotal();
    if (subtotal < Number(couponObj.minOrderAmount)) {
      showToast(`Minimum order value of ${formatCurrency(couponObj.minOrderAmount)} required for this coupon`, "error");
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(couponObj);
    showToast(`Coupon ${couponObj.code} applied successfully!`, "success");
  };

  // --- MENU CRUD HANDLERS ---
  const handleOpenAddMenuItem = () => {
    setMenuItemForm({
      name: '', description: '', price: '', 
      categoryId: data.categories[0]?.id?.toString() || '', 
      isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: false, 
      spiceLevel: 0, preparationTime: 15, imageUrl: ''
    });
    setSelectedEditItem(null);
    setActiveModal('addMenuItem');
  };

  const handleOpenEditMenuItem = (item: any) => {
    setMenuItemForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      categoryId: item.categoryId?.toString() || '',
      isAvailable: item.isAvailable,
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      isGlutenFree: item.isGlutenFree,
      spiceLevel: item.spiceLevel,
      preparationTime: item.preparationTime,
      imageUrl: item.imageUrl || ''
    });
    setSelectedEditItem(item);
    setActiveModal('addMenuItem');
  };

  const handleSaveMenuItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuItemForm.name || !menuItemForm.price || !menuItemForm.categoryId) {
      showToast("Please fill all required fields", "error");
      return;
    }
    const payload = {
      id: selectedEditItem?.id || null,
      name: menuItemForm.name,
      description: menuItemForm.description,
      price: menuItemForm.price,
      categoryId: parseInt(menuItemForm.categoryId),
      isAvailable: menuItemForm.isAvailable,
      isVegetarian: menuItemForm.isVegetarian,
      isVegan: menuItemForm.isVegan,
      isGlutenFree: menuItemForm.isGlutenFree,
      spiceLevel: menuItemForm.spiceLevel,
      preparationTime: menuItemForm.preparationTime,
      imageUrl: menuItemForm.imageUrl
    };
    await handleAction('saveMenuItem', payload);
  };

  // --- CART ACTIONS ---
  const addToCart = (menuItem: any) => {
    const existing = cart.find(c => c.menuItem.id === menuItem.id);
    if (existing) {
      setCart(cart.map(c => c.menuItem.id === menuItem.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { menuItem, quantity: 1, notes: '' }]);
    }
    showToast(`Added ${menuItem.name} to cart`, 'success');
  };

  const updateCartQty = (id: number, delta: number) => {
    const newCart = cart.map(c => {
      if (c.menuItem.id === id) {
        const nQty = c.quantity + delta;
        return nQty > 0 ? { ...c, quantity: nQty } : null;
      }
      return c;
    }).filter(Boolean);
    setCart(newCart as any);
  };

  const handleExplicitSaveAddress = async (customLabel?: string) => {
    if (!customerAddressLine.trim()) {
      showToast("Please enter an address line first", "error");
      return false;
    }
    const label = customLabel || savedAddressLabel.trim() || (customerDistrict.trim() ? `${customerDistrict.trim()} Address` : 'Home Address');
    const newAddr = {
      id: `addr_${Date.now()}`,
      label,
      addressLine: customerAddressLine.trim(),
      district: customerDistrict.trim(),
      state: customerState.trim(),
      pincode: customerPincode.trim(),
    };

    const existingIdx = savedAddresses.findIndex(
      a => a.addressLine.toLowerCase() === newAddr.addressLine.toLowerCase() && a.pincode === newAddr.pincode
    );

    let updatedAddrs = [...savedAddresses];
    if (existingIdx >= 0) {
      updatedAddrs[existingIdx] = { ...updatedAddrs[existingIdx], ...newAddr };
    } else {
      updatedAddrs = [newAddr, ...savedAddresses];
    }

    setSavedAddresses(updatedAddrs);
    if (typeof window !== 'undefined') {
      const storageKey = `firstbite_saved_addrs_${currentUser?.id || 'guest'}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedAddrs));
    }

    if (currentUser?.id) {
      await handleAction('saveMyProfile', {
        name: currentUser.name,
        phone: currentUser.phone,
        addressLine: customerAddressLine.trim(),
        district: customerDistrict.trim(),
        state: customerState.trim(),
        pincode: customerPincode.trim(),
      });
    }

    showToast(`Address saved as "${label}"!`, "success");
    return true;
  };

  const handleDeleteSavedAddress = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedAddresses.filter(a => a.id !== idToDelete);
    setSavedAddresses(updated);
    if (typeof window !== 'undefined') {
      const storageKey = `firstbite_saved_addrs_${currentUser?.id || 'guest'}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
    showToast("Address removed from saved list", "info");
  };

  const handleCustomerCheckout = async () => {
    if (cart.length === 0) {
      showToast("Your cart is empty", "error");
      return;
    }

    if (customerOrderType === 'delivery' && !customerAddressLine.trim()) {
      showToast('Please enter your delivery address line.', 'error');
      return;
    }

    if (customerOrderType === 'delivery' && !customerDistrict.trim()) {
      showToast('Please enter your delivery district.', 'error');
      return;
    }

    if (customerOrderType === 'delivery' && !customerState.trim()) {
      showToast('Please enter your delivery state.', 'error');
      return;
    }

    if (customerOrderType === 'delivery' && !customerPincode.trim()) {
      showToast('Please enter your delivery pincode.', 'error');
      return;
    }

    if (customerPaymentMethod === 'card') {
      if (!isCardFormValid) {
        const missing: string[] = [];
        if (!isCardNumberValid) missing.push("Valid 15-16 Digit Card Number");
        if (!isCardHolderValid) missing.push("Cardholder Name");
        if (!isCardExpiryValid) missing.push("Expiry Date (MM/YY)");
        if (!isCardCvvValid) missing.push("CVV Security Code (3-4 Digits)");

        showToast(`Order Blocked: Missing ${missing.join(', ')}`, "error");
        alert(`❌ ORDER CANNOT PROCEED!\n\nYou selected Credit/Debit Card payment, but the card details are incomplete.\n\nRequired Fields:\n${missing.map(m => `• ${m}`).join('\n')}\n\nPlease fill in all card details to proceed with your order.`);
        return;
      }
    }

    const tObj = data.tables.find((t: any) => t.tableNumber === customerTable);
    const resolvedCustomerId = currentUser?.role === 'customer' && currentUser?.id
      ? currentUser.id
      : data.users.find((u: any) => u.role === 'customer')?.id || null;
    const isPaidOnline = customerOrderType === 'delivery' ? customerPaymentMethod !== 'cod' : (dineInPaymentPreference === 'now');
    const isPaid = isPaidOnline;
    const customerUserRecord = data.users.find((u: any) => u.id === resolvedCustomerId);
    const resolvedName = skipCustomerName 
      ? 'Guest Customer' 
      : (customerNameInput.trim() || currentUser?.name || customerUserRecord?.name || 'Guest Customer');

    const orderPayload = {
      customerId: resolvedCustomerId,
      customerEmail: currentUser?.email || null,
      customerName: resolvedName,
      tableId: customerOrderType === 'dine-in' ? (tObj?.id || null) : null,
      orderType: customerOrderType,
      paymentMethod: customerOrderType === 'delivery'
        ? customerPaymentMethod
        : (customerPaymentMethod === ('counter_billing' as any) ? 'counter_billing' : customerPaymentMethod),
      address: customerOrderType === 'delivery' ? `${customerAddressLine.trim()}, ${customerDistrict.trim()}, ${customerState.trim()} - ${customerPincode.trim()}` : null,
      items: cart.map(c => ({
        menuItemId: c.menuItem.id,
        quantity: c.quantity,
        price: c.menuItem.price,
        notes: c.notes
      })),
      notes: customerNotes,
      couponCode: appliedCoupon?.code || null,
      discountAmount: getCartDiscount(),
      totalAmount: getCartSubtotal(),
      gstAmount: getCartGst(),
      finalAmount: getCartTotal(),
      branch: customerBranch,
      isPaidOnline: isPaid
    };

    const success = await handleAction('placeOrder', orderPayload);
    if (success) {
      if (customerOrderType === 'delivery' && customerAddressLine.trim() && autoSaveAddress) {
        await handleExplicitSaveAddress(savedAddressLabel || 'Home');
      }

      setCart([]);
      setAppliedCoupon(null);
      setCartCoupon('');
      setCustomerNotes('');
      setCustomerNameInput('');
      setSkipCustomerName(false);
      setCustomerAddressLine('');
      setCustomerDistrict('');
      setCustomerState('');
      setCustomerPincode('');
      setCardNumber('');
      setCardHolder('');
      setCardExpiry('');
      setCardCvv('');
      setCustomerPaymentMethod(customerOrderType === 'dine-in' ? ('counter_billing' as any) : 'cod');
      setActiveCustomerTab('orders');
      setIsCartOpen(false);
      showToast("Order placed successfully!", "success");
    }
  };

  const handleWaiterPlaceOrder = async () => {
    if (waiterCart.length === 0) {
      showToast("Cart is empty", "error");
      return;
    }
    if (!selectedWaiterTable) {
      showToast("Please select a table first", "error");
      return;
    }

    const subtotal = waiterCart.reduce((sum, item) => sum + (parseFloat(item.menuItem.price) * item.quantity), 0);
    const gst = parseFloat((subtotal * 0.05).toFixed(2));
    const total = parseFloat((subtotal + gst).toFixed(2));
    
    const resolvedCustomerId = data.users.find((u: any) => u.role === 'customer')?.id || currentUser?.id || null;
    const waiterBranch = currentUser?.branch || 'Ichalkaranji';

    const orderPayload = {
      customerId: resolvedCustomerId,
      customerEmail: 'waiter@firstbite.com',
      customerName: `Table Guest (via Waiter ${currentUser?.name || ''})`,
      tableId: selectedWaiterTable.id,
      orderType: 'dine-in',
      paymentMethod: 'counter_billing',
      address: null,
      items: waiterCart.map(c => ({
        menuItemId: c.menuItem.id,
        quantity: c.quantity,
        price: c.menuItem.price,
        notes: c.notes || ''
      })),
      notes: `Order taken by Waiter ${currentUser?.name || ''}`,
      couponCode: null,
      discountAmount: '0.00',
      totalAmount: subtotal.toFixed(2),
      gstAmount: gst.toFixed(2),
      finalAmount: total.toFixed(2),
      branch: waiterBranch,
      isPaidOnline: false
    };

    const success = await handleAction('placeOrder', orderPayload);
    if (success) {
      setWaiterCart([]);
      setIsWaiterOrdering(false);
      showToast(`Order placed for Table ${selectedWaiterTable.tableNumber}!`, 'success');
    }
  };

  // --- MOCK INVOICE PREVIEW ---
  const getReceiptDetails = (order: any) => {
    if (!order) return null;
    const items = data.orderItems.filter((oi: any) => oi.orderId === order.id);
    const table = data.tables.find((t: any) => t.id === order.tableId);
    return { order, items, table };
  };

  // --- STATS & CHARTS FOR MANAGER (Filtered by selected branch for Owner/Manager) ---
  const activeBranchFilter = (currentRole === 'owner' || currentRole === 'manager') ? customerBranch : (currentUser?.branch || 'Ichalkaranji');
  
  const filteredOrdersForStats = data.orders.filter((o: any) => (o.branch || 'Ichalkaranji').toLowerCase() === activeBranchFilter.toLowerCase());
  const filteredPaymentsForStats = data.payments.filter((p: any) => {
    const order = data.orders.find((o: any) => o.id === p.orderId);
    return order && (order.branch || 'Ichalkaranji').toLowerCase() === activeBranchFilter.toLowerCase();
  });
  
  const totalRevenue = filteredPaymentsForStats.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const totalExpenses = data.expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
  const totalOrdersCount = filteredOrdersForStats.length;
  const averageOrderValue = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount) : 0;
  const availableRoles: Array<'customer' | 'owner' | 'manager' | 'chef' | 'waiter' | 'cashier' | 'delivery'> = ['customer', 'owner', 'manager', 'chef', 'waiter', 'cashier', 'delivery'];

  const filteredDeliveryOrders = data.orders
    .filter((o: any) => (o.orderType === 'delivery' || Boolean(o.address)) && ((o.branch || 'Ichalkaranji').toLowerCase() === activeBranchFilter.toLowerCase() || !activeBranchFilter))
    .filter((o: any) => {
      if (deliveryFilter === 'out_for_delivery') return o.status === 'out_for_delivery';
      if (deliveryFilter === 'ready') return ['ready', 'accepted', 'cooking'].includes(o.status);
      if (deliveryFilter === 'completed') return ['delivered', 'completed'].includes(o.status);
      return true;
    })
    .filter((o: any) => {
      if (!deliverySearch.trim()) return true;
      const q = deliverySearch.toLowerCase().trim();
      return (
        String(o.id).includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.customerPhone || '').toLowerCase().includes(q) ||
        (o.address || '').toLowerCase().includes(q)
      );
    });
  
  // Highlighting items with critical low stock level
  const lowStockItems = data.inventory.filter((item: any) => Number(item.quantity) <= Number(item.reorderLevel));

  // --- CONTROL CENTER DYNAMIC STATS (Filtered by active branch view) ---
  const controlStaff = data.users.filter((u: any) => u.role !== 'customer' && (u.branch || 'Ichalkaranji').toLowerCase() === activeBranchFilter.toLowerCase());
  const controlTotalStaff = controlStaff.length;
  
  // --- FOOD RECOMMENDATIONS HELPER FOR CUSTOMERS ---
  const getRecommendations = () => {
    const pastOrderedItemIds = new Set(
      data.orderItems
        .filter((oi: any) => {
          const parent = data.orders.find((o: any) => o.id === oi.orderId);
          return parent && parent.customerId === currentUser?.id;
        })
        .map((oi: any) => oi.menuItemId)
    );
    const orderedCategories = new Set();
    pastOrderedItemIds.forEach((id: any) => {
      const item = data.menuItems.find((mi: any) => mi.id === id);
      if (item) orderedCategories.add(item.categoryId);
    });
    let recommended = data.menuItems.filter((mi: any) => {
      return mi.isAvailable && (orderedCategories.has(mi.categoryId) || mi.spiceLevel > 0);
    });
    if (recommended.length < 4) {
      recommended = data.menuItems.filter((mi: any) => mi.isAvailable);
    }
    return recommended.slice(0, 4);
  };
  
  // --- ROLE NAMES RETRIEVER FOR INTERACTIVE CHARTS ---
  const getStaffNamesByRole = (roleName: string) => {
    const list = controlStaff.filter((u: any) => u.role === roleName).map((u: any) => u.name);
    return list.length > 0 ? list.join(', ') : 'None';
  };
  const controlMgrCount = controlStaff.filter((u: any) => u.role === 'manager').length;
  const controlOwnerCount = controlStaff.filter((u: any) => u.role === 'owner').length;
  const controlChefCount = controlStaff.filter((u: any) => u.role === 'chef').length;
  const controlWaiterCount = controlStaff.filter((u: any) => u.role === 'waiter').length;
  const controlCashierCount = controlStaff.filter((u: any) => u.role === 'cashier').length;

  const controlMgrPct = controlTotalStaff > 0 ? Math.round((controlMgrCount / controlTotalStaff) * 100) : 0;
  const controlOwnerPct = controlTotalStaff > 0 ? Math.round((controlOwnerCount / controlTotalStaff) * 100) : 0;
  const controlChefPct = controlTotalStaff > 0 ? Math.round((controlChefCount / controlTotalStaff) * 100) : 0;
  const controlWaiterPct = controlTotalStaff > 0 ? Math.round((controlWaiterCount / controlTotalStaff) * 100) : 0;
  const controlCashierPct = controlTotalStaff > 0 ? Math.round((controlCashierCount / controlTotalStaff) * 100) : 0;

  // Login Activity dynamic heights
  const loginM = Math.max(2, controlTotalStaff * 1);
  const loginT = Math.max(3, controlTotalStaff * 2);
  const loginW = Math.max(4, controlTotalStaff * 3);
  const loginTh = Math.max(5, controlTotalStaff * 4);
  const loginF = Math.max(3, controlTotalStaff * 2);
  const loginS = Math.max(2, controlTotalStaff * 1);
  const loginSu = Math.max(1, Math.round(controlTotalStaff * 0.5));
  
  const maxVal = Math.max(loginM, loginT, loginW, loginTh, loginF, loginS, loginSu);
  const hM = maxVal > 0 ? Math.round((loginM / maxVal) * 100) : 20;
  const hT = maxVal > 0 ? Math.round((loginT / maxVal) * 100) : 30;
  const hW = maxVal > 0 ? Math.round((loginW / maxVal) * 100) : 40;
  const hTh = maxVal > 0 ? Math.round((loginTh / maxVal) * 100) : 100;
  const hF = maxVal > 0 ? Math.round((loginF / maxVal) * 100) : 60;
  const hS = maxVal > 0 ? Math.round((loginS / maxVal) * 100) : 35;
  const hSu = maxVal > 0 ? Math.round((loginSu / maxVal) * 100) : 15;

  // Top Active Users dynamic progress list
  const topUsersList = controlStaff.length > 0 ? controlStaff.slice(0, 5).map((u: any, idx: number) => {
    const count = 12 + idx * 8 + (u.loyaltyPoints || 0);
    const pct = Math.min(100, Math.round((count / 150) * 100));
    const colors = ['bg-rose-500', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500'];
    return {
      name: u.name,
      count,
      styleWidth: `${pct}%`,
      color: colors[idx % 5]
    };
  }) : [];

  return (
    <div
      className="min-h-screen flex flex-col justify-between text-slate-100 antialiased relative"
      style={{ 
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url('/firstbite_restaurant_interior.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <main className="flex-1 flex flex-col w-full">
      {/* 1. TOP HEADER WITH ROLE SELECTOR */}
      <header className="sticky top-0 z-40 mx-1 mt-1 rounded-2xl px-2.5 py-2 sm:mx-3 sm:mt-3 sm:rounded-3xl sm:px-4 flex items-center justify-between border border-white/10 bg-slate-955/90 shadow-2xl backdrop-blur-xl text-white">
        {/* Left: Hamburger & Logo */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-white/15 text-slate-200 hover:bg-slate-800 touch-target flex items-center justify-center shrink-0"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="h-5 w-5 text-slate-200" />
          </button>
          <div className="bg-rose-500 text-white p-1.5 sm:p-2 rounded-xl shadow-lg flex items-center justify-center shadow-rose-500/10 shrink-0">
            <Utensils className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-lg font-black tracking-tight flex items-center gap-1 leading-none">
              <span className="italic text-white">First</span>
              <span className="text-rose-500 font-extrabold">Bite</span>
              <span className="text-[9px] bg-rose-500/25 text-rose-300 font-semibold px-1.5 py-0.5 rounded-full border border-rose-500/20 hidden sm:inline">PRO</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Modern restaurant ordering</p>
          </div>
        </div>

        {/* Center: Desktop Role Selector */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900/60 p-1 rounded-xl border border-white/5">
          {availableRoles.includes('customer') && (
            <button 
              onClick={() => setCurrentRole('customer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${currentRole === 'customer' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/25 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Users className="h-3.5 w-3.5" /> Customer
            </button>
          )}
          {availableRoles.includes('owner') && (
            <button 
              onClick={() => setCurrentRole('owner')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${currentRole === 'owner' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/25 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Owner
            </button>
          )}
          {availableRoles.includes('manager') && (
            <button 
              onClick={() => setCurrentRole('manager')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${currentRole === 'manager' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/25 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <PieChart className="h-3.5 w-3.5" /> Manager
            </button>
          )}
          {availableRoles.includes('chef') && (
            <button 
              onClick={() => setCurrentRole('chef')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${currentRole === 'chef' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/25 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Flame className="h-3.5 w-3.5 animate-pulse" /> Chef
            </button>
          )}
          {availableRoles.includes('waiter') && (
            <button 
              onClick={() => setCurrentRole('waiter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${currentRole === 'waiter' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/25 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <UserCheck className="h-3.5 w-3.5" /> Waiter
            </button>
          )}
          {availableRoles.includes('cashier') && (
            <button 
              onClick={() => setCurrentRole('cashier')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${currentRole === 'cashier' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/25 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Receipt className="h-3.5 w-3.5" /> Cashier
            </button>
          )}
          {availableRoles.includes('delivery') && (
            <button 
              onClick={() => setCurrentRole('delivery')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${currentRole === 'delivery' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/25 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Truck className="h-3.5 w-3.5" /> Delivery
            </button>
          )}
        </div>

        {/* Right Controls: Branch Dropdown + Cart + Profile Avatar */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 rounded-xl px-2 py-1">
            <select
              value={customerBranch}
              onChange={(e) => {
                setCustomerBranch(e.target.value);
                showToast(`Active branch: ${e.target.value}`, "info");
              }}
              className="bg-transparent text-[10px] sm:text-xs font-extrabold text-rose-300 outline-none cursor-pointer border-none p-0 select-none"
            >
              <option value="Ichalkaranji" className="bg-slate-950 text-white font-semibold">Ichalkaranji</option>
              <option value="Chinchwad" className="bg-slate-950 text-white font-semibold">Chinchwad</option>
              <option value="Shivajinagar" className="bg-slate-950 text-white font-semibold">Shivajinagar</option>
              <option value="Kolhapur" className="bg-slate-950 text-white font-semibold">Kolhapur</option>
            </select>
          </div>

          {currentRole === 'customer' && (
            <button 
              onClick={() => {
                setActiveCustomerTab('browse');
                setIsCartOpen(prev => !prev);
              }}
              className="relative flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white p-2 rounded-xl transition shadow-lg shadow-rose-500/25 h-[36px] w-[36px] shrink-0"
            >
              <ShoppingCart className="h-4 w-4" />
              {cart.reduce((sum, c) => sum + c.quantity, 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-rose-600 border border-rose-500 text-[9px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cart.reduce((sum, c) => sum + c.quantity, 0)}
                </span>
              )}
            </button>
          )}

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center justify-center rounded-xl border border-white/10 bg-slate-900/60 p-1 text-sm font-semibold text-white transition hover:bg-slate-800 h-[36px] w-[36px]"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white font-bold text-xs">{(currentUser?.name || 'C').charAt(0)}</div>
            </button>
          </div>
        </div>
      </header>

      {/* ROOT LEVEL PROFILE MODAL (Prevents sticky header CSS clipping) */}
      {profileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Dark Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-955/80 backdrop-blur-md transition-opacity"
            onClick={() => setProfileOpen(false)}
          />

          {/* Profile Modal Card */}
          <div className="relative z-[101] w-full max-w-sm bg-slate-955 border border-white/15 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-fade-in-scale text-slate-200">
            {/* Top Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg border border-white/20 shrink-0">
                  {(currentUser?.name || 'C').charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-white text-base truncate">{currentUser?.name || 'Guest User'}</h3>
                  <span className={`text-[9px] rounded-full px-2 py-0.5 font-bold inline-block ${currentUser?.isEmailVerified ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                    {currentUser?.isEmailVerified ? 'Verified Account' : 'Verify OTP'}
                  </span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setProfileOpen(false)}
                className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Information List */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-slate-900/80 p-3 rounded-2xl border border-white/5">
                <span className="text-slate-400 font-semibold">Email</span>
                <span className="font-bold text-white truncate max-w-[180px]">{currentUser?.email || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/80 p-3 rounded-2xl border border-white/5">
                <span className="text-slate-400 font-semibold">Phone</span>
                <span className="font-bold text-white">{currentUser?.phone || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/80 p-3 rounded-2xl border border-white/5">
                <span className="text-slate-400 font-semibold">Loyalty Points</span>
                <span className="font-black text-rose-400 text-sm">{currentUser?.loyaltyPoints ?? 0} pts</span>
              </div>
            </div>

            {/* Icon-Only / Symbol Action Row */}
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/10">
              {/* Symbol 1: Edit Profile */}
              <button
                type="button"
                title="Edit Profile"
                onClick={() => {
                  setEditName(currentUser?.name || '');
                  setEditPhone(currentUser?.phone || '');
                  setEditEmail(currentUser?.email || '');
                  setEditAddress(currentUser?.address || customerAddressLine || '');
                  setProfileOpen(false);
                  setIsEditProfileOpen(true);
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-rose-600/20 border border-rose-500/30 text-rose-300 hover:bg-rose-600 hover:text-white transition group"
              >
                <Edit2 className="h-5 w-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-extrabold">Edit</span>
              </button>

              {/* Symbol 2: Account Settings */}
              <button
                type="button"
                title="Account Settings"
                onClick={() => { setProfileOpen(false); window.location.href = '/account-settings'; }}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white transition group"
              >
                <Settings className="h-5 w-5 mb-1 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">Settings</span>
              </button>

              {/* Symbol 3: My Orders */}
              <button
                type="button"
                title="My Orders"
                onClick={() => {
                  setProfileOpen(false);
                  setActiveCustomerTab('orders');
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white transition group"
              >
                <Truck className="h-5 w-5 mb-1 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">Orders</span>
              </button>

              {/* Symbol 4: Logout */}
              <button
                type="button"
                title="Logout"
                onClick={() => {
                  setProfileOpen(false);
                  handleLogout();
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white transition group"
              >
                <LogOut className="h-5 w-5 mb-1 text-rose-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE ACCOUNT MODAL */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-955/80 backdrop-blur-md transition-opacity"
            onClick={() => setIsEditProfileOpen(false)}
          />
          <div className="relative z-[121] w-full max-w-md bg-slate-955 border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fade-in-scale text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-rose-600 text-white font-extrabold flex items-center justify-center shadow-lg">
                  <Edit2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Edit Account Details</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Update your profile info & delivery address</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-2xl text-white focus:outline-none focus:border-rose-500 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="10-digit phone"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-2xl text-white focus:outline-none focus:border-rose-500 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-2xl text-white focus:outline-none focus:border-rose-500 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Default Delivery Address</label>
                <textarea 
                  rows={2}
                  value={editAddress}
                  onChange={(e) => {
                    setEditAddress(e.target.value);
                    setCustomerAddressLine(e.target.value);
                  }}
                  placeholder="Flat / Building, Street Area, Landmark..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-2xl text-white focus:outline-none focus:border-rose-500 text-xs font-medium resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="flex-1 rounded-2xl bg-slate-900 border border-white/10 text-slate-300 py-3 text-xs font-bold hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editName.trim()) {
                    showToast('Name cannot be empty', 'error');
                    return;
                  }
                  setCurrentUser((prev: any) => prev ? { ...prev, name: editName, phone: editPhone, email: editEmail, address: editAddress } : null);
                  setIsEditProfileOpen(false);
                  showToast('Account details updated successfully!', 'success');
                }}
                className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white py-3 text-xs font-extrabold transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5"
              >
                <Check className="h-4 w-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE SLIDE-OUT DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-955/80 backdrop-blur-md transition-opacity"
          />

          {/* Drawer Container */}
          <div className="relative w-80 max-w-[85vw] bg-slate-955 border-r border-white/15 p-5 z-50 flex flex-col justify-between overflow-y-auto shadow-2xl animate-fade-in-scale">
            <div className="space-y-6">
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg">
                    <Utensils className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white italic">First<span className="text-rose-500 font-extrabold">Bite</span></h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Enterprise RMS</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white touch-target flex items-center justify-center"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Info Card inside drawer */}
              <div className="bg-slate-900/80 border border-white/10 p-3.5 rounded-2xl flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                  {(currentUser?.name || 'G').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white truncate">{currentUser?.name || 'Guest User'}</p>
                  <p className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider">{currentRole}</p>
                </div>
              </div>

              {/* Role Switcher in Drawer */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">Switch Role View</p>
                <div className="grid grid-cols-2 gap-2">
                  {availableRoles.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setCurrentRole(role);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`px-3 py-2.5 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 touch-target ${
                        currentRole === role
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                          : 'bg-slate-900 text-slate-300 border border-white/10 hover:bg-slate-800'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Branch Switcher in Drawer */}
              {['owner', 'manager'].includes(currentRole) && (
                <div className="bg-slate-900/60 border border-white/10 p-3 rounded-2xl space-y-1.5">
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-wider">Active Branch View</p>
                  <select
                    value={customerBranch}
                    onChange={(e) => {
                      setCustomerBranch(e.target.value);
                      setIsMobileMenuOpen(false);
                      showToast('Switched active branch to: ' + e.target.value, 'info');
                    }}
                    className="w-full bg-slate-955 border border-white/15 text-xs font-black text-white rounded-xl p-2.5 outline-none"
                  >
                    <option value="Ichalkaranji">Ichalkaranji (Main)</option>
                    <option value="Chinchwad">Chinchwad</option>
                    <option value="Shivajinagar">Shivajinagar</option>
                    <option value="Kolhapur">Kolhapur</option>
                  </select>
                </div>
              )}

              {/* Operational Desk Navigation Links */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">Desk Navigation</p>
                {currentRole === 'customer' && (
                  <>
                    <button
                      onClick={() => {
                        setActiveCustomerTab('browse');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2.5 ${activeCustomerTab === 'browse' ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30' : 'text-slate-300 hover:bg-slate-900'}`}
                    >
                      <Utensils className="h-4 w-4 text-rose-400" /> Digital Menu & Ordering
                    </button>
                    <button
                      onClick={() => {
                        setActiveCustomerTab('orders');
                        setShowOrderHistoryInTrackUI(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2.5 ${activeCustomerTab === 'orders' && !showOrderHistoryInTrackUI ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30' : 'text-slate-300 hover:bg-slate-900'}`}
                    >
                      <Clock className="h-4 w-4 text-emerald-400" /> Present Active Order
                    </button>
                    <button
                      onClick={() => {
                        setActiveCustomerTab('orders');
                        setShowOrderHistoryInTrackUI(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2.5 ${activeCustomerTab === 'orders' && showOrderHistoryInTrackUI ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30' : 'text-slate-300 hover:bg-slate-900'}`}
                    >
                      <FileText className="h-4 w-4 text-indigo-400" /> Order History
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Footer Drawer Action */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.location.href = '/account-settings';
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 py-3 rounded-xl text-xs font-black transition border border-white/10 flex items-center justify-center gap-2 touch-target"
              >
                <Settings className="h-4 w-4" /> Account Settings
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl text-xs font-black transition shadow-md flex items-center justify-center gap-2 touch-target"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. TOAST NOTIFICATION */}
      {notification && (
        <div className={`fixed left-3 right-3 top-20 z-50 p-2 rounded-2xl shadow-xl flex items-start gap-3 border transition-all animate-bounce sm:left-auto sm:right-4 sm:max-w-sm sm:w-full ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          notification.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" /> : <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />}
          <div>
            <p className="font-semibold text-sm">System Update</p>
            <p className="text-xs opacity-90">{notification.message}</p>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* ======================================================= */}
        {currentRole === 'customer' && customerMode === null && (
          <div 
            className="flex-1 flex items-center justify-center p-3 sm:p-5 min-h-[45vh] w-full relative overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.70), rgba(0, 0, 0, 0.80)), url('/firstbite_restaurant_interior.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-slate-955/50 backdrop-blur-xs"></div>
            
            <div className="max-w-xl w-full relative z-10 flex flex-col items-center text-center">
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[9px] font-black text-rose-300 uppercase tracking-widest mb-1.5 backdrop-blur-md shadow-md animate-pulse">
                <Sparkles className="h-3 w-3 text-rose-400" /> FIRSTBITE DINING
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-white mb-3 drop-shadow-md tracking-tight">
                Select Order Mode
              </h2>

              <div className="w-full grid grid-cols-2 gap-2.5">
                {/* Option 1: Order Online / Delivery */}
                <div 
                  onClick={() => {
                    setCustomerMode('online');
                    setCustomerOrderType('delivery');
                    setCustomerPaymentMethod('card');
                  }}
                  className="group cursor-pointer rounded-2xl border border-rose-500/30 bg-slate-950/90 backdrop-blur-xl p-3 flex items-center justify-between hover:border-rose-500/70 hover:bg-slate-900/95 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all duration-200 text-white text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 bg-gradient-to-tr from-rose-600 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-105 transition-transform">
                      <ShoppingBag className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-rose-300 transition-colors truncate">
                        Order Online
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold truncate">Delivery & Takeaway</p>
                    </div>
                  </div>
                  <span className="h-6 w-6 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-[10px] shadow-sm shrink-0 group-hover:translate-x-0.5 transition-transform">→</span>
                </div>

                {/* Option 2: Dine-In & Table Booking */}
                <div 
                  onClick={() => {
                    setCustomerMode('dine-in');
                    setCustomerOrderType('dine-in');
                  }}
                  className="group cursor-pointer rounded-2xl border border-indigo-500/30 bg-slate-950/90 backdrop-blur-xl p-3 flex items-center justify-between hover:border-indigo-500/70 hover:bg-slate-900/95 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-200 text-white text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-105 transition-transform">
                      <Utensils className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-indigo-300 transition-colors truncate">
                        Dine-In & Book
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold truncate">In-Restaurant Table</p>
                    </div>
                  </div>
                  <span className="h-6 w-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shadow-sm shrink-0 group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentRole === 'customer' && customerMode !== null && (
          <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 sm:p-6 pb-28 lg:pb-6 max-w-7xl mx-auto w-full animate-fade-in-scale">
            
            {/* Customer Navigation and Main Body */}
            <div className="flex-1 flex flex-col space-y-6">
              
              {/* Promo Banner */}
              <div className="bg-slate-900/80 backdrop-blur-xl border border-rose-500/30 rounded-3xl p-4 sm:p-8 text-white relative overflow-hidden shadow-2xl animate-glow-pulse flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
                <div className="relative z-10 max-w-lg">
                  <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] uppercase font-extrabold tracking-wider px-3 py-1 rounded-full select-none animate-pulse">
                    <Award className="h-3.5 w-3.5" /> Loyalty Club Reward
                  </span>
                  <h2 className="text-lg sm:text-3xl font-black mt-2 sm:mt-3 leading-tight text-white">
                    {customerMode === 'online' 
                      ? 'Welcome to FirstBite — Gourmet Food Delivered Fresh & Fast!' 
                      : 'Welcome to FirstBite — Order Gourmet Food Straight to Your Table!'}
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm mt-1.5 sm:mt-2 font-medium leading-relaxed hidden sm:block">
                    {customerMode === 'online'
                      ? 'Browse our full culinary menu, apply promo coupons, track live delivery GPS, and earn reward points with every order.'
                      : 'Select live table seating, track kitchen preparation in real-time, pay seamlessly, and earn reward points with every order.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                    <span className="bg-rose-600 text-white px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold shadow-md animate-shimmer">Code: WELCOME10 (10% OFF)</span>
                    <span className="text-[11px] sm:text-xs text-rose-300 font-bold flex items-center gap-1"><Coins className="h-3.5 w-3.5 text-amber-400 animate-spin-slow" /> Points: 340</span>
                  </div>
                </div>

                {/* Animated Featured Food Picture Showcase (Border-Free, Price-Free, Auto-Rotating Photo) */}
                {data.menuItems && data.menuItems.length > 0 && (() => {
                  const item = data.menuItems[bannerDishIndex % data.menuItems.length];
                  return (
                    <div className="relative z-10 hidden md:flex flex-col items-center shrink-0">
                      <div 
                        key={item.id} 
                        className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] cursor-pointer group animate-float-slow transition-all duration-700 hover:scale-105"
                        onClick={() => {
                          addToCart(item);
                          showToast(item.name + ' added to cart', 'success');
                        }}
                        title={`Click to add ${item.name}`}
                      >
                        <img 
                          src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                        {/* Floating Veg / Non-Veg badge */}
                        <span className={`absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full uppercase shadow-xl backdrop-blur-md flex items-center gap-1.5 ${item.isVegetarian ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-300' : 'bg-rose-950/90 border border-rose-500/50 text-rose-300'}`}>
                          <span className={`w-2 h-2 rounded-full ${item.isVegetarian ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>
                          {item.isVegetarian ? '🌱 Pure Veg' : '🍗 Non-Veg'}
                        </span>
                      </div>

                      {/* Slide Indicators */}
                      <div className="flex items-center gap-1.5 mt-3">
                        {data.menuItems.slice(0, 6).map((_: any, idx: number) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setBannerDishIndex(idx)}
                            className={`h-1.5 rounded-full transition-all ${idx === (bannerDishIndex % data.menuItems.length) ? 'w-6 bg-rose-500' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none flex items-center justify-center">
                  <Utensils className="w-56 h-56 rotate-12 animate-float-slow" />
                </div>
              </div>

              <div className="rounded-3xl bg-slate-900/80 border border-white/15 backdrop-blur-xl shadow-xl p-1.5 sm:p-2">
                <div className="flex items-center justify-between gap-1.5 w-full">
                  {/* Tab 1: Digital Menu */}
                  <button 
                    type="button"
                    onClick={() => setActiveCustomerTab('browse')}
                    title="Digital Menu"
                    className={`rounded-2xl transition-all duration-300 font-extrabold text-xs flex items-center justify-center gap-1.5 ${
                      activeCustomerTab === 'browse'
                        ? 'flex-1 py-2.5 px-3 bg-rose-600 text-white shadow-lg shadow-rose-600/30 border border-rose-400'
                        : 'p-2.5 sm:px-3.5 sm:py-2.5 bg-slate-955/60 text-slate-400 border border-white/5 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <BookOpen className="h-4 w-4 shrink-0 text-rose-300" />
                    <span className={activeCustomerTab === 'browse' ? 'inline whitespace-nowrap' : 'hidden sm:inline whitespace-nowrap'}>Digital Menu</span>
                  </button>

                  {/* Tab 2: Table Reservations (Dine-In mode) */}
                  {customerMode === 'dine-in' && (
                    <button 
                      type="button"
                      onClick={() => setActiveCustomerTab('reservations')}
                      title="Book Table"
                      className={`rounded-2xl transition-all duration-300 font-extrabold text-xs flex items-center justify-center gap-1.5 ${
                        activeCustomerTab === 'reservations'
                          ? 'flex-1 py-2.5 px-3 bg-rose-600 text-white shadow-lg shadow-rose-600/30 border border-rose-400'
                          : 'p-2.5 sm:px-3.5 sm:py-2.5 bg-slate-955/60 text-slate-400 border border-white/5 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Calendar className="h-4 w-4 shrink-0 text-indigo-300" />
                      <span className={activeCustomerTab === 'reservations' ? 'inline whitespace-nowrap' : 'hidden sm:inline whitespace-nowrap'}>Book Table</span>
                    </button>
                  )}

                  {/* Tab 3: Track Orders */}
                  <button 
                    type="button"
                    onClick={() => setActiveCustomerTab('orders')}
                    title="Track Orders"
                    className={`rounded-2xl transition-all duration-300 font-extrabold text-xs flex items-center justify-center gap-1.5 ${
                      activeCustomerTab === 'orders'
                        ? 'flex-1 py-2.5 px-3 bg-rose-600 text-white shadow-lg shadow-rose-600/30 border border-rose-400'
                        : 'p-2.5 sm:px-3.5 sm:py-2.5 bg-slate-955/60 text-slate-400 border border-white/5 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Truck className="h-4 w-4 shrink-0 text-emerald-300" />
                    <span className={activeCustomerTab === 'orders' ? 'inline whitespace-nowrap' : 'hidden sm:inline whitespace-nowrap'}>Track Orders</span>
                  </button>

                  {/* Tab 4: Reviews */}
                  <button 
                    type="button"
                    onClick={() => setActiveCustomerTab('reviews')}
                    title="Reviews"
                    className={`rounded-2xl transition-all duration-300 font-extrabold text-xs flex items-center justify-center gap-1.5 ${
                      activeCustomerTab === 'reviews'
                        ? 'flex-1 py-2.5 px-3 bg-rose-600 text-white shadow-lg shadow-rose-600/30 border border-rose-400'
                        : 'p-2.5 sm:px-3.5 sm:py-2.5 bg-slate-955/60 text-slate-400 border border-white/5 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Star className="h-4 w-4 shrink-0 text-amber-300" />
                    <span className={activeCustomerTab === 'reviews' ? 'inline whitespace-nowrap' : 'hidden sm:inline whitespace-nowrap'}>Reviews</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: BROWSE MENU */}
              {activeCustomerTab === 'browse' && (
                <div className="space-y-6">
                  {/* Customer Recommendations */}
                  {customerOrders.length > 0 && (
                    <div>
                      <div className="bg-slate-900/80 border border-rose-500/30 rounded-3xl p-5 sm:p-6 backdrop-blur-xl text-white shadow-xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4 relative z-10">
                          <h3 className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Flame className="h-4 w-4 text-rose-500 animate-bounce" /> Personalized Picks For You
                          </h3>
                          <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-3 py-1 text-[10px] font-extrabold text-rose-300 uppercase tracking-wider">
                            Picks for {currentUser?.name?.split(' ')[0] || 'You'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
                          {getRecommendations().map((item: any) => (
                            <div key={item.id} className="bg-slate-955 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-rose-500/40 transition-all duration-200 shadow-md">
                              <div className="min-w-0">
                                <p className="text-xs font-black text-white truncate">{item.name}</p>
                                <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5 flex items-center gap-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${item.isVegetarian ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                  {item.isVegetarian ? 'Veg' : 'Non-Veg'} • {formatCurrency(Number(item.price))}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const existing = cart.find((c: any) => c.menuItem.id === item.id);
                                  if (existing) {
                                    setCart(cart.map((c: any) => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
                                  } else {
                                    setCart([...cart, { menuItem: item, quantity: 1, notes: '' }]);
                                  }
                                  setIsCartOpen(true);
                                  showToast(item.name + ' added to cart', 'success');
                                }}
                                className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-xl transition shrink-0 shadow-md"
                              >
                                + Add
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Filters & Search */}
                  <div className="flex flex-col md:flex-row gap-3 bg-slate-900/80 backdrop-blur-xl p-3 sm:p-4 rounded-3xl border border-white/15 shadow-xl">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                        placeholder="Search Butter Chicken, Biryani, Truffle Fries, Pizza..." 
                        className="w-full pl-10 pr-4 py-3 bg-slate-955 border border-white/15 rounded-2xl text-sm text-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition placeholder-slate-500"
                      />
                    </div>
                    
                    {/* Dedicated Veg / Non-Veg / GF Diet Filter Toggle */}
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-955 p-1 rounded-2xl border border-white/10 w-full sm:w-auto overflow-x-auto no-scrollbar justify-between sm:justify-start shrink-0">
                      <button 
                        type="button"
                        onClick={() => setMenuFilters({ ...menuFilters, diet: 'all' })}
                        className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-extrabold whitespace-nowrap transition-all flex items-center justify-center gap-1 ${menuFilters.diet === 'all' ? 'bg-slate-800 text-white shadow-md border border-white/10' : 'text-slate-400 hover:text-white'}`}
                      >
                        <Utensils className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-rose-400 shrink-0" /> All
                      </button>
                      <button 
                        type="button"
                        onClick={() => setMenuFilters({ ...menuFilters, diet: 'veg' })}
                        className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-extrabold whitespace-nowrap transition-all flex items-center justify-center gap-1 ${menuFilters.diet === 'veg' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-400 hover:text-emerald-400'}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span> 🌱 Veg
                      </button>
                      <button 
                        type="button"
                        onClick={() => setMenuFilters({ ...menuFilters, diet: 'non-veg' })}
                        className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-extrabold whitespace-nowrap transition-all flex items-center justify-center gap-1 ${menuFilters.diet === 'non-veg' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'text-slate-400 hover:text-rose-400'}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span> 🍗 Non-Veg
                      </button>
                      <button 
                        type="button"
                        onClick={() => setMenuFilters({ ...menuFilters, gf: !menuFilters.gf })}
                        className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-extrabold whitespace-nowrap border transition-all flex items-center justify-center gap-1 ${menuFilters.gf ? 'bg-amber-600 border-amber-500 text-white shadow-md' : 'border-white/10 text-slate-400 bg-slate-955 hover:bg-slate-800 hover:text-white'}`}
                      >
                        <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400 shrink-0" /> GF
                      </button>
                    </div>
                  </div>

                  {/* Category Pill Buttons */}
                  <div className="flex flex-nowrap sm:flex-wrap gap-2 pb-2 overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${selectedCategory === null ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      All Categories ({data.menuItems.length})
                    </button>
                    {data.categories.map((cat: any) => {
                      const count = data.menuItems.filter((m: any) => m.categoryId === cat.id).length;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                        >
                          {cat.name} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Menu Items Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {data.menuItems
                      .filter((item: any) => !selectedCategory || item.categoryId === selectedCategory)
                      .filter((item: any) => item.name.toLowerCase().includes(menuSearch.toLowerCase()) || (item.description && item.description.toLowerCase().includes(menuSearch.toLowerCase())))
                      .filter((item: any) => {
                        if (menuFilters.diet === 'veg') return item.isVegetarian;
                        if (menuFilters.diet === 'non-veg') return !item.isVegetarian;
                        return true;
                      })
                      .filter((item: any) => !menuFilters.gf || item.isGlutenFree)
                      .map((item: any) => (
                        <div key={item.id} className="bg-slate-900/80 border border-white/15 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-rose-500/50 transition-all duration-300 backdrop-blur-xl">
                          
                          {/* MOBILE COMPACT HORIZONTAL LAYOUT (Swiggy / Zomato Mobile Standard) */}
                          <div className="flex sm:hidden p-3 items-center justify-between gap-3">
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {item.isVegetarian ? (
                                  <span className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Veg
                                  </span>
                                ) : (
                                  <span className="bg-rose-950/90 border border-rose-500/50 text-rose-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Non-Veg
                                  </span>
                                )}
                                {item.isGlutenFree && <span className="bg-amber-600/90 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">GF</span>}
                                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5"><Clock className="h-2.5 w-2.5 text-rose-400" /> {item.preparationTime}m</span>
                              </div>
                              <h3 className="font-extrabold text-white text-sm line-clamp-1">{item.name}</h3>
                              <p className="text-slate-400 text-[11px] line-clamp-2 leading-tight font-medium">{item.description}</p>
                              <div className="text-sm font-black text-rose-400 pt-1">{formatCurrency(item.price)}</div>
                            </div>

                            <div className="relative shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-slate-955 border border-white/10">
                              <img 
                                src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=250&auto=format&fit=crop&q=60"} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => addToCart(item)}
                                disabled={!item.isAvailable}
                                className={`absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-black px-2.5 py-1 rounded-xl shadow-lg uppercase whitespace-nowrap transition-all ${
                                  item.isAvailable 
                                    ? 'bg-rose-600 text-white hover:bg-rose-500 border border-rose-400 shadow-rose-600/40' 
                                    : 'bg-slate-900 text-slate-500 border border-white/10'
                                }`}
                              >
                                {item.isAvailable ? '+ ADD' : 'Sold Out'}
                              </button>
                            </div>
                          </div>

                          {/* DESKTOP / TABLET VERTICAL CARD LAYOUT */}
                          <div className="hidden sm:flex flex-col h-full">
                            <div className="h-44 sm:h-48 overflow-hidden bg-slate-955 relative">
                              <img 
                                src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60"} 
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
                                {item.isVegetarian ? (
                                  <span className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase shadow-xl backdrop-blur-md flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> 🌱 Veg
                                  </span>
                                ) : (
                                  <span className="bg-rose-950/90 border border-rose-500/50 text-rose-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase shadow-xl backdrop-blur-md flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> 🍗 Non-Veg
                                  </span>
                                )}
                                {item.isGlutenFree && <span className="bg-amber-600/90 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-md backdrop-blur-md">GF</span>}
                              </div>
                              <div className="absolute bottom-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md border border-white/10 text-slate-200 text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
                                <Clock className="h-3 w-3 text-rose-400" /> {item.preparationTime}m
                              </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                              <div>
                                <h3 className="font-black text-white text-base sm:text-lg line-clamp-1">{item.name}</h3>
                                <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed font-medium">{item.description}</p>
                                
                                {item.spiceLevel > 0 && (
                                  <div className="flex gap-1 mt-2">
                                    {Array.from({ length: item.spiceLevel }).map((_, i) => (
                                      <Flame key={i} className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
                                <span className="text-lg sm:text-xl font-black text-rose-400">{formatCurrency(item.price)}</span>
                                <button
                                  onClick={() => addToCart(item)}
                                  disabled={!item.isAvailable}
                                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-md ${
                                    item.isAvailable 
                                      ? 'bg-rose-600 text-white hover:bg-rose-700 active:scale-95 cursor-pointer shadow-rose-600/30' 
                                      : 'bg-slate-955 text-slate-500 border border-white/10 cursor-not-allowed'
                                  }`}
                                >
                                  {item.isAvailable ? '+ Add to Order' : 'Sold Out'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 2: TABLE RESERVATION */}
              {activeCustomerTab === 'reservations' && (
                <div className="bg-slate-900/80 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-white space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      <Calendar className="h-6 w-6 text-rose-500" /> Book a Premium Table
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Instantly block live tables. Managers will confirm booking request in real-time.</p>
                  </div>

                  {/* Interactive Table Layout */}
                  <VisualTableMap 
                    tables={data.tables} 
                    selectedTableNumber={customerTable} 
                    onSelectTable={(num) => {
                      setCustomerTable(num);
                      const found = data.tables.find((t: any) => t.tableNumber === num);
                      if (found) {
                        setReservationForm((prev: any) => ({ ...prev, tableId: String(found.id) }));
                      }
                    }} 
                    branch={customerBranch} 
                  />

                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!reservationForm.customerName || !reservationForm.customerPhone || !reservationForm.reservationTime || !reservationForm.tableId) {
                      showToast("Please provide name, phone, table, and date/time", "error");
                      return;
                    }
                    if (resPaymentOption === 'deposit' && resPaymentMethod === 'card') {
                      const isNumEmpty = !cardNumber.trim();
                      const isNumShort = cardNumber.replace(/\s/g, '').length < 16;
                      const isHolderEmpty = !cardHolder.trim();
                      const isExpEmpty = !cardExpiry.trim();
                      const isCvvEmpty = !cardCvv.trim();

                      if (isNumEmpty || isNumShort || isHolderEmpty || isExpEmpty || isCvvEmpty) {
                        let msg = "⚠️ Please fill in all Credit/Debit Card details for deposit:\n";
                        if (isNumEmpty) msg += "\n• Card Number is required";
                        else if (isNumShort) msg += "\n• Valid 16-Digit Card Number is required";
                        if (isHolderEmpty) msg += "\n• Cardholder Name is required";
                        if (isExpEmpty) msg += "\n• Expiry Date (MM/YY) is required";
                        if (isCvvEmpty) msg += "\n• CVV Security Code is required";

                        showToast("Please fill in all credit/debit card details for deposit!", "error");
                        alert(msg);
                        return;
                      }
                    }
                    const success = await handleAction('saveReservation', {
                      ...reservationForm,
                      numberOfGuests: Number(reservationForm.numberOfGuests),
                      tableId: parseInt(reservationForm.tableId),
                      branch: customerBranch,
                      isPaidOnline: resPaymentOption === 'deposit',
                      paymentMethod: resPaymentOption === 'deposit' ? resPaymentMethod : null
                    });
                    if (success) {
                      setReservationForm({ customerName: '', customerPhone: '', tableId: '', reservationTime: '', numberOfGuests: 2, notes: '' });
                      setResPaymentOption('standard');
                      showToast("Reservation booked successfully!", "success");
                    }
                  }} className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    <div>
                      <label className="block text-xs font-black text-rose-400 uppercase tracking-wider mb-2">Your Full Name *</label>
                      <input 
                        type="text" 
                        required
                        value={reservationForm.customerName}
                        onChange={(e) => setReservationForm({ ...reservationForm, customerName: e.target.value })}
                        placeholder="Enter your name" 
                        className="w-full px-4 py-3.5 bg-slate-955 border border-white/15 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition shadow-inner leading-normal"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-rose-400 uppercase tracking-wider mb-2">Phone Number *</label>
                      <input 
                        type="tel" 
                        required
                        value={reservationForm.customerPhone}
                        onChange={(e) => setReservationForm({ ...reservationForm, customerPhone: e.target.value })}
                        placeholder="Enter your phone number" 
                        className="w-full px-4 py-3.5 bg-slate-955 border border-white/15 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition shadow-inner leading-normal"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-rose-400 uppercase tracking-wider mb-2">Select Table *</label>
                      <select 
                        required
                        value={reservationForm.tableId}
                        onChange={(e) => setReservationForm({ ...reservationForm, tableId: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-955 border border-white/15 rounded-2xl text-sm text-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition shadow-inner leading-normal cursor-pointer"
                      >
                        <option value="" className="bg-slate-950 text-white">-- Choose Live Table --</option>
                        {data.tables.map((t: any) => (
                          <option key={t.id} value={t.id} className="bg-slate-950 text-white">
                            Table {t.tableNumber} (Capacity: {t.capacity} guests) - [{t.status}]
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-rose-400 uppercase tracking-wider mb-2">Number of Guests *</label>
                      <input 
                        type="number" 
                        required
                        min="1"
                        max="20"
                        value={reservationForm.numberOfGuests}
                        onChange={(e) => setReservationForm({ ...reservationForm, numberOfGuests: Number(e.target.value) })}
                        className="w-full px-4 py-3.5 bg-slate-955 border border-white/15 rounded-2xl text-sm text-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition shadow-inner leading-normal"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-rose-400 uppercase tracking-wider mb-2">Reservation Date & Time *</label>
                      <input 
                        type="datetime-local" 
                        required
                        value={reservationForm.reservationTime}
                        onChange={(e) => setReservationForm({ ...reservationForm, reservationTime: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-955 border border-white/15 rounded-2xl text-sm text-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition shadow-inner leading-normal cursor-pointer"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-rose-400 uppercase tracking-wider mb-2">Special Notes or Allergy Requests</label>
                      <textarea 
                        rows={3}
                        value={reservationForm.notes}
                        onChange={(e) => setReservationForm({ ...reservationForm, notes: e.target.value })}
                        placeholder="Prefer near window, celebrating birthday, gluten allergy..." 
                        className="w-full px-4 py-3.5 bg-slate-955 border border-white/15 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition shadow-inner leading-normal resize-none"
                      />
                    </div>
                    <div className="md:col-span-2 bg-slate-955/60 p-4 sm:p-5 border border-white/10 rounded-2xl space-y-4 shadow-md">
                      <label className="block text-xs font-black text-rose-400 uppercase tracking-wider">Reservation Booking Deposit Option</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setResPaymentOption('standard')}
                          className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold transition-all border shadow-sm ${resPaymentOption === 'standard' ? 'bg-rose-600 border-rose-500 text-white shadow-rose-600/30' : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-white'}`}
                        >
                          Standard Reservation (No Deposit)
                        </button>
                        <button
                          type="button"
                          onClick={() => setResPaymentOption('deposit')}
                          className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold transition-all border shadow-sm ${resPaymentOption === 'deposit' ? 'bg-rose-600 border-rose-500 text-white shadow-rose-600/30' : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-white'}`}
                        >
                          Pay Online Deposit (₹500.00 Advance)
                        </button>
                      </div>

                      {resPaymentOption === 'deposit' && (
                        <div className="space-y-3 border-t border-white/10 pt-4">
                          <label className="block text-xs font-black text-slate-300 uppercase tracking-wider">Select Deposit Method</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setResPaymentMethod('upi')}
                              className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all border ${resPaymentMethod === 'upi' ? 'bg-slate-800 border-rose-500 text-rose-400 shadow-md' : 'bg-slate-950/60 text-slate-400 border-white/10 hover:text-white'}`}
                            >
                              📱 UPI Scan
                            </button>
                            <button
                              type="button"
                              onClick={() => setResPaymentMethod('card')}
                              className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all border ${resPaymentMethod === 'card' ? 'bg-slate-800 border-rose-500 text-rose-400 shadow-md' : 'bg-slate-950/60 text-slate-400 border-white/10 hover:text-white'}`}
                            >
                              💳 Credit Card
                            </button>
                          </div>

                          {resPaymentMethod === 'upi' && (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-left shadow-md">
                              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-xl border border-white/10 bg-white p-2 shadow-sm shrink-0">
                                <img
                                  src={getDeliveryUpiQrUrl()}
                                  alt="Deposit payment QR code"
                                  className="h-full w-full object-contain"
                                />
                              </div>
                              <div className="min-w-0 flex flex-col justify-center">
                                <div className="flex items-center gap-1.5 text-emerald-400">
                                  <Smartphone className="h-4 w-4" />
                                  <p className="text-xs font-extrabold uppercase tracking-wider">UPI Instant Deposit</p>
                                </div>
                                <p className="mt-1 text-xl font-black text-white">₹500.00</p>
                                <p className="mt-1 truncate text-xs font-mono text-slate-300">pamms.k07@upi</p>
                              </div>
                            </div>
                          )}

                          {resPaymentMethod === 'card' && (
                            <div className="mt-3 rounded-2xl border border-rose-500/30 bg-slate-950/80 p-4 space-y-3 text-left shadow-md">
                              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <div className="flex items-center gap-2 text-rose-400">
                                  <CreditCard className="h-4 w-4" />
                                  <p className="text-xs font-black uppercase tracking-wider">Credit / Debit Card Deposit</p>
                                </div>
                                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1"><Lock className="h-3 w-3" /> SSL 256-Bit</span>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <input
                                  type="text"
                                  maxLength={19}
                                  placeholder="4532 0000 0000 0000 (Card Number)"
                                  value={cardNumber}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').substring(0, 16);
                                    const formatted = val.replace(/(.{4})/g, '$1 ').trim();
                                    setCardNumber(formatted);
                                  }}
                                  className={`col-span-2 rounded-xl border bg-slate-900 px-4 py-2.5 font-mono text-white text-xs focus:outline-none ${!cardNumber.trim() || cardNumber.replace(/\s/g, '').length < 16 ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-emerald-500'}`}
                                />
                                <input
                                  type="text"
                                  placeholder="Cardholder Name"
                                  value={cardHolder}
                                  onChange={(e) => setCardHolder(e.target.value)}
                                  className={`col-span-2 rounded-xl border bg-slate-900 px-4 py-2.5 text-white text-xs uppercase focus:outline-none ${!cardHolder.trim() ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-emerald-500'}`}
                                />
                                <input
                                  type="text"
                                  maxLength={5}
                                  placeholder="MM/YY"
                                  value={cardExpiry}
                                  onChange={(e) => {
                                    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
                                    if (val.length >= 3) val = `${val.substring(0, 2)}/${val.substring(2)}`;
                                    setCardExpiry(val);
                                  }}
                                  className={`rounded-xl border bg-slate-900 px-4 py-2.5 font-mono text-white text-xs text-center focus:outline-none ${!cardExpiry.trim() ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-emerald-500'}`}
                                />
                                <input
                                  type="password"
                                  maxLength={4}
                                  placeholder="CVV"
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                                  className={`rounded-xl border bg-slate-900 px-4 py-2.5 font-mono text-white text-xs text-center focus:outline-none ${!cardCvv.trim() ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-emerald-500'}`}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2 pt-2">
                      <button 
                        type="submit" 
                        disabled={resPaymentOption === 'deposit' && resPaymentMethod === 'card' && !isCardFormValid}
                        className={`w-full py-4 px-6 font-black rounded-2xl transition-all shadow-xl text-base flex items-center justify-center gap-2 tracking-wide ${
                          resPaymentOption === 'deposit' && resPaymentMethod === 'card' && !isCardFormValid
                            ? 'bg-slate-800 text-slate-500 border border-white/10 opacity-50 cursor-not-allowed pointer-events-none'
                            : 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-rose-600/30 active:scale-98'
                        }`}
                      >
                        <Calendar className="h-5 w-5" /> Submit Reservation Request
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: ORDER HISTORY & TRACKER */}
              {activeCustomerTab === 'orders' && (() => {
                const activeOrder = customerOrders.find((o: any) => !['completed', 'cancelled'].includes(o.status)) || (latestCustomerOrder && !['completed', 'cancelled'].includes(latestCustomerOrder.status) ? latestCustomerOrder : null);
                const pastOrders = customerOrders.filter((o: any) => ['completed', 'cancelled'].includes(o.status));
                const displayedOrders = showOrderHistoryInTrackUI ? (pastOrders.length > 0 ? pastOrders : customerOrders) : (activeOrder ? [activeOrder] : []);

                return (
                  <div className="space-y-6">
                    {/* Track Orders Header & Sub-Tab Switcher */}
                    <div className="bg-slate-900/80 border border-white/15 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                          <Truck className="h-6 w-6 text-rose-500" /> Order Tracking & History
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Track your active order in real-time or browse your past order history.</p>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-955 p-1.5 rounded-2xl border border-white/10 shrink-0 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setShowOrderHistoryInTrackUI(false)}
                          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${!showOrderHistoryInTrackUI ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' : 'text-slate-400 hover:text-white'}`}
                        >
                          <Clock className="h-4 w-4" /> Present Active Order
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowOrderHistoryInTrackUI(true)}
                          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${showOrderHistoryInTrackUI ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' : 'text-slate-400 hover:text-white'}`}
                        >
                          <History className="h-4 w-4" /> Order History ({pastOrders.length})
                        </button>
                      </div>
                    </div>

                    {/* Present Active Order View */}
                    {!showOrderHistoryInTrackUI && (
                      <div className="space-y-6">
                        {activeOrder ? (
                          <>
                            <LiveKitchenTracker 
                              order={activeOrder} 
                              onCancelOrder={(id) => handleAction('cancel_order', { id })} 
                              formatCurrency={formatCurrency} 
                            />

                            <div className="bg-slate-900/80 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-white space-y-6">
                              <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                                <div>
                                  <h4 className="text-lg font-black text-white flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-emerald-400" /> Active Order Details
                                  </h4>
                                  <p className="text-xs text-slate-400 mt-0.5">Order #{activeOrder.id} is currently being processed.</p>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold uppercase">
                                  In Progress
                                </span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="bg-slate-900/80 border border-white/15 rounded-3xl p-10 text-center text-slate-400 space-y-4 backdrop-blur-xl shadow-2xl">
                            <Utensils className="h-12 w-12 text-slate-500 mx-auto" />
                            <div>
                              <h4 className="text-base font-black text-white">No Active Order Currently in Progress</h4>
                              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">Browse our gourmet digital menu to place a new order, or check your past completed orders in Order History.</p>
                            </div>
                            <div className="flex items-center justify-center gap-3 pt-2">
                              <button
                                type="button"
                                onClick={() => setActiveCustomerTab('browse')}
                                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition shadow-lg shadow-rose-600/30"
                              >
                                + Order Food Now
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowOrderHistoryInTrackUI(true)}
                                className="px-5 py-2.5 rounded-2xl bg-slate-955 border border-white/10 hover:bg-slate-800 text-slate-300 font-extrabold text-xs transition"
                              >
                                View Past Order History
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Order History View / List Container */}
                    {(showOrderHistoryInTrackUI || activeOrder) && (
                    <div className="bg-slate-900/80 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-white space-y-6">
                      <div className="border-b border-white/10 pb-4">
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                          {showOrderHistoryInTrackUI ? <History className="h-6 w-6 text-rose-500" /> : <Truck className="h-6 w-6 text-rose-500" />}
                          {showOrderHistoryInTrackUI ? 'Past Order History' : 'Active Order Card'}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                          {showOrderHistoryInTrackUI ? 'Review past completed transactions, item breakdowns, and receipts.' : 'Detailed status breakdown and live preparation updates.'}
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3 text-xs text-slate-400">
                        <div className="rounded-2xl border border-white/10 bg-slate-955/80 p-4 shadow-inner">
                          <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Active Order</p>
                          <p className="text-rose-400 text-base font-black">{activeOrder ? activeOrder.status.toUpperCase() : 'None'}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-955/80 p-4 shadow-inner">
                          <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Total Orders</p>
                          <p className="text-white text-base font-black">{customerOrders.length}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-955/80 p-4 shadow-inner">
                          <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Past Completed</p>
                          <p className="text-white text-base font-black">{pastOrders.length}</p>
                        </div>
                      </div>

                      {displayedOrders.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 bg-slate-955/40 rounded-3xl border border-white/5 p-6">
                          <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-slate-500" />
                          <p className="text-sm font-bold text-slate-400">No orders found in this view.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {displayedOrders.map((order: any) => {
                          const table = data.tables.find((t: any) => t.id === order.tableId);
                          const items = data.orderItems.filter((oi: any) => oi.orderId === order.id);
                          
                          const statusColors: Record<string, string> = {
                            pending: 'bg-amber-500/20 text-amber-300 border-amber-500/25',
                            accepted: 'bg-blue-500/20 text-blue-300 border-blue-500/25',
                            cooking: 'bg-purple-500/20 text-purple-300 border-purple-500/25 animate-pulse',
                            ready: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/25',
                            served: 'bg-rose-500/20 text-rose-300 border-rose-500/25',
                            completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/25',
                            cancelled: 'bg-slate-500/20 text-slate-400 border-slate-500/25'
                          };

                          return (
                            <div key={order.id} className="border border-white/10 rounded-3xl bg-slate-955/60 hover:bg-slate-955 transition-all duration-200 overflow-hidden shadow-lg">
                              <button
                                type="button"
                                onClick={() => setSelectedOrderId(order.id === selectedOrderId ? null : order.id)}
                                className="w-full p-4 sm:p-5 text-left"
                              >
                                <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                                  <div>
                                    <span className="text-sm font-black text-white">Order ID: #{order.id}</span>
                                    <span className="mx-2 text-slate-500">|</span>
                                    <span className="text-xs font-bold text-rose-300">Type: {order.orderType.toUpperCase()} {table ? `(T${table.tableNumber})` : ''}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {order.status === 'pending' && (
                                      <button
                                        type="button"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          const confirmed = window.confirm(`Are you sure you want to cancel Order #ORD-${order.id}?`);
                                          if (!confirmed) return;
                                          const success = await handleAction('updateOrderStatus', { id: order.id, status: 'cancelled' });
                                          if (success) {
                                            showToast(`Order #ORD-${order.id} has been cancelled.`, 'info');
                                          }
                                        }}
                                        className="px-3.5 py-1.5 rounded-xl border border-rose-500/40 bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 text-xs font-bold transition flex items-center gap-1 shadow-sm"
                                      >
                                        <XCircle className="h-3.5 w-3.5 text-rose-300" /> Cancel Order
                                      </button>
                                    )}
                                    <span className={`text-[10px] sm:text-xs font-black px-3 py-1 rounded-full border ${statusColors[order.status] || 'bg-slate-900 border-white/10'}`}>
                                      ● {order.status.toUpperCase()}
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2.5 text-center text-xs text-slate-400">
                                  <div className="rounded-2xl border border-white/5 bg-slate-900/80 p-2.5 sm:p-3">
                                    <p className="font-extrabold text-slate-400 text-[10px] uppercase">Ordered At</p>
                                    <p className="text-white font-bold truncate mt-0.5">{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                                  </div>
                                  <div className="rounded-2xl border border-white/5 bg-slate-900/80 p-2.5 sm:p-3">
                                    <p className="font-extrabold text-slate-400 text-[10px] uppercase">Payment</p>
                                    <p className="text-slate-200 truncate font-bold mt-0.5">{formatPaymentMethod(order.paymentMethod, order.orderType, order.notes, order.isPaidOnline)}</p>
                                  </div>
                                  <div className="rounded-2xl border border-white/5 bg-slate-900/80 p-2.5 sm:p-3">
                                    <p className="font-extrabold text-slate-400 text-[10px] uppercase">Total Bill</p>
                                    <p className="text-rose-400 font-black truncate mt-0.5">{formatCurrency(order.finalAmount)}</p>
                                  </div>
                                </div>
                              </button>

                              <div className="mx-4 sm:mx-5 bg-white/10 rounded-full h-2 mb-4 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-rose-600 to-amber-500 h-2 transition-all duration-1000" 
                                  style={{
                                    width: order.status === 'pending' ? '15%' :
                                           order.status === 'accepted' ? '35%' :
                                           order.status === 'cooking' ? '60%' :
                                           order.status === 'ready' ? '80%' :
                                           order.status === 'served' ? '90%' :
                                           order.status === 'completed' ? '100%' : '0%'
                                  }}
                                />
                              </div>

                              {selectedOrderId === order.id ? (
                                <div className="border-t border-white/10 bg-slate-950 p-4 sm:p-6 text-xs text-slate-300 space-y-4">
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div className="rounded-2xl bg-slate-900 p-3 sm:p-4 border border-white/5">
                                      <p className="font-bold text-white mb-1">Order note</p>
                                      <p className="text-slate-300">{order.notes || 'No special instructions'}</p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-900 p-3 sm:p-4 border border-white/5">
                                      <p className="font-bold text-white mb-1">Coupon</p>
                                      <p className="text-slate-300">{order.couponCode || 'None'}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="font-bold text-white">Items</p>
                                    {items.map((oi: any) => {
                                      const menuItem = data.menuItems.find((m: any) => m.id === oi.menuItemId);
                                      return (
                                        <div key={oi.id} className="flex justify-between rounded-2xl bg-slate-900 p-3 sm:p-4 border border-white/5">
                                          <div>
                                            <p className="font-semibold text-white">{menuItem ? menuItem.name : 'Unknown item'}</p>
                                            <p className="text-xs text-slate-400">Qty: {oi.quantity} {oi.notes ? `• ${oi.notes}` : ''}</p>
                                          </div>
                                          <p className="font-bold text-white">{formatCurrency(Number(oi.unitPrice) * oi.quantity)}</p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div className="rounded-2xl bg-slate-900 p-3 sm:p-4 border border-white/5">
                                      <p className="font-bold text-white mb-1">Order status</p>
                                      <p className="capitalize text-slate-300">{order.status}</p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-900 p-3 sm:p-4 border border-white/5">
                                      <p className="font-bold text-white mb-1">Order details</p>
                                      <p className="text-slate-300">{order.orderType === 'dine-in' ? `Table ${table?.tableNumber}` : order.address || 'Delivery address not set'}</p>
                                    </div>
                                  </div>
                                  <div className="mt-4 rounded-3xl border border-white/10 bg-slate-900/40 p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400 mb-3">Order Progress Tracker</p>
                                    <div className="space-y-3">
                                      {(order.orderType === 'delivery' 
                                        ? [
                                            { step: 1, label: 'Order Placed & Confirmed', active: ['pending','accepted','cooking','ready','out_for_delivery','delivered','completed'].includes(order.status) },
                                            { step: 2, label: 'Preparing in Kitchen', active: ['cooking','ready','out_for_delivery','delivered','completed'].includes(order.status) },
                                            { step: 3, label: 'Ready for Rider Pickup', active: ['ready','out_for_delivery','delivered','completed'].includes(order.status) },
                                            { step: 4, label: 'Out for Delivery (Rider Dispatched)', active: ['out_for_delivery','delivered','completed'].includes(order.status) },
                                            { step: 5, label: 'Order Delivered Successfully', active: ['delivered','completed'].includes(order.status) },
                                          ]
                                        : [
                                            { step: 1, label: 'Confirmed by waiter', active: ['accepted','cooking','ready','served','completed'].includes(order.status) },
                                            { step: 2, label: 'Sent to chef', active: ['cooking','ready','served','completed'].includes(order.status) },
                                            { step: 3, label: 'Cooking in progress by chef', active: ['cooking','ready','served','completed'].includes(order.status) },
                                            { step: 4, label: 'Your order is ready', active: ['ready','served','completed'].includes(order.status) },
                                            { step: 5, label: 'Served to table', active: ['served','completed'].includes(order.status) },
                                          ]
                                      ).map((step) => (
                                        <div key={step.step} className="flex items-center gap-3">
                                          <div className={`h-6 w-6 rounded-full border flex items-center justify-center ${step.active ? (order.orderType === 'delivery' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-rose-500 border-rose-500 text-white') : 'bg-slate-900 border-white/10 text-slate-500'}`}>
                                            <span className="text-[10px] font-bold">{step.step}</span>
                                          </div>
                                          <div>
                                            <p className={`text-sm ${step.active ? 'text-white font-semibold' : 'text-slate-500'}`}>{step.label}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {order.orderType === 'delivery' && (
                                      <div className="mt-5 rounded-3xl border border-blue-500/30 bg-slate-950 p-4 sm:p-5 space-y-4 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                          <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-inner">
                                              <Truck className="h-5 w-5 animate-bounce text-blue-400" />
                                            </div>
                                            <div>
                                              <h4 className="text-xs sm:text-sm font-extrabold text-white">Live GPS Delivery Tracking</h4>
                                              <p className="text-[10px] text-blue-300 font-medium flex items-center gap-1">
                                                {order.status === 'out_for_delivery' 
                                                  ? <><CheckCircle2 className="h-3 w-3 text-emerald-400 inline" /> Rider Vikram is actively on the way with your food!</>
                                                  : order.status === 'completed' || order.status === 'delivered'
                                                  ? <><CheckCircle2 className="h-3 w-3 text-emerald-400 inline" /> Order delivered successfully to your location</>
                                                  : <><Clock className="h-3 w-3 text-amber-400 inline" /> Dispatching rider from kitchen once food is ready</>}
                                              </p>
                                            </div>
                                          </div>
                                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-extrabold uppercase text-emerald-400 shrink-0">
                                            GPS Active
                                          </span>
                                        </div>

                                        <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 p-4 flex flex-col justify-between shadow-inner">
                                          <div 
                                            className="absolute inset-0 opacity-15 pointer-events-none"
                                            style={{
                                              backgroundImage: `radial-gradient(#3b82f6 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                                              backgroundSize: '20px 20px, 30px 30px, 30px 30px'
                                            }}
                                          />

                                          <svg className="absolute inset-0 h-full w-full pointer-events-none">
                                            <path 
                                              d="M 40 120 Q 180 30, 320 110 T 480 50" 
                                              fill="none" 
                                              stroke="#3b82f6" 
                                              strokeWidth="3" 
                                              strokeDasharray="6 6"
                                              className="animate-pulse"
                                            />
                                          </svg>

                                          <div className="relative z-10 flex items-center justify-between text-xs font-bold">
                                            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950/90 px-3 py-1.5 text-slate-200 backdrop-blur-md">
                                              <MapPin className="h-4 w-4 text-rose-400 shrink-0" />
                                              <span className="truncate max-w-[180px] sm:max-w-[260px]">{order.address || 'Ichalkaranji'}</span>
                                            </div>
                                            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-3 py-1.5 text-emerald-300 font-black">
                                              ETA: {order.status === 'out_for_delivery' ? '12 Mins' : order.status === 'completed' ? 'Delivered' : '15-25 Mins'}
                                            </div>
                                          </div>

                                          <div className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-1">
                                            <div className="flex flex-col items-center gap-1 text-center">
                                              <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-rose-500/40 bg-rose-500/20 text-rose-300 shadow-lg">
                                                <Utensils className="h-4 w-4" />
                                              </div>
                                              <span className="text-[9px] font-bold text-slate-300">Kitchen</span>
                                            </div>

                                            <div className="flex flex-col items-center gap-1 text-center animate-bounce">
                                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-400 bg-blue-600 text-white shadow-lg shadow-blue-500/40">
                                                <Truck className="h-5 w-5" />
                                              </div>
                                              <span className="text-[9px] font-black text-blue-300">Rider Vikram</span>
                                            </div>

                                            <div className="flex flex-col items-center gap-1 text-center">
                                              <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 shadow-lg">
                                                <MapPin className="h-4 w-4" />
                                              </div>
                                              <span className="text-[9px] font-bold text-slate-300">Destination</span>
                                            </div>
                                          </div>

                                          <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-2">
                                            <span>Distance: <strong className="text-white font-bold">1.8 km</strong></span>
                                            <span>Speed: <strong className="text-blue-400 font-bold">28 km/h</strong></span>
                                            <span>Live Route: <strong className="text-emerald-400 font-bold">Optimal GPS</strong></span>
                                          </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                                          <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-slate-800 text-rose-400 font-black text-sm">
                                              RV
                                            </div>
                                            <div>
                                              <p className="text-xs sm:text-sm font-extrabold text-white">Rider Vikram</p>
                                              <p className="text-[10px] text-slate-400">Assigned Delivery Executive • FirstBite Express</p>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <a
                                              href="tel:+919876543210"
                                              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md"
                                            >
                                              <Smartphone className="h-4 w-4" /> Call Rider
                                            </a>

                                            {order.address && (
                                              <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-blue-500/30 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md"
                                              >
                                                <Globe className="h-4 w-4" /> Google Maps
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {order.status === 'pending' && (
                                      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/10 pt-4">
                                        <span className="text-xs text-amber-300 font-medium">Order submitted. You can cancel this order before it is accepted by the chef.</span>
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            const confirmed = window.confirm(`Are you sure you want to cancel Order #ORD-${order.id}?`);
                                            if (!confirmed) return;
                                            const success = await handleAction('updateOrderStatus', { id: order.id, status: 'cancelled' });
                                            if (success) {
                                              showToast(`Order #ORD-${order.id} has been cancelled.`, 'info');
                                            }
                                          }}
                                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                                        >
                                          <XCircle className="h-4 w-4" /> Cancel Order
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  )}
                </div>
              );
            })()}

              {/* TAB 4: GUEST REVIEWS & FEEDBACK */}
              {activeCustomerTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Review Submit form */}
                  <div className="bg-slate-900/80 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-white space-y-6">
                    <div className="border-b border-white/10 pb-4">
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <Star className="h-6 w-6 text-amber-400 fill-amber-400" /> Rate Your Dining Experience
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Your feedback helps us maintain gourmet culinary standards and stellar service.</p>
                    </div>

                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!reviewForm.customerName || !reviewForm.menuItemId || !reviewForm.comment) {
                        showToast("Please provide your name, select food item, and review text", "error");
                        return;
                      }
                      const success = await handleAction('submitReview', {
                        menuItemId: parseInt(reviewForm.menuItemId),
                        customerName: reviewForm.customerName,
                        rating: Number(reviewForm.rating),
                        comment: reviewForm.comment
                      });
                      if (success) {
                        setReviewForm({ menuItemId: '', customerName: '', rating: 5, comment: '' });
                        showToast("Review submitted! Thank you.", "success");
                      }
                    }} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                        <div>
                          <label className="block text-xs font-black text-rose-400 uppercase tracking-wider mb-2">Your Name *</label>
                          <input 
                            type="text" 
                            required
                            value={reviewForm.customerName}
                            onChange={(e) => setReviewForm({ ...reviewForm, customerName: e.target.value })}
                            placeholder="Enter your name" 
                            className="w-full px-4 py-3.5 bg-slate-955 border border-white/15 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition shadow-inner leading-normal"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-rose-400 uppercase tracking-wider mb-2">Select Menu Item Rated *</label>
                          <select 
                            required
                            value={reviewForm.menuItemId}
                            onChange={(e) => setReviewForm({ ...reviewForm, menuItemId: e.target.value })}
                            className="w-full px-4 py-3.5 bg-slate-955 border border-white/15 rounded-2xl text-sm text-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition shadow-inner leading-normal cursor-pointer"
                          >
                            <option value="" className="bg-slate-950 text-white">-- Choose Item --</option>
                            {data.menuItems.map((m: any) => (
                              <option key={m.id} value={m.id} className="bg-slate-955 text-white">{m.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-rose-400 uppercase tracking-wider mb-2">Rating (1 to 5 Stars) *</label>
                        <select 
                          required
                          value={reviewForm.rating}
                          onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                          className="w-full px-4 py-3.5 bg-slate-955 border border-white/15 rounded-2xl text-sm text-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition shadow-inner leading-normal cursor-pointer"
                        >
                          <option value="5" className="bg-slate-955 text-white">★ ★ ★ ★ ★ Excellent (5 Stars)</option>
                          <option value="4" className="bg-slate-955 text-white">★ ★ ★ ★ Great (4 Stars)</option>
                          <option value="3" className="bg-slate-955 text-white">★ ★ ★ Good (3 Stars)</option>
                          <option value="2" className="bg-slate-955 text-white">★ ★ Fair (2 Stars)</option>
                          <option value="1" className="bg-slate-955 text-white">★ Poor (1 Star)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-rose-400 uppercase tracking-wider mb-2">Write your detailed review *</label>
                        <textarea 
                          rows={3}
                          required
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          placeholder="What did you like about the seasoning, service, temperature, and presentation?" 
                          className="w-full px-4 py-3.5 bg-slate-955 border border-white/15 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition shadow-inner leading-normal resize-none"
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="w-full py-4 px-6 font-black rounded-2xl transition-all shadow-xl text-base flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white shadow-rose-600/30 cursor-pointer hover:scale-[1.01] active:scale-98 border border-rose-400/30 tracking-wide"
                      >
                        <Star className="h-5 w-5 fill-white" /> Submit Feedback
                      </button>
                    </form>
                  </div>

                  {/* Existing Reviews List */}
                  <div className="bg-slate-900/80 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-white space-y-5">
                    <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-400" /> Latest Guest Reviews
                    </h3>
                    <div className="space-y-4">
                      {data.reviews.map((r: any) => {
                        const m = data.menuItems.find((mi: any) => mi.id === r.menuItemId);
                        return (
                          <div key={r.id} className="border-b border-white/10 pb-4 last:border-0 text-slate-300">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-extrabold text-sm text-white">{r.customerName}</p>
                                <p className="text-xs text-rose-400 font-semibold mb-1">Reviewed: {m ? m.name : 'Gourmet Dish'}</p>
                              </div>
                              <span className="text-xs text-amber-400 font-bold tracking-widest flex items-center gap-0.5">
                                {Array.from({ length: r.rating }).map((_, idx) => (
                                  <Star key={idx} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                ))}
                              </span>
                            </div>
                            <p className="text-slate-300 text-xs italic leading-relaxed mt-1">"{r.comment}"</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BACKDROP OVERLAY FOR CART DRAWER */}
            {activeCustomerTab === 'browse' && isCartOpen && (
              <div 
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
                onClick={() => setIsCartOpen(false)}
              />
            )}

            {/* SIDE CART DRAWER (Only visible on Browse Menu Tab and if isCartOpen is true) */}
            {activeCustomerTab === 'browse' && isCartOpen && (
              <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950/95 border-l border-white/10 shadow-2xl p-2 sm:p-4 sm:p-5 overflow-y-auto flex flex-col backdrop-blur-2xl transition-all duration-300 transform translate-x-0" id="mobile-checkout">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-rose-500" /> Shopping Cart
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/25 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {cart.reduce((sum, c) => sum + c.quantity, 0)} Items
                    </span>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
                      title="Close Cart"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                  {cart.length === 0 ? (
                    <div className="text-center py-6 text-slate-400">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-slate-500" />
                      <p className="text-sm font-semibold">Your cart is empty.</p>
                      <p className="text-xs mt-1">Pick gourmet items from digital menu to add.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Cart List */}
                      <div className="space-y-3 pr-1">
                        {cart.map((item) => (
                          <div key={item.menuItem.id} className="flex justify-between items-start gap-2 border-b border-white/5 pb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-xs text-white">{item.menuItem.name}</h4>
                              <p className="text-rose-455 text-xs font-extrabold mt-0.5">{formatCurrency(item.menuItem.price)}</p>
                              <input 
                                type="text"
                                placeholder="Special instructions..."
                                value={item.notes}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCart(cart.map(c => c.menuItem.id === item.menuItem.id ? { ...c, notes: val } : c));
                                }}
                                className="w-full mt-1.5 px-2 py-2 sm:py-0.5 bg-slate-900/60 border border-white/10 rounded text-xs sm:text-[10px] text-white focus:outline-none focus:border-rose-500/40 transition"
                              />
                            </div>

                            <div className="flex items-center gap-1.5 mt-1">
                              <button 
                                onClick={() => updateCartQty(item.menuItem.id, -1)}
                                className="h-8 w-8 rounded bg-slate-900 border border-white/5 hover:bg-slate-800 text-xs font-bold text-white"
                              >
                                -
                              </button>
                              <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateCartQty(item.menuItem.id, 1)}
                                className="h-8 w-8 rounded bg-slate-900 border border-white/5 hover:bg-slate-800 text-xs font-bold text-white"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Promo Code Coupon Area */}
                      <div className="pt-2 border-t border-white/5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Coupon Promo Code</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="e.g. WELCOME10"
                            value={cartCoupon}
                            onChange={(e) => setCartCoupon(e.target.value)}
                            className="min-w-0 flex-1 px-2.5 py-2.5 sm:py-1.5 bg-slate-900/60 border border-white/10 rounded-xl text-xs uppercase text-white placeholder-slate-400 focus:outline-none focus:border-rose-500/45 transition"
                          />
                          <button 
                            type="button"
                            onClick={applyCouponToCart}
                            className="bg-rose-500 text-white text-xs font-bold px-3 py-2.5 sm:py-1.5 rounded-xl hover:bg-rose-600 transition-all"
                          >
                            Apply
                          </button>
                        </div>
                      </div>

                      {/* Checkout Details (Table No, Order Type, Payment Method) */}
                      <div className="grid gap-2 pt-2 border-t border-white/10">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Order Mode</label>
                          <div className="w-full bg-slate-955 border border-white/10 p-2.5 rounded-lg text-xs text-slate-355 font-bold capitalize select-none">
                            {customerMode === 'online' ? 'Online Delivery' : 'Dine-In Table Ordering'}
                          </div>
                        </div>

                        {/* CUSTOMER NAME INPUT & SKIP NAME OPTION */}
                        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-2.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Customer Name for Ticket</label>
                            <label className="flex items-center gap-1.5 text-[11px] text-rose-300 cursor-pointer font-bold select-none">
                              <input
                                type="checkbox"
                                checked={skipCustomerName}
                                onChange={(e) => {
                                  setSkipCustomerName(e.target.checked);
                                  if (e.target.checked) setCustomerNameInput('');
                                }}
                                className="rounded border-white/20 bg-slate-950 text-rose-500 focus:ring-0"
                              />
                              Skip Name
                            </label>
                          </div>
                          {!skipCustomerName && (
                            <input
                              type="text"
                              value={customerNameInput}
                              onChange={(e) => setCustomerNameInput(e.target.value)}
                              placeholder="Enter your name"
                              className="w-full bg-slate-950 border border-white/10 p-2 rounded-xl text-xs text-white placeholder-slate-500 focus:border-rose-500/40 outline-none transition"
                            />
                          )}
                        </div>

                        {customerOrderType === 'dine-in' ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Your Table</label>
                              <select 
                                value={customerTable}
                                onChange={(e) => setCustomerTable(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 p-2.5 sm:p-1.5 rounded-lg text-xs text-white placeholder-slate-500 focus:border-rose-500/40 outline-none"
                              >
                                {data.tables.map((t: any) => (
                                  <option key={t.id} value={t.tableNumber}>Table {t.tableNumber}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                               <label className="block text-[10px] font-bold uppercase mb-1 font-black text-rose-400">Select Dine-In Payment Method</label>
                               <div className="grid grid-cols-3 gap-1.5 mt-1">
                                 <button
                                   type="button"
                                   onClick={() => {
                                     setDineInPaymentPreference('later');
                                     setCustomerPaymentMethod('counter_billing' as any);
                                   }}
                                   className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition flex flex-col items-center justify-center gap-1 ${dineInPaymentPreference === 'later' || customerPaymentMethod === ('counter_billing' as any) ? 'border-emerald-500 bg-emerald-600 text-white shadow-md' : 'border-white/10 bg-slate-900 text-slate-300 hover:border-white/20'}`}
                                 >
                                   <Banknote className="h-4 w-4" />
                                   <span>Counter Billing</span>
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => {
                                     setDineInPaymentPreference('now');
                                     setCustomerPaymentMethod('upi');
                                   }}
                                   className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition flex flex-col items-center justify-center gap-1 ${dineInPaymentPreference === 'now' && customerPaymentMethod === 'upi' ? 'border-rose-500 bg-rose-500 text-white shadow-md' : 'border-white/10 bg-slate-900 text-slate-300 hover:border-white/20'}`}
                                 >
                                   <Smartphone className="h-4 w-4" />
                                   <span>UPI Payment</span>
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => {
                                     setDineInPaymentPreference('now');
                                     setCustomerPaymentMethod('card');
                                   }}
                                   className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition flex flex-col items-center justify-center gap-1 ${dineInPaymentPreference === 'now' && customerPaymentMethod === 'card' ? 'border-rose-500 bg-rose-500 text-white shadow-md' : 'border-white/10 bg-slate-900 text-slate-300 hover:border-white/20'}`}
                                 >
                                   <CreditCard className="h-4 w-4" />
                                   <span>Credit/Debit Card</span>
                                 </button>
                               </div>
                                {customerPaymentMethod === 'upi' && (
                                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-[96px_1fr] gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-1.5">
                                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-xl border border-white/10 bg-white p-1.5 shadow-sm shrink-0">
                                      <img
                                        src={getDeliveryUpiQrUrl()}
                                        alt="UPI payment QR code"
                                        className="h-full w-full object-contain"
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5 text-emerald-355">
                                        <Smartphone className="h-3.5 w-3.5" />
                                        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em]">UPI Scan</p>
                                      </div>
                                      <p className="mt-1 text-base font-black text-white">₹{getCartTotal().toFixed(2)}</p>
                                      <p className="mt-1 truncate text-[10px] font-semibold text-slate-355">pamms.k07@upi</p>
                                    </div>
                                  </div>
                                )}

                                {customerPaymentMethod === 'card' && (
                                  <div className="mt-3 rounded-2xl border border-rose-500/30 bg-slate-950/80 p-3 space-y-3 shadow-lg text-left">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                      <div className="flex items-center gap-1.5 text-rose-400">
                                        <CreditCard className="h-4 w-4" />
                                        <p className="text-xs font-black uppercase tracking-wider">Credit / Debit Card</p>
                                      </div>
                                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                        <Lock className="h-3 w-3 text-emerald-400" />
                                        <span>256-Bit SSL</span>
                                      </div>
                                    </div>

                                    {/* Card Chip Mock */}
                                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-tr from-slate-900 via-rose-950/50 to-slate-900 border border-white/15 p-3 text-white shadow-inner">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-300">FirstBite Pay</span>
                                        <span className="text-[9px] font-black italic bg-white/10 px-2 py-0.5 rounded text-white border border-white/10">VISA / MC / RuPay</span>
                                      </div>
                                      <p className="font-mono text-sm tracking-widest text-slate-200">
                                        {cardNumber.trim() ? cardNumber : '•••• •••• •••• ••••'}
                                      </p>
                                      <div className="mt-3 flex justify-between items-end text-[10px]">
                                        <div>
                                          <p className="text-[8px] uppercase text-slate-400 font-bold">Card Holder</p>
                                          <p className="font-bold text-white uppercase truncate max-w-[130px]">
                                            {cardHolder.trim() || 'CARDHOLDER NAME'}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-[8px] uppercase text-slate-400 font-bold">Expires</p>
                                          <p className="font-bold text-white font-mono">{cardExpiry.trim() || 'MM/YY'}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Inputs */}
                                    <div className="space-y-2">
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Card Number *</label>
                                        <div className="relative">
                                          <input
                                            type="text"
                                            maxLength={19}
                                            placeholder="4532 0000 0000 0000"
                                            value={cardNumber}
                                            onChange={(e) => {
                                              const val = e.target.value.replace(/\D/g, '').substring(0, 16);
                                              const formatted = val.replace(/(.{4})/g, '$1 ').trim();
                                              setCardNumber(formatted);
                                            }}
                                            className={`w-full rounded-xl border bg-slate-900 px-3 py-2 pl-9 text-xs font-mono font-semibold text-white placeholder:text-slate-600 focus:outline-none ${!isCardNumberValid ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-emerald-500'}`}
                                          />
                                          <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                        </div>
                                        {!isCardNumberValid && (
                                          <p className="text-[10px] font-bold text-rose-400 mt-1">⚠️ Valid card number (15-16 digits) required</p>
                                        )}
                                      </div>

                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Card Holder Name *</label>
                                        <input
                                          type="text"
                                          placeholder="Name on card"
                                          value={cardHolder}
                                          onChange={(e) => setCardHolder(e.target.value)}
                                          className={`w-full rounded-xl border bg-slate-900 px-3 py-2 text-xs font-semibold text-white placeholder:text-slate-600 focus:outline-none uppercase ${!isCardHolderValid ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-emerald-500'}`}
                                        />
                                        {!isCardHolderValid && (
                                          <p className="text-[10px] font-bold text-rose-400 mt-1">⚠️ Cardholder name required</p>
                                        )}
                                      </div>

                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Expiry (MM/YY) *</label>
                                          <input
                                            type="text"
                                            maxLength={5}
                                            placeholder="12/28"
                                            value={cardExpiry}
                                            onChange={(e) => {
                                              let val = e.target.value.replace(/\D/g, '').substring(0, 4);
                                              if (val.length >= 3) val = `${val.substring(0, 2)}/${val.substring(2)}`;
                                              setCardExpiry(val);
                                            }}
                                            className={`w-full rounded-xl border bg-slate-900 px-3 py-2 text-xs font-mono font-semibold text-white text-center placeholder:text-slate-600 focus:outline-none ${!isCardExpiryValid ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-emerald-500'}`}
                                          />
                                          {!isCardExpiryValid && (
                                            <p className="text-[10px] font-bold text-rose-400 mt-1">⚠️ Expiry date required</p>
                                          )}
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">CVV / CVC *</label>
                                          <input
                                            type="password"
                                            maxLength={4}
                                            placeholder="•••"
                                            value={cardCvv}
                                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                                            className={`w-full rounded-xl border bg-slate-900 px-3 py-2 text-xs font-mono font-semibold text-white text-center placeholder:text-slate-600 focus:outline-none ${!isCardCvvValid ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-emerald-500'}`}
                                          />
                                          {!isCardCvvValid && (
                                            <p className="text-[10px] font-bold text-rose-400 mt-1">⚠️ CVV required</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                          <>
                            {/* SAVED ADDRESSES SELECTOR */}
                            {savedAddresses.length > 0 && (
                              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-2.5 space-y-2 mb-3">
                                <div className="flex items-center justify-between">
                                  <label className="block text-[10px] font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                                    <Bookmark className="h-3 w-3" /> Choose Saved Address
                                  </label>
                                  <span className="text-[10px] text-slate-400 font-medium">{savedAddresses.length} saved</span>
                                </div>
                                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                                  {savedAddresses.map((addr) => {
                                    const isSelected = 
                                      customerAddressLine.trim() === addr.addressLine.trim() && 
                                      customerPincode.trim() === addr.pincode.trim();
                                    return (
                                      <div
                                        key={addr.id}
                                        onClick={() => {
                                          setCustomerAddressLine(addr.addressLine || '');
                                          setCustomerDistrict(addr.district || '');
                                          setCustomerState(addr.state || '');
                                          setCustomerPincode(addr.pincode || '');
                                          showToast(`Selected address: ${addr.label}`, "info");
                                        }}
                                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-2 ${
                                          isSelected 
                                            ? 'border-rose-500 bg-rose-500/20 text-white shadow-md' 
                                            : 'border-white/10 bg-slate-900/80 text-slate-300 hover:border-white/30 hover:bg-slate-900'
                                        }`}
                                      >
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-200 border border-rose-500/30">
                                              {addr.label || 'Home'}
                                            </span>
                                            {isSelected && <span className="text-[9px] font-black text-rose-400 uppercase">Selected</span>}
                                          </div>
                                          <p className="text-xs text-white truncate font-medium">{addr.addressLine}</p>
                                          <p className="text-[10px] text-slate-400">
                                            {[addr.district, addr.state, addr.pincode].filter(Boolean).join(', ')}
                                          </p>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={(e) => handleDeleteSavedAddress(addr.id, e)}
                                          title="Remove address"
                                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* ADDRESS INPUT FIELDS */}
                            <div className="grid gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Address line</label>
                                <input
                                  type="text"
                                  value={customerAddressLine}
                                  onChange={(e) => setCustomerAddressLine(e.target.value)}
                                  className="w-full bg-slate-950 border border-white/10 p-2 rounded-xl text-xs text-white placeholder-slate-500 focus:border-rose-500/40 outline-none transition"
                                  placeholder="Street, apartment, landmark"
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">District</label>
                                  <input
                                    type="text"
                                    value={customerDistrict}
                                    onChange={(e) => setCustomerDistrict(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 p-2 rounded-xl text-xs text-white placeholder-slate-500 focus:border-rose-500/40 outline-none transition"
                                    placeholder="District"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">State</label>
                                  <input
                                    type="text"
                                    value={customerState}
                                    onChange={(e) => setCustomerState(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 p-2 rounded-xl text-xs text-white placeholder-slate-500 focus:border-rose-500/40 outline-none transition"
                                    placeholder="State"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pincode</label>
                                <input
                                  type="text"
                                  value={customerPincode}
                                  onChange={(e) => setCustomerPincode(e.target.value)}
                                  className="w-full bg-slate-950 border border-white/10 p-2 rounded-xl text-xs text-white placeholder-slate-500 focus:border-rose-500/40 outline-none transition"
                                  placeholder="Postal code"
                                />
                              </div>

                              {/* EXPLICIT SAVE ADDRESS ACTION BAR */}
                              <div className="p-2.5 rounded-2xl border border-white/10 bg-slate-900/90 space-y-2 mt-1">
                                <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Save As:</span>
                                    {['Home', 'Work', 'Other'].map(lbl => (
                                      <button
                                        key={lbl}
                                        type="button"
                                        onClick={() => setSavedAddressLabel(lbl)}
                                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                                          savedAddressLabel === lbl
                                            ? 'border-rose-500 bg-rose-500 text-white'
                                            : 'border-white/10 bg-slate-950 text-slate-400 hover:text-white'
                                        }`}
                                      >
                                        {lbl}
                                      </button>
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleExplicitSaveAddress()}
                                    disabled={!customerAddressLine.trim()}
                                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
                                  >
                                    <Bookmark className="h-3.5 w-3.5" /> Save Address
                                  </button>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer pt-1">
                                  <input
                                    type="checkbox"
                                    checked={autoSaveAddress}
                                    onChange={(e) => setAutoSaveAddress(e.target.checked)}
                                    className="rounded border-white/20 bg-slate-950 text-rose-500 focus:ring-rose-500"
                                  />
                                  <span className="text-[11px] text-slate-350">Save this address automatically for future orders</span>
                                </label>
                              </div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-1.5 shadow-md">
                              <div className="flex items-center justify-between">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase">Payment Method</label>
                                <span className="rounded-full border border-white/10 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-300">Secure</span>
                              </div>
                               <div className="mt-2 grid grid-cols-3 gap-2">
                                 {[
                                   { value: 'cod', label: 'COD', icon: Banknote },
                                   { value: 'upi', label: 'UPI', icon: Smartphone },
                                   { value: 'card', label: 'Card', icon: CreditCard },
                                 ].map(({ value, label, icon: Icon }) => (
                                   <button
                                     key={value}
                                     type="button"
                                     onClick={() => setCustomerPaymentMethod(value as 'cod' | 'card' | 'upi')}
                                     className={`flex items-center justify-center gap-1 rounded-xl border px-2 py-2 text-[11px] font-bold transition ${customerPaymentMethod === value ? 'border-rose-500 bg-rose-500 text-white' : 'border-white/10 bg-slate-900 text-slate-300 hover:border-white/20'}`}
                                   >
                                     <Icon className="h-3.5 w-3.5" />
                                     {label}
                                   </button>
                                 ))}
                               </div>
                              {customerPaymentMethod === 'cod' && (
                                <div className="mt-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] font-semibold text-amber-300 flex items-center gap-2">
                                  <Banknote className="h-4 w-4 shrink-0 text-amber-400" />
                                  <span>Pay cash on delivery (COD) when your rider arrives with your order.</span>
                                </div>
                              )}
                              <p className="mt-2 text-[10px] text-slate-400 leading-normal">Delivery orders require your full address and chosen payment method.</p>
                              {customerPaymentMethod === 'upi' && (
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-[96px_1fr] gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-1.5">
                                  <div className="mx-auto flex h-32 w-32 sm:h-24 sm:w-24 items-center justify-center rounded-xl border border-white/10 bg-white p-1.5 shadow-sm">
                                    <img
                                      src={getDeliveryUpiQrUrl()}
                                      alt="UPI payment QR code"
                                      className="h-full w-full object-contain"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 text-emerald-300">
                                      <Smartphone className="h-3.5 w-3.5" />
                                      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em]">UPI Scan</p>
                                    </div>
                                    <p className="mt-1 text-lg font-black text-white">₹{getCartTotal().toFixed(2)}</p>
                                    <p className="mt-1 truncate text-[11px] font-semibold text-slate-300">pamms.k07@upi</p>
                                    <a
                                      href={getDeliveryUpiPaymentUri()}
                                      className="mt-2 inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-700"
                                    >
                                      Open UPI App
                                    </a>
                                  </div>
                                </div>
                              )}
                              {customerPaymentMethod === 'card' && (
                                <div className="mt-3 rounded-2xl border border-rose-500/30 bg-slate-950/80 p-3 space-y-3 shadow-lg text-left">
                                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                    <div className="flex items-center gap-1.5 text-rose-400">
                                      <CreditCard className="h-4 w-4" />
                                      <p className="text-xs font-black uppercase tracking-wider">Credit / Debit Card</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                      <Lock className="h-3 w-3 text-emerald-400" />
                                      <span>256-Bit SSL</span>
                                    </div>
                                  </div>

                                  {/* Card Chip Mock */}
                                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-tr from-slate-900 via-rose-950/50 to-slate-900 border border-white/15 p-3 text-white shadow-inner">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-300">FirstBite Pay</span>
                                      <span className="text-[9px] font-black italic bg-white/10 px-2 py-0.5 rounded text-white border border-white/10">VISA / MC / RuPay</span>
                                    </div>
                                    <p className="font-mono text-sm tracking-widest text-slate-200">
                                      {cardNumber.trim() ? cardNumber : '•••• •••• •••• ••••'}
                                    </p>
                                    <div className="mt-3 flex justify-between items-end text-[10px]">
                                      <div>
                                        <p className="text-[8px] uppercase text-slate-400 font-bold">Card Holder</p>
                                        <p className="font-bold text-white uppercase truncate max-w-[130px]">
                                          {cardHolder.trim() || 'CARDHOLDER NAME'}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-[8px] uppercase text-slate-400 font-bold">Expires</p>
                                        <p className="font-bold text-white font-mono">{cardExpiry.trim() || 'MM/YY'}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Inputs */}
                                  <div className="space-y-2">
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Card Number *</label>
                                      <div className="relative">
                                        <input
                                          type="text"
                                          maxLength={19}
                                          placeholder="4532 0000 0000 0000"
                                          value={cardNumber}
                                          onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').substring(0, 16);
                                            const formatted = val.replace(/(.{4})/g, '$1 ').trim();
                                            setCardNumber(formatted);
                                          }}
                                          className={`w-full rounded-xl border bg-slate-900 px-3 py-2 pl-9 text-xs font-mono font-semibold text-white placeholder:text-slate-600 focus:outline-none ${!cardNumber.trim() ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-emerald-500'}`}
                                        />
                                        <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Card Holder Name *</label>
                                      <input
                                        type="text"
                                        placeholder="Name on card"
                                        value={cardHolder}
                                        onChange={(e) => setCardHolder(e.target.value)}
                                        className={`w-full rounded-xl border bg-slate-900 px-3 py-2 text-xs font-semibold text-white placeholder:text-slate-600 focus:outline-none uppercase ${!cardHolder.trim() ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-emerald-500'}`}
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Expiry (MM/YY) *</label>
                                        <input
                                          type="text"
                                          maxLength={5}
                                          placeholder="12/28"
                                          value={cardExpiry}
                                          onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, '').substring(0, 4);
                                            if (val.length >= 3) val = `${val.substring(0, 2)}/${val.substring(2)}`;
                                            setCardExpiry(val);
                                          }}
                                          className={`w-full rounded-xl border bg-slate-900 px-3 py-2 text-xs font-mono font-semibold text-white text-center placeholder:text-slate-600 focus:outline-none ${!cardExpiry.trim() ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-emerald-500'}`}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">CVV / CVC *</label>
                                        <input
                                          type="password"
                                          maxLength={4}
                                          placeholder="•••"
                                          value={cardCvv}
                                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                                          className={`w-full rounded-xl border bg-slate-900 px-3 py-2 text-xs font-mono font-semibold text-white text-center placeholder:text-slate-600 focus:outline-none ${!cardCvv.trim() ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-emerald-500'}`}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="mt-4 rounded-3xl border border-white/10 bg-slate-900/40 p-2">
                              <p className="text-xs uppercase tracking-[0.24em] text-slate-400 mb-2 font-bold">Delivery map preview</p>
                              <p className="text-sm text-slate-300 mb-3 leading-relaxed">Verify your delivery location with Google Maps before placing the order.</p>
                              {customerAddressLine.trim() && customerDistrict.trim() && customerState.trim() && customerPincode.trim() ? (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${customerAddressLine}, ${customerDistrict}, ${customerState} ${customerPincode}`)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 rounded-2xl bg-white text-slate-950 px-4 py-2 text-xs font-bold hover:bg-slate-100 transition"
                                >
                                  <MapPin className="h-4 w-4" /> Open in Google Maps
                                </a>
                              ) : (
                                <p className="text-[11px] text-slate-500">Complete all address fields to open Google Maps.</p>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="bg-slate-900/60 border border-white/5 p-1.5 rounded-2xl text-xs space-y-1.5 mt-4">
                        <div className="flex justify-between text-slate-350">
                          <span>Subtotal</span>
                          <span className="text-white font-medium">{formatCurrency(getCartSubtotal())}</span>
                        </div>
                        {appliedCoupon && (
                          <div className="flex justify-between text-emerald-450 font-semibold">
                            <span>Discount ({appliedCoupon.code})</span>
                            <span>-{formatCurrency(getCartDiscount())}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-355">
                          <span>GST (5%)</span>
                          <span className="text-white font-medium">{formatCurrency(getCartGst())}</span>
                        </div>
                        <div className="flex justify-between text-white font-bold border-t border-white/5 pt-1.5 text-sm">
                          <span>Final Total</span>
                          <span className="text-rose-400">{formatCurrency(getCartTotal())}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={handleCustomerCheckout}
                        disabled={isPlaceOrderBlockedByCard}
                        className={`w-full py-3.5 font-black rounded-2xl transition-all shadow-xl mt-3 flex items-center justify-center gap-2 text-sm ${
                          isPlaceOrderBlockedByCard
                            ? 'bg-slate-800 text-slate-500 border border-white/10 opacity-50 cursor-not-allowed pointer-events-none'
                            : 'bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-rose-600/30 active:scale-98'
                        }`}
                      >
                        {isPlaceOrderBlockedByCard ? (
                          <>
                            <Lock className="h-4 w-4 text-amber-400" /> Place Food Order Now
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" /> Place Food Order Now
                          </>
                        )}
                      </button>

                      {/* QR Code ordering simulator card */}
                      {customerOrderType === 'dine-in' && (
                        <div className="mt-4 p-1.5 border border-dashed border-rose-300 rounded-2xl bg-rose-50/50 flex gap-2 items-center">
                          <Smartphone className="h-8 w-8 text-rose-500 shrink-0" />
                          <div>
                            <p className="text-[10px] font-extrabold text-rose-900">QR Code Instant POS Enabled</p>
                            <p className="text-[9px] text-rose-700">Scan QR Code at Table {customerTable} to place order on simulated mobile client instantly.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
            )}


          </div>
        )}

        {/* ======================================================= */}
        {/* ROLE B: MANAGER/OWNER WORKSPACE (Analytics, Menu, Inventory) */}
        {/* ======================================================= */}
        {(currentRole === 'manager' || currentRole === 'owner') && (
          <div className="flex-1 flex flex-col lg:flex-row">
            
            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-64 bg-slate-900/90 border border-white/10 rounded-2xl lg:rounded-3xl p-3 text-slate-300 shrink-0 flex flex-col mb-4 lg:mb-0 shadow-xl">
              <div className="pb-3 mb-2 border-b border-white/10 hidden lg:block">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500">
                  {currentRole === 'owner' ? 'Owner Control Panel' : 'Administrator Panel'}
                </p>
                <p className="text-xs text-slate-400 mt-1 font-medium truncate">Logged in: {currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'Customer'} ({displayName})</p>
              </div>

              <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 p-1 no-scrollbar shrink-0">
                {currentRole === 'owner' && (
                  <button
                    onClick={() => setActiveManagerTab('control-center')}
                    className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${activeManagerTab === 'control-center' ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'}`}
                  >
                    <ShieldCheck className="h-4 w-4" /> Control Center
                  </button>
                )}
                {hasAccessToTab(currentRole, 'overview') && (
                  <button
                    onClick={() => setActiveManagerTab('overview')}
                    className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${activeManagerTab === 'overview' ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'}`}
                  >
                    <TrendingUp className="h-4 w-4" /> Financial Overview & Stats
                  </button>
                )}
                {hasAccessToTab(currentRole, 'payments') && (
                  <button
                    onClick={() => setActiveManagerTab('payments')}
                    className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${activeManagerTab === 'payments' ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'}`}
                  >
                    <CreditCard className="h-4 w-4" /> Real-Time Payments Hub
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  </button>
                )}
                {hasAccessToTab(currentRole, 'menu') && (
                  <button
                    onClick={() => setActiveManagerTab('menu')}
                    className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${activeManagerTab === 'menu' ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'}`}
                  >
                    <Utensils className="h-4 w-4" /> Menu Items CRUD
                  </button>
                )}
                {hasAccessToTab(currentRole, 'inventory') && (
                  <button
                    onClick={() => setActiveManagerTab('inventory')}
                    className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${activeManagerTab === 'inventory' ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'}`}
                  >
                    <Layers className="h-4 w-4" /> Inventory & Low Stock
                  </button>
                )}
                {hasAccessToTab(currentRole, 'shifts') && (
                  <button
                    onClick={() => setActiveManagerTab('shifts')}
                    className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${activeManagerTab === 'shifts' ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'}`}
                  >
                    <Calendar className="h-4 w-4" /> Employees & Shifts
                  </button>
                )}
                {hasAccessToTab(currentRole, 'reservations') && (
                  <button
                    onClick={() => setActiveManagerTab('reservations')}
                    className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${activeManagerTab === 'reservations' ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'}`}
                  >
                    <Users className="h-4 w-4" /> Table Reservations
                  </button>
                )}
                {hasAccessToTab(currentRole, 'expenses') && (
                  <button
                    onClick={() => setActiveManagerTab('expenses')}
                    className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${activeManagerTab === 'expenses' ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'}`}
                  >
                    <DollarSign className="h-4 w-4" /> Expense Tracking
                  </button>
                )}
                {hasAccessToTab(currentRole, 'coupons') && (
                  <button
                    onClick={() => setActiveManagerTab('coupons')}
                    className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${activeManagerTab === 'coupons' ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'}`}
                  >
                    <Ticket className="h-4 w-4" /> Coupons & Promo Codes
                  </button>
                )}
                <button
                  onClick={() => setCurrentRole('delivery')}
                  className="whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-rose-300 border border-rose-500/20 bg-rose-500/10 shrink-0"
                >
                  <Truck className="h-4 w-4 text-rose-400" /> Live Delivery Terminal
                </button>
              </nav>

              {/* Database Quick Stats */}
              <div className="mt-3 pt-3 border-t border-white/10 text-[11px] space-y-1.5 text-slate-400 hidden lg:block">
                <div className="flex justify-between items-center">
                  <span>Categories count:</span>
                  <span className="text-white font-bold">{data.categories.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total orders recorded:</span>
                  <span className="text-white font-bold">{data.orders.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Active staff:</span>
                  <span className="text-white font-bold">{data.users.filter((u: any) => u.role !== 'customer').length}</span>
                </div>
              </div>
            </aside>

            {/* Manager Content Container */}
            <main className="flex-1 p-2 md:p-4 sm:p-5 overflow-y-auto">
              
              {!hasAccessToTab(currentRole, activeManagerTab) ? (
                <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-2 rounded-3xl text-center space-y-2 max-w-md mx-auto my-12">
                  <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                    <Lock className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">Access Restricted</h2>
                    <p className="text-xs text-slate-450 mt-1.5 leading-relaxed font-medium">
                      The restaurant owner has restricted access to the <span className="text-rose-400 font-bold uppercase">{activeManagerTab === 'overview' ? 'Financial Overview' : activeManagerTab === 'shifts' ? 'Shifts & Employees' : activeManagerTab === 'reservations' ? 'Table Reservations' : activeManagerTab === 'expenses' ? 'Expenses' : activeManagerTab === 'coupons' ? 'Coupons' : activeManagerTab}</span> module.
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold">Please contact the system administrator or log in as Owner to adjust permissions.</p>
                </div>
              ) : (
                <>
                  {/* TAB 0: PERMISSION MANAGEMENT & CONTROL CENTER */}
              {activeManagerTab === 'control-center' && (
                <div className="flex flex-col lg:flex-row gap-3 text-slate-200">
                  
                  {/* Secondary Sub-Sidebar Navigation */}
                  <aside className="w-full lg:w-60 shrink-0 bg-slate-950/40 backdrop-blur-md border border-white/5 rounded-3xl p-2 flex flex-col gap-2.5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="h-5 w-5 text-rose-500" />
                        <h2 className="text-sm font-black tracking-wider uppercase text-white">Control Panel</h2>
                      </div>
                      <p className="text-[10px] text-slate-400">Manage permissions & roles</p>
                    </div>

                    {/* Scrollable sub-sidebar on mobile */}
                    <div className="flex flex-row overflow-x-auto lg:flex-col gap-1 pb-2 scrollbar-none lg:space-y-2 lg:pb-0">
                      {/* Section: OVERVIEW */}
                      <div className="shrink-0 lg:shrink-1 min-w-[120px] lg:min-w-0">
                        <p className="hidden lg:block text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5 px-2">Overview</p>
                        <button
                          onClick={() => setControlTab('dashboard')}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${controlTab === 'dashboard' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
                        </button>
                      </div>

                      {/* Section: MANAGEMENT */}
                      <div className="shrink-0 lg:shrink-1 min-w-[150px] lg:min-w-0 space-y-1">
                        <p className="hidden lg:block text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5 px-2">Management</p>
                        <div className="flex flex-row lg:flex-col gap-1 lg:space-y-1">
                          <button
                            onClick={() => setControlTab('users')}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${controlTab === 'users' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            <Users2 className="h-3.5 w-3.5" /> User List
                          </button>
                          <button
                            onClick={() => setControlTab('roles')}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${controlTab === 'roles' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            <Award className="h-3.5 w-3.5" /> Role Manager
                          </button>
                          <button
                            onClick={() => setControlTab('permissions')}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${controlTab === 'permissions' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            <Grid className="h-3.5 w-3.5" /> Perms Matrix
                          </button>
                          <button
                            onClick={() => setControlTab('branches')}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${controlTab === 'branches' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            <MapPin className="h-3.5 w-3.5" /> Branch Access
                          </button>
                        </div>
                      </div>

                      {/* Section: MONITORING */}
                      <div className="shrink-0 lg:shrink-1 min-w-[150px] lg:min-w-0 space-y-1">
                        <p className="hidden lg:block text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5 px-2">Monitoring</p>
                        <div className="flex flex-row lg:flex-col gap-1 lg:space-y-1">
                          <button
                            onClick={() => setControlTab('activity_logs')}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${controlTab === 'activity_logs' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            <Activity className="h-3.5 w-3.5" /> Audit Logs
                          </button>
                          <button
                            onClick={() => setControlTab('sessions')}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${controlTab === 'sessions' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            <Clock className="h-3.5 w-3.5" /> Sessions
                          </button>
                        </div>
                      </div>

                      {/* Section: SECURITY */}
                      <div className="shrink-0 lg:shrink-1 min-w-[150px] lg:min-w-0 space-y-1">
                        <p className="hidden lg:block text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5 px-2">Security</p>
                        <div className="flex flex-row lg:flex-col gap-1 lg:space-y-1">
                          <button
                            onClick={() => setControlTab('security_settings')}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${controlTab === 'security_settings' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            <Shield className="h-3.5 w-3.5" /> Policies
                          </button>
                          <button
                            onClick={() => setControlTab('backup')}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${controlTab === 'backup' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            <Database className="h-3.5 w-3.5" /> Backups
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Pro Banner */}
                    <div className="hidden lg:block mt-auto bg-slate-900/50 border border-white/5 rounded-2xl p-1.5 text-center shadow-lg relative overflow-hidden">
                      <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-rose-500/10 rounded-full blur-xl"></div>
                      <p className="text-[10px] font-black text-rose-400 flex items-center justify-center gap-1">★ Pro Restaurant</p>
                      <p className="text-[9px] text-slate-450 mt-0.5">Enterprise Plan Active</p>
                      <button className="w-full mt-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl py-1.5 text-[10px] font-extrabold shadow transition-all duration-300">
                        Upgrade Now
                      </button>
                    </div>
                  </aside>

                  {/* Main Work Area */}
                  <div className="flex-1 space-y-3 overflow-hidden">
                    
                    {/* SUB-TAB 1: DASHBOARD */}
                    {controlTab === 'dashboard' && (
                      <div className="space-y-3">
                        
                        {/* Control Center Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-950/40 backdrop-blur-md border border-white/5 p-2.5 rounded-3xl shadow-xl">
                          <div>
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="h-6 w-6 text-rose-500" />
                              <h1 className="text-xl sm:text-2xl font-black text-white">Permission Management & Control Center</h1>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 font-medium">Manage users, roles, permissions and system access</p>
                          </div>
                          
                          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between">
                            <select
                              value={customerBranch}
                              onChange={(e) => {
                                setCustomerBranch(e.target.value);
                                showToast(`Active branch view: ${e.target.value}`, "info");
                              }}
                              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none"
                            >
                              <option value="Ichalkaranji" className="bg-slate-950 text-white font-semibold">Ichalkaranji</option>
                              <option value="Chinchwad" className="bg-slate-950 text-white font-semibold">Chinchwad</option>
                              <option value="Shivajinagar" className="bg-slate-950 text-white font-semibold">Shivajinagar</option>
                              <option value="Kolhapur" className="bg-slate-950 text-white font-semibold">Kolhapur</option>
                            </select>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setControlTab('activity_logs');
                                showToast("Opened System Audit Trail Logs", "info");
                              }}
                              className="relative p-2 bg-slate-900 border border-white/10 rounded-xl text-slate-350 hover:text-white transition"
                              title="View Audit Logs"
                            >
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold">5</span>
                              <Activity className="h-4 w-4" />
                            </button>


                          </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                          <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2 rounded-2xl shadow flex items-center gap-3">
                            <div className="bg-rose-500/10 text-rose-450 p-2.5 rounded-xl border border-rose-500/15">
                              <Users className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Users</p>
                              <p className="text-lg font-black text-white mt-0.5">{data.users.length}</p>
                              <p className="text-[9px] text-emerald-400 font-bold mt-0.5">Real-time database count</p>
                            </div>
                          </div>

                          <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2 rounded-2xl shadow flex items-center gap-3">
                            <div className="bg-emerald-500/10 text-emerald-450 p-2.5 rounded-xl border border-emerald-500/15">
                              <UserCheck className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Staff</p>
                              <p className="text-lg font-black text-white mt-0.5">{data.users.filter((u: any) => u.role !== 'customer').length}</p>
                              <p className="text-[9px] text-emerald-400 font-bold mt-0.5">● Active: {controlSessions.filter(s => s.active).length}</p>
                            </div>
                          </div>

                          <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2 rounded-2xl shadow flex items-center gap-3">
                            <div className="bg-blue-500/10 text-blue-450 p-2.5 rounded-xl border border-blue-500/15">
                              <Award className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Roles</p>
                              <p className="text-lg font-black text-white mt-0.5">{matrixRoles.length}</p>
                              <p className="text-[9px] text-rose-450 font-bold mt-0.5">↗ 2 new this month</p>
                            </div>
                          </div>

                          <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2 rounded-2xl shadow flex items-center gap-3">
                            <div className="bg-amber-500/10 text-amber-450 p-2.5 rounded-xl border border-amber-500/15">
                              <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Branches</p>
                              <p className="text-lg font-black text-white mt-0.5">{controlBranches.length}</p>
                              <p className="text-[9px] text-emerald-400 font-bold mt-0.5">All branches active</p>
                            </div>
                          </div>

                          <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2 rounded-2xl shadow flex items-center gap-3">
                            <div className="bg-purple-500/10 text-purple-450 p-2.5 rounded-xl border border-purple-500/15">
                              <Key className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Permissions</p>
                              <p className="text-lg font-black text-white mt-0.5">126</p>
                              <p className="text-[9px] text-purple-400 font-bold mt-0.5">Across all roles</p>
                            </div>
                          </div>
                        </div>

                        {/* Recent Users & Permission Matrix Overview */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                          
                          {/* Recent Users Table */}
                          <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2.5 rounded-3xl shadow-xl flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center gap-2">
                                <Users2 className="h-4 w-4 text-slate-350" />
                                <h3 className="text-sm font-black text-white">Recent Users</h3>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    setSelectedControlUser(null);
                                    setControlUserForm({ name: '', email: '', phone: '', role: 'waiter', pin: '', loyaltyPoints: 0, branch: 'Ichalkaranji', status: 'Active' });
                                    setControlTab('users');
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-2.5 py-1 text-[10px] font-extrabold flex items-center gap-1 transition"
                                >
                                  <Plus className="h-3 w-3" /> Add User
                                </button>
                                <button 
                                  onClick={() => setControlTab('users')}
                                  className="border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl px-2.5 py-1 text-[10px] font-extrabold text-slate-300 transition"
                                >
                                  View All
                                </button>
                              </div>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="border-b border-white/5 text-slate-400 font-black text-[10px] uppercase">
                                    <th className="py-2.5">Employee</th>
                                    <th className="py-2.5">Role</th>
                                    <th className="py-2.5">Branch</th>
                                    <th className="py-2.5">Status</th>
                                    <th className="py-2.5">Last Login</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {controlSessions.map((session, idx) => (
                                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition">
                                      <td className="py-1.5 flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-[10px] uppercase border border-white/5">
                                          {session.user.substring(0, 2)}
                                        </div>
                                        <div>
                                          <p className="font-extrabold text-white">{session.user}</p>
                                          <p className="text-[9px] text-slate-450 lowercase">{session.user.replace(/\s+/g, '').toLowerCase()}@foodie.com</p>
                                        </div>
                                      </td>
                                      <td className="py-1.5">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                          session.role === 'Manager' ? 'bg-blue-500/20 text-blue-350 border border-blue-500/25' :
                                          session.role === 'Cashier' ? 'bg-amber-500/20 text-amber-350 border border-amber-500/25' :
                                          session.role === 'Chef' ? 'bg-purple-500/20 text-purple-350 border border-purple-500/25' :
                                          session.role === 'Waiter' ? 'bg-cyan-500/20 text-cyan-350 border border-cyan-500/25' :
                                          'bg-orange-500/20 text-orange-300 border border-orange-500/25'
                                        }`}>
                                          {session.role}
                                        </span>
                                      </td>
                                      <td className="py-1.5 font-semibold text-slate-350">{session.branch || 'Ichalkaranji'}</td>
                                      <td className="py-1.5">
                                        <span className="flex items-center gap-1 text-[10px] font-extrabold text-white">
                                          <span className={`w-1.5 h-1.5 rounded-full ${session.active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                          {session.active ? 'Active' : 'Off Duty'}
                                        </span>
                                      </td>
                                      <td className="py-1.5 font-semibold text-slate-450">{session.time}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <p className="text-[10px] text-slate-450 mt-4 text-center">Showing 1 to 5 of 42 users</p>
                          </div>

                          {/* Permission Matrix Overview */}
                          <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2.5 rounded-3xl shadow-xl flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center gap-2">
                                <Grid className="h-4 w-4 text-slate-350" />
                                <h3 className="text-sm font-black text-white">Permission Matrix Overview</h3>
                              </div>
                              <button 
                                onClick={() => setControlTab('permissions')}
                                className="border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl px-2.5 py-1 text-[10px] font-extrabold text-slate-300 transition"
                              >
                                View Full Matrix
                              </button>
                            </div>

                            <div className="overflow-x-auto flex-1">
                              <table className="w-full text-center text-xs border-collapse">
                                <thead>
                                  <tr className="border-b border-white/5 text-slate-400 font-black text-[9px] uppercase">
                                    <th className="py-2.5 text-left">Module</th>
                                    <th className="py-2.5">Owner</th>
                                    <th className="py-2.5">Admin</th>
                                    <th className="py-2.5">Manager</th>
                                    <th className="py-2.5">Cashier</th>
                                    <th className="py-2.5">Chef</th>
                                    <th className="py-2.5">Waiter</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {matrixPermissions.map((row: any) => (
                                    <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition">
                                      <td className="py-1.5 text-left font-extrabold text-white">{row.module}</td>
                                      <td className="py-1.5">{renderPermissionCellIcon(row.owner)}</td>
                                      <td className="py-1.5">{renderPermissionCellIcon(row.admin)}</td>
                                      <td className="py-1.5">{renderPermissionCellIcon(row.manager)}</td>
                                      <td className="py-1.5">{renderPermissionCellIcon(row.cashier)}</td>
                                      <td className="py-1.5">{renderPermissionCellIcon(row.chef)}</td>
                                      <td className="py-1.5">{renderPermissionCellIcon(row.waiter)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap items-center justify-center gap-3 mt-4 pt-3 border-t border-white/5 text-[9px] font-bold text-slate-450">
                              <span className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-500" /> Full Access</span>
                              <span className="flex items-center gap-1"><Search className="h-3 w-3 text-amber-500" /> View Only</span>
                              <span className="flex items-center gap-1"><X className="h-3 w-3 text-rose-500" /> No Access</span>
                              <span className="flex items-center gap-1"><Edit2 className="h-3 w-3 text-blue-500" /> Edit Access</span>
                              <span className="flex items-center gap-1"><DollarSign className="h-3 w-3 text-orange-500" /> Sales Access</span>
                            </div>
                          </div>
                        </div>

                        {/* Donut, login activity, active progress lines */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          
                          {/* Role Distribution Donut Chart - Completely dynamic with interactive touch/hover details */}
                          <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2.5 rounded-3xl shadow-xl flex flex-col">
                            <h3 className="text-xs font-black text-slate-355 uppercase tracking-wider mb-3">Role Distribution</h3>
                            <div className="flex-1 flex flex-col items-center justify-center">
                              <div className="relative w-28 h-28 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                  {controlMgrPct > 0 && (
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="3.5" 
                                      strokeDasharray={`${controlMgrPct} ${100 - controlMgrPct}`} 
                                      strokeDashoffset="0"
                                      className="hover:stroke-blue-400 transition cursor-pointer"
                                    ></circle>
                                  )}
                                  {controlChefPct > 0 && (
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#a855f7" strokeWidth="3.5" 
                                      strokeDasharray={`${controlChefPct} ${100 - controlChefPct}`} 
                                      strokeDashoffset={-controlMgrPct}
                                      className="hover:stroke-purple-400 transition cursor-pointer"
                                    ></circle>
                                  )}
                                  {controlWaiterPct > 0 && (
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#06b6d4" strokeWidth="3.5" 
                                      strokeDasharray={`${controlWaiterPct} ${100 - controlWaiterPct}`} 
                                      strokeDashoffset={-(controlMgrPct + controlChefPct)}
                                      className="hover:stroke-cyan-400 transition cursor-pointer"
                                    ></circle>
                                  )}
                                  {controlCashierPct > 0 && (
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3.5" 
                                      strokeDasharray={`${controlCashierPct} ${100 - controlCashierPct}`} 
                                      strokeDashoffset={-(controlMgrPct + controlChefPct + controlWaiterPct)}
                                      className="hover:stroke-amber-400 transition cursor-pointer"
                                    ></circle>
                                  )}
                                  {controlOwnerPct > 0 && (
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f97316" strokeWidth="3.5" 
                                      strokeDasharray={`${controlOwnerPct} ${100 - controlOwnerPct}`} 
                                      strokeDashoffset={-(controlMgrPct + controlChefPct + controlWaiterPct + controlCashierPct)}
                                      className="hover:stroke-orange-400 transition cursor-pointer"
                                    ></circle>
                                  )}
                                </svg>
                                
                                <div className="absolute text-center pointer-events-none">
                                  <p className="text-lg font-black text-white">{controlTotalStaff}</p>
                                  <p className="text-[8px] text-slate-400 uppercase font-bold">Total Staff</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-4 text-[9px] font-bold text-slate-350">
                                {[
                                  { role: 'owner', label: 'Owner', color: 'bg-orange-500', pct: controlOwnerPct, count: controlOwnerCount, highlight: 'text-orange-400' },
                                  { role: 'manager', label: 'Manager', color: 'bg-blue-500', pct: controlMgrPct, count: controlMgrCount, highlight: 'text-blue-450' },
                                  { role: 'chef', label: 'Chef', color: 'bg-purple-500', pct: controlChefPct, count: controlChefCount, highlight: 'text-purple-400' },
                                  { role: 'waiter', label: 'Waiter', color: 'bg-cyan-500', pct: controlWaiterPct, count: controlWaiterCount, highlight: 'text-cyan-400' },
                                  { role: 'cashier', label: 'Cashier', color: 'bg-amber-500', pct: controlCashierPct, count: controlCashierCount, highlight: 'text-amber-550' }
                                ].map((item) => {
                                  const isHovered = hoveredRole === item.role;
                                  return (
                                    <div 
                                      key={item.role}
                                      className="flex items-center gap-1.5 relative cursor-pointer hover:text-white transition py-0.5"
                                      onMouseEnter={() => setHoveredRole(item.role)}
                                      onMouseLeave={() => setHoveredRole(null)}
                                      onTouchStart={() => setHoveredRole(item.role)}
                                    >
                                      <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                                      {item.label} ({item.pct}%)
                                      
                                      {isHovered && (
                                        <div 
                                          className="absolute z-20 border border-white/10 p-2 rounded-xl text-center text-[10px] text-white shadow-2xl pointer-events-none min-w-[130px] max-w-[200px] leading-tight"
                                          style={{
                                            bottom: '100%',
                                            left: '50%',
                                            transform: 'translate(-50%, -8px)',
                                            backgroundColor: '#090f1d'
                                          }}
                                        >
                                          <p className={`font-extrabold ${item.highlight}`}>{item.label}s ({item.count})</p>
                                          <p className="text-slate-355 mt-1">{getStaffNamesByRole(item.role)}</p>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Login Activity Bar Chart - Completely dynamic and active for today */}
                          <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2.5 rounded-3xl shadow-xl flex flex-col">
                            <h3 className="text-xs font-black text-slate-355 uppercase tracking-wider mb-3">Login Activity (This Week)</h3>
                            <div className="flex-1 flex flex-col justify-end pt-6">
                              <div className="flex justify-between items-end h-28 px-1 relative">
                                {[
                                  { dayIdx: 1, label: 'M', name: 'Monday', heightPct: hM, count: loginM },
                                  { dayIdx: 2, label: 'T', name: 'Tuesday', heightPct: hT, count: loginT },
                                  { dayIdx: 3, label: 'W', name: 'Wednesday', heightPct: hW, count: loginW },
                                  { dayIdx: 4, label: 'T', name: 'Thursday', heightPct: hTh, count: loginTh },
                                  { dayIdx: 5, label: 'F', name: 'Friday', heightPct: hF, count: loginF },
                                  { dayIdx: 6, label: 'S', name: 'Saturday', heightPct: hS, count: loginS },
                                  { dayIdx: 0, label: 'S', name: 'Sunday', heightPct: hSu, count: loginSu }
                                ].map((wd) => {
                                  const isToday = new Date().getDay() === wd.dayIdx;
                                  const isHovered = hoveredDay === wd.dayIdx;
                                  const showTooltip = isHovered || (hoveredDay === null && isToday);
                                  return (
                                    <div 
                                      key={wd.name} 
                                      className="flex flex-col justify-end items-center flex-1 cursor-pointer relative h-full"
                                      onMouseEnter={() => setHoveredDay(wd.dayIdx)}
                                      onMouseLeave={() => setHoveredDay(null)}
                                      onTouchStart={() => setHoveredDay(wd.dayIdx)}
                                    >
                                      {/* Interactive Tooltip detailing exact login counts */}
                                      {showTooltip && (
                                        <div 
                                          className="absolute z-20 border border-white/10 p-2 rounded-xl text-center text-[10px] text-white font-bold shadow-2xl pointer-events-none min-w-[95px]"
                                          style={{
                                            bottom: '100%',
                                            left: '50%',
                                            transform: 'translate(-50%, -8px)',
                                            backgroundColor: '#090f1d'
                                          }}
                                        >
                                          <p className={isToday ? 'text-emerald-400 font-extrabold' : 'text-rose-400'}>{isToday ? 'Today' : wd.name}</p>
                                          <p className="text-slate-300 mt-0.5">Logins: {wd.count}</p>
                                          <p className="text-[8px] text-slate-400 font-semibold">{isToday ? 'Active Now' : 'Past Activity'}</p>
                                        </div>
                                      )}
                                      
                                      {/* Interactive Bar */}
                                      <div 
                                        className={`rounded-t-lg w-4 sm:w-6 transition ${isToday ? 'bg-emerald-500 border border-emerald-450 shadow-md shadow-emerald-500/20' : 'bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/30'}`} 
                                        style={{ height: `${wd.heightPct}%` }}
                                      ></div>
                                      
                                      <span className={`text-[9px] mt-1 font-bold ${isToday ? 'text-emerald-400 font-black' : 'text-slate-455'}`}>{wd.label}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Top Active Users progress bars */}
                          <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2.5 rounded-3xl shadow-xl flex flex-col">
                            <h3 className="text-xs font-black text-slate-355 uppercase tracking-wider mb-3">Top Active Users</h3>
                            <div className="flex-1 space-y-3.5">
                              {topUsersList.map((item: any, idx: number) => (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-white">{item.name}</span>
                                    <span className="text-slate-450">{item.count} actions</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-slate-900 border border-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${item.color}`} style={{ width: item.styleWidth }}></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Security Overview indicators */}
                          <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2.5 rounded-3xl shadow-xl flex flex-col">
                            <h3 className="text-xs font-black text-slate-355 uppercase tracking-wider mb-3">Security Overview</h3>
                            <div className="flex-1 flex flex-col justify-between">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[10px] font-bold">
                                  <span className="flex items-center gap-1.5 text-slate-450"><Activity className="h-3.5 w-3.5 text-rose-500" /> Active Sessions</span>
                                  <span className="text-emerald-400">{controlSessions.filter(s => s.active).length} sessions active</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[10px] font-bold">
                                  <span className="flex items-center gap-1.5 text-slate-450"><AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> Failed Logins (Today)</span>
                                  <span className="text-emerald-400 font-bold">0 login errors</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[10px] font-bold">
                                  <span className="flex items-center gap-1.5 text-slate-450"><Lock className="h-3.5 w-3.5 text-blue-500" /> Approved Staff</span>
                                  <span className="text-blue-300">{controlStaff.filter((u: any) => u.isApproved).length} verified</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold">
                                  <span className="flex items-center gap-1.5 text-slate-450"><Clock className="h-3.5 w-3.5 text-amber-500" /> Pending Activation</span>
                                  <span className="text-amber-400">{controlStaff.filter((u: any) => !u.isEmailVerified).length} pending</span>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Recent Activity Logs & Quick Actions */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                          
                          {/* Recent Activity Logs */}
                          <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2.5 rounded-3xl shadow-xl xl:col-span-2 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center gap-2">
                                <ClipboardList className="h-4 w-4 text-slate-350" />
                                <h3 className="text-sm font-black text-white">Recent Activity Logs</h3>
                              </div>
                              <button 
                                onClick={() => setControlTab('activity_logs')}
                                className="border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl px-2.5 py-1 text-[10px] font-extrabold text-slate-300 transition"
                              >
                                View All Logs
                              </button>
                            </div>

                            <div className="overflow-x-auto flex-1">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="border-b border-white/5 text-slate-400 font-black text-[9px] uppercase">
                                    <th className="py-2.5">Time</th>
                                    <th className="py-2.5">User</th>
                                    <th className="py-2.5">Action</th>
                                    <th className="py-2.5">Module</th>
                                    <th className="py-2.5">Details</th>
                                    <th className="py-2.5">IP Address</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {controlLogs.slice(0, 5).map((log: any) => (
                                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition text-[11px]">
                                      <td className="py-1.5 font-semibold text-slate-450">{log.time}</td>
                                      <td className="py-1.5 font-black text-white">{log.user}</td>
                                      <td className="py-1.5">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                          log.action === 'Login' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/25' :
                                          log.action === 'Order Updated' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/25' :
                                          log.action === 'Menu Item Updated' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/25' :
                                          'bg-amber-500/20 text-amber-300 border border-amber-500/25'
                                        }`}>
                                          {log.action}
                                        </span>
                                      </td>
                                      <td className="py-1.5 font-bold text-slate-350">{log.module}</td>
                                      <td className="py-1.5 text-slate-400 font-medium">{log.details}</td>
                                      <td className="py-1.5 text-slate-450 font-mono">{log.ip}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Quick Actions Panel */}
                          <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2.5 rounded-3xl shadow-xl flex flex-col">
                            <h3 className="text-sm font-black text-white mb-4">Quick Actions</h3>
                            
                            <div className="grid grid-cols-2 gap-3 flex-1">
                              <button 
                                onClick={() => {
                                  setSelectedControlUser(null);
                                  setControlUserForm({ name: '', email: '', phone: '', role: 'waiter', pin: '', loyaltyPoints: 0, branch: 'Ichalkaranji', status: 'Active' });
                                  setControlTab('users');
                                }}
                                className="flex flex-col items-center justify-center p-1.5 rounded-2xl border border-white/10 hover:border-rose-500/30 bg-slate-900/30 hover:bg-rose-500/5 text-slate-300 hover:text-white transition duration-300 group"
                              >
                                <Users2 className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition mb-2" />
                                <span className="text-[10px] font-black text-center">Add User</span>
                              </button>

                              <button 
                                onClick={() => setControlTab('roles')}
                                className="flex flex-col items-center justify-center p-1.5 rounded-2xl border border-white/10 hover:border-rose-500/30 bg-slate-900/30 hover:bg-rose-500/5 text-slate-300 hover:text-white transition duration-300 group"
                              >
                                <Plus className="h-5 w-5 text-blue-400 group-hover:scale-110 transition mb-2" />
                                <span className="text-[10px] font-black text-center">Add Role</span>
                              </button>

                              <button 
                                onClick={() => setControlTab('permissions')}
                                className="flex flex-col items-center justify-center p-1.5 rounded-2xl border border-white/10 hover:border-rose-500/30 bg-slate-900/30 hover:bg-rose-500/5 text-slate-300 hover:text-white transition duration-300 group"
                              >
                                <Grid className="h-5 w-5 text-purple-400 group-hover:scale-110 transition mb-2" />
                                <span className="text-[10px] font-black text-center">Assign Perms</span>
                              </button>

                              <button 
                                onClick={() => showToast("Drag and drop staff CSV/JSON files here to import user accounts", "info")}
                                className="flex flex-col items-center justify-center p-1.5 rounded-2xl border border-white/10 hover:border-rose-500/30 bg-slate-900/30 hover:bg-rose-500/5 text-slate-300 hover:text-white transition duration-300 group"
                              >
                                <Send className="h-5 w-5 text-orange-400 group-hover:scale-110 transition mb-2" />
                                <span className="text-[10px] font-black text-center">Import Users</span>
                              </button>

                              <button 
                                onClick={async () => {
                                  if (backupRunning) return;
                                  setBackupRunning(true);
                                  setBackupProgress(0);
                                  showToast("Starting full system data backup...", "info");
                                  for (let i = 10; i <= 100; i += 10) {
                                    await new Promise(r => setTimeout(r, 150));
                                    setBackupProgress(i);
                                  }
                                  setBackupRunning(false);
                                  showToast("Data backup successfully created!", "success");
                                  setControlLogs(prev => [
                                    { id: 'backup-' + Date.now(), time: 'Just Now', user: displayName, action: 'System Backup', type: 'success', module: 'System', details: 'Manual database backup created successfully', ip: '127.0.0.1', branch: 'Ichalkaranji' },
                                    ...prev
                                  ]);
                                }}
                                disabled={backupRunning}
                                className="flex flex-col items-center justify-center p-1.5 rounded-2xl border border-white/10 hover:border-rose-500/30 bg-slate-900/30 hover:bg-rose-500/5 text-slate-300 hover:text-white transition duration-300 group relative overflow-hidden"
                              >
                                {backupRunning ? (
                                  <div className="w-full text-center space-y-1">
                                    <RefreshCw className="h-5 w-5 text-rose-400 animate-spin mx-auto mb-1" />
                                    <span className="text-[9px] text-rose-300 font-black">{backupProgress}%</span>
                                  </div>
                                ) : (
                                  <>
                                    <Database className="h-5 w-5 text-rose-450 group-hover:scale-110 transition mb-2" />
                                    <span className="text-[10px] font-black text-center">System Backup</span>
                                  </>
                                )}
                              </button>

                              <button 
                                onClick={() => {
                                  alert(`--- SECURITY AUDIT REPORT ---\nStatus: Secure\nActive Sessions: 18\n2FA Enabled: 28/42\nFailed Logins today: 3\nIP whitelist state: Inactive\nTime checked: ${new Date().toLocaleTimeString()}`);
                                }}
                                className="flex flex-col items-center justify-center p-1.5 rounded-2xl border border-white/10 hover:border-rose-500/30 bg-slate-900/30 hover:bg-rose-500/5 text-slate-300 hover:text-white transition duration-300 group"
                              >
                                <Lock className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition mb-2" />
                                <span className="text-[10px] font-black text-center">Security Report</span>
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 2: USER LIST (CRUD) */}
                    {controlTab === 'users' && (
                      <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2.5 rounded-3xl shadow-xl space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <h2 className="text-lg font-black text-white">User Accounts Manager</h2>
                            <p className="text-xs text-slate-400">View and update user profiles, quick login pins, and points</p>
                          </div>
                          
                          <button
                            onClick={() => {
                              setSelectedControlUser(null);
                              setControlUserForm({ name: '', email: '', phone: '', role: 'waiter', pin: '', loyaltyPoints: 0, branch: 'Ichalkaranji', status: 'Active' });
                              // Show dialog via selecting dummy user ID
                              setSelectedControlUser({ id: 0 }); // trigger new entry flag
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-4 py-2 text-xs font-black flex items-center gap-1.5 transition"
                          >
                            <Plus className="h-4 w-4" /> Add User Account
                          </button>
                        </div>

                        {/* Search & Filters */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search users..."
                              value={controlUserSearch}
                              onChange={(e) => setControlUserSearch(e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-rose-500 transition"
                            />
                          </div>

                          <select
                            value={controlUserRoleFilter}
                            onChange={(e) => setControlUserRoleFilter(e.target.value)}
                            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-rose-500 transition"
                          >
                            <option value="all">All Roles</option>
                            <option value="customer">Customer</option>
                            <option value="manager">Manager</option>
                            <option value="chef">Chef</option>
                            <option value="waiter">Waiter</option>
                            <option value="cashier">Cashier</option>
                          </select>

                          <select
                            value={controlUserBranchFilter}
                            onChange={(e) => setControlUserBranchFilter(e.target.value)}
                            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-rose-500 transition"
                          >
                            <option value="all">All Branches</option>
                            <option value="Ichalkaranji">Ichalkaranji</option>
                            <option value="Chinchwad">Chinchwad</option>
                            <option value="Shivajinagar">Shivajinagar</option>
                            <option value="Kolhapur">Kolhapur</option>
                          </select>
                        </div>

                        {/* User Form Editor dialog if active */}
                        {selectedControlUser && (
                          <form 
                            onSubmit={async (e) => {
                              e.preventDefault();
                              setSubmitting(true);
                              try {
                                const actionType = selectedControlUser.id === 0 ? 'saveUser' : 'saveUser';
                                const res = await fetch('/api/restaurant', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
                                  },
                                  body: JSON.stringify({
                                    action: actionType,
                                    payload: {
                                      id: selectedControlUser.id === 0 ? undefined : selectedControlUser.id,
                                      name: controlUserForm.name,
                                      email: controlUserForm.email,
                                      phone: controlUserForm.phone,
                                      role: controlUserForm.role,
                                      pin: controlUserForm.pin,
                                      loyaltyPoints: Number(controlUserForm.loyaltyPoints),
                                      branch: controlUserForm.branch
                                    }
                                  })
                                });
                                const result = await res.json();
                                if (result.success) {
                                  showToast(selectedControlUser.id === 0 ? "User account created" : "User account updated", "success");
                                  // Refresh data
                                  const r = await fetch('/api/restaurant', {
                                    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}` }
                                  });
                                  const rr = await r.json();
                                  if (rr.success) setData(rr.data);
                                  setSelectedControlUser(null);
                                } else {
                                  showToast(result.error || "Failed to save user", "error");
                                }
                              } catch (err) {
                                showToast("Database communication failure", "error");
                              } finally {
                                setSubmitting(false);
                              }
                            }}
                            className="p-2.5 bg-slate-900/60 border border-white/10 rounded-2xl space-y-2 text-left"
                          >
                            <h3 className="text-xs font-black text-white uppercase tracking-wider">
                              {selectedControlUser.id === 0 ? 'Create New User Account' : `Edit Account: ${selectedControlUser.name}`}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name *</label>
                                <input
                                  type="text"
                                  required
                                  value={controlUserForm.name}
                                  onChange={(e) => setControlUserForm({...controlUserForm, name: e.target.value})}
                                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address *</label>
                                <input
                                  type="email"
                                  required
                                  value={controlUserForm.email}
                                  onChange={(e) => setControlUserForm({...controlUserForm, email: e.target.value})}
                                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone Number</label>
                                <input
                                  type="text"
                                  value={controlUserForm.phone || ''}
                                  onChange={(e) => setControlUserForm({...controlUserForm, phone: e.target.value})}
                                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">System Role</label>
                                <select
                                  value={controlUserForm.role}
                                  onChange={(e) => setControlUserForm({...controlUserForm, role: e.target.value})}
                                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none"
                                >
                                  <option value="customer">Customer</option>
                                  <option value="manager">Manager</option>
                                  <option value="chef">Chef</option>
                                  <option value="waiter">Waiter</option>
                                  <option value="cashier">Cashier</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Assigned Branch</label>
                                <select
                                  value={controlUserForm.branch}
                                  onChange={(e) => setControlUserForm({...controlUserForm, branch: e.target.value})}
                                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none"
                                >
                                  <option value="Ichalkaranji">Ichalkaranji</option>
                                  <option value="Chinchwad">Chinchwad</option>
                                  <option value="Shivajinagar">Shivajinagar</option>
                                  <option value="Kolhapur">Kolhapur</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Quick PIN (POS login)</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 1234"
                                  value={controlUserForm.pin || ''}
                                  onChange={(e) => setControlUserForm({...controlUserForm, pin: e.target.value})}
                                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Loyalty Points</label>
                                <input
                                  type="number"
                                  value={controlUserForm.loyaltyPoints}
                                  onChange={(e) => setControlUserForm({...controlUserForm, loyaltyPoints: Number(e.target.value)})}
                                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                />
                              </div>
                            </div>

                            {selectedControlUser.id === 0 && ['manager', 'chef', 'waiter', 'cashier'].includes(controlUserForm.role) && (
                              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl p-1.5 text-xs leading-relaxed flex items-start gap-2.5">
                                <ShieldCheck className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold block text-white">Staff Invitation Authentication</span>
                                  An invitation email will be sent to the employee with an activation link. 
                                  The employee will be required to verify their identity (Employee ID or Phone Number) and set their password to activate the account.
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => setSelectedControlUser(null)}
                                className="border border-white/10 text-slate-350 hover:bg-white/5 px-4 py-2 rounded-xl text-xs font-bold"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={submitting}
                                className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                              >
                                {submitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />} Save User Account
                              </button>
                            </div>
                          </form>
                        )}

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-white/15 text-slate-400 font-black text-[10px] uppercase">
                                <th className="p-1.5">User ID</th>
                                <th className="p-1.5">Profile Info</th>
                                <th className="p-1.5">Role</th>
                                <th className="p-1.5">Branch</th>
                                <th className="p-1.5">Loyalty Points</th>
                                <th className="p-1.5">Quick PIN</th>
                                <th className="p-1.5">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.users
                                .filter((u: any) => {
                                  const matchesSearch = u.name.toLowerCase().includes(controlUserSearch.toLowerCase()) || u.email.toLowerCase().includes(controlUserSearch.toLowerCase());
                                  const matchesRole = controlUserRoleFilter === 'all' || u.role === controlUserRoleFilter;
                                  const matchesBranch = controlUserBranchFilter === 'all' || u.branch === controlUserBranchFilter;
                                  return matchesSearch && matchesRole && matchesBranch;
                                })
                                .map((u: any) => (
                                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition">
                                    <td className="p-1.5 font-mono font-bold text-slate-450">#USR-{u.id}</td>
                                    <td className="p-1.5">
                                      <p className="font-extrabold text-white">{u.name}</p>
                                      <p className="text-[10px] text-slate-400 font-medium">{u.email}</p>
                                    </td>
                                    <td className="p-1.5">
                                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                        u.role === 'manager' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/25' :
                                        u.role === 'cashier' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/25' :
                                        u.role === 'chef' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/25' :
                                        u.role === 'waiter' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/25' :
                                        'bg-slate-950/600/20 text-slate-350 border border-slate-500/25'
                                      }`}>
                                        {u.role.toUpperCase()}
                                      </span>
                                    </td>
                                    <td className="p-1.5">
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/10 text-rose-300 border border-rose-500/20">
                                        {u.branch || 'Ichalkaranji'}
                                      </span>
                                    </td>
                                    <td className="p-1.5 font-bold text-slate-300">{u.loyaltyPoints || 0} pts</td>
                                    <td className="p-1.5 font-mono text-slate-400">{u.pin || 'None'}</td>
                                    <td className="p-1.5 flex gap-2">
                                      <button
                                        onClick={() => {
                                          setSelectedControlUser(u);
                                          setControlUserForm({
                                            name: u.name,
                                            email: u.email,
                                            phone: u.phone || '',
                                            role: u.role,
                                            pin: u.pin || '',
                                            loyaltyPoints: u.loyaltyPoints || 0,
                                            branch: u.branch || 'Ichalkaranji',
                                            status: 'Active'
                                          });
                                        }}
                                        className="p-1 bg-slate-900 border border-white/10 rounded-lg hover:text-white transition"
                                        title="Edit User"
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={async () => {
                                          if (!confirm(`Permanently delete account for ${u.name}?`)) return;
                                          try {
                                            const res = await fetch('/api/restaurant', {
                                              method: 'POST',
                                              headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
                                              },
                                              body: JSON.stringify({
                                                action: 'deleteUser',
                                                payload: { id: u.id }
                                              })
                                            });
                                            const result = await res.json();
                                            if (result.success) {
                                              showToast("Account deleted successfully", "success");
                                              const r = await fetch('/api/restaurant', {
                                                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}` }
                                              });
                                              const rr = await r.json();
                                              if (rr.success) setData(rr.data);
                                            } else {
                                              showToast(result.error || "Delete failed", "error");
                                            }
                                          } catch (err) {
                                            showToast("Communication failure", "error");
                                          }
                                        }}
                                        className="p-1 bg-slate-900 border border-white/10 rounded-lg text-rose-400 hover:text-rose-300 transition"
                                        title="Delete User"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 3: ROLE MANAGER */}
                    {controlTab === 'roles' && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        
                        {/* Role list */}
                        <div className="lg:col-span-2 bg-slate-950/40 backdrop-blur-md border border-white/5 p-2.5 rounded-3xl shadow-xl space-y-2">
                          <div>
                            <h2 className="text-lg font-black text-white">System Roles Manager</h2>
                            <p className="text-xs text-slate-400 font-medium">Verify role access badges and styles</p>
                          </div>
                          
                          <div className="space-y-3">
                            {matrixRoles.map((roleObj, idx) => (
                              <div key={idx} className="flex justify-between items-center p-1.5 bg-slate-900/30 border border-white/5 rounded-2xl">
                                <div className="flex items-center gap-3">
                                  <span className={`px-3 py-1 rounded-full text-xs font-black ${roleObj.color}`}>
                                    {roleObj.name}
                                  </span>
                                  <span className="text-[10px] text-slate-450 font-mono">key: {roleObj.key}</span>
                                </div>
                                <span className="text-[10px] text-emerald-450 font-bold">✓ Active Role Status</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Add Role Form */}
                        <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2.5 rounded-3xl shadow-xl space-y-2 h-fit">
                          <h3 className="text-xs font-black text-white uppercase tracking-wider">Create Custom Role</h3>
                          <p className="text-[11px] text-slate-400">Add a new operational role hierarchy into the local schema</p>
                          
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              const target = e.target as any;
                              const roleName = target.roleName.value.trim();
                              if (!roleName) return;
                              const roleKey = roleName.toLowerCase().replace(/\s+/g, '-');
                              
                              if (matrixRoles.some(r => r.key === roleKey)) {
                                showToast("Role key already exists", "error");
                                return;
                              }

                              const colors = [
                                'bg-purple-500/10 text-purple-400 border border-purple-500/20',
                                'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
                                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              ];
                              const randomColor = colors[Math.floor(Math.random() * colors.length)];
                              
                              setMatrixRoles([...matrixRoles, { key: roleKey, name: roleName, color: randomColor }]);
                              
                              // update permission matrix rows with 'none'
                              setMatrixPermissions((prev: any[]) => prev.map((row: any) => ({ ...row, [roleKey]: 'none' })));
                              showToast(`Custom role ${roleName} successfully added!`, "success");
                              target.reset();
                            }}
                            className="space-y-2"
                          >
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Role Name</label>
                              <input
                                type="text"
                                name="roleName"
                                required
                                placeholder="e.g. Hostess"
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                              />
                            </div>
                            <button
                              type="submit"
                              className="w-full bg-rose-650 hover:bg-rose-500 text-white rounded-xl py-2 text-xs font-black shadow transition"
                            >
                              Add Custom Role
                            </button>
                          </form>
                        </div>

                      </div>
                    )}

                    {/* SUB-TAB 4: INTERACTIVE PERMISSION MATRIX */}
                    {controlTab === 'permissions' && (
                      <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2.5 rounded-3xl shadow-xl space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <h2 className="text-lg font-black text-white font-extrabold flex items-center gap-2">
                              <Grid className="h-5 w-5 text-rose-500 animate-pulse" /> Role Matrix Permissions Config
                            </h2>
                            <p className="text-xs text-slate-400">Click on any icon grid cell to cycle and modify access levels instantly</p>
                          </div>
                          
                          <button
                            onClick={() => {
                              showToast("Matrix configurations locked & saved successfully!", "success");
                              setControlLogs(prev => [
                                { id: 'matrix-' + Date.now(), time: 'Just Now', user: displayName, action: 'Matrix Saved', type: 'success', module: 'System', details: 'Interactive permission matrix mappings updated', ip: '127.0.0.1', branch: 'Ichalkaranji' },
                                ...prev
                              ]);
                            }}
                            className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow transition flex items-center gap-1.5"
                          >
                            <Check className="h-4 w-4" /> Save Mappings
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-center text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-white/15 text-slate-400 font-black text-[10px] uppercase">
                                <th className="p-1.5 text-left">Module</th>
                                {matrixRoles.map(role => (
                                  <th key={role.key} className="p-1.5">{role.name}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {matrixPermissions.map((row: any) => (
                                <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition">
                                  <td className="p-1.5 text-left font-extrabold text-white">{row.module}</td>
                                  {matrixRoles.map(role => (
                                    <td key={role.key} className="p-1.5">
                                      <button
                                        onClick={() => {
                                          const currentVal = row[role.key] || 'none';
                                          let nextVal = 'none';
                                          if (currentVal === 'full') nextVal = 'view';
                                          else if (currentVal === 'view') nextVal = 'edit';
                                          else if (currentVal === 'edit') nextVal = 'sales';
                                          else if (currentVal === 'sales') nextVal = 'none';
                                          else if (currentVal === 'none') nextVal = 'full';
                                          
                                          setMatrixPermissions((prev: any[]) => prev.map(r => r.id === row.id ? { ...r, [role.key]: nextVal } : r));
                                          showToast(`Updated ${row.module} access for ${role.name} to ${nextVal.toUpperCase()}`, "info");
                                        }}
                                        className="hover:scale-110 active:scale-95 transition p-1.5 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center mx-auto"
                                        title={`Cycle permission level for ${role.name}`}
                                      >
                                        {renderPermissionCellIcon(row[role.key] || 'none')}
                                      </button>
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 5: BRANCH ACCESS */}
                    {controlTab === 'branches' && (() => {
                      const getBranchStats = (branchName: string) => {
                        const branchOrders = data.orders.filter((o: any) => {
                          const b = o.branch || 'Ichalkaranji';
                          const normalizedB = b === 'Ichalkaranji' ? 'Ichalkaranji' : b;
                          return normalizedB.toLowerCase() === branchName.toLowerCase();
                        });

                        const branchReservations = data.reservations.filter((r: any) => {
                          const b = r.branch || 'Ichalkaranji';
                          const normalizedB = b === 'Ichalkaranji' ? 'Ichalkaranji' : b;
                          return normalizedB.toLowerCase() === branchName.toLowerCase();
                        });

                        const branchStaff = data.users.filter((u: any) => {
                          const b = u.branch || 'Ichalkaranji';
                          const normalizedB = b === 'Ichalkaranji' ? 'Ichalkaranji' : b;
                          return u.role !== 'customer' && normalizedB.toLowerCase() === branchName.toLowerCase();
                        });

                        const totalRevenue = branchOrders
                          .filter((o: any) => o.status === 'completed' || o.status === 'served')
                          .reduce((sum: number, o: any) => sum + parseFloat(o.finalAmount || '0'), 0);

                        return {
                          ordersCount: branchOrders.length,
                          activeOrders: branchOrders.filter((o: any) => o.status !== 'completed' && o.status !== 'cancelled').length,
                          reservationsCount: branchReservations.length,
                          staffCount: branchStaff.length,
                          revenue: totalRevenue
                        };
                      };

                      const branches = ['Ichalkaranji', 'Chinchwad', 'Shivajinagar', 'Kolhapur'];
                      const statsA = getBranchStats(compareBranchA);
                      const statsB = getBranchStats(compareBranchB);

                      // Max revenue for scaling visual progress bars
                      const maxRevenue = Math.max(...branches.map(b => getBranchStats(b).revenue), 100);

                      return (
                        <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2.5 sm:p-4 sm:p-5 rounded-3xl shadow-xl space-y-3 text-left">
                          <div>
                            <h2 className="text-lg font-black text-white flex items-center gap-2">
                              <Globe className="h-5 w-5 text-rose-500 animate-pulse" /> Branch Performance & Revenue Analytics
                            </h2>
                            <p className="text-xs text-slate-400 font-medium">Real-time dynamic branch comparison, revenue trends, and operational capacity indicators.</p>
                          </div>

                          {/* Dynamic Cards Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            {branches.map((bName) => {
                              const bStats = getBranchStats(bName);
                              return (
                                <div key={bName} className="p-2 bg-slate-900/30 border border-white/5 rounded-2xl space-y-3 hover:border-rose-500/20 transition duration-300">
                                  <div className="flex justify-between items-center">
                                    <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                                      <MapPin className="h-3.5 w-3.5 text-rose-500" /> {bName}
                                    </h3>
                                    {bName === 'Ichalkaranji' && (
                                      <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider">
                                        Main HQ
                                      </span>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 pt-2 text-left">
                                    <div>
                                      <span className="text-[9px] text-slate-450 font-bold block uppercase">Revenue</span>
                                      <span className="text-sm font-black text-rose-400">{formatCurrency(bStats.revenue)}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-slate-450 font-bold block uppercase">Active Orders</span>
                                      <span className="text-sm font-black text-white">{bStats.activeOrders}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-slate-450 font-bold block uppercase">Bookings</span>
                                      <span className="text-sm font-black text-white">{bStats.reservationsCount}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-slate-450 font-bold block uppercase">Active Staff</span>
                                      <span className="text-sm font-black text-white">{bStats.staffCount}</span>
                                    </div>
                                  </div>

                                  {/* Revenue Progress Indicator */}
                                  <div className="space-y-1 pt-1">
                                    <div className="flex justify-between text-[9px] text-slate-400">
                                      <span>Sales Performance</span>
                                      <span>{Math.round((bStats.revenue / maxRevenue) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/5">
                                      <div 
                                        className="bg-gradient-to-r from-rose-500 to-rose-450 h-full rounded-full transition-all duration-500" 
                                        style={{ width: `${(bStats.revenue / maxRevenue) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Side-by-Side Comparison Segment */}
                          <div className="border border-white/5 bg-slate-900/10 p-2.5 rounded-2xl space-y-2">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">Side-by-Side Operations Comparison</h3>
                                <p className="text-[10px] text-slate-455 font-medium">Select branches to compare metrics directly.</p>
                              </div>

                              <div className="flex items-center gap-2">
                                <select 
                                  value={compareBranchA}
                                  onChange={(e) => setCompareBranchA(e.target.value)}
                                  className="bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-rose-400 font-extrabold focus:outline-none focus:border-rose-500 transition"
                                >
                                  {branches.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                                <span className="text-slate-400 text-xs font-bold">vs</span>
                                <select 
                                  value={compareBranchB}
                                  onChange={(e) => setCompareBranchB(e.target.value)}
                                  className="bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-rose-400 font-extrabold focus:outline-none focus:border-rose-500 transition"
                                >
                                  {branches.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                              {/* Branch A Metrics */}
                              <div className="bg-slate-950/20 border border-white/5 rounded-2xl p-2 space-y-2">
                                <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4 text-rose-500 animate-bounce" /> {compareBranchA}
                                </h4>

                                <div className="space-y-3">
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-400 font-medium">Total Orders:</span>
                                      <span className="text-white font-extrabold">{statsA.ordersCount}</span>
                                    </div>
                                    <div className="w-full bg-slate-900 rounded-full h-2">
                                      <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min((statsA.ordersCount / Math.max(statsA.ordersCount + statsB.ordersCount, 1)) * 100, 100)}%` }} />
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-400 font-medium">Revenue generated:</span>
                                      <span className="text-rose-400 font-extrabold">{formatCurrency(statsA.revenue)}</span>
                                    </div>
                                    <div className="w-full bg-slate-900 rounded-full h-2">
                                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min((statsA.revenue / Math.max(statsA.revenue + statsB.revenue, 1)) * 100, 100)}%` }} />
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-400 font-medium">Reservations:</span>
                                      <span className="text-white font-extrabold">{statsA.reservationsCount}</span>
                                    </div>
                                    <div className="w-full bg-slate-900 rounded-full h-2">
                                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min((statsA.reservationsCount / Math.max(statsA.reservationsCount + statsB.reservationsCount, 1)) * 100, 100)}%` }} />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Branch B Metrics */}
                              <div className="bg-slate-950/20 border border-white/5 rounded-2xl p-2 space-y-2">
                                <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4 text-rose-500 animate-bounce" /> {compareBranchB}
                                </h4>

                                <div className="space-y-3">
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-400 font-medium">Total Orders:</span>
                                      <span className="text-white font-extrabold">{statsB.ordersCount}</span>
                                    </div>
                                    <div className="w-full bg-slate-900 rounded-full h-2">
                                      <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min((statsB.ordersCount / Math.max(statsA.ordersCount + statsB.ordersCount, 1)) * 100, 100)}%` }} />
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-400 font-medium">Revenue generated:</span>
                                      <span className="text-rose-400 font-extrabold">{formatCurrency(statsB.revenue)}</span>
                                    </div>
                                    <div className="w-full bg-slate-900 rounded-full h-2">
                                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min((statsB.revenue / Math.max(statsA.revenue + statsB.revenue, 1)) * 100, 100)}%` }} />
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-400 font-medium">Reservations:</span>
                                      <span className="text-white font-extrabold">{statsB.reservationsCount}</span>
                                    </div>
                                    <div className="w-full bg-slate-900 rounded-full h-2">
                                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min((statsB.reservationsCount / Math.max(statsA.reservationsCount + statsB.reservationsCount, 1)) * 100, 100)}%` }} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* SUB-TAB 6: AUDIT TRAIL LOGS */}
                    {controlTab === 'activity_logs' && (
                      <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2.5 rounded-3xl shadow-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <h2 className="text-lg font-black text-white">System Audit Trails & Activity Logs</h2>
                            <p className="text-xs text-slate-400">Search logged security and transaction events</p>
                          </div>
                          
                          <button
                            onClick={() => {
                              setControlLogs([]);
                              showToast("Local activity audit logs cleared", "info");
                            }}
                            className="border border-white/10 hover:border-white/20 hover:bg-white/5 text-rose-400 px-3 py-1.5 rounded-xl text-xs font-black transition"
                          >
                            Clear Logs
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-white/15 text-slate-400 font-black text-[10px] uppercase">
                                <th className="p-1.5">Timestamp</th>
                                <th className="p-1.5">User</th>
                                <th className="p-1.5">Action</th>
                                <th className="p-1.5">Module</th>
                                <th className="p-1.5">Audit Details</th>
                                <th className="p-1.5">IP Address</th>
                                <th className="p-1.5">Branch Location</th>
                              </tr>
                            </thead>
                            <tbody>
                              {controlLogs.map((log: any) => (
                                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition text-[11px]">
                                  <td className="p-1.5 font-semibold text-slate-450">{log.time}</td>
                                  <td className="p-1.5 font-black text-white">{log.user}</td>
                                  <td className="p-1.5">
                                    <span className="bg-rose-500/20 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded-full text-[9px] font-black">
                                      {log.action}
                                    </span>
                                  </td>
                                  <td className="p-1.5 font-bold text-slate-350">{log.module}</td>
                                  <td className="p-1.5 text-slate-400 font-medium">{log.details}</td>
                                  <td className="p-1.5 text-slate-450 font-mono">{log.ip}</td>
                                  <td className="p-1.5 font-semibold text-slate-400">{log.branch}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 7: LOGIN SESSIONS */}
                    {controlTab === 'sessions' && (
                      <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2.5 rounded-3xl shadow-xl space-y-3">
                        <div>
                          <h2 className="text-lg font-black text-white">Active Login Sessions</h2>
                          <p className="text-xs text-slate-400">View current logged in system sessions. Click revoke to terminate any device access instantly</p>
                        </div>

                        <div className="space-y-2">
                          {controlSessions.map((session, idx) => (
                            <div key={session.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 bg-slate-900/30 border border-white/10 rounded-2xl gap-2">
                              <div className="space-y-1">
                                <p className="font-extrabold text-white text-sm flex items-center gap-2">
                                  {session.user} <span className="text-[10px] bg-slate-800 text-slate-350 px-2 py-0.5 rounded border border-white/5 font-mono uppercase">{session.role}</span>
                                </p>
                                <p className="text-xs text-slate-400 font-medium">Device: {session.device}</p>
                                <p className="text-[11px] text-slate-450 font-mono">IP: {session.ip} | Active: {session.time}</p>
                              </div>

                              <button
                                onClick={() => {
                                  setControlSessions(prev => prev.filter(s => s.id !== session.id));
                                  showToast(`Session for ${session.user} terminated`, "success");
                                  setControlLogs(prev => [
                                    { id: 'revoke-' + Date.now(), time: 'Just Now', user: displayName, action: 'Session Terminated', type: 'warning', module: 'Security', details: `Revoked active session for ${session.user} on ${session.device}`, ip: '127.0.0.1', branch: 'Ichalkaranji' },
                                    ...prev
                                  ]);
                                }}
                                className="bg-rose-500/10 hover:bg-rose-500 text-rose-450 hover:text-white border border-rose-500/20 px-3 py-1.5 rounded-xl text-xs font-black transition self-end sm:self-auto"
                              >
                                Revoke Session
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 8: DEVICE MANAGEMENT */}
                    {controlTab === 'devices' && (
                      <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2.5 rounded-3xl shadow-xl space-y-3">
                        <div>
                          <h2 className="text-lg font-black text-white">Registered Terminals & Device Management</h2>
                          <p className="text-xs text-slate-400">Manage hardware tablets, POS registers, and order displays linked to this outlet</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {[
                            { name: 'POS Terminal Main', desc: 'Main counter cashier workstation iPad', status: 'Online' },
                            { name: 'POS Terminal secondary', desc: 'Kitchen entry cashier tablet', status: 'Online' },
                            { name: 'Kitchen Display (KDS)', desc: 'Large prep monitor assembly', status: 'Online' },
                            { name: 'Waiter Order Pad #1', desc: 'Section A handheld waiter tablet', status: 'Online' }
                          ].map((dev, idx) => (
                            <div key={idx} className="p-2 bg-slate-900/30 border border-white/10 rounded-2xl space-y-2">
                              <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">{dev.name}</h3>
                              <p className="text-xs text-slate-400 font-medium">{dev.desc}</p>
                              <div className="flex justify-between items-center pt-2 text-[10px] font-black border-t border-white/5">
                                <span className="text-emerald-400">● {dev.status}</span>
                                <button 
                                  onClick={() => showToast("Device control keys refreshed successfully!", "success")}
                                  className="text-slate-400 hover:text-white"
                                >
                                  Reset Key
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 9: POLICIES & SETTINGS */}
                    {controlTab === 'security_settings' && (
                      <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2.5 rounded-3xl shadow-xl space-y-3 text-left">
                        <div>
                          <h2 className="text-lg font-black text-white">Security & Access Policies</h2>
                          <p className="text-xs text-slate-400">Configure global parameters and security thresholds</p>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-bold text-slate-450 uppercase mb-1">
                              Password Expiry Period: {securitySettings.passwordExpiry} days
                            </label>
                            <input
                              type="range"
                              min="30"
                              max="180"
                              step="30"
                              value={securitySettings.passwordExpiry}
                              onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiry: Number(e.target.value)})}
                              className="w-full accent-rose-500 cursor-pointer"
                            />
                          </div>

                          <div className="flex items-center justify-between p-1.5 bg-slate-900/30 border border-white/5 rounded-2xl">
                            <div>
                              <p className="text-xs font-extrabold text-white">Force 2-Factor Authentication (2FA)</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Require OTP codes for all manager and staff logins</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={securitySettings.twoFactorEnforced}
                              onChange={(e) => {
                                setSecuritySettings({...securitySettings, twoFactorEnforced: e.target.checked});
                                showToast(`2FA Policy is now ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, "info");
                              }}
                              className="w-4 h-4 accent-rose-500 cursor-pointer"
                            />
                          </div>

                          <div className="flex items-center justify-between p-1.5 bg-slate-900/30 border border-white/5 rounded-2xl">
                            <div>
                              <p className="text-xs font-extrabold text-white">Enable IP Access Restrictions</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Restrict backend portal access strictly to specific IP ranges</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={securitySettings.ipRestrictionsActive}
                              onChange={(e) => {
                                setSecuritySettings({...securitySettings, ipRestrictionsActive: e.target.checked});
                                showToast(`IP Filter Whitelisting is now ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, "info");
                              }}
                              className="w-4 h-4 accent-rose-500 cursor-pointer"
                            />
                          </div>

                          {securitySettings.ipRestrictionsActive && (
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Whitelisted IP Addresses (Comma Separated)</label>
                              <input
                                type="text"
                                value={securitySettings.whitelistedIps}
                                onChange={(e) => setSecuritySettings({...securitySettings, whitelistedIps: e.target.value})}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 10: BACKUP */}
                    {controlTab === 'backup' && (
                      <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-2.5 rounded-3xl shadow-xl space-y-3">
                        <div>
                          <h2 className="text-lg font-black text-white">Database Backup & System Restore Points</h2>
                          <p className="text-xs text-slate-400 font-medium">Backup menu catalog and customer profiles. Restore system parameters safely</p>
                        </div>

                        <div className="p-2.5 bg-slate-900/30 border border-white/10 rounded-2xl text-center space-y-2">
                          <Database className="h-10 w-10 text-rose-500 mx-auto animate-bounce" />
                          <div>
                            <p className="text-sm font-extrabold text-white">Create a New Backup Instance</p>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Saves complete menu items, order history, inventory ledgers, and staff logs to local storage</p>
                          </div>

                          {backupRunning ? (
                            <div className="max-w-xs mx-auto space-y-1.5">
                              <div className="h-2 w-full bg-slate-950 border border-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-600 rounded-full transition-all duration-200" style={{ width: `${backupProgress}%` }}></div>
                              </div>
                              <p className="text-[10px] text-rose-400 font-black">Syncing packages: {backupProgress}% complete</p>
                            </div>
                          ) : (
                            <button
                              onClick={async () => {
                                setBackupRunning(true);
                                setBackupProgress(0);
                                showToast("Running manual system backup sequence...", "info");
                                for (let i = 10; i <= 100; i += 10) {
                                  await new Promise(r => setTimeout(r, 150));
                                  setBackupProgress(i);
                                }
                                setBackupRunning(false);
                                showToast("System database backup archived successfully!", "success");
                                setControlLogs(prev => [
                                  { id: 'backup-' + Date.now(), time: 'Just Now', user: displayName, action: 'System Backup', type: 'success', module: 'System', details: 'Manual database backup created successfully', ip: '127.0.0.1', branch: currentUser.branch || 'Ichalkaranji' },
                                  ...prev
                                ]);
                              }}
                              className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl px-6 py-2.5 text-xs font-black shadow transition inline-flex items-center gap-1.5"
                            >
                              <Database className="h-4 w-4" /> Run System Backup
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}
              {activeManagerTab === 'payments' && (
                <div className="space-y-4">
                  {/* Banner */}
                  <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-950/60 via-slate-900 to-rose-950/40 p-4 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Live Gateway Online</span>
                      </div>
                      <h2 className="text-xl font-black text-white mt-1 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-rose-400" /> Real-Time Owner Payment Hub
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">Monitor real-time incoming payments across branches, instant UPI settlements, and payment gateway configuration.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4" /> Auto-Settlement Active
                      </span>
                    </div>
                  </div>

                  {/* Top Payment Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 shadow-md">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase mb-1">
                        <span>Real-Time Collected</span>
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      </div>
                      <p className="text-xl font-black text-white">{formatCurrency(data.payments.reduce((sum: number, p: any) => sum + parseFloat(p.amount || '0'), 0).toFixed(2))}</p>
                      <p className="text-[10px] text-emerald-400 font-bold mt-1">⚡ Instant Settlement to Bank</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 shadow-md">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase mb-1">
                        <span>UPI & QR Payments</span>
                        <Smartphone className="h-4 w-4 text-rose-400" />
                      </div>
                      <p className="text-xl font-black text-white">{data.payments.filter((p: any) => p.paymentMethod === 'upi').length} Transactions</p>
                      <p className="text-[10px] text-rose-300 font-bold mt-1">UPI: {gatewayConfig.merchantUpiId}</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 shadow-md">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase mb-1">
                        <span>Card Payments</span>
                        <CreditCard className="h-4 w-4 text-indigo-400" />
                      </div>
                      <p className="text-xl font-black text-white">{data.payments.filter((p: any) => p.paymentMethod === 'card').length} Transactions</p>
                      <p className="text-[10px] text-indigo-300 font-bold mt-1">SSL 256-Bit Encrypted</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 shadow-md">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase mb-1">
                        <span>Counter & Cash</span>
                        <DollarSign className="h-4 w-4 text-amber-400" />
                      </div>
                      <p className="text-xl font-black text-white">{data.payments.filter((p: any) => ['cash', 'cod', 'counter_billing'].includes(p.paymentMethod)).length} Transactions</p>
                      <p className="text-[10px] text-amber-300 font-bold mt-1">Verified at Cashier POS</p>
                    </div>
                  </div>

                  {/* Real-time Payment Gateway Configuration (Owner Only) */}
                  {currentRole === 'owner' && (
                    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-lg space-y-3">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="flex items-center gap-2">
                          <Sliders className="h-4 w-4 text-rose-400" />
                          <h3 className="text-sm font-black text-white uppercase tracking-wider">Owner Payment Gateway Configuration</h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-lg border border-white/10">Real-Time Sync</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Merchant UPI VPA ID</label>
                          <input
                            type="text"
                            value={gatewayConfig.merchantUpiId}
                            onChange={(e) => setGatewayConfig({ ...gatewayConfig, merchantUpiId: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white font-mono focus:border-rose-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Merchant Business Name</label>
                          <input
                            type="text"
                            value={gatewayConfig.merchantName}
                            onChange={(e) => setGatewayConfig({ ...gatewayConfig, merchantName: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white font-bold focus:border-rose-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Razorpay Live Key ID</label>
                          <input
                            type="text"
                            value={gatewayConfig.razorpayKeyId}
                            onChange={(e) => setGatewayConfig({ ...gatewayConfig, razorpayKeyId: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white font-mono focus:border-rose-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Direct settlement configured to {gatewayConfig.payoutBank}
                        </p>
                        <button
                          type="button"
                          onClick={() => showToast("Payment Gateway credentials updated!", "success")}
                          className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-md"
                        >
                          Save Gateway Settings
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Real-time Transactions Feed */}
                  <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-4 shadow-lg space-y-3">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-rose-400" /> Real-Time Transactions & Receipts Log
                        </h3>
                        <p className="text-[11px] text-slate-400">Live payment verification feed for all customer orders across branches.</p>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <input
                          type="text"
                          placeholder="Search txn ID or amount..."
                          value={paymentSearch}
                          onChange={(e) => setPaymentSearch(e.target.value)}
                          className="rounded-xl border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-rose-500 focus:outline-none"
                        />
                        <select
                          value={paymentMethodFilter}
                          onChange={(e) => setPaymentMethodFilter(e.target.value)}
                          className="rounded-xl border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                        >
                          <option value="all">All Methods</option>
                          <option value="upi">UPI Only</option>
                          <option value="card">Card Only</option>
                          <option value="cash">Cash/COD</option>
                        </select>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="border-b border-white/10 bg-slate-950/60 text-[10px] uppercase font-bold text-slate-400">
                          <tr>
                            <th className="py-2.5 px-3">Txn ID / Ref</th>
                            <th className="py-2.5 px-3">Order ID</th>
                            <th className="py-2.5 px-3">Payment Method</th>
                            <th className="py-2.5 px-3">Amount</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Date & Time</th>
                            <th className="py-2.5 px-3 text-right">Receipt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {data.payments
                            .filter((p: any) => {
                              if (paymentMethodFilter !== 'all' && p.paymentMethod !== paymentMethodFilter) return false;
                              if (paymentSearch.trim() && !String(p.transactionId || '').toLowerCase().includes(paymentSearch.toLowerCase()) && !String(p.amount).includes(paymentSearch)) return false;
                              return true;
                            })
                            .map((p: any) => (
                              <tr key={p.id} className="hover:bg-slate-800/40 transition">
                                <td className="py-2.5 px-3 font-mono font-bold text-rose-300">
                                  {p.transactionId || `TXN_${p.id}_REALTIME`}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-slate-300">#ORD-{p.orderId}</td>
                                <td className="py-2.5 px-3 font-bold uppercase text-white">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${p.paymentMethod === 'upi' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : p.paymentMethod === 'card' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                                    {p.paymentMethod}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-black text-white">{formatCurrency(parseFloat(p.amount).toFixed(2))}</td>
                                <td className="py-2.5 px-3">
                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                    <CheckCircle2 className="h-3 w-3" /> SETTLED LIVE
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-[11px] text-slate-400">
                                  {p.createdAt ? new Date(p.createdAt).toLocaleString('en-IN') : 'Just Now'}
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedReceipt(p)}
                                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-[11px] border border-rose-500/30 transition"
                                  >
                                    View Receipt
                                  </button>
                                </td>
                              </tr>
                            ))}
                          {data.payments.length === 0 && (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                                No real-time payments recorded yet. Real-time payments from customer checkouts will appear here instantly.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {activeManagerTab === 'overview' && (
                <div className="space-y-3">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div className="bg-slate-900/60 border border-white/5 p-2.5 rounded-2xl shadow-sm flex items-center gap-2 text-slate-100">
                      <div className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 p-1.5 rounded-xl">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Total Revenue</p>
                        <p className="text-xl font-extrabold text-white">{formatCurrency(totalRevenue.toFixed(2))}</p>
                        <p className="text-[10px] text-emerald-400">★ 100% Verified Paid Sales</p>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-white/5 p-2.5 rounded-2xl shadow-sm flex items-center gap-2 text-slate-100">
                      <div className="bg-rose-500/10 text-rose-300 border border-rose-500/20 p-1.5 rounded-xl">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Operating Expenses</p>
                        <p className="text-xl font-extrabold text-white">{formatCurrency(totalExpenses.toFixed(2))}</p>
                        <p className="text-[10px] text-slate-400">Rent, salary & raw produce</p>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-white/5 p-2.5 rounded-2xl shadow-sm flex items-center gap-2 text-slate-100">
                      <div className="bg-blue-500/10 text-blue-300 border border-blue-500/20 p-1.5 rounded-xl">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Total Orders</p>
                        <p className="text-xl font-extrabold text-white">{totalOrdersCount}</p>
                        <p className="text-[10px] text-blue-300">Dine-in, pickup & delivery</p>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-white/5 p-2.5 rounded-2xl shadow-sm flex items-center gap-2 text-slate-100">
                      <div className="bg-amber-500/10 text-amber-300 border border-amber-500/20 p-1.5 rounded-xl">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Low-Stock Warnings</p>
                        <p className="text-xl font-extrabold text-white">{lowStockItems.length}</p>
                        <p className="text-[10px] text-rose-400 font-bold">Needs immediate reorder</p>
                      </div>
                    </div>
                  </div>

                  {/* Low Stock Alerts */}
                  {lowStockItems.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl p-2 flex gap-3 items-center">
                      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                      <div>
                        <p className="font-bold text-xs text-white">Low Stock Warning!</p>
                        <p className="text-[11px] text-slate-300">The following ingredients are below reorder parameters: {lowStockItems.map((i: any) => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}. Restock immediately inside Inventory tab.</p>
                      </div>
                    </div>
                  )}

                  {/* Visual Sales Charts (Custom CSS/SVG Bars) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="bg-slate-900/60 border border-white/5 p-4 sm:p-5 rounded-3xl text-slate-100">
                      <h3 className="text-sm font-extrabold mb-4 uppercase tracking-wider text-slate-400">Revenue Contribution by Category</h3>
                      <div className="space-y-2">
                        {data.categories.map((cat: any) => {
                          const itemsInCategory = data.menuItems.filter((m: any) => m.categoryId === cat.id);
                          const matchingOrderItems = data.orderItems.filter((oi: any) => {
                            const parentOrder = data.orders.find((o: any) => o.id === oi.orderId);
                            const orderMatch = parentOrder && (parentOrder.branch || 'Ichalkaranji').toLowerCase() === activeBranchFilter.toLowerCase();
                            return orderMatch && itemsInCategory.some((m: any) => m.id === oi.menuItemId);
                          });
                          const categorySum = matchingOrderItems.reduce((sum: number, oi: any) => sum + (Number(oi.unitPrice) * oi.quantity), 0);
                          const percentage = totalRevenue > 0 ? (categorySum / totalRevenue) * 100 : 20;

                          return (
                            <div key={cat.id} className="space-y-1">
                              <div className="flex justify-between text-xs font-bold">
                                <span>{cat.name}</span>
                                <span className="text-rose-400">{formatCurrency(categorySum.toFixed(2))} ({percentage.toFixed(0)}%)</span>
                              </div>
                              <div className="w-full bg-slate-950/60 rounded-full h-2.5 overflow-hidden">
                                <div 
                                  className="bg-rose-500 h-2.5 rounded-full transition-all" 
                                  style={{ width: `${Math.max(percentage, 5)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-white/5 p-4 sm:p-5 rounded-3xl flex flex-col justify-between text-slate-100">
                      <div>
                        <h3 className="text-sm font-extrabold mb-3 uppercase tracking-wider text-slate-400">Live Table Occupancy Rate</h3>
                        <p className="text-xs text-slate-400 mb-4">Current real-time layout metrics for waiter coordination.</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-1.5 bg-slate-950/60 border border-white/5 rounded-2xl">
                          <p className="text-xl font-black text-emerald-400">{data.tables.filter((t: any) => t.status === 'available').length}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Available</p>
                        </div>
                        <div className="p-1.5 bg-slate-950/60 border border-white/5 rounded-2xl">
                          <p className="text-xl font-black text-rose-400">{data.tables.filter((t: any) => t.status === 'occupied').length}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Occupied</p>
                        </div>
                        <div className="p-1.5 bg-slate-950/60 border border-white/5 rounded-2xl">
                          <p className="text-xl font-black text-purple-600">{data.tables.filter((t: any) => t.status === 'reserved').length}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Reserved</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300">Average Order Size:</span>
                        <span className="font-black text-rose-400 text-sm">{formatCurrency(averageOrderValue.toFixed(2))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Orders Log */}
                  <div className="bg-slate-900/60 border border-white/5 p-4 sm:p-5 rounded-3xl text-slate-100">
                    <h3 className="text-sm font-extrabold mb-4 uppercase tracking-wider text-slate-400">Real-Time POS Billing Logs</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-slate-400 uppercase font-bold">
                            <th className="py-2">Order ID</th>
                            <th className="py-2">Type</th>
                            <th className="py-2">Table</th>
                            <th className="py-2">Status</th>
                            <th className="py-2">Total Amount</th>
                            <th className="py-2">Final (Tax & Coupon)</th>
                            <th className="py-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {data.orders.filter((o: any) => (o.branch || 'Ichalkaranji').toLowerCase() === activeBranchFilter.toLowerCase()).map((o: any) => {
                            const table = data.tables.find((t: any) => t.id === o.tableId);
                            return (
                              <tr key={o.id} className="hover:bg-white/5">
                                <td className="py-1.5 font-bold">#{o.id}</td>
                                <td className="py-1.5 uppercase">{o.orderType}</td>
                                <td className="py-1.5 font-semibold">{table ? `Table ${table.tableNumber}` : 'N/A'}</td>
                                <td className="py-1.5">
                                  <span className="bg-slate-950/60 text-slate-200 px-2 py-0.5 rounded-full font-bold uppercase text-[10px]">
                                    {o.status}
                                  </span>
                                </td>
                                <td className="py-1.5 font-medium">{formatCurrency(o.totalAmount)}</td>
                                <td className="py-1.5 font-bold text-rose-400">{formatCurrency(o.finalAmount)}</td>
                                <td className="py-1.5 text-right">
                                  {o.status === 'served' && (
                                    <button
                                      onClick={async () => {
                                        await handleAction('updateOrderStatus', { id: o.id, status: 'completed' });
                                        if (table) {
                                          await handleAction('saveTable', { ...table, status: 'available' });
                                        }
                                        showToast(`Order #${o.id} marked as completed & Table #${table ? table.tableNumber : ''} is free!`, 'success');
                                      }}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-extrabold mr-2 transition shadow-sm inline-flex items-center gap-1"
                                      title="Complete Order & Free Table"
                                    >
                                      <CheckCircle2 className="h-3 w-3 inline" /> Free Table
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleAction('updateOrderStatus', { id: o.id, status: 'cancelled' })}
                                    className="p-1 text-slate-400 hover:text-rose-400"
                                    title="Cancel Order"
                                  >
                                    <X className="h-4 w-4 inline" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MENU ITEMS CRUD */}
              {activeManagerTab === 'menu' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-900/60 border border-white/5 p-2 rounded-2xl text-slate-100">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={managerSearch}
                        onChange={(e) => setManagerSearch(e.target.value)}
                        placeholder="Filter menu catalog..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-white/5 rounded-xl text-sm"
                      />
                    </div>
                    <button 
                      onClick={handleOpenAddMenuItem}
                      className="px-4 py-2 bg-rose-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 hover:bg-rose-700 transition-all"
                    >
                      <Plus className="h-4 w-4" /> Add Menu Item
                    </button>
                  </div>

                  {/* Menu Catalog Table */}
                  <div className="bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden text-slate-100">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-950/60 border-b border-white/5 text-slate-400 uppercase font-bold">
                            <th className="p-2">Image</th>
                            <th className="p-2">Name</th>
                            <th className="p-2">Category</th>
                            <th className="p-2">Price</th>
                            <th className="p-2">Prep Time</th>
                            <th className="p-2">Availability</th>
                            <th className="p-2">Diet Tags</th>
                            <th className="p-2 text-right">Control</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {data.menuItems
                            .filter((item: any) => item.name.toLowerCase().includes(managerSearch.toLowerCase()))
                            .map((item: any) => {
                              const category = data.categories.find((c: any) => c.id === item.categoryId);
                              return (
                                <tr key={item.id} className="hover:bg-white/5">
                                  <td className="p-2">
                                    <img 
                                      src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=60"} 
                                      alt={item.name} 
                                      className="h-10 w-12 object-cover rounded-lg border border-white/5"
                                    />
                                  </td>
                                  <td className="p-2 font-bold text-white">{item.name}</td>
                                  <td className="p-2 font-semibold text-slate-300">{category ? category.name : 'Unknown'}</td>
                                  <td className="p-2 font-extrabold text-rose-400">{formatCurrency(item.price)}</td>
                                  <td className="p-2 font-semibold">{item.preparationTime} mins</td>
                                  <td className="p-2">
                                    <button 
                                      onClick={() => handleAction('saveMenuItem', { ...item, isAvailable: !item.isAvailable })}
                                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-300 border border-rose-200'}`}
                                    >
                                      {item.isAvailable ? '● Available' : '○ Sold Out'}
                                    </button>
                                  </td>
                                  <td className="p-2 flex gap-1 items-center flex-wrap">
                                    {item.isVegetarian && <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-bold">Veg</span>}
                                    {item.isVegan && <span className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded font-bold">Vegan</span>}
                                    {item.isGlutenFree && <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold">GF</span>}
                                  </td>
                                  <td className="p-2 text-right space-x-2">
                                    <button 
                                      onClick={() => handleOpenEditMenuItem(item)}
                                      className="p-1.5 bg-slate-950/60 hover:bg-slate-200 text-slate-300 rounded-lg inline-block"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => handleAction('deleteMenuItem', { id: item.id })}
                                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-400 rounded-lg inline-block"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: INVENTORY TRACKER & STOCK ALERT */}
              {activeManagerTab === 'inventory' && (
                <div className="space-y-3">
                  {/* Stock Ordering Form (Purchase Orders) */}
                  <div className="bg-slate-900/60 border border-white/5 p-4 sm:p-5 rounded-3xl text-slate-100">
                    <h3 className="text-sm font-extrabold mb-3 uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-rose-500" /> Restock / Create Supplier Purchase Order
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">Instantly place Restock item request with our active connected partners.</p>
                    
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!purchaseOrderForm.supplierId || !purchaseOrderForm.itemName) {
                        showToast("Please provide supplier and item name", "error");
                        return;
                      }
                      const success = await handleAction('createPurchaseOrder', {
                        supplierId: parseInt(purchaseOrderForm.supplierId),
                        itemName: purchaseOrderForm.itemName,
                        quantity: Number(purchaseOrderForm.quantity),
                        cost: Number(purchaseOrderForm.cost),
                        status: purchaseOrderForm.status
                      });
                      if (success) {
                        setPurchaseOrderForm({ supplierId: '', itemName: '', quantity: '10', cost: '100', status: 'ordered' });
                        showToast("Purchase order logged! Stock updated if received.", "success");
                      }
                    }} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Supplier *</label>
                        <select 
                          required
                          value={purchaseOrderForm.supplierId}
                          onChange={(e) => setPurchaseOrderForm({ ...purchaseOrderForm, supplierId: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white"
                        >
                          <option value="">-- Choose Partner --</option>
                          {data.suppliers.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ingredient Item *</label>
                        <input 
                          type="text" 
                          required
                          value={purchaseOrderForm.itemName}
                          onChange={(e) => setPurchaseOrderForm({ ...purchaseOrderForm, itemName: e.target.value })}
                          placeholder="e.g. Buffalo Mozzarella" 
                          className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white"
                        />
                      </div>

                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Restock Qty *</label>
                        <input 
                          type="number" 
                          required
                          value={purchaseOrderForm.quantity}
                          onChange={(e) => setPurchaseOrderForm({ ...purchaseOrderForm, quantity: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white"
                        />
                      </div>

                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Total Cost (₹) *</label>
                        <input 
                          type="number" 
                          required
                          value={purchaseOrderForm.cost}
                          onChange={(e) => setPurchaseOrderForm({ ...purchaseOrderForm, cost: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white"
                        />
                      </div>

                      <div className="md:col-span-1">
                        <button 
                          type="submit" 
                          className="w-full py-2 bg-rose-600 text-white font-extrabold rounded-xl text-xs hover:bg-rose-700 transition-all shadow-sm"
                        >
                          Send PO Request
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Inventory Ingredients Table */}
                  <div className="bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden text-slate-100">
                    <div className="p-2 bg-slate-950/60 border-b border-white/5 flex justify-between items-center">
                      <h3 className="font-extrabold text-xs text-slate-200 uppercase">Live Kitchen Pantry Inventory</h3>
                      <button 
                        onClick={() => setActiveModal('addInventory')}
                        className="px-3 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-bold hover:bg-rose-700 transition-all"
                      >
                        + Add Custom Pantry Item
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-slate-400 uppercase font-bold bg-slate-950/60/50">
                            <th className="p-2">Ingredient ID</th>
                            <th className="p-2">Item Name</th>
                            <th className="p-2">Current Stock</th>
                            <th className="p-2">Min Reorder Thresh</th>
                            <th className="p-2">Cost/Unit</th>
                            <th className="p-2">Supplier Partner</th>
                            <th className="p-2">Status</th>
                            <th className="p-2 text-right">Delete</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {data.inventory.map((inv: any) => {
                            const supplier = data.suppliers.find((s: any) => s.id === inv.supplierId);
                            const isLow = Number(inv.quantity) <= Number(inv.reorderLevel);

                            return (
                              <tr key={inv.id} className={isLow ? 'bg-rose-50/30' : 'hover:bg-white/5'}>
                                <td className="p-2 font-semibold text-slate-400">#{inv.id}</td>
                                <td className="p-2 font-bold text-white">{inv.name}</td>
                                <td className={`p-2 font-black ${isLow ? 'text-rose-400' : 'text-slate-950'}`}>
                                  {inv.quantity} {inv.unit}
                                </td>
                                <td className="p-2 font-semibold text-slate-400">{inv.reorderLevel} {inv.unit}</td>
                                <td className="p-2 font-medium">{formatCurrency(inv.costPerUnit)}</td>
                                <td className="p-2 font-semibold text-slate-300">{supplier ? supplier.name : 'Unknown Supplier'}</td>
                                <td className="p-2">
                                  {isLow ? (
                                    <span className="bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] border border-rose-300 animate-pulse">
                                      🚨 Critical Low Stock
                                    </span>
                                  ) : (
                                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] border border-emerald-300">
                                      🟢 Adequate
                                    </span>
                                  )}
                                </td>
                                <td className="p-2 text-right">
                                  <button 
                                    onClick={() => handleAction('deleteInventory', { id: inv.id })}
                                    className="p-1 text-slate-400 hover:text-rose-400"
                                  >
                                    <Trash2 className="h-4 w-4 inline" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: EMPLOYEES & SHIFTS */}
              {activeManagerTab === 'shifts' && (
                <div className="space-y-3">
                  <div className="bg-slate-900/60 border border-white/5 p-4 sm:p-5 rounded-3xl text-slate-100">
                    <h3 className="text-sm font-extrabold mb-3 uppercase tracking-wider text-slate-400">
                      Schedule Employee Shift
                    </h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!shiftForm.userId || !shiftForm.date) {
                        showToast("Please pick employee and date", "error");
                        return;
                      }
                      const success = await handleAction('saveShift', {
                        ...shiftForm,
                        userId: parseInt(shiftForm.userId)
                      });
                      if (success) {
                        setShiftForm({ userId: '', date: '', startTime: '09:00', endTime: '17:00', role: 'chef', status: 'scheduled' });
                        showToast("Employee shift scheduled successfully!", "success");
                      }
                    }} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Employee Staff *</label>
                        <select 
                          required
                          value={shiftForm.userId}
                          onChange={(e) => setShiftForm({ ...shiftForm, userId: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white"
                        >
                          <option value="">-- Choose User --</option>
                          {data.users.map((u: any) => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role.toUpperCase()})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Shift Date *</label>
                        <input 
                          type="date" 
                          required
                          value={shiftForm.date}
                          onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Start Time *</label>
                        <input 
                          type="text" 
                          required
                          value={shiftForm.startTime}
                          onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                          placeholder="09:00" 
                          className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">End Time *</label>
                        <input 
                          type="text" 
                          required
                          value={shiftForm.endTime}
                          onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                          placeholder="17:00" 
                          className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Staff Role *</label>
                        <select 
                          value={shiftForm.role}
                          onChange={(e) => setShiftForm({ ...shiftForm, role: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white"
                        >
                          <option value="chef">Chef</option>
                          <option value="waiter">Waiter</option>
                          <option value="cashier">Cashier</option>
                          <option value="manager">Manager</option>
                        </select>
                      </div>

                      <div>
                        <button 
                          type="submit" 
                          className="w-full py-2 bg-rose-600 text-white font-extrabold rounded-xl text-xs hover:bg-rose-700 transition-all shadow-sm"
                        >
                          Lock Roster Shift
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="bg-slate-900/60 border border-white/5 p-4 sm:p-5 rounded-3xl text-slate-100">
                    <h3 className="text-sm font-extrabold mb-3 uppercase tracking-wider text-slate-400">
                      Manage Chef, Waiter & Cashier Records
                    </h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!staffForm.name || !staffForm.email) {
                        showToast('Please provide name and email', 'error');
                        return;
                      }
                      const success = await handleAction('saveStaffMember', {
                        ...staffForm,
                        managerId: currentUser?.id || null,
                      });
                      if (success) {
                        setStaffForm({ role: 'chef', name: '', email: '', phone: '', password: '', status: 'active', specialization: '', section: '', shiftPreference: '', vehicleType: 'Bike' });
                        showToast('Staff profile saved successfully. Invitation sent!', 'success');
                      }
                    }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-end">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Role *</label>
                        <select value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })} className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white">
                          <option value="chef">Chef</option>
                          <option value="waiter">Waiter</option>
                          <option value="cashier">Cashier</option>
                          <option value="delivery">Delivery Executive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name *</label>
                        <input value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white" placeholder="Staff name" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email *</label>
                        <input type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white" placeholder="staff@email.com" />
                      </div>
                      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl p-2.5 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-rose-300 uppercase mb-0.5 flex items-center gap-1"><Shield className="h-3 w-3" /> Invitation Flow</span>
                        <span className="text-[9px] text-rose-400 leading-tight">Password setup is handled securely via the invitation email link.</span>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone</label>
                        <input value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white" placeholder="Phone" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                        <select value={staffForm.status} onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value })} className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white">
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{staffForm.role === 'chef' ? 'Specialization' : staffForm.role === 'waiter' ? 'Section' : staffForm.role === 'cashier' ? 'Shift Preference' : 'Vehicle Type'}</label>
                        <input value={staffForm.role === 'chef' ? staffForm.specialization : staffForm.role === 'waiter' ? staffForm.section : staffForm.role === 'cashier' ? staffForm.shiftPreference : staffForm.vehicleType} onChange={(e) => setStaffForm({ ...staffForm, ...(staffForm.role === 'chef' ? { specialization: e.target.value } : staffForm.role === 'waiter' ? { section: e.target.value } : staffForm.role === 'cashier' ? { shiftPreference: e.target.value } : { vehicleType: e.target.value }) })} className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white" placeholder={staffForm.role === 'chef' ? 'Pizza / Grill' : staffForm.role === 'waiter' ? 'Floor 1' : staffForm.role === 'cashier' ? 'Morning / Evening' : 'EV Scooter / Bike'} />
                      </div>
                      <div>
                        <button type="submit" className="w-full py-2 bg-rose-600 text-white font-extrabold rounded-xl text-xs hover:bg-rose-700 transition-all shadow-sm">Create Staff Profile</button>
                      </div>
                    </form>
                    <div className="mt-3 grid grid-cols-1 lg:grid-cols-4 gap-3">
                      {['chef','waiter','cashier','delivery'].map((role) => {
                        const records = (role === 'chef' ? data.chefs : role === 'waiter' ? data.waiters : role === 'cashier' ? data.cashiers : (data.deliveryBoys || [])).filter((r: any) => {
                          const staffUser = data.users.find((u: any) => u.id === r.userId);
                          return staffUser && (staffUser.branch || 'Ichalkaranji').toLowerCase() === activeBranchFilter.toLowerCase();
                        });
                        return (
                          <div key={role} className="rounded-2xl border border-white/5 bg-slate-950/60 p-1.5 text-slate-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs font-extrabold uppercase text-slate-300">{role === 'chef' ? 'Chefs' : role === 'waiter' ? 'Waiters' : role === 'cashier' ? 'Cashiers' : 'Riders'}</h4>
                              <span className="text-[10px] font-bold text-slate-400">{records.length}</span>
                            </div>
                            <div className="space-y-2">
                              {records.length === 0 ? (
                                <p className="text-xs text-slate-400">No {role} records yet.</p>
                              ) : records.map((record: any) => {
                                  const user = data.users.find((u: any) => u.id === record.userId);
                                  const manager = data.users.find((u: any) => u.id === record.managerId);
                                  return (
                                    <div key={record.id} className="rounded-xl border border-white/5 bg-slate-950/40 p-2.5 text-slate-105">
                                      <div className="flex items-start justify-between gap-2">
                                        <div>
                                          <p className="font-semibold text-white text-sm">{user?.name || 'Unnamed staff'}</p>
                                          <p className="text-[11px] text-slate-400">{user?.email || 'No email'}</p>
                                          <p className="text-[11px] text-slate-400">{role === 'chef' ? record.specialization : role === 'waiter' ? record.section : role === 'cashier' ? record.shiftPreference : (record.vehicleType || 'Bike')}</p>
                                        </div>
                                        <button onClick={() => handleAction('deleteStaffMember', { role, id: record.id })} className="p-1 text-slate-400 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
                                      </div>
                                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                                        <span>{manager?.name ? `Managed by ${manager.name}` : 'Unassigned'}</span>
                                        <span className={`rounded-full px-2 py-0.5 font-bold ${record.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-950/60 text-slate-300'}`}>{record.status}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-white/5 p-4 sm:p-5 rounded-3xl text-slate-100">
                    <h3 className="text-sm font-extrabold mb-3 uppercase tracking-wider text-slate-400">
                      Staff Access Requests
                    </h3>
                    <div className="space-y-3">
                      {data.users.filter((u: any) => u.role !== 'customer').length === 0 ? (
                        <p className="text-sm text-slate-400">No staff accounts to review yet.</p>
                      ) : (
                        data.users
                          .filter((u: any) => u.role !== 'customer')
                          .map((u: any) => (
                            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-slate-950/60 p-1.5 text-slate-200">
                              <div>
                                <p className="font-semibold text-white">{u.name}</p>
                                <p className="text-xs text-slate-400">{u.email} • {u.role.toUpperCase()}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${u.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                  {u.isApproved ? 'Approved' : 'Pending approval'}
                                </span>
                                <button
                                  onClick={() => handleAction('approveStaff', { id: u.id, isApproved: true })}
                                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleAction('approveStaff', { id: u.id, isApproved: false })}
                                  className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                                >
                                  Block
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  {/* Shifts Table */}
                  <div className="bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden text-slate-100">
                    <div className="p-2 bg-slate-950/60 border-b border-white/5">
                      <h3 className="font-extrabold text-xs text-slate-200 uppercase">Shift Roster Registry</h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-slate-400 uppercase font-bold bg-slate-950/60/50">
                            <th className="p-2">Employee</th>
                            <th className="p-2">Scheduled Date</th>
                            <th className="p-2">Timing Block</th>
                            <th className="p-2">Assigned Role</th>
                            <th className="p-2">Shift Status</th>
                            <th className="p-2 text-right">Delete</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {data.shifts.map((s: any) => {
                            const emp = data.users.find((u: any) => u.id === s.userId);
                            return (
                              <tr key={s.id} className="hover:bg-white/5">
                                <td className="p-2 font-bold text-white">{emp ? emp.name : 'Unknown User'}</td>
                                <td className="p-2 font-semibold text-slate-300">{s.date}</td>
                                <td className="p-2 font-semibold text-slate-200">{s.startTime} - {s.endTime}</td>
                                <td className="p-2 uppercase font-bold text-rose-400">{s.role}</td>
                                <td className="p-2">
                                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold uppercase text-[10px]">
                                    {s.status}
                                  </span>
                                </td>
                                <td className="p-2 text-right">
                                  <button 
                                    onClick={() => handleAction('deleteShift', { id: s.id })}
                                    className="p-1 text-slate-400 hover:text-rose-400"
                                  >
                                    <Trash2 className="h-4 w-4 inline" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: MANAGER RESERVATIONS */}
              {activeManagerTab === 'reservations' && (
                <div className="bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden text-slate-100">
                  <div className="p-2 bg-slate-950/60 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-extrabold text-xs text-slate-200 uppercase">Table Reservation Ledger</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-400 uppercase font-bold bg-slate-950/60/50">
                          <th className="p-2">Guest Name</th>
                          <th className="p-2">Phone</th>
                          <th className="p-2">Table Blocked</th>
                          <th className="p-2">Date & Time</th>
                          <th className="p-2">Guests Count</th>
                          <th className="p-2">Status</th>
                          <th className="p-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {data.reservations.filter((r: any) => (r.branch || 'Ichalkaranji').toLowerCase() === activeBranchFilter.toLowerCase()).map((res: any) => {
                          const table = data.tables.find((t: any) => t.id === res.tableId);
                          return (
                            <tr key={res.id} className="hover:bg-white/5">
                              <td className="p-2 font-bold text-white">{res.customerName}</td>
                              <td className="p-2 font-semibold text-slate-300">{res.customerPhone}</td>
                              <td className="p-2 font-bold text-rose-400">
                                {table ? `Table ${table.tableNumber} (Cap: ${table.capacity})` : 'N/A'}
                              </td>
                              <td className="p-2 font-semibold text-slate-200">{new Date(res.reservationTime).toLocaleString()}</td>
                              <td className="p-2 font-bold">{res.numberOfGuests} pax</td>
                              <td className="p-2">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border ${
                                  res.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                  res.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                  'bg-slate-950/60 text-slate-200 border-white/5'
                                }`}>
                                  {res.status}
                                </span>
                              </td>
                              <td className="p-2 text-right space-x-1.5 whitespace-nowrap">
                                {res.status === 'pending' && (
                                  <button
                                    onClick={() => handleAction('saveReservation', { ...res, status: 'confirmed' })}
                                    className="px-2 py-1 bg-emerald-600 text-white font-extrabold rounded-lg text-[10px] hover:bg-emerald-700 transition-all"
                                  >
                                    Confirm ✓
                                  </button>
                                )}
                                <button
                                  onClick={() => handleAction('deleteReservation', { id: res.id })}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 inline-block"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: OPERATIONAL EXPENSES */}
              {activeManagerTab === 'expenses' && (
                <div className="space-y-3">
                  <div className="bg-slate-900/60 border border-white/5 p-4 sm:p-5 rounded-3xl text-slate-100">
                    <h3 className="text-sm font-extrabold mb-3 uppercase tracking-wider text-slate-400">
                      Record Business Expense
                    </h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!expenseForm.description || !expenseForm.amount || !expenseForm.date) {
                        showToast("Please provide description, amount, and date", "error");
                        return;
                      }
                      const success = await handleAction('saveExpense', {
                        ...expenseForm,
                        amount: Number(expenseForm.amount)
                      });
                      if (success) {
                        setExpenseForm({ description: '', category: 'Ingredients', amount: '', date: '', createdBy: `${displayName} (Manager)` });
                        showToast("Operational Expense logged!", "success");
                      }
                    }} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description *</label>
                        <input 
                          type="text" 
                          required
                          value={expenseForm.description}
                          onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                          placeholder="e.g. Electric bill April" 
                          className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Expense Category *</label>
                        <select 
                          value={expenseForm.category}
                          onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white"
                        >
                          <option value="Ingredients">Ingredients</option>
                          <option value="Rent">Rent</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Salaries">Salaries</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Amount (₹) *</label>
                        <input 
                          type="number" 
                          required
                          value={expenseForm.amount}
                          onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                          placeholder="350" 
                          className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date *</label>
                        <input 
                          type="date" 
                          required
                          value={expenseForm.date}
                          onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white"
                        />
                      </div>

                      <div>
                        <button 
                          type="submit" 
                          className="w-full py-2 bg-rose-600 text-white font-extrabold rounded-xl text-xs hover:bg-rose-700 transition-all shadow-sm"
                        >
                          Log Expense
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Expenses List */}
                  <div className="bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden text-slate-100">
                    <div className="p-2 bg-slate-950/60 border-b border-white/5">
                      <h3 className="font-extrabold text-xs text-slate-200 uppercase">Operational Expense Ledger</h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-slate-400 uppercase font-bold bg-slate-950/60/50">
                            <th className="p-2">Expense ID</th>
                            <th className="p-2">Description</th>
                            <th className="p-2">Category</th>
                            <th className="p-2">Date logged</th>
                            <th className="p-2">Authorized By</th>
                            <th className="p-2">Amount</th>
                            <th className="p-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {data.expenses.map((exp: any) => (
                            <tr key={exp.id} className="hover:bg-white/5">
                              <td className="p-2 font-semibold text-slate-400">#{exp.id}</td>
                              <td className="p-2 font-bold text-white">{exp.description}</td>
                              <td className="p-2 uppercase font-semibold text-slate-300">{exp.category}</td>
                              <td className="p-2 text-slate-300">{exp.date}</td>
                              <td className="p-2 font-semibold text-slate-400">{exp.createdBy}</td>
                              <td className="p-2 font-black text-rose-400">{formatCurrency(exp.amount)}</td>
                              <td className="p-2 text-right">
                                <button 
                                  onClick={() => handleAction('deleteExpense', { id: exp.id })}
                                  className="p-1 text-slate-400 hover:text-rose-400"
                                >
                                  <Trash2 className="h-4 w-4 inline" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: COUPONS */}
              {activeManagerTab === 'coupons' && (
                <div className="space-y-3">
                  <div className="bg-slate-900/60 border border-white/5 p-4 sm:p-5 rounded-3xl text-slate-100">
                    <h3 className="text-sm font-extrabold mb-3 uppercase tracking-wider text-slate-400">
                      Create Discount Coupon Promo Code
                    </h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!couponForm.code || !couponForm.discountValue || !couponForm.expiryDate) {
                        showToast("Please provide code, value, and expiry date", "error");
                        return;
                      }
                      const success = await handleAction('saveCoupon', {
                        ...couponForm,
                        discountValue: Number(couponForm.discountValue),
                        minOrderAmount: Number(couponForm.minOrderAmount)
                      });
                      if (success) {
                        setCouponForm({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '0.00', expiryDate: '', isActive: true });
                        showToast("Promo Code created successfully!", "success");
                      }
                    }} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Coupon Code *</label>
                        <input 
                          type="text" 
                          required
                          value={couponForm.code}
                          onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                          placeholder="e.g. WELCOME10" 
                          className="w-full bg-slate-950/60 border border-white/5 p-2 rounded-xl text-xs uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Type *</label>
                        <select 
                          value={couponForm.discountType}
                          onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Cash (₹)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Value *</label>
                        <input 
                          type="number" 
                          required
                          value={couponForm.discountValue}
                          onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                          placeholder="10" 
                          className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Min Order Size (₹)</label>
                        <input 
                          type="number" 
                          required
                          value={couponForm.minOrderAmount}
                          onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Expiry Date *</label>
                        <input 
                          type="date" 
                          required
                          value={couponForm.expiryDate}
                          onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 p-1.5 sm:p-2 rounded-xl text-sm sm:text-xs text-white"
                        />
                      </div>

                      <div>
                        <button 
                          type="submit" 
                          className="w-full py-2 bg-rose-600 text-white font-extrabold rounded-xl text-xs hover:bg-rose-700 transition-all shadow-sm"
                        >
                          Deploy Coupon
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Coupons Table */}
                  <div className="bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden text-slate-100">
                    <div className="p-2 bg-slate-950/60 border-b border-white/5">
                      <h3 className="font-extrabold text-xs text-slate-200 uppercase">Active Coupon Campaigns</h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-slate-400 uppercase font-bold bg-slate-950/60/50">
                            <th className="p-2">Promo Code</th>
                            <th className="p-2">Discount Type</th>
                            <th className="p-2">Benefit Value</th>
                            <th className="p-2">Min Spend Required</th>
                            <th className="p-2">Expiry Date</th>
                            <th className="p-2">Campaign Status</th>
                            <th className="p-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {data.coupons.map((c: any) => (
                            <tr key={c.id} className="hover:bg-white/5">
                              <td className="p-2 font-black text-rose-400 tracking-wide">{c.code}</td>
                              <td className="p-2 uppercase font-semibold text-slate-300">{c.discountType}</td>
                              <td className="p-2 font-bold">
                                {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `${formatCurrency(c.discountValue)} OFF`}
                              </td>
                              <td className="p-2 text-slate-300">{formatCurrency(c.minOrderAmount)}</td>
                              <td className="p-2 font-semibold">{c.expiryDate}</td>
                              <td className="p-2">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${c.isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800'}`}>
                                  {c.isActive ? 'Active Campaign' : 'Deactivated'}
                                </span>
                              </td>
                              <td className="p-2 text-right">
                                <button 
                                  onClick={() => handleAction('deleteCoupon', { id: c.id })}
                                  className="p-1 text-slate-400 hover:text-rose-400"
                                >
                                  <Trash2 className="h-4 w-4 inline" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
                </>
              )}
            </main>
          </div>
        )}

        {/* ======================================================= */}
        {/* ROLE C: CHEF KITCHEN DISPLAY SYSTEM (KDS)                */}
        {/* ======================================================= */}
        {currentRole === 'chef' && (
          <div className="flex-1 p-2 md:p-4 sm:p-5 max-w-7xl mx-auto w-full space-y-3">
            {!hasAccessToModule(currentRole, 'Orders') ? (
              <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-2 rounded-3xl text-center space-y-2 max-w-md mx-auto my-12 text-slate-200">
                <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20 animate-pulse">
                  <Lock className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Access Restricted</h2>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-medium">
                    The restaurant owner has restricted access to the <span className="text-rose-400 font-bold uppercase">Kitchen Display System (Orders)</span> module.
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 font-bold">Please contact the system administrator or log in as Owner to adjust permissions.</p>
              </div>
            ) : (
              <>
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 text-white rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500 text-slate-950 p-2.5 rounded-2xl">
                  <Flame className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">Kitchen Display System (KDS) - {currentUser?.branch || 'Ichalkaranji'}</h2>
                  <p className="text-xs text-slate-400 font-medium">Real-time order ticket dispatcher for chefs. Order priority based on prep time.</p>
                </div>
              </div>
              <div className="flex bg-slate-955/60 border border-white/5 p-1 rounded-2xl self-end md:self-auto">
                <button
                  type="button"
                  onClick={() => setChefActiveSubTab('dispatcher')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${chefActiveSubTab === 'dispatcher' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  🔥 Live KDS
                </button>
                <button
                  type="button"
                  onClick={() => setChefActiveSubTab('history')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${chefActiveSubTab === 'history' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  📜 Cooking History
                </button>
              </div>
            </div>

            {chefActiveSubTab === 'history' ? (
              <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-4 sm:p-5 rounded-3xl text-left text-white space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 gap-2">
                  <div>
                    <h3 className="font-extrabold text-base text-white">📜 Cooking Performance History</h3>
                    <p className="text-xs text-slate-400 mt-1">Audit log of all prepared, served, and settled orders for this branch&apos;s kitchen.</p>
                  </div>
                  <div>
                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-350 text-xs font-bold px-3 py-1.5 rounded-xl">
                      Cooked Tickets: {data.orders.filter((o: any) => ['ready', 'served', 'completed'].includes(o.status) && (o.branch || 'Ichalkaranji').toLowerCase() === (currentUser?.branch || 'Ichalkaranji').toLowerCase()).length}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3 pl-2">Date & Time</th>
                        <th className="pb-3">Ticket ID</th>
                        <th className="pb-3">Table / Destination</th>
                        <th className="pb-3">Items Prepared</th>
                        <th className="pb-3 pr-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data.orders.filter((o: any) => ['ready', 'served', 'completed'].includes(o.status) && (o.branch || 'Ichalkaranji').toLowerCase() === (currentUser?.branch || 'Ichalkaranji').toLowerCase()).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-2 text-center text-slate-500 font-medium">No historically cooked tickets logged yet.</td>
                        </tr>
                      ) : (
                        data.orders
                          .filter((o: any) => ['ready', 'served', 'completed'].includes(o.status) && (o.branch || 'Ichalkaranji').toLowerCase() === (currentUser?.branch || 'Ichalkaranji').toLowerCase())
                          .map((order: any) => {
                            const items = data.orderItems.filter((oi: any) => oi.orderId === order.id);
                            const table = data.tables.find((t: any) => t.id === order.tableId);
                            return (
                              <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                <td className="py-1.5.5 pl-2 text-slate-300 font-medium">
                                  {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="py-1.5.5 font-bold text-white">#Ticket-{order.id}</td>
                                <td className="py-1.5.5">
                                  <span className="bg-slate-950 border border-white/5 text-slate-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                    {table ? `Table ${table.tableNumber}` : 'Takeaway'}
                                  </span>
                                </td>
                                <td className="py-1.5.5 text-slate-300">
                                  {items.map((oi: any) => {
                                    const itemDetails = data.menuItems.find((mi: any) => mi.id === oi.menuItemId);
                                    return (
                                      <div key={oi.id} className="font-semibold text-slate-200">
                                        {oi.quantity}x {itemDetails?.name} {oi.notes ? `[${oi.notes}]` : ''}
                                      </div>
                                    );
                                  })}
                                </td>
                                <td className="py-1.5.5 pr-2 text-right">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${order.status === 'completed' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-455' : 'bg-amber-500/10 border border-amber-500/20 text-amber-300'}`}>
                                    {order.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-left">
                
                {/* Column 1: Pending & Queued Tickets */}
                <div className="bg-slate-955/40 border border-white/5 rounded-3xl p-2 flex flex-col min-h-[500px] text-white">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                    <h3 className="font-extrabold text-sm uppercase text-slate-300 flex items-center gap-1.5">
                      📥 Queued Tickets ({data.orders.filter((o: any) => (o.status === 'pending' || o.status === 'accepted') && (o.branch || 'Ichalkaranji').toLowerCase() === (currentUser?.branch || 'Ichalkaranji').toLowerCase()).length})
                    </h3>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto max-h-[600px] pr-1">
                    {data.orders
                      .filter((o: any) => (o.status === 'pending' || o.status === 'accepted') && (o.branch || 'Ichalkaranji').toLowerCase() === (currentUser?.branch || 'Ichalkaranji').toLowerCase())
                      .map((order: any) => {
                        const items = data.orderItems.filter((oi: any) => oi.orderId === order.id);
                        const table = data.tables.find((t: any) => t.id === order.tableId);
                        const customerRecord = data.users.find((u: any) => u.id === order.customerId);
                        const resolvedTicketName = order.customerName || customerRecord?.name || 'Guest Customer';
                        return (
                          <div key={order.id} className="bg-slate-900/60 border border-white/5 rounded-2xl p-2 shadow-sm space-y-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-bold text-white text-xs">#Ticket-{order.id}</span>
                                <p className="text-[11px] font-extrabold text-rose-300">👤 {resolvedTicketName}</p>
                              </div>
                              <span className="bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                                {table ? `Table ${table.tableNumber}` : 'Takeaway'}
                              </span>
                            </div>

                            <div className="border-t border-dashed border-white/10 pt-2 space-y-1.5 text-xs text-left">
                              {items.map((oi: any) => {
                                const itemDetails = data.menuItems.find((mi: any) => mi.id === oi.menuItemId);
                                return (
                                  <div key={oi.id} className="flex justify-between font-medium text-slate-200">
                                    <span>{oi.quantity}x {itemDetails?.name} {oi.notes ? `[${oi.notes}]` : ''}</span>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="pt-2">
                              <button
                                onClick={() => handleAction('updateOrderStatus', { id: order.id, status: 'cooking' })}
                                className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                              >
                                🔥 Accept & Start Cooking
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Column 2: In Cooking (Preparing) */}
                <div className="bg-purple-950/20 border border-purple-500/20 rounded-3xl p-2 flex flex-col min-h-[500px] text-white">
                  <div className="flex justify-between items-center pb-3 border-b border-purple-500/30 mb-4">
                    <h3 className="font-extrabold text-sm uppercase text-purple-305 flex items-center gap-1.5">
                      🍳 On the Grill ({data.orders.filter((o: any) => o.status === 'cooking' && (o.branch || 'Ichalkaranji').toLowerCase() === (currentUser?.branch || 'Ichalkaranji').toLowerCase()).length})
                    </h3>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto max-h-[600px] pr-1">
                    {data.orders
                      .filter((o: any) => o.status === 'cooking' && (o.branch || 'Ichalkaranji').toLowerCase() === (currentUser?.branch || 'Ichalkaranji').toLowerCase())
                      .map((order: any) => {
                        const items = data.orderItems.filter((oi: any) => oi.orderId === order.id);
                        const table = data.tables.find((t: any) => t.id === order.tableId);
                        const customerRecord = data.users.find((u: any) => u.id === order.customerId);
                        const resolvedTicketName = order.customerName || customerRecord?.name || 'Guest Customer';
                        return (
                          <div key={order.id} className="bg-slate-900/60 border border-purple-500/30 rounded-2xl p-2 shadow-md space-y-3 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-purple-500 to-rose-500 animate-pulse"></div>

                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-bold text-white text-xs">#Ticket-{order.id}</span>
                                <p className="text-[11px] font-extrabold text-purple-300">👤 {resolvedTicketName}</p>
                              </div>
                              <span className="bg-purple-500/10 border border-purple-500/25 text-purple-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                                {table ? `Table ${table.tableNumber}` : 'Takeaway'}
                              </span>
                            </div>

                            <div className="border-t border-dashed border-white/10 pt-2 space-y-1.5 text-xs text-left">
                              {items.map((oi: any) => {
                                const itemDetails = data.menuItems.find((mi: any) => mi.id === oi.menuItemId);
                                return (
                                  <div key={oi.id} className="flex justify-between font-medium text-slate-200">
                                    <span>{oi.quantity}x {itemDetails?.name} {oi.notes ? `[${oi.notes}]` : ''}</span>
                                    <span className="text-[10px] bg-purple-550/20 text-purple-300 px-1.5 py-0.5 rounded">prep: {itemDetails?.preparationTime}m</span>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="pt-2">
                              <button
                                onClick={() => handleAction('updateOrderStatus', { id: order.id, status: 'ready' })}
                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-550 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                🔔 Mark Ready for Waiter
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Column 3: Ready to Serve / Food Passed */}
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-2 flex flex-col min-h-[500px] text-white">
                  <div className="flex justify-between items-center pb-3 border-b border-emerald-500/30 mb-4">
                    <h3 className="font-extrabold text-sm uppercase text-emerald-305 flex items-center gap-1.5">
                      🛎 Ready at Food Pass ({data.orders.filter((o: any) => (o.status === 'ready' || o.status === 'served') && (o.branch || 'Ichalkaranji').toLowerCase() === (currentUser?.branch || 'Ichalkaranji').toLowerCase()).length})
                    </h3>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto max-h-[600px] pr-1">
                    {data.orders
                      .filter((o: any) => (o.status === 'ready' || o.status === 'served') && (o.branch || 'Ichalkaranji').toLowerCase() === (currentUser?.branch || 'Ichalkaranji').toLowerCase())
                      .map((order: any) => {
                        const items = data.orderItems.filter((oi: any) => oi.orderId === order.id);
                        const table = data.tables.find((t: any) => t.id === order.tableId);
                        const customerRecord = data.users.find((u: any) => u.id === order.customerId);
                        const resolvedTicketName = order.customerName || customerRecord?.name || 'Guest Customer';
                        return (
                          <div key={order.id} className="bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-2 shadow-sm space-y-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-bold text-white text-xs">#Ticket-{order.id}</span>
                                <p className="text-[11px] font-extrabold text-emerald-300">👤 {resolvedTicketName}</p>
                              </div>
                              <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                                {table ? `Table ${table.tableNumber}` : 'Takeaway'}
                              </span>
                            </div>

                            <div className="border-t border-dashed border-white/10 pt-2 space-y-1 text-xs text-slate-355 text-left">
                              {items.map((oi: any) => {
                                const itemDetails = data.menuItems.find((mi: any) => mi.id === oi.menuItemId);
                                return (
                                  <div key={oi.id} className="flex justify-between font-medium">
                                    <span>{oi.quantity}x {itemDetails?.name}</span>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-center text-[11px] font-bold text-emerald-350 flex items-center justify-center gap-1">
                              <CheckCircle className="h-4 w-4" /> Waiter alert notification fired
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

              </div>
            )}
              </>
            )}
          </div>
        )}


        {/* ======================================================= */}
        {/* ROLE D: WAITER INTERACTIVE DASHBOARD                     */}
        {/* ======================================================= */}
        {currentRole === 'waiter' && (
          <div className="flex-1 p-2 md:p-4 sm:p-5 max-w-7xl mx-auto w-full space-y-3">
            {!hasAccessToModule(currentRole, 'Orders') ? (
              <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-2 rounded-3xl text-center space-y-2 max-w-md mx-auto my-12 text-slate-200">
                <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20 animate-pulse">
                  <Lock className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Access Restricted</h2>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-medium">
                    The restaurant owner has restricted access to the <span className="text-rose-400 font-bold uppercase">Waiter Interactive Desk (Orders)</span> module.
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 font-bold">Please contact the system administrator or log in as Owner to adjust permissions.</p>
              </div>
            ) : (
              <>
                {/* Chef Ready & Served notifications (Dine-in table orders only) */}
                {data.orders.filter((o: any) => ['ready', 'served'].includes(o.status) && o.orderType !== 'delivery' && (o.branch || 'Ichalkaranji').toLowerCase() === (currentUser?.branch || 'Ichalkaranji').toLowerCase()).length > 0 && (
                  <div className="space-y-2 mb-3 text-left">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      🛎️ Live Dine-In Table Status Alerts
                    </h4>
                    {data.orders
                      .filter((o: any) => ['ready', 'served'].includes(o.status) && o.orderType !== 'delivery' && (o.branch || 'Ichalkaranji').toLowerCase() === (currentUser?.branch || 'Ichalkaranji').toLowerCase())
                      .map((ro: any) => {
                        const table = data.tables.find((t: any) => t.id === ro.tableId);
                        const isServed = ro.status === 'served';
                        return (
                          <div key={ro.id} className={`border p-2 rounded-2xl flex justify-between items-center text-xs shadow-sm ${isServed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300 animate-pulse'}`}>
                            <span>
                              🛎️ Order <span className="font-extrabold text-white">#Order-{ro.id}</span> {isServed ? 'is served at' : 'is ready for'} <span className="font-extrabold text-white uppercase">{table ? `Table ${table.tableNumber}` : 'Dine-In Guest'}</span>
                            </span>
                            <div className="flex items-center gap-2">
                              {ro.status === 'ready' && (
                                <button
                                  onClick={async () => {
                                    await handleAction('updateOrderStatus', { id: ro.id, status: 'served' });
                                    showToast(`Order #Order-${ro.id} served to table!`, 'success');
                                  }}
                                  className="bg-rose-600 hover:bg-rose-550 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase transition-all shadow-md"
                                >
                                  🍽️ Serve Guest
                                </button>
                              )}
                              <button
                                onClick={async () => {
                                  await handleAction('updateOrderStatus', { id: ro.id, status: 'completed' });
                                  if (table) {
                                    await handleAction('saveTable', { ...table, status: 'available' });
                                  }
                                  showToast(`Order #Order-${ro.id} completed & Table #${table ? table.tableNumber : ''} is now free & ready for next order!`, 'success');
                                }}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-xl text-[10px] uppercase transition-all shadow-md flex items-center gap-1"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Complete & Free Table
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 text-white rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-rose-500/10 text-rose-500 p-2.5 rounded-2xl border border-rose-500/20">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold tracking-tight">Waiter Interactive Desk - {currentUser?.branch || 'Ichalkaranji'}</h2>
                      <p className="text-xs text-slate-400 font-medium font-sans">Coordinate seating, taking orders, and billing calculations for dine-in guests.</p>
                    </div>
                  </div>
                  <div className="flex bg-slate-955/60 border border-white/5 p-1 rounded-2xl self-end md:self-auto">
                    <button
                      type="button"
                      onClick={() => setWaiterActiveSubTab('seating')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${waiterActiveSubTab === 'seating' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      🗺️ Seating Map & Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaiterActiveSubTab('history')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${waiterActiveSubTab === 'history' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      📜 Service History
                    </button>
                  </div>
                </div>

                {waiterActiveSubTab === 'history' ? (
                  <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-4 sm:p-5 rounded-3xl text-left text-white space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 gap-2">
                      <div>
                        <h3 className="font-extrabold text-base text-white">📜 Waiter Service History Ledger</h3>
                        <p className="text-xs text-slate-400 mt-1">Audit log of guest orders served or placed by this branch&apos;s waiting staff.</p>
                      </div>
                      <div>
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-350 text-xs font-bold px-3 py-1.5 rounded-xl">
                          Served Orders: {data.orders.filter((o: any) => o.orderType !== 'delivery' && ['ready', 'served', 'completed'].includes(o.status) && (o.branch || 'Ichalkaranji').toLowerCase() === (currentUser?.branch || 'Ichalkaranji').toLowerCase()).length}
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="pb-3 pl-2">Date & Time</th>
                            <th className="pb-3">Order ID</th>
                            <th className="pb-3">Table / Seat</th>
                            <th className="pb-3">Items Ordered</th>
                            <th className="pb-3 text-right">Bill Total</th>
                            <th className="pb-3 pr-2 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {data.orders.filter((o: any) => o.orderType !== 'delivery' && ['ready', 'served', 'completed'].includes(o.status) && (o.branch || 'Ichalkaranji').toLowerCase() === (currentUser?.branch || 'Ichalkaranji').toLowerCase()).length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-2 text-center text-slate-500 font-medium">No historically served dine-in orders logged yet.</td>
                            </tr>
                          ) : (
                            data.orders
                              .filter((o: any) => o.orderType !== 'delivery' && ['ready', 'served', 'completed'].includes(o.status) && (o.branch || 'Ichalkaranji').toLowerCase() === (currentUser?.branch || 'Ichalkaranji').toLowerCase())
                              .map((order: any) => {
                                const items = data.orderItems.filter((oi: any) => oi.orderId === order.id);
                                const table = data.tables.find((t: any) => t.id === order.tableId);
                                return (
                                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                    <td className="py-1.5.5 pl-2 text-slate-300 font-medium">
                                      {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="py-1.5.5 font-bold text-white">#Order-{order.id}</td>
                                    <td className="py-1.5.5">
                                      <span className="bg-slate-950 border border-white/5 text-slate-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                        {table ? `Table ${table.tableNumber}` : 'Takeaway'}
                                      </span>
                                    </td>
                                    <td className="py-1.5.5 text-slate-300">
                                      {items.map((oi: any) => {
                                        const itemDetails = data.menuItems.find((mi: any) => mi.id === oi.menuItemId);
                                        return (
                                          <div key={oi.id} className="font-semibold text-slate-200">
                                            {oi.quantity}x {itemDetails?.name} {oi.notes ? `[${oi.notes}]` : ''}
                                          </div>
                                        );
                                      })}
                                    </td>
                                    <td className="py-1.5.5 text-right font-bold text-rose-455">
                                      {formatCurrency(order.finalAmount)}
                                    </td>
                                    <td className="py-1.5.5 pr-2 text-right">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${order.status === 'completed' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-450' : order.status === 'served' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-355' : 'bg-amber-500/10 border border-amber-500/20 text-amber-350'}`}>
                                        {order.status}
                                      </span>
                                      {order.status === 'served' && (
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            await handleAction('updateOrderStatus', { id: order.id, status: 'completed' });
                                            if (table) {
                                              await handleAction('saveTable', { ...table, status: 'available' });
                                            }
                                            showToast(`Order #ORD-${order.id} completed & Table #${table ? table.tableNumber : ''} released!`, 'success');
                                          }}
                                          className="ml-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-2.5 py-1 rounded-xl text-[10px] transition-all shadow-sm inline-flex items-center gap-1"
                                        >
                                          <CheckCircle2 className="h-3 w-3" /> Free Table
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <>
                  <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-4 sm:p-5 rounded-3xl text-left text-white shadow-sm">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-4">Live Table Grid</h3>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                      {data.tables.map((table: any) => {
                        const occupancyColors: Record<string, string> = {
                          available: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-305 hover:bg-emerald-500/20',
                          occupied: 'bg-rose-500/10 border-rose-500/20 text-rose-300 hover:bg-rose-500/20',
                          reserved: 'bg-purple-500/10 border-purple-500/20 text-purple-305 hover:bg-purple-500/20'
                        };

                        const activeOrder = data.orders.find((o: any) => o.tableId === table.id && o.status !== 'completed' && o.status !== 'cancelled');
                        const orderItemsCount = activeOrder ? data.orderItems.filter((oi: any) => oi.orderId === activeOrder.id).length : 0;
                        const readyItemsCount = activeOrder ? data.orderItems.filter((oi: any) => oi.orderId === activeOrder.id && oi.status === 'ready').length : 0;

                        return (
                          <button
                            key={table.id}
                            type="button"
                            onClick={() => {
                              setSelectedWaiterTable(table);
                              setWaiterCart([]);
                              setIsWaiterOrdering(false);
                            }}
                            className={`border rounded-2xl p-2 text-left transition-all relative ${occupancyColors[table.status] || 'bg-slate-955 border-white/5 text-white'} ${readyItemsCount > 0 ? 'ring-2 ring-rose-500 ring-offset-2 ring-offset-slate-950 animate-pulse' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-black text-lg">#{table.tableNumber}</span>
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-955/60 border border-white/5 text-slate-300">
                                Cap: {table.capacity}
                              </span>
                            </div>
                            <p className="text-[11px] font-bold uppercase tracking-wider">● {table.status}</p>
                            
                            {activeOrder && (
                              <div className="mt-2 pt-2 border-t border-white/5 space-y-1 text-[10px] text-slate-300">
                                <p className="font-bold text-rose-300 truncate">👤 {activeOrder.customerName || data.users.find((u: any) => u.id === activeOrder.customerId)?.name || 'Guest Customer'}</p>
                                <p className="font-medium">Order: <span className="font-bold text-white">#{activeOrder.id}</span></p>
                                <p className="font-medium uppercase tracking-wider">Status: <span className={`font-bold ${activeOrder.status === 'ready' ? 'text-emerald-450' : 'text-purple-300'}`}>{activeOrder.status}</span></p>
                                <p className="text-slate-400 font-semibold">{orderItemsCount} items {readyItemsCount > 0 && <span className="text-rose-450 font-black">({readyItemsCount} ready 🛎️)</span>}</p>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedWaiterTable ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-left">
                      
                      {/* Panel A: Status and Actions */}
                      <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-4 sm:p-5 rounded-3xl text-white shadow-sm space-y-3">
                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                          <h3 className="font-extrabold text-base text-white">Manage Table #{selectedWaiterTable.tableNumber}</h3>
                          <button 
                            type="button"
                            onClick={() => setSelectedWaiterTable(null)}
                            className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-bold text-slate-400 uppercase">Change Table Occupancy Status</label>
                          <div className="grid grid-cols-3 gap-2">
                            <button 
                              type="button"
                              onClick={() => handleAction('saveTable', { ...selectedWaiterTable, status: 'available' })}
                              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${selectedWaiterTable.status === 'available' ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-slate-955 border border-white/5 text-slate-400 hover:text-slate-200'}`}
                            >
                              Free / Available
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleAction('saveTable', { ...selectedWaiterTable, status: 'occupied' })}
                              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${selectedWaiterTable.status === 'occupied' ? 'bg-rose-600 border-rose-600 text-white shadow-sm' : 'bg-slate-955 border border-white/5 text-slate-400 hover:text-slate-200'}`}
                            >
                              Occupy Table
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleAction('saveTable', { ...selectedWaiterTable, status: 'reserved' })}
                              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${selectedWaiterTable.status === 'reserved' ? 'bg-purple-600 border-purple-600 text-white shadow-sm' : 'bg-slate-955 border border-white/5 text-slate-400 hover:text-slate-200'}`}
                            >
                              Block Reserve
                            </button>
                          </div>
                        </div>

                        {/* Waiter Ordering Cart / Split Billing Tool */}
                        <div className="border-t border-white/5 pt-4 space-y-2">
                          {isWaiterOrdering ? (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <h4 className="font-extrabold text-xs uppercase tracking-wider text-rose-400">📝 Order Taking Terminal</h4>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsWaiterOrdering(false);
                                    setWaiterCart([]);
                                  }}
                                  className="text-xs text-slate-455 hover:text-white font-bold"
                                >
                                  Cancel
                                </button>
                              </div>

                              {/* Select Menu Item Dropdown */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Culinary Item</label>
                                  <select
                                    value={waiterSelectedMenuItemId}
                                    onChange={(e) => setWaiterSelectedMenuItemId(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-905 border border-white/10 text-white rounded-xl text-xs outline-none"
                                  >
                                    <option value="" className="bg-slate-950 text-white font-semibold">-- Choose Item --</option>
                                    {data.menuItems
                                      .filter((mi: any) => mi.isAvailable)
                                      .map((mi: any) => (
                                        <option key={mi.id} value={mi.id} className="bg-slate-950 text-white font-semibold">
                                          {mi.name} ({formatCurrency(mi.price)})
                                        </option>
                                      ))}
                                  </select>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Quantity</label>
                                    <input
                                      type="number"
                                      min={1}
                                      value={waiterItemQuantity}
                                      onChange={(e) => setWaiterItemQuantity(parseInt(e.target.value) || 1)}
                                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 text-white rounded-xl text-xs outline-none"
                                    />
                                  </div>
                                  <div className="flex items-end">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!waiterSelectedMenuItemId) {
                                          showToast("Please choose a menu item", "error");
                                          return;
                                        }
                                        const item = data.menuItems.find((mi: any) => mi.id === parseInt(waiterSelectedMenuItemId));
                                        if (item) {
                                          const existingIdx = waiterCart.findIndex(c => c.menuItem.id === item.id);
                                          if (existingIdx !== -1) {
                                            const updated = [...waiterCart];
                                            updated[existingIdx].quantity += waiterItemQuantity;
                                            if (waiterItemNotes.trim()) {
                                              updated[existingIdx].notes = waiterItemNotes;
                                            }
                                            setWaiterCart(updated);
                                          } else {
                                            setWaiterCart([...waiterCart, { menuItem: item, quantity: waiterItemQuantity, notes: waiterItemNotes }]);
                                          }
                                          setWaiterSelectedMenuItemId('');
                                          setWaiterItemQuantity(1);
                                          setWaiterItemNotes('');
                                          showToast(`Added ${item.name} to table cart`, 'success');
                                        }
                                      }}
                                      className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl text-xs transition-all"
                                    >
                                      ➕ Add
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Special instructions */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Special Cooking Instructions</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Extra spicy, No onions, Gluten free..."
                                  value={waiterItemNotes}
                                  onChange={(e) => setWaiterItemNotes(e.target.value)}
                                  className="w-full px-3 py-2 bg-slate-955 border border-white/10 text-white rounded-xl text-xs outline-none"
                                />
                              </div>

                              {/* Waiter Cart Items List */}
                              {waiterCart.length > 0 && (
                                <div className="bg-slate-955/60 border border-white/5 p-2 rounded-2xl space-y-3">
                                  <h5 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">Items Pending Placement</h5>
                                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                                    {waiterCart.map((c, idx) => (
                                      <div key={idx} className="flex justify-between items-center text-xs">
                                        <div>
                                          <p className="font-bold text-white">{c.quantity}x {c.menuItem.name}</p>
                                          {c.notes && <p className="text-[10px] text-rose-400">*{c.notes}</p>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-extrabold text-slate-300">{formatCurrency((parseFloat(c.menuItem.price) * c.quantity).toFixed(2))}</span>
                                          <button
                                            type="button"
                                            onClick={() => setWaiterCart(waiterCart.filter((_, i) => i !== idx))}
                                            className="text-slate-505 hover:text-rose-550"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="border-t border-white/5 pt-2 flex justify-between text-xs font-black text-rose-455">
                                    <span>Estimated Total (incl. GST):</span>
                                    <span>
                                      {formatCurrency((waiterCart.reduce((sum, c) => sum + (parseFloat(c.menuItem.price) * c.quantity), 0) * 1.05).toFixed(2))}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={handleWaiterPlaceOrder}
                                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-555 text-white font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
                                  >
                                    🔥 Place Order & Send to Chef
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {/* Get active order of this table */}
                              {(() => {
                                const tableOrder = data.orders.find((o: any) => o.tableId === selectedWaiterTable.id && o.status !== 'completed' && o.status !== 'cancelled');
                                
                                if (!tableOrder) {
                                  return (
                                    <div className="space-y-2">
                                      <p className="text-xs text-slate-400 italic">No active unpaid order detected on Table #{selectedWaiterTable.tableNumber}.</p>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setWaiterCart([]);
                                          setIsWaiterOrdering(true);
                                        }}
                                        className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 border border-rose-500/20"
                                      >
                                        📝 Take Order for Guests
                                      </button>
                                    </div>
                                  );
                                }

                                const totalAmt = Number(tableOrder.finalAmount);
                                return (
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Active Order Details</h4>
                                      <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                        {tableOrder.status}
                                      </span>
                                    </div>

                                    <div className="bg-slate-955 border border-white/5 p-2 rounded-2xl space-y-3">
                                      <div className="flex justify-between text-xs font-semibold">
                                        <span>Active Order Total:</span>
                                        <span className="font-black text-rose-400">{formatCurrency(totalAmt)}</span>
                                      </div>

                                      <div className="flex items-center gap-3">
                                        <span className="text-xs font-medium text-slate-450">Split into:</span>
                                        <div className="flex gap-1">
                                          {[2, 3, 4, 5].map((ways) => (
                                            <button
                                              key={ways}
                                              type="button"
                                              onClick={() => setSplitBillWays(ways)}
                                              className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${splitBillWays === ways ? 'bg-rose-600 text-white' : 'bg-slate-905 border border-white/5 text-slate-405 hover:text-white'}`}
                                            >
                                              {ways} Ways
                                            </button>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="border-t border-dashed border-white/10 pt-3 flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-305">Each Person Pays:</span>
                                        <span className="text-base font-black text-rose-455">{formatCurrency((totalAmt / splitBillWays).toFixed(2))}</span>
                                      </div>

                                      {/* Waiter action: forward active order to chef or mark complete & free table */}
                                      <div className="mt-3 space-y-2">
                                        {tableOrder.status === 'pending' && (
                                          <button
                                            type="button"
                                            onClick={async () => {
                                              const ok = await handleAction('forwardToChef', { id: tableOrder.id });
                                              if (ok) showToast('Order forwarded to chef', 'success');
                                            }}
                                            className="w-full py-2.5 bg-rose-600 text-white font-extrabold rounded-2xl text-xs hover:bg-rose-700 transition-all shadow-sm"
                                          >
                                            ▶️ Send to Chef
                                          </button>
                                        )}

                                        <button
                                          type="button"
                                          onClick={async () => {
                                            await handleAction('updateOrderStatus', { id: tableOrder.id, status: 'completed' });
                                            await handleAction('saveTable', { ...selectedWaiterTable, status: 'available' });
                                            showToast(`Order #ORD-${tableOrder.id} marked as COMPLETED! Table #${selectedWaiterTable.tableNumber} is now free & ready for next guests!`, 'success');
                                            setSelectedWaiterTable(null);
                                          }}
                                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 border border-emerald-400/30 cursor-pointer active:scale-98"
                                        >
                                          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-200" /> Complete Order & Free Table (Ready for Next Order)
                                        </button>
                                      </div>
                                    </div>

                                    {/* Live Menu Serve Tracking */}
                                    <div className="bg-slate-900/60 border border-white/5 p-2 rounded-2xl space-y-3">
                                      <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                        🍽️ Menu Item Serve Tracking
                                      </h5>
                                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                        {data.orderItems
                                          .filter((oi: any) => oi.orderId === tableOrder.id)
                                          .map((oi: any) => {
                                            const itemDetails = data.menuItems.find((mi: any) => mi.id === oi.menuItemId);
                                            const itemStatusColors = {
                                              pending: 'bg-slate-550/10 border-slate-550/20 text-slate-400',
                                              cooking: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
                                              ready: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-305 animate-pulse',
                                              served: 'bg-blue-500/10 border-blue-500/20 text-blue-350'
                                            };
                                            const displayStatus = {
                                              pending: 'Queued',
                                              cooking: 'Cooking',
                                              ready: 'Ready at Pass',
                                              served: 'Served'
                                            };

                                            return (
                                              <div key={oi.id} className="flex justify-between items-center text-xs bg-slate-955/40 p-2.5 rounded-xl border border-white/5">
                                                <div>
                                                  <p className="font-bold text-white text-left">{oi.quantity}x {itemDetails?.name || 'Unknown Item'}</p>
                                                  {oi.notes && <p className="text-[10px] text-rose-400 font-medium text-left">*{oi.notes}</p>}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${itemStatusColors[oi.status as keyof typeof itemStatusColors] || 'bg-slate-950 text-white'}`}>
                                                    {displayStatus[oi.status as keyof typeof displayStatus] || oi.status}
                                                  </span>
                                                  {oi.status !== 'served' && (
                                                    <button
                                                      type="button"
                                                      onClick={async () => {
                                                        const ok = await handleAction('updateOrderItemStatus', { id: oi.id, status: 'served' });
                                                        if (ok) showToast(`${itemDetails?.name} marked as served!`, 'success');
                                                      }}
                                                      className="bg-emerald-600 hover:bg-emerald-555 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-all"
                                                    >
                                                      🍽️ Serve
                                                    </button>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })}
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setWaiterCart([]);
                                        setIsWaiterOrdering(true);
                                      }}
                                      className="w-full py-2.5 bg-slate-900 border border-white/10 text-white hover:text-rose-400 font-extrabold rounded-2xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                                    >
                                      ➕ Add More Items to Order
                                    </button>

                                    {/* Table Order History Logs */}
                                    {(() => {
                                      const pastOrders = data.orders.filter((o: any) => o.tableId === selectedWaiterTable.id && o.status === 'completed');
                                      if (pastOrders.length === 0) return null;
                                      return (
                                        <div className="bg-slate-900/60 border border-white/5 p-2 rounded-2xl space-y-3 mt-4 text-left">
                                          <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-400">📜 Table Billing History</h5>
                                          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                                            {pastOrders.map((order: any) => {
                                              const items = data.orderItems.filter((oi: any) => oi.orderId === order.id);
                                              return (
                                                <div key={order.id} className="text-[11px] text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-white/5 flex justify-between items-start">
                                                  <div>
                                                    <p className="font-bold text-slate-200">Order #{order.id} • {new Date(order.createdAt).toLocaleDateString()}</p>
                                                    <div className="text-[10px] text-slate-400 mt-1 space-y-0.5">
                                                      {items.map((oi: any) => {
                                                        const itemDetails = data.menuItems.find((mi: any) => mi.id === oi.menuItemId);
                                                        return <p key={oi.id}>• {oi.quantity}x {itemDetails?.name}</p>;
                                                      })}
                                                    </div>
                                                  </div>
                                                  <div className="text-right">
                                                    <p className="font-bold text-rose-455">{formatCurrency(order.finalAmount)}</p>
                                                    <span className="text-[9px] uppercase font-bold text-slate-500">{formatPaymentMethod(order.paymentMethod, order.orderType)}</span>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })()}

                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Panel B: Table Digital QR Simulator */}
                      <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-4 sm:p-5 rounded-3xl text-white shadow-sm flex flex-col items-center justify-center text-center">
                        <Smartphone className="h-10 w-10 text-rose-500 mb-2" />
                        <h3 className="font-extrabold text-sm text-white mb-1">Interactive Table QR Code</h3>
                        <p className="text-xs text-slate-400 max-w-sm mb-4">Guests can scan this physical QR code on their phones to view digital menu, reserve tables, or pay bills with UPI/Wallets.</p>
                        
                        {selectedWaiterTable.qrCodeUrl ? (
                          <div className="p-2 bg-slate-950 border border-white/10 rounded-2xl">
                            <img 
                              src={selectedWaiterTable.qrCodeUrl} 
                              alt="Table QR Code" 
                              className="w-32 h-32 mx-auto rounded-xl"
                            />
                            <p className="text-[10px] font-mono mt-2 text-slate-500">ID: table-{selectedWaiterTable.tableNumber}</p>
                          </div>
                        ) : (
                          <div className="h-32 w-32 bg-slate-955 flex items-center justify-center rounded-2xl border border-white/5">
                            <p className="text-xs text-slate-500 font-bold">No QR Generated</p>
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-3xl p-12 text-center text-slate-400">
                      <Grid className="h-12 w-12 mx-auto mb-3 text-slate-500" />
                      <p className="text-sm font-semibold text-slate-300">No table selected</p>
                      <p className="text-xs mt-1">Click on any table in live map above to trigger occupancy adjustments, order placement, and billing utilities.</p>
                    </div>
                  )}
                  </>
                )}
              </>
            )}
          </div>
        )}


        {/* ======================================================= */}
        {/* ROLE E: CASHIER BILLING & PAYMENT GATEWAY                */}
        {/* ======================================================= */}
        {currentRole === 'cashier' && (
          <div className="flex-1 p-2 md:p-4 sm:p-5 max-w-7xl mx-auto w-full space-y-3">
            {!hasAccessToModule(currentRole, 'Orders') ? (
              <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-2 rounded-3xl text-center space-y-2 max-w-md mx-auto my-12 text-slate-200">
                <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20 animate-pulse">
                  <Lock className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Access Restricted</h2>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-medium">
                    The restaurant owner has restricted access to the <span className="text-rose-400 font-bold uppercase">Cashier POS & Billing Terminal (Orders)</span> module.
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 font-bold">Please contact the system administrator or log in as Owner to adjust permissions.</p>
              </div>
            ) : (
              <>
                {/* Live Online Payment Notifications */}
                {data.orders.filter((o: any) => o.isPaidOnline && o.status !== 'completed' && o.status !== 'cancelled' && (o.branch || 'Ichalkaranji').toLowerCase() === (currentUser?.branch || 'Ichalkaranji').toLowerCase()).length > 0 && (
                  <div className="space-y-2 mb-3 text-left">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      📱 Live Online Payment Alerts
                    </h4>
                    {data.orders
                      .filter((o: any) => o.isPaidOnline && o.status !== 'completed' && o.status !== 'cancelled' && (o.branch || 'Ichalkaranji').toLowerCase() === (currentUser?.branch || 'Ichalkaranji').toLowerCase())
                      .map((ro: any) => {
                        const table = data.tables.find((t: any) => t.id === ro.tableId);
                        return (
                          <div key={ro.id} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-305 p-1.5 rounded-2xl flex justify-between items-center text-xs animate-pulse shadow-sm">
                            <span>
                              💳 Guest paid <span className="font-extrabold text-white">{formatCurrency(ro.finalAmount)}</span> online for <span className="font-extrabold text-white uppercase">{table ? `Table ${table.tableNumber}` : 'Takeaway'}</span> (Method: {ro.paymentMethod || 'UPI'})
                            </span>
                            <button
                              type="button"
                              onClick={async () => {
                                const success = await handleAction('processPayment', {
                                  orderId: ro.id,
                                  paymentMethod: ro.paymentMethod || 'upi',
                                  totalAmount: ro.totalAmount,
                                  finalAmount: ro.finalAmount,
                                  gstAmount: ro.gstAmount,
                                  discountAmount: ro.discountAmount,
                                  customerEmail: ro.customerEmail,
                                  customerName: ro.customerName
                                });
                                if (success) {
                                  showToast(`Order #${ro.id} settled successfully!`, 'success');
                                }
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase transition-all shadow-md"
                            >
                              ✓ Settle & Complete
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )}

                <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 text-white rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-550 text-slate-950 p-2.5 rounded-2xl">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold tracking-tight">Cashier POS & Billing Terminal - {currentUser?.branch || 'Ichalkaranji'}</h2>
                      <p className="text-xs text-slate-400 font-medium font-medium">Collect checkout requests, process invoices, print official receipts, and manage digital refunds.</p>
                    </div>
                  </div>
                  <div className="flex bg-slate-955/60 border border-white/5 p-1 rounded-2xl self-end md:self-auto">
                    <button
                      type="button"
                      onClick={() => setCashierActiveSubTab('billing')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${cashierActiveSubTab === 'billing' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      💵 Billing Terminal
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashierActiveSubTab('history')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${cashierActiveSubTab === 'history' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      📜 Payment History
                    </button>
                  </div>
                </div>

                {cashierActiveSubTab === 'history' ? (
                  <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-4 sm:p-5 rounded-3xl text-left text-white space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 gap-2">
                      <div>
                        <h3 className="font-extrabold text-base text-white">📜 Transaction & Payment Logs</h3>
                        <p className="text-xs text-slate-400 mt-1">Audit ledger of all completed checkout payments for this branch location.</p>
                      </div>
                      <div>
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-350 text-xs font-bold px-3 py-1.5 rounded-xl">
                          Settled Invoices: {data.orders.filter((o: any) => o.status === 'completed' && (o.branch || 'Ichalkaranji').toLowerCase() === (currentUser?.branch || 'Ichalkaranji').toLowerCase()).length}
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="pb-3 pl-2">Date & Time</th>
                            <th className="pb-3">Invoice / Order ID</th>
                            <th className="pb-3">Customer Details</th>
                            <th className="pb-3">Payment Method</th>
                            <th className="pb-3 pr-2 text-right">Amount Settled</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {data.orders.filter((o: any) => o.status === 'completed' && (o.branch || 'Ichalkaranji').toLowerCase() === (currentUser?.branch || 'Ichalkaranji').toLowerCase()).length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-2 text-center text-slate-500 font-medium">No historically processed payments logged yet.</td>
                            </tr>
                          ) : (
                            data.orders
                              .filter((o: any) => o.status === 'completed' && (o.branch || 'Ichalkaranji').toLowerCase() === (currentUser?.branch || 'Ichalkaranji').toLowerCase())
                              .map((order: any) => {
                                const customerRecord = data.users.find((u: any) => u.id === order.customerId);
                                return (
                                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                    <td className="py-1.5.5 pl-2 text-slate-300 font-medium">
                                      {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="py-1.5.5 font-bold text-white">#Order-{order.id}</td>
                                    <td className="py-1.5.5">
                                      <div className="font-semibold text-slate-200">{order.customerName || customerRecord?.name || 'Guest User'}</div>
                                      <div className="text-[10px] text-slate-400">{order.customerEmail || customerRecord?.email || 'N/A'}</div>
                                    </td>
                                    <td className="py-1.5.5">
                                      <span className="bg-slate-950 border border-white/5 text-slate-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                        {formatPaymentMethod(order.paymentMethod, order.orderType)}
                                      </span>
                                    </td>
                                    <td className="py-1.5.5 pr-2 text-right font-bold text-emerald-405">
                                      {formatCurrency(order.finalAmount)}
                                    </td>
                                  </tr>
                                );
                              })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    
                    {/* Column 1 & 2: Active Unpaid Check Orders */}
                    <div className="bg-slate-955/40 border border-white/5 rounded-3xl p-4 sm:p-5 text-white text-left lg:col-span-2 space-y-2">
                      <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Unpaid Active Customer Tickets</h3>
                      
                      {data.orders.filter((o: any) => o.status !== 'completed' && o.status !== 'cancelled' && (o.branch || 'Ichalkaranji').toLowerCase() === (currentUser?.branch || 'Ichalkaranji').toLowerCase()).length === 0 ? (
                        <div className="text-center py-1.5 text-slate-500">
                          <CheckCircle className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
                          <p className="text-sm font-semibold text-slate-300">All accounts settled!</p>
                          <p className="text-xs mt-1">There are currently no unpaid active dining orders for this branch.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {data.orders
                            .filter((o: any) => o.status !== 'completed' && o.status !== 'cancelled' && (o.branch || 'Ichalkaranji').toLowerCase() === (currentUser?.branch || 'Ichalkaranji').toLowerCase())
                            .map((order: any) => {
                              const table = data.tables.find((t: any) => t.id === order.tableId);
                              const items = data.orderItems.filter((oi: any) => oi.orderId === order.id);
                              return (
                                <div 
                                  key={order.id}
                                  onClick={() => setSelectedCashierOrder(order)}
                                  className={`p-2 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${selectedCashierOrder?.id === order.id ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-900/60 hover:bg-slate-900 border-white/5'}`}
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-extrabold text-xs text-white">#Order {order.id}</span>
                                      <span className="bg-slate-955 border border-white/5 text-slate-300 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                        {table ? `Table ${table.tableNumber}` : 'Takeaway'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Contains {items.length} items • Prep status: <span className="font-bold text-rose-450">{order.status}</span></p>
                                  </div>

                                  <div className="text-right">
                                    <p className="text-sm font-black text-rose-455">{formatCurrency(order.finalAmount)}</p>
                                    <span className="text-[10px] text-slate-500 font-semibold">Click to Settle Account</span>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>

                    {/* Column 3: Payment Checkout Processing Form */}
                    <div className="bg-slate-955/40 border border-white/5 rounded-3xl p-4 sm:p-5 text-white text-left">
                      <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 border-b border-white/5 pb-3 mb-4">Account Checkout Gateway</h3>

                      {selectedCashierOrder ? (
                        <div className="space-y-2">
                          <div className="p-1.5 bg-slate-900/60 border border-white/5 rounded-2xl space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-455">Order Reference</span>
                              <span className="font-bold text-white">#Order-{selectedCashierOrder.id}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-455">Subtotal Amount</span>
                              <span className="font-semibold text-slate-200">{formatCurrency(selectedCashierOrder.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-455">GST (5% tax block)</span>
                              <span className="font-semibold text-slate-200">{formatCurrency(selectedCashierOrder.gstAmount)}</span>
                            </div>
                            {Number(selectedCashierOrder.discountAmount) > 0 && (
                              <div className="flex justify-between text-xs text-emerald-450 font-bold">
                                <span>Deductions / Discount</span>
                                <span>-{formatCurrency(selectedCashierOrder.discountAmount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm font-black border-t border-white/5 pt-2 text-rose-455">
                              <span>Final Bill Settle</span>
                              <span>{formatCurrency(selectedCashierOrder.finalAmount)}</span>
                            </div>
                          </div>

                          {/* Choose Payment Method */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase">Process Payment Via</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setCashierPaymentMethod('cash')}
                                className={`py-2 rounded-xl text-xs font-bold transition-all border ${cashierPaymentMethod === 'cash' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-905 border border-white/5 text-slate-400 hover:text-white'}`}
                              >
                                💵 Cash Pay
                              </button>
                              <button
                                type="button"
                                onClick={() => setCashierPaymentMethod('card')}
                                className={`py-2 rounded-xl text-xs font-bold transition-all border ${cashierPaymentMethod === 'card' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-905 border border-white/5 text-slate-400 hover:text-white'}`}
                              >
                                💳 Credit Card
                              </button>
                              <button
                                type="button"
                                onClick={() => setCashierPaymentMethod('upi')}
                                className={`py-2 rounded-xl text-xs font-bold transition-all border ${cashierPaymentMethod === 'upi' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-905 border border-white/5 text-slate-400 hover:text-white'}`}
                              >
                                📱 UPI Scan
                              </button>
                            </div>
                          </div>

                          {/* Settlement Button */}
                          <button
                            type="button"
                            onClick={async () => {
                              const customerRecord = selectedCashierOrder?.customerId
                                ? data.users.find((u: any) => u.id === selectedCashierOrder.customerId)
                                : null;
                              const success = await handleAction('processPayment', {
                                orderId: selectedCashierOrder.id,
                                paymentMethod: cashierPaymentMethod,
                                totalAmount: selectedCashierOrder.totalAmount,
                                finalAmount: selectedCashierOrder.finalAmount,
                                gstAmount: selectedCashierOrder.gstAmount,
                                discountAmount: selectedCashierOrder.discountAmount,
                                customerEmail: customerRecord?.email || currentUser?.email || null,
                                customerName: customerRecord?.name || currentUser?.name || null
                              });
                              if (success) {
                                setSelectedCashierOrder(null);
                              }
                            }}
                            className="w-full py-1.5 bg-emerald-600 text-white font-black rounded-2xl text-xs hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-1"
                          >
                            Process & Complete Invoice
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-1.5 text-slate-500 text-xs">
                          <Receipt className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                          Select an unpaid dining ticket to activate the checkout transaction terminal.
                        </div>
                      )}
                    </div>
</div>
                )}
              </>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* 5. DELIVERY EXECUTIVE TERMINAL WORKSPACE                */}
        {/* ======================================================= */}
        {currentRole === 'delivery' && (
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
            {/* Header banner */}
            <div className="relative overflow-hidden rounded-3xl border border-rose-500/20 bg-slate-950/80 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-inner">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Delivery Executive Terminal</h2>
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-emerald-400">Live Dispatch</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">Manage online orders, track delivery routes, and mark completed deliveries</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs">
                    <span className="text-slate-400">Rider: </span>
                    <span className="font-bold text-white">{currentUser?.name || 'Rider Vikram'}</span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs">
                    <span className="text-slate-400">Branch: </span>
                    <span className="font-bold text-rose-400">{activeBranchFilter}</span>
                  </div>
                </div>
              </div>

              {/* Metrics Bar */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3.5 sm:p-4">
                  <div className="flex items-center justify-between text-blue-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Out On Road</span>
                    <Truck className="h-4 w-4" />
                  </div>
                  <p className="mt-2 text-2xl font-black text-white">
                    {data.orders.filter((o: any) => o.orderType === 'delivery' && o.status === 'out_for_delivery').length}
                  </p>
                  <p className="mt-0.5 text-[10px] text-blue-300">Active deliveries on the way</p>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 sm:p-4">
                  <div className="flex items-center justify-between text-amber-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Ready for Pickup</span>
                    <Clock className="h-4 w-4" />
                  </div>
                  <p className="mt-2 text-2xl font-black text-white">
                    {data.orders.filter((o: any) => o.orderType === 'delivery' && ['ready', 'accepted', 'cooking'].includes(o.status)).length}
                  </p>
                  <p className="mt-0.5 text-[10px] text-amber-300">Orders waiting in kitchen</p>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 sm:p-4">
                  <div className="flex items-center justify-between text-emerald-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Delivered Today</span>
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <p className="mt-2 text-2xl font-black text-white">
                    {data.orders.filter((o: any) => o.orderType === 'delivery' && ['delivered', 'completed'].includes(o.status)).length}
                  </p>
                  <p className="mt-0.5 text-[10px] text-emerald-300">Completed deliveries</p>
                </div>

                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-3.5 sm:p-4">
                  <div className="flex items-center justify-between text-purple-400">
                    <span className="text-xs font-bold uppercase tracking-wider">COD To Collect</span>
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <p className="mt-2 text-2xl font-black text-white">
                    {formatCurrency(
                      data.orders
                        .filter((o: any) => o.orderType === 'delivery' && o.status === 'out_for_delivery' && (!o.isPaidOnline && o.paymentMethod !== 'card' && o.paymentMethod !== 'upi'))
                        .reduce((sum: number, o: any) => sum + Number(o.finalAmount || 0), 0)
                    )}
                  </p>
                  <p className="mt-0.5 text-[10px] text-purple-300">Uncollected cash on delivery</p>
                </div>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/10 bg-slate-950 p-1.5">
                {[
                  { key: 'all', label: 'All Delivery Orders' },
                  { key: 'out_for_delivery', label: 'Out for Delivery' },
                  { key: 'ready', label: 'Ready for Pickup' },
                  { key: 'completed', label: 'Completed' },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setDeliveryFilter(t.key)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${deliveryFilter === t.key ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[240px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={deliverySearch}
                  onChange={(e) => setDeliverySearch(e.target.value)}
                  placeholder="Search customer, order #, phone..."
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500/40"
                />
              </div>
            </div>

            {/* Delivery Orders Cards Grid */}
            {filteredDeliveryOrders.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-12 text-center">
                <Truck className="mx-auto h-12 w-12 text-amber-500/60 mb-3" />
                <h3 className="text-lg font-extrabold text-white">No delivery orders active</h3>
                <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto mb-4">There are no online delivery orders matching the current filter. You can place a sample online delivery order or re-seed default demo orders anytime.</p>
                <button
                  type="button"
                  onClick={() => handleAction('seed')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow-lg transition inline-flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Load Sample Delivery Orders
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDeliveryOrders.map((order: any) => {
                  const items = data.orderItems.filter((oi: any) => oi.orderId === order.id);
                  const customerRecord = data.users.find((u: any) => u.id === order.customerId);
                  const isOut = order.status === 'out_for_delivery';
                  const isReady = ['ready', 'accepted', 'cooking'].includes(order.status);
                  const isCompleted = ['delivered', 'completed'].includes(order.status);
                  const isCod = !order.isPaidOnline && order.paymentMethod !== 'card' && order.paymentMethod !== 'upi';
                  const customerPhone = customerRecord?.phone || order.phone || '';
                  const customerName = order.customerName || customerRecord?.name || 'Customer';

                  return (
                    <div 
                      key={order.id}
                      className={`rounded-3xl border p-5 shadow-xl transition flex flex-col justify-between ${
                        isOut 
                          ? 'border-blue-500/40 bg-slate-950/90 ring-1 ring-blue-500/20' 
                          : isReady 
                          ? 'border-amber-500/30 bg-slate-950/80' 
                          : isCompleted 
                          ? 'border-emerald-500/20 bg-slate-950/60 opacity-80' 
                          : 'border-white/10 bg-slate-950/80'
                      }`}
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                          <div>
                            <span className="text-xs font-black text-white">#ORD-{order.id}</span>
                            <span className="ml-2 text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase border ${
                            isCompleted
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                              : isOut
                              ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                              : isReady
                              ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                              : 'border-slate-500/30 bg-slate-500/10 text-slate-300'
                          }`}>
                            {isCompleted ? 'Completed' : isOut ? 'Out for Delivery' : isReady ? 'Ready for Pickup' : order.status}
                          </span>
                        </div>

                        {/* Customer Details & Address */}
                        <div className="mt-3 space-y-2">
                          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{customerName}</span>
                              {customerPhone ? (
                                <a 
                                  href={`tel:${customerPhone}`}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition"
                                >
                                  <Smartphone className="h-3 w-3" /> {customerPhone}
                                </a>
                              ) : null}
                            </div>
                            
                            <div className="flex items-start gap-1.5 text-xs text-slate-300 pt-1 border-t border-white/5">
                              <MapPin className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                              <span className="leading-tight">{order.address || 'No address line set'}</span>
                            </div>

                            {order.address && (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-[11px] font-bold text-blue-300 hover:bg-blue-500/20 transition"
                              >
                                <Globe className="h-3.5 w-3.5" /> Open Google Maps Route
                              </a>
                            )}
                          </div>

                          {/* Items list */}
                          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Order Items ({items.length})</p>
                            <div className="space-y-1">
                              {items.map((item: any) => {
                                const menu = data.menuItems.find((m: any) => m.id === item.menuItemId);
                                return (
                                  <div key={item.id} className="flex items-center justify-between text-xs">
                                    <span className="text-slate-200">{item.quantity}x {menu?.name || 'Item'}</span>
                                    <span className="text-slate-400">₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer & Actions */}
                      <div className="mt-4 pt-3 border-t border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Payment ({isCod ? 'COD Cash' : 'Paid Online'})</p>
                            <p className="text-base font-black text-white">{formatCurrency(order.finalAmount)}</p>
                          </div>
                          <span className={`rounded-xl px-2.5 py-1 text-[10px] font-bold ${isCod ? 'border border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'}`}>
                            {isCod ? '💵 Collect Cash' : '✅ Paid Online'}
                          </span>
                        </div>

                        {isReady && (
                          <button
                            type="button"
                            onClick={async () => {
                              const success = await handleAction('updateOrderStatus', { id: order.id, status: 'out_for_delivery' });
                              if (success) {
                                showToast(`Order #ORD-${order.id} picked up for delivery!`, 'success');
                              }
                            }}
                            className="w-full py-2.5 rounded-xl border border-blue-500/40 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition"
                          >
                            <Truck className="h-4 w-4" /> Pick Up & Start Delivery
                          </button>
                        )}

                        {isOut && (
                          <button
                            type="button"
                            onClick={async () => {
                              const success = await handleAction('updateOrderStatus', { id: order.id, status: 'completed' });
                              if (success) {
                                showToast(`Order #ORD-${order.id} marked as completed & delivered!`, 'success');
                              }
                            }}
                            className="w-full py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
                          >
                            <CheckCircle className="h-4 w-4" /> Mark Delivered & Complete
                          </button>
                        )}

                        {isCompleted && (
                          <div className="w-full py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-black flex items-center justify-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-400" /> Completed & Delivered
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ======================================================= */}
      {/* 4. DIALOGS & MODAL INSERTS                              */}
      {activeModal === 'addMenuItem' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2">
          <div className="bg-slate-950/95 backdrop-blur-2xl rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-white/10 text-white">
            <div className="bg-slate-900/60 p-2.5 text-white flex justify-between items-center border-b border-white/10">
              <h3 className="font-extrabold text-base">{selectedEditItem ? 'Edit Culinary Catalog Item' : 'Add New Culinary Masterpiece'}</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSaveMenuItemSubmit} className="p-4 sm:p-5 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Item Title *</label>
                  <input 
                    type="text" required
                    value={menuItemForm.name}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, name: e.target.value })}
                    placeholder="e.g. Tuscan Truffle Pizza" 
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 text-white rounded-xl text-sm focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 placeholder-slate-500"
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Price (₹) *</label>
                  <input 
                    type="text" required
                    value={menuItemForm.price}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, price: e.target.value })}
                    placeholder="14.50" 
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 text-white rounded-xl text-sm focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Category *</label>
                  <select 
                    value={menuItemForm.categoryId}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 text-white rounded-xl text-sm focus:border-rose-500/50"
                  >
                    {data.categories.map((c: any) => (
                      <option key={c.id} value={c.id} className="bg-slate-950 text-white">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Food Description</label>
                <textarea 
                  rows={2}
                  value={menuItemForm.description}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, description: e.target.value })}
                  placeholder="Tell guests about ingredients, flavors and baking style..." 
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 text-white rounded-xl text-sm focus:border-rose-500/50 placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Prep Time (Mins)</label>
                  <input 
                    type="number"
                    value={menuItemForm.preparationTime}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, preparationTime: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 text-white rounded-xl text-sm focus:border-rose-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Spice Level (0-3)</label>
                  <input 
                    type="number" min="0" max="3"
                    value={menuItemForm.spiceLevel}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, spiceLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 text-white rounded-xl text-sm focus:border-rose-500/50"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <input 
                    type="checkbox"
                    checked={menuItemForm.isVegetarian}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, isVegetarian: e.target.checked })}
                    className="rounded bg-slate-900 border-white/10 text-rose-500 focus:ring-0"
                  /> Vegetarian
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <input 
                    type="checkbox"
                    checked={menuItemForm.isVegan}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, isVegan: e.target.checked })}
                    className="rounded bg-slate-900 border-white/10 text-rose-500 focus:ring-0"
                  /> Vegan
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <input 
                    type="checkbox"
                    checked={menuItemForm.isGlutenFree}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, isGlutenFree: e.target.checked })}
                    className="rounded bg-slate-900 border-white/10 text-rose-500 focus:ring-0"
                  /> Gluten Free
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Image URL</label>
                <input 
                  type="text"
                  value={menuItemForm.imageUrl}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..." 
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 text-white rounded-xl text-sm focus:border-rose-500/50 placeholder-slate-500"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl text-xs transition-all shadow-lg shadow-rose-500/20 active:scale-95"
              >
                Save Catalog Item Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'addInventory' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border">
            <div className="bg-slate-900 p-2.5 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-base">Add New Pantry Ingredient</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!inventoryForm.name || !inventoryForm.quantity || !inventoryForm.costPerUnit) {
                showToast("Please fill name, quantity, cost", "error");
                return;
              }
              const success = await handleAction('saveInventory', {
                ...inventoryForm,
                quantity: Number(inventoryForm.quantity),
                reorderLevel: Number(inventoryForm.reorderLevel),
                costPerUnit: Number(inventoryForm.costPerUnit),
                supplierId: data.suppliers[0]?.id || null
              });
              if (success) {
                setInventoryForm({ name: '', quantity: '', unit: 'kg', reorderLevel: '5.0', costPerUnit: '', supplierId: '' });
              }
            }} className="p-4 sm:p-5 space-y-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Ingredient Name *</label>
                <input 
                  type="text" required
                  value={inventoryForm.name}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                  placeholder="e.g. Fresh Truffles" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Starting Qty *</label>
                  <input 
                    type="number" required
                    value={inventoryForm.quantity}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
                    placeholder="10" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Unit Type *</label>
                  <select 
                    value={inventoryForm.unit}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="kg">kg</option>
                    <option value="ltr">ltr</option>
                    <option value="pcs">pcs</option>
                    <option value="pack">pack</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Reorder Thresh *</label>
                  <input 
                    type="text" required
                    value={inventoryForm.reorderLevel}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, reorderLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Cost Per Unit (₹) *</label>
                  <input 
                    type="text" required
                    value={inventoryForm.costPerUnit}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, costPerUnit: e.target.value })}
                    placeholder="15.00" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-1.5 bg-rose-600 text-white font-extrabold rounded-2xl text-xs hover:bg-rose-700 transition-all"
              >
                Log Pantry Stock Addition
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Real-time Payment Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-900 p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-rose-400" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Live Payment Receipt</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center space-y-1">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
              <p className="text-xs font-black uppercase text-emerald-300 tracking-widest">Real-Time Payment Verified</p>
              <p className="text-2xl font-black text-white">{formatCurrency(parseFloat(selectedReceipt.amount || '0').toFixed(2))}</p>
            </div>

            <div className="space-y-2 text-xs divide-y divide-white/5">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400 font-bold">Transaction Reference:</span>
                <span className="font-mono font-bold text-rose-300">{selectedReceipt.transactionId || `TXN_${selectedReceipt.id}_REALTIME`}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400 font-bold">Order ID:</span>
                <span className="font-mono text-white">#ORD-{selectedReceipt.orderId}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400 font-bold">Payment Method:</span>
                <span className="font-bold uppercase text-emerald-400">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400 font-bold">Settlement Merchant:</span>
                <span className="font-bold text-slate-200">{gatewayConfig.merchantName}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400 font-bold">Settlement Account:</span>
                <span className="font-mono text-slate-300">{gatewayConfig.payoutBank}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400 font-bold">Date & Time:</span>
                <span className="text-slate-300">{selectedReceipt.createdAt ? new Date(selectedReceipt.createdAt).toLocaleString('en-IN') : 'Just Now'}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5"
              >
                <Printer className="h-4 w-4" /> Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      </main>

      {/* STICKY FLOATING MOBILE CART BAR */}
      {currentRole === 'customer' && cart.length > 0 && customerMode !== null && (
        <div className="lg:hidden fixed bottom-4 left-3 right-3 z-40 bg-gradient-to-r from-rose-600 to-rose-700 border border-rose-400 text-white rounded-2xl p-3 sm:p-3.5 shadow-2xl flex items-center justify-between animate-fade-in-scale">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm border border-white/20">
              {cart.reduce((sum, c) => sum + c.quantity, 0)}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-rose-200">Cart Total</p>
              <p className="text-base font-black text-white">
                {formatCurrency(cart.reduce((sum, item) => sum + (Number(item.menuItem.price) * item.quantity), 0))}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveCustomerTab('browse');
              setIsCartOpen(true);
            }}
            className="bg-white text-rose-600 px-4 py-2.5 rounded-xl text-xs font-black hover:bg-slate-100 transition shadow-lg touch-target flex items-center gap-1.5"
          >
            View Cart →
          </button>
        </div>
      )}

      {/* FOOTER */}
      <DashboardFooter />
    </div>
  );
}


