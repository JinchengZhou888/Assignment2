import { useState } from "react";
import { Edit3, Trash2, ShoppingCart, Check, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { Product } from "../types";

interface ProductCardProps {
  key?: string;
  product: Product;
  isAdminUser: boolean;
  onAddToCart: (product: Product, qty: number) => Promise<void>;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => Promise<void>;
  isAuthenticated: boolean;
  onTriggerLogin: () => void;
}

export default function ProductCard({
  product,
  isAdminUser,
  onAddToCart,
  onEdit,
  onDelete,
  isAuthenticated,
  onTriggerLogin,
}: ProductCardProps) {
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = async () => {
    if (!isAuthenticated) {
      onTriggerLogin();
      return;
    }

    setAdding(true);
    try {
      await onAddToCart(product, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      setDeleting(true);
      try {
        await onDelete(product.id);
      } catch (err) {
        console.error(err);
      } finally {
        setDeleting(false);
      }
    }
  };

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-xl border border-gray-150 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col h-full group"
    >
      {/* Product Image */}
      <div className="relative aspect-4/3 overflow-hidden bg-gray-50">
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const fallback = `https://picsum.photos/seed/${encodeURIComponent(product.name)}/500/375`;
            if (target.src !== fallback) {
              target.src = fallback;
            }
          }}
        />
        <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase rounded-full bg-black/70 text-white font-mono">
          {product.category}
        </span>

        {/* Stock Alerts inside Image */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-xs">
            <span className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white font-sans text-xs font-bold uppercase tracking-wider shadow-sm">
              Sold Out
            </span>
          </div>
        )}

        {isLowStock && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-amber-500 text-amber-950 font-semibold font-mono text-[10px] flex items-center gap-1 shadow-sm">
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>Only {product.stock} left</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-sans font-bold text-gray-900 group-hover:text-indigo-600 transition-colors text-base line-clamp-1">
          {product.name}
        </h3>
        <p className="mt-1.5 text-xs text-gray-500 font-sans line-clamp-2 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Price & Stock Stats row */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">
              Price Details
            </span>
            <span className="text-xl font-bold text-gray-900 font-sans">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">
              Availability
            </span>
            <span className={`text-xs font-semibold ${product.stock > 5 ? "text-emerald-600" : isLowStock ? "text-amber-600" : "text-red-500"}`}>
              {product.stock > 0 ? `${product.stock} Units Available` : "Unavailable"}
            </span>
          </div>
        </div>

        {/* Buyer Actions */}
        <div className="mt-5 space-y-2">
          {!isAdminUser ? (
            <div className="flex items-center gap-2">
              <select
                disabled={isOutOfStock}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="px-2.5 py-2 border border-gray-200 focus:outline-hidden focus:border-indigo-500 text-xs font-semibold rounded-lg bg-gray-50 disabled:opacity-50"
              >
                {Array.from({ length: Math.max(1, Math.min(10, product.stock)) }, (_, i) => i + 1).map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>

              <button
                disabled={isOutOfStock || adding}
                onClick={handleAdd}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 border border-transparent text-xs font-bold rounded-lg text-white transition-all cursor-pointer ${
                  added
                    ? "bg-emerald-600 text-white"
                    : isOutOfStock
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-xs hover:shadow-sm"
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Added!</span>
                  </>
                ) : adding ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    <span>{isAuthenticated ? "Add to Cart" : "Sign In & Buy"}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Admin Actions */
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onEdit(product)}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-blue-200 hover:border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Info</span>
              </button>

              <button
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-red-200 hover:border-red-300 bg-red-50/50 hover:bg-red-50 text-red-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{deleting ? "Deleting..." : "Delete"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
