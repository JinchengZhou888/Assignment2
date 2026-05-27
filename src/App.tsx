import { useState, useEffect } from "react";
import { PlusCircle, Search, Sparkles, SlidersHorizontal, Info, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "./components/Navbar";
import AuthPage from "./components/AuthPage";
import ProductCard from "./components/ProductCard";
import ProductAdminForm from "./components/ProductAdminForm";
import CartList from "./components/CartList";
import AdminDashboard from "./components/AdminDashboard";
import UserProfile from "./components/UserProfile";
import { User, Product, CartItem } from "./types";

export default function App() {
  // Session details stored in local storage
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Core Catalogs
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Navigation and active selectors
  const [activeTab, setActiveTab] = useState<"products" | "cart" | "admin" | "profile" | "auth">("products");
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Filters and Live Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Admin modals/forms
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Global loading/error trackers
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Restore session from localStorage on startup
  useEffect(() => {
    const savedToken = localStorage.getItem("unicart_token");
    const savedUser = localStorage.getItem("unicart_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setCurrentUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Local storage token restore issue:", err);
        localStorage.removeItem("unicart_token");
        localStorage.removeItem("unicart_user");
      }
    }
  }, []);

  // Fetch product list
  const loadProductListing = async () => {
    setLoadingProducts(true);
    setGlobalError(null);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) {
        throw new Error("Failed to load store products from database.");
      }
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setGlobalError(err.message || "Could not retrieve products. Verify your backend is running.");
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch shopping cart items
  const loadCartItemsList = async (authToken: string) => {
    if (!authToken) return;
    setCartLoading(true);
    try {
      const res = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.status === 401 || res.status === 403) {
        // Stale or expired token
        handleLogout();
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setCartItems(data);
      }
    } catch (err) {
      console.error("Error retrieving user shopping cart details:", err);
    } finally {
      setCartLoading(false);
    }
  };

  // Reload products and cart in parallel on change of session
  useEffect(() => {
    loadProductListing();
  }, []);

  useEffect(() => {
    if (token) {
      loadCartItemsList(token);
    } else {
      setCartItems([]);
    }
  }, [token]);

  // Auth outcomes
  const handleAuthSuccess = (newToken: string, user: User) => {
    setToken(newToken);
    setCurrentUser(user);
    localStorage.setItem("unicart_token", newToken);
    localStorage.setItem("unicart_user", JSON.stringify(user));
    setIsAuthOpen(false);

    // If user holds admin privileges, let them land on admin view
    if (user.role === "ADMIN") {
      setActiveTab("admin");
    } else {
      setActiveTab("products");
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    setCartItems([]);
    localStorage.removeItem("unicart_token");
    localStorage.removeItem("unicart_user");
    setActiveTab("products");
  };

  // Shopping cart operations
  const handleAddToCart = async (product: Product, quantity: number) => {
    if (!token) {
      setActiveTab("auth");
      return;
    }

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, quantity }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to catalog cart entry.");
      }

      // Re-load items
      await loadCartItemsList(token);
    } catch (err: any) {
      alert(err.message || "Could not complete cart operations.");
      throw err;
    }
  };

  const handleUpdateCartQuantity = async (productId: string, quantity: number) => {
    if (!token) return;

    try {
      const res = await fetch(`/api/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update item count.");
      }

      await loadCartItemsList(token);
    } catch (err: any) {
      alert(err.message || "Failed to update quantity.");
      throw err;
    }
  };

  const handleRemoveCartItem = async (productId: string) => {
    if (!token) return;

    try {
      const res = await fetch(`/api/cart/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to eliminate cart entry.");
      }

      await loadCartItemsList(token);
    } catch (err: any) {
      alert(err.message || "Failed to remove item.");
      throw err;
    }
  };

  const handleClearCart = async () => {
    if (!token) return;

    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to empty cart.");
      }

      await loadCartItemsList(token);
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  // Product Admin Actions (Create / Update / Delete)
  const handleProductSaveCompleted = async (saved: Product) => {
    setShowProductForm(false);
    setEditingProduct(null);
    await loadProductListing();
  };

  const handleProductDeleteCompleted = async (productId: string) => {
    if (!token) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete product details.");
      }

      await loadProductListing();
      // If user holds cart items, refresh cart in case deleted item was registered
      await loadCartItemsList(token);
    } catch (err: any) {
      alert(err.message || "Failed to delete product.");
    }
  };

  // Live search filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  // Cart total Badge
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col text-gray-800">
      {/* Dynamic Navbar */}
      <Navbar
        currentUser={currentUser}
        cartCount={totalCartCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Container Views */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {/* USER NOT SIGNED IN YET & TRIGGERS LOGIN OVERLAY */}
          {isAuthOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            >
              <AuthPage
                onAuthSuccess={handleAuthSuccess}
                onCancel={() => setIsAuthOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACTIVE TAB ROUTING DISPLAY */}
        <div className="py-6">
          {activeTab === "products" && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Product Header Hero panel */}
              <div className="bg-linear-to-r from-indigo-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white mb-10 relative overflow-hidden shadow-md">
                <div className="relative z-10 max-w-xl">
                  <h1 className="text-3xl sm:text-4xl font-black font-sans tracking-tight mb-6">
                    The University Campus Catalog Deals
                  </h1>
                  
                  {currentUser?.role === "ADMIN" && (
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setShowProductForm(true);
                      }}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Admin: Add Product</span>
                    </button>
                  )}
                </div>

                <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10 hidden sm:block">
                  <ShoppingCart className="w-96 h-96" />
                </div>
              </div>

              {/* SEARCH & FILTERS CONTROLS ROW */}
              <div className="bg-white border border-gray-150 p-4 rounded-2xl shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Real-time search bar input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search product names, details, descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 focus:outline-hidden focus:border-indigo-500 rounded-xl"
                  />
                </div>

                {/* Category selectors */}
                <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0 shrink-0">
                  <div className="flex items-center gap-1.5 text-gray-500 font-sans text-xs font-semibold mr-1">
                    <SlidersHorizontal className="h-4 w-4 inline text-gray-400" />
                    <span>Filter Group:</span>
                  </div>

                  <div className="flex items-center gap-1 bg-gray-50/50 p-1 border border-gray-100 rounded-lg">
                    {uniqueCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setCategoryFilter(category)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                          categoryFilter === category
                            ? "bg-white text-indigo-600 shadow-xs font-bold"
                            : "text-gray-600 hover:text-gray-950"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ERROR BLOCK BANNER */}
              {globalError && (
                <div className="mb-8 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-2xl border border-red-100 flex items-center justify-between">
                  <span>{globalError}</span>
                  <button
                    onClick={loadProductListing}
                    className="px-3.5 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-lg hover:bg-red-200"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* PRODUCTS CATALOG GRID CONTENT */}
              {loadingProducts ? (
                <div className="text-center py-20">
                  <div className="animate-spin inline-block w-9 h-9 border-[3px] border-indigo-600 border-t-transparent rounded-full mb-4"></div>
                  <p className="text-xs text-gray-550 font-mono">Loading product catalog telemetry...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-250 max-w-sm mx-auto mt-6">
                  <Info className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-sans font-bold text-gray-900 mb-1">No products match search criteria</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Try modifying your search query keyword or selecting a different category filter above.
                  </p>
                </div>
              ) : (
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isAdminUser={currentUser?.role === "ADMIN" || false}
                        onAddToCart={handleAddToCart}
                        onEdit={(prod) => {
                          setEditingProduct(prod);
                          setShowProductForm(true);
                        }}
                        onDelete={handleProductDeleteCompleted}
                        isAuthenticated={!!currentUser}
                        onTriggerLogin={() => setActiveTab("auth")}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === "cart" && (
            <CartList
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveCartItem}
              onClearCart={handleClearCart}
              onCheckout={async () => {
                // Checkout completed -> reload storefront stocks which may have been decremented
                await loadProductListing();
              }}
              onBrowseProducts={() => setActiveTab("products")}
            />
          )}

          {activeTab === "admin" && currentUser?.role === "ADMIN" && (
            <AdminDashboard token={token || ""} />
          )}

          {activeTab === "profile" && (
            <UserProfile
              currentUser={currentUser}
              token={token}
              onProfileUpdate={(updatedUser, newToken) => {
                setCurrentUser(updatedUser);
                setToken(newToken);
                localStorage.setItem("unicart_token", newToken);
                localStorage.setItem("unicart_user", JSON.stringify(updatedUser));
              }}
            />
          )}

          {activeTab === "auth" && (
            <div className="py-2 max-w-lg mx-auto">
              <AuthPage
                onAuthSuccess={handleAuthSuccess}
                onCancel={() => setActiveTab("products")}
              />
            </div>
          )}
        </div>
      </main>

      {/* ADMIN EDIT/CREATE OVERLAY FORM DIALOG */}
      <AnimatePresence>
        {showProductForm && (
          <ProductAdminForm
            product={editingProduct}
            token={token || ""}
            onSave={handleProductSaveCompleted}
            onClose={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* FOOTER BAR BRAND */}
      <footer className="bg-white border-t border-gray-100 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-1 text-gray-400 text-xs font-mono">
            <span>&copy; {new Date().getFullYear()} Unicard. Realized as a Single-Page fullstack sandbox.</span>
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-[10px] px-2.5 py-1 bg-gray-50 border border-gray-150 rounded-full font-mono text-gray-500">
              PRISMA + SQLITE
            </span>
            <span className="text-[10px] px-2.5 py-1 bg-gray-50 border border-gray-150 rounded-full font-mono text-gray-500">
              REACT + MOTION
            </span>
            <span className="text-[10px] px-2.5 py-1 bg-gray-50 border border-gray-150 rounded-full font-mono text-gray-500">
              JWT + ROLE-ACCESS
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
