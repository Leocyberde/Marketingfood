import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  InsertUser,
  users,
  categories,
  stores,
  products,
  customers,
  orders,
  orderItems,
  reviews,
  deliveryZones,
  systemSettings,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({
        target: users.openId,
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ CATEGORIES ============
export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.name);
}

export async function createCategory(name: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(categories).values({ name, description });
}

export async function updateCategory(id: number, name: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(categories)
    .set({ name, description })
    .where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(categories).where(eq(categories.id, id));
}

// ============ STORES ============
export async function getStoreByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(stores).where(eq(stores.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getStoreById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(stores).where(eq(stores.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllStores() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stores).where(eq(stores.isActive, true));
}

export async function getFirstStore() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(stores).where(eq(stores.isActive, true)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products);
}

export async function createStore(storeData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(stores).values(storeData);
  return result;
}

export async function updateStore(id: number, storeData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(stores).set(storeData).where(eq(stores.id, id));
}

export async function deleteStore(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(stores).where(eq(stores.id, id));
}

// ============ PRODUCTS ============
export async function getProductsByStore(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.storeId, storeId));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getProductsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.categoryId, categoryId));
}

export async function createProduct(productData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(products).values(productData);
}

export async function updateProduct(id: number, productData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set(productData).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(products).where(eq(products.id, id));
}

// ============ CUSTOMERS ============
export async function getCustomerByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(customers).where(eq(customers.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createCustomer(customerData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(customers).values(customerData);
}

export async function updateCustomer(id: number, customerData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(customers).set(customerData).where(eq(customers.id, id));
}

// ============ ORDERS ============
export async function getOrdersByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrdersByStore(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(orders)
    .where(eq(orders.storeId, storeId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createOrder(orderData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orders).values(orderData);
}

export async function updateOrderStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(orders).set({ status: status as any }).where(eq(orders.id, id));
}

// ============ ORDER ITEMS ============
export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function createOrderItem(itemData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orderItems).values(itemData);
}

// ============ REVIEWS ============
export async function createReview(reviewData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(reviews).values(reviewData);
}

export async function getReviewsByStore(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.storeId, storeId));
}

export async function getReviewsByProduct(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.productId, productId));
}

// ============ DELIVERY ZONES ============
export async function getDeliveryZones() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deliveryZones).orderBy(deliveryZones.minDistanceKm);
}

export async function createDeliveryZone(zoneData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(deliveryZones).values(zoneData);
}

export async function updateDeliveryZone(id: number, zoneData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(deliveryZones).set(zoneData).where(eq(deliveryZones.id, id));
}

export async function deleteDeliveryZone(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(deliveryZones).where(eq(deliveryZones.id, id));
}

// ============ SYSTEM SETTINGS ============
export async function getSystemSettings() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(systemSettings).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function initializeSystemSettings() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getSystemSettings();
  if (!existing) {
    return db.insert(systemSettings).values({
      commissionPercentage: "10" as any,
      haversineMultiplier: 0.8,
    });
  }
}

// ============ STATISTICS ============
export async function getAdminStatistics() {
  const db = await getDb();
  if (!db) return null;

  const totalSales = await db
    .select({
      total: sql`SUM(total)`,
    })
    .from(orders)
    .where(eq(orders.status, "delivered"));

  const totalStores = await db
    .select({
      count: sql`COUNT(*)`,
    })
    .from(stores);

  const totalCustomers = await db
    .select({
      count: sql`COUNT(*)`,
    })
    .from(customers);

  const activeOrders = await db
    .select({
      count: sql`COUNT(*)`,
    })
    .from(orders)
    .where(
      sql`${orders.status} IN ('pending', 'preparing', 'sent')`
    );

  return {
    totalSales: totalSales[0]?.total || 0,
    totalStores: totalStores[0]?.count || 0,
    totalCustomers: totalCustomers[0]?.count || 0,
    activeOrders: activeOrders[0]?.count || 0,
  };
}
