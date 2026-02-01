import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Invalid credentials');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bonaire px-4">
      <div className="max-w-md w-full bg-bonaire rounded-lg shadow-xl p-8 border border-stone-lion/30">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-torrefacto-roast mb-2">Admin Dashboard</h1>
          <p className="text-stone-lion">Sign in to manage your content</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-indiana-clay/20 border border-indiana-clay/30 rounded-lg">
            <p className="text-sm text-indiana-clay">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-torrefacto-roast mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-stone-lion/40 rounded-lg bg-bonaire text-torrefacto-roast focus:ring-2 focus:ring-indiana-clay focus:border-transparent outline-none transition"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-torrefacto-roast mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-stone-lion/40 rounded-lg bg-bonaire text-torrefacto-roast focus:ring-2 focus:ring-indiana-clay focus:border-transparent outline-none transition"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indiana-clay text-white rounded-lg font-medium hover:bg-indiana-clay/90 focus:outline-none focus:ring-2 focus:ring-indiana-clay focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-stone-lion">
          <p>Manga Web Admin Panel</p>
        </div>
      </div>
    </div>
  );
}

export default Login;

