import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
import GoogleAd from './components/common/GoogleAd';
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
import NotFound from './pages/NotFound';
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <Router>
            <ErrorBoundary>
              <ThemeLoader>
                <BrandingProvider>
                  <div className="min-h-screen flex flex-col bg-[var(--theme-page-bg)]">
                    <Navbar />
                    <div className="flex flex-1 w-full">
                      {/* Left ad column - desktop only, outside container */}
                      {import.meta.env.VITE_ADSENSE_SLOT_LEFT && (
                        <aside className="hidden lg:flex lg:w-[160px] xl:w-[180px] flex-shrink-0 justify-center pt-4 pb-8 px-2">
                          <div className="sticky top-24 w-full max-w-[160px]">
                            <GoogleAd adSlot={import.meta.env.VITE_ADSENSE_SLOT_LEFT} adFormat="rectangle" className="min-h-[600px]" />
                          </div>
                        </aside>
                      )}
                      <main className="container mx-auto max-w-7xl flex-1 w-full min-w-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
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
                        <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                      {/* Right ad column - desktop only, outside container */}
                      {import.meta.env.VITE_ADSENSE_SLOT_RIGHT && (
                        <aside className="hidden lg:flex lg:w-[160px] xl:w-[180px] flex-shrink-0 justify-center pt-4 pb-8 px-2">
                          <div className="sticky top-24 w-full max-w-[160px]">
                            <GoogleAd adSlot={import.meta.env.VITE_ADSENSE_SLOT_RIGHT} adFormat="rectangle" className="min-h-[600px]" />
                          </div>
                        </aside>
                      )}
                    </div>
                    <Footer />
                  </div>
                </BrandingProvider>
              </ThemeLoader>
            </ErrorBoundary>
          </Router>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
