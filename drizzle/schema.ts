import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  real,
  serial,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "store", "admin"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "preparing", "sent", "delivered", "cancelled"]);

/**
 * Core user table backing auth flow.
 * Roles: admin (administrador), store (lojista), user (cliente)
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categories table
 */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Stores table - Lojistas
 */
export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  address: text("address").notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  coverageRadiusKm: real("coverageRadiusKm").default(50).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("totalReviews").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;

/**
 * Products table
 */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  storeId: integer("storeId").notNull(),
  categoryId: integer("categoryId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("salePrice", { precision: 10, scale: 2 }),
  stock: integer("stock").default(0).notNull(),
  images: json("images").$type<string[]>().default([]).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("totalReviews").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Customers table - Clientes
 */
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  phone: varchar("phone", { length: 20 }),
  latitude: real("latitude"),
  longitude: real("longitude"),
  address: text("address"),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Orders table
 */
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customerId").notNull(),
  storeId: integer("storeId").notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("deliveryFee", { precision: 10, scale: 2 }).default("0").notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }).default("0").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  deliveryDistance: real("deliveryDistance"),
  deliveryLatitude: real("deliveryLatitude"),
  deliveryLongitude: real("deliveryLongitude"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order Items table
 */
export const orderItems = pgTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  productId: integer("productId").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Reviews table - Avaliações
 */
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  customerId: integer("customerId").notNull(),
  storeId: integer("storeId"),
  productId: integer("productId"),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Delivery Zones table - Configuração de taxas de entrega
 */
export const deliveryZones = pgTable("deliveryZones", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  minDistanceKm: real("minDistanceKm").notNull(),
  maxDistanceKm: real("maxDistanceKm").notNull(),
  baseFee: decimal("baseFee", { precision: 10, scale: 2 }).notNull(),
  perKmFee: decimal("perKmFee", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type DeliveryZone = typeof deliveryZones.$inferSelect;
export type InsertDeliveryZone = typeof deliveryZones.$inferInsert;

/**
 * System Settings table
 */
export const systemSettings = pgTable("systemSettings", {
  id: serial("id").primaryKey(),
  commissionPercentage: decimal("commissionPercentage", { precision: 5, scale: 2 }).default("10").notNull(),
  haversineMultiplier: real("haversineMultiplier").default(0.8).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;
