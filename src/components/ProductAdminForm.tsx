import React, { useState, useEffect } from "react";
import { Folder, Percent, Layers, PlusCircle, Save, X } from "lucide-react";
import { motion } from "motion/react";
import { Product } from "../types";

interface ProductAdminProps {
  product: Product | null; // Null means create mode
  token: string;
  onSave: (savedProduct: Product) => void;
  onClose: () => void;
}

export default function ProductAdminForm({
  product,
  token,
  onSave,
  onClose,
}: ProductAdminProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [stock, setStock] = useState("10");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-populate fields on editing mode
  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price.toString());
      setImageUrl(product.imageUrl);
      setCategory(product.category);
      setStock(product.stock.toString());
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      setCategory("Electronics");
      setStock("10");
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock);

    // Frontend checks
    if (!name.trim()) return setError("Product name is required.");
    if (!description.trim()) return setError("Product description is required.");
    if (isNaN(priceNum) || priceNum < 0) return setError("Product price must be a valid positive number.");
    if (isNaN(stockNum) || stockNum < 0) return setError("Product stock must be a valid non-negative integer.");

    setLoading(true);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: priceNum,
      imageUrl: imageUrl.trim() || undefined,
      category: category.trim(),
      stock: stockNum,
    };

    const url = product ? `/api/products/${product.id}` : "/api/products";
    const method = product ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to finalize product transaction.");
      }

      onSave(data);
    } catch (err: any) {
      setError(err.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Electronics",
    "Office",
    "Fitness & Outdoor",
    "Apparel",
    "Home & Living",
    "Other",
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
      >
        {/* Header bar */}
        <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
          <h3 className="font-sans font-bold text-gray-900 text-lg flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-indigo-650" />
            <span>{product ? "Edit Product Details" : "Publish New Product"}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 px-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5_">
              Product Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ergonomic Bluetooth Mouse"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-250 focus:outline-hidden focus:border-indigo-500 text-sm font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5_">
              Description Text
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide a detailed overview of product details, specifications, features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-250 focus:outline-hidden focus:border-indigo-500 text-sm font-sans"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5_">
                Price (USD $)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="29.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-250 focus:outline-hidden focus:border-indigo-500 text-sm font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5_">
                Stock Quantity
              </label>
              <input
                type="number"
                required
                placeholder="20"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-250 focus:outline-hidden focus:border-indigo-500 text-sm font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5_">
                Category Group
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-250 focus:outline-hidden focus:border-indigo-500 text-sm font-sans bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5_">
                Image Link (URL)
              </label>
              <input
                type="url"
                placeholder="https://unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-250 focus:outline-hidden focus:border-indigo-500 text-sm font-sans"
              />
            </div>
          </div>

          {/* Quick link generator help helper */}
          <div>
            <p className="text-[11px] text-gray-500 font-sans leading-relaxed">
              <span className="font-semibold text-gray-700">Tip:</span> If you leave the image URL blank, a default product image placeholder will be fallback automatically.
            </p>
          </div>

          {/* Bottom actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 hover:bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? "Saving data..." : product ? "Update Catalog" : "Add to Shop"}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
