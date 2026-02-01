import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaSignInAlt, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Manga Web</title>
      </Helmet>

      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md glass-card rounded-2xl shadow-2xl p-6 sm:p-8 border border-silver-grass/30">
          <div className="flex items-center justify-center gap-2 mb-6">
            <FaSignInAlt className="w-6 h-6 text-bracken-green" />
            <h1 className="text-2xl font-bold text-white">
              Sign In
            </h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-bracken-green/30 backdrop-blur-sm text-white rounded-lg text-sm border border-bracken-green/40">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-silver-grass/70" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 pl-10 border border-silver-grass/40 rounded-lg glass-effect text-white focus:ring-2 focus:ring-bracken-green focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-silver-grass/70" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full px-4 py-2 pl-10 border border-silver-grass/40 rounded-lg glass-effect text-white focus:ring-2 focus:ring-bracken-green focus:border-transparent transition-all"
                  placeholder="Your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-bracken-green text-silver-grass rounded-lg hover:bg-bracken-fern disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200"
            >
              <FaSignInAlt className="w-4 h-4" />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white">
            Don't have an account?{' '}
            <Link to="/register" className="inline-flex items-center gap-1 text-white hover:text-silver-grass hover:underline font-medium transition-colors">
              <FaUserPlus className="w-3.5 h-3.5" />
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
