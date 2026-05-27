import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getPrisma } from "../db";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_default_jwt_secret_university_assignment";

// Registration
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    // Validate inputs
    if (!email || !email.includes("@")) {
      res.status(400).json({ error: "Please enter a valid email address." });
      return;
    }
    if (!password || password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters long." });
      return;
    }
    if (!name || name.trim().length === 0) {
      res.status(400).json({ error: "Name is required." });
      return;
    }

    const assignedRole = role === "ADMIN" ? "ADMIN" : "USER";
    const db = getPrisma();

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      res.status(400).json({ error: "An account with this email already exists." });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name.trim(),
        role: assignedRole
      }
    });

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Server error during registration. " + err.message });
  }
});

// Login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const db = getPrisma();

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      res.status(400).json({ error: "Invalid email or password." });
      return;
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: "Invalid email or password." });
      return;
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login." });
  }
});

// Get Profile Info
router.get("/profile", authenticateJWT as any, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const db = getPrisma();
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (err: any) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Server error fetching profile" });
  }
});

// Update Profile Info (name and password)
router.put("/profile", authenticateJWT as any, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const { name, currentPassword, newPassword } = req.body;
    const db = getPrisma();

    // Fetch user with password to verify
    const user = await db.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const dataToUpdate: any = {};

    if (name) {
      if (name.trim().length === 0) {
        res.status(400).json({ error: "Name cannot be empty" });
        return;
      }
      dataToUpdate.name = name.trim();
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        res.status(400).json({ error: "New password must be at least 6 characters long." });
        return;
      }
      if (!currentPassword) {
        res.status(400).json({ error: "Current password is required to change password." });
        return;
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        res.status(400).json({ error: "Current password is incorrect." });
        return;
      }
      dataToUpdate.password = await bcrypt.hash(newPassword, 10);
    }

    // Update user in DB
    const updatedUser = await db.user.update({
      where: { id: req.user.id },
      data: dataToUpdate
    });

    // Generate new token to reflect changes (especially if name changes)
    const token = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Profile updated successfully!",
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role
      }
    });
  } catch (err: any) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Server error updating profile: " + err.message });
  }
});

export default router;
