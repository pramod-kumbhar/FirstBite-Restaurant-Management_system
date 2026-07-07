import { mysqlTable, varchar, text, int, bigint, decimal, boolean, timestamp, serial, primaryKey } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// 1. USERS (Customers & Employees/Staff)
export const users = mysqlTable('users', {
  id: serial('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull().default(''),
  phone: varchar('phone', { length: 20 }),
  addressLine: varchar('address_line', { length: 255 }),
  district: varchar('district', { length: 100 }),
  state: varchar('state', { length: 100 }),
  pincode: varchar('pincode', { length: 20 }),
  role: varchar('role', { length: 30 }).notNull().default('customer'), // 'customer', 'manager', 'chef', 'waiter', 'cashier'
  pin: varchar('pin', { length: 6 }), // Quick access pin for POS/terminal access
  loyaltyPoints: int('loyalty_points').notNull().default(0),
  isEmailVerified: boolean('is_email_verified').notNull().default(false),
  isApproved: boolean('is_approved').notNull().default(true),
  emailVerificationToken: varchar('email_verification_token', { length: 255 }),
  emailVerifiedAt: timestamp('email_verified_at', { mode: 'date' }),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpiresAt: timestamp('password_reset_expires_at', { mode: 'date' }),
  joinedAt: timestamp('joined_at', { mode: 'date' }).notNull().defaultNow(),
});

// 2. ROLE-SPECIFIC STAFF PROFILES
export const chefs = mysqlTable('chefs', {
  id: serial('id').primaryKey().autoincrement(),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  managerId: bigint('manager_id', { mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 30 }).notNull().default('active'),
  specialization: varchar('specialization', { length: 100 }),
  joinedAt: timestamp('joined_at', { mode: 'date' }).notNull().defaultNow(),
});

export const waiters = mysqlTable('waiters', {
  id: serial('id').primaryKey().autoincrement(),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  managerId: bigint('manager_id', { mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 30 }).notNull().default('active'),
  section: varchar('section', { length: 100 }),
  joinedAt: timestamp('joined_at', { mode: 'date' }).notNull().defaultNow(),
});

export const cashiers = mysqlTable('cashiers', {
  id: serial('id').primaryKey().autoincrement(),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  managerId: bigint('manager_id', { mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 30 }).notNull().default('active'),
  shiftPreference: varchar('shift_preference', { length: 100 }),
  joinedAt: timestamp('joined_at', { mode: 'date' }).notNull().defaultNow(),
});

// 3. CATEGORIES
export const categories = mysqlTable('categories', {
  id: serial('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
});

// 4. MENU ITEMS
export const menuItems = mysqlTable('menu_items', {
  id: serial('id').primaryKey().autoincrement(),
  categoryId: bigint('category_id', { mode: 'number' }).references(() => categories.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  isAvailable: boolean('is_available').notNull().default(true),
  isVegetarian: boolean('is_vegetarian').notNull().default(false),
  isVegan: boolean('is_vegan').notNull().default(false),
  isGlutenFree: boolean('is_gluten_free').notNull().default(false),
  imageUrl: text('image_url'),
  spiceLevel: int('spice_level').notNull().default(0), // 0: None, 1: Low, 2: Medium, 3: High
  preparationTime: int('preparation_time').notNull().default(15), // minutes
});

// 5. RESTAURANT TABLES
export const restaurantTables = mysqlTable('restaurant_tables', {
  id: serial('id').primaryKey().autoincrement(),
  tableNumber: varchar('table_number', { length: 10 }).notNull().unique(),
  capacity: int('capacity').notNull(),
  status: varchar('status', { length: 30 }).notNull().default('available'), // 'available', 'occupied', 'reserved'
  qrCodeUrl: text('qr_code_url'),
});

// 6. RESERVATIONS
export const reservations = mysqlTable('reservations', {
  id: serial('id').primaryKey().autoincrement(),
  customerId: bigint('customer_id', { mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
  customerName: varchar('customer_name', { length: 100 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 20 }).notNull(),
  tableId: bigint('table_id', { mode: 'number' }).references(() => restaurantTables.id, { onDelete: 'set null' }),
  reservationTime: timestamp('reservation_time', { mode: 'date' }).notNull(),
  numberOfGuests: int('number_of_guests').notNull(),
  status: varchar('status', { length: 30 }).notNull().default('pending'), // 'pending', 'confirmed', 'completed', 'cancelled'
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

// 7. ORDERS
export const orders = mysqlTable('orders', {
  id: serial('id').primaryKey().autoincrement(),
  customerId: bigint('customer_id', { mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
  tableId: bigint('table_id', { mode: 'number' }).references(() => restaurantTables.id, { onDelete: 'set null' }),
  orderType: varchar('order_type', { length: 30 }).notNull().default('dine-in'), // 'dine-in', 'takeaway', 'delivery'
  status: varchar('status', { length: 30 }).notNull().default('pending'), // 'pending', 'accepted', 'cooking', 'ready', 'served', 'completed', 'cancelled'
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  gstAmount: decimal('gst_amount', { precision: 10, scale: 2 }).notNull().default('0.00'),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).notNull().default('0.00'),
  finalAmount: decimal('final_amount', { precision: 10, scale: 2 }).notNull(),
  couponCode: varchar('coupon_code', { length: 50 }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

// 8. ORDER ITEMS
export const orderItems = mysqlTable('order_items', {
  id: serial('id').primaryKey().autoincrement(),
  orderId: bigint('order_id', { mode: 'number' }).references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: bigint('menu_item_id', { mode: 'number' }).references(() => menuItems.id, { onDelete: 'cascade' }),
  quantity: int('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
  status: varchar('status', { length: 30 }).notNull().default('pending'), // 'pending', 'cooking', 'ready', 'served'
});

// 9. SUPPLIERS
export const suppliers = mysqlTable('suppliers', {
  id: serial('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 150 }).notNull(),
  contactPerson: varchar('contact_person', { length: 100 }),
  email: varchar('email', { length: 150 }),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
});

// 10. INVENTORY ITEMS
export const inventoryItems = mysqlTable('inventory_items', {
  id: serial('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 150 }).notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unit: varchar('unit', { length: 30 }).notNull(), // 'kg', 'ltr', 'pcs', 'pack'
  reorderLevel: decimal('reorder_level', { precision: 10, scale: 2 }).notNull(),
  costPerUnit: decimal('cost_per_unit', { precision: 10, scale: 2 }).notNull(),
  supplierId: bigint('supplier_id', { mode: 'number' }).references(() => suppliers.id, { onDelete: 'set null' }),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

// 11. PURCHASE ORDERS
export const purchaseOrders = mysqlTable('purchase_orders', {
  id: serial('id').primaryKey().autoincrement(),
  supplierId: bigint('supplier_id', { mode: 'number' }).references(() => suppliers.id, { onDelete: 'cascade' }),
  itemName: varchar('item_name', { length: 150 }).notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  cost: decimal('cost', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 30 }).notNull().default('ordered'), // 'ordered', 'received'
  orderedAt: timestamp('ordered_at', { mode: 'date' }).notNull().defaultNow(),
});

// 12. EMPLOYEE SHIFTS
export const employeeShifts = mysqlTable('employee_shifts', {
  id: serial('id').primaryKey().autoincrement(),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }),
  date: varchar('date', { length: 20 }).notNull(), // 'YYYY-MM-DD'
  startTime: varchar('start_time', { length: 10 }).notNull(), // '09:00'
  endTime: varchar('end_time', { length: 10 }).notNull(), // '17:00'
  role: varchar('role', { length: 30 }).notNull(), // 'chef', 'waiter', 'cashier', 'manager'
  status: varchar('status', { length: 30 }).notNull().default('scheduled'), // 'scheduled', 'completed', 'absent'
});

// 13. PAYMENTS
export const payments = mysqlTable('payments', {
  id: serial('id').primaryKey().autoincrement(),
  orderId: bigint('order_id', { mode: 'number' }).references(() => orders.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 30 }).notNull(), // 'cash', 'card', 'upi', 'wallet'
  status: varchar('status', { length: 30 }).notNull().default('completed'), // 'pending', 'completed', 'refunded'
  transactionId: varchar('transaction_id', { length: 100 }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

// 14. COUPONS
export const coupons = mysqlTable('coupons', {
  id: serial('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  discountType: varchar('discount_type', { length: 30 }).notNull(), // 'percentage', 'fixed'
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal('min_order_amount', { precision: 10, scale: 2 }).notNull().default('0.00'),
  expiryDate: varchar('expiry_date', { length: 20 }).notNull(), // 'YYYY-MM-DD'
  isActive: boolean('is_active').notNull().default(true),
});

// 15. REVIEWS
export const reviews = mysqlTable('reviews', {
  id: serial('id').primaryKey().autoincrement(),
  menuItemId: bigint('menu_item_id', { mode: 'number' }).references(() => menuItems.id, { onDelete: 'cascade' }),
  customerName: varchar('customer_name', { length: 100 }).notNull(),
  rating: int('rating').notNull(), // 1 to 5
  comment: text('comment'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

// 16. EXPENSES
export const expenses = mysqlTable('expenses', {
  id: serial('id').primaryKey().autoincrement(),
  description: varchar('description', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(), // 'Ingredients', 'Rent', 'Utilities', 'Salaries', 'Other'
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  date: varchar('date', { length: 20 }).notNull(), // 'YYYY-MM-DD'
  createdBy: varchar('created_by', { length: 100 }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
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
