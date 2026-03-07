import { z } from 'zod';
import { insertStoreSchema, insertProductSchema, stores, products, orders, orderItems, createOrderSchema } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  stores: {
    list: {
      method: 'GET' as const,
      path: '/api/stores' as const,
      responses: {
        200: z.array(z.custom<typeof stores.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/stores/:id' as const,
      responses: {
        200: z.custom<typeof stores.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/stores' as const,
      input: insertStoreSchema,
      responses: {
        201: z.custom<typeof stores.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/stores/:id' as const,
      input: insertStoreSchema.partial(),
      responses: {
        200: z.custom<typeof stores.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products' as const,
      input: z.object({ storeId: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products' as const,
      input: insertProductSchema,
      responses: {
        201: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/products/:id' as const,
      input: insertProductSchema.partial(),
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/products/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders' as const,
      input: z.object({ storeId: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect & { items: typeof orderItems.$inferSelect[] }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: createOrderSchema,
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/orders/:id/status' as const,
      input: z.object({ status: z.string() }),
      responses: {
        200: z.custom<typeof orders.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
