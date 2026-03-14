import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { calculateCommission } from "@shared/delivery";
import { TRPCError } from "@trpc/server";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

const storeProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "store") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ CATEGORIES ============
  categories: router({
    list: publicProcedure.query(() => db.getCategories()),
    create: publicProcedure
      .input(z.object({ name: z.string(), description: z.string().optional() }))
      .mutation(({ input }) => db.createCategory(input.name, input.description)),
    update: publicProcedure
      .input(z.object({ id: z.number(), name: z.string(), description: z.string().optional() }))
      .mutation(({ input }) => db.updateCategory(input.id, input.name, input.description)),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteCategory(input.id)),
  }),

  // ============ STORES ============
  stores: router({
    list: publicProcedure.query(() => db.getAllStores()),
    getFirst: publicProcedure.query(() => db.getFirstStore()),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getStoreById(input.id)),
    getByUserId: protectedProcedure.query(({ ctx }) => db.getStoreByUserId(ctx.user.id)),
    create: publicProcedure
      .input(
        z.object({
          userId: z.number().default(1),
          name: z.string(),
          description: z.string().optional(),
          latitude: z.number().default(-23.5505),
          longitude: z.number().default(-46.6333),
          address: z.string(),
          phone: z.string().optional(),
          email: z.string().optional(),
        })
      )
      .mutation(({ input }) => db.createStore(input)),
    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          address: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
        })
      )
      .mutation(({ input }) => db.updateStore(input.id, input)),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteStore(input.id)),
  }),

  // ============ PRODUCTS ============
  products: router({
    listAll: publicProcedure.query(() => db.getAllProducts()),
    listByStore: publicProcedure
      .input(z.object({ storeId: z.number() }))
      .query(({ input }) => db.getProductsByStore(input.storeId)),
    listByCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(({ input }) => db.getProductsByCategory(input.categoryId)),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getProductById(input.id)),
    create: publicProcedure
      .input(
        z.object({
          storeId: z.number(),
          categoryId: z.number(),
          name: z.string(),
          description: z.string().optional(),
          price: z.string(),
          salePrice: z.string().optional().nullable(),
          stock: z.number().default(0),
          images: z.array(z.string()).default([]),
        })
      )
      .mutation(({ input }) => db.createProduct(input)),
    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          price: z.string().optional(),
          salePrice: z.string().optional().nullable(),
          stock: z.number().optional(),
          images: z.array(z.string()).optional(),
          categoryId: z.number().optional(),
        })
      )
      .mutation(({ input }) => db.updateProduct(input.id, input)),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteProduct(input.id)),
  }),

  // ============ CUSTOMERS ============
  customers: router({
    getMe: protectedProcedure.query(({ ctx }) => db.getCustomerByUserId(ctx.user.id)),
    create: protectedProcedure
      .input(
        z.object({
          phone: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          zipCode: z.string().optional(),
        })
      )
      .mutation(({ input, ctx }) => db.createCustomer({ ...input, userId: ctx.user.id })),
    update: protectedProcedure
      .input(
        z.object({
          phone: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          zipCode: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const customer = await db.getCustomerByUserId(ctx.user.id);
        if (!customer) throw new TRPCError({ code: "NOT_FOUND" });
        return db.updateCustomer(customer.id, input);
      }),
  }),

  // ============ ORDERS ============
  orders: router({
    getByStore: publicProcedure
      .input(z.object({ storeId: z.number() }))
      .query(({ input }) => db.getOrdersByStore(input.storeId)),
    getByCustomer: protectedProcedure.query(({ ctx }) =>
      db.getCustomerByUserId(ctx.user.id).then((c) => (c ? db.getOrdersByCustomer(c.id) : []))
    ),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getOrderById(input.id)),
    getItems: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .query(({ input }) => db.getOrderItems(input.orderId)),
    updateStatus: publicProcedure
      .input(z.object({ id: z.number(), status: z.enum(["pending", "preparing", "sent", "delivered", "cancelled"]) }))
      .mutation(({ input }) => db.updateOrderStatus(input.id, input.status)),
  }),

  // ============ REVIEWS ============
  reviews: router({
    getByStore: publicProcedure
      .input(z.object({ storeId: z.number() }))
      .query(({ input }) => db.getReviewsByStore(input.storeId)),
    getByProduct: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(({ input }) => db.getReviewsByProduct(input.productId)),
  }),

  // ============ DELIVERY ZONES ============
  deliveryZones: router({
    list: publicProcedure.query(() => db.getDeliveryZones()),
    create: publicProcedure
      .input(
        z.object({
          name: z.string(),
          minDistanceKm: z.number(),
          maxDistanceKm: z.number(),
          baseFee: z.string(),
          perKmFee: z.string().optional(),
        })
      )
      .mutation(({ input }) => db.createDeliveryZone(input)),
    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          minDistanceKm: z.number().optional(),
          maxDistanceKm: z.number().optional(),
          baseFee: z.string().optional(),
          perKmFee: z.string().optional(),
        })
      )
      .mutation(({ input }) => db.updateDeliveryZone(input.id, input)),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteDeliveryZone(input.id)),
  }),

  // ============ ADMIN STATISTICS ============
  admin: router({
    statistics: publicProcedure.query(() => db.getAdminStatistics()),
  }),
});

export type AppRouter = typeof appRouter;
