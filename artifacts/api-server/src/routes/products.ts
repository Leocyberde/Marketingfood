import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable, storesTable } from "@workspace/db/schema";
import { eq, ilike, and, type SQL } from "drizzle-orm";

const router: IRouter = Router();

router.get("/products", async (req, res) => {
  try {
    const { search, storeId, categoryId } = req.query;
    const conditions: SQL[] = [eq(productsTable.isAvailable, true)];
    if (storeId) conditions.push(eq(productsTable.storeId, Number(storeId)));
    if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
    if (categoryId) conditions.push(eq(storesTable.categoryId, Number(categoryId)));

    const products = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,
        price: productsTable.price,
        stock: productsTable.stock,
        storeId: productsTable.storeId,
        storeName: storesTable.name,
        categoryId: storesTable.categoryId,
        imageUrl: productsTable.imageUrl,
        isAvailable: productsTable.isAvailable,
        createdAt: productsTable.createdAt,
      })
      .from(productsTable)
      .leftJoin(storesTable, eq(productsTable.storeId, storesTable.id))
      .where(and(...conditions));

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stores/:storeId/products", async (req, res) => {
  try {
    const products = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,
        price: productsTable.price,
        stock: productsTable.stock,
        storeId: productsTable.storeId,
        storeName: storesTable.name,
        categoryId: storesTable.categoryId,
        imageUrl: productsTable.imageUrl,
        isAvailable: productsTable.isAvailable,
        createdAt: productsTable.createdAt,
      })
      .from(productsTable)
      .leftJoin(storesTable, eq(productsTable.storeId, storesTable.id))
      .where(eq(productsTable.storeId, Number(req.params.storeId)));

    res.json(products);
  } catch (error) {
    console.error("Error fetching store products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/stores/:storeId/products", async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl, isAvailable } = req.body;
    const storeId = Number(req.params.storeId);

    const [product] = await db
      .insert(productsTable)
      .values({
        name,
        description: description || "",
        price: String(price),
        stock: Number(stock),
        storeId,
        imageUrl: imageUrl || null,
        isAvailable: isAvailable !== false,
      })
      .returning();

    const [withStore] = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,
        price: productsTable.price,
        stock: productsTable.stock,
        storeId: productsTable.storeId,
        storeName: storesTable.name,
        categoryId: storesTable.categoryId,
        imageUrl: productsTable.imageUrl,
        isAvailable: productsTable.isAvailable,
        createdAt: productsTable.createdAt,
      })
      .from(productsTable)
      .leftJoin(storesTable, eq(productsTable.storeId, storesTable.id))
      .where(eq(productsTable.id, product.id));

    res.status(201).json(withStore);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl, isAvailable } = req.body;
    const [product] = await db
      .update(productsTable)
      .set({
        name,
        description: description || "",
        price: String(price),
        stock: Number(stock),
        imageUrl: imageUrl || null,
        isAvailable: isAvailable !== false,
      })
      .where(eq(productsTable.id, Number(req.params.id)))
      .returning();

    if (!product) return res.status(404).json({ error: "Product not found" });

    const [withStore] = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,
        price: productsTable.price,
        stock: productsTable.stock,
        storeId: productsTable.storeId,
        storeName: storesTable.name,
        categoryId: storesTable.categoryId,
        imageUrl: productsTable.imageUrl,
        isAvailable: productsTable.isAvailable,
        createdAt: productsTable.createdAt,
      })
      .from(productsTable)
      .leftJoin(storesTable, eq(productsTable.storeId, storesTable.id))
      .where(eq(productsTable.id, product.id));

    return res.json(withStore);
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    await db.delete(productsTable).where(eq(productsTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
