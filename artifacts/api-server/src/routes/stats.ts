import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { storesTable, productsTable, ordersTable } from "@workspace/db/schema";
import { sql, eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats", async (_req, res) => {
  try {
    const [storeCount] = await db.select({ count: sql<number>`count(*)::int` }).from(storesTable);
    const [productCount] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable);
    const [orderCount] = await db.select({ count: sql<number>`count(*)::int` }).from(ordersTable);
    const [revenue] = await db.select({ total: sql<number>`coalesce(sum(total::numeric), 0)` }).from(ordersTable);
    const [pending] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(ordersTable)
      .where(eq(ordersTable.status, "pending"));
    const [activeStores] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(storesTable)
      .where(eq(storesTable.isOpen, true));

    res.json({
      totalStores: storeCount.count,
      totalProducts: productCount.count,
      totalOrders: orderCount.count,
      totalRevenue: Number(revenue.total),
      pendingOrders: pending.count,
      activeStores: activeStores.count,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
