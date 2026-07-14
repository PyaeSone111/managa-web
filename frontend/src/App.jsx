import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
import ThemeLoader from './components/common/ThemeLoader';
import { BrandingProvider } from './context/BrandingContext';
import Home from './pages/Home';
import Browse from './pages/Browse';
import SeriesDetail from './pages/SeriesDetail';
import Reader from './pages/Reader';
import Rankings from './pages/Rankings';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ContactUs from './pages/ContactUs';
import DownloadApp from './pages/DownloadApp';
import NotFound from './pages/NotFound';
// import AdScripts from './components/ads/AdScripts';
// import FooterAdStrip from './components/ads/FooterAdStrip';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppContent() {
  const location = useLocation();
  const isDownloadPage = location.pathname === '/download';
  // const isReaderPage = location.pathname.startsWith('/read/');
  // const showBannerAd = !isDownloadPage && !isReaderPage;

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
            <ErrorBoundary>
              <ThemeLoader>
                <BrandingProvider>
                  {/* <AdScripts /> */}
                  <div className="min-h-screen flex flex-col bg-[var(--theme-page-bg)]">
                    <Navbar />
                    <div className="flex flex-1 w-full">
                      <main className={isDownloadPage
                        ? 'flex-1 w-full min-w-0'
                        : 'container mx-auto max-w-7xl flex-1 w-full min-w-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8'
                      }>
                        <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/browse" element={<Browse />} />
                        <Route path="/rankings" element={<Rankings />} />
                        <Route path="/favorites" element={<Favorites />} />
                        <Route path="/series/:slug" element={<SeriesDetail />} />
                        <Route path="/read/:seriesSlug/:chapterNumber" element={<Reader />} />
                        <Route path="/search" element={<Browse />} />
                        <Route path="/category/:slug" element={<Browse />} />
                        <Route path="/tag/:slug" element={<Browse />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/contact" element={<ContactUs />} />
                        <Route path="/download" element={<DownloadApp />} />
                        <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </div>
                    {/* {showBannerAd && <FooterAdStrip />} */}
                    <Footer />
                  </div>
                </BrandingProvider>
              </ThemeLoader>
            </ErrorBoundary>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </Router>
  );
}

export default App;
