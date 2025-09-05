import '../app/globals.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import NavBar from '../components/navbar';
import Footer from '../components/footer';
import LoadingBar from 'react-top-loading-bar';

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState({ value: null });
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleRouteChangeStart = () => setProgress(40);
    const handleRouteChangeComplete = () => setProgress(100);

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    const token = Cookies.get('Token');

 
    if (token) {
      setUser({ value: token });
    } else {
      setUser({ value: null });
    }


    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('Token');
    setUser({ value: null });
    router.push('/');
  };

  return (
    <>
      <LoadingBar color="#f70034" progress={progress} onLoaderFinished={() => setProgress(0)} />
      <NavBar user={user} setUser={setUser} onLogout={handleLogout}  />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

export default MyApp;