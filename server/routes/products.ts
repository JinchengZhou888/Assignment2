import { Router, Request, Response } from "express";
import { getPrisma } from "../db";
import { authenticateJWT, requireAdmin, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// GET all products
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getPrisma();
    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(products);
  } catch (err: any) {
    console.error("Fetch products error:", err);
    res.status(500).json({ error: "Failed to load products." });
  }
});

// GET single product
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getPrisma();
    const product = await db.product.findUnique({
      where: { id: req.params.id }
    });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(product);
  } catch (err: any) {
    console.error("Fetch product by ID error:", err);
    res.status(500).json({ error: "Failed to load product details." });
  }
});

// ADMIN ONLY: CREATE product
router.post("/", authenticateJWT as any, requireAdmin as any, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, imageUrl, category, stock } = req.body;

    if (!name || !description || price === undefined || !category) {
      res.status(400).json({ error: "Name, description, price, and category are required." });
      return;
    }

    const priceNum = parseFloat(price);
    const stockNum = stock !== undefined ? parseInt(stock) : 10;

    if (isNaN(priceNum) || priceNum < 0) {
      res.status(400).json({ error: "Price must be a valid positive number." });
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      res.status(400).json({ error: "Stock must be a valid positive integer." });
      return;
    }

    const defaultImage = imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80";

    const db = getPrisma();
    const newProduct = await db.product.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        imageUrl: defaultImage,
        category: category.trim(),
        stock: stockNum
      }
    });

    res.status(201).json(newProduct);
  } catch (err: any) {
    console.error("Create product error:", err);
    res.status(500).json({ error: "Failed to create product." });
  }
});

// ADMIN ONLY: UPDATE product
router.put("/:id", authenticateJWT as any, requireAdmin as any, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, imageUrl, category, stock } = req.body;

    const db = getPrisma();
    const existing = await db.product.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (description) updateData.description = description.trim();
    if (category) updateData.category = category.trim();
    if (imageUrl) updateData.imageUrl = imageUrl.trim();

    if (price !== undefined) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        res.status(400).json({ error: "Price must be a valid positive number." });
        return;
      }
      updateData.price = priceNum;
    }

    if (stock !== undefined) {
      const stockNum = parseInt(stock);
      if (isNaN(stockNum) || stockNum < 0) {
        res.status(400).json({ error: "Stock must be a valid positive integer." });
        return;
      }
      updateData.stock = stockNum;
    }

    const updated = await db.product.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json(updated);
  } catch (err: any) {
    console.error("Update product error:", err);
    res.status(500).json({ error: "Failed to update product." });
  }
});

// ADMIN ONLY: DELETE product
router.delete("/:id", authenticateJWT as any, requireAdmin as any, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const db = getPrisma();
    const existing = await db.product.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Checking if it has active cart items (cascade will delete them automatically since we configured onDelete: Cascade, but it's safe to run delete)
    await db.product.delete({
      where: { id: req.params.id }
    });

    res.json({ message: "Product successfully deleted.", id: req.params.id });
  } catch (err: any) {
    console.error("Delete product error:", err);
    res.status(500).json({ error: "Failed to delete product." });
  }
});

export default router;
