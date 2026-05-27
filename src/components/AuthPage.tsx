import React, { useState } from "react";
import { KeyRound, Mail, UserPlus, LogIn, User as UserIcon, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types";

interface AuthPageProps {
  onAuthSuccess: (token: string, user: User) => void;
  onCancel?: () => void;
}

export default function AuthPage({ onAuthSuccess, onCancel }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = isLogin 
      ? { email, password } 
      : { email, password, name, role };

    const url = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${isLogin ? "login" : "register"}.`);
      }

      // Restore session and trigger successes
      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-8"
      >
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            {isLogin ? <LogIn className="h-8 w-8" /> : <UserPlus className="h-8 w-8" />}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900 tracking-tight mb-2">
          {isLogin ? "Welcome Back" : "Create Your Account"}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          {isLogin 
            ? "Sign in to access your custom shopping cart" 
            : "Register to explore products, buy, and access features"
          }
        </p>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mb-5 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-100"
              id="auth-error-block"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-indigo-500 text-sm font-sans placeholder-gray-400 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                required
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-indigo-500 text-sm font-sans placeholder-gray-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-indigo-500 text-sm font-sans placeholder-gray-400 transition-colors"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5">
                Assign Testing Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("USER")}
                  className={`py-2 rounded-xl border text-xs font-medium transition-colors ${
                    role === "USER"
                      ? "bg-amber-50 border-amber-500 text-amber-900 font-semibold"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 animate-xs"
                  }`}
                >
                  Student (USER)
                </button>
                <button
                  type="button"
                  onClick={() => setRole("ADMIN")}
                  className={`py-2 rounded-xl border text-xs font-medium transition-colors ${
                    role === "ADMIN"
                      ? "bg-amber-50 border-amber-500 text-amber-900 font-semibold"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 animate-xs"
                  }`}
                >
                  Instructor (ADMIN)
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-gray-400 flex items-start gap-1">
                <HelpCircle className="h-3 w-3 inline text-indigo-400 mt-0.5 shrink-0" />
                <span>Quick Role Assignment: allows direct simulation of both student-level shop triggers and administrative CRUD operations.</span>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-xs hover:shadow-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing transaction..." : isLogin ? "Sign In Securely" : "Complete Registration"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            {isLogin 
              ? "No account yet? Create one here" 
              : "Already have credentials? Log in instead"
            }
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              Back to Storefront
            </button>
          )}
        </div>

        {/* Diagnostic instructions */}
        <div className="mt-6 p-3 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-500 font-mono">
          <div className="font-bold text-gray-700 mb-1">🎓 Preset Sandbox Credentials:</div>
          <div>Admin: <span className="text-gray-900 font-semibold">admin@university.edu</span> / <span className="text-gray-900">admin123</span></div>
          <div>Student: <span className="text-gray-900 font-semibold">user@university.edu</span> / <span className="text-gray-900">user123</span></div>
        </div>
      </motion.div>
    </div>
  );
}
