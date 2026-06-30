import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import GetAppButton from './GetAppButton';
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
    'text-sm xl:text-base text-white/90 hover:text-white transition-colors duration-200';
  const mobileNavLinkClass =
    'block px-3 py-2 text-black-feather hover:bg-quarzo/50 rounded-lg transition-colors duration-200';

  return (
    <nav className="bg-navy shadow-lg sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logoUrl || '/logo.png'}
              alt="Myangar Logo"
              className="h-8 sm:h-9 md:h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            <Link to="/" className={navLinkClass}>Home</Link>
            <Link to="/browse" className={navLinkClass}>Browse</Link>
            <Link to="/rankings" className={navLinkClass}>Rankings</Link>
            {isAuthenticated && (
              <Link to="/favorites" className={navLinkClass}>Favorites</Link>
            )}
            <GetAppButton size="sm" />
            <div className="hidden xl:block">
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-200 text-sm"
                >
                  <span className="w-6 h-6 bg-red-orange text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <span className="hidden xl:inline">{user?.name || 'User'}</span>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-quarzo z-50 py-1">
                      <Link
                        to="/favorites"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-black-feather hover:bg-quarzo/40 transition-colors rounded-lg mx-1"
                      >
                        My Favorites
                      </Link>
                      <hr className="my-1 border-quarzo" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-black-feather hover:bg-quarzo/40 transition-colors rounded-lg mx-1"
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
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/90 hover:text-white transition-colors duration-200"
                >
                  <FaSignInAlt className="w-3.5 h-3.5" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-orange text-white rounded-lg hover:bg-red-orange/90 transition-all duration-200"
                >
                  <FaUserPlus className="w-3.5 h-3.5" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '\u2715' : '\u2630'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-2 border-t border-white/10 bg-white rounded-b-xl -mx-3 px-3 sm:-mx-4 sm:px-4 shadow-lg">
            <Link to="/" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/browse" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>Browse</Link>
            <Link to="/rankings" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>Rankings</Link>
            {isAuthenticated && (
              <Link to="/favorites" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>My Favorites</Link>
            )}
            <div className="px-2">
              <GetAppButton
                size="sm"
                className="w-full justify-center"
                onClick={() => setMobileMenuOpen(false)}
              />
            </div>
            <div className="px-2 py-2">
              <SearchBar onSearch={handleSearch} />
            </div>
            {isAuthenticated ? (
              <div className="px-2 pt-2 border-t border-quarzo">
                <div className="flex items-center gap-2 px-2 py-2 text-sm text-black-feather">
                  <span className="w-6 h-6 bg-red-orange text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  {user?.name || 'User'}
                </div>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-black-feather hover:bg-quarzo/50 rounded-lg transition-colors"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2 px-2 pt-2 border-t border-quarzo">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 flex-1 text-center px-3 py-2 text-sm border border-quarzo text-black-feather rounded-lg hover:bg-quarzo/30 transition-colors"
                >
                  <FaSignInAlt className="w-3.5 h-3.5" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 flex-1 text-center px-3 py-2 text-sm bg-ruskin-blue text-white rounded-lg hover:bg-ruskin-blue/80 transition-all duration-200"
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
