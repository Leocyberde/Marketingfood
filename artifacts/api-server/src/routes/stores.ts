import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { storesTable, categoriesTable } from "@workspace/db/schema";
import { eq, ilike, and, type SQL } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stores", async (req, res) => {
  try {
    const { categoryId, search } = req.query;
    const conditions: SQL[] = [];
    if (categoryId) conditions.push(eq(storesTable.categoryId, Number(categoryId)));
    if (search) conditions.push(ilike(storesTable.name, `%${search}%`));

    const stores = await db
      .select({
        id: storesTable.id,
        name: storesTable.name,
        description: storesTable.description,
        address: storesTable.address,
        phone: storesTable.phone,
        categoryId: storesTable.categoryId,
        categoryName: categoriesTable.name,
        rating: storesTable.rating,
        isOpen: storesTable.isOpen,
        createdAt: storesTable.createdAt,
      })
      .from(storesTable)
      .leftJoin(categoriesTable, eq(storesTable.categoryId, categoriesTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    res.json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/stores", async (req, res) => {
  try {
    const { name, description, address, phone, categoryId } = req.body;
    const [store] = await db
      .insert(storesTable)
      .values({ name, description: description || "", address, phone, categoryId: Number(categoryId) })
      .returning();

    const [withCategory] = await db
      .select({
        id: storesTable.id,
        name: storesTable.name,
        description: storesTable.description,
        address: storesTable.address,
        phone: storesTable.phone,
        categoryId: storesTable.categoryId,
        categoryName: categoriesTable.name,
        rating: storesTable.rating,
        isOpen: storesTable.isOpen,
        createdAt: storesTable.createdAt,
      })
      .from(storesTable)
      .leftJoin(categoriesTable, eq(storesTable.categoryId, categoriesTable.id))
      .where(eq(storesTable.id, store.id));

    res.status(201).json(withCategory);
  } catch (error) {
    console.error("Error creating store:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stores/:id", async (req, res) => {
  try {
    const [store] = await db
      .select({
        id: storesTable.id,
        name: storesTable.name,
        description: storesTable.description,
        address: storesTable.address,
        phone: storesTable.phone,
        categoryId: storesTable.categoryId,
        categoryName: categoriesTable.name,
        rating: storesTable.rating,
        isOpen: storesTable.isOpen,
        createdAt: storesTable.createdAt,
      })
      .from(storesTable)
      .leftJoin(categoriesTable, eq(storesTable.categoryId, categoriesTable.id))
      .where(eq(storesTable.id, Number(req.params.id)));

    if (!store) return res.status(404).json({ error: "Store not found" });
    return res.json(store);
  } catch (error) {
    console.error("Error fetching store:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/stores/:id", async (req, res) => {
  try {
    const { name, description, address, phone, categoryId } = req.body;
    const [store] = await db
      .update(storesTable)
      .set({ name, description: description || "", address, phone, categoryId: Number(categoryId) })
      .where(eq(storesTable.id, Number(req.params.id)))
      .returning();

    if (!store) return res.status(404).json({ error: "Store not found" });

    const [withCategory] = await db
      .select({
        id: storesTable.id,
        name: storesTable.name,
        description: storesTable.description,
        address: storesTable.address,
        phone: storesTable.phone,
        categoryId: storesTable.categoryId,
        categoryName: categoriesTable.name,
        rating: storesTable.rating,
        isOpen: storesTable.isOpen,
        createdAt: storesTable.createdAt,
      })
      .from(storesTable)
      .leftJoin(categoriesTable, eq(storesTable.categoryId, categoriesTable.id))
      .where(eq(storesTable.id, store.id));

    return res.json(withCategory);
  } catch (error) {
    console.error("Error updating store:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
