import React, { useState, useEffect } from "react";
import Cookie from "js-cookie";
import { useRouter } from "next/router";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaCalendarAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Profile = () => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [signedUrl, setSignedUrl] = useState(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [privacyMode, setPrivacyMode] = useState("private");
  const [profile, setProfile] = useState(null);
  const [privacyOptions, setPrivacyOptions] = useState({
    isPhoneNumberPublic: false,
    isGenderPublic: false,
    isAgesPublic: false,
    isProfilePicPublic: false,
    isLocationPublic: false,
  });

  const token = Cookie.get("Token");

  useEffect(() => {
    if (!token) return;
    fetch("/api/user/getProfile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserProfile(data.user);
        setSignedUrl(data.documents?.[0]?.signedUrl || null);
        setProfile(data.userProfile);
        setPrivacyOptions(data.user.privacySettings || privacyOptions);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setSignedUrl(null);
      });
  }, [token]);
  console.log(profile);
  const showInitialAvatar = !signedUrl && userProfile;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const uploadProfilePic = async () => {
    if (!selectedFile) return alert("Please select a file first");
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch("/api/cloud/profilePicUpload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUserProfile((prev) => ({ ...prev, profilePicUrl: data.fileUrl }));
      setSignedUrl(data.fileUrl);
      setSelectedFile(null);
      setPreview(null);
      alert("Profile picture uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleSavePrivacy = async () => {
    try {
      const res = await fetch("/api/user/settings/privacy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...privacyOptions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update privacy");
      alert("Privacy updated successfully!");
      setShowPrivacyModal(false);
    } catch (error) {
      console.error("Privacy update failed:", error);
      alert("Failed to update privacy");
    }
  };

  // --- 🔹 Calculate Age from DOB ---
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-400 bg-gradient-to-b from-gray-900 via-gray-950 to-black">
        Loading profile...
      </div>
    );
  }

  const handleMyPublicProfile = () => {
    router.push(`/public/profile/${userProfile.username}`);
  };

  const handleAddAndUpadteProfile = () => {
    router.push(`/profile/addPofile`);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-200">
      <main className="flex-1 p-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-2xl p-6 flex flex-col lg:flex-row items-center gap-6 shadow-lg hover:shadow-purple-500 transition">
          <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-md border-2 border-purple-500">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : showInitialAvatar ? (
              <div className="w-full h-full flex items-center justify-center bg-purple-500 text-white text-3xl font-bold">
                {userProfile.firstName?.charAt(0)}
                {userProfile.lastName?.charAt(0)}
              </div>
            ) : (
              <img
                src={signedUrl}
                alt={`${userProfile.firstName} ${userProfile.lastName}`}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-purple-400">
              {userProfile.firstName} {userProfile.lastName}
            </h2>
            <p className="text-gray-400">@{userProfile.username}</p>

            {/* DOB + Age */}
            {profile?.DOB && (
              <p className="flex items-center justify-center lg:justify-start gap-2 mt-2 text-sm text-gray-300">
                <FaCalendarAlt className="text-yellow-400" />
                DOB: {new Date(profile.DOB).toLocaleDateString()} (
                {calculateAge(profile.DOB)} years old)
              </p>
            )}

            {profile?.Address && (
              <p className="flex items-center justify-center lg:justify-start gap-2 text-sm text-gray-300">
                <FaMapMarkerAlt className="text-green-400" />
                {profile.Address}, {profile.Pincode}
              </p>
            )}

 {!signedUrl && (
              <div className="mt-3 flex flex-col items-center lg:items-start gap-2">
 <div className="flex items-center gap-2">
 <label className="cursor-pointer px-4 py-2 bg-gray-700 rounded-lg shadow hover:bg-gray-600 transition text-sm">
 Choose File
 <input
 type="file"
 onChange={handleFileChange}
 className="hidden"
 />
 </label>
 <span className="text-gray-400 text-sm">Upload Profile Pic</span>
 </div>
                {selectedFile && (
                  <button
                    onClick={uploadProfilePic}
                    disabled={uploading}
 className="px-4 py-2 bg-green-500 text-black rounded-lg shadow hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition text-sm"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                )}
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2 justify-center lg:justify-start">
              <button
                onClick={handleMyPublicProfile}
                className="px-4 py-2 bg-gray-700 rounded-lg shadow hover:bg-gray-600 transition"
              >
                View My Public Profile
              </button>
              {!profile && (
                <button
                  onClick={handleAddAndUpadteProfile}
                  className="px-4 py-2 bg-gray-700 rounded-lg shadow hover:bg-gray-600 transition"
                >
                  Add Profile Information
                </button>
              )}
              {profile && (
                <button
                  onClick={handleAddAndUpadteProfile}
                  className="px-4 py-2 bg-gray-700 rounded-lg shadow hover:bg-gray-600 transition"
                >
                  Update Profile Information
                </button>
              )}
            </div>
          </div>
        </div>
    


        {/* Info & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-purple-400 transition space-y-4">
            <h3 className="text-lg font-semibold mb-2">Profile Info</h3>
            <div className="flex items-center gap-2">
              <FaUser className="text-purple-400" /> User ID:{" "}
              {userProfile.userID}
            </div>
            <div className="flex items-center gap-2">
              <FaEnvelope className="text-purple-400" /> Email:{" "}
              {userProfile.email}
            </div>
            <div className="flex items-center gap-2">
              <FaPhone className="text-purple-400" /> Phone:{" "}
              {userProfile.phoneNumber}
            </div>

            {/* Social Links */}
            <div className="mt-4">
              <h4 className="text-md font-semibold mb-2">Social Links</h4>
              <div className="flex gap-4 text-xl">
                {profile?.FaceBook && (
                  <a
                    href={`https://facebook.com/${profile.FaceBook.replace(
                      /https?:\/\/(www\.)?facebook.com\//,
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-500 transition"
                  >
                    <FaFacebook />
                  </a>
                )}
                {profile?.Instagram && (
                  <a
                    href={`https://instagram.com/${profile.Instagram.replace(
                      /https?:\/\/(www\.)?instagram.com\//,
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-500 transition"
                  >
                    <FaInstagram />
                  </a>
                )}
                {profile?.Twitter && (
                  <a
                    href={`https://twitter.com/${profile.Twitter.replace(
                      /https?:\/\/(www\.)?twitter.com\//,
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-sky-400 transition"
                  >
                    <FaTwitter />
                  </a>
                )}
                {profile?.LinkedIn && (
                  <a
                    href={`https://linkedin.com/in/${profile.LinkedIn.replace(
                      /https?:\/\/(www\.)?linkedin.com\//,
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition"
                  >
                    <FaLinkedin />
                  </a>
                )}
                {profile?.GitHub && (
                  <a
                    href={`https://github.com/${profile.GitHub.replace(
                      /https?:\/\/(www\.)?github.com\//,
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-300 transition"
                  >
                    <FaGithub />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-green-400 transition space-y-4">
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <div className="flex justify-between">
              <span>Courses Completed</span>
              <span>12</span>
            </div>
            <div className="flex justify-between">
              <span>Active Days</span>
              <span>45</span>
            </div>
            <div className="flex justify-between">
              <span>Quizzes Attempted</span>
              <span>30</span>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-blue-400 transition space-y-4">
            <h3 className="text-lg font-semibold mb-2">Settings</h3>
            <button className="w-full px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
              Change Password
            </button>
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
            >
              Privacy Settings
            </button>
          </div>
        </div>

        {/* Courses Progress */}
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-yellow-400 transition space-y-4">
          <h3 className="text-lg font-semibold mb-2">Courses Progress</h3>
          {[
            { name: "React Basics", progress: 80 },
            { name: "Node.js Advanced", progress: 60 },
            { name: "Cyber Security", progress: 40 },
          ].map((course, idx) => (
            <div key={idx}>
              <div className="flex justify-between mb-1">
                <span>{course.name}</span>
                <span>{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-400 h-2 rounded-full transition-all"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Privacy Modal */}
        {showPrivacyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-gray-900 p-6 rounded-2xl shadow-lg w-96 text-gray-200">
              <h2 className="text-lg font-semibold mb-4">Privacy Settings</h2>
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setPrivacyMode("private")}
                  className={`px-4 py-2 rounded-lg ${
                    privacyMode === "private"
                      ? "bg-purple-500 text-white"
                      : "bg-gray-700"
                  }`}
                >
                  Private
                </button>
                <button
                  onClick={() => setPrivacyMode("public")}
                  className={`px-4 py-2 rounded-lg ${
                    privacyMode === "public"
                      ? "bg-purple-500 text-white"
                      : "bg-gray-700"
                  }`}
                >
                  Public
                </button>
              </div>
              {privacyMode === "public" && (
                <div className="space-y-3 mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={privacyOptions.isPhoneNumberPublic}
                      onChange={(e) =>
                        setPrivacyOptions({
                          ...privacyOptions,
                          isPhoneNumberPublic: e.target.checked,
                        })
                      }
                    />{" "}
                    Phone Number
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={privacyOptions.isGenderPublic}
                      onChange={(e) =>
                        setPrivacyOptions({
                          ...privacyOptions,
                          isGenderPublic: e.target.checked,
                        })
                      }
                    />{" "}
                    Gender
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={privacyOptions.isProfilePicPublic}
                      onChange={(e) =>
                        setPrivacyOptions({
                          ...privacyOptions,
                          isProfilePicPublic: e.target.checked,
                        })
                      }
                    />{" "}
                    Public Profile Picture
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={privacyOptions.isAgesPublic}
                      onChange={(e) =>
                        setPrivacyOptions({
                          ...privacyOptions,
                          isAgesPublic: e.target.checked,
                        })
                      }
                    />{" "}
                    Age
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={privacyOptions.isLocationPublic}
                      onChange={(e) =>
                        setPrivacyOptions({
                          ...privacyOptions,
                          isLocationPublic: e.target.checked,
                        })
                      }
                    />{" "}
                    Location
                  </label>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePrivacy}
                  className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 text-black"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
