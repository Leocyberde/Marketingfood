import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  active: boolean("active").default(true),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // price in cents
  promotionalPrice: integer("promotional_price"), // price in cents
  stock: integer("stock").notNull().default(0),
  category: text("category"),
  imageUrl: text("image_url"),
  active: boolean("active").default(true),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerAddress: text("customer_address").notNull(),
  status: text("status").notNull().default("pending"), 
  totalPrice: integer("total_price").notNull(), // in cents
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(), 
});

export const insertStoreSchema = createInsertSchema(stores).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });

export type Store = typeof stores.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;

export type InsertStore = z.infer<typeof insertStoreSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export const createOrderSchema = z.object({
  storeId: z.number(),
  customerName: z.string(),
  customerAddress: z.string(),
  totalPrice: z.number(),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number(),
    price: z.number()
  }))
});

export type CreateOrderRequest = z.infer<typeof createOrderSchema>;
