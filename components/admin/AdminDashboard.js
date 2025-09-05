"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiHome,
  FiUsers,
  FiGrid,
  FiSettings,
  FiLogOut,
  FiMenu,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const navItems = [
  { name: "Dashboard", icon: FiHome, href: "/admin" },
  { name: "Users", icon: FiUsers, href: "/admin/users" },
  { name: "Categories", icon: FiGrid, href: "/admin/categories" },
  { name: "Settings", icon: FiSettings, href: "/admin/settings" },
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -260 }}
        animate={{ x: sidebarOpen ? 0 : -260 }}
        transition={{ type: "spring", stiffness: 80 }}
        className="fixed z-40 h-full w-64 bg-white shadow-lg flex flex-col"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="text-xl font-bold text-indigo-600">Admin</h2>
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            ✖
          </Button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </a>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full flex items-center gap-2">
            <FiLogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-white shadow px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Users", value: "1,245" },
              { title: "Categories", value: "23" },
              { title: "Revenue", value: "₹1.2M" },
              { title: "Active Jobs", value: "12" },
            ].map((stat, i) => (
              <Card
                key={i}
                className="rounded-2xl shadow hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <h2 className="text-2xl font-bold text-indigo-600">
                    {stat.value}
                  </h2>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Example Section */}
          <Card className="rounded-2xl shadow">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>✔ User <span className="font-medium">Ravi</span> registered</li>
                <li>✔ Category <span className="font-medium">UPSC</span> created</li>
                <li>✔ Admin approved a new job post</li>
              </ul>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
