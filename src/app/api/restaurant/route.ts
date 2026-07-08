import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { 
  users, categories, menuItems, restaurantTables, reservations, 
  orders, orderItems, suppliers, inventoryItems, purchaseOrders, 
  employeeShifts, payments, coupons, reviews, expenses, chefs, waiters, cashiers 
} from '@/db/schema';
import { seedDatabase, ensureDatabaseSeeded } from '@/db/seed';
import { eq, desc, asc, and, inArray, sql } from 'drizzle-orm';
import { sendEmail } from '@/lib/email';
import { hashPassword, verifyToken } from '@/lib/auth';
import { cashierOrderNotificationHtml, chefOrderNotificationHtml, managerOrderNotificationHtml, orderConfirmationHtml, orderReadyHtml, paymentSuccessHtml, reservationConfirmationHtml, staffApprovalHtml, staffWelcomeEmailHtml, waiterOrderReceivedHtml } from '@/lib/email-templates';

function isCustomerRole(role?: string | null) {
  return String(role || '').toLowerCase() === 'customer';
}

function isStaffRole(role?: string | null) {
  return ['chef', 'waiter', 'cashier', 'manager'].includes(String(role || '').toLowerCase());
}

function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) {
    return null;
  }
  return verifyToken(token);
}

function ensureAccess(user: { role?: string } | null, allowedRoles: string[]) {
  if (!user) {
    return false;
  }
  const role = String(user.role || '').toLowerCase();
  return allowedRoles.includes(role);
}

async function notifyStaffForOrder({
  orderId,
  orderType,
  tableNumber,
  status,
  roles,
}: {
  orderId: number;
  orderType: string;
  tableNumber?: string;
  status: string;
  roles: string[];
}) {
  try {
    const staffUsers = await db.select().from(users);
    const excludedManagerEmail = process.env.ORDER_EMAIL_EXCLUDE?.trim().toLowerCase() || 'manager@restaurant.com';
    for (const staff of staffUsers) {
      const normalizedRole = String(staff.role || '').toLowerCase();
      if (!roles.includes(normalizedRole) || !staff.email || staff.isApproved === false) {
        continue;
      }
      if (staff.email.toLowerCase() === excludedManagerEmail) {
        continue;
      }

      let html = '';
      let subject = '';
      const commonData = { name: staff.name || staff.email, orderId, orderType: String(orderType || 'dine-in'), tableNumber, status };

      if (normalizedRole === 'manager') {
        subject = `🔔 Order #${orderId} status update`;
        html = managerOrderNotificationHtml(commonData as any);
      } else if (normalizedRole === 'cashier') {
        subject = `💳 Order #${orderId} status update`;
        html = cashierOrderNotificationHtml(commonData as any);
      } else if (normalizedRole === 'waiter') {
        subject = `🧾 Order #${orderId} received`;
        html = waiterOrderReceivedHtml({ name: staff.name || staff.email, orderId, orderType: String(orderType || 'dine-in'), tableNumber });
      } else if (normalizedRole === 'chef') {
        subject = `👨‍🍳 Order #${orderId} ready for kitchen`;
        html = chefOrderNotificationHtml({ name: staff.name || staff.email, orderId, orderType: String(orderType || 'dine-in'), tableNumber });
      }

      if (subject && html) {
        await sendEmail({ to: staff.email, subject, html });
      }
    }
  } catch (error) {
    console.error('Failed to notify staff for order:', error);
  }
}

// GET all data
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }
    await ensureDatabaseSeeded();

    if (isCustomerRole(authUser.role)) {
      const customerId = Number(authUser.userId);
      const [
        allCategories,
        allMenuItems,
        allTables,
        allReservations,
        allOrders,
        allOrderItems,
        allCoupons,
        allReviews,
      ] = await Promise.all([
        db.select().from(categories).orderBy(asc(categories.name)),
        db.select().from(menuItems).orderBy(asc(menuItems.name)),
        db.select().from(restaurantTables).orderBy(asc(restaurantTables.tableNumber)),
        db.select().from(reservations).where(eq(reservations.customerId, customerId)).orderBy(desc(reservations.reservationTime)),
        db.select().from(orders).where(eq(orders.customerId, customerId)).orderBy(desc(orders.createdAt)),
        db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            menuItemId: orderItems.menuItemId,
            quantity: orderItems.quantity,
            unitPrice: orderItems.unitPrice,
            notes: orderItems.notes,
            status: orderItems.status,
          })
          .from(orderItems)
          .innerJoin(orders, eq(orderItems.orderId, orders.id))
          .where(eq(orders.customerId, customerId)),
        db.select().from(coupons).orderBy(asc(coupons.code)),
        db.select().from(reviews).orderBy(desc(reviews.createdAt)),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          categories: allCategories,
          menuItems: allMenuItems,
          tables: allTables,
          reservations: allReservations,
          orders: allOrders,
          orderItems: allOrderItems,
          users: [],
          suppliers: [],
          inventory: [],
          purchaseOrders: [],
          shifts: [],
          payments: [],
          coupons: allCoupons,
          reviews: allReviews,
          expenses: [],
          chefs: [],
          waiters: [],
          cashiers: [],
        }
      });
    }

    const [
      allCategories,
      allMenuItems,
      allTables,
      allReservations,
      allOrders,
      allOrderItems,
      allUsers,
      allSuppliers,
      allInventory,
      allPurchaseOrders,
      allShifts,
      allPayments,
      allCoupons,
      allReviews,
      allExpenses,
      allChefs,
      allWaiters,
      allCashiers,
    ] = await Promise.all([
      db.select().from(categories).orderBy(asc(categories.name)),
      db.select().from(menuItems).orderBy(asc(menuItems.name)),
      db.select().from(restaurantTables).orderBy(asc(restaurantTables.tableNumber)),
      db.select().from(reservations).orderBy(desc(reservations.reservationTime)),
      db.select().from(orders).orderBy(desc(orders.createdAt)),
      db.select().from(orderItems),
      db.select().from(users).orderBy(asc(users.name)),
      db.select().from(suppliers).orderBy(asc(suppliers.name)),
      db.select().from(inventoryItems).orderBy(asc(inventoryItems.name)),
      db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.orderedAt)),
      db.select().from(employeeShifts).orderBy(asc(employeeShifts.date)),
      db.select().from(payments).orderBy(desc(payments.createdAt)),
      db.select().from(coupons).orderBy(asc(coupons.code)),
      db.select().from(reviews).orderBy(desc(reviews.createdAt)),
      db.select().from(expenses).orderBy(desc(expenses.date)),
      db.select().from(chefs).orderBy(asc(chefs.id)),
      db.select().from(waiters).orderBy(asc(waiters.id)),
      db.select().from(cashiers).orderBy(asc(cashiers.id)),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        categories: allCategories,
        menuItems: allMenuItems,
        tables: allTables,
        reservations: allReservations,
        orders: allOrders,
        orderItems: allOrderItems,
        users: allUsers,
        suppliers: allSuppliers,
        inventory: allInventory,
        purchaseOrders: allPurchaseOrders,
        shifts: allShifts,
        payments: allPayments,
        coupons: allCoupons,
        reviews: allReviews,
        expenses: allExpenses,
        chefs: allChefs,
        waiters: allWaiters,
        cashiers: allCashiers,
      }
    });
  } catch (error: any) {
    console.error("GET API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - dispatching multiple actions
export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;
    const payload = body?.payload ?? {};

    if (!action) {
      return NextResponse.json({ success: false, error: "Action is required" }, { status: 400 });
    }

    const userRole = String(authUser.role || '').toLowerCase();
    const managerOnlyActions = new Set(['seed', 'saveMenuItem', 'deleteMenuItem', 'saveCategory', 'deleteCategory', 'saveTable', 'deleteTable', 'saveSupplier', 'deleteSupplier', 'saveInventory', 'deleteInventory', 'createPurchaseOrder', 'receivePurchaseOrder', 'deletePurchaseOrder', 'saveShift', 'deleteShift', 'saveExpense', 'deleteExpense', 'saveUser', 'deleteUser', 'approveStaff', 'saveStaffMember', 'deleteStaffMember']);
    if (managerOnlyActions.has(action) && userRole !== 'manager') {
      return NextResponse.json({ success: false, error: 'Manager access required' }, { status: 403 });
    }

    if (['updateOrderStatus', 'updateOrderItemStatus', 'forwardToChef'].includes(action) && !['manager', 'chef', 'waiter', 'cashier'].includes(userRole)) {
      return NextResponse.json({ success: false, error: 'Staff access required' }, { status: 403 });
    }

    if (action === 'processPayment' && !['manager', 'cashier', 'waiter'].includes(userRole)) {
      return NextResponse.json({ success: false, error: 'Payment access required' }, { status: 403 });
    }

    if (action === 'placeOrder' && !['customer', 'manager', 'waiter', 'cashier'].includes(userRole)) {
      return NextResponse.json({ success: false, error: 'Order access required' }, { status: 403 });
    }

    if (action === 'saveReservation' && !['customer', 'manager', 'waiter'].includes(userRole)) {
      return NextResponse.json({ success: false, error: 'Reservation access required' }, { status: 403 });
    }

    // 1. SEED / RESET DATABASE
    if (action === 'seed') {
      await seedDatabase();
      return NextResponse.json({ success: true, message: "Database reset and seeded with demo data" });
    }

    // CUSTOMER SELF-DELETION
    if (action === 'deleteMyAccount') {
      if (userRole !== 'customer') {
        return NextResponse.json({ success: false, error: 'Only customers may delete their own account' }, { status: 403 });
      }
      await db.delete(users).where(eq(users.id, authUser.userId));
      return NextResponse.json({ success: true, message: 'Your customer account has been deleted permanently.' });
    }

    if (action === 'saveMyProfile') {
      const { name, phone, addressLine, district, state, pincode } = payload;
      await db.update(users)
        .set({ name, phone, addressLine, district, state, pincode })
        .where(eq(users.id, authUser.userId));
      return NextResponse.json({ success: true, message: 'Profile updated successfully.' });
    }

    // 2. CREATE / UPDATE MENU ITEM
    if (action === 'saveMenuItem') {
      const { id, name, description, price, categoryId, isAvailable, isVegetarian, isVegan, isGlutenFree, spiceLevel, preparationTime, imageUrl } = payload;
      
      if (id) {
        // Update
        await db.update(menuItems)
          .set({ name, description, price, categoryId, isAvailable, isVegetarian, isVegan, isGlutenFree, spiceLevel, preparationTime, imageUrl })
          .where(eq(menuItems.id, id));
      } else {
        // Insert
        await db.insert(menuItems).values({
          name, description, price, categoryId, isAvailable, isVegetarian, isVegan, isGlutenFree, spiceLevel, preparationTime, imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60'
        });
      }
      return NextResponse.json({ success: true });
    }

    // DELETE MENU ITEM
    if (action === 'deleteMenuItem') {
      await db.delete(menuItems).where(eq(menuItems.id, payload.id));
      return NextResponse.json({ success: true });
    }

    // 3. CREATE / UPDATE CATEGORY
    if (action === 'saveCategory') {
      const { id, name, description, imageUrl } = payload;
      if (id) {
        await db.update(categories).set({ name, description, imageUrl }).where(eq(categories.id, id));
      } else {
        await db.insert(categories).values({ name, description, imageUrl });
      }
      return NextResponse.json({ success: true });
    }

    // DELETE CATEGORY
    if (action === 'deleteCategory') {
      await db.delete(categories).where(eq(categories.id, payload.id));
      return NextResponse.json({ success: true });
    }

    // 4. SAVE TABLE
    if (action === 'saveTable') {
      const { id, tableNumber, capacity, status } = payload;
      if (id) {
        await db.update(restaurantTables).set({ tableNumber, capacity, status }).where(eq(restaurantTables.id, id));
      } else {
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=table-${tableNumber}`;
        await db.insert(restaurantTables).values({ tableNumber, capacity, status, qrCodeUrl });
      }
      return NextResponse.json({ success: true });
    }

    // DELETE TABLE
    if (action === 'deleteTable') {
      await db.delete(restaurantTables).where(eq(restaurantTables.id, payload.id));
      return NextResponse.json({ success: true });
    }

    // 5. SAVE RESERVATION
    if (action === 'saveReservation') {
      const { id, customerId, customerName, customerPhone, tableId, reservationTime, numberOfGuests, status, notes } = payload;
      
      const parsedTime = new Date(reservationTime);
      const normalizedStatus = status || 'pending';

      if (id) {
        await db.update(reservations)
          .set({ customerId, customerName, customerPhone, tableId, reservationTime: parsedTime, numberOfGuests, status: normalizedStatus, notes })
          .where(eq(reservations.id, id));
      } else {
        await db.insert(reservations).values({
          customerId: customerId || (authUser && isCustomerRole(authUser.role) ? authUser.userId : null),
          customerName,
          customerPhone,
          tableId: tableId || null,
          reservationTime: parsedTime,
          numberOfGuests,
          status: normalizedStatus,
          notes
        });
      }

      // If reserving, optionally change table status
      if (tableId && normalizedStatus === 'confirmed') {
        await db.update(restaurantTables).set({ status: 'reserved' }).where(eq(restaurantTables.id, tableId));
      }

      try {
        let resolvedCustomerEmail = payload.customerEmail || null;
        let resolvedCustomerName = customerName || null;
        
        // 1. If customerId is provided or resolved, fetch their email from user account
        const targetCustomerId = customerId || (id ? (await db.select().from(reservations).where(eq(reservations.id, id)))[0]?.customerId : null) || (authUser && isCustomerRole(authUser.role) ? authUser.userId : null);
        
        if (targetCustomerId) {
          const matchedCustomer = (await db.select().from(users).where(eq(users.id, targetCustomerId)))[0];
          if (matchedCustomer && isCustomerRole(matchedCustomer.role)) {
            resolvedCustomerEmail = matchedCustomer.email;
            resolvedCustomerName = resolvedCustomerName || matchedCustomer.name;
          }
        }
        
        // 2. If email is still not resolved, and the logged-in user is a customer, fallback to their email
        if (!resolvedCustomerEmail && authUser && isCustomerRole(authUser.role)) {
          resolvedCustomerEmail = authUser.email;
          resolvedCustomerName = resolvedCustomerName || 'Guest Customer';
        }

        // Only send reservation email to the resolved customer (NEVER to the manager/staff)
        if (resolvedCustomerEmail && resolvedCustomerName && (!authUser || !isStaffRole(authUser.role) || resolvedCustomerEmail !== authUser.email)) {
          const tableInfo = tableId ? (await db.select().from(restaurantTables).where(eq(restaurantTables.id, tableId)))[0] : null;
          const reservationDateLabel = parsedTime.toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          });

          await sendEmail({
            to: resolvedCustomerEmail,
            subject: `✅ Table reservation ${normalizedStatus === 'confirmed' ? 'confirmed' : 'received'} — FirstBite`,
            html: reservationConfirmationHtml({
              name: String(resolvedCustomerName),
              tableNumber: tableInfo?.tableNumber,
              reservationTime: reservationDateLabel,
              numberOfGuests: Number(numberOfGuests || 1),
              status: normalizedStatus,
            }),
          });
        }
      } catch (emailError) {
        console.error('Failed to send reservation email:', emailError);
      }

      return NextResponse.json({ success: true });
    }

    // DELETE RESERVATION
    if (action === 'deleteReservation') {
      await db.delete(reservations).where(eq(reservations.id, payload.id));
      return NextResponse.json({ success: true });
    }

    // 6. PLACE ORDER (CUSTOMER OR WAITER OR CASHIER)
    if (action === 'placeOrder') {
      await ensureDatabaseSeeded();

      const { customerId, customerEmail, customerName, tableId, orderType, address, items, notes, couponCode, discountAmount, totalAmount, finalAmount, gstAmount } = payload;
      const normalizedItems = Array.isArray(items) ? items : [];

      if (normalizedItems.length === 0) {
        return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
      }

      const requestedMenuItemIds = [...new Set(normalizedItems.map((item: any) => Number(item.menuItemId)).filter(Boolean))];
      const existingMenuItems = requestedMenuItemIds.length > 0
        ? await db.select().from(menuItems).where(inArray(menuItems.id, requestedMenuItemIds))
        : [];
      const existingMenuItemIds = new Set(existingMenuItems.map((item: any) => Number(item.id)));
      const invalidMenuItem = normalizedItems.find((item: any) => !existingMenuItemIds.has(Number(item.menuItemId)));

      if (invalidMenuItem) {
        return NextResponse.json({ success: false, error: 'One or more menu items are no longer available. Please refresh and try again.' }, { status: 400 });
      }

      const requestedCustomerId = Number(customerId || 0);
      const validCustomer = requestedCustomerId
        ? (await db.select({ id: users.id }).from(users).where(eq(users.id, requestedCustomerId)))[0]
        : null;
      const resolvedCustomerId = validCustomer?.id ?? null;

      const requestedTableId = Number(tableId || 0);
      const validTable = requestedTableId
        ? (await db.select({ id: restaurantTables.id }).from(restaurantTables).where(eq(restaurantTables.id, requestedTableId)))[0]
        : null;
      const resolvedTableId = validTable?.id ?? null;

      if (orderType === 'dine-in' && requestedTableId && !resolvedTableId) {
        return NextResponse.json({ success: false, error: 'Selected table is no longer available. Please refresh and choose a table again.' }, { status: 400 });
      }
      
      // 1. Create Order
      const insertResult = await db.insert(orders).values({
        customerId: resolvedCustomerId,
        tableId: resolvedTableId,
        orderType: orderType || 'dine-in',
        address: address || null,
        status: 'pending',
        totalAmount: String(totalAmount),
        gstAmount: String(gstAmount || 0),
        discountAmount: String(discountAmount || 0),
        finalAmount: String(finalAmount),
        couponCode: couponCode || null,
        notes: notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning({ id: orders.id });

      const orderId = insertResult[0]?.id;

      // 2. Add Order Items
      if (normalizedItems.length > 0 && orderId) {
        const itemValues = normalizedItems.map((item: any) => ({
          orderId: orderId,
          menuItemId: Number(item.menuItemId),
          quantity: item.quantity,
          unitPrice: String(item.price),
          notes: item.notes || '',
          status: 'pending'
        }));
        await db.insert(orderItems).values(itemValues);
      }

      // 3. Update table status to occupied if dine-in
      if (resolvedTableId && orderType === 'dine-in') {
        await db.update(restaurantTables).set({ status: 'occupied' }).where(eq(restaurantTables.id, resolvedTableId));
      }

      // 4. Award loyalty points if customer ID provided
      if (resolvedCustomerId) {
        const pointsEarned = Math.floor(Number(finalAmount) / 10); // 1 point per ₹10 spent
        await db.update(users)
          .set({ loyaltyPoints: sql`loyalty_points + ${pointsEarned}` })
          .where(eq(users.id, resolvedCustomerId));
      }

      // 5. Send order confirmation email (non-blocking - fire and forget)
      if (orderId && normalizedItems.length > 0) {
        (async () => {
          try {
            // Look up user to get email
            let resolvedCustomerEmail: string | undefined = customerEmail;
            let resolvedCustomerName: string | undefined = customerName;
            if (resolvedCustomerId) {
              const userData = await db.select().from(users).where(eq(users.id, resolvedCustomerId));
              const matchedUser = userData[0];
              if (matchedUser && isCustomerRole(matchedUser.role)) {
                resolvedCustomerEmail = resolvedCustomerEmail || matchedUser.email;
                resolvedCustomerName = resolvedCustomerName || matchedUser.name;
              }
            }

            // If we have an email, send the confirmation
            if (resolvedCustomerEmail && resolvedCustomerName) {
              // Look up menu item names
              const itemDetails = await Promise.all(
                normalizedItems.map(async (item: any) => {
                  const menuItem = await db.select().from(menuItems).where(eq(menuItems.id, Number(item.menuItemId)));
                  return {
                    name: menuItem[0]?.name || 'Unknown Item',
                    quantity: item.quantity,
                    price: item.price,
                    notes: item.notes || '',
                  };
                })
              );

              // Calculate max prep time
              const allMenuItems = await db.select().from(menuItems);
              const maxPrepTime = normalizedItems.reduce((max: number, item: any) => {
                const mi = allMenuItems.find((m: any) => Number(m.id) === Number(item.menuItemId));
                const prep = mi?.preparationTime || 15;
                return Math.max(max, prep);
              }, 0);

              const tableInfo = resolvedTableId ? await db.select().from(restaurantTables).where(eq(restaurantTables.id, resolvedTableId)) : [];

              await sendEmail({
                to: resolvedCustomerEmail,
                subject: `✅ Order #${orderId} Confirmed — FirstBite`,
                html: orderConfirmationHtml({
                  name: resolvedCustomerName,
                  orderId,
                  items: itemDetails,
                  totalAmount: String(totalAmount || '0'),
                  finalAmount: String(finalAmount || '0'),
                  gstAmount: String(gstAmount || '0'),
                  discountAmount: String(discountAmount || '0'),
                  orderType: orderType || 'dine-in',
                  tableNumber: tableInfo[0]?.tableNumber,
                  estimatedTime: maxPrepTime + 5,
                }),
              });

              await notifyStaffForOrder({
                orderId,
                orderType: orderType || 'dine-in',
                tableNumber: tableInfo[0]?.tableNumber,
                status: 'placed',
                roles: ['manager', 'waiter', 'cashier', 'chef'],
              });
            }
          } catch (emailErr) {
            console.error('Failed to send order email (non-blocking):', emailErr);
          }
        })();
      }

      return NextResponse.json({ success: true, orderId });
    }

    // 7. UPDATE ORDER STATUS (Chef, Waiter, Cashier, Manager)
    if (action === 'updateOrderStatus') {
      const { id, status } = payload; // 'pending', 'accepted', 'cooking', 'ready', 'served', 'completed', 'cancelled'
      
      await db.update(orders)
        .set({ status, updatedAt: new Date() })
        .where(eq(orders.id, id));

      const orderData = await db.select().from(orders).where(eq(orders.id, id));
      const currentOrder = orderData[0];
      if (currentOrder) {
        const customer = currentOrder.customerId ? (await db.select().from(users).where(eq(users.id, currentOrder.customerId)))[0] : null;
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
        const itemDetails = await Promise.all(items.map(async (item: any) => {
          const menuItem = (await db.select().from(menuItems).where(eq(menuItems.id, item.menuItemId)))[0];
          return {
            name: menuItem?.name || 'Unknown Item',
            quantity: item.quantity,
            price: item.unitPrice,
            notes: item.notes || '',
          };
        }));
        const tableInfo = currentOrder.tableId ? (await db.select().from(restaurantTables).where(eq(restaurantTables.id, currentOrder.tableId)))[0] : null;

        if (status === 'ready') {
          if (customer && isCustomerRole(customer.role) && customer.email) {
            await sendEmail({
              to: customer.email,
              subject: `🍽 Order #${id} is ready — FirstBite`,
              html: orderReadyHtml({ name: customer.name, orderId: id, tableNumber: tableInfo?.tableNumber }),
            });
          }

          await notifyStaffForOrder({
            orderId: id,
            orderType: currentOrder.orderType,
            tableNumber: tableInfo?.tableNumber,
            status: 'ready',
            roles: ['manager', 'waiter', 'cashier', 'chef'],
          });
        }

        if (['accepted', 'cooking', 'served', 'completed', 'cancelled'].includes(status)) {
          await notifyStaffForOrder({
            orderId: id,
            orderType: currentOrder.orderType,
            tableNumber: tableInfo?.tableNumber,
            status,
            roles: ['manager', 'waiter', 'cashier', 'chef'],
          });
        }

        if (status === 'accepted' && customer && isCustomerRole(customer.role) && customer.email) {
          await sendEmail({
            to: customer.email,
            subject: `🧾 Order #${id} received by the restaurant`,
            html: orderConfirmationHtml({ name: customer.name, orderId: id, items: itemDetails, totalAmount: String(currentOrder.totalAmount), finalAmount: String(currentOrder.finalAmount), gstAmount: String(currentOrder.gstAmount), discountAmount: String(currentOrder.discountAmount), orderType: currentOrder.orderType, tableNumber: tableInfo?.tableNumber, estimatedTime: 15 }),
          });
        }
      }

      // Also auto-update order items to matching state if completed or cooking
      if (status === 'cooking') {
        await db.update(orderItems).set({ status: 'cooking' }).where(eq(orderItems.orderId, id));
      } else if (status === 'ready') {
        await db.update(orderItems).set({ status: 'ready' }).where(eq(orderItems.orderId, id));
      } else if (status === 'served') {
        await db.update(orderItems).set({ status: 'served' }).where(eq(orderItems.orderId, id));
      }

      // If completed or cancelled, release physical table
      if (status === 'completed' || status === 'cancelled') {
        const orderData = await db.select().from(orders).where(eq(orders.id, id));
        if (orderData[0] && orderData[0].tableId) {
          await db.update(restaurantTables).set({ status: 'available' }).where(eq(restaurantTables.id, orderData[0].tableId));
        }
      }

      return NextResponse.json({ success: true });
    }

    // 6.b FORWARD ORDER TO CHEF (Triggered by waiter) — set status to 'accepted' and notify chefs
    if (action === 'forwardToChef') {
      const { id } = payload;
      await db.update(orders).set({ status: 'accepted', updatedAt: new Date() }).where(eq(orders.id, id));
      try {
        const chefs = await db.select().from(users).where(sql`role = 'chef'`);
        for (const chef of chefs) {
          if (chef.email && chef.isApproved !== false) {
            await sendEmail({
              to: chef.email,
              subject: `👨‍🍳 Order #${id} forwarded to you`,
              html: chefOrderNotificationHtml({ name: chef.name, orderId: id, orderType: 'dine-in' }),
            });
          }
        }
      } catch (e) {
        console.error('Failed to notify chefs for forwardToChef:', e);
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'approveStaff') {
      const { id, isApproved } = payload;
      await db.update(users).set({ isApproved }).where(eq(users.id, id));
      const userData = (await db.select().from(users).where(eq(users.id, id)))[0];
      if (userData?.email && isStaffRole(userData.role)) {
        await sendEmail({
          to: userData.email,
          subject: 'Staff account access update',
          html: staffApprovalHtml(userData.name, userData.role, isApproved),
        });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'saveStaffMember') {
      const { id, role, userId, managerId, status, specialization, section, shiftPreference, name, email, phone, password } = payload;
      const normalizedRole = String(role || '').toLowerCase();
      const targetTable = normalizedRole === 'chef' ? chefs : normalizedRole === 'waiter' ? waiters : normalizedRole === 'cashier' ? cashiers : null;

      if (!targetTable) {
        return NextResponse.json({ success: false, error: 'Invalid staff role' }, { status: 400 });
      }

      let resolvedUserId = userId ?? null;
      if (!resolvedUserId && name && email && password) {
        const hashedPassword = await hashPassword(password);
        const insertResult = await db.insert(users).values({
          name,
          email,
          password: hashedPassword,
          phone: phone || null,
          role: normalizedRole,
          loyaltyPoints: 0,
          isApproved: true,
          isEmailVerified: true,
        }).returning({ id: users.id });
        resolvedUserId = Number(insertResult[0]?.id || 0);

        if (resolvedUserId) {
          const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/staff-login`;
          await sendEmail({
            to: email,
            subject: `Welcome to FirstBite as ${normalizedRole}`,
            html: staffWelcomeEmailHtml({
              name,
              role: normalizedRole,
              email,
              password,
              loginUrl,
            }),
          });
        }
      }

      if (!resolvedUserId) {
        return NextResponse.json({ success: false, error: 'Staff user is required' }, { status: 400 });
      }

      const recordPayload = {
        userId: Number(resolvedUserId),
        managerId: managerId ? Number(managerId) : null,
        status: status || 'active',
        specialization: specialization || null,
        section: section || null,
        shiftPreference: shiftPreference || null,
      };

      if (id) {
        if (normalizedRole === 'chef') {
          await db.update(chefs).set(recordPayload).where(eq(chefs.id, id));
        } else if (normalizedRole === 'waiter') {
          await db.update(waiters).set(recordPayload).where(eq(waiters.id, id));
        } else if (normalizedRole === 'cashier') {
          await db.update(cashiers).set(recordPayload).where(eq(cashiers.id, id));
        }
      } else {
        if (normalizedRole === 'chef') {
          await db.insert(chefs).values(recordPayload);
        } else if (normalizedRole === 'waiter') {
          await db.insert(waiters).values(recordPayload);
        } else if (normalizedRole === 'cashier') {
          await db.insert(cashiers).values(recordPayload);
        }
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'deleteStaffMember') {
      const { role, id } = payload;
      if (role === 'chef') {
        await db.delete(chefs).where(eq(chefs.id, id));
      } else if (role === 'waiter') {
        await db.delete(waiters).where(eq(waiters.id, id));
      } else if (role === 'cashier') {
        await db.delete(cashiers).where(eq(cashiers.id, id));
      }
      return NextResponse.json({ success: true });
    }

    // 8. UPDATE INDIVIDUAL ORDER ITEM STATUS (Chef cooking controls)
    if (action === 'updateOrderItemStatus') {
      const { id, status } = payload; // 'pending', 'cooking', 'ready', 'served'
      await db.update(orderItems).set({ status }).where(eq(orderItems.id, id));

      return NextResponse.json({ success: true });
    }

    // 9. PROCESS BILLING & PAYMENT (Cashier / Waiter Counter)
    if (action === 'processPayment') {
      const { orderId, amount, paymentMethod, couponCode, discountAmount, totalAmount, finalAmount, gstAmount, customerEmail, customerName } = payload;

      // 1. Update order amounts if calculated on payment checkout (or just complete it)
      await db.update(orders)
        .set({ 
          status: 'completed',
          totalAmount: String(totalAmount),
          discountAmount: String(discountAmount),
          finalAmount: String(finalAmount),
          gstAmount: String(gstAmount),
          couponCode: couponCode || null,
          updatedAt: new Date()
        })
        .where(eq(orders.id, orderId));

      // 2. Insert Payment record
      await db.insert(payments).values({
        orderId,
        amount: String(finalAmount),
        paymentMethod,
        status: 'completed',
        transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
        createdAt: new Date()
      });

      // 3. Free up table
      const orderData = await db.select().from(orders).where(eq(orders.id, orderId));
      if (orderData[0] && orderData[0].tableId) {
        await db.update(restaurantTables).set({ status: 'available' }).where(eq(restaurantTables.id, orderData[0].tableId));
      }

      const orderInfo = orderData[0];
      let paymentCustomerEmail = customerEmail;
      let paymentCustomerName = customerName;
      if (orderInfo?.customerId) {
        const customer = (await db.select().from(users).where(eq(users.id, orderInfo.customerId)))[0];
        if (customer && isCustomerRole(customer.role)) {
          paymentCustomerEmail = paymentCustomerEmail || customer.email;
          paymentCustomerName = paymentCustomerName || customer.name;
        }
      }
      if (!paymentCustomerEmail) {
        console.log(`[PAYMENT EMAIL SKIPPED] Order ${orderId} has no customer email.`);
        return NextResponse.json({ success: true, warning: 'Payment completed but no customer email was available for notification.' });
      }

      let invoiceEmailSent = false;
      let invoiceEmailResult: any = null;
      if (paymentCustomerEmail) {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
        const itemDetails = await Promise.all(items.map(async (item: any) => {
          const menuItem = (await db.select().from(menuItems).where(eq(menuItems.id, item.menuItemId)))[0];
          return { name: menuItem?.name || 'Unknown Item', quantity: item.quantity, price: item.unitPrice, notes: item.notes || '' };
        }));
        invoiceEmailResult = await sendEmail({
          to: paymentCustomerEmail,
          subject: `💳 Payment received for Order #${orderId}`,
          html: paymentSuccessHtml({ name: paymentCustomerName || 'Customer', orderId, items: itemDetails, finalAmount: String(finalAmount) }),
        });
        invoiceEmailSent = Boolean(invoiceEmailResult?.success && !invoiceEmailResult?.mocked);
        console.log(`Payment email for order ${orderId}:`, invoiceEmailResult);
      }

      return NextResponse.json({ success: true, invoiceEmailSent, invoiceEmailResult });
    }

    // 10. SAVE INVENTORY ITEM
    if (action === 'saveInventory') {
      const { id, name, quantity, unit, reorderLevel, costPerUnit, supplierId } = payload;
      if (id) {
        await db.update(inventoryItems)
          .set({ name, quantity: String(quantity), unit, reorderLevel: String(reorderLevel), costPerUnit: String(costPerUnit), supplierId, updatedAt: new Date() })
          .where(eq(inventoryItems.id, id));
      } else {
        await db.insert(inventoryItems).values({
          name, quantity: String(quantity), unit, reorderLevel: String(reorderLevel), costPerUnit: String(costPerUnit), supplierId, updatedAt: new Date()
        });
      }
      return NextResponse.json({ success: true });
    }

    // DELETE INVENTORY
    if (action === 'deleteInventory') {
      await db.delete(inventoryItems).where(eq(inventoryItems.id, payload.id));
      return NextResponse.json({ success: true });
    }

    // 11. SAVE SUPPLIER
    if (action === 'saveSupplier') {
      const { id, name, contactPerson, email, phone, address } = payload;
      if (id) {
        await db.update(suppliers).set({ name, contactPerson, email, phone, address }).where(eq(suppliers.id, id));
      } else {
        await db.insert(suppliers).values({ name, contactPerson, email, phone, address });
      }
      return NextResponse.json({ success: true });
    }

    // DELETE SUPPLIER
    if (action === 'deleteSupplier') {
      await db.delete(suppliers).where(eq(suppliers.id, payload.id));
      return NextResponse.json({ success: true });
    }

    // 12. CREATE PURCHASE ORDER (Restock Items)
    if (action === 'createPurchaseOrder') {
      const { supplierId, itemName, quantity, cost, status } = payload;
      
      await db.insert(purchaseOrders).values({
        supplierId,
        itemName,
        quantity: String(quantity),
        cost: String(cost),
        status: status || 'ordered',
        orderedAt: new Date()
      });

      // If received instantly, automatically update matching inventory item
      if (status === 'received') {
        // Look up inventory item by name
        const match = await db.select().from(inventoryItems).where(eq(inventoryItems.name, itemName));
        if (match[0]) {
          const newQty = Number(match[0].quantity) + Number(quantity);
          await db.update(inventoryItems)
            .set({ quantity: String(newQty), updatedAt: new Date() })
            .where(eq(inventoryItems.id, match[0].id));
        } else {
          // Create a new inventory item
          await db.insert(inventoryItems).values({
            name: itemName,
            quantity: String(quantity),
            unit: 'pcs',
            reorderLevel: '10',
            costPerUnit: String(Number(cost) / Number(quantity)),
            supplierId,
            updatedAt: new Date()
          });
        }
      }

      return NextResponse.json({ success: true });
    }

    // RECEIVE PURCHASE ORDER (Update status + add to inventory)
    if (action === 'receivePurchaseOrder') {
      const { id } = payload;
      const poList = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
      if (poList[0] && poList[0].status !== 'received') {
        await db.update(purchaseOrders).set({ status: 'received' }).where(eq(purchaseOrders.id, id));
        
        // Update inventory
        const itemName = poList[0].itemName;
        const quantity = poList[0].quantity;
        const match = await db.select().from(inventoryItems).where(eq(inventoryItems.name, itemName));
        if (match[0]) {
          const newQty = Number(match[0].quantity) + Number(quantity);
          await db.update(inventoryItems).set({ quantity: String(newQty) }).where(eq(inventoryItems.id, match[0].id));
        } else {
          await db.insert(inventoryItems).values({
            name: itemName,
            quantity,
            unit: 'pcs',
            reorderLevel: '10',
            costPerUnit: String(Number(poList[0].cost) / Number(quantity)),
            supplierId: poList[0].supplierId,
            updatedAt: new Date()
          });
        }
      }
      return NextResponse.json({ success: true });
    }

    // DELETE PURCHASE ORDER
    if (action === 'deletePurchaseOrder') {
      await db.delete(purchaseOrders).where(eq(purchaseOrders.id, payload.id));
      return NextResponse.json({ success: true });
    }

    // 13. SAVE EMPLOYEE / SHIFT
    if (action === 'saveShift') {
      const { id, userId, date, startTime, endTime, role, status } = payload;
      if (id) {
        await db.update(employeeShifts)
          .set({ userId, date, startTime, endTime, role, status })
          .where(eq(employeeShifts.id, id));
      } else {
        await db.insert(employeeShifts).values({ userId, date, startTime, endTime, role, status });
      }
      return NextResponse.json({ success: true });
    }

    // DELETE SHIFT
    if (action === 'deleteShift') {
      await db.delete(employeeShifts).where(eq(employeeShifts.id, payload.id));
      return NextResponse.json({ success: true });
    }

    // 14. SAVE CUSTOMER/STAFF USER
    if (action === 'saveUser') {
      const { id, name, email, phone, role, pin, loyaltyPoints } = payload;
      if (id) {
        await db.update(users)
          .set({ name, email, phone, role, pin, loyaltyPoints })
          .where(eq(users.id, id));
      } else {
        await db.insert(users).values({ name, email, phone, role, pin, loyaltyPoints });
      }
      return NextResponse.json({ success: true });
    }

    // DELETE USER
    if (action === 'deleteUser') {
      await db.delete(users).where(eq(users.id, payload.id));
      return NextResponse.json({ success: true });
    }

    // 15. EXPENSE RECORDING
    if (action === 'saveExpense') {
      const { id, description, category, amount, date, createdBy } = payload;
      if (id) {
        await db.update(expenses)
          .set({ description, category, amount: String(amount), date, createdBy })
          .where(eq(expenses.id, id));
      } else {
        await db.insert(expenses).values({ description, category, amount: String(amount), date, createdBy });
      }
      return NextResponse.json({ success: true });
    }

    // DELETE EXPENSE
    if (action === 'deleteExpense') {
      await db.delete(expenses).where(eq(expenses.id, payload.id));
      return NextResponse.json({ success: true });
    }

    // 16. COUPON SAVE
    if (action === 'saveCoupon') {
      const { id, code, discountType, discountValue, minOrderAmount, expiryDate, isActive } = payload;
      if (id) {
        await db.update(coupons)
          .set({ code, discountType, discountValue: String(discountValue), minOrderAmount: String(minOrderAmount), expiryDate, isActive })
          .where(eq(coupons.id, id));
      } else {
        await db.insert(coupons).values({ code, discountType, discountValue: String(discountValue), minOrderAmount: String(minOrderAmount), expiryDate, isActive });
      }
      return NextResponse.json({ success: true });
    }

    // DELETE COUPON
    if (action === 'deleteCoupon') {
      await db.delete(coupons).where(eq(coupons.id, payload.id));
      return NextResponse.json({ success: true });
    }

    // 17. SUBMIT REVIEW
    if (action === 'submitReview') {
      const { menuItemId, customerName, rating, comment } = payload;
      await db.insert(reviews).values({ menuItemId, customerName, rating, comment });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error("POST API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


