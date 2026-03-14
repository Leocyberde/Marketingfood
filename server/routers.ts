import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { calculateHaversineDistance, calculateDeliveryFee, calculateCommission } from "@shared/delivery";
import { TRPCError } from "@trpc/server";

// Procedure para admin apenas
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

// Procedure para lojista
const storeProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "store") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ CATEGORIES ============
  categories: router({
    list: publicProcedure.query(() => db.getCategories()),
    create: adminProcedure
      .input(z.object({ name: z.string(), description: z.string().optional() }))
      .mutation(({ input }) => db.createCategory(input.name, input.description)),
    update: adminProcedure
      .input(z.object({ id: z.number(), name: z.string(), description: z.string().optional() }))
      .mutation(({ input }) => db.updateCategory(input.id, input.name, input.description)),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteCategory(input.id)),
  }),

  // ============ STORES ============
  stores: router({
    list: publicProcedure.query(() => db.getAllStores()),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getStoreById(input.id)),
    getByUserId: protectedProcedure.query(({ ctx }) => db.getStoreByUserId(ctx.user.id)),
    create: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          name: z.string(),
          description: z.string().optional(),
          latitude: z.number(),
          longitude: z.number(),
          address: z.string(),
          phone: z.string().optional(),
          email: z.string().optional(),
        })
      )
      .mutation(({ input }) => db.createStore(input)),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          address: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const store = await db.getStoreById(input.id);
        if (!store || (store.userId !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return db.updateStore(input.id, input);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteStore(input.id)),
  }),

  // ============ PRODUCTS ============
  products: router({
    listByStore: publicProcedure
      .input(z.object({ storeId: z.number() }))
      .query(({ input }) => db.getProductsByStore(input.storeId)),
    listByCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(({ input }) => db.getProductsByCategory(input.categoryId)),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getProductById(input.id)),
    create: storeProcedure
      .input(
        z.object({
          storeId: z.number(),
          categoryId: z.number(),
          name: z.string(),
          description: z.string().optional(),
          price: z.string(),
          stock: z.number(),
          images: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const store = await db.getStoreByUserId(ctx.user.id);
        if (!store || store.id !== input.storeId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return db.createProduct(input);
      }),
    update: storeProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          price: z.string().optional(),
          stock: z.number().optional(),
          images: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const product = await db.getProductById(input.id);
        if (!product) throw new TRPCError({ code: "NOT_FOUND" });

        const store = await db.getStoreByUserId(ctx.user.id);
        if (!store || store.id !== product.storeId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return db.updateProduct(input.id, input);
      }),
    delete: storeProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const product = await db.getProductById(input.id);
        if (!product) throw new TRPCError({ code: "NOT_FOUND" });

        const store = await db.getStoreByUserId(ctx.user.id);
        if (!store || store.id !== product.storeId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return db.deleteProduct(input.id);
      }),
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
      .mutation(({ input, ctx }) => db.createCustomer({ userId: ctx.user.id, ...input })),
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
    listByCustomer: protectedProcedure.query(async ({ ctx }) => {
      const customer = await db.getCustomerByUserId(ctx.user.id);
      if (!customer) return [];
      return db.getOrdersByCustomer(customer.id);
    }),
    listByStore: storeProcedure.query(async ({ ctx }) => {
      const store = await db.getStoreByUserId(ctx.user.id);
      if (!store) return [];
      return db.getOrdersByStore(store.id);
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });

        const customer = await db.getCustomerByUserId(ctx.user.id);
        const store = await db.getStoreByUserId(ctx.user.id);

        if (customer && order.customerId === customer.id) return order;
        if (store && order.storeId === store.id) return order;
        if (ctx.user.role === "admin") return order;

        throw new TRPCError({ code: "FORBIDDEN" });
      }),
    create: protectedProcedure
      .input(
        z.object({
          storeId: z.number(),
          items: z.array(z.object({ productId: z.number(), quantity: z.number() })),
          deliveryLatitude: z.number(),
          deliveryLongitude: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const customer = await db.getCustomerByUserId(ctx.user.id);
        if (!customer) throw new TRPCError({ code: "NOT_FOUND" });

        const store = await db.getStoreById(input.storeId);
        if (!store) throw new TRPCError({ code: "NOT_FOUND" });

        const settings = await db.getSystemSettings();
        const commissionPercentage = settings?.commissionPercentage ? Number(settings.commissionPercentage) : 10;

        // Calcular distância
        const distance = calculateHaversineDistance(
          store.latitude,
          store.longitude,
          input.deliveryLatitude,
          input.deliveryLongitude
        );

        // Calcular taxa de entrega
        const deliveryFee = calculateDeliveryFee(distance);

        // Calcular subtotal
        let subtotal = 0;
        for (const item of input.items) {
          const product = await db.getProductById(item.productId);
          if (!product) throw new TRPCError({ code: "NOT_FOUND" });
          subtotal += Number(product.price) * item.quantity;
        }

        // Calcular comissão
        const commission = calculateCommission(subtotal, commissionPercentage);
        const total = subtotal + deliveryFee;

        // Criar pedido
        const orderResult = await db.createOrder({
          customerId: customer.id,
          storeId: input.storeId,
          subtotal: subtotal.toString(),
          deliveryFee: deliveryFee.toString(),
          commission: commission.toString(),
          total: total.toString(),
          deliveryDistance: distance,
          deliveryLatitude: input.deliveryLatitude,
          deliveryLongitude: input.deliveryLongitude,
        });

        // Criar itens do pedido
        const orderId = (orderResult as any).insertId;
        for (const item of input.items) {
          const product = await db.getProductById(item.productId);
          if (!product) throw new TRPCError({ code: "NOT_FOUND" });
          await db.createOrderItem({
            orderId,
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          });
        }

        return { orderId, total, deliveryFee, commission };
      }),
    updateStatus: storeProcedure
      .input(z.object({ id: z.number(), status: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });

        const store = await db.getStoreByUserId(ctx.user.id);
        if (!store || store.id !== order.storeId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return db.updateOrderStatus(input.id, input.status);
      }),
  }),

  // ============ ORDER ITEMS ============
  orderItems: router({
    getByOrder: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .query(({ input }) => db.getOrderItems(input.orderId)),
  }),

  // ============ REVIEWS ============
  reviews: router({
    create: protectedProcedure
      .input(
        z.object({
          orderId: z.number(),
          storeId: z.number().optional(),
          productId: z.number().optional(),
          rating: z.number().min(1).max(5),
          comment: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const customer = await db.getCustomerByUserId(ctx.user.id);
        if (!customer) throw new TRPCError({ code: "NOT_FOUND" });

        return db.createReview({
          orderId: input.orderId,
          customerId: customer.id,
          storeId: input.storeId,
          productId: input.productId,
          rating: input.rating,
          comment: input.comment,
        });
      }),
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
    create: adminProcedure
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
    update: adminProcedure
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
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteDeliveryZone(input.id)),
  }),

  // ============ ADMIN STATISTICS ============
  admin: router({
    statistics: adminProcedure.query(() => db.getAdminStatistics()),
  }),
});

export type AppRouter = typeof appRouter;
