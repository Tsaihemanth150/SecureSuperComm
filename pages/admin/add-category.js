import React, { useState } from "react";
import { useRouter } from "next/router";
import Cookie from "js-cookie";

const AddCategory = () => {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Handle form change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = Cookie.get("Token"); // stored in cookies on login
      if (!token) {
        setMessage({ type: "error", text: "No token found. Please log in." });
        setLoading(false);
        return;
      }

      const res = await fetch("/api/admin/catgeory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "Something went wrong" });
      } else {
        setMessage({ type: "success", text: data.message });
        setForm({ name: "", description: "" });
        setTimeout(() => router.push("/admin/catgeory"), 1500); // redirect
      }
    } catch (error) {
      setMessage({ type: "error", text: "Internal server error" });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Add New Category</h1>

        {message && (
          <div
            className={`mb-4 p-3 rounded text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Category Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Programming"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows="3"
              className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Courses related to coding & development"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Category"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;
