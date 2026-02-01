import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Series
import SeriesList from './pages/series/SeriesList';
import SeriesForm from './pages/series/SeriesForm';

// Chapters
import ChapterList from './pages/chapters/ChapterList';
import ChapterForm from './pages/chapters/ChapterForm';

// Categories
import CategoryList from './pages/categories/CategoryList';
import CategoryForm from './pages/categories/CategoryForm';

// Tags
import TagList from './pages/tags/TagList';
import TagForm from './pages/tags/TagForm';

// Authors
import AuthorList from './pages/authors/AuthorList';
import AuthorForm from './pages/authors/AuthorForm';

// Manga Types
import MangaTypeList from './pages/manga-types/MangaTypeList';
import MangaTypeForm from './pages/manga-types/MangaTypeForm';

// Themes
import ThemeList from './pages/themes/ThemeList';

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

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* Series Routes */}
      <Route
        path="/dashboard/series"
        element={
          <ProtectedRoute>
            <SeriesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/series/create"
        element={
          <ProtectedRoute>
            <SeriesForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/series/:id/edit"
        element={
          <ProtectedRoute>
            <SeriesForm />
          </ProtectedRoute>
        }
      />
      {/* Chapter Routes */}
      <Route
        path="/dashboard/chapters"
        element={
          <ProtectedRoute>
            <ChapterList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/chapters/create"
        element={
          <ProtectedRoute>
            <ChapterForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/chapters/:id/edit"
        element={
          <ProtectedRoute>
            <ChapterForm />
          </ProtectedRoute>
        }
      />
      {/* Category Routes */}
      <Route
        path="/dashboard/categories"
        element={
          <ProtectedRoute>
            <CategoryList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/categories/create"
        element={
          <ProtectedRoute>
            <CategoryForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/categories/:id/edit"
        element={
          <ProtectedRoute>
            <CategoryForm />
          </ProtectedRoute>
        }
      />
      {/* Tag Routes */}
      <Route
        path="/dashboard/tags"
        element={
          <ProtectedRoute>
            <TagList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/tags/create"
        element={
          <ProtectedRoute>
            <TagForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/tags/:id/edit"
        element={
          <ProtectedRoute>
            <TagForm />
          </ProtectedRoute>
        }
      />
      {/* Author Routes */}
      <Route
        path="/dashboard/authors"
        element={
          <ProtectedRoute>
            <AuthorList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/authors/create"
        element={
          <ProtectedRoute>
            <AuthorForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/authors/:id/edit"
        element={
          <ProtectedRoute>
            <AuthorForm />
          </ProtectedRoute>
        }
      />
      {/* Manga Type Routes */}
      <Route
        path="/dashboard/manga-types"
        element={
          <ProtectedRoute>
            <MangaTypeList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/manga-types/create"
        element={
          <ProtectedRoute>
            <MangaTypeForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/manga-types/:id/edit"
        element={
          <ProtectedRoute>
            <MangaTypeForm />
          </ProtectedRoute>
        }
      />
      {/* Theme Routes */}
      <Route
        path="/dashboard/themes"
        element={
          <ProtectedRoute>
            <ThemeList />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
