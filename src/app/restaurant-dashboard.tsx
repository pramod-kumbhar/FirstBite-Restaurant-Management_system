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
  Smartphone, CreditCard, Wallet, Filter, Search, Grid, Receipt, RefreshCw, Layers3, Flame, X, Check, LogOut
} from 'lucide-react';

export default function RestaurantManagementSystem({ initialUser }: { initialUser?: any }) {
  const router = useRouter();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(initialUser ?? null);
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
  // 'customer', 'manager', 'chef', 'waiter', 'cashier'
  const [currentRole, setCurrentRole] = useState<'customer' | 'manager' | 'chef' | 'waiter' | 'cashier'>('customer');
  
  // Navigation tabs inside roles
  const [activeManagerTab, setActiveManagerTab] = useState<'overview' | 'menu' | 'inventory' | 'shifts' | 'reservations' | 'expenses' | 'coupons'>('overview');
  const [activeCustomerTab, setActiveCustomerTab] = useState<'browse' | 'reservations' | 'loyalty' | 'orders' | 'reviews'>('browse');

  // Customer State
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuFilters, setMenuFilters] = useState({ veg: false, vegan: false, gf: false });
  const [cart, setCart] = useState<any[]>([]); // [{ menuItem: obj, quantity: 1, notes: '' }]
  const [cartCoupon, setCartCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [customerTable, setCustomerTable] = useState<string>('T1');
  const [customerOrderType, setCustomerOrderType] = useState<'dine-in' | 'delivery'>('dine-in');
  const [customerPaymentMethod, setCustomerPaymentMethod] = useState<'card' | 'upi' | 'wallet'>('card');
  const [customerAddressLine, setCustomerAddressLine] = useState('');
  const [customerDistrict, setCustomerDistrict] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [customerPincode, setCustomerPincode] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  
  // Custom dialogs/forms state
  const [activeModal, setActiveModal] = useState<string | null>(null); // 'addMenuItem', 'addReservation', 'addShift', 'addInventory', 'addSupplier', 'addCoupon', 'addExpense'
  const [selectedEditItem, setSelectedEditItem] = useState<any>(null);
  
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
    shiftPreference: ''
  });

  const formatCurrency = (value: number | string) => {
    const amount = Number(value || 0);
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  // Waiter & Cashier interactive state
  const [selectedWaiterTable, setSelectedWaiterTable] = useState<any>(null);
  const [waiterQuickGuestCount, setWaiterQuickGuestCount] = useState(2);
  const [splitBillWays, setSplitBillWays] = useState(2);
  const [selectedCashierOrder, setSelectedCashierOrder] = useState<any>(null);
  const [cashierPaymentMethod, setCashierPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'wallet'>('cash');
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
        // Default category select to first category if not set
        if (json.data.categories.length > 0 && !selectedCategory) {
          setSelectedCategory(json.data.categories[0].id);
        }
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
      const normalizedRole = currentUser.role as 'customer' | 'manager' | 'chef' | 'waiter' | 'cashier';
      if (['customer', 'manager', 'chef', 'waiter', 'cashier'].includes(normalizedRole)) {
        setCurrentRole(normalizedRole);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      setCustomerAddressLine(currentUser.addressLine || '');
      setCustomerDistrict(currentUser.district || '');
      setCustomerState(currentUser.state || '');
      setCustomerPincode(currentUser.pincode || '');
    }
  }, [currentUser]);

  useEffect(() => {
    if (!authChecked || !currentUser) {
      return;
    }

    fetchData();
    // Poll for updates every 10 seconds to keep KDS (Chef) and POS (Cashier) synced
    const interval = setInterval(() => {
      fetchData();
    }, 10000);
    return () => clearInterval(interval);
  }, [authChecked, currentUser]);

  // --- HELPERS ---
  const handleLogout = () => {
    window.localStorage.removeItem('authToken');
    setCurrentUser(null);
    router.push('/welcome');
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
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.2),transparent_45%),linear-gradient(135deg,#111827_0%,#1f2937_100%)] flex items-center justify-center px-4 py-12 text-white">
        <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-8 shadow-2xl">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-rose-300">FirstBite</p>
              <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Run your restaurant from one secure place.</h1>
              <p className="mt-4 text-lg text-slate-300">Sign in to manage reservations, orders, inventory, and staff from a single dashboard.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/login" className="rounded-full bg-rose-500 px-5 py-3 font-semibold text-white transition hover:bg-rose-600">Log in</Link>
                <Link href="/signup" className="rounded-full border border-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white/10">Create account</Link>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6">
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
    setCart(newCart);
  };

  const handlePlaceOrder = async () => {
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

    if (customerOrderType === 'delivery' && !customerPaymentMethod) {
      showToast('Please select a payment method for delivery orders', 'error');
      return;
    }

    const tObj = data.tables.find((t: any) => t.tableNumber === customerTable);
    const resolvedCustomerId = currentUser?.role === 'customer' && currentUser?.id
      ? currentUser.id
      : data.users.find((u: any) => u.role === 'customer')?.id || null;
    const orderPayload = {
      customerId: resolvedCustomerId,
      customerEmail: currentUser?.email || null,
      customerName: currentUser?.name || null,
      tableId: customerOrderType === 'dine-in' ? (tObj?.id || null) : null,
      orderType: customerOrderType,
      paymentMethod: customerOrderType === 'delivery' ? customerPaymentMethod : null,
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
      finalAmount: getCartTotal()
    };

    const success = await handleAction('placeOrder', orderPayload);
    if (success) {
      setCart([]);
      setAppliedCoupon(null);
      setCartCoupon('');
      setCustomerNotes('');
      setCustomerAddressLine('');
      setCustomerDistrict('');
      setCustomerState('');
      setCustomerPincode('');
      setCustomerPaymentMethod('card');
      setActiveCustomerTab('orders');
      showToast("Order placed successfully! Check progress in tracker.", "success");
    }
  };

  // --- MOCK INVOICE PREVIEW ---
  const getReceiptDetails = (order: any) => {
    if (!order) return null;
    const items = data.orderItems.filter((oi: any) => oi.orderId === order.id);
    const table = data.tables.find((t: any) => t.id === order.tableId);
    return { order, items, table };
  };

  // --- STATS & CHARTS FOR MANAGER ---
  const totalRevenue = data.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const totalExpenses = data.expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
  const totalOrdersCount = data.orders.length;
  const averageOrderValue = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount) : 0;
  const availableRoles: Array<'customer' | 'manager' | 'chef' | 'waiter' | 'cashier'> = ['customer', 'manager', 'chef', 'waiter', 'cashier'];
  
  // Highlighting items with critical low stock level
  const lowStockItems = data.inventory.filter((item: any) => Number(item.quantity) <= Number(item.reorderLevel));

  return (
    <div className="min-h-screen overflow-x-hidden bg-white/80 text-slate-900 selection:bg-slate-900/10 selection:text-slate-900 font-sans flex flex-col" style={{ backgroundImage: 'radial-gradient(circle at top, rgba(255,255,255,0.85), transparent 40%), linear-gradient(180deg, rgba(255,255,255,0.9), rgba(248,250,252,0.95))' }}>
      
      {/* 1. TOP HEADER WITH ROLE SELECTOR */}
      <header className="sticky top-0 z-40 mx-3 mt-3 rounded-3xl px-3 py-3 sm:px-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border border-white/10 bg-white/10 shadow-sm backdrop-blur-3xl">
        <div className="flex items-center justify-between gap-3 w-full lg:w-auto">
          <div className="bg-rose-600 text-white p-2.5 rounded-2xl shadow-md flex items-center justify-center">
            <Utensils className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 text-slate-900">
              FirstBite <span className="text-xs bg-rose-100 text-rose-700 font-semibold px-2 py-0.5 rounded-full">v2.1 PRO</span>
            </h1>
            <p className="text-xs text-slate-500">Modern restaurant ordering, reservations, and operations</p>
          </div>
        </div>

        {/* ROLE SWITCHER */}
        {currentUser?.role === 'customer' ? (
          <div className="flex flex-col gap-1 w-full lg:w-auto">
            <p className="text-sm font-bold text-slate-900">Welcome back, {currentUser?.name?.split(' ')[0] || 'Guest'}!</p>
            <p className="text-xs text-slate-500">Ready to order? Browse menu, book a table, or track your delivery.</p>
          </div>
        ) : (
          <div className="bg-slate-100 p-1 rounded-xl flex flex-wrap items-center gap-1 border border-slate-200 w-full lg:w-auto overflow-x-auto">
            <span className="text-xs font-bold text-slate-500 px-3 hidden lg:inline uppercase tracking-wider">Access Panel:</span>
            {availableRoles.includes('customer') && (
              <button 
                onClick={() => { setCurrentRole('customer'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${currentRole === 'customer' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Users className="h-3.5 w-3.5" /> Customer
              </button>
            )}
            {availableRoles.includes('manager') && (
              <button 
                onClick={() => { setCurrentRole('manager'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${currentRole === 'manager' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <PieChart className="h-3.5 w-3.5" /> Manager
              </button>
            )}
            {availableRoles.includes('chef') && (
              <button 
                onClick={() => { setCurrentRole('chef'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${currentRole === 'chef' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Flame className="h-3.5 w-3.5 animate-pulse" /> Chef
              </button>
            )}
            {availableRoles.includes('waiter') && (
              <button 
                onClick={() => { setCurrentRole('waiter'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${currentRole === 'waiter' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <UserCheck className="h-3.5 w-3.5" /> Waiter
              </button>
            )}
            {availableRoles.includes('cashier') && (
              <button 
                onClick={() => { setCurrentRole('cashier'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${currentRole === 'cashier' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Receipt className="h-3.5 w-3.5" /> Cashier
              </button>
            )}
          </div>
        )}

        {/* USER INFO & LOGOUT */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end flex-wrap">
          <button 
            onClick={() => handleAction('seed')} 
            disabled={submitting}
            title="Reset DB and Seed Beautiful Demo Data"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-300 transition-all rounded-xl border flex items-center gap-1 text-xs font-medium"
          >
            <RotateCcw className={`h-4 w-4 ${submitting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset System</span>
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-500 text-white">{(currentUser?.name || 'C').charAt(0)}</div>
              <div className="text-left leading-tight">
                <div className="text-sm font-semibold">{currentUser?.name || 'Guest'}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{currentUser?.role || 'customer'}</div>
              </div>
            </button>
            {profileOpen ? (
              <div className="absolute right-0 top-full mt-3 w-72 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-rose-500">Your profile</p>
                    <p className="text-sm font-bold text-slate-900">{currentUser?.name || 'Guest User'}</p>
                  </div>
                  <span className={`text-[10px] rounded-full px-2 py-1 font-semibold ${currentUser?.isEmailVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {currentUser?.isEmailVerified ? 'Verified' : 'Verify OTP'}
                  </span>
                </div>
                <div className="space-y-2 text-[13px] text-slate-600">
                  <div className="flex justify-between"><span>Email</span><span className="font-semibold text-slate-900">{currentUser?.email || 'Not set'}</span></div>
                  <div className="flex justify-between"><span>Phone</span><span className="font-semibold text-slate-900">{currentUser?.phone || 'Not set'}</span></div>
                  <div className="flex justify-between"><span>Loyalty</span><span className="font-semibold text-slate-900">{currentUser?.loyaltyPoints ?? 0} pts</span></div>
                  <div className="flex justify-between"><span>Orders</span><span className="font-semibold text-slate-900">{customerOrders.length}</span></div>
                  <div className="flex justify-between"><span>Current status</span><span className="font-semibold text-slate-900">{latestCustomerOrder?.status?.toUpperCase() || 'No active order'}</span></div>
                </div>
                <button
                  type="button"
                  onClick={() => { setProfileOpen(false); router.push('/account-settings'); }}
                  className="mt-4 w-full rounded-2xl bg-slate-950 text-white py-2 text-xs font-bold hover:bg-slate-800 transition"
                >
                  Account settings
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="mt-3 w-full rounded-2xl bg-rose-500 text-white py-2 text-xs font-bold hover:bg-rose-600 transition"
                >
                  Delete account permanently
                </button>
              </div>
            ) : null}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* 2. TOAST NOTIFICATION */}
      {notification && (
        <div className={`fixed top-16 right-4 z-50 max-w-sm w-full p-4 rounded-2xl shadow-xl flex items-start gap-3 border transition-all animate-bounce ${
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
        {/* ROLE A: CUSTOMER DASHBOARD                              */}
        {/* ======================================================= */}
        {currentRole === 'customer' && (
          <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
            
            {/* Customer Navigation and Main Body */}
            <div className="flex-1 flex flex-col">
              
              {/* Promo Banner */}
              <div className="bg-linear-to-r from-rose-600 to-orange-500 rounded-3xl p-6 text-white mb-6 relative overflow-hidden shadow-lg">
                <div className="relative z-10 max-w-lg">
                  <span className="bg-white/20 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md">Loyalty Club Reward</span>
                  <h2 className="text-2xl md:text-3xl font-black mt-3 leading-tight">Order Gourmet Food Straight to Your Table!</h2>
                  <p className="text-white/90 text-sm mt-2 font-medium">Use QR table codes, browse real-time preparation levels, pay instantly and rack up points.</p>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="bg-white text-rose-700 px-3 py-1 rounded-xl text-xs font-bold">Code: WELCOME10 (10% OFF)</span>
                    <span className="text-xs text-white/95 font-semibold">★ Current Loyalty Points: 340</span>
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 top-0 opacity-15 pointer-events-none flex items-center justify-center">
                  <Utensils className="w-52 h-52 rotate-12" />
                </div>
              </div>

              <div className="mb-6 rounded-3xl bg-white/20 border border-white/10 shadow-sm">
                <div className="flex flex-nowrap items-center gap-3 overflow-x-auto whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                  <button 
                    onClick={() => setActiveCustomerTab('browse')}
                    className={`min-w-fit rounded-full px-4 py-2 font-semibold transition ${activeCustomerTab === 'browse' ? 'bg-white text-rose-600 shadow-sm' : 'bg-white/10 text-slate-600 hover:bg-white/30'}`}
                  >
                    🍔 Digital Menu
                  </button>
                  <button 
                    onClick={() => setActiveCustomerTab('reservations')}
                    className={`min-w-fit rounded-full px-4 py-2 font-semibold transition ${activeCustomerTab === 'reservations' ? 'bg-white text-rose-600 shadow-sm' : 'bg-white/10 text-slate-600 hover:bg-white/30'}`}
                  >
                    📅 Table Reservations
                  </button>
                  <button 
                    onClick={() => setActiveCustomerTab('orders')}
                    className={`min-w-fit rounded-full px-4 py-2 font-semibold transition ${activeCustomerTab === 'orders' ? 'bg-white text-rose-600 shadow-sm' : 'bg-white/10 text-slate-600 hover:bg-white/30'}`}
                  >
                    🚚 Track Orders & History
                  </button>
                  <button 
                    onClick={() => setActiveCustomerTab('reviews')}
                    className={`min-w-fit rounded-full px-4 py-2 font-semibold transition ${activeCustomerTab === 'reviews' ? 'bg-white text-rose-600 shadow-sm' : 'bg-white/10 text-slate-600 hover:bg-white/30'}`}
                  >
                    ⭐ Reviews & Feedback
                  </button>
                </div>
              </div>

              {/* TAB 1: BROWSE MENU */}
              {activeCustomerTab === 'browse' && (
                <div>
                  {/* Filters & Search */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white/15 backdrop-blur-3xl p-4 rounded-3xl border border-white/10 shadow-sm">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                        placeholder="Search truffle fries, woodfired pizza, classic pasta..." 
                        className="w-full pl-9 pr-4 py-2 bg-white/90 border border-white/20 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 items-center">
                      <button 
                        onClick={() => setMenuFilters({ ...menuFilters, veg: !menuFilters.veg })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${menuFilters.veg ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-slate-600 bg-white'}`}
                      >
                        🟢 Veg Only
                      </button>
                      <button 
                        onClick={() => setMenuFilters({ ...menuFilters, vegan: !menuFilters.vegan })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${menuFilters.vegan ? 'bg-green-600 border-green-600 text-white' : 'border-slate-200 text-slate-600 bg-white'}`}
                      >
                        🌱 Vegan
                      </button>
                      <button 
                        onClick={() => setMenuFilters({ ...menuFilters, gf: !menuFilters.gf })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${menuFilters.gf ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 text-slate-600 bg-white'}`}
                      >
                        🌾 Gluten-Free
                      </button>
                    </div>
                  </div>

                  {/* Category Pill Buttons */}
                  <div className="flex flex-wrap gap-2 pb-4">
                    {data.categories.map((cat: any) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-rose-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Menu Items Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                    {data.menuItems
                      .filter((item: any) => !selectedCategory || item.categoryId === selectedCategory)
                      .filter((item: any) => item.name.toLowerCase().includes(menuSearch.toLowerCase()) || (item.description && item.description.toLowerCase().includes(menuSearch.toLowerCase())))
                      .filter((item: any) => !menuFilters.veg || item.isVegetarian)
                      .filter((item: any) => !menuFilters.vegan || item.isVegan)
                      .filter((item: any) => !menuFilters.gf || item.isGlutenFree)
                      .map((item: any) => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
                          <div className="h-40 overflow-hidden bg-slate-100 relative">
                            <img 
                              src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60"} 
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                              {item.isVegetarian && <span className="bg-emerald-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">Veg</span>}
                              {item.isVegan && <span className="bg-green-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">Vegan</span>}
                              {item.isGlutenFree && <span className="bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">GF</span>}
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg">
                              ⏱ {item.preparationTime} mins
                            </div>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                              <p className="text-slate-500 text-xs mt-1 line-clamp-2">{item.description}</p>
                              
                              {/* Spice Level Indicator */}
                              {item.spiceLevel > 0 && (
                                <div className="flex gap-0.5 mt-2">
                                  {Array.from({ length: item.spiceLevel }).map((_, i) => (
                                    <Flame key={i} className="h-3.5 w-3.5 text-rose-600 fill-rose-600" />
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <span className="text-lg font-black text-rose-600">{formatCurrency(item.price)}</span>
                              <button
                                onClick={() => addToCart(item)}
                                disabled={!item.isAvailable}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                  item.isAvailable 
                                    ? 'bg-rose-500 text-white hover:bg-rose-600 active:scale-95 shadow-sm' 
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                {item.isAvailable ? 'Add to Cart +' : 'Sold Out'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 2: TABLE RESERVATION */}
              {activeCustomerTab === 'reservations' && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6">
                  <h3 className="text-lg font-extrabold text-slate-900 mb-2">Book a Premium Table</h3>
                  <p className="text-xs text-slate-500 mb-6">Instantly block live tables. Managers will confirm booking request in real-time.</p>

                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!reservationForm.customerName || !reservationForm.customerPhone || !reservationForm.reservationTime || !reservationForm.tableId) {
                      showToast("Please provide name, phone, table, and date/time", "error");
                      return;
                    }
                    const success = await handleAction('saveReservation', {
                      ...reservationForm,
                      numberOfGuests: Number(reservationForm.numberOfGuests),
                      tableId: parseInt(reservationForm.tableId)
                    });
                    if (success) {
                      setReservationForm({ customerName: '', customerPhone: '', tableId: '', reservationTime: '', numberOfGuests: 2, notes: '' });
                      showToast("Reservation booked successfully!", "success");
                    }
                  }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Your Full Name *</label>
                      <input 
                        type="text" 
                        required
                        value={reservationForm.customerName}
                        onChange={(e) => setReservationForm({ ...reservationForm, customerName: e.target.value })}
                        placeholder="e.g. Alice Smith" 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Phone Number *</label>
                      <input 
                        type="tel" 
                        required
                        value={reservationForm.customerPhone}
                        onChange={(e) => setReservationForm({ ...reservationForm, customerPhone: e.target.value })}
                        placeholder="e.g. 555-0199" 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Select Table *</label>
                      <select 
                        required
                        value={reservationForm.tableId}
                        onChange={(e) => setReservationForm({ ...reservationForm, tableId: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      >
                        <option value="">-- Choose Live Table --</option>
                        {data.tables.map((t: any) => (
                          <option key={t.id} value={t.id}>
                            Table {t.tableNumber} (Capacity: {t.capacity} guests) - [{t.status}]
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Number of Guests *</label>
                      <input 
                        type="number" 
                        required
                        min="1"
                        max="20"
                        value={reservationForm.numberOfGuests}
                        onChange={(e) => setReservationForm({ ...reservationForm, numberOfGuests: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Reservation Date & Time *</label>
                      <input 
                        type="datetime-local" 
                        required
                        value={reservationForm.reservationTime}
                        onChange={(e) => setReservationForm({ ...reservationForm, reservationTime: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Special Notes or Allergy Requests</label>
                      <textarea 
                        rows={3}
                        value={reservationForm.notes}
                        onChange={(e) => setReservationForm({ ...reservationForm, notes: e.target.value })}
                        placeholder="Prefer near window, celebrating birthday, gluten allergy..." 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button 
                        type="submit" 
                        className="w-full py-3 bg-rose-600 text-white font-extrabold rounded-2xl hover:bg-rose-700 transition-all shadow-md active:scale-95"
                      >
                        Submit Reservation Request
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: ORDER HISTORY & TRACKER */}
              {activeCustomerTab === 'orders' && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6">
                    <h3 className="text-lg font-extrabold text-slate-900 mb-4">Your Orders & Real-Time Tracker</h3>
                    <div className="grid gap-3 md:grid-cols-3 mb-6 text-xs text-slate-500">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                        <p className="font-semibold text-slate-900">Active Order</p>
                        <p>{latestCustomerOrder ? latestCustomerOrder.status.toUpperCase() : 'None'}</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                        <p className="font-semibold text-slate-900">Total Orders</p>
                        <p>{customerOrders.length}</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                        <p className="font-semibold text-slate-900">Last Order Type</p>
                        <p>{customerOrders[0]?.orderType?.toUpperCase() || 'N/A'}</p>
                      </div>
                    </div>
                    {customerOrders.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        <ShoppingBag className="h-12 w-12 mx-auto mb-3" />
                        <p className="text-sm font-semibold">You have not placed any orders yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {customerOrders.map((order: any) => {
                          const table = data.tables.find((t: any) => t.id === order.tableId);
                          const items = data.orderItems.filter((oi: any) => oi.orderId === order.id);
                          
                          // Convert statuses into user-friendly colors and icons
                          const statusColors: Record<string, string> = {
                            pending: 'bg-amber-100 text-amber-800 border-amber-300',
                            accepted: 'bg-blue-100 text-blue-800 border-blue-300',
                            cooking: 'bg-purple-100 text-purple-800 border-purple-300 animate-pulse',
                            ready: 'bg-indigo-100 text-indigo-800 border-indigo-300',
                            served: 'bg-rose-100 text-rose-800 border-rose-300',
                            completed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                            cancelled: 'bg-slate-100 text-slate-800 border-slate-300'
                          };

                          return (
                            <div key={order.id} className="border border-slate-200 rounded-2xl bg-slate-50/50 overflow-hidden">
                              <button
                                type="button"
                                onClick={() => setSelectedOrderId(order.id === selectedOrderId ? null : order.id)}
                                className="w-full p-4 text-left"
                              >
                                <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                                  <div>
                                    <span className="text-xs font-bold text-slate-500">Order ID: #{order.id}</span>
                                    <span className="mx-2 text-slate-300">|</span>
                                    <span className="text-xs font-bold text-slate-900">Type: {order.orderType.toUpperCase()} {table ? `(Table ${table.tableNumber})` : ''}</span>
                                  </div>
                                  <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${statusColors[order.status] || 'bg-slate-100'}`}>
                                    ● {order.status.toUpperCase()}
                                  </span>
                                </div>

                                <div className="grid gap-2 md:grid-cols-3 text-[11px] text-slate-500">
                                  <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                    <p className="font-semibold text-slate-900">Ordered</p>
                                    <p>{new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                  </div>
                                  <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                    <p className="font-semibold text-slate-900">Payment</p>
                                    <p>{order.paymentMethod ? order.paymentMethod.toUpperCase() : 'Offline'}</p>
                                  </div>
                                  <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                    <p className="font-semibold text-slate-900">Final total</p>
                                    <p>{formatCurrency(order.finalAmount)}</p>
                                  </div>
                                </div>
                              </button>

                              <div className="w-full bg-slate-200 rounded-full h-2 mb-4 mx-4 overflow-hidden">
                                <div 
                                  className="bg-rose-600 h-2 transition-all duration-1000" 
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
                                <div className="border-t border-slate-200 bg-slate-100 p-4 text-xs text-slate-700 space-y-3">
                                  <div className="grid gap-2 md:grid-cols-2">
                                    <div className="rounded-2xl bg-white p-3 border border-slate-200">
                                      <p className="font-semibold text-slate-900">Order note</p>
                                      <p>{order.notes || 'No special instructions'}</p>
                                    </div>
                                    <div className="rounded-2xl bg-white p-3 border border-slate-200">
                                      <p className="font-semibold text-slate-900">Coupon</p>
                                      <p>{order.couponCode || 'None'}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="font-semibold text-slate-900">Items</p>
                                    {items.map((oi: any) => {
                                      const menuItem = data.menuItems.find((m: any) => m.id === oi.menuItemId);
                                      return (
                                        <div key={oi.id} className="flex justify-between rounded-2xl bg-white p-3 border border-slate-200">
                                          <div>
                                            <p className="font-semibold text-slate-900">{menuItem ? menuItem.name : 'Unknown item'}</p>
                                            <p className="text-[11px] text-slate-500">Qty: {oi.quantity} {oi.notes ? `• ${oi.notes}` : ''}</p>
                                          </div>
                                          <p className="font-bold text-slate-900">{formatCurrency(Number(oi.unitPrice) * oi.quantity)}</p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="grid gap-2 md:grid-cols-2">
                                    <div className="rounded-2xl bg-white p-3 border border-slate-200">
                                      <p className="font-semibold text-slate-900">Order status</p>
                                      <p className="capitalize">{order.status}</p>
                                    </div>
                                    <div className="rounded-2xl bg-white p-3 border border-slate-200">
                                      <p className="font-semibold text-slate-900">Order details</p>
                                      <p>{order.orderType === 'dine-in' ? `Table ${table?.tableNumber}` : order.address || 'Delivery address not set'}</p>
                                    </div>
                                  </div>
                                  <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-100 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 mb-3">Order Progress</p>
                                    <div className="space-y-3">
                                      {[
                                        { step: 1, label: 'Confirmed by waiter', active: ['accepted','cooking','ready','served','completed'].includes(order.status) },
                                        { step: 2, label: 'Sent to chef', active: ['cooking','ready','served','completed'].includes(order.status) },
                                        { step: 3, label: 'Order accepted by chef', active: ['cooking','ready','served','completed'].includes(order.status) },
                                        { step: 4, label: 'Your order is ready', active: ['ready','served','completed'].includes(order.status) },
                                        { step: 5, label: order.orderType === 'delivery' ? 'Ready for delivery' : 'Ready to serve', active: ['served','completed'].includes(order.status) },
                                      ].map((step) => (
                                        <div key={step.step} className="flex items-center gap-3">
                                          <div className={`h-6 w-6 rounded-full border flex items-center justify-center ${step.active ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>
                                            <span className="text-[10px] font-bold">{step.step}</span>
                                          </div>
                                          <div>
                                            <p className={`text-sm ${step.active ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>{step.label}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeCustomerTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Review Submit form */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6">
                    <h3 className="text-base font-extrabold text-slate-900 mb-4">Rate Your Dining Experience</h3>
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
                    }} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Your Name</label>
                          <input 
                            type="text" 
                            required
                            value={reviewForm.customerName}
                            onChange={(e) => setReviewForm({ ...reviewForm, customerName: e.target.value })}
                            placeholder="e.g. Alice Smith" 
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Select Menu Item Rated</label>
                          <select 
                            required
                            value={reviewForm.menuItemId}
                            onChange={(e) => setReviewForm({ ...reviewForm, menuItemId: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                          >
                            <option value="">-- Choose Item --</option>
                            {data.menuItems.map((m: any) => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Rating (1 to 5 Stars)</label>
                        <select 
                          required
                          value={reviewForm.rating}
                          onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        >
                          <option value="5">⭐⭐⭐⭐⭐ Excellent (5 Stars)</option>
                          <option value="4">⭐⭐⭐⭐ Great (4 Stars)</option>
                          <option value="3">⭐⭐⭐ Good (3 Stars)</option>
                          <option value="2">⭐⭐ Fair (2 Stars)</option>
                          <option value="1">⭐ Poor (1 Star)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Write your detailed review</label>
                        <textarea 
                          rows={3}
                          required
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          placeholder="What did you like about the seasoning, service, temperature, and presentation?" 
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="w-full py-2.5 bg-rose-600 text-white font-extrabold rounded-xl text-sm hover:bg-rose-700 transition-all shadow-sm active:scale-95"
                      >
                        Submit Feedback
                      </button>
                    </form>
                  </div>

                  {/* Existing Reviews List */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6">
                    <h3 className="text-base font-extrabold text-slate-900 mb-4">Latest Guest Reviews</h3>
                    <div className="space-y-4">
                      {data.reviews.map((r: any) => {
                        const m = data.menuItems.find((mi: any) => mi.id === r.menuItemId);
                        return (
                          <div key={r.id} className="border-b border-slate-100 pb-3 last:border-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold text-sm text-slate-900">{r.customerName}</p>
                                <p className="text-[11px] text-rose-600 font-semibold mb-1">Reviewed: {m ? m.name : 'Gourmet Dish'}</p>
                              </div>
                              <span className="text-xs text-amber-500 font-bold">
                                {Array.from({ length: r.rating }).map(() => '⭐').join('')}
                              </span>
                            </div>
                            <p className="text-slate-600 text-xs italic">"{r.comment}"</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SIDE CART COLUMN (Only visible on Browse Menu Tab) */}
            {activeCustomerTab === 'browse' && (
              <div className="w-full lg:w-96 shrink-0">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm sticky top-24">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-rose-600" /> Shopping Cart
                    </h3>
                    <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {cart.reduce((sum, c) => sum + c.quantity, 0)} Items
                    </span>
                  </div>

                  {cart.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      <p className="text-sm font-semibold">Your cart is empty.</p>
                      <p className="text-xs mt-1">Pick gourmet items from digital menu to add.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Cart List */}
                      <div className="space-y-3 pr-1">
                        {cart.map((item) => (
                          <div key={item.menuItem.id} className="flex justify-between items-start gap-2 border-b border-slate-100 pb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-xs text-slate-800">{item.menuItem.name}</h4>
                              <p className="text-rose-600 text-xs font-extrabold mt-0.5">{formatCurrency(item.menuItem.price)}</p>
                              <input 
                                type="text"
                                placeholder="Special instructions..."
                                value={item.notes}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCart(cart.map(c => c.menuItem.id === item.menuItem.id ? { ...c, notes: val } : c));
                                }}
                                className="w-full mt-1.5 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] focus:outline-none"
                              />
                            </div>

                            <div className="flex items-center gap-1.5 mt-1">
                              <button 
                                onClick={() => updateCartQty(item.menuItem.id, -1)}
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold"
                              >
                                -
                              </button>
                              <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateCartQty(item.menuItem.id, 1)}
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Promo Code Coupon Area */}
                      <div className="pt-2 border-t border-slate-100">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Coupon Promo Code</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="e.g. WELCOME10"
                            value={cartCoupon}
                            onChange={(e) => setCartCoupon(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase"
                          />
                          <button 
                            type="button"
                            onClick={applyCouponToCart}
                            className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-slate-900 transition-all"
                          >
                            Apply
                          </button>
                        </div>
                      </div>

                      {/* Checkout Details (Table No, Order Type, Payment Method) */}
                      <div className="grid gap-2 pt-2 border-t border-slate-100">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Order Type</label>
                          <select 
                            value={customerOrderType}
                            onChange={(e: any) => {
                              const nextType = e.target.value as 'dine-in' | 'delivery';
                              setCustomerOrderType(nextType);
                              if (nextType === 'delivery') {
                                setCustomerPaymentMethod('card');
                              }
                            }}
                            className="w-full bg-white border border-slate-300 p-1.5 rounded-lg text-xs text-slate-800"
                          >
                            <option value="dine-in">Dine-In (Table)</option>
                            <option value="delivery">Delivery</option>
                          </select>
                        </div>
                        {customerOrderType === 'dine-in' ? (
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Your Table</label>
                            <select 
                              value={customerTable}
                              onChange={(e) => setCustomerTable(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded-lg text-xs"
                            >
                              {data.tables.map((t: any) => (
                                <option key={t.id} value={t.tableNumber}>Table {t.tableNumber}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <>
                            <div className="grid gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Address line</label>
                                <input
                                  type="text"
                                  value={customerAddressLine}
                                  onChange={(e) => setCustomerAddressLine(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                                  placeholder="Street, apartment, landmark"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">District</label>
                                  <input
                                    type="text"
                                    value={customerDistrict}
                                    onChange={(e) => setCustomerDistrict(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                                    placeholder="District"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">State</label>
                                  <input
                                    type="text"
                                    value={customerState}
                                    onChange={(e) => setCustomerState(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                                    placeholder="State"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pincode</label>
                                <input
                                  type="text"
                                  value={customerPincode}
                                  onChange={(e) => setCustomerPincode(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                                  placeholder="Postal code"
                                />
                              </div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                              <div className="flex items-center justify-between">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase">Payment Method</label>
                                <span className="rounded-full border border-slate-300 px-2 py-0.5 text-[10px] font-semibold text-slate-700">Secure</span>
                              </div>
                              <div className="mt-2 grid grid-cols-3 gap-2">
                                {[
                                  { value: 'card', label: 'Card', icon: CreditCard },
                                  { value: 'upi', label: 'UPI', icon: Smartphone },
                                  { value: 'wallet', label: 'Wallet', icon: Wallet },
                                ].map(({ value, label, icon: Icon }) => (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => setCustomerPaymentMethod(value as 'card' | 'upi' | 'wallet')}
                                    className={`flex items-center justify-center gap-1 rounded-xl border px-2 py-2 text-[11px] font-semibold transition ${customerPaymentMethod === value ? 'border-black bg-black text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-black'}`}
                                  >
                                    <Icon className="h-3.5 w-3.5" />
                                    {label}
                                  </button>
                                ))}
                              </div>
                              <p className="mt-2 text-[10px] text-slate-500">Delivery orders require your full address and chosen payment method.</p>
                              {customerPaymentMethod === 'upi' && (
                                <div className="mt-3 grid grid-cols-[96px_1fr] gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                                  <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-emerald-200 bg-white p-1.5">
                                    <img
                                      src={getDeliveryUpiQrUrl()}
                                      alt="UPI payment QR code"
                                      className="h-full w-full object-contain"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 text-emerald-800">
                                      <Smartphone className="h-3.5 w-3.5" />
                                      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em]">UPI Scan</p>
                                    </div>
                                    <p className="mt-1 text-lg font-black text-slate-950">₹{getCartTotal().toFixed(2)}</p>
                                    <p className="mt-1 truncate text-[11px] font-semibold text-slate-700">pamms.k07@upi</p>
                                    <a
                                      href={getDeliveryUpiPaymentUri()}
                                      className="mt-2 inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-800"
                                    >
                                      Open UPI App
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                              <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mb-2">Delivery map preview</p>
                              <p className="text-sm text-slate-700 mb-3">Verify your delivery location with Google Maps before placing the order.</p>
                              {customerAddressLine.trim() && customerDistrict.trim() && customerState.trim() && customerPincode.trim() ? (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${customerAddressLine}, ${customerDistrict}, ${customerState} ${customerPincode}`)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
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
                      <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1.5 mt-4">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal</span>
                          <span>{formatCurrency(getCartSubtotal())}</span>
                        </div>
                        {appliedCoupon && (
                          <div className="flex justify-between text-emerald-600 font-semibold">
                            <span>Discount ({appliedCoupon.code})</span>
                            <span>-{formatCurrency(getCartDiscount())}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-600">
                          <span>GST (5%)</span>
                          <span>{formatCurrency(getCartGst())}</span>
                        </div>
                        <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1.5 text-sm">
                          <span>Final Total</span>
                          <span className="text-rose-600">{formatCurrency(getCartTotal())}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={handlePlaceOrder}
                        className="w-full py-3 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 transition-all shadow-md mt-2 flex items-center justify-center gap-2"
                      >
                        <Send className="h-4 w-4" /> Place Food Order Now
                      </button>

                      {/* QR Code ordering simulator card */}
                      {customerOrderType === 'dine-in' && (
                        <div className="mt-4 p-3 border border-dashed border-rose-300 rounded-2xl bg-rose-50/50 flex gap-2 items-center">
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
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* ROLE B: MANAGER WORKSPACE (Analytics, Menu, Inventory)   */}
        {/* ======================================================= */}
        {currentRole === 'manager' && (
          <div className="flex-1 flex flex-col lg:flex-row">
            
            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 shrink-0 flex flex-col">
              <div className="p-4 border-b border-slate-800">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500">Administrator Panel</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">Logged in: {currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'Customer'} ({displayName})</p>
              </div>

              <nav className="p-2 space-y-1 flex-1">
                <button
                  onClick={() => setActiveManagerTab('overview')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${activeManagerTab === 'overview' ? 'bg-rose-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  <TrendingUp className="h-4 w-4" /> Financial Overview & Stats
                </button>
                <button
                  onClick={() => setActiveManagerTab('menu')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${activeManagerTab === 'menu' ? 'bg-rose-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  <Utensils className="h-4 w-4" /> Menu Items CRUD
                </button>
                <button
                  onClick={() => setActiveManagerTab('inventory')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${activeManagerTab === 'inventory' ? 'bg-rose-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  <Layers className="h-4 w-4" /> Inventory & Low Stock
                </button>
                <button
                  onClick={() => setActiveManagerTab('shifts')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${activeManagerTab === 'shifts' ? 'bg-rose-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  <Calendar className="h-4 w-4" /> Employees & Shifts
                </button>
                <button
                  onClick={() => setActiveManagerTab('reservations')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${activeManagerTab === 'reservations' ? 'bg-rose-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  <Users className="h-4 w-4" /> Table Reservations
                </button>
                <button
                  onClick={() => setActiveManagerTab('expenses')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${activeManagerTab === 'expenses' ? 'bg-rose-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  <DollarSign className="h-4 w-4" /> Expense Tracking
                </button>
                <button
                  onClick={() => setActiveManagerTab('coupons')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${activeManagerTab === 'coupons' ? 'bg-rose-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  <Ticket className="h-4 w-4" /> Coupons & Promo Codes
                </button>
              </nav>

              {/* Database Quick Stats */}
              <div className="p-4 border-t border-slate-800 text-[11px] space-y-2 text-slate-400">
                <div className="flex justify-between">
                  <span>Categories count:</span>
                  <span className="text-white font-bold">{data.categories.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total orders recorded:</span>
                  <span className="text-white font-bold">{data.orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active staff:</span>
                  <span className="text-white font-bold">{data.users.filter((u: any) => u.role !== 'customer').length}</span>
                </div>
              </div>
            </aside>

            {/* Manager Content Container */}
            <main className="flex-1 p-4 md:p-6 overflow-y-auto">
              
              {/* TAB 1: OVERVIEW & SALES ANALYTICS */}
              {activeManagerTab === 'overview' && (
                <div className="space-y-6">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                      <div className="bg-emerald-100 text-emerald-700 p-3 rounded-xl">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase">Total Revenue</p>
                        <p className="text-xl font-extrabold text-slate-900">{formatCurrency(totalRevenue.toFixed(2))}</p>
                        <p className="text-[10px] text-emerald-600">★ 100% Verified Paid Sales</p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                      <div className="bg-rose-100 text-rose-700 p-3 rounded-xl">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase">Operating Expenses</p>
                        <p className="text-xl font-extrabold text-slate-900">{formatCurrency(totalExpenses.toFixed(2))}</p>
                        <p className="text-[10px] text-slate-500">Rent, salary & raw produce</p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                      <div className="bg-indigo-100 text-indigo-700 p-3 rounded-xl">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase">Total Orders</p>
                        <p className="text-xl font-extrabold text-slate-900">{totalOrdersCount}</p>
                        <p className="text-[10px] text-indigo-600">Dine-in, pickup & delivery</p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                      <div className="bg-amber-100 text-amber-700 p-3 rounded-xl">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase">Low-Stock Warnings</p>
                        <p className="text-xl font-extrabold text-slate-900">{lowStockItems.length}</p>
                        <p className="text-[10px] text-rose-600 font-bold">Needs immediate reorder</p>
                      </div>
                    </div>
                  </div>

                  {/* Low Stock Alerts */}
                  {lowStockItems.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-center">
                      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                      <div>
                        <p className="font-bold text-xs text-amber-900">Low Stock Warning!</p>
                        <p className="text-[11px] text-amber-700">The following ingredients are below reorder parameters: {lowStockItems.map((i: any) => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}. Restock immediately inside Inventory tab.</p>
                      </div>
                    </div>
                  )}

                  {/* Visual Sales Charts (Custom CSS/SVG Bars) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-200 p-6 rounded-3xl">
                      <h3 className="text-sm font-extrabold mb-4 uppercase tracking-wider text-slate-500">Revenue Contribution by Category</h3>
                      <div className="space-y-4">
                        {data.categories.map((cat: any) => {
                          const itemsInCategory = data.menuItems.filter((m: any) => m.categoryId === cat.id);
                          const matchingOrderItems = data.orderItems.filter((oi: any) => itemsInCategory.some((m: any) => m.id === oi.menuItemId));
                          const categorySum = matchingOrderItems.reduce((sum: number, oi: any) => sum + (Number(oi.unitPrice) * oi.quantity), 0);
                          const percentage = totalRevenue > 0 ? (categorySum / totalRevenue) * 100 : 20;

                          return (
                            <div key={cat.id} className="space-y-1">
                              <div className="flex justify-between text-xs font-bold">
                                <span>{cat.name}</span>
                                <span className="text-rose-600">{formatCurrency(categorySum.toFixed(2))} ({percentage.toFixed(0)}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
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

                    <div className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold mb-3 uppercase tracking-wider text-slate-500">Live Table Occupancy Rate</h3>
                        <p className="text-xs text-slate-500 mb-4">Current real-time layout metrics for waiter coordination.</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                          <p className="text-xl font-black text-emerald-600">{data.tables.filter((t: any) => t.status === 'available').length}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Available</p>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                          <p className="text-xl font-black text-rose-600">{data.tables.filter((t: any) => t.status === 'occupied').length}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Occupied</p>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                          <p className="text-xl font-black text-purple-600">{data.tables.filter((t: any) => t.status === 'reserved').length}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Reserved</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-600">Average Order Size:</span>
                        <span className="font-black text-rose-600 text-sm">{formatCurrency(averageOrderValue.toFixed(2))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Orders Log */}
                  <div className="bg-white border border-slate-200 p-6 rounded-3xl">
                    <h3 className="text-sm font-extrabold mb-4 uppercase tracking-wider text-slate-500">Real-Time POS Billing Logs</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold">
                            <th className="py-2">Order ID</th>
                            <th className="py-2">Type</th>
                            <th className="py-2">Table</th>
                            <th className="py-2">Status</th>
                            <th className="py-2">Total Amount</th>
                            <th className="py-2">Final (Tax & Coupon)</th>
                            <th className="py-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {data.orders.map((o: any) => {
                            const table = data.tables.find((t: any) => t.id === o.tableId);
                            return (
                              <tr key={o.id} className="hover:bg-slate-50/50">
                                <td className="py-3 font-bold">#{o.id}</td>
                                <td className="py-3 uppercase">{o.orderType}</td>
                                <td className="py-3 font-semibold">{table ? `Table ${table.tableNumber}` : 'N/A'}</td>
                                <td className="py-3">
                                  <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full font-bold uppercase text-[10px]">
                                    {o.status}
                                  </span>
                                </td>
                                <td className="py-3 font-medium">{formatCurrency(o.totalAmount)}</td>
                                <td className="py-3 font-bold text-rose-600">{formatCurrency(o.finalAmount)}</td>
                                <td className="py-3 text-right">
                                  <button
                                    onClick={() => handleAction('updateOrderStatus', { id: o.id, status: 'cancelled' })}
                                    className="p-1 text-slate-400 hover:text-rose-600"
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
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={managerSearch}
                        onChange={(e) => setManagerSearch(e.target.value)}
                        placeholder="Filter menu catalog..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
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
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold">
                            <th className="p-4">Image</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Prep Time</th>
                            <th className="p-4">Availability</th>
                            <th className="p-4">Diet Tags</th>
                            <th className="p-4 text-right">Control</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {data.menuItems
                            .filter((item: any) => item.name.toLowerCase().includes(managerSearch.toLowerCase()))
                            .map((item: any) => {
                              const category = data.categories.find((c: any) => c.id === item.categoryId);
                              return (
                                <tr key={item.id} className="hover:bg-slate-50/50">
                                  <td className="p-4">
                                    <img 
                                      src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=60"} 
                                      alt={item.name} 
                                      className="h-10 w-12 object-cover rounded-lg border border-slate-200"
                                    />
                                  </td>
                                  <td className="p-4 font-bold text-slate-900">{item.name}</td>
                                  <td className="p-4 font-semibold text-slate-600">{category ? category.name : 'Unknown'}</td>
                                  <td className="p-4 font-extrabold text-rose-600">{formatCurrency(item.price)}</td>
                                  <td className="p-4 font-semibold">{item.preparationTime} mins</td>
                                  <td className="p-4">
                                    <button 
                                      onClick={() => handleAction('saveMenuItem', { ...item, isAvailable: !item.isAvailable })}
                                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}
                                    >
                                      {item.isAvailable ? '● Available' : '○ Sold Out'}
                                    </button>
                                  </td>
                                  <td className="p-4 flex gap-1 items-center flex-wrap">
                                    {item.isVegetarian && <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-bold">Veg</span>}
                                    {item.isVegan && <span className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded font-bold">Vegan</span>}
                                    {item.isGlutenFree && <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold">GF</span>}
                                  </td>
                                  <td className="p-4 text-right space-x-2">
                                    <button 
                                      onClick={() => handleOpenEditMenuItem(item)}
                                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg inline-block"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => handleAction('deleteMenuItem', { id: item.id })}
                                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg inline-block"
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
                <div className="space-y-6">
                  {/* Stock Ordering Form (Purchase Orders) */}
                  <div className="bg-white border border-slate-200 p-6 rounded-3xl">
                    <h3 className="text-sm font-extrabold mb-3 uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-rose-500" /> Restock / Create Supplier Purchase Order
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">Instantly place Restock item request with our active connected partners.</p>
                    
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
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Supplier *</label>
                        <select 
                          required
                          value={purchaseOrderForm.supplierId}
                          onChange={(e) => setPurchaseOrderForm({ ...purchaseOrderForm, supplierId: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                        >
                          <option value="">-- Choose Partner --</option>
                          {data.suppliers.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ingredient Item *</label>
                        <input 
                          type="text" 
                          required
                          value={purchaseOrderForm.itemName}
                          onChange={(e) => setPurchaseOrderForm({ ...purchaseOrderForm, itemName: e.target.value })}
                          placeholder="e.g. Buffalo Mozzarella" 
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                        />
                      </div>

                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Restock Qty *</label>
                        <input 
                          type="number" 
                          required
                          value={purchaseOrderForm.quantity}
                          onChange={(e) => setPurchaseOrderForm({ ...purchaseOrderForm, quantity: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                        />
                      </div>

                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Total Cost (₹) *</label>
                        <input 
                          type="number" 
                          required
                          value={purchaseOrderForm.cost}
                          onChange={(e) => setPurchaseOrderForm({ ...purchaseOrderForm, cost: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                        />
                      </div>

                      <div className="md:col-span-1">
                        <button 
                          type="submit" 
                          className="w-full py-2 bg-slate-900 text-white font-extrabold rounded-xl text-xs hover:bg-black transition-all"
                        >
                          Send PO Request
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Inventory Ingredients Table */}
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-extrabold text-xs text-slate-800 uppercase">Live Kitchen Pantry Inventory</h3>
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
                          <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold bg-slate-50/50">
                            <th className="p-4">Ingredient ID</th>
                            <th className="p-4">Item Name</th>
                            <th className="p-4">Current Stock</th>
                            <th className="p-4">Min Reorder Thresh</th>
                            <th className="p-4">Cost/Unit</th>
                            <th className="p-4">Supplier Partner</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Delete</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {data.inventory.map((inv: any) => {
                            const supplier = data.suppliers.find((s: any) => s.id === inv.supplierId);
                            const isLow = Number(inv.quantity) <= Number(inv.reorderLevel);

                            return (
                              <tr key={inv.id} className={isLow ? 'bg-rose-50/30' : 'hover:bg-slate-50/50'}>
                                <td className="p-4 font-semibold text-slate-500">#{inv.id}</td>
                                <td className="p-4 font-bold text-slate-900">{inv.name}</td>
                                <td className={`p-4 font-black ${isLow ? 'text-rose-600' : 'text-slate-950'}`}>
                                  {inv.quantity} {inv.unit}
                                </td>
                                <td className="p-4 font-semibold text-slate-500">{inv.reorderLevel} {inv.unit}</td>
                                <td className="p-4 font-medium">{formatCurrency(inv.costPerUnit)}</td>
                                <td className="p-4 font-semibold text-slate-600">{supplier ? supplier.name : 'Unknown Supplier'}</td>
                                <td className="p-4">
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
                                <td className="p-4 text-right">
                                  <button 
                                    onClick={() => handleAction('deleteInventory', { id: inv.id })}
                                    className="p-1 text-slate-400 hover:text-rose-600"
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
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 p-6 rounded-3xl">
                    <h3 className="text-sm font-extrabold mb-3 uppercase tracking-wider text-slate-500">
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
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Employee Staff *</label>
                        <select 
                          required
                          value={shiftForm.userId}
                          onChange={(e) => setShiftForm({ ...shiftForm, userId: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                        >
                          <option value="">-- Choose User --</option>
                          {data.users.map((u: any) => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role.toUpperCase()})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Shift Date *</label>
                        <input 
                          type="date" 
                          required
                          value={shiftForm.date}
                          onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Start Time *</label>
                        <input 
                          type="text" 
                          required
                          value={shiftForm.startTime}
                          onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                          placeholder="09:00" 
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">End Time *</label>
                        <input 
                          type="text" 
                          required
                          value={shiftForm.endTime}
                          onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                          placeholder="17:00" 
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Staff Role *</label>
                        <select 
                          value={shiftForm.role}
                          onChange={(e) => setShiftForm({ ...shiftForm, role: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
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
                          className="w-full py-2 bg-slate-900 text-white font-extrabold rounded-xl text-xs hover:bg-black transition-all"
                        >
                          Lock Roster Shift
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="bg-white border border-slate-200 p-6 rounded-3xl">
                    <h3 className="text-sm font-extrabold mb-3 uppercase tracking-wider text-slate-500">
                      Manage Chef, Waiter & Cashier Records
                    </h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!staffForm.name || !staffForm.email || !staffForm.password) {
                        showToast('Please provide name, email and password', 'error');
                        return;
                      }
                      const success = await handleAction('saveStaffMember', {
                        ...staffForm,
                        managerId: currentUser?.id || null,
                      });
                      if (success) {
                        setStaffForm({ role: 'chef', name: '', email: '', phone: '', password: '', status: 'active', specialization: '', section: '', shiftPreference: '' });
                        showToast('Staff profile saved successfully', 'success');
                      }
                    }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-end">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Role *</label>
                        <select value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs">
                          <option value="chef">Chef</option>
                          <option value="waiter">Waiter</option>
                          <option value="cashier">Cashier</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name *</label>
                        <input value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs" placeholder="Staff name" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email *</label>
                        <input type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs" placeholder="staff@email.com" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Password *</label>
                        <input type="password" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs" placeholder="Temporary password" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone</label>
                        <input value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs" placeholder="Phone" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                        <select value={staffForm.status} onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs">
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{staffForm.role === 'chef' ? 'Specialization' : staffForm.role === 'waiter' ? 'Section' : 'Shift Preference'}</label>
                        <input value={staffForm.role === 'chef' ? staffForm.specialization : staffForm.role === 'waiter' ? staffForm.section : staffForm.shiftPreference} onChange={(e) => setStaffForm({ ...staffForm, ...(staffForm.role === 'chef' ? { specialization: e.target.value } : staffForm.role === 'waiter' ? { section: e.target.value } : { shiftPreference: e.target.value }) })} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs" placeholder={staffForm.role === 'chef' ? 'Pizza / Grill' : staffForm.role === 'waiter' ? 'Floor 1' : 'Morning / Evening'} />
                      </div>
                      <div>
                        <button type="submit" className="w-full py-2 bg-slate-900 text-white font-extrabold rounded-xl text-xs hover:bg-black transition-all">Create Staff Profile</button>
                      </div>
                    </form>
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-3">
                      {['chef','waiter','cashier'].map((role) => {
                        const records = role === 'chef' ? data.chefs : role === 'waiter' ? data.waiters : data.cashiers;
                        return (
                          <div key={role} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs font-extrabold uppercase text-slate-700">{role === 'chef' ? 'Chefs' : role === 'waiter' ? 'Waiters' : 'Cashiers'}</h4>
                              <span className="text-[10px] font-bold text-slate-500">{records.length}</span>
                            </div>
                            <div className="space-y-2">
                              {records.length === 0 ? (
                                <p className="text-xs text-slate-500">No {role} records yet.</p>
                              ) : records.map((record: any) => {
                                  const user = data.users.find((u: any) => u.id === record.userId);
                                  const manager = data.users.find((u: any) => u.id === record.managerId);
                                  return (
                                    <div key={record.id} className="rounded-xl border border-slate-200 bg-white p-2.5">
                                      <div className="flex items-start justify-between gap-2">
                                        <div>
                                          <p className="font-semibold text-slate-900 text-sm">{user?.name || 'Unnamed staff'}</p>
                                          <p className="text-[11px] text-slate-500">{user?.email || 'No email'}</p>
                                          <p className="text-[11px] text-slate-500">{role === 'chef' ? record.specialization : role === 'waiter' ? record.section : record.shiftPreference}</p>
                                        </div>
                                        <button onClick={() => handleAction('deleteStaffMember', { role, id: record.id })} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                                      </div>
                                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                                        <span>{manager?.name ? `Managed by ${manager.name}` : 'Unassigned'}</span>
                                        <span className={`rounded-full px-2 py-0.5 font-bold ${record.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>{record.status}</span>
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

                  <div className="bg-white border border-slate-200 p-6 rounded-3xl">
                    <h3 className="text-sm font-extrabold mb-3 uppercase tracking-wider text-slate-500">
                      Staff Access Requests
                    </h3>
                    <div className="space-y-3">
                      {data.users.filter((u: any) => u.role !== 'customer').length === 0 ? (
                        <p className="text-sm text-slate-500">No staff accounts to review yet.</p>
                      ) : (
                        data.users
                          .filter((u: any) => u.role !== 'customer')
                          .map((u: any) => (
                            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                              <div>
                                <p className="font-semibold text-slate-900">{u.name}</p>
                                <p className="text-xs text-slate-500">{u.email} • {u.role.toUpperCase()}</p>
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
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                      <h3 className="font-extrabold text-xs text-slate-800 uppercase">Shift Roster Registry</h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold bg-slate-50/50">
                            <th className="p-4">Employee</th>
                            <th className="p-4">Scheduled Date</th>
                            <th className="p-4">Timing Block</th>
                            <th className="p-4">Assigned Role</th>
                            <th className="p-4">Shift Status</th>
                            <th className="p-4 text-right">Delete</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {data.shifts.map((s: any) => {
                            const emp = data.users.find((u: any) => u.id === s.userId);
                            return (
                              <tr key={s.id} className="hover:bg-slate-50/50">
                                <td className="p-4 font-bold text-slate-900">{emp ? emp.name : 'Unknown User'}</td>
                                <td className="p-4 font-semibold text-slate-600">{s.date}</td>
                                <td className="p-4 font-semibold text-slate-800">{s.startTime} - {s.endTime}</td>
                                <td className="p-4 uppercase font-bold text-rose-600">{s.role}</td>
                                <td className="p-4">
                                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold uppercase text-[10px]">
                                    {s.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <button 
                                    onClick={() => handleAction('deleteShift', { id: s.id })}
                                    className="p-1 text-slate-400 hover:text-rose-600"
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
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-extrabold text-xs text-slate-800 uppercase">Table Reservation Ledger</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold bg-slate-50/50">
                          <th className="p-4">Guest Name</th>
                          <th className="p-4">Phone</th>
                          <th className="p-4">Table Blocked</th>
                          <th className="p-4">Date & Time</th>
                          <th className="p-4">Guests Count</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {data.reservations.map((res: any) => {
                          const table = data.tables.find((t: any) => t.id === res.tableId);
                          return (
                            <tr key={res.id} className="hover:bg-slate-50/50">
                              <td className="p-4 font-bold text-slate-900">{res.customerName}</td>
                              <td className="p-4 font-semibold text-slate-600">{res.customerPhone}</td>
                              <td className="p-4 font-bold text-rose-600">
                                {table ? `Table ${table.tableNumber} (Cap: ${table.capacity})` : 'N/A'}
                              </td>
                              <td className="p-4 font-semibold text-slate-800">{new Date(res.reservationTime).toLocaleString()}</td>
                              <td className="p-4 font-bold">{res.numberOfGuests} pax</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border ${
                                  res.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                  res.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                  'bg-slate-50 text-slate-800 border-slate-200'
                                }`}>
                                  {res.status}
                                </span>
                              </td>
                              <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
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
                                  className="p-1.5 text-slate-400 hover:text-rose-600 inline-block"
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
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 p-6 rounded-3xl">
                    <h3 className="text-sm font-extrabold mb-3 uppercase tracking-wider text-slate-500">
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
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description *</label>
                        <input 
                          type="text" 
                          required
                          value={expenseForm.description}
                          onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                          placeholder="e.g. Electric bill April" 
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expense Category *</label>
                        <select 
                          value={expenseForm.category}
                          onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                        >
                          <option value="Ingredients">Ingredients</option>
                          <option value="Rent">Rent</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Salaries">Salaries</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Amount (₹) *</label>
                        <input 
                          type="number" 
                          required
                          value={expenseForm.amount}
                          onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                          placeholder="350" 
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date *</label>
                        <input 
                          type="date" 
                          required
                          value={expenseForm.date}
                          onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <button 
                          type="submit" 
                          className="w-full py-2 bg-slate-900 text-white font-extrabold rounded-xl text-xs hover:bg-black transition-all"
                        >
                          Log Expense
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Expenses List */}
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                      <h3 className="font-extrabold text-xs text-slate-800 uppercase">Operational Expense Ledger</h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold bg-slate-50/50">
                            <th className="p-4">Expense ID</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Date logged</th>
                            <th className="p-4">Authorized By</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {data.expenses.map((exp: any) => (
                            <tr key={exp.id} className="hover:bg-slate-50/50">
                              <td className="p-4 font-semibold text-slate-500">#{exp.id}</td>
                              <td className="p-4 font-bold text-slate-900">{exp.description}</td>
                              <td className="p-4 uppercase font-semibold text-slate-600">{exp.category}</td>
                              <td className="p-4 text-slate-600">{exp.date}</td>
                              <td className="p-4 font-semibold text-slate-500">{exp.createdBy}</td>
                              <td className="p-4 font-black text-rose-600">{formatCurrency(exp.amount)}</td>
                              <td className="p-4 text-right">
                                <button 
                                  onClick={() => handleAction('deleteExpense', { id: exp.id })}
                                  className="p-1 text-slate-400 hover:text-rose-600"
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
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 p-6 rounded-3xl">
                    <h3 className="text-sm font-extrabold mb-3 uppercase tracking-wider text-slate-500">
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
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Coupon Code *</label>
                        <input 
                          type="text" 
                          required
                          value={couponForm.code}
                          onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                          placeholder="e.g. WELCOME10" 
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Type *</label>
                        <select 
                          value={couponForm.discountType}
                          onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Cash (₹)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Value *</label>
                        <input 
                          type="number" 
                          required
                          value={couponForm.discountValue}
                          onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                          placeholder="10" 
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Min Order Size (₹)</label>
                        <input 
                          type="number" 
                          required
                          value={couponForm.minOrderAmount}
                          onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expiry Date *</label>
                        <input 
                          type="date" 
                          required
                          value={couponForm.expiryDate}
                          onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <button 
                          type="submit" 
                          className="w-full py-2 bg-slate-900 text-white font-extrabold rounded-xl text-xs hover:bg-black transition-all"
                        >
                          Deploy Coupon
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Coupons Table */}
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                      <h3 className="font-extrabold text-xs text-slate-800 uppercase">Active Coupon Campaigns</h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold bg-slate-50/50">
                            <th className="p-4">Promo Code</th>
                            <th className="p-4">Discount Type</th>
                            <th className="p-4">Benefit Value</th>
                            <th className="p-4">Min Spend Required</th>
                            <th className="p-4">Expiry Date</th>
                            <th className="p-4">Campaign Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {data.coupons.map((c: any) => (
                            <tr key={c.id} className="hover:bg-slate-50/50">
                              <td className="p-4 font-black text-rose-600 tracking-wide">{c.code}</td>
                              <td className="p-4 uppercase font-semibold text-slate-600">{c.discountType}</td>
                              <td className="p-4 font-bold">
                                {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `${formatCurrency(c.discountValue)} OFF`}
                              </td>
                              <td className="p-4 text-slate-600">{formatCurrency(c.minOrderAmount)}</td>
                              <td className="p-4 font-semibold">{c.expiryDate}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${c.isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800'}`}>
                                  {c.isActive ? 'Active Campaign' : 'Deactivated'}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button 
                                  onClick={() => handleAction('deleteCoupon', { id: c.id })}
                                  className="p-1 text-slate-400 hover:text-rose-600"
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
            </main>
          </div>
        )}

        {/* ======================================================= */}
        {/* ROLE C: CHEF KITCHEN DISPLAY SYSTEM (KDS)                */}
        {/* ======================================================= */}
        {currentRole === 'chef' && (
          <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500 text-slate-950 p-2.5 rounded-2xl">
                  <Flame className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">Kitchen Display System (KDS)</h2>
                  <p className="text-xs text-slate-400 font-medium">Real-time order ticket dispatcher for chefs. Order priority based on prep time.</p>
                </div>
              </div>
              <div className="bg-slate-800 px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 border border-slate-700">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></span> Live WebSockets Active
              </div>
            </div>

            {/* KDS Three Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Column 1: Pending & Queued Tickets */}
              <div className="bg-slate-100 border border-slate-200 rounded-3xl p-4 flex flex-col min-h-[500px]">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
                  <h3 className="font-extrabold text-sm uppercase text-slate-600 flex items-center gap-1.5">
                    📥 Queued Tickets ({data.orders.filter((o: any) => o.status === 'pending' || o.status === 'accepted').length})
                  </h3>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {data.orders
                    .filter((o: any) => o.status === 'pending' || o.status === 'accepted')
                    .map((order: any) => {
                      const items = data.orderItems.filter((oi: any) => oi.orderId === order.id);
                      const table = data.tables.find((t: any) => t.id === order.tableId);
                      return (
                        <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 text-xs">#Ticket-{order.id}</span>
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                              {table ? `Table ${table.tableNumber}` : 'Takeaway'}
                            </span>
                          </div>

                          <div className="border-t border-dashed border-slate-200 pt-2 space-y-1.5 text-xs">
                            {items.map((oi: any) => {
                              const itemDetails = data.menuItems.find((mi: any) => mi.id === oi.menuItemId);
                              return (
                                <div key={oi.id} className="flex justify-between font-medium">
                                  <span>{oi.quantity}x {itemDetails?.name} {oi.notes ? `[${oi.notes}]` : ''}</span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={() => handleAction('updateOrderStatus', { id: order.id, status: 'cooking' })}
                              className="w-full py-2 bg-slate-900 text-white font-extrabold rounded-xl text-xs hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-1.5"
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
              <div className="bg-purple-50/50 border border-purple-100 rounded-3xl p-4 flex flex-col min-h-[500px]">
                <div className="flex justify-between items-center pb-3 border-b border-purple-200 mb-4">
                  <h3 className="font-extrabold text-sm uppercase text-purple-700 flex items-center gap-1.5">
                    🍳 On the Grill ({data.orders.filter((o: any) => o.status === 'cooking').length})
                  </h3>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {data.orders
                    .filter((o: any) => o.status === 'cooking')
                    .map((order: any) => {
                      const items = data.orderItems.filter((oi: any) => oi.orderId === order.id);
                      const table = data.tables.find((t: any) => t.id === order.tableId);
                      return (
                        <div key={order.id} className="bg-white border border-purple-200 rounded-2xl p-4 shadow-md space-y-3 relative overflow-hidden">
                          {/* Timer bar simulation */}
                          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-purple-500 to-rose-500 animate-pulse"></div>

                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 text-xs">#Ticket-{order.id}</span>
                            <span className="bg-purple-100 text-purple-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                              {table ? `Table ${table.tableNumber}` : 'Takeaway'}
                            </span>
                          </div>

                          <div className="border-t border-dashed border-slate-200 pt-2 space-y-1.5 text-xs">
                            {items.map((oi: any) => {
                              const itemDetails = data.menuItems.find((mi: any) => mi.id === oi.menuItemId);
                              return (
                                <div key={oi.id} className="flex justify-between font-medium">
                                  <span>{oi.quantity}x {itemDetails?.name} {oi.notes ? `[${oi.notes}]` : ''}</span>
                                  <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">prep: {itemDetails?.preparationTime}m</span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={() => handleAction('updateOrderStatus', { id: order.id, status: 'ready' })}
                              className="w-full py-2 bg-emerald-600 text-white font-extrabold rounded-xl text-xs hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
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
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-4 flex flex-col min-h-[500px]">
                <div className="flex justify-between items-center pb-3 border-b border-emerald-200 mb-4">
                  <h3 className="font-extrabold text-sm uppercase text-emerald-700 flex items-center gap-1.5">
                    🛎 Ready at Food Pass ({data.orders.filter((o: any) => o.status === 'ready' || o.status === 'served').length})
                  </h3>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {data.orders
                    .filter((o: any) => o.status === 'ready' || o.status === 'served')
                    .map((order: any) => {
                      const items = data.orderItems.filter((oi: any) => oi.orderId === order.id);
                      const table = data.tables.find((t: any) => t.id === order.tableId);
                      return (
                        <div key={order.id} className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 text-xs">#Ticket-{order.id}</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                              {table ? `Table ${table.tableNumber}` : 'Takeaway'}
                            </span>
                          </div>

                          <div className="border-t border-dashed border-slate-200 pt-2 space-y-1 text-xs text-slate-600">
                            {items.map((oi: any) => {
                              const itemDetails = data.menuItems.find((mi: any) => mi.id === oi.menuItemId);
                              return (
                                <div key={oi.id} className="flex justify-between font-medium">
                                  <span>{oi.quantity}x {itemDetails?.name}</span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-center text-[11px] font-bold text-emerald-800 flex items-center justify-center gap-1">
                            <CheckCircle className="h-4 w-4" /> Waiter alert notification fired
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* ROLE D: WAITER INTERACTIVE DASHBOARD                     */}
        {/* ======================================================= */}
        {currentRole === 'waiter' && (
          <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-1 flex items-center gap-2">
                👥 Waiter Interactive Desk
              </h2>
              <p className="text-xs text-slate-500 mb-6">Coordinate seating, taking orders, and split-billing calculations for guests.</p>

              {/* Table Seating Map */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-2">Live Table Grid</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {data.tables.map((table: any) => {
                    const occupancyColors: Record<string, string> = {
                      available: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-300 text-emerald-900',
                      occupied: 'bg-rose-50 hover:bg-rose-100/80 border-rose-300 text-rose-900',
                      reserved: 'bg-purple-50 hover:bg-purple-100/80 border-purple-300 text-purple-900'
                    };

                    return (
                      <button
                        key={table.id}
                        onClick={() => setSelectedWaiterTable(table)}
                        className={`border rounded-2xl p-4 text-left transition-all relative ${occupancyColors[table.status] || 'bg-slate-50 border-slate-200'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-black text-lg">#{table.tableNumber}</span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/60">
                            Cap: {table.capacity}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-wider">● {table.status}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Table details */}
            {selectedWaiterTable ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Panel A: Status and Actions */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <h3 className="font-extrabold text-base text-slate-900">Manage Table #{selectedWaiterTable.tableNumber}</h3>
                    <button 
                      onClick={() => setSelectedWaiterTable(null)}
                      className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Change Table Occupancy Status</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => handleAction('saveTable', { ...selectedWaiterTable, status: 'available' })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${selectedWaiterTable.status === 'available' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700'}`}
                      >
                        Free / Available
                      </button>
                      <button 
                        onClick={() => handleAction('saveTable', { ...selectedWaiterTable, status: 'occupied' })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${selectedWaiterTable.status === 'occupied' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-700'}`}
                      >
                        Occupy Table
                      </button>
                      <button 
                        onClick={() => handleAction('saveTable', { ...selectedWaiterTable, status: 'reserved' })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${selectedWaiterTable.status === 'reserved' ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 text-slate-700'}`}
                      >
                        Block Reserve
                      </button>
                    </div>
                  </div>

                  {/* Split Billing Calculator */}
                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Split Billing Tool</h4>
                    
                    {/* Get active order of this table */}
                    {(() => {
                      const tableOrder = data.orders.find((o: any) => o.tableId === selectedWaiterTable.id && o.status !== 'completed' && o.status !== 'cancelled');
                      if (!tableOrder) {
                        return <p className="text-xs text-slate-400 italic">No active unpaid order detected on Table #{selectedWaiterTable.tableNumber}. Place a order inside Customer Menu browse first.</p>;
                      }

                      const totalAmt = Number(tableOrder.finalAmount);
                      return (
                        <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Active Order Total:</span>
                            <span className="font-black text-rose-600">{formatCurrency(totalAmt)}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-slate-500">Split into:</span>
                            <div className="flex gap-1">
                              {[2, 3, 4, 5].map((ways) => (
                                <button
                                  key={ways}
                                  onClick={() => setSplitBillWays(ways)}
                                  className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${splitBillWays === ways ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200'}`}
                                >
                                  {ways} Ways
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700">Each Person Pays:</span>
                            <span className="text-base font-black text-rose-600">{formatCurrency((totalAmt / splitBillWays).toFixed(2))}</span>
                          </div>

                          {/* Waiter action: forward active order to chef */}
                          <div className="mt-3">
                            {tableOrder && tableOrder.status === 'pending' && (
                              <button
                                onClick={async () => {
                                  const ok = await handleAction('forwardToChef', { id: tableOrder.id });
                                  if (ok) showToast('Order forwarded to chef', 'success');
                                }}
                                className="w-full py-2 bg-rose-600 text-white font-extrabold rounded-2xl text-xs hover:bg-rose-700 transition-all shadow-sm"
                              >
                                ▶️ Send to Chef
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Panel B: Table Digital QR Simulator */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center text-center">
                  <Smartphone className="h-10 w-10 text-rose-500 mb-2" />
                  <h3 className="font-extrabold text-sm text-slate-900 mb-1">Interactive Table QR Code</h3>
                  <p className="text-xs text-slate-500 max-w-sm mb-4">Guests can scan this physical QR code on their phones to view digital menu, reserve tables, or pay bills with UPI/Wallets.</p>
                  
                  {selectedWaiterTable.qrCodeUrl ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <img 
                        src={selectedWaiterTable.qrCodeUrl} 
                        alt="Table QR Code" 
                        className="w-32 h-32 mx-auto"
                      />
                      <p className="text-[10px] font-mono mt-2 text-slate-500">ID: table-{selectedWaiterTable.tableNumber}</p>
                    </div>
                  ) : (
                    <div className="h-32 w-32 bg-slate-100 flex items-center justify-center rounded-2xl border">
                      <p className="text-xs text-slate-400 font-bold">No QR Generated</p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400">
                <Grid className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-semibold">No table selected</p>
                <p className="text-xs mt-1">Click on any table in live map above to trigger occupancy adjustments and billing utilities.</p>
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* ROLE E: CASHIER BILLING & PAYMENT GATEWAY                */}
        {/* ======================================================= */}
        {currentRole === 'cashier' && (
          <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
            
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-1 flex items-center gap-2">
                💵 Cashier POS & Billing Terminal
              </h2>
              <p className="text-xs text-slate-500">Collect checkout requests, process invoices, print official receipts, and manage digital refunds.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Column 1 & 2: Active Unpaid Check Orders */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Unpaid Active Customer Tickets</h3>
                
                {data.orders.filter((o: any) => o.status !== 'completed' && o.status !== 'cancelled').length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
                    <p className="text-sm font-semibold">All accounts settled!</p>
                    <p className="text-xs mt-1">There are currently no unpaid active dining orders.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.orders
                      .filter((o: any) => o.status !== 'completed' && o.status !== 'cancelled')
                      .map((order: any) => {
                        const table = data.tables.find((t: any) => t.id === order.tableId);
                        const items = data.orderItems.filter((oi: any) => oi.orderId === order.id);
                        return (
                          <div 
                            key={order.id}
                            onClick={() => setSelectedCashierOrder(order)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${selectedCashierOrder?.id === order.id ? 'bg-rose-50 border-rose-300' : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200'}`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs text-slate-900">#Order {order.id}</span>
                                <span className="bg-slate-200 text-slate-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                  {table ? `Table ${table.tableNumber}` : 'Takeaway'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Contains {items.length} items • Prep status: <span className="font-bold text-rose-600">{order.status}</span></p>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-black text-rose-600">{formatCurrency(order.finalAmount)}</p>
                              <span className="text-[10px] text-slate-400 font-semibold">Click to Settle Account</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Column 3: Payment Checkout Processing Form */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3 mb-4">Account Checkout Gateway</h3>

                {selectedCashierOrder ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-50 rounded-2xl space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Order Reference</span>
                        <span className="font-bold">#Order-{selectedCashierOrder.id}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Subtotal Amount</span>
                        <span className="font-semibold">{formatCurrency(selectedCashierOrder.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">GST (5% tax block)</span>
                        <span className="font-semibold">{formatCurrency(selectedCashierOrder.gstAmount)}</span>
                      </div>
                      {Number(selectedCashierOrder.discountAmount) > 0 && (
                        <div className="flex justify-between text-xs text-emerald-600">
                          <span>Deductions / Discount</span>
                          <span className="font-bold">-{formatCurrency(selectedCashierOrder.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-black border-t border-slate-200 pt-2 text-rose-600">
                        <span>Final Bill Settle</span>
                        <span>{formatCurrency(selectedCashierOrder.finalAmount)}</span>
                      </div>
                    </div>

                    {/* Choose Payment Method */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase">Process Payment Via</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setCashierPaymentMethod('cash')}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border ${cashierPaymentMethod === 'cash' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-700'}`}
                        >
                          💵 Cash Pay
                        </button>
                        <button
                          type="button"
                          onClick={() => setCashierPaymentMethod('card')}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border ${cashierPaymentMethod === 'card' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-700'}`}
                        >
                          💳 Credit Card
                        </button>
                        <button
                          type="button"
                          onClick={() => setCashierPaymentMethod('upi')}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border ${cashierPaymentMethod === 'upi' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-700'}`}
                        >
                          📱 UPI Scan
                        </button>
                        <button
                          type="button"
                          onClick={() => setCashierPaymentMethod('wallet')}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border ${cashierPaymentMethod === 'wallet' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-700'}`}
                        >
                          💼 Wallet
                        </button>
                      </div>
                    </div>

                    {/* Settlement Button */}
                    <button
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
                      className="w-full py-3 bg-emerald-600 text-white font-black rounded-2xl text-xs hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-1"
                    >
                      Process & Complete Invoice
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    <Receipt className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    Select an unpaid dining ticket to activate the checkout transaction terminal.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>

      {/* ======================================================= */}
      {/* 4. DIALOGS & MODAL INSERTS                              */}
      {/* ======================================================= */}
      {activeModal === 'addMenuItem' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-base">{selectedEditItem ? 'Edit Culinary Catalog Item' : 'Add New Culinary Masterpiece'}</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSaveMenuItemSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Item Title *</label>
                  <input 
                    type="text" required
                    value={menuItemForm.name}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, name: e.target.value })}
                    placeholder="e.g. Tuscan Truffle Pizza" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Price (₹) *</label>
                  <input 
                    type="text" required
                    value={menuItemForm.price}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, price: e.target.value })}
                    placeholder="14.50" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Category *</label>
                  <select 
                    value={menuItemForm.categoryId}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    {data.categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Food Description</label>
                <textarea 
                  rows={2}
                  value={menuItemForm.description}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, description: e.target.value })}
                  placeholder="Tell guests about ingredients, flavors and baking style..." 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Prep Time (Mins)</label>
                  <input 
                    type="number"
                    value={menuItemForm.preparationTime}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, preparationTime: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Spice Level (0-3)</label>
                  <input 
                    type="number" min="0" max="3"
                    value={menuItemForm.spiceLevel}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, spiceLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input 
                    type="checkbox"
                    checked={menuItemForm.isVegetarian}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, isVegetarian: e.target.checked })}
                    className="rounded"
                  /> Vegetarian
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input 
                    type="checkbox"
                    checked={menuItemForm.isVegan}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, isVegan: e.target.checked })}
                    className="rounded"
                  /> Vegan
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input 
                    type="checkbox"
                    checked={menuItemForm.isGlutenFree}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, isGlutenFree: e.target.checked })}
                    className="rounded"
                  /> Gluten Free
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Image URL</label>
                <input 
                  type="text"
                  value={menuItemForm.imageUrl}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..." 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-rose-600 text-white font-extrabold rounded-2xl text-xs hover:bg-rose-700 transition-all shadow"
              >
                Save Catalog Item Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'addInventory' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border">
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
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
            }} className="p-6 space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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
                className="w-full py-3 bg-rose-600 text-white font-extrabold rounded-2xl text-xs hover:bg-rose-700 transition-all"
              >
                Log Pantry Stock Addition
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-center text-xs mt-auto">
        <p>© 2026 FirstBite. All rights reserved. Operating with dynamic state persistence & automated MySQL transaction pipelines.</p>
      </footer>
    </div>
  );
}
