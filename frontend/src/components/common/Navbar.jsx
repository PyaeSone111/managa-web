import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import SearchBar from '../search/SearchBar';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { logoUrl } = useBranding();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const navLinkClass =
    'text-sm xl:text-base text-white hover:text-silver-grass transition-colors duration-200';
  const mobileNavLinkClass =
    'block px-2 py-2 text-white hover:text-silver-grass hover:bg-silver-grass/20 rounded transition-colors duration-200';

  return (
    <nav className="glass-effect shadow-lg sticky top-0 z-50 border-b border-silver-grass/20 rounded-b-xl transition-all duration-300">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
            <img
              src={logoUrl || '/logo.png'}
              alt="Manga Web Logo"
              className="h-8 sm:h-9 md:h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            <Link to="/" className={navLinkClass}>
              Home
            </Link>
            <Link to="/browse" className={navLinkClass}>
              Browse
            </Link>
            <Link to="/rankings" className={navLinkClass}>
              Rankings
            </Link>
            {isAuthenticated && (
              <Link to="/favorites" className={navLinkClass}>
                Favorites
              </Link>
            )}
            <div className="hidden xl:block">
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-silver-grass/30 text-white hover:bg-silver-grass/50 transition-all duration-200 text-sm"
                >
                  <span className="w-6 h-6 bg-bracken-green text-silver-grass rounded-full flex items-center justify-center text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <span className="hidden xl:inline">{user?.name || 'User'}</span>
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 glass-card rounded-xl shadow-xl border border-silver-grass/30 z-50 py-1">
                      <Link
                        to="/favorites"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-white hover:bg-silver-grass/30 transition-colors rounded-lg mx-1"
                      >
                        My Favorites
                      </Link>
                      <hr className="my-1 border-silver-grass/20" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-white hover:bg-silver-grass/30 transition-colors rounded-lg mx-1"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white hover:text-silver-grass transition-colors duration-200"
                >
                  <FaSignInAlt className="w-3.5 h-3.5" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-bracken-green text-white rounded-lg hover:bg-bracken-fern transition-all duration-200"
                >
                  <FaUserPlus className="w-3.5 h-3.5" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Tablet/Mobile: Menu Toggle */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-silver-grass/30 text-white hover:bg-silver-grass/50 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-3 border-t border-silver-grass/20">
            <Link to="/" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/browse" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
              Browse
            </Link>
            <Link to="/rankings" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
              Rankings
            </Link>
            {isAuthenticated && (
              <Link to="/favorites" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
                My Favorites
              </Link>
            )}
            <div className="px-2">
              <SearchBar onSearch={handleSearch} />
            </div>
            {isAuthenticated ? (
              <div className="px-2 pt-2 border-t border-silver-grass/20">
                <div className="flex items-center gap-2 px-2 py-2 text-sm text-white">
                  <span className="w-6 h-6 bg-bracken-green text-silver-grass rounded-full flex items-center justify-center text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  {user?.name || 'User'}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-2 py-2 text-sm text-white hover:bg-silver-grass/30 rounded transition-colors"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2 px-2 pt-2 border-t border-silver-grass/20">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 flex-1 text-center px-3 py-2 text-sm border border-silver-grass/40 text-white rounded-lg hover:bg-silver-grass/30 transition-colors"
                >
                  <FaSignInAlt className="w-3.5 h-3.5" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 flex-1 text-center px-3 py-2 text-sm bg-bracken-green text-silver-grass rounded-lg hover:bg-bracken-fern transition-all duration-200"
                >
                  <FaUserPlus className="w-3.5 h-3.5" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
