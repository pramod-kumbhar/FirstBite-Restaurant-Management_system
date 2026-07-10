import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// 1. USERS (Customers & Employees/Staff)
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name', { length: 100 }).notNull(),
  email: text('email', { length: 150 }).notNull().unique(),
  password: text('password', { length: 255 }).notNull().default(''),
  phone: text('phone', { length: 20 }),
  addressLine: text('address_line', { length: 255 }),
  district: text('district', { length: 100 }),
  state: text('state', { length: 100 }),
  pincode: text('pincode', { length: 20 }),
  role: text('role', { length: 30 }).notNull().default('customer'), // 'customer', 'manager', 'chef', 'waiter', 'cashier'
  pin: text('pin', { length: 6 }), // Quick access pin for POS/terminal access
  loyaltyPoints: integer('loyalty_points').notNull().default(0),
  isEmailVerified: integer('is_email_verified', { mode: 'boolean' }).notNull().default(false),
  isApproved: integer('is_approved', { mode: 'boolean' }).notNull().default(true),
  emailVerificationToken: text('email_verification_token', { length: 255 }),
  emailVerifiedAt: integer('email_verified_at', { mode: 'timestamp_ms' }),
  passwordResetToken: text('password_reset_token', { length: 255 }),
  passwordResetExpiresAt: integer('password_reset_expires_at', { mode: 'timestamp_ms' }),
  joinedAt: integer('joined_at', { mode: 'timestamp_ms' }).notNull().defaultNow(),
  branch: text('branch', { length: 100 }).notNull().default('Ichalkaranji'),
});

// 2. ROLE-SPECIFIC STAFF PROFILES
export const chefs = sqliteTable('chefs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  managerId: integer('manager_id').references(() => users.id, { onDelete: 'set null' }),
  status: text('status', { length: 30 }).notNull().default('active'),
  specialization: text('specialization', { length: 100 }),
  joinedAt: integer('joined_at', { mode: 'timestamp_ms' }).notNull().defaultNow(),
});

export const waiters = sqliteTable('waiters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  managerId: integer('manager_id').references(() => users.id, { onDelete: 'set null' }),
  status: text('status', { length: 30 }).notNull().default('active'),
  section: text('section', { length: 100 }),
  joinedAt: integer('joined_at', { mode: 'timestamp_ms' }).notNull().defaultNow(),
});

export const cashiers = sqliteTable('cashiers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  managerId: integer('manager_id').references(() => users.id, { onDelete: 'set null' }),
  status: text('status', { length: 30 }).notNull().default('active'),
  shiftPreference: text('shift_preference', { length: 100 }),
  joinedAt: integer('joined_at', { mode: 'timestamp_ms' }).notNull().defaultNow(),
});

// 3. CATEGORIES
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name', { length: 100 }).notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
});

// 4. MENU ITEMS
export const menuItems = sqliteTable('menu_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'cascade' }),
  name: text('name', { length: 150 }).notNull(),
  description: text('description'),
  price: text('price').notNull(),
  isAvailable: integer('is_available', { mode: 'boolean' }).notNull().default(true),
  isVegetarian: integer('is_vegetarian', { mode: 'boolean' }).notNull().default(false),
  isVegan: integer('is_vegan', { mode: 'boolean' }).notNull().default(false),
  isGlutenFree: integer('is_gluten_free', { mode: 'boolean' }).notNull().default(false),
  imageUrl: text('image_url'),
  spiceLevel: integer('spice_level').notNull().default(0), // 0: None, 1: Low, 2: Medium, 3: High
  preparationTime: integer('preparation_time').notNull().default(15), // minutes
});

// 5. RESTAURANT TABLES
export const restaurantTables = sqliteTable('restaurant_tables', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tableNumber: text('table_number', { length: 10 }).notNull().unique(),
  capacity: integer('capacity').notNull(),
  status: text('status', { length: 30 }).notNull().default('available'), // 'available', 'occupied', 'reserved'
  qrCodeUrl: text('qr_code_url'),
});

// 6. RESERVATIONS
export const reservations = sqliteTable('reservations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  customerId: integer('customer_id').references(() => users.id, { onDelete: 'set null' }),
  customerName: text('customer_name', { length: 100 }).notNull(),
  customerPhone: text('customer_phone', { length: 20 }).notNull(),
  tableId: integer('table_id').references(() => restaurantTables.id, { onDelete: 'set null' }),
  reservationTime: integer('reservation_time', { mode: 'timestamp_ms' }).notNull(),
  numberOfGuests: integer('number_of_guests').notNull(),
  status: text('status', { length: 30 }).notNull().default('pending'), // 'pending', 'confirmed', 'completed', 'cancelled'
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().defaultNow(),
  branch: text('branch', { length: 100 }).notNull().default('Ichalkaranji'),
});

// 7. ORDERS
export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  customerId: integer('customer_id').references(() => users.id, { onDelete: 'set null' }),
  tableId: integer('table_id').references(() => restaurantTables.id, { onDelete: 'set null' }),
  orderType: text('order_type', { length: 30 }).notNull().default('dine-in'), // 'dine-in', 'takeaway', 'delivery'
  status: text('status', { length: 30 }).notNull().default('pending'), // 'pending', 'accepted', 'cooking', 'ready', 'served', 'completed', 'cancelled'
  totalAmount: text('total_amount').notNull(),
  gstAmount: text('gst_amount').notNull().default('0.00'),
  discountAmount: text('discount_amount').notNull().default('0.00'),
  finalAmount: text('final_amount').notNull(),
  couponCode: text('coupon_code', { length: 50 }),
  address: text('address'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().defaultNow(),
  branch: text('branch', { length: 100 }).notNull().default('Ichalkaranji'),
});

// 8. ORDER ITEMS
export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: integer('menu_item_id').references(() => menuItems.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull(),
  unitPrice: text('unit_price').notNull(),
  notes: text('notes'),
  status: text('status', { length: 30 }).notNull().default('pending'), // 'pending', 'cooking', 'ready', 'served'
});

// 9. SUPPLIERS
export const suppliers = sqliteTable('suppliers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name', { length: 150 }).notNull(),
  contactPerson: text('contact_person', { length: 100 }),
  email: text('email', { length: 150 }),
  phone: text('phone', { length: 20 }),
  address: text('address'),
});

// 10. INVENTORY ITEMS
export const inventoryItems = sqliteTable('inventory_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name', { length: 150 }).notNull(),
  quantity: text('quantity').notNull(),
  unit: text('unit', { length: 30 }).notNull(), // 'kg', 'ltr', 'pcs', 'pack'
  reorderLevel: text('reorder_level').notNull(),
  costPerUnit: text('cost_per_unit').notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id, { onDelete: 'set null' }),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().defaultNow(),
});

// 11. PURCHASE ORDERS
export const purchaseOrders = sqliteTable('purchase_orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  supplierId: integer('supplier_id').references(() => suppliers.id, { onDelete: 'cascade' }),
  itemName: text('item_name', { length: 150 }).notNull(),
  quantity: text('quantity').notNull(),
  cost: text('cost').notNull(),
  status: text('status', { length: 30 }).notNull().default('ordered'), // 'ordered', 'received'
  orderedAt: integer('ordered_at', { mode: 'timestamp_ms' }).notNull().defaultNow(),
});

// 12. EMPLOYEE SHIFTS
export const employeeShifts = sqliteTable('employee_shifts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  date: text('date', { length: 20 }).notNull(), // 'YYYY-MM-DD'
  startTime: text('start_time', { length: 10 }).notNull(), // '09:00'
  endTime: text('end_time', { length: 10 }).notNull(), // '17:00'
  role: text('role', { length: 30 }).notNull(), // 'chef', 'waiter', 'cashier', 'manager'
  status: text('status', { length: 30 }).notNull().default('scheduled'), // 'scheduled', 'completed', 'absent'
});

// 13. PAYMENTS
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }),
  amount: text('amount').notNull(),
  paymentMethod: text('payment_method', { length: 30 }).notNull(), // 'cash', 'card', 'upi', 'wallet'
  status: text('status', { length: 30 }).notNull().default('completed'), // 'pending', 'completed', 'refunded'
  transactionId: text('transaction_id', { length: 100 }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().defaultNow(),
});

// 14. COUPONS
export const coupons = sqliteTable('coupons', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code', { length: 50 }).notNull().unique(),
  discountType: text('discount_type', { length: 30 }).notNull(), // 'percentage', 'fixed'
  discountValue: text('discount_value').notNull(),
  minOrderAmount: text('min_order_amount').notNull().default('0.00'),
  expiryDate: text('expiry_date', { length: 20 }).notNull(), // 'YYYY-MM-DD'
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

// 15. REVIEWS
export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  menuItemId: integer('menu_item_id').references(() => menuItems.id, { onDelete: 'cascade' }),
  customerName: text('customer_name', { length: 100 }).notNull(),
  rating: integer('rating').notNull(), // 1 to 5
  comment: text('comment'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().defaultNow(),
});

// 16. EXPENSES
export const expenses = sqliteTable('expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  description: text('description', { length: 255 }).notNull(),
  category: text('category', { length: 100 }).notNull(), // 'Ingredients', 'Rent', 'Utilities', 'Salaries', 'Other'
  amount: text('amount').notNull(),
  date: text('date', { length: 20 }).notNull(), // 'YYYY-MM-DD'
  createdBy: text('created_by', { length: 100 }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().defaultNow(),
});

// RELATIONS DEFINITIONS
export const usersRelations = relations(users, ({ many }) => ({
  reservations: many(reservations),
  orders: many(orders),
  shifts: many(employeeShifts),
  chefs: many(chefs, { relationName: 'chefOwner' }),
  waiters: many(waiters, { relationName: 'waiterOwner' }),
  cashiers: many(cashiers, { relationName: 'cashierOwner' }),
  managedChefs: many(chefs, { relationName: 'chefManager' }),
  managedWaiters: many(waiters, { relationName: 'waiterManager' }),
  managedCashiers: many(cashiers, { relationName: 'cashierManager' }),
}));

export const chefsRelations = relations(chefs, ({ one }) => ({
  user: one(users, { fields: [chefs.userId], references: [users.id], relationName: 'chefOwner' }),
  manager: one(users, { fields: [chefs.managerId], references: [users.id], relationName: 'chefManager' }),
}));

export const waitersRelations = relations(waiters, ({ one }) => ({
  user: one(users, { fields: [waiters.userId], references: [users.id], relationName: 'waiterOwner' }),
  manager: one(users, { fields: [waiters.managerId], references: [users.id], relationName: 'waiterManager' }),
}));

export const cashiersRelations = relations(cashiers, ({ one }) => ({
  user: one(users, { fields: [cashiers.userId], references: [users.id], relationName: 'cashierOwner' }),
  manager: one(users, { fields: [cashiers.managerId], references: [users.id], relationName: 'cashierManager' }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  menuItems: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  category: one(categories, {
    fields: [menuItems.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
  reviews: many(reviews),
}));

export const restaurantTablesRelations = relations(restaurantTables, ({ many }) => ({
  reservations: many(reservations),
  orders: many(orders),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  customer: one(users, {
    fields: [reservations.customerId],
    references: [users.id],
  }),
  table: one(restaurantTables, {
    fields: [reservations.tableId],
    references: [restaurantTables.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
  }),
  table: one(restaurantTables, {
    fields: [orders.tableId],
    references: [restaurantTables.id],
  }),
  orderItems: many(orderItems),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  inventoryItems: many(inventoryItems),
  purchaseOrders: many(purchaseOrders),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [inventoryItems.supplierId],
    references: [suppliers.id],
  }),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [purchaseOrders.supplierId],
    references: [suppliers.id],
  }),
}));

export const employeeShiftsRelations = relations(employeeShifts, ({ one }) => ({
  employee: one(users, {
    fields: [employeeShifts.userId],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  menuItem: one(menuItems, {
    fields: [reviews.menuItemId],
    references: [menuItems.id],
  }),
}));

