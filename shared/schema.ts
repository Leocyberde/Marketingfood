import { sqliteTable, integer, text, real, primaryKey } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const merchants = sqliteTable("merchants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  merchantId: integer("merchant_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  promoPrice: real("promo_price"),
  stock: integer("stock").notNull().default(0),
  image: text("image"),
  category: text("category"),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientName: text("client_name").notNull(),
  merchantId: integer("merchant_id").notNull(),
  status: text("status").notNull().default("pending"),
  deliveryPrice: real("delivery_price").notNull(),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
});

export const clientAddresses = sqliteTable("client_addresses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  street: text("street").notNull(),
  number: text("number").notNull(),
  neighborhood: text("neighborhood").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  complement: text("complement"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  isMain: integer("is_main", { mode: "boolean" }).notNull().default(false),
});

export const insertMerchantSchema = createInsertSchema(merchants).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertClientAddressSchema = createInsertSchema(clientAddresses).omit({ id: true });

export type Merchant = typeof merchants.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type ClientAddress = typeof clientAddresses.$inferSelect;

export type InsertMerchant = z.infer<typeof insertMerchantSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type InsertClientAddress = z.infer<typeof insertClientAddressSchema>;

export const createOrderSchema = z.object({
  merchantId: z.number(),
  clientName: z.string(),
  deliveryPrice: z.number(),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number(),
    price: z.number()
  }))
});

export type CreateOrderRequest = z.infer<typeof createOrderSchema>;
