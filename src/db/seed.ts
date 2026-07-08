import { client, db } from './index';
import { 
  users, categories, menuItems, restaurantTables, reservations, 
  orders, orderItems, suppliers, inventoryItems, purchaseOrders, 
  employeeShifts, payments, coupons, reviews, expenses, chefs, waiters, cashiers 
} from './schema';
import { sql } from 'drizzle-orm';

const defaultManagerPasswordHash = '$2b$10$umKJd.rOvMv3mcZPlUySxu9Q8vs4FFDXKM3bsp94KyVAtqZL4SsRu';

const globalForSeed = globalThis as typeof globalThis & {
  __firstBiteSeedState?: {
    checked: boolean;
    seeded: boolean;
    pending?: Promise<boolean>;
  };
};

const seedState = globalForSeed.__firstBiteSeedState ?? {
  checked: false,
  seeded: false,
};

globalForSeed.__firstBiteSeedState = seedState;

export async function isDatabaseSeeded() {
  if (seedState.checked) {
    return seedState.seeded;
  }

  try {
    const result = await db.select({ count: sql<number>`count(*)` }).from(menuItems);
    const count = Number(result[0]?.count || 0);
    seedState.checked = true;
    seedState.seeded = count >= 25;
    return seedState.seeded;
  } catch (error) {
    console.error("Check seed error:", error);
    seedState.checked = false;
    seedState.seeded = false;
    return false;
  }
}

export async function ensureDatabaseSeeded() {
  if (await isDatabaseSeeded()) {
    return false;
  }

  if (!seedState.pending) {
    seedState.pending = (async () => {
      seedState.checked = false;
      if (await isDatabaseSeeded()) {
        return false;
      }
      await seedDatabase();
      return true;
    })().finally(() => {
      seedState.pending = undefined;
    });
  }

  return seedState.pending;
}

export async function seedDatabase() {
  console.log("Seeding started...");

  // 1. Clear existing table contents in dependency order.
  await db.delete(reviews);
  await db.delete(payments);
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(reservations);
  await db.delete(employeeShifts);
  await db.delete(purchaseOrders);
  await db.delete(inventoryItems);
  await db.delete(suppliers);
  await db.delete(menuItems);
  await db.delete(categories);
  await db.delete(restaurantTables);
  await db.delete(cashiers);
  await db.delete(waiters);
  await db.delete(chefs);
  await db.delete(users);
  await db.delete(coupons);
  await db.delete(expenses);
  client.prepare('DELETE FROM sqlite_sequence').run();

  // 2. Create the default manager account.
  await db.insert(users).values({
    name: 'Manager',
    email: 'manager@restaurant.com',
    password: defaultManagerPasswordHash,
    role: 'manager',
    loyaltyPoints: 0,
    isEmailVerified: true,
    isApproved: true,
  });

  const customerAlice = null;
  const customerBob = null;

  // 3. Insert Categories
  await db.insert(categories).values([
    { name: 'Appetizers', description: 'Quick bites, starters and soups to warm up', imageUrl: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=500&auto=format&fit=crop&q=60' },
    { name: 'Pizzas', description: 'Wood-fired Italian style craft pizzas', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60' },
    { name: 'Burgers & Mains', description: 'Gourmet burgers and delicious signature plates', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60' },
    { name: 'Desserts', description: 'Decadent sweet endings curated by our chefs', imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop&q=60' },
    { name: 'Beverages', description: 'Craft cocktails, mocktails, beers and soft drinks', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60' }
  ]);

  const seededCategories = await db.select().from(categories);
  const catAppetizer = seededCategories.find((c: typeof categories.$inferSelect) => c.name === 'Appetizers')!;
  const catPizza = seededCategories.find((c: typeof categories.$inferSelect) => c.name === 'Pizzas')!;
  const catMain = seededCategories.find((c: typeof categories.$inferSelect) => c.name === 'Burgers & Mains')!;
  const catDessert = seededCategories.find((c: typeof categories.$inferSelect) => c.name === 'Desserts')!;
  const catBeverage = seededCategories.find((c: typeof categories.$inferSelect) => c.name === 'Beverages')!;

  // 4. Insert Menu Items
  await db.insert(menuItems).values([
    // Appetizers
    { categoryId: catAppetizer.id, name: 'Truffle Fries', description: 'Crispy golden fries tossed in black truffle oil, parmesan, and fresh herbs.', price: '8.50', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 8 },
    { categoryId: catAppetizer.id, name: 'Garlic Butter Shrimp', description: 'Sautéed wild shrimps in garlic, white wine, lemon and butter sauce, served with grilled baguette.', price: '14.90', isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1625938146369-adc83368bda7?w=400&auto=format&fit=crop&q=60', spiceLevel: 1, preparationTime: 12 },
    { categoryId: catAppetizer.id, name: 'Crispy Cauliflower Wings', description: 'Gluten-free batter fried cauliflower florets glazed in hot buffalo or sticky BBQ sauce.', price: '10.50', isAvailable: true, isVegetarian: true, isVegan: true, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?w=400&auto=format&fit=crop&q=60', spiceLevel: 2, preparationTime: 10 },
    { categoryId: catAppetizer.id, name: 'Paneer Tikka Skewers', description: 'Chargrilled cottage cheese cubes with smoky spices, mint chutney, and lemon wedges.', price: '11.20', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop&q=60', spiceLevel: 2, preparationTime: 10 },
    { categoryId: catAppetizer.id, name: 'Chicken Seekh Kebab', description: 'Minced chicken kebabs with herbs, onions and a charred finish served with pickled onions.', price: '13.40', isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&auto=format&fit=crop&q=60', spiceLevel: 2, preparationTime: 12 },
    { categoryId: catAppetizer.id, name: 'Creamy Mushroom Bruschetta', description: 'Toasted baguette slices topped with creamy sautéed wild mushrooms, garlic, and fresh thyme.', price: '9.50', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 7 },
    { categoryId: catAppetizer.id, name: 'Golden Calamari Rings', description: 'Crispy pepper-crusted squid rings served with a side of lemon garlic aioli.', price: '12.80', isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&auto=format&fit=crop&q=60', spiceLevel: 1, preparationTime: 10 },

    // Pizzas
    { categoryId: catPizza.id, name: 'Classic Margherita', description: 'San Marzano tomato base, fresh buffalo mozzarella, fresh basil leaves, and a drizzle of extra virgin olive oil.', price: '14.00', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 12 },
    { categoryId: catPizza.id, name: 'Double Pepperoni Inferno', description: 'Spicy pepperoni slices, jalapeños, mozzarella, red chili flakes, and hot honey drizzle.', price: '16.50', isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&auto=format&fit=crop&q=60', spiceLevel: 3, preparationTime: 14 },
    { categoryId: catPizza.id, name: 'Tuscan Truffle Mushroom Pizza', description: 'Creamy white sauce base, wild porcini mushrooms, caramelized onions, mozzarella, rosemary and truffle oil.', price: '17.90', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 15 },
    { categoryId: catPizza.id, name: 'Garden Pesto & Goat Cheese Pizza', description: 'Classic green basil pesto, tangy goat cheese, sun-dried tomatoes, pine nuts and baby arugula.', price: '16.20', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 13 },
    { categoryId: catPizza.id, name: 'BBQ Smoked Chicken Pizza', description: 'Tangy barbecue sauce base, pulled smoked chicken breast, red onions, cilantro and fresh Gouda.', price: '17.55', isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=60', spiceLevel: 1, preparationTime: 14 },

    // Burgers & Mains
    { categoryId: catMain.id, name: 'The Ultimate Wagyu Burger', description: 'Pan-seared premium Wagyu beef patty, sharp cheddar cheese, caramelized onions, butter lettuce, and signature truffle aioli on toasted brioche.', price: '19.50', isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 15 },
    { categoryId: catMain.id, name: 'Pan-Seared Salmon Fillet', description: 'Crispy skin salmon with lemon-herb butter sauce, wild rice pilaf, and roasted asparagus.', price: '24.00', isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 18 },
    { categoryId: catMain.id, name: 'Vegan Buddha Bowl', description: 'Warm quinoa, spiced chickpeas, avocado, shredded beetroots, kale, roasted sweet potato, topped with tahini dressing.', price: '15.50', isAvailable: true, isVegetarian: true, isVegan: true, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 10 },
    { categoryId: catMain.id, name: 'Paneer Butter Masala', description: 'Creamy tomato-based curry with roasted paneer, served with basmati rice and garlic naan.', price: '16.80', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=60', spiceLevel: 1, preparationTime: 18 },
    { categoryId: catMain.id, name: 'Chicken Tikka Masala', description: 'Tender grilled chicken in a rich tomato cream sauce with warm spices and steamed rice.', price: '18.50', isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&auto=format&fit=crop&q=60', spiceLevel: 2, preparationTime: 18 },
    { categoryId: catMain.id, name: 'Truffle Mushroom Risotto', description: 'Slow-cooked Arborio rice infused with porcini broth, wild mushrooms, parmesan cheese, and truffle essence.', price: '18.00', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 15 },
    { categoryId: catMain.id, name: 'Slow-Cooked Lamb Shank', description: 'Tender New Zealand lamb shank slow-braised in red wine and fresh herbs, served on rustic garlic mash.', price: '28.50', isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=60', spiceLevel: 1, preparationTime: 22 },

    // Desserts
    { categoryId: catDessert.id, name: 'Molten Lava Cake', description: 'Rich chocolate cake with a warm flowing liquid chocolate center, served with a scoop of vanilla bean gelato.', price: '8.90', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 10 },
    { categoryId: catDessert.id, name: 'Tiramisu Classico', description: 'Espresso dipped ladyfingers layered with fluffy whipped mascarpone cream and dusted with dark cocoa powder.', price: '9.00', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 5 },
    { categoryId: catDessert.id, name: 'Warm Apple Crumble Tart', description: 'Spiced apple filling inside flaky pastry crust, topped with golden oats crumble and caramel glaze.', price: '8.20', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1508737804141-4c3b688e2546?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 10 },
    { categoryId: catDessert.id, name: 'Gourmet Mango Panna Cotta', description: 'Creamy cold custard topped with sweet fresh Alphonso mango purée and fresh mint.', price: '7.80', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 5 },

    // Beverages
    { categoryId: catBeverage.id, name: 'Smoked Rosemary Old Fashioned', description: 'Premium bourbon, bitters, orange zest, infused with aromatic rosemary wood smoke.', price: '12.00', isAvailable: true, isVegetarian: true, isVegan: true, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 4 },
    { categoryId: catBeverage.id, name: 'Fresh Mint Mojito', description: 'Freshly muddled lime, mint leaves, raw sugar, white rum, topped with sparkling soda and crushed ice.', price: '9.50', isAvailable: true, isVegetarian: true, isVegan: true, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 3 },
    { categoryId: catBeverage.id, name: 'Sparkling Hibiscus Lemonade', description: 'A refreshing iced fizzy drink of brewed organic hibiscus blossoms, freshly squeezed lemon juice, and honey.', price: '6.50', isAvailable: true, isVegetarian: true, isVegan: true, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 3 },
    { categoryId: catBeverage.id, name: 'Espresso Martini Mocktail', description: 'Chilled premium dark espresso shake, house vanilla sweetener syrup, shaken over ice with a frothy head.', price: '8.00', isAvailable: true, isVegetarian: true, isVegan: true, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 4 }
  ]);

  const seededMenuItems = await db.select().from(menuItems);
  const menuTruffleFries = seededMenuItems.find((m: typeof menuItems.$inferSelect) => m.name === 'Truffle Fries')!;
  const menuMargherita = seededMenuItems.find((m: typeof menuItems.$inferSelect) => m.name === 'Classic Margherita')!;
  const menuWagyuBurger = seededMenuItems.find((m: typeof menuItems.$inferSelect) => m.name === 'The Ultimate Wagyu Burger')!;

  // 5. Insert Restaurant Tables
  await db.insert(restaurantTables).values([
    { tableNumber: 'T1', capacity: 2, status: 'available', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=table-T1' },
    { tableNumber: 'T2', capacity: 2, status: 'occupied', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=table-T2' },
    { tableNumber: 'T3', capacity: 4, status: 'available', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=table-T3' },
    { tableNumber: 'T4', capacity: 4, status: 'reserved', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=table-T4' },
    { tableNumber: 'T5', capacity: 6, status: 'available', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=table-T5' },
    { tableNumber: 'T6', capacity: 8, status: 'occupied', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=table-T6' }
  ]);

  const seededTables = await db.select().from(restaurantTables);
  const tableT1 = seededTables.find((t: typeof restaurantTables.$inferSelect) => t.tableNumber === 'T1')!;
  const tableT2 = seededTables.find((t: typeof restaurantTables.$inferSelect) => t.tableNumber === 'T2')!;
  const tableT4 = seededTables.find((t: typeof restaurantTables.$inferSelect) => t.tableNumber === 'T4')!;
  const tableT6 = seededTables.find((t: typeof restaurantTables.$inferSelect) => t.tableNumber === 'T6')!;

  // 6. Insert Coupons
  await db.insert(coupons).values([
    { code: 'WELCOME10', discountType: 'percentage', discountValue: '10.00', minOrderAmount: '20.00', expiryDate: '2027-12-31', isActive: true },
    { code: 'SAVEFIFTY', discountType: 'fixed', discountValue: '50.00', minOrderAmount: '150.00', expiryDate: '2027-12-31', isActive: true },
    { code: 'CHEFGET20', discountType: 'percentage', discountValue: '20.00', minOrderAmount: '50.00', expiryDate: '2027-06-30', isActive: true }
  ]);

  // 7. Insert Suppliers
  await db.insert(suppliers).values([
    { name: 'Fresh Fields Produce', contactPerson: 'Gary Green', email: 'gary@freshfields.com', phone: '555-0211', address: '44 Organic Way, Green Valley' },
    { name: 'Global Meats & Seafood', contactPerson: 'Samantha Catch', email: 'orders@globalmeats.com', phone: '555-0222', address: '10 Dockside Industrial Park' },
    { name: 'Venezia Italian Dry Goods', contactPerson: 'Giovanni Baker', email: 'giovanni@venezia.com', phone: '555-0233', address: '78 Pasta Blvd, Little Italy' }
  ]);

  const seededSuppliers = await db.select().from(suppliers);
  const supplierFresh = seededSuppliers.find((s: typeof suppliers.$inferSelect) => s.name === 'Fresh Fields Produce')!;
  const supplierMeat = seededSuppliers.find((s: typeof suppliers.$inferSelect) => s.name === 'Global Meats & Seafood')!;
  const supplierItalian = seededSuppliers.find((s: typeof suppliers.$inferSelect) => s.name === 'Venezia Italian Dry Goods')!;

  // 8. Insert Inventory Items (including low stock to trigger low-stock warnings)
  await db.insert(inventoryItems).values([
    { name: 'Wagyu Beef Patties', quantity: '15.00', unit: 'pcs', reorderLevel: '20.00', costPerUnit: '8.50', supplierId: supplierMeat.id },
    { name: 'Fresh Idaho Potatoes', quantity: '120.00', unit: 'kg', reorderLevel: '50.00', costPerUnit: '1.20', supplierId: supplierFresh.id },
    { name: 'Avocados', quantity: '8.00', unit: 'pcs', reorderLevel: '15.00', costPerUnit: '1.50', supplierId: supplierFresh.id }, // Low stock
    { name: 'San Marzano Tomatoes', quantity: '45.00', unit: 'kg', reorderLevel: '20.00', costPerUnit: '3.40', supplierId: supplierItalian.id },
    { name: 'Buffalo Mozzarella', quantity: '4.50', unit: 'kg', reorderLevel: '10.00', costPerUnit: '12.00', supplierId: supplierItalian.id }, // Low stock
    { name: 'Wild Shrimps 16/20', quantity: '18.00', unit: 'kg', reorderLevel: '15.00', costPerUnit: '22.00', supplierId: supplierMeat.id },
    { name: 'Truffle Oil', quantity: '2.10', unit: 'ltr', reorderLevel: '1.00', costPerUnit: '85.00', supplierId: supplierItalian.id }
  ]);

  // 9. Insert Purchase Orders
  await db.insert(purchaseOrders).values([
    { supplierId: supplierItalian.id, itemName: 'Buffalo Mozzarella', quantity: '20.00', cost: '240.00', status: 'ordered' },
    { supplierId: supplierFresh.id, itemName: 'Avocados', quantity: '50.00', cost: '75.00', status: 'ordered' },
    { supplierId: supplierMeat.id, itemName: 'Wagyu Beef Patties', quantity: '100.00', cost: '850.00', status: 'received' }
  ]);

  // 10. Insert Reservations
  const dateStrAt = (hoursAhead: number) => {
    const d = new Date();
    d.setHours(d.getHours() + hoursAhead);
    return d;
  };

  await db.insert(reservations).values([
    { customerId: null, customerName: 'Alice Smith', customerPhone: '555-0199', tableId: tableT4.id, reservationTime: dateStrAt(2), numberOfGuests: 4, status: 'confirmed', notes: 'Anniversary celebration, prefer window seat' },
    { customerId: null, customerName: 'Bob Johnson', customerPhone: '555-0188', tableId: tableT1.id, reservationTime: dateStrAt(5), numberOfGuests: 2, status: 'pending', notes: 'Need vegetarian options pointed out' },
    { customerId: null, customerName: 'Charlotte York', customerPhone: '555-7839', tableId: tableT2.id, reservationTime: dateStrAt(-3), numberOfGuests: 2, status: 'completed', notes: '' }
  ]);

  // 11. Skip seeded employee shifts when no default staff accounts are present.
  const formatYmd = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  // 12. Create Orders & Order Items
  // Order 1 (Completed & Paid, Alice)
  await db.insert(orders).values({
    customerId: null,
    tableId: tableT6.id,
    orderType: 'dine-in',
    status: 'completed',
    totalAmount: '47.50',
    gstAmount: '2.38', // 5% GST
    discountAmount: '4.75', // 10% coupon
    finalAmount: '45.13',
    couponCode: 'WELCOME10',
    notes: 'Please make the steak medium-rare, fries extra crispy.',
    createdAt: new Date(Date.now() - 3600000 * 4), // 4 hours ago
    updatedAt: new Date(Date.now() - 3600000 * 4)
  });

  // Order 2 (In Cooking - Chef is preparing this, Table T2)
  await db.insert(orders).values({
    customerId: null,
    tableId: tableT2.id,
    orderType: 'dine-in',
    status: 'cooking',
    totalAmount: '30.50',
    gstAmount: '1.53',
    discountAmount: '0.00',
    finalAmount: '32.03',
    notes: 'No spicy flakes on Pizza please.',
    createdAt: new Date(Date.now() - 1200000), // 20 mins ago
    updatedAt: new Date(Date.now() - 1200000)
  });

  // Order 3 (Pending checkout at Cashier counter)
  await db.insert(orders).values({
    customerId: null,
    tableId: tableT1.id,
    orderType: 'dine-in',
    status: 'served',
    totalAmount: '24.90',
    gstAmount: '1.25',
    discountAmount: '0.00',
    finalAmount: '26.15',
    notes: 'Table 1 requests split bill check.',
    createdAt: new Date(Date.now() - 3000000), // 50 mins ago
    updatedAt: new Date(Date.now() - 3000000)
  });

  // Fetch the orders back to get their IDs
  const seededOrders = await db.select().from(orders);
  const order1 = seededOrders.find((o: typeof orders.$inferSelect) => o.tableId === tableT6.id && o.status === 'completed');
  const order2 = seededOrders.find((o: typeof orders.$inferSelect) => o.tableId === tableT2.id && o.status === 'cooking');
  const order3 = seededOrders.find((o: typeof orders.$inferSelect) => o.tableId === tableT1.id && o.status === 'served');

  if (order1) {
    await db.insert(orderItems).values([
      { orderId: order1.id, menuItemId: menuWagyuBurger.id, quantity: 2, unitPrice: '19.50', notes: 'Extra cheese', status: 'served' },
      { orderId: order1.id, menuItemId: menuTruffleFries.id, quantity: 1, unitPrice: '8.50', notes: 'Extra crispy', status: 'served' }
    ]);

    await db.insert(payments).values({
      orderId: order1.id,
      amount: '45.13',
      paymentMethod: 'card',
      status: 'completed',
      transactionId: 'TXN-90234857',
      createdAt: new Date(Date.now() - 3600000 * 3.8)
    });
  }

  if (order2) {
    await db.insert(orderItems).values([
      { orderId: order2.id, menuItemId: menuMargherita.id, quantity: 1, unitPrice: '14.00', notes: '', status: 'cooking' },
      { orderId: order2.id, menuItemId: menuWagyuBurger.id, quantity: 1, unitPrice: '19.50', notes: 'No tomato', status: 'pending' },
      { orderId: order2.id, menuItemId: menuTruffleFries.id, quantity: 1, unitPrice: '8.50', notes: '', status: 'ready' }
    ]);
  }

  if (order3) {
    await db.insert(orderItems).values([
      { orderId: order3.id, menuItemId: menuWagyuBurger.id, quantity: 1, unitPrice: '19.50', notes: '', status: 'served' },
      { orderId: order3.id, menuItemId: menuTruffleFries.id, quantity: 1, unitPrice: '8.50', notes: '', status: 'served' }
    ]);
  }

  // 13. Insert Reviews
  await db.insert(reviews).values([
    { menuItemId: menuWagyuBurger.id, customerName: 'Alice Smith', rating: 5, comment: 'Hands down the best Wagyu burger in town! Super juicy.' },
    { menuItemId: menuMargherita.id, customerName: 'Bob Johnson', rating: 4, comment: 'Very authentic Italian woodfire crust, loved the fresh basil!' },
    { menuItemId: menuTruffleFries.id, customerName: 'Dave Higgins', rating: 5, comment: 'So addictive. Truffle flavor is intense and amazing.' }
  ]);

  // 14. Insert Expenses
  await db.insert(expenses).values([
    { description: 'Fresh produce restock from Fresh Fields', category: 'Ingredients', amount: '250.00', date: formatYmd(0), createdBy: 'Manager Account' },
    { description: 'Monthly electricity bill', category: 'Utilities', amount: '850.00', date: formatYmd(-5), createdBy: 'Manager Account' },
    { description: 'Staff salaries advance payment', category: 'Salaries', amount: '1200.00', date: formatYmd(-12), createdBy: 'Manager Account' }
  ]);

  console.log("Seeding successfully completed!");
  seedState.checked = true;
  seedState.seeded = true;
}
