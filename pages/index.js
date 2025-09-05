// app/page.js
"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  Brain,
  FileText,
  Trophy,
  Briefcase,
  ShieldCheck,
  Globe,
  Sparkles,
  Star,
} from "lucide-react";

export default function Home() {
  return (
    <main className="relative flex flex-col items-center min-h-screen bg-black text-gray-100 overflow-hidden">
      
      {/* Animated Stars Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(80,0,120,0.2),transparent)]"></div>
        <div className="w-[300%] h-[300%] bg-[radial-gradient(circle,rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:20px_20px] animate-pulse opacity-40"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-6xl px-6 py-28 text-center">
        <motion.h1
          className="text-6xl md:text-8xl font-extrabold bg-gradient-to-r from-fuchsia-500 via-indigo-400 to-cyan-300 text-transparent bg-clip-text drop-shadow-2xl"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          SecureSuperComm
        </motion.h1>
        <motion.p
          className="mt-6 text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed tracking-wide"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-fuchsia-400 font-bold">Explore. Learn. Connect.</span>  
          The <span className="text-cyan-400 font-semibold">futuristic platform</span> where tech knowledge, AI guidance,  
          and career growth unite in one immersive experience.
        </motion.p>
        <div className="mt-10 flex flex-col md:flex-row gap-6 justify-center">
          <Button size="lg" className="rounded-2xl px-10 py-4 text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-110 transition duration-300">
            🚀 Start Learning
          </Button>
          <Button size="lg" variant="outline" className="rounded-2xl px-10 py-4 text-lg font-bold border-fuchsia-400 text-fuchsia-300 hover:bg-fuchsia-900/30 hover:scale-105 transition duration-300">
            🌌 Explore Platform
          </Button>
        </div>
      </section>

      {/* USP Highlights */}
      <section className="relative z-10 w-full max-w-6xl px-6 py-20 grid md:grid-cols-3 gap-10">
        {[
          { icon: <ShieldCheck className="w-12 h-12 text-green-300" />, title: "Military-Grade Security", desc: "Your data stays encrypted & tamper-proof across the platform." },
          { icon: <Sparkles className="w-12 h-12 text-yellow-300" />, title: "AI-Powered Insights", desc: "Smarter learning paths, personalized recommendations, and auto-feedback." },
          { icon: <Globe className="w-12 h-12 text-cyan-300" />, title: "Global + India Focus", desc: "From Silicon Valley trends to Indian government jobs, all in one place." },
        ].map((usp, i) => (
          <motion.div
            key={i}
            className="rounded-2xl p-8 shadow-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-transparent hover:border-fuchsia-500 hover:shadow-fuchsia-500/40 transition transform hover:-translate-y-2 hover:scale-105"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
          >
            {usp.icon}
            <h3 className="mt-5 text-2xl font-bold bg-gradient-to-r from-indigo-300 to-purple-400 bg-clip-text text-transparent">{usp.title}</h3>
            <p className="mt-3 text-gray-400">{usp.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Features Section */}
      <section className="relative z-10 w-full max-w-7xl px-6 py-24 grid md:grid-cols-3 gap-12">
        {[
          { icon: <BookOpen className="w-12 h-12 text-indigo-300" />, title: "Immersive Courses", desc: "Dive into interactive, gamified, project-based courses that evolve with you." },
          { icon: <Users className="w-12 h-12 text-pink-300" />, title: "Community First", desc: "Friend requests, collabs, and mentorship with fellow tech explorers." },
          { icon: <Brain className="w-12 h-12 text-purple-300" />, title: "AI Mentor", desc: "An AI companion that tracks, evaluates, and guides your growth." },
          { icon: <FileText className="w-12 h-12 text-green-300" />, title: "Knowledge Spaces", desc: "Create blogs, spaces, and live docs for communities to thrive." },
          { icon: <Trophy className="w-12 h-12 text-yellow-300" />, title: "Gamification", desc: "Earn badges, compete in leaderboards, and ace technical quizzes." },
          { icon: <Briefcase className="w-12 h-12 text-red-300" />, title: "Career Boost", desc: "Explore global tech opportunities & Indian government jobs." },
          { icon: <Star className="w-12 h-12 text-cyan-300" />, title: "Premium Access", desc: "Unlock advanced resources & mentorship with subscriptions." },
        ].map((f, i) => (
          <motion.div
            key={i}
            className="rounded-3xl p-8 bg-gradient-to-br from-gray-800 via-gray-900 to-black shadow-lg border border-gray-700 hover:shadow-lg hover:shadow-indigo-500/30 transition transform hover:scale-105 hover:-translate-y-2"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            {f.icon}
            <h3 className="mt-5 text-xl font-bold bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">{f.title}</h3>
            <p className="mt-3 text-gray-400 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Call to Action */}
      <section className="relative z-10 w-full max-w-6xl px-6 py-28 text-center">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-300 via-purple-400 to-fuchsia-400 text-transparent bg-clip-text drop-shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
        >
          Step Into the Future of Tech 🚀
        </motion.h2>
        <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
          SecureSuperComm is not just another platform. It’s your{" "}
          <span className="text-purple-300 font-semibold">launchpad</span> to mastering tech,  
          connecting with innovators, and building careers with{" "}
          <span className="text-cyan-300 font-bold">AI-powered guidance</span>.
        </p>
        <Button size="lg" className="mt-10 px-12 py-5 rounded-3xl text-lg font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:scale-110 transition duration-300">
          🌟 Join the Revolution
        </Button>
      </section>
    </main>
  );
}
