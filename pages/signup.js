import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");
  const [FisrtName, setFisrtName] = useState("");
  const [LastName, setLastName] = useState("");
  const [PhoneNumber, sePhoneNumber] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,
          password,
          confirmPassword: ConfirmPassword,
          Firstname: FisrtName,
          Lastname: LastName,
          phoneNumber: PhoneNumber,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Account created successfully!", { position: "top-center", autoClose: 3000, theme: "dark", transition: Bounce });
        setTimeout(() => router.push("/login"), 3000);
      } else {
        toast.error(data.message || "Signup failed!", { position: "top-center", autoClose: 4000, theme: "dark", transition: Bounce });
      }
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-950 to-black p-6">
        <form
          onSubmit={handleSignUp}
          className="bg-gray-800 bg-opacity-90 backdrop-blur-md p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700"
        >
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-400 mb-6 text-center">
            Create Your Account
          </h2>

          {/* Input Fields */}
          {[
            { label: "Email", value: email, setter: setEmail, type: "email", placeholder: "name@SecureSuperComm.com" },
            { label: "Username", value: username, setter: setUsername, type: "text", placeholder: "Username" },
            { label: "Password", value: password, setter: setPassword, type: "password", placeholder: "Password" },
            { label: "Confirm Password", value: ConfirmPassword, setter: setConfirmPassword, type: "password", placeholder: "Confirm Password" },
            { label: "First Name", value: FisrtName, setter: setFisrtName, type: "text", placeholder: "First Name" },
            { label: "Last Name", value: LastName, setter: setLastName, type: "text", placeholder: "Last Name" },
            { label: "Phone Number", value: PhoneNumber, setter: sePhoneNumber, type: "number", placeholder: "+91 86*******" },
          ].map((field, idx) => (
            <div className="mb-5" key={idx}>
              <label className="block mb-2 text-gray-200 font-medium">{field.label}</label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                required
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-purple-500 outline-none transition"
              />
            </div>
          ))}

          {/* Terms Checkbox */}
          <div className="flex items-center mb-5">
            <input
              type="checkbox"
              required
              className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-700 focus:ring-2 focus:ring-purple-500"
            />
            <label className="ml-2 text-gray-300 text-sm">
              I agree with the{" "}
              <a href="#" className="text-purple-400 hover:underline">
                terms and conditions
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 text-black font-semibold hover:scale-105 transform transition duration-300 shadow-lg"
          >
            Register Account
          </button>
        </form>
      </div>
    </>
  );
};

export default Signup;
