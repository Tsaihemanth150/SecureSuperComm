// components/Footer.js
import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-100 border-t border-gray-800">
      <div className="max-w-screen-xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-10">
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            SecureSuperComm
          </h3>
          <p className="mt-2 text-gray-400">
            Learn, share, and grow in technology with AI-powered insights and community support.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-300 mb-4">Resources</h4>
          <ul className="space-y-2">
            <li><Link href="#" className="hover:text-purple-400 transition">Blog</Link></li>
            <li><Link href="#" className="hover:text-purple-400 transition">Docs</Link></li>
            <li><Link href="#" className="hover:text-purple-400 transition">Courses</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-300 mb-4">Legal & Social</h4>
          <ul className="space-y-2">
            <li><Link href="#" className="hover:text-purple-400 transition">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-purple-400 transition">Terms & Conditions</Link></li>
            <li><Link href="#" className="hover:text-purple-400 transition">GitHub</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-6 pt-6 text-center text-gray-500 text-sm">
        © 2025 SecureSuperComm. All Rights Reserved.
      </div>
    </footer>
  );
}
