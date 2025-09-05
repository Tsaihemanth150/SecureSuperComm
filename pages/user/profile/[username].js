import React, { useState, useEffect } from "react";
import Cookie from "js-cookie";
import { useRouter } from "next/router";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaClipboardList,
  FaChartLine,
  FaUserFriends,
  FaCommentDots,
} from "react-icons/fa";
import ChatDrawer from "@/components/chat/ChatDrawer";

const Profile = () => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [signedUrl, setSignedUrl] = useState(null);
  const [privacy, setPrivacy] = useState({});
  const [isConnectionExit, setIsConnectionExit] = useState(false);
  const [connectionstatus, setConnectionstatus] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const token = Cookie.get("Token");
  const { username } = router.query;

  useEffect(() => {
    if (!token || !username || username === "admin") return;

    fetch("/api/user/profile/viewProfileUserName", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username }),
    })
      .then((res) => res.json())
      .then((data) => {
        setUserProfile(data.searchedUser);
        setSignedUrl(data.documents?.[0]?.signedUrl || null);
        setPrivacy(data.privacyforsearchedUser || {});
        setIsConnectionExit(data.isConnectionExit);
        setConnectionstatus(data.connectionstatus);
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }, [token, username]);

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-gray-400 animate-pulse">
        Loading profile...
      </div>
    );
  }

  const showInitialAvatar = !signedUrl;

  const handleConnection = async () => {
    try {
      await fetch("/api/user/connection/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 p-6 animate-gradientBackground relative">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-gray-800 shadow-xl rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500 shadow-lg">
            {showInitialAvatar ? (
              <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-4xl font-bold">
                {userProfile.firstName?.charAt(0)}
                {userProfile.lastName?.charAt(0)}
              </div>
            ) : privacy.isProfilePicPublic ? (
              <img
                src={signedUrl}
                alt={`${userProfile.firstName} ${userProfile.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-4xl font-bold">
                {userProfile.firstName?.charAt(0)}
                {userProfile.lastName?.charAt(0)}
              </div>
            )}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-white">
              {userProfile.firstName} {userProfile.lastName}
            </h1>
            <p className="text-gray-400 text-lg">@{userProfile.username}</p>
            {userProfile.bio && <p className="text-gray-300 mt-2">{userProfile.bio}</p>}

            <div className="flex gap-4 mt-4 justify-center md:justify-start">
              {!isConnectionExit && (
                <button
                  onClick={handleConnection}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition"
                >
                  <FaUserFriends /> Connect
                </button>
              )}
              {isConnectionExit && connectionstatus === "pending" && (
                <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex items-center gap-2 transition">
                  <FaUserFriends /> Request Pending
                </button>
              )}
              {connectionstatus === "accepted" && (
                <button
                  onClick={() => setShowChat(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition"
                >
                  <FaCommentDots /> Message
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Drawer */}
      {showChat && (
        <ChatDrawer
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          recipient={userProfile}
          chatId={`chat-${userProfile._id}`} // later replace with real chatId from DB
        />
      )}
    </div>
  );
};

export default Profile;
