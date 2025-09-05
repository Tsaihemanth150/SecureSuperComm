import React, { useState, useEffect } from "react";
import {
  FaUserFriends,
  FaBook,
  FaChartLine,
  FaClipboardList,
  FaBell,
} from "react-icons/fa";
import Cookies from "js-cookie";
import { timeAgo } from "@/lib/helpers/timeAgo"; // ✅ import helper

const Dashboard = () => {
  const [user, setUser] = useState("");
  const [signedUrl, setSignedUrls] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const token = Cookies.get("Token");

  // fetch user + notifications
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, notifRes] = await Promise.all([
          fetch("/api/user/dashboard", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("/api/user/notifications", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!userRes.ok || !notifRes.ok) throw new Error("Failed to fetch");

        const userData = await userRes.json();
        const notifData = await notifRes.json();

        setUser(userData.user);
        setSignedUrls(userData.documents?.[0]?.signedUrl || "");
        setNotifications(notifData.notifications || []);
      } catch (error) {
        console.log(error);
      }
    };

    if (token) fetchData();
  }, [token]);

  // mark notification as read (API + local state)
  const markAsRead = async (id) => {
    try {
      await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationId:id }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-200">
      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Topbar */}
        <div className="flex justify-between items-center mb-6 relative">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>

          {user && (
            <div className="flex items-center space-x-4 relative">
              {/* Bell with count */}
              <div
                className="relative cursor-pointer"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell className="text-gray-400 w-6 h-6 hover:text-white transition" />
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
              </div>

              {/* Notifications Popover */}
              {showNotifications && (
                <div className="absolute right-0 top-10 w-72 bg-gray-800 rounded-xl shadow-lg p-4 z-10">
                  <h3 className="text-white font-semibold mb-2">
                    Notifications
                  </h3>
                  <div className="max-h-60 overflow-y-auto space-y-3">
                    {notifications.length === 0 ? (
                      <p className="text-gray-400 text-sm">No notifications</p>
                    ) : (
                      notifications.map((note) => (
                        <div
                          key={note._id}
                          onClick={() => markAsRead(note._id)}
                          className={`rounded-lg p-3 transition cursor-pointer ${
                            note.isRead
                              ? "bg-gray-700 hover:bg-gray-600"
                              : "bg-purple-600 hover:bg-purple-500"
                          }`}
                        >
                          <p className="text-sm text-white">{note.message}</p>
                          <p className="text-xs text-gray-300">
                            {timeAgo(note.createdAt)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <span className="text-gray-400">Hi, {user.firstName}</span>
              {!signedUrl && (
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-black font-bold">
                  {user.firstName ? user.firstName.charAt(0) : ""}
                  {user.lastName ? user.lastName.charAt(0) : ""}
                </div>
              )}
              {signedUrl && (
                <img
                  src={signedUrl}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
              )}
            </div>
          )}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-800 rounded-xl p-5 shadow-lg hover:shadow-purple-500 transition transform hover:-translate-y-1">
            <div className="flex items-center space-x-3">
              <FaBook className="text-purple-400 w-8 h-8" />
              <div>
                <p className="text-gray-400 text-sm">Courses Completed</p>
                <p className="text-white text-xl font-bold">12</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 shadow-lg hover:shadow-green-400 transition transform hover:-translate-y-1">
            <div className="flex items-center space-x-3">
              <FaUserFriends className="text-green-400 w-8 h-8" />
              <div>
                <p className="text-gray-400 text-sm">Connection</p>
                <p className="text-white text-xl font-bold">45</p>
                
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 shadow-lg hover:shadow-blue-400 transition transform hover:-translate-y-1">
            <div className="flex items-center space-x-3">
              <FaClipboardList className="text-blue-400 w-8 h-8" />
              <div>
                <p className="text-gray-400 text-sm">Quizzes Attempted</p>
                <p className="text-white text-xl font-bold">30</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 shadow-lg hover:shadow-yellow-400 transition transform hover:-translate-y-1">
            <div className="flex items-center space-x-3">
              <FaChartLine className="text-yellow-400 w-8 h-8" />
              <div>
                <p className="text-gray-400 text-sm">Leaderboard Rank</p>
                <p className="text-white text-xl font-bold">7</p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Progress */}
        <div className="bg-gray-800 rounded-xl p-5 shadow-lg overflow-x-auto">
          <h2 className="text-xl font-semibold text-white mb-4">
            Your Courses Progress
          </h2>
          <table className="w-full text-left text-gray-200">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-2">Course</th>
                <th className="px-4 py-2">Progress</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "React Basics", progress: 80, status: "In Progress" },
                { name: "Node.js Advanced", progress: 60, status: "In Progress" },
                { name: "Cyber Security", progress: 40, status: "In Progress" },
                { name: "AI Analysis", progress: 20, status: "Not Started" },
              ].map((course, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-700 hover:bg-gray-700 transition"
                >
                  <td className="px-4 py-2">{course.name}</td>
                  <td className="px-4 py-2">
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-purple-400 h-3 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-4 py-2">{course.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
