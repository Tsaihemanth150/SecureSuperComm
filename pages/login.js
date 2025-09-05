import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  // Fetch captcha from API
  const loadCaptcha = async () => {
    const res = await fetch("/api/auth/captcha");
    const data = await res.json();
    setCaptchaSvg(data.svg);
    setCaptchaText(data.text);
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, captchaInput }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message, { position: "top-center", autoClose: 3000, theme: "dark", transition: Bounce });
        setTimeout(() => router.push("/dashboard"), 3000);
      } else {
        toast.error(data.message, { position: "top-center", autoClose: 4000, theme: "dark", transition: Bounce });
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-gray-950 to-black p-6">
        {/* Logo */}
        <Image src="/SecureSuperCommLogo.svg" width={200} height={150} alt="SecureSuperComm Logo" className="mb-6" />

        <form
          onSubmit={handleLogin}
          className="bg-gray-800 bg-opacity-90 backdrop-blur-md shadow-2xl rounded-xl p-8 w-full max-w-md border border-gray-700"
        >
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-400 mb-6 text-center">
            Welcome Back
          </h2>

          <div className="mb-5">
            <label className="block mb-2 text-gray-200 font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              className="w-full p-3 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-purple-500 outline-none transition"
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2 text-gray-200 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full p-3 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-purple-500 outline-none transition"
            />
          </div>

          {/* Captcha */}
          <div className="mb-5">
            <div
              className="p-2 rounded-md bg-gray-900 border border-gray-700 mb-2"
              dangerouslySetInnerHTML={{ __html: captchaSvg }}
            />
            <button
              type="button"
              onClick={loadCaptcha}
              className="text-sm text-purple-400 hover:text-purple-500 underline mb-2"
            >
              Refresh Captcha
            </button>
            <input
              type="text"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              placeholder="Enter Captcha"
              required
              className="w-full p-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-purple-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 text-black font-semibold hover:scale-105 transform transition duration-300 shadow-lg"
          >
            Login
          </button>
        </form>
      </div>
    </>
  );
};

export default Login;
