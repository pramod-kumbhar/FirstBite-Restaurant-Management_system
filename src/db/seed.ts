import { client, db } from './index';
import { 
  users, categories, menuItems, restaurantTables, reservations, 
  orders, orderItems, suppliers, inventoryItems, purchaseOrders, 
  employeeShifts, payments, coupons, reviews, expenses, chefs, waiters, cashiers 
} from './schema';
import { sql, ne, and, eq } from 'drizzle-orm';

const defaultManagerPasswordHash = '$2b$10$lodaOzPpCdSW.fg.0aSEh.Vq7Lhk4zO91trkI.R3/KLEl9siyqJr2';
const defaultOwnerPasswordHash = '$2b$10$4sLLnHCaUlxFT35Siw2TEOvqiCQu.QHLDPP6j1rZ1ebXG5x6eoT3y';

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
    seedState.seeded = count > 0;
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
      await seedDatabase(false);
      return true;
    })().finally(() => {
      seedState.pending = undefined;
    });
  }

  return seedState.pending;
}

export async function seedDatabase(isReset: boolean = false) {
  console.log(`Seeding started (isReset: ${isReset})...`);

  // 1. Clear existing table contents in dependency order ONLY if resetting.
  if (isReset) {
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
    // Keep custom customer accounts, owners, and managers during resets
    await db.delete(users).where(and(ne(users.role, 'customer'), ne(users.role, 'owner'), ne(users.role, 'manager')));
    await db.delete(coupons);
    await db.delete(expenses);
    try {
      if (typeof (client as any).prepare === 'function') {
        (client as any).prepare('DELETE FROM sqlite_sequence').run();
      } else {
        await (client as any).execute('DELETE FROM sqlite_sequence');
      }
    } catch (e) {
      console.error("Failed to clear sqlite_sequence:", e);
    }
  }

  // 1.5 Create the default owner account if missing.
  const existingOwner = await db.select().from(users).where(eq(users.role, 'owner')).limit(1);
  if (existingOwner.length === 0) {
    await db.insert(users).values({
      name: 'Owner',
      email: 'owner@restaurant.com',
      password: defaultOwnerPasswordHash,
      role: 'owner',
      loyaltyPoints: 0,
      isEmailVerified: true,
      isApproved: true,
      branch: 'Ichalkaranji',
    });
  }

  // 2. Create the default manager account if missing.
  const existingManager = await db.select().from(users).where(eq(users.role, 'manager')).limit(1);
  if (existingManager.length === 0) {
    await db.insert(users).values({
      name: 'Manager',
      email: 'manager@restaurant.com',
      password: defaultManagerPasswordHash,
      role: 'manager',
      loyaltyPoints: 0,
      isEmailVerified: true,
      isApproved: true,
      branch: 'Ichalkaranji',
    });
  }

  const customerAlice = null;
  const customerBob = null;

  // 3. Insert Categories if table is empty
  const categoriesCount = (await db.select({ count: sql<number>`count(*)` }).from(categories))[0].count;
  if (isReset || categoriesCount === 0) {
    await db.insert(categories).values([
      { name: 'Appetizers', description: 'Quick bites, starters and soups to warm up', imageUrl: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=500&auto=format&fit=crop&q=60' },
      { name: 'Indian Royal Curries & Tandoor', description: 'Authentic Indian curries, tandoori kebabs, dum biryani & artisanal breads', imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=60' },
      { name: 'Pizzas', description: 'Wood-fired Italian style craft pizzas', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60' },
      { name: 'Burgers & Mains', description: 'Gourmet burgers and delicious signature plates', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60' },
      { name: 'Desserts', description: 'Decadent sweet endings curated by our chefs', imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop&q=60' },
      { name: 'Beverages', description: 'Craft cocktails, mocktails, beers and soft drinks', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60' }
    ]);
  }

  const seededCategories = await db.select().from(categories);
  const catAppetizer = seededCategories.find((c: typeof categories.$inferSelect) => c.name === 'Appetizers')!;
  const catIndian = seededCategories.find((c: typeof categories.$inferSelect) => c.name === 'Indian Royal Curries & Tandoor') || catAppetizer;
  const catPizza = seededCategories.find((c: typeof categories.$inferSelect) => c.name === 'Pizzas')!;
  const catMain = seededCategories.find((c: typeof categories.$inferSelect) => c.name === 'Burgers & Mains')!;
  const catDessert = seededCategories.find((c: typeof categories.$inferSelect) => c.name === 'Desserts')!;
  const catBeverage = seededCategories.find((c: typeof categories.$inferSelect) => c.name === 'Beverages')!;

  // 4. Insert Menu Items if table is empty
  const menuItemsCount = (await db.select({ count: sql<number>`count(*)` }).from(menuItems))[0].count;
  if (isReset || menuItemsCount === 0) {
    await db.insert(menuItems).values([
      // Indian Royal Curries & Tandoor
      { categoryId: catIndian.id, name: 'Butter Chicken Deluxe (Murgh Makhani)', description: 'Tender tandoori chicken cooked in rich tomato, butter, and cashew gravy with fenugreek leaves.', price: '490.00', isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80', spiceLevel: 2, preparationTime: 18 },
      { categoryId: catIndian.id, name: 'Dal Makhani Handi', description: 'Slow-cooked black lentils simmered overnight with butter, cream, and aromatic Indian spices.', price: '340.00', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80', spiceLevel: 1, preparationTime: 15 },
      { categoryId: catIndian.id, name: 'Kadhai Paneer Special', description: 'Fresh cottage cheese cubes tossed with bell peppers, onions, and freshly ground kadhai masala.', price: '380.00', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80', spiceLevel: 2, preparationTime: 16 },
      { categoryId: catIndian.id, name: 'Hyderabadi Dum Chicken Biryani', description: 'Aromatic long-grain basmati rice layered with spiced marinated chicken, saffron, mint, and fried onions.', price: '460.00', isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80', spiceLevel: 3, preparationTime: 20 },
      { categoryId: catIndian.id, name: 'Shahi Veg Dum Biryani', description: 'Fragrant basmati rice cooked with fresh seasonal vegetables, cottage cheese, cashews, and saffron.', price: '390.00', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80', spiceLevel: 2, preparationTime: 18 },
      { categoryId: catIndian.id, name: 'Tandoori Murgh (Half)', description: 'Chicken marinated in mustard oil, hung curd, and roasted tandoori masala, cooked in clay oven.', price: '450.00', isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80', spiceLevel: 3, preparationTime: 22 },
      { categoryId: catIndian.id, name: 'Paneer Malai Tikka', description: 'Soft cottage cheese cubes marinated in cashew paste, cream, cheese, and cardamom, chargrilled.', price: '360.00', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80', spiceLevel: 1, preparationTime: 15 },
      { categoryId: catIndian.id, name: 'Garlic Butter Naan Basket (3 Pcs)', description: 'Leavened clay-oven flatbreads brushed with roasted garlic butter and fresh cilantro.', price: '140.00', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80', spiceLevel: 0, preparationTime: 8 },
      // Appetizers
      { categoryId: catAppetizer.id, name: 'Truffle Fries', description: 'Crispy golden fries tossed in black truffle oil, parmesan, and fresh herbs.', price: '280.00', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80', spiceLevel: 0, preparationTime: 8 },
      { categoryId: catAppetizer.id, name: 'Garlic Butter Shrimp', description: 'Sautéed wild shrimps in garlic, white wine, lemon and butter sauce, served with grilled baguette.', price: '490.00', isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1625938146369-adc83368bda7?w=600&auto=format&fit=crop&q=80', spiceLevel: 1, preparationTime: 12 },
      { categoryId: catAppetizer.id, name: 'Crispy Cauliflower Wings', description: 'Gluten-free batter fried cauliflower florets glazed in hot buffalo or sticky BBQ sauce.', price: '320.00', isAvailable: true, isVegetarian: true, isVegan: true, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80', spiceLevel: 2, preparationTime: 10 },
      { categoryId: catAppetizer.id, name: 'Paneer Tikka Skewers', description: 'Chargrilled cottage cheese cubes with smoky spices, mint chutney, and lemon wedges.', price: '350.00', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80', spiceLevel: 2, preparationTime: 10 },
      { categoryId: catAppetizer.id, name: 'Chicken Seekh Kebab', description: 'Minced chicken kebabs with herbs, onions and a charred finish served with pickled onions.', price: '390.00', isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop&q=80', spiceLevel: 2, preparationTime: 12 },
      { categoryId: catAppetizer.id, name: 'Creamy Mushroom Bruschetta', description: 'Toasted baguette slices topped with creamy sautéed wild mushrooms, garlic, and fresh thyme.', price: '310.00', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?w=600&auto=format&fit=crop&q=80', spiceLevel: 0, preparationTime: 7 },
      { categoryId: catAppetizer.id, name: 'Golden Calamari Rings', description: 'Crispy pepper-crusted squid rings served with a side of lemon garlic aioli.', price: '450.00', isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&auto=format&fit=crop&q=80', spiceLevel: 1, preparationTime: 10 },

      // Pizzas
      { categoryId: catPizza.id, name: 'Classic Margherita', description: 'San Marzano tomato base, fresh buffalo mozzarella, fresh basil leaves, and a drizzle of extra virgin olive oil.', price: '420.00', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 12 },
      { categoryId: catPizza.id, name: 'Double Pepperoni Inferno', description: 'Spicy pepperoni slices, jalapeños, mozzarella, red chili flakes, and hot honey drizzle.', price: '520.00', isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&auto=format&fit=crop&q=60', spiceLevel: 3, preparationTime: 14 },
      { categoryId: catPizza.id, name: 'Tuscan Truffle Mushroom Pizza', description: 'Creamy white sauce base, wild porcini mushrooms, caramelized onions, mozzarella, rosemary and truffle oil.', price: '580.00', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 15 },
      { categoryId: catPizza.id, name: 'Garden Pesto & Goat Cheese Pizza', description: 'Classic green basil pesto, tangy goat cheese, sun-dried tomatoes, pine nuts and baby arugula.', price: '510.00', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 13 },
      { categoryId: catPizza.id, name: 'BBQ Smoked Chicken Pizza', description: 'Tangy barbecue sauce base, pulled smoked chicken breast, red onions, cilantro and fresh Gouda.', price: '540.00', isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=60', spiceLevel: 1, preparationTime: 14 },

      // Burgers & Mains
      { categoryId: catMain.id, name: 'The Ultimate Wagyu Burger', description: 'Pan-seared premium Wagyu beef patty, sharp cheddar cheese, caramelized onions, butter lettuce, and signature truffle aioli on toasted brioche.', price: '640.00', isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 15 },
      { categoryId: catMain.id, name: 'Pan-Seared Salmon Fillet', description: 'Crispy skin salmon with lemon-herb butter sauce, wild rice pilaf, and roasted asparagus.', price: '890.00', isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 18 },
      { categoryId: catMain.id, name: 'Vegan Buddha Bowl', description: 'Warm quinoa, spiced chickpeas, avocado, shredded beetroots, kale, roasted sweet potato, topped with tahini dressing.', price: '380.00', isAvailable: true, isVegetarian: true, isVegan: true, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 10 },
      { categoryId: catMain.id, name: 'Paneer Butter Masala', description: 'Creamy tomato-based curry with roasted paneer, served with basmati rice and garlic naan.', price: '360.00', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=60', spiceLevel: 1, preparationTime: 18 },
      { categoryId: catMain.id, name: 'Chicken Tikka Masala', description: 'Tender grilled chicken in a rich tomato cream sauce with warm spices and steamed rice.', price: '440.00', isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&auto=format&fit=crop&q=60', spiceLevel: 2, preparationTime: 18 },
      { categoryId: catMain.id, name: 'Truffle Mushroom Risotto', description: 'Slow-cooked Arborio rice infused with porcini broth, wild mushrooms, parmesan cheese, and truffle essence.', price: '520.00', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 15 },
      { categoryId: catMain.id, name: 'Slow-Cooked Lamb Shank', description: 'Tender New Zealand lamb shank slow-braised in red wine and fresh herbs, served on rustic garlic mash.', price: '980.00', isAvailable: true, isVegetarian: false, isVegan: false, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=60', spiceLevel: 1, preparationTime: 22 },

      // Desserts
      { categoryId: catDessert.id, name: 'Molten Lava Cake', description: 'Rich chocolate cake with a warm flowing liquid chocolate center, served with a scoop of vanilla bean gelato.', price: '290.00', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 10 },
      { categoryId: catDessert.id, name: 'Tiramisu Classico', description: 'Espresso dipped ladyfingers layered with fluffy whipped mascarpone cream and dusted with dark cocoa powder.', price: '320.00', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 5 },
      { categoryId: catDessert.id, name: 'Warm Apple Crumble Tart', description: 'Spiced apple filling inside flaky pastry crust, topped with golden oats crumble and caramel glaze.', price: '270.00', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: false, imageUrl: 'https://images.unsplash.com/photo-1508737804141-4c3b688e2546?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 10 },
      { categoryId: catDessert.id, name: 'Gourmet Mango Panna Cotta', description: 'Creamy cold custard topped with sweet fresh Alphonso mango purée and fresh mint.', price: '250.00', isAvailable: true, isVegetarian: true, isVegan: false, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 5 },

      // Beverages
      { categoryId: catBeverage.id, name: 'Smoked Rosemary Old Fashioned', description: 'Premium bourbon, bitters, orange zest, infused with aromatic rosemary wood smoke.', price: '450.00', isAvailable: true, isVegetarian: true, isVegan: true, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 4 },
      { categoryId: catBeverage.id, name: 'Fresh Mint Mojito', description: 'Freshly muddled lime, mint leaves, raw sugar, white rum, topped with sparkling soda and crushed ice.', price: '260.00', isAvailable: true, isVegetarian: true, isVegan: true, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 3 },
      { categoryId: catBeverage.id, name: 'Sparkling Hibiscus Lemonade', description: 'A refreshing iced fizzy drink of brewed organic hibiscus blossoms, freshly squeezed lemon juice, and honey.', price: '210.00', isAvailable: true, isVegetarian: true, isVegan: true, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 3 },
      { categoryId: catBeverage.id, name: 'Espresso Martini Mocktail', description: 'Chilled premium dark espresso shake, house vanilla sweetener syrup, shaken over ice with a frothy head.', price: '280.00', isAvailable: true, isVegetarian: true, isVegan: true, isGlutenFree: true, imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=60', spiceLevel: 0, preparationTime: 4 }
    ]);
  }

  const seededMenuItems = await db.select().from(menuItems);
  const menuTruffleFries = seededMenuItems.find((m: typeof menuItems.$inferSelect) => m.name === 'Truffle Fries')!;
  const menuMargherita = seededMenuItems.find((m: typeof menuItems.$inferSelect) => m.name === 'Classic Margherita')!;
  const menuWagyuBurger = seededMenuItems.find((m: typeof menuItems.$inferSelect) => m.name === 'The Ultimate Wagyu Burger')!;

  // 5. Insert Restaurant Tables if table is empty
  const tablesCount = (await db.select({ count: sql<number>`count(*)` }).from(restaurantTables))[0].count;
  if (isReset || tablesCount === 0) {
    await db.insert(restaurantTables).values([
      { tableNumber: 'T1', capacity: 2, status: 'available', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=table-T1' },
      { tableNumber: 'T2', capacity: 2, status: 'occupied', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=table-T2' },
      { tableNumber: 'T3', capacity: 4, status: 'available', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=table-T3' },
      { tableNumber: 'T4', capacity: 4, status: 'reserved', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=table-T4' },
      { tableNumber: 'T5', capacity: 6, status: 'available', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=table-T5' },
      { tableNumber: 'T6', capacity: 8, status: 'occupied', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=table-T6' }
    ]);
  }

  const seededTables = await db.select().from(restaurantTables);
  const tableT1 = seededTables.find((t: typeof restaurantTables.$inferSelect) => t.tableNumber === 'T1')!;
  const tableT2 = seededTables.find((t: typeof restaurantTables.$inferSelect) => t.tableNumber === 'T2')!;
  const tableT4 = seededTables.find((t: typeof restaurantTables.$inferSelect) => t.tableNumber === 'T4')!;
  const tableT6 = seededTables.find((t: typeof restaurantTables.$inferSelect) => t.tableNumber === 'T6')!;

  // 6. Insert Coupons if table is empty
  const couponsCount = (await db.select({ count: sql<number>`count(*)` }).from(coupons))[0].count;
  if (isReset || couponsCount === 0) {
    await db.insert(coupons).values([
      { code: 'WELCOME10', discountType: 'percentage', discountValue: '10.00', minOrderAmount: '20.00', expiryDate: '2027-12-31', isActive: true },
      { code: 'SAVEFIFTY', discountType: 'fixed', discountValue: '50.00', minOrderAmount: '150.00', expiryDate: '2027-12-31', isActive: true },
      { code: 'CHEFGET20', discountType: 'percentage', discountValue: '20.00', minOrderAmount: '50.00', expiryDate: '2027-06-30', isActive: true }
    ]);
  }

  // 7. Insert Suppliers if table is empty
  const suppliersCount = (await db.select({ count: sql<number>`count(*)` }).from(suppliers))[0].count;
  if (isReset || suppliersCount === 0) {
    await db.insert(suppliers).values([
      { name: 'Fresh Fields Produce', contactPerson: 'Gopal Verma', email: 'gopal@freshfields.com', phone: '9823012345', address: '44 Organic Way, Green Valley' },
      { name: 'Global Meats & Seafood', contactPerson: 'Sanjay Patil', email: 'orders@globalmeats.com', phone: '9123456780', address: '10 Dockside Industrial Park' },
      { name: 'Venezia Italian Dry Goods', contactPerson: 'Govind Rao', email: 'govind@venezia.com', phone: '9545678901', address: '78 Pasta Blvd, Little Italy' }
    ]);
  }

  const seededSuppliers = await db.select().from(suppliers);
  const supplierFresh = seededSuppliers.find((s: typeof suppliers.$inferSelect) => s.name === 'Fresh Fields Produce')!;
  const supplierMeat = seededSuppliers.find((s: typeof suppliers.$inferSelect) => s.name === 'Global Meats & Seafood')!;
  const supplierItalian = seededSuppliers.find((s: typeof suppliers.$inferSelect) => s.name === 'Venezia Italian Dry Goods')!;

  // 8. Insert Inventory Items if table is empty
  const inventoryCount = (await db.select({ count: sql<number>`count(*)` }).from(inventoryItems))[0].count;
  if (isReset || inventoryCount === 0) {
    await db.insert(inventoryItems).values([
      { name: 'Wagyu Beef Patties', quantity: '15.00', unit: 'pcs', reorderLevel: '20.00', costPerUnit: '350.00', supplierId: supplierMeat.id },
      { name: 'Fresh Idaho Potatoes', quantity: '120.00', unit: 'kg', reorderLevel: '50.00', costPerUnit: '35.00', supplierId: supplierFresh.id },
      { name: 'Avocados', quantity: '8.00', unit: 'pcs', reorderLevel: '15.00', costPerUnit: '80.00', supplierId: supplierFresh.id },
      { name: 'San Marzano Tomatoes', quantity: '45.00', unit: 'kg', reorderLevel: '20.00', costPerUnit: '120.00', supplierId: supplierItalian.id },
      { name: 'Buffalo Mozzarella', quantity: '4.50', unit: 'kg', reorderLevel: '10.00', costPerUnit: '450.00', supplierId: supplierItalian.id },
      { name: 'Wild Shrimps 16/20', quantity: '18.00', unit: 'kg', reorderLevel: '15.00', costPerUnit: '750.00', supplierId: supplierMeat.id },
      { name: 'Truffle Oil', quantity: '2.10', unit: 'ltr', reorderLevel: '1.00', costPerUnit: '1850.00', supplierId: supplierItalian.id }
    ]);
  }

  // 9. Insert Purchase Orders if table is empty
  const poCount = (await db.select({ count: sql<number>`count(*)` }).from(purchaseOrders))[0].count;
  if (isReset || poCount === 0) {
    await db.insert(purchaseOrders).values([
      { supplierId: supplierItalian.id, itemName: 'Buffalo Mozzarella', quantity: '20.00', cost: '9000.00', status: 'ordered' },
      { supplierId: supplierFresh.id, itemName: 'Avocados', quantity: '50.00', cost: '4000.00', status: 'ordered' },
      { supplierId: supplierMeat.id, itemName: 'Wagyu Beef Patties', quantity: '100.00', cost: '35000.00', status: 'received' }
    ]);
  }

  // 10. Insert Reservations if table is empty
  const reservationsCount = (await db.select({ count: sql<number>`count(*)` }).from(reservations))[0].count;
  if (isReset || reservationsCount === 0) {
    const dateStrAt = (hoursAhead: number) => {
      const d = new Date();
      d.setHours(d.getHours() + hoursAhead);
      return d;
    };

    await db.insert(reservations).values([
      { customerId: null, customerName: 'Amit Sharma', customerPhone: '9876543210', tableId: tableT4.id, reservationTime: dateStrAt(2), numberOfGuests: 4, status: 'confirmed', notes: 'Anniversary celebration, prefer window seat', branch: 'Ichalkaranji' },
      { customerId: null, customerName: 'Bharat Joshi', customerPhone: '9654321098', tableId: tableT1.id, reservationTime: dateStrAt(5), numberOfGuests: 2, status: 'pending', notes: 'Need vegetarian options pointed out', branch: 'Ichalkaranji' },
      { customerId: null, customerName: 'Chitra Yadav', customerPhone: '9765432109', tableId: tableT2.id, reservationTime: dateStrAt(-3), numberOfGuests: 2, status: 'completed', notes: '', branch: 'Ichalkaranji' }
    ]);
  }

  const formatYmd = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  // 12. Create Orders & Order Items if table is empty
  const ordersCount = (await db.select({ count: sql<number>`count(*)` }).from(orders))[0].count;
  if (isReset || ordersCount === 0) {
    await db.insert(orders).values({
      customerId: null,
      tableId: tableT6.id,
      orderType: 'dine-in',
      status: 'completed',
      totalAmount: '1560.00',
      gstAmount: '70.20',
      discountAmount: '156.00',
      finalAmount: '1474.20',
      couponCode: 'WELCOME10',
      notes: 'Please make the steak medium-rare, fries extra crispy.',
      createdAt: new Date(Date.now() - 3600000 * 4),
      updatedAt: new Date(Date.now() - 3600000 * 4),
      branch: 'Ichalkaranji',
    });

    await db.insert(orders).values({
      customerId: null,
      tableId: tableT2.id,
      orderType: 'dine-in',
      status: 'cooking',
      totalAmount: '1340.00',
      gstAmount: '67.00',
      discountAmount: '0.00',
      finalAmount: '1407.00',
      notes: 'No spicy flakes on Pizza please.',
      createdAt: new Date(Date.now() - 1200000),
      updatedAt: new Date(Date.now() - 1200000),
      branch: 'Ichalkaranji',
    });

    await db.insert(orders).values({
      customerId: null,
      tableId: tableT1.id,
      orderType: 'dine-in',
      status: 'served',
      totalAmount: '920.00',
      gstAmount: '46.00',
      discountAmount: '0.00',
      finalAmount: '966.00',
      notes: 'Table 1 requests split bill check.',
      createdAt: new Date(Date.now() - 3000000),
      updatedAt: new Date(Date.now() - 3000000),
      branch: 'Ichalkaranji',
    });

    // Sample Delivery Orders for Delivery Executive Terminal
    await db.insert(orders).values({
      customerId: null,
      tableId: null,
      orderType: 'delivery',
      status: 'out_for_delivery',
      totalAmount: '1060.00',
      gstAmount: '53.00',
      discountAmount: '0.00',
      finalAmount: '1113.00',
      address: 'Flat 402, Shivajinagar Heights, FC Road, Pune - 411005',
      notes: 'Ring bell twice, COD cash payment on delivery.',
      createdAt: new Date(Date.now() - 1800000),
      updatedAt: new Date(Date.now() - 600000),
      branch: 'Ichalkaranji',
    });

    await db.insert(orders).values({
      customerId: null,
      tableId: null,
      orderType: 'delivery',
      status: 'ready',
      totalAmount: '840.00',
      gstAmount: '42.00',
      discountAmount: '0.00',
      finalAmount: '882.00',
      address: 'House #12, Green Park Colony, Ichalkaranji - 416115',
      notes: 'Please leave at front gate with security.',
      createdAt: new Date(Date.now() - 900000),
      updatedAt: new Date(Date.now() - 300000),
      branch: 'Ichalkaranji',
    });

    const seededOrders = await db.select().from(orders);
    const order1 = seededOrders.find((o: typeof orders.$inferSelect) => o.tableId === tableT6.id && o.status === 'completed');
    const order2 = seededOrders.find((o: typeof orders.$inferSelect) => o.tableId === tableT2.id && o.status === 'cooking');
    const order3 = seededOrders.find((o: typeof orders.$inferSelect) => o.tableId === tableT1.id && o.status === 'served');
    const deliveryOrder1 = seededOrders.find((o: typeof orders.$inferSelect) => o.orderType === 'delivery' && o.status === 'out_for_delivery');
    const deliveryOrder2 = seededOrders.find((o: typeof orders.$inferSelect) => o.orderType === 'delivery' && o.status === 'ready');

    if (order1) {
      await db.insert(orderItems).values([
        { orderId: order1.id, menuItemId: menuWagyuBurger.id, quantity: 2, unitPrice: '640.00', notes: 'Extra cheese', status: 'served' },
        { orderId: order1.id, menuItemId: menuTruffleFries.id, quantity: 1, unitPrice: '280.00', notes: 'Extra crispy', status: 'served' }
      ]);

      await db.insert(payments).values({
        orderId: order1.id,
        amount: '1474.20',
        paymentMethod: 'card',
        status: 'completed',
        transactionId: 'TXN-90234857',
        createdAt: new Date(Date.now() - 3600000 * 3.8)
      });
    }

    if (order2) {
      await db.insert(orderItems).values([
        { orderId: order2.id, menuItemId: menuMargherita.id, quantity: 1, unitPrice: '420.00', notes: '', status: 'cooking' },
        { orderId: order2.id, menuItemId: menuWagyuBurger.id, quantity: 1, unitPrice: '640.00', notes: 'No tomato', status: 'pending' },
        { orderId: order2.id, menuItemId: menuTruffleFries.id, quantity: 1, unitPrice: '280.00', notes: '', status: 'ready' }
      ]);
    }

    if (order3) {
      await db.insert(orderItems).values([
        { orderId: order3.id, menuItemId: menuWagyuBurger.id, quantity: 1, unitPrice: '640.00', notes: '', status: 'served' },
        { orderId: order3.id, menuItemId: menuTruffleFries.id, quantity: 1, unitPrice: '280.00', notes: '', status: 'served' }
      ]);
    }

    if (deliveryOrder1) {
      await db.insert(orderItems).values([
        { orderId: deliveryOrder1.id, menuItemId: menuWagyuBurger.id, quantity: 1, unitPrice: '640.00', notes: 'Well done', status: 'ready' },
        { orderId: deliveryOrder1.id, menuItemId: menuMargherita.id, quantity: 1, unitPrice: '420.00', notes: '', status: 'ready' }
      ]);
    }

    if (deliveryOrder2) {
      await db.insert(orderItems).values([
        { orderId: deliveryOrder2.id, menuItemId: menuMargherita.id, quantity: 2, unitPrice: '420.00', notes: 'Extra basil', status: 'ready' }
      ]);
    }
  }

  // 13. Insert Reviews if table is empty
  const reviewsCount = (await db.select({ count: sql<number>`count(*)` }).from(reviews))[0].count;
  if (isReset || reviewsCount === 0) {
    await db.insert(reviews).values([
      { menuItemId: menuWagyuBurger.id, customerName: 'Amit Sharma', rating: 5, comment: 'Hands down the best Wagyu burger in town! Super juicy.' },
      { menuItemId: menuMargherita.id, customerName: 'Bharat Joshi', rating: 4, comment: 'Very authentic Italian woodfire crust, loved the fresh basil!' },
      { menuItemId: menuTruffleFries.id, customerName: 'Deepak Hedge', rating: 5, comment: 'So addictive. Truffle flavor is intense and amazing.' }
    ]);
  }

  // 14. Insert Expenses if table is empty
  const expensesCount = (await db.select({ count: sql<number>`count(*)` }).from(expenses))[0].count;
  if (isReset || expensesCount === 0) {
    await db.insert(expenses).values([
      { description: 'Fresh produce restock from Fresh Fields', category: 'Ingredients', amount: '4500.00', date: formatYmd(0), createdBy: 'Manager Account' },
      { description: 'Global Meats weekly poultry & seafood shipment', category: 'Ingredients', amount: '12500.00', date: formatYmd(-2), createdBy: 'Manager Account' },
      { description: 'Venezia Italian cheese & dry goods batch', category: 'Ingredients', amount: '3800.00', date: formatYmd(-5), createdBy: 'Owner Account' },
      { description: 'Electricity & Utility Bills', category: 'Utilities', amount: '8500.00', date: formatYmd(-10), createdBy: 'Owner Account' }
    ]);
  }

  console.log("Seeding successfully completed!");
  seedState.checked = true;
  seedState.seeded = true;
}
