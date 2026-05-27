import { useState } from "react";
import { Plus, Minus, Trash2, ShoppingBag, CreditCard, Sparkles, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CartItem } from "../types";

interface CartListProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => Promise<void>;
  onRemoveItem: (productId: string) => Promise<void>;
  onClearCart: () => Promise<void>;
  onCheckout: () => void;
  onBrowseProducts: () => void;
}

export default function CartList({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onBrowseProducts,
}: CartListProps) {
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const handleQtyChange = async (productId: string, currentQty: number, change: number, stock: number) => {
    const target = currentQty + change;
    if (target <= 0) {
      await handleRemove(productId);
      return;
    }

    if (target > stock) {
      alert(`Cannot add more. Only ${stock} items are in stock.`);
      return;
    }

    setLoadingIds((prev) => [...prev, productId]);
    try {
      await onUpdateQuantity(productId, target);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleRemove = async (productId: string) => {
    setLoadingIds((prev) => [...prev, productId]);
    try {
      await onRemoveItem(productId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handlesClearAll = async () => {
    if (confirm("Are you sure you want to empty your entire shopping cart?")) {
      await onClearCart();
    }
  };

  const executeCheckout = async () => {
    setCheckingOut(true);
    // Mimic API delay
    setTimeout(async () => {
      try {
        await onClearCart();
        setCheckingOut(false);
        setCheckoutSuccess(true);
        onCheckout(); // Tells App to refresh catalog stocks since order would be processed
      } catch (err) {
        console.error(err);
        setCheckingOut(false);
      }
    }, 1500);
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.quantity * item.product.price, 0);

  if (checkoutSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto my-12 bg-white rounded-2xl border border-emerald-150 p-8 text-center shadow-lg"
      >
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="h-8 w-8 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
          Assignment Simulated Checkout Complete!
        </h2>
        <p className="text-gray-550 text-sm max-w-md mx-auto mb-8">
          The order has been securely processed. In a real-world system, this triggers payment captures, inventory state updates, and fulfillment notifications.
        </p>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <button
            onClick={() => setCheckoutSuccess(false)}
            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
          >
            Review Cart Views
          </button>
          <button
            onClick={onBrowseProducts}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </motion.div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-950 mb-1">Your cart is currently empty</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          It looks like you haven't added any products to your cart yet. Explore our student deals!
        </p>
        <button
          onClick={onBrowseProducts}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          View Store Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-950 font-sans">
            Your Shopping Cart
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            You have <span className="font-semibold text-indigo-600">{cartItems.length} items</span> in your cart.
          </p>
        </div>

        <button
          onClick={handlesClearAll}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-red-100 hover:bg-red-50 text-red-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          <span>Empty Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {cartItems.map((item) => {
              const itemLoading = loadingIds.includes(item.product.id);
              const subtotal = item.quantity * item.product.price;

              return (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 bg-white rounded-2xl border border-gray-150 flex flex-col sm:flex-row items-center gap-4 hover:shadow-xs transition-shadow"
                >
                  {/* Thumb image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const fallback = `https://picsum.photos/seed/${encodeURIComponent(item.product.name)}/100/100`;
                        if (target.src !== fallback) {
                          target.src = fallback;
                        }
                      }}
                    />
                  </div>

                  {/* Title & category */}
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 font-mono">
                      {item.product.category}
                    </span>
                    <h3 className="font-sans font-bold text-sm text-gray-900 truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-indigo-600 font-medium mt-0.5 font-mono">
                      ${item.product.price.toFixed(2)} each
                    </p>
                  </div>

                  {/* Quantity adjustment */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50/50">
                      <button
                        disabled={itemLoading}
                        onClick={() => handleQtyChange(item.product.id, item.quantity, -1, item.product.stock)}
                        className="p-1 px-2 hover:bg-gray-100 text-gray-550 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>

                      <span className="px-3 py-1 text-xs font-semibold text-gray-800 font-mono min-w-[24px] text-center">
                        {item.quantity}
                      </span>

                      <button
                        disabled={itemLoading}
                        onClick={() => handleQtyChange(item.product.id, item.quantity, 1, item.product.stock)}
                        className="p-1 px-2 hover:bg-gray-100 text-gray-550 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      disabled={itemLoading}
                      onClick={() => handleRemove(item.product.id)}
                      className="p-1.5 text-gray-450 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Item Subtotal cost */}
                  <div className="text-right sm:min-w-[100px] shrink-0">
                    <span className="text-xs text-gray-400 font-medium block uppercase tracking-wide font-mono">
                      Subtotal
                    </span>
                    <span className="font-sans font-bold text-sm text-gray-900">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Totals Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs sticky top-24">
            <h3 className="font-sans font-bold text-gray-950 text-base mb-4 pb-4 border-b border-gray-100">
              Order Summary
            </h3>

            <div className="space-y-3.5 mb-5 pb-5 border-b border-gray-100">
              <div className="flex justify-between items-center text-xs text-gray-500 font-sans">
                <span>Cart Subtotal</span>
                <span className="font-mono text-gray-900 font-semibold">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 font-sans">
                <span>Student Discount (0%)</span>
                <span className="font-mono text-emerald-600 font-semibold">-$0.00</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 font-sans">
                <span>Shipping &amp; Processing</span>
                <span className="font-mono text-emerald-600 font-semibold">FREE</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold text-gray-900 font-sans uppercase">Est. Total Cost</span>
              <span className="text-2xl font-black text-indigo-700 font-mono">
                ${cartTotal.toFixed(2)}
              </span>
            </div>

            <div className="space-y-3">
              <button
                disabled={checkingOut}
                onClick={executeCheckout}
                className="w-full py-3 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md cursor-pointer transition-all disabled:opacity-75"
              >
                {checkingOut ? (
                  <>
                    <RefreshCcw className="h-4 w-4 animate-spin" />
                    <span>Authorizing Transaction...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>Simulate University Checkout</span>
                  </>
                )}
              </button>

              <button
                onClick={onBrowseProducts}
                className="w-full py-2.5 text-center text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:bg-indigo-50/50 rounded-xl cursor-pointer transition-colors"
              >
                Back to Shopping
              </button>
            </div>

            {/* Diagnostic sandbox alert info */}
            <div className="mt-5 p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-500 leading-relaxed font-sans">
              <span className="font-bold text-gray-700">Sandbox Environment notice:</span> Emitting simulated orders automatically flushes backend database user cart lists while restoring local catalog inventories dynamically to support fluid evaluation loop.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
