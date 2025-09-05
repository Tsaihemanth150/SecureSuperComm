import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function Connections() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get("Token");

  // --- Fetch all requests + connections ---
  const fetchConnections = async () => {
    try {
      const res = await fetch("/api/user/connection/request", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch connections");

      const data = await res.json();
      setConnections(data.myrequest || []); // API returns "myrequest"
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchConnections();
  }, [token]);

  // --- Handle accept/reject ---
  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`/api/user/connection/connections`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ connectionId: id, action }), // action = "accepted" | "rejected"
      });

      if (!res.ok) throw new Error("Failed to update connection");
      await fetchConnections(); // refresh after update
    } catch (error) {
      console.error(error);
    }
  };

  // --- Handle remove connection ---
  const handleRemove = async (targetUserId) => {
    try {
      const res = await fetch(`/api/user/connection/connections`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId }),
      });

      if (!res.ok) throw new Error("Failed to remove connection");
      await fetchConnections(); // refresh
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-200">
      <h1 className="text-2xl font-bold mb-4">Connections</h1>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : connections.length === 0 ? (
        <p className="text-gray-400">No connections or requests yet.</p>
      ) : (
        <ul className="space-y-3">
          {connections.map((conn) => {
            // pick the "other" user (who is not the logged in one)
            const otherUser =
              conn.requester?._id === conn.recipient?._id
                ? null
                : conn.requester._id === conn.userId
                ? conn.recipient
                : conn.requester;

            return (
              <li
                key={conn._id}
                className="flex items-center justify-between bg-gray-800 p-4 rounded-xl shadow-md hover:bg-gray-700 transition"
              >
                {/* User Info */}
                <div className="flex items-center space-x-3">
                  {otherUser?.profilePic ? (
                    <img
                      src={otherUser.profilePic}
                      alt={otherUser.firstName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-black font-bold">
                      {otherUser?.firstName?.charAt(0)}
                      {otherUser?.lastName?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-semibold">
                      {otherUser?.firstName} {otherUser?.lastName}
                    </p>
                    <p className="text-gray-400 text-sm">{otherUser?.username}</p>
                  </div>
                </div>

                {/* Actions */}
                {conn.status === "pending" && (
                  <div className="space-x-2">
                    <button
                      onClick={() => handleAction(conn._id, "accepted")}
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded-lg text-white text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction(conn._id, "rejected")}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-white text-sm"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {conn.status === "accepted" && (
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400 text-sm">Connected</span>
                    <button
                      onClick={() =>
                        handleRemove(
                          conn.requester._id === otherUser._id
                            ? conn.requester._id
                            : conn.recipient._id
                        )
                      }
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-white text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
