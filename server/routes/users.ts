import { Router, Response } from "express";
import { getPrisma } from "../db";
import { authenticateJWT, requireAdmin, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.get("/dashboard", authenticateJWT as any, requireAdmin as any, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const db = getPrisma();
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        cartItems: {
          include: {
            product: true
          },
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(users);
  } catch (err: any) {
    console.error("Fetch users dashboard details error:", err);
    res.status(500).json({ error: "Failed to fetch admin users dashboard logs." });
  }
});

export default router;
