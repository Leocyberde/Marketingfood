import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

async function seedDatabase() {
  try {
    const existingMerchants = await storage.getMerchants();
    if (existingMerchants.length === 0) {
      const merchant1 = await storage.createMerchant({
        name: "Eletrônicos TechWorld",
        address: "Rua da Tecnologia, 123 - São Paulo, SP",
        lat: -23.5505,
        lng: -46.6333,
      });
      
      const merchant2 = await storage.createMerchant({
        name: "Papelaria Criativa",
        address: "Avenida Paulista, 1000 - São Paulo, SP",
        lat: -23.5615,
        lng: -46.6560,
      });

      const merchant3 = await storage.createMerchant({
        name: "Auto Peças Central",
        address: "Rua do Comércio, 456 - São Paulo, SP",
        lat: -23.5505,
        lng: -46.6333,
      });

      await storage.createProduct({
        merchantId: merchant1.id,
        name: "Fone de Ouvido Bluetooth",
        description: "Cancelamento de ruído e bateria de longa duração",
        price: 199.90,
        category: "Eletrônicos",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
      });

      await storage.createProduct({
        merchantId: merchant2.id,
        name: "Caderno Inteligente",
        description: "Folhas reposicionáveis e capa dura",
        price: 89.90,
        category: "Papelaria",
        image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&q=80",
      });

      await storage.createProduct({
        merchantId: merchant3.id,
        name: "Óleo para Motor 5W30",
        description: "Sintético de alta performance",
        price: 45.00,
        category: "Peças",
        image: "https://images.unsplash.com/photo-1635773054018-22c989ca400d?w=500&q=80",
      });
      
      console.log("Database seeded successfully with merchants.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.merchants.list.path, async (req, res) => {
    const merchantsList = await storage.getMerchants();
    res.json(merchantsList);
  });

  app.get(api.merchants.get.path, async (req, res) => {
    const merchant = await storage.getMerchant(Number(req.params.id));
    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }
    res.json(merchant);
  });

  app.post(api.merchants.create.path, async (req, res) => {
    try {
      const input = api.merchants.create.input.parse(req.body);
      const merchant = await storage.createMerchant(input);
      res.status(201).json(merchant);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.put(api.merchants.update.path, async (req, res) => {
    try {
      const input = api.merchants.update.input.parse(req.body);
      const merchant = await storage.updateMerchant(Number(req.params.id), input);
      res.json(merchant);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.get(api.products.list.path, async (req, res) => {
    const merchantId = req.query.merchantId ? Number(req.query.merchantId) : undefined;
    const productsList = await storage.getProducts(merchantId);
    res.json(productsList);
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const bodySchema = api.products.create.input.extend({
        merchantId: z.coerce.number(),
        price: z.coerce.number(),
        promoPrice: z.coerce.number().nullable(),
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
        merchantId: z.coerce.number().optional(),
        price: z.coerce.number().optional(),
        promoPrice: z.coerce.number().nullable().optional(),
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
    const merchantId = req.query.merchantId ? Number(req.query.merchantId) : undefined;
    const ordersList = await storage.getOrders(merchantId);
    res.json(ordersList);
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const bodySchema = api.orders.create.input.extend({
        merchantId: z.coerce.number(),
        deliveryPrice: z.coerce.number(),
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
