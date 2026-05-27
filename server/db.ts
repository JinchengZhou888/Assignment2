import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

let prisma: PrismaClient;

export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

export async function seedDatabase() {
  const db = getPrisma();
  
  try {
    // Check if we already have users
    const userCount = await db.user.count();
    if (userCount === 0) {
      console.log("Database contains no users. Creating seed users...");

      // Hash passwords
      const adminPasswordHash = await bcrypt.hash("admin123", 10);
      const userPasswordHash = await bcrypt.hash("user123", 10);

      // Seed Users
      await db.user.create({
        data: {
          email: "admin@university.edu",
          name: "Admin User",
          password: adminPasswordHash,
          role: "ADMIN"
        }
      });

      await db.user.create({
        data: {
          email: "user@university.edu",
          name: "Jane Doe",
          password: userPasswordHash,
          role: "USER"
        }
      });
    }

    // Seed/Upsert default Products to guarantee valid data and pristine working imagery
    const products = [
      {
        name: "Premium Wireless Headphones",
        description: "Over-ear noise-canceling headphones with 40-hour battery life and high-fidelity sound quality.",
        price: 199.99,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
        category: "Electronics",
        stock: 15
      },
      {
        name: "Minimalist Mechanical Keyboard",
        description: "Tenkeyless mechanical keyboard featuring customizable tactile switches and clean white backlight.",
        price: 89.50,
        imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80",
        category: "Electronics",
        stock: 8
      },
      {
        name: "Ergonomic Office Chair",
        description: "High-back mesh workspace chair featuring lumbar support, puzzle-armrests, and durable polyurethane wheels.",
        price: 249.00,
        imageUrl: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500&q=80",
        category: "Office",
        stock: 5
      },
      {
        name: "Stainless Steel Water Bottle",
        description: "Double-walled vacuum insulated canteen that keeps drinks cold for 24 hours or hot for 12 hours.",
        price: 25.00,
        imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80",
        category: "Fitness & Outdoor",
        stock: 45
      },
      {
        name: "Canvas Field Backpack",
        description: "Rugged and spacious cotton canvas daysack featuring genuine leather vintage buckle accents and a 15-inch laptop sleeve.",
        price: 65.00,
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
        category: "Apparel",
        stock: 20
      },
      {
        name: "Full-Grain Leather Wallet",
        description: "Bifold pocket organizer with RFID blocking security crafted from premium, responsibly sourced leather.",
        price: 45.00,
        imageUrl: "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&q=80&w=650",
        category: "Apparel",
        stock: 12
      },
      {
        name: "Smart Fitness Watch",
        description: "Heartrate tracking wrist wearable featuring onboard GPS, sleep quality analytics, and detailed swim-proof metrics.",
        price: 129.99,
        imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80",
        category: "Fitness & Outdoor",
        stock: 18
      }
    ];

    for (const product of products) {
      const existingProduct = await db.product.findFirst({
        where: { name: product.name }
      });

      if (existingProduct) {
        // If it exists, update it to refresh default specifications & image URLs
        await db.product.update({
          where: { id: existingProduct.id },
          data: {
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl,
            category: product.category,
            stock: product.stock
          }
        });
      } else {
        // Otherwise, create it fresh
        await db.product.create({
          data: product
        });
      }
    }

    console.log("Database successfully synchronized and seeded with default data!");
  } catch (err) {
    console.error("Failed to seed database:", err);
  }
}
