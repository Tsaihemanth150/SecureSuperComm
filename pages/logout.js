// pages/logout.js
import { useEffect } from 'react';
import { useRouter } from 'next/router'; // Importing Next.js router to handle redirection

const Logout = () => {
  const router = useRouter(); // Initialize the Next.js router for redirection

  useEffect(() => {
    const logoutUser = async () => {
      // Send a POST request to the logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      router.push('/login');
    };

    logoutUser();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8">
        <p className="text-lg font-semibold">Logging you out...</p>
        <p className="mt-2">Redirecting to login page...</p>
      </div>
    </div>
  );
};

export default Logout;