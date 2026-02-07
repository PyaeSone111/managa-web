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
        <title>Register - Myangar</title>
      </Helmet>

      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-quarzo">
          <div className="flex items-center justify-center gap-2 mb-6">
            <FaUserPlus className="w-6 h-6 text-ruskin-blue" />
            <h1 className="text-2xl font-bold text-black-feather">
              Create Account
            </h1>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {errors.general[0]}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black-feather mb-1">Name</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sidewalk-grey" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 pl-10 border border-quarzo rounded-lg bg-white text-black-feather focus:ring-2 focus:ring-ruskin-blue focus:border-transparent transition-all"
                  placeholder="Your name"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-feather mb-1">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sidewalk-grey" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 pl-10 border border-quarzo rounded-lg bg-white text-black-feather focus:ring-2 focus:ring-ruskin-blue focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-feather mb-1">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sidewalk-grey" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 pl-10 border border-quarzo rounded-lg bg-white text-black-feather focus:ring-2 focus:ring-ruskin-blue focus:border-transparent transition-all"
                  placeholder="Min 8 characters"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-feather mb-1">Confirm Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sidewalk-grey" />
                <input
                  type="password"
                  value={form.password_confirmation}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 pl-10 border border-quarzo rounded-lg bg-white text-black-feather focus:ring-2 focus:ring-ruskin-blue focus:border-transparent transition-all"
                  placeholder="Repeat your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-delta-green text-white rounded-lg hover:bg-ruskin-blue disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200"
            >
              <FaUserPlus className="w-4 h-4" />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-sidewalk-grey">
            Already have an account?{' '}
            <Link to="/login" className="inline-flex items-center gap-1 text-ruskin-blue hover:text-delta-green font-medium transition-colors">
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
