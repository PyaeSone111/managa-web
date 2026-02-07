import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
                    <main className="container mx-auto max-w-7xl flex-1 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
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
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
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
