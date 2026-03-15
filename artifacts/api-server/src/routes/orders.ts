import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, storesTable, productsTable, categoriesTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

async function getOrderWithItems(orderId: number) {
  const [order] = await db
    .select({
      id: ordersTable.id,
      customerName: ordersTable.customerName,
      customerPhone: ordersTable.customerPhone,
      customerAddress: ordersTable.customerAddress,
      storeId: ordersTable.storeId,
      storeName: storesTable.name,
      status: ordersTable.status,
      total: ordersTable.total,
      notes: ordersTable.notes,
      createdAt: ordersTable.createdAt,
    })
    .from(ordersTable)
    .leftJoin(storesTable, eq(ordersTable.storeId, storesTable.id))
    .where(eq(ordersTable.id, orderId));

  if (!order) return null;

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId));

  return {
    ...order,
    items: items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    })),
  };
}

router.get("/orders", async (_req, res) => {
  try {
    const orders = await db
      .select({
        id: ordersTable.id,
        customerName: ordersTable.customerName,
        customerPhone: ordersTable.customerPhone,
        customerAddress: ordersTable.customerAddress,
        storeId: ordersTable.storeId,
        storeName: storesTable.name,
        status: ordersTable.status,
        total: ordersTable.total,
        notes: ordersTable.notes,
        createdAt: ordersTable.createdAt,
      })
      .from(ordersTable)
      .leftJoin(storesTable, eq(ordersTable.storeId, storesTable.id))
      .orderBy(ordersTable.createdAt);

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItemsTable)
          .where(eq(orderItemsTable.orderId, order.id));
        return {
          ...order,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
        };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const { customerName, customerPhone, customerAddress, storeId, notes, items } = req.body;

    const productIds = items.map((i: { productId: number }) => i.productId);
    const productRows = await db
      .select()
      .from(productsTable)
      .where(sql`${productsTable.id} = ANY(${productIds})`);

    const productMap = new Map(productRows.map((p) => [p.id, p]));

    let total = 0;
    const orderItems = items.map((item: { productId: number; quantity: number }) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      const unitPrice = Number(product.price);
      const subtotal = unitPrice * item.quantity;
      total += subtotal;
      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: String(unitPrice),
        subtotal: String(subtotal),
      };
    });

    const [order] = await db
      .insert(ordersTable)
      .values({
        customerName,
        customerPhone,
        customerAddress,
        storeId: Number(storeId),
        notes: notes || null,
        total: String(total),
        status: "pending",
      })
      .returning();

    await db.insert(orderItemsTable).values(
      orderItems.map((item: { productId: number; productName: string; quantity: number; unitPrice: string; subtotal: string }) => ({
        orderId: order.id,
        ...item,
      }))
    );

    const result = await getOrderWithItems(order.id);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const order = await getOrderWithItems(Number(req.params.id));
    if (!order) return res.status(404).json({ error: "Order not found" });
    return res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/orders/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const [order] = await db
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, Number(req.params.id)))
      .returning();

    if (!order) return res.status(404).json({ error: "Order not found" });

    const result = await getOrderWithItems(order.id);
    return res.json(result);
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stores/:storeId/orders", async (req, res) => {
  try {
    const storeId = Number(req.params.storeId);
    const orders = await db
      .select({
        id: ordersTable.id,
        customerName: ordersTable.customerName,
        customerPhone: ordersTable.customerPhone,
        customerAddress: ordersTable.customerAddress,
        storeId: ordersTable.storeId,
        storeName: storesTable.name,
        status: ordersTable.status,
        total: ordersTable.total,
        notes: ordersTable.notes,
        createdAt: ordersTable.createdAt,
      })
      .from(ordersTable)
      .leftJoin(storesTable, eq(ordersTable.storeId, storesTable.id))
      .where(eq(ordersTable.storeId, storeId))
      .orderBy(ordersTable.createdAt);

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItemsTable)
          .where(eq(orderItemsTable.orderId, order.id));
        return {
          ...order,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
        };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    console.error("Error fetching store orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
