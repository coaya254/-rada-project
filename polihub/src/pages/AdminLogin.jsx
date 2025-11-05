import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    // For development/demo purposes - REPLACE WITH REAL API CALL
    setTimeout(() => {
      if (email === 'admin@polihub.com' && password === 'admin123') {
        // Store token (in production, get this from backend)
        localStorage.setItem('adminToken', 'demo-token-12345');
        localStorage.setItem('adminUser', JSON.stringify({
          email: email,
          name: 'Admin User',
          role: 'admin'
        }));
        
        setLoading(false);
        onLoginSuccess();
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    }, 1000);

    /* PRODUCTION CODE - Uncomment and customize:
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        onLoginSuccess();
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
    */
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-blue-200 flex items-center justify-center p-4">
      {/* Floating Background Elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-10">🏛️</div>
      <div className="absolute bottom-10 right-10 text-6xl opacity-10">🗳️</div>
      <div className="absolute top-1/4 right-1/4 text-6xl opacity-10">⚖️</div>

      {/* Login Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-md border-2 border-white">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">🏛️</span>
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            PoliHub Admin
          </h1>
          <p className="text-gray-600 text-sm">Sign in to manage your platform</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <div className="font-bold text-red-800 text-sm">Login Failed</div>
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          </div>
        )}

        {/* Demo Credentials Info */}
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <div className="font-bold text-blue-800 text-sm mb-2">🔐 Demo Credentials</div>
          <div className="text-blue-700 text-xs space-y-1">
            <div><strong>Email:</strong> admin@polihub.com</div>
            <div><strong>Password:</strong> admin123</div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
                placeholder="admin@polihub.com"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
                placeholder="Enter your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-600 font-semibold">Remember me</span>
            </label>
            <button
              type="button"
              className="text-purple-600 font-bold hover:text-purple-700 transition"
            >
              Forgot password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 pt-6 border-t-2 border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Need access?{' '}
            <button className="text-purple-600 font-bold hover:text-purple-700 transition">
              Contact Administrator
            </button>
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
          <div className="text-xs text-gray-600 text-center">
            🔒 Secure connection • Your data is protected
          </div>
        </div>
      </div>

      {/* Back to Site Link */}
      <button
        onClick={() => window.location.href = '/'}
        className="absolute top-6 left-6 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl font-bold text-gray-700 hover:bg-white transition shadow-lg border-2 border-white"
      >
        ← Back to Site
      </button>
    </div>
  );
}

/* 
 * USAGE EXAMPLE:
 * 
 * In your App.jsx:
 * 
 * import AdminLogin from './pages/AdminLogin';
 * import AdminDashboard from './pages/AdminDashboard';
 * 
 * const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
 * 
 * // Check if already logged in
 * useEffect(() => {
 *   const token = localStorage.getItem('adminToken');
 *   if (token) {
 *     setIsAdminAuthenticated(true);
 *   }
 * }, []);
 * 
 * // In your render:
 * {currentPage === 'admin' && (
 *   <>
 *     {!isAdminAuthenticated ? (
 *       <AdminLogin onLoginSuccess={() => setIsAdminAuthenticated(true)} />
 *     ) : (
 *       <AdminDashboard />
 *     )}
 *   </>
 * )}
 */