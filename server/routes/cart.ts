import { Router, Response } from "express";
import { getPrisma } from "../db";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Protect all routes here
router.use(authenticateJWT as any);

// GET user's cart items
router.get("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const db = getPrisma();

    const items = await db.cartItem.findMany({
      where: { userId },
      include: {
        product: true
      },
      orderBy: { createdAt: "asc" }
    });

    res.json(items);
  } catch (err: any) {
    console.error("Fetch cart error:", err);
    res.status(500).json({ error: "Failed to load shopping cart." });
  }
});

// ADD product to cart or update existing count
router.post("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { productId, quantity } = req.body;

    if (!productId) {
      res.status(400).json({ error: "Product ID is required." });
      return;
    }

    const qtyNum = quantity !== undefined ? parseInt(quantity) : 1;
    if (isNaN(qtyNum) || qtyNum <= 0) {
      res.status(400).json({ error: "Quantity must be a positive integer." });
      return;
    }

    const db = getPrisma();

    // Verification of product existence and stock
    const product = await db.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      res.status(404).json({ error: "Product not found." });
      return;
    }

    if (product.stock < qtyNum) {
      res.status(400).json({ error: `Not enough stock. Only ${product.stock} items left.` });
      return;
    }

    // Check if item is already in user's cart
    const existingCartItem = await db.cartItem.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });

    const targetQuantity = existingCartItem ? existingCartItem.quantity + qtyNum : qtyNum;

    // Check stock limit for combined quantities
    if (product.stock < targetQuantity) {
      res.status(400).json({
        error: `Cannot add more items. Only ${product.stock} units are in stock (you already have ${existingCartItem?.quantity || 0} in your cart).`
      });
      return;
    }

    let updatedOrNewItem;
    if (existingCartItem) {
      updatedOrNewItem = await db.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: targetQuantity },
        include: { product: true }
      });
    } else {
      updatedOrNewItem = await db.cartItem.create({
        data: {
          userId,
          productId,
          quantity: qtyNum
        },
        include: { product: true }
      });
    }

    res.json(updatedOrNewItem);
  } catch (err: any) {
    console.error("Add to cart error:", err);
    res.status(500).json({ error: "Failed to add item to shopping cart." });
  }
});

// UPDATE quantity of a item in the cart
router.put("/:productId", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      res.status(400).json({ error: "Quantity is required." });
      return;
    }

    const qtyNum = parseInt(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      res.status(400).json({ error: "Quantity must be a positive integer." });
      return;
    }

    const db = getPrisma();

    // Verify product stock
    const product = await db.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      res.status(404).json({ error: "Product not found." });
      return;
    }

    if (product.stock < qtyNum) {
      res.status(400).json({ error: `Not enough stock limit. Only ${product.stock} units available.` });
      return;
    }

    // Check if cart item exists
    const existing = await db.cartItem.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });

    if (!existing) {
      res.status(404).json({ error: "Item not found in shopping cart." });
      return;
    }

    const updated = await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: qtyNum },
      include: { product: true }
    });

    res.json(updated);
  } catch (err: any) {
    console.error("Update cart quantity error:", err);
    res.status(500).json({ error: "Failed to update item quantity." });
  }
});

// REMOVE item from cart
router.delete("/:productId", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;

    const db = getPrisma();
    const existing = await db.cartItem.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });

    if (!existing) {
      res.status(404).json({ error: "Item not found in shopping cart." });
      return;
    }

    await db.cartItem.delete({
      where: { id: existing.id }
    });

    res.json({ message: "Item removed from cart.", productId });
  } catch (err: any) {
    console.error("Remove from cart error:", err);
    res.status(500).json({ error: "Failed to remove item from shopping cart." });
  }
});

// CLEAR cart
router.delete("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const db = getPrisma();

    await db.cartItem.deleteMany({
      where: { userId }
    });

    res.json({ message: "Shopping cart successfully cleared." });
  } catch (err: any) {
    console.error("Clear cart error:", err);
    res.status(500).json({ error: "Failed to empty shopping cart." });
  }
});

export default router;
