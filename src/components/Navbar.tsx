import { ShoppingCart, LogOut, ShieldAlert, Store, User as UserIcon } from "lucide-react";
import { motion } from "motion/react";
import { User } from "../types";

interface NavbarProps {
  currentUser: User | null;
  cartCount: number;
  activeTab: "products" | "cart" | "admin" | "profile" | "auth";
  setActiveTab: (tab: "products" | "cart" | "admin" | "profile" | "auth") => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export default function Navbar({
  currentUser,
  cartCount,
  activeTab,
  setActiveTab,
  onLogout,
  onOpenAuth,
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("products")}>
            <div className="p-2 bg-indigo-600 text-white rounded-lg">
              <Store className="h-6 w-6" id="nav-brand-icon" />
            </div>
            <span className="font-sans font-bold tracking-tight text-xl text-gray-900 bg-linear-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              Unicard
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-1">
            <button
              id="tab-products"
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-colors ${
                activeTab === "products"
                  ? "bg-indigo-50 text-indigo-600 font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Shop Products
            </button>
            
            {currentUser && (
              <button
                id="tab-cart"
                onClick={() => setActiveTab("cart")}
                className={`relative px-4 py-2 rounded-lg font-sans text-sm font-medium transition-colors ${
                  activeTab === "cart"
                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Shopping Cart</span>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white font-mono"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </div>
              </button>
            )}

            {currentUser && (
              <button
                id="tab-profile"
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-colors ${
                  activeTab === "profile"
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <UserIcon className="h-4 w-4 text-indigo-500" />
                  <span>My Profile</span>
                </div>
              </button>
            )}

            {currentUser?.role === "ADMIN" && (
              <button
                id="tab-admin"
                onClick={() => setActiveTab("admin")}
                className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-colors ${
                  activeTab === "admin"
                    ? "bg-amber-50 text-amber-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-orange-900"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                  <span>Admin Dashboard</span>
                </div>
              </button>
            )}
          </div>

          {/* User Block Actions */}
          <div className="flex items-center gap-3">
            {/* Mobile Shop Link/Cart Icons (Visible in mobile layouts) */}
            <div className="md:hidden flex space-x-1">
              <button
                onClick={() => setActiveTab("products")}
                className={`p-2 rounded-lg ${activeTab === "products" ? "text-indigo-600 bg-indigo-50" : "text-gray-500"}`}
              >
                <Store className="h-5 w-5" />
              </button>
              {currentUser && (
                <button
                  onClick={() => setActiveTab("cart")}
                  className={`p-2 rounded-lg relative ${activeTab === "cart" ? "text-indigo-600 bg-indigo-50" : "text-gray-500"}`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[10px] text-white flex items-center justify-center font-bold font-mono rounded-full">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
              {currentUser && (
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`p-2 rounded-lg relative ${activeTab === "profile" ? "text-indigo-600 bg-indigo-50" : "text-gray-500"}`}
                >
                  <UserIcon className="h-5 w-5" />
                </button>
              )}
              {currentUser?.role === "ADMIN" && (
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`p-2 rounded-lg ${activeTab === "admin" ? "text-amber-600 bg-amber-50" : "text-gray-500"}`}
                >
                  <ShieldAlert className="h-5 w-5" />
                </button>
              )}
            </div>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div 
                  className="hidden sm:flex flex-col items-end cursor-pointer hover:opacity-80"
                  onClick={() => setActiveTab("profile")}
                  title="View profile details"
                >
                  <span className="text-sm font-sans font-medium text-gray-950">
                    {currentUser.name}
                  </span>
                  <span className="text-xs text-gray-500 font-mono flex items-center gap-0.5">
                    <UserIcon className="h-3 w-3 inline text-indigo-500" />
                    {currentUser.role === "ADMIN" ? "Administrator" : "Student / User"}
                  </span>
                </div>
                <button
                  id="btn-logout"
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-600 hover:text-red-700 text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                id="btn-nav-login"
                onClick={() => setActiveTab("auth")}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all hover:shadow-md cursor-pointer"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
