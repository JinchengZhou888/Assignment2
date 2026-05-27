import { useState, useEffect } from "react";
import { Users, ShoppingBag, Shield, Clock, Search, ChevronDown, ChevronUp, DollarSign, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserDashboardData } from "../types";

interface AdminDashboardProps {
  token: string;
}

export default function AdminDashboard({ token }: AdminDashboardProps) {
  const [usersData, setUsersData] = useState<UserDashboardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUserIds, setExpandedUserIds] = useState<string[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to retrieve user logs.");
      }

      setUsersData(data);
    } catch (err: any) {
      setError(err.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const toggleUserExpanded = (userId: string) => {
    setExpandedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const filteredUsers = usersData.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute stats indicators
  const totalUsersCount = usersData.length;
  const adminUsersCount = usersData.filter((u) => u.role === "ADMIN").length;
  const activeCartsCount = usersData.filter((u) => u.cartItems.length > 0).length;
  const totalItemsInCarts = usersData.reduce(
    (acc, u) => acc + u.cartItems.reduce((sum, item) => sum + item.quantity, 0),
    0
  );
  const totalValueOfCarts = usersData.reduce(
    (acc, u) =>
      acc +
      u.cartItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-950 font-sans">
            Administrative Management Center
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Overview of university users and aggregate real-time shopping cart states.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="mt-3 sm:mt-0 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          Force Reload Logs
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin inline-block w-8 h-8 border-[3px] border-indigo-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-sm text-gray-550 font-mono">Synchronizing telemetry logs...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-2xl border border-red-100 text-center max-w-lg mx-auto">
          {error}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Dashboard Stats Panel */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 bg-white border border-gray-150 rounded-2xl shadow-xs">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
                  Total Users
                </span>
              </div>
              <div className="text-2xl font-extrabold text-gray-950 font-sans">
                {totalUsersCount}
              </div>
            </div>

            <div className="p-5 bg-white border border-gray-150 rounded-2xl shadow-xs">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Shield className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono font-semibold text-amber-800">
                  Admins
                </span>
              </div>
              <div className="text-2xl font-extrabold text-gray-950 font-sans">
                {adminUsersCount}
              </div>
            </div>

            <div className="p-5 bg-white border border-gray-150 rounded-2xl shadow-xs">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
                  Active Carts
                </span>
              </div>
              <div className="text-2xl font-extrabold text-gray-950 font-sans">
                {activeCartsCount}
              </div>
            </div>

            <div className="p-5 bg-white border border-gray-150 rounded-2xl shadow-xs">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Layers className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
                  Total Items
                </span>
              </div>
              <div className="text-2xl font-extrabold text-gray-950 font-sans">
                {totalItemsInCarts}
              </div>
            </div>

            <div className="p-5 bg-white border border-gray-150 rounded-2xl shadow-xs col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <DollarSign className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
                  Cart Volume
                </span>
              </div>
              <div className="text-2xl font-extrabold text-indigo-700 font-mono">
                ${totalValueOfCarts.toFixed(2)}
              </div>
            </div>
          </div>

          {/* User List & Cart Viewer */}
          <div className="bg-white rounded-2xl border border-gray-155 shadow-xs overflow-hidden">
            {/* Table Control Header */}
            <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-sans font-bold text-gray-900 text-base">
                User Registry &amp; Passive Carts
              </h3>

              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Query user name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs border border-gray-250 focus:outline-hidden focus:border-indigo-500 rounded-xl font-sans"
                />
              </div>
            </div>

            {/* Main table content */}
            {filteredUsers.length === 0 ? (
              <div className="text-center py-10 text-gray-400 font-serif">
                No verified users match your filter criteria.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const isExpanded = expandedUserIds.includes(user.id);
                  const itemsInCurrentCartObj = user.cartItems;
                  const aggregateUserSpent = itemsInCurrentCartObj.reduce(
                    (total, item) => total + item.quantity * item.product.price,
                    0
                  );

                  return (
                    <div key={user.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                      <div
                        onClick={() => toggleUserExpanded(user.id)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                      >
                        {/* User Identity Column */}
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 p-2 rounded-lg ${user.role === "ADMIN" ? "bg-amber-100 text-amber-800" : "bg-indigo-50 text-indigo-700"}`}>
                            <Users className="h-4.5 w-4.5" />
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-sans font-bold text-gray-900 text-sm">
                                {user.name}
                              </span>
                              <span
                                className={`px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider rounded-md uppercase ${
                                  user.role === "ADMIN"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {user.role}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400 block font-mono">
                              {user.email}
                            </span>
                          </div>
                        </div>

                        {/* Joined Timestamp Column */}
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3.5 w-3.5 inline text-indigo-400" />
                          <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Cart stats column */}
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <span className="text-[10px] text-gray-400 font-mono font-bold uppercase block tracking-wider">
                              Cart Allocation
                            </span>
                            <span className="text-xs text-gray-700 font-semibold">
                              {itemsInCurrentCartObj.length > 0
                                ? `${itemsInCurrentCartObj.length} lines (${itemsInCurrentCartObj.reduce(
                                    (sum, i) => sum + i.quantity,
                                    0
                                  )} items)`
                                : "Empty Cart"}
                            </span>
                          </div>

                          <div className="text-right min-w-[80px]">
                            <span className="text-[10px] text-gray-400 font-mono font-bold uppercase block tracking-wider">
                              Cart Total
                            </span>
                            <span className="text-sm font-bold text-gray-900 font-mono">
                              ${aggregateUserSpent.toFixed(2)}
                            </span>
                          </div>

                          <div>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded active shopping cart details drawer */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-5 pb-2 pl-4 md:pl-10 border-l-[3px] border-indigo-200">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 font-mono">
                                Shopping Cart Active Logs
                              </h4>

                              {itemsInCurrentCartObj.length === 0 ? (
                                <p className="text-xs text-gray-400 italic">
                                  There are no current items loaded in this user's shopping cart.
                                </p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-150">
                                    <thead>
                                      <tr className="border-b border-gray-100 text-left text-[10px] uppercase font-mono font-bold tracking-wider text-gray-400">
                                        <th className="py-2">Item Name</th>
                                        <th className="py-2">Category</th>
                                        <th className="py-2 text-right">Unit Price</th>
                                        <th className="py-2 text-center">Qty</th>
                                        <th className="py-2 text-right">Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {itemsInCurrentCartObj.map((item) => (
                                        <tr key={item.id} className="text-xs text-gray-600">
                                          <td className="py-2 font-medium text-gray-900">{item.product.name}</td>
                                          <td className="py-2">{item.product.category}</td>
                                          <td className="py-2 text-right font-mono">${item.product.price.toFixed(2)}</td>
                                          <td className="py-2 text-center font-mono font-semibold">{item.quantity}</td>
                                          <td className="py-2 text-right font-mono font-bold text-indigo-700">
                                            ${(item.quantity * item.product.price).toFixed(2)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
