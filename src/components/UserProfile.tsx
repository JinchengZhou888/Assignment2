import React, { useState, useEffect } from "react";
import { User as UserIcon, Shield, Mail, KeyRound, Save, Edit2, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types";

interface UserProfileProps {
  currentUser: User | null;
  token: string | null;
  onProfileUpdate: (updatedUser: User, newToken: string) => void;
}

interface ProfileDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export default function UserProfile({ currentUser, token, onProfileUpdate }: UserProfileProps) {
  // Fresh profile details loaded from DB
  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Edit Mode state
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Load latest details on render
  const fetchUserProfile = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load user profile.");
      }
      setProfile(data);
      setNewName(data.name || "");
    } catch (err: any) {
      setError(err.message || "An error occurred fetching profile info.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [token]);

  // Handle Name Updates
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newName.trim()) return;

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile name.");
      }

      setProfile(prev => prev ? { ...prev, name: data.user.name } : null);
      onProfileUpdate(data.user, data.token);
      setSuccess("Your display name has been updated successfully!");
      setIsEditingName(false);
    } catch (err: any) {
      setError(err.message || "Error modifying name.");
    }
  };

  // Handle Password Updates
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill out all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password.");
      }

      setSuccess("Your account password has been changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Could not change the password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!currentUser || !token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold font-sans text-gray-900 mb-2">Access Restrained</h2>
        <p className="text-sm text-gray-500 mb-6">
          You must be signed in to view your user profile workspace page and customize account items.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black font-sans tracking-tight text-gray-900 flex items-center gap-2">
          <UserIcon className="h-7 w-7 text-indigo-600" />
          <span>My User Profile</span>
        </h1>
        <p className="text-sm text-gray-500">
          Inspect your academic assignment session data, modify display parameters, or reset secret login credentials.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="profile-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 text-center"
          >
            <div className="animate-spin inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full mb-2"></div>
            <p className="text-xs text-gray-500 font-mono">Loading user profile context...</p>
          </motion.div>
        ) : (
          <motion.div
            key="profile-pane"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Feedback Notifications */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm flex items-start gap-3 shadow-xs">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <span className="font-sans font-medium">{error}</span>
              </div>
            )}
            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-sm flex items-start gap-3 shadow-xs">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-sans font-medium">{success}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Card Summary Panel */}
              <div className="md:col-span-1 bg-white border border-gray-150 rounded-2xl p-6 shadow-xs flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-linear-to-tr from-indigo-500 to-indigo-700 text-white rounded-full flex items-center justify-center font-bold text-3xl font-sans mb-4 shadow-sm">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : "?"}
                </div>
                <h3 className="text-base font-bold text-gray-900 font-sans tracking-tight leading-tight">
                  {profile?.name}
                </h3>
                <span className={`inline-flex items-center gap-1 mt-2.5 px-3 py-1 rounded-full text-xs font-mono font-semibold ${
                  profile?.role === "ADMIN" 
                    ? "bg-amber-100 text-amber-900 border border-amber-200" 
                    : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                }`}>
                  <Shield className="h-3 w-3" />
                  <span>{profile?.role === "ADMIN" ? "Administrator" : "Student Client"}</span>
                </span>

                <div className="w-full border-t border-gray-100 my-5 pt-4 text-left space-y-3 font-sans">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{profile?.email}</span>
                  </div>
                  {profile?.createdAt && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span>Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Editing and settings forms Pane */}
              <div className="md:col-span-2 space-y-6">
                {/* 1. Modify Personal Information card */}
                <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-xs">
                  <h2 className="text-base font-bold text-gray-900 font-sans tracking-tight mb-4 flex items-center gap-2">
                    <Edit2 className="h-4.5 w-4.5 text-indigo-600" />
                    <span>Personal Details</span>
                  </h2>

                  {isEditingName ? (
                    <form onSubmit={handleUpdateName} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase font-mono tracking-wider mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                          placeholder="Alter your display name"
                          required
                          maxLength={35}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingName(false);
                            setNewName(profile?.name || "");
                          }}
                          className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                        >
                          <Save className="h-3.5 w-3.5" />
                          <span>Save Display Name</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-gray-50/55 rounded-xl border border-gray-100">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider font-mono text-gray-400">
                          Active Full Name
                        </span>
                        <span className="text-sm font-semibold text-gray-800">{profile?.name}</span>
                      </div>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 hover:border-indigo-300 text-gray-700 hover:text-indigo-600 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit Name</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Change Security Credentials card */}
                <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-xs">
                  <h2 className="text-base font-bold text-gray-900 font-sans tracking-tight mb-4 flex items-center gap-2">
                    <KeyRound className="h-4.5 w-4.5 text-indigo-600" />
                    <span>Security & Credentials</span>
                  </h2>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase font-mono tracking-wider mb-2">
                        Current Account Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase font-mono tracking-wider mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                          placeholder="Min 6 characters"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase font-mono tracking-wider mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                          placeholder="Retype password"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        {passwordLoading ? (
                          <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                          <KeyRound className="h-3.5 w-3.5" />
                        )}
                        <span>Update Password</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
