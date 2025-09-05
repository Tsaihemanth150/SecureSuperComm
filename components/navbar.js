// components/NavBar.js
"use client";
import React, { useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NavBar = ({ user, setUser }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { setTheme } = useTheme();
  const isLoggedIn = !!user?.value;

  const handleLogout = () => {
    Cookies.remove("Token");
    setUser({ value: null });
  };

  return (
    <nav className="bg-gray-900 text-gray-100 shadow-lg border-b border-gray-800 relative z-50">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
            SecureSuperComm
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {!isLoggedIn && (
            <Link href="/" className="hover:text-purple-400 transition duration-300">
              Home
            </Link>
          )}
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="hover:text-purple-400 transition duration-300">
                Dashboard
              </Link>
              <Link href="/profile" className="hover:text-purple-400 transition duration-300">
                Profile
              </Link>
              <button onClick={handleLogout} className="text-red-500 hover:text-red-400 transition">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-purple-400 transition duration-300">
                Login
              </Link>
              <Link href="/signup" className="hover:text-purple-400 transition duration-300">
                Sign Up
              </Link>
            </>
          )}

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="border-gray-700">
                <Sun className="h-5 w-5 scale-100 dark:scale-0 transition-all" />
                <Moon className="absolute h-5 w-5 scale-0 dark:scale-100 transition-all" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 text-gray-100">
              <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900 text-gray-100 px-4 pb-4">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="block py-2 hover:text-purple-400 transition">Dashboard</Link>
              <Link href="/profile" className="block py-2 hover:text-purple-400 transition">Profile</Link>
              <button onClick={handleLogout} className="block py-2 text-red-500 hover:text-red-400 transition">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2 hover:text-purple-400 transition">Login</Link>
              <Link href="/signup" className="block py-2 hover:text-purple-400 transition">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
