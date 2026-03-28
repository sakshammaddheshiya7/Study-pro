import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils/constants';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle, signInAdmin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const user = await signInWithGoogle();
      if (user.email === ADMIN_EMAIL) {
        navigate('/admin');
      } else {
        navigate('/student');
      }
      toast.success(`Welcome, ${user.displayName || 'User'}!`);
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (email !== ADMIN_EMAIL) {
      toast.error('Invalid admin credentials');
      return;
    }
    if (password !== ADMIN_PASSWORD) {
      toast.error('Invalid password');
      return;
    }
    try {
      setLoading(true);
      await signInAdmin(email, password);
      navigate('/admin');
      toast.success('Welcome, Admin!');
    } catch (error) {
      toast.error('Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50 flex items-center justify-center p-4">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-300 rounded-full opacity-15 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-amber-200 rounded-full opacity-20 blur-2xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl shadow-lg mb-4">
            <span className="text-3xl">📚</span>
          </div>
          <h1 className="text-3xl font-extrabold text-dark-800">
            JEE-NEET <span className="text-primary-500">Platform</span>
          </h1>
          <p className="text-dark-400 mt-2 text-sm">Advanced Test Preparation System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-card p-6 md:p-8 animate-slide-up">
          {/* Mode Toggle */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            <button
              onClick={() => setIsAdminMode(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                !isAdminMode
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-dark-500 hover:text-dark-700'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setIsAdminMode(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isAdminMode
                  ? 'bg-dark-800 text-white shadow-md'
                  : 'text-dark-500 hover:text-dark-700'
              }`}
            >
              Admin
            </button>
          </div>

          {isAdminMode ? (
            /* Admin Login Form */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1.5">Admin Email</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter admin email"
                    className="input-field pl-11"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1.5">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="input-field pl-11 pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                  >
                    {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-dark-800 text-white font-bold rounded-xl hover:bg-dark-900 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FiShield size={18} />
                    <span>Access Admin Panel</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Student Google Login */
            <div className="space-y-4">
              <p className="text-center text-dark-500 text-sm mb-6">
                Sign in with your Google account to start your preparation journey
              </p>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3.5 bg-white border-2 border-gray-200 text-dark-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-dark-300 border-t-dark-600 rounded-full animate-spin" />
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-dark-400">or</span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3.5 gradient-primary text-white font-bold rounded-xl hover:shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <span>🚀</span>
                <span>Start Preparing Now</span>
              </button>
            </div>
          )}
        </div>

        {/* Features Preview */}
        <div className="mt-6 grid grid-cols-3 gap-3 animate-fade-in">
          {[
            { icon: '📝', label: '25000+ Questions' },
            { icon: '🎯', label: 'AI Analysis' },
            { icon: '📊', label: 'Live Tests' }
          ].map((f, i) => (
            <div key={i} className="bg-white/70 backdrop-blur rounded-2xl p-3 text-center shadow-sm">
              <span className="text-2xl">{f.icon}</span>
              <p className="text-[11px] font-medium text-dark-600 mt-1">{f.label}</p>
            </div>
          ))}
        </div>

        {/* Credit */}
        <p className="text-center text-xs text-dark-400 mt-6">
          Developer: <span className="font-semibold text-dark-500">Saksham Gupta</span>
        </p>
      </div>
    </div>
  );
}

function FiShield({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
