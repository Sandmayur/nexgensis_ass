"use client";

import { useAuth } from "../context/AuthContext";
import { LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading || !user || pathname === "/login") {
    return null; // Don't show navbar on login page or while loading
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/products" className="flex-shrink-0 flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl text-gray-900 hidden sm:block">Admin Dash</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user.image ? (
                <img src={user.image} alt={user.username} className="w-8 h-8 rounded-full border border-gray-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  {user.firstName?.charAt(0) || user.username?.charAt(0)}
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user.firstName} {user.lastName}
              </span>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
