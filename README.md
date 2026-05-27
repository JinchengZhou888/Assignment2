# UniCart — Full-Stack E-Commerce Shopping Cart Application

UniCart is a production-ready, full-stack e-commerce web application built as a university assignment. It connects a modern React frontend with a secure Node.js Express server, backed by an SQLite relational database utilizing the Prisma ORM.

## 🚀 Tech Stack

### Frontend (User Interface)
- **Framework:** React 19 with Vite
- **Styling:** Tailwind CSS (fully responsive, modern aesthetics)
- **Animations:** Motion (`motion/react` for micro-interactions and view transitions)
- **Iconography:** Lucide Icons (`lucide-react`)

### Backend (Server & Database)
- **Platform:** Node.js with Express (with TSX running TypeScript directly)
- **Database ORM:** Prisma Client
- **Engine Database:** SQLite (`dev.db` flat-file relational storage)
- **Authentication:** Password hashing using `bcryptjs`
- **Authorization:** Token-based authorization with state-less JSON Web Tokens (`jsonwebtoken`)

---

## ⚡ Core Assignment Features

1. **Integrated User Lifecycle (Auth):** Registration and Login with automatic credential verification and password hashing using client-side safety measures.
2. **Session Persistence (JWT):** Generates securely signed state-less JWT values stored in web `localStorage` and sent over `Authorization: Bearer` request headers.
3. **Responsive Grid Storefront:** Displays catalog items with dynamic category filters and a **real-time live text search** on titles and descriptions.
4. **Dynamic Cart Management (CRUD):** Adds products, increases/decreases quantity inline with **dynamic stock checks**, completely removes lines, or flushes sessions.
5. **Simulated Order Checkout:** Models student purchase processing, flushes cart records, and restores or adjusts inventory.
6. **Administrative Dashboard (CRUD):** 
   - Manage full catalog details (add new items, update descriptions, assign pricing indices, or delete items).
   - Trace all registered users and directly view nested list diagrams of **their active shopping carts**.
7. **Single-Page Application Integrity:** Route navigations and view switches function gracefully with smooth animations—completely free of page reloads.
8. **Automated Database Seeding:** Populates base assets and user accounts upon first boot.

---

## 📁 Project Folder Structure

```text
├── package.json               # Server scripts & dependencies (Express, React, Prisma)
├── tsconfig.json              # TypeScript compilation setup
├── vite.config.ts             # Vite configuration bundling static file servers
├── server.ts                  # Main Full-Stack backend entrypoint (Express + Vite middlewares)
├── metadata.json              # AI Studio App configuration
├── .env.example               # Exemplar template of env configuration
│
├── prisma/
│   └── schema.prisma          # Relational Database SQLite schema (prisma-client-js v5)
│
├── server/
│   ├── db.ts                  # Lazy-loaded Prisma connections & sandbox seeder
│   ├── middleware/
│   │   └── auth.ts            # JWT validation and ADMIN role boundary guards
│   └── routes/
│       ├── auth.ts            # Authentication endpoints (/api/auth)
│       ├── products.ts        # Product catalog CRUD endpoints (/api/products)
│       ├── cart.ts            # User shopping cart CRUD endpoints (/api/cart)
│       └── users.ts           # Admin dashboard analytics (/api/users)
│
└── src/
    ├── types.ts               # Shared Types and Interfaces
    ├── main.tsx               # Frontend bootstrap React index loader
    ├── index.css              # Global Tailwind style directions
    ├── App.tsx                # Client-side coordinator connecting views and stores
    └── components/
        ├── Navbar.tsx         # Sticky navigation and session action button
        ├── AuthPage.tsx       # Auth card combining Login/Register with preset credentials
        ├── ProductCard.tsx    # Responsive product card with purchase or admin control routes
        ├── ProductAdminForm.tsx # Modal dialog adding or editing products
        ├── CartList.tsx       # Shopping cart list holding subtotal and checkout simulator
        └── AdminDashboard.tsx  # Admin registry trace tracing user carts
```

---

## 🛠️ How to Run the App Locally

To clone, build, and debug this university assignment in your local terminal, follow these steps:

### 1. Prerequisite Installations
Ensure you have the latest stable [Node.js LTS](https://nodejs.org/) installed containing NPM.

### 2. Configure Environment Variables
Copy `.env.example` into a real `.env` file containing your local keys:
```bash
cp .env.example .env
```
Keep or define your custom token signature:
```env
JWT_SECRET="academic_university_demo_secret_2026_test"
```

### 3. Setup Project Dependencies & Schema
Install packages and synchronize the SQLite database schemas using standard Prisma commands:
```bash
# Install node packages
npm install

# Push relational schema and initialize the local dev.db file
npx prisma db push
```

### 4. Boot the Server
Run the local dev process binding the live Express and Vite engines together:
```bash
npm run dev
```
Open your browser and navigate to **`http://localhost:3000`** to inspect the application!

### 5. Running the Production Build
To test compilation performance:
```bash
# Bundle frontend static items and pack backend to dist/server.cjs
npm run build

# Boot standalone server
npm start
```

---

## 🎓 Sandbox Test Credentials & Shortcuts
A dedicated credential block is placed inside the **Sign In** screen. You can use these pre-seeded student/instructor accounts to evaluate the distinct role-based scopes instantly:

- **Student Role (USER):**
  - **Email:** `user@university.edu`
  - **Password:** `user123`
  - *Capability:* Explore catalog, add items to cart, manage quantities, and checkout. Admin Dashboard is locked.
- **Instructor Role (ADMIN):**
  - **Email:** `admin@university.edu`
  - **Password:** `admin123`
  - *Capability:* Add products, update details, delete products, access administrative views, and inspect every user's active shopping cart lines.
