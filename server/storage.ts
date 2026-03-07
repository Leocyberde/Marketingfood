import { db } from "./db";
import { 
  stores, products, orders, orderItems,
  type Store, type Product, type Order, type OrderItem,
  type InsertStore, type InsertProduct, type InsertOrder, type InsertOrderItem,
  type CreateOrderRequest
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Stores
  getStores(): Promise<Store[]>;
  getStore(id: number): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: number, updates: Partial<InsertStore>): Promise<Store>;

  // Products
  getProducts(storeId?: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Orders
  getOrders(storeId?: number): Promise<(Order & { items: OrderItem[] })[]>;
  getOrder(id: number): Promise<(Order & { items: OrderItem[] }) | undefined>;
  createOrder(order: CreateOrderRequest): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
}

export class DatabaseStorage implements IStorage {
  async getStores(): Promise<Store[]> {
    return await db.select().from(stores);
  }
  
  async getStore(id: number): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store;
  }

  async createStore(store: InsertStore): Promise<Store> {
    const [newStore] = await db.insert(stores).values(store).returning();
    return newStore;
  }

  async updateStore(id: number, updates: Partial<InsertStore>): Promise<Store> {
    const [updated] = await db.update(stores).set(updates).where(eq(stores.id, id)).returning();
    return updated;
  }

  async getProducts(storeId?: number): Promise<Product[]> {
    if (storeId) {
      return await db.select().from(products).where(eq(products.storeId, storeId));
    }
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getOrders(storeId?: number): Promise<(Order & { items: OrderItem[] })[]> {
    const ordersList = storeId 
      ? await db.select().from(orders).where(eq(orders.storeId, storeId))
      : await db.select().from(orders);
    
    const result = [];
    for (const order of ordersList) {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      result.push({ ...order, items });
    }
    return result;
  }

  async getOrder(id: number): Promise<(Order & { items: OrderItem[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    return { ...order, items };
  }

  async createOrder(orderRequest: CreateOrderRequest): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values({
        storeId: orderRequest.storeId,
        customerName: orderRequest.customerName,
        customerAddress: orderRequest.customerAddress,
        totalPrice: orderRequest.totalPrice,
        status: "pending"
      }).returning();

      for (const item of orderRequest.items) {
        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        });
      }

      return newOrder;
    });
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updated] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();