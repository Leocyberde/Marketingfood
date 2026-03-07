import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

async function seedDatabase() {
  try {
    const existingStores = await storage.getStores();
    if (existingStores.length === 0) {
      const store1 = await storage.createStore({
        name: "Lanchonete do Zé",
        description: "Os melhores lanches da região",
        imageUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&q=80",
        active: true,
      });
      
      const store2 = await storage.createStore({
        name: "Pizzaria Bella Napoli",
        description: "Pizza italiana autêntica",
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80",
        active: true,
      });

      await storage.createProduct({
        storeId: store1.id,
        name: "X-Tudo Mega",
        description: "Hambúrguer, queijo, presunto, bacon, ovo, alface e tomate",
        price: 3500,
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
        active: true,
      });

      await storage.createProduct({
        storeId: store2.id,
        name: "Pizza Margherita",
        description: "Molho de tomate, mussarela e manjericão fresco",
        price: 5500,
        imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80",
        active: true,
      });
      
      console.log("Database seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.stores.list.path, async (req, res) => {
    const storesList = await storage.getStores();
    res.json(storesList);
  });

  app.get(api.stores.get.path, async (req, res) => {
    const store = await storage.getStore(Number(req.params.id));
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    res.json(store);
  });

  app.post(api.stores.create.path, async (req, res) => {
    try {
      const input = api.stores.create.input.parse(req.body);
      const store = await storage.createStore(input);
      res.status(201).json(store);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.put(api.stores.update.path, async (req, res) => {
    try {
      const input = api.stores.update.input.parse(req.body);
      const store = await storage.updateStore(Number(req.params.id), input);
      res.json(store);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.get(api.products.list.path, async (req, res) => {
    const storeId = req.query.storeId ? Number(req.query.storeId) : undefined;
    const productsList = await storage.getProducts(storeId);
    res.json(productsList);
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const bodySchema = api.products.create.input.extend({
        storeId: z.coerce.number(),
        price: z.coerce.number(),
      });
      const input = bodySchema.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.put(api.products.update.path, async (req, res) => {
    try {
      const bodySchema = api.products.update.input.extend({
        storeId: z.coerce.number().optional(),
        price: z.coerce.number().optional(),
      });
      const input = bodySchema.parse(req.body);
      const product = await storage.updateProduct(Number(req.params.id), input);
      res.json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.products.delete.path, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.status(204).end();
  });

  app.get(api.orders.list.path, async (req, res) => {
    const storeId = req.query.storeId ? Number(req.query.storeId) : undefined;
    const ordersList = await storage.getOrders(storeId);
    res.json(ordersList);
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const bodySchema = api.orders.create.input.extend({
        storeId: z.coerce.number(),
        totalPrice: z.coerce.number(),
        items: z.array(z.object({
          productId: z.coerce.number(),
          quantity: z.coerce.number(),
          price: z.coerce.number()
        }))
      });
      const input = bodySchema.parse(req.body);
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.patch(api.orders.updateStatus.path, async (req, res) => {
    try {
      const input = api.orders.updateStatus.input.parse(req.body);
      const order = await storage.updateOrderStatus(Number(req.params.id), input.status);
      res.json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  // Seed the database
  seedDatabase();

  return httpServer;
}