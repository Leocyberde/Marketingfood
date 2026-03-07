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
        name: "Eletrônicos TechWorld",
        description: "As últimas novidades em tecnologia e gadgets",
        imageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&q=80",
        active: true,
      });
      
      const store2 = await storage.createStore({
        name: "Papelaria Criativa",
        description: "Tudo para o seu escritório e estudos",
        imageUrl: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=500&q=80",
        active: true,
      });

      const store3 = await storage.createStore({
        name: "Auto Peças Central",
        description: "Peças e acessórios para o seu veículo",
        imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&q=80",
        active: true,
      });

      await storage.createProduct({
        storeId: store1.id,
        name: "Fone de Ouvido Bluetooth",
        description: "Cancelamento de ruído e bateria de longa duração",
        price: 19900,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
        active: true,
      });

      await storage.createProduct({
        storeId: store2.id,
        name: "Caderno Inteligente",
        description: "Folhas reposicionáveis e capa dura",
        price: 8990,
        imageUrl: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&q=80",
        active: true,
      });

      await storage.createProduct({
        storeId: store3.id,
        name: "Óleo para Motor 5W30",
        description: "Sintético de alta performance",
        price: 4500,
        imageUrl: "https://images.unsplash.com/photo-1635773054018-22c989ca400d?w=500&q=80",
        active: true,
      });
      
      console.log("Database seeded successfully with retail stores.");
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
        promotionalPrice: z.coerce.number().nullable(),
        stock: z.coerce.number(),
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
        promotionalPrice: z.coerce.number().nullable().optional(),
        stock: z.coerce.number().optional(),
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