import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaUserPlus, FaUser, FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: [err.response?.data?.message || 'Registration failed'] });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Register - Manga Web</title>
      </Helmet>

      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md glass-card rounded-2xl shadow-2xl p-6 sm:p-8 border border-silver-grass/30">
          <div className="flex items-center justify-center gap-2 mb-6">
            <FaUserPlus className="w-6 h-6 text-bracken-green" />
            <h1 className="text-2xl font-bold text-white">
              Create Account
            </h1>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-bracken-green/30 backdrop-blur-sm text-white rounded-lg text-sm border border-bracken-green/40">
              {errors.general[0]}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-silver-grass/70" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 pl-10 border border-silver-grass/40 rounded-lg glass-effect text-white focus:ring-2 focus:ring-bracken-green focus:border-transparent transition-all"
                  placeholder="Your name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-white">{errors.name[0]}</p>
              )}
            </div>

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
              {errors.email && (
                <p className="mt-1 text-sm text-white">{errors.email[0]}</p>
              )}
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
                  minLength={8}
                  className="w-full px-4 py-2 pl-10 border border-silver-grass/40 rounded-lg glass-effect text-white focus:ring-2 focus:ring-bracken-green focus:border-transparent transition-all"
                  placeholder="Min 8 characters"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-white">{errors.password[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-silver-grass/70" />
                <input
                  type="password"
                  value={form.password_confirmation}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 pl-10 border border-silver-grass/40 rounded-lg glass-effect text-white focus:ring-2 focus:ring-bracken-green focus:border-transparent transition-all"
                  placeholder="Repeat your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-bracken-green text-silver-grass rounded-lg hover:bg-bracken-fern disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200"
            >
              <FaUserPlus className="w-4 h-4" />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white">
            Already have an account?{' '}
            <Link to="/login" className="inline-flex items-center gap-1 text-white hover:text-silver-grass hover:underline font-medium transition-colors">
              <FaSignInAlt className="w-3.5 h-3.5" />
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;
