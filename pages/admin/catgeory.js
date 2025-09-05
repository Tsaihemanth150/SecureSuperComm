import React, { useEffect, useState } from "react";
import {
  FiBook,
  FiBriefcase,
  FiUserCheck,
  FiShield,
} from "react-icons/fi";
import Cookies from "js-cookie";
import { motion } from "framer-motion";

// Restrict icons to courses, recruitment/jobs, and government-related ones
const ICONS = {
  courses: FiBook,
  jobs: FiBriefcase,
  recruitment: FiUserCheck,
  government: FiShield,
};

export default function CategoryCards() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = Cookies.get("Token");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/admin/catgeory", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [token]);

  if (loading)
    return <p className="text-center text-indigo-600 animate-pulse">Loading categories...</p>;
  if (error)
    return <p className="text-center text-red-500 font-medium">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-200 pb-2">
        Categories
      </h2>
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat, index) => {
          const Icon = ICONS[cat.iconKey] || FiShield; // default fallback: government icon
          return (
            <motion.div
              key={cat._id || index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="group rounded-2xl p-6 bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center group-hover:from-indigo-200 group-hover:to-indigo-300 transition-colors">
                  <Icon className="w-7 h-7 text-indigo-700" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800 group-hover:text-indigo-700">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="mt-1 text-sm text-gray-500 group-hover:text-gray-700">
                      {cat.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}