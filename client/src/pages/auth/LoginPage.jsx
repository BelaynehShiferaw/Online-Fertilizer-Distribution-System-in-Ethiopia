import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

const demoAccounts = [
  { role: 'Manager', email: 'manager@ofdms.et', pass: 'Manager@123', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { role: 'Office Manager', email: 'officemanager@ofdms.et', pass: 'Office@123', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { role: 'Agricultural Expert', email: 'agriexpert@ofdms.et', pass: 'Expert@123', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { role: 'Warehouse Laborer', email: 'laborer@ofdms.et', pass: 'Laborer@123', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { role: 'Farmer', email: 'farmer@ofdms.et', pass: 'Farmer@123', color: 'bg-green-50 text-green-700 border-green-200' },
];

const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        // Redirect to role-appropriate dashboard or requested path
        const userRole = res.user.role;
        const fromPath = location.state?.from?.pathname;
        if (fromPath && !fromPath.includes('/login')) {
          navigate(fromPath);
        } else {
          navigate(`/${userRole}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-agri-800 to-agri-600 flex items-center justify-center mx-auto text-white shadow-md shadow-agri-700/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Sign In to OFDMS
          </h2>
          <p className="text-xs text-gray-500">
            Online Fertilizer Distribution Management System for Ethiopia
          </p>
        </div>

        {/* Demo Roles Quick Selector */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
              Test Accounts (One-Click Fill)
            </span>
            <span className="text-[10px] text-agri-700 font-semibold bg-agri-50 px-2 py-0.5 rounded-full">
              Demo Ready
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {demoAccounts.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleFillDemo(acc)}
                className={`text-left p-2 rounded-lg border text-[11px] font-medium transition hover:brightness-95 ${acc.color}`}
              >
                <div className="font-bold truncate">{acc.role}</div>
                <div className="text-[9px] opacity-75 truncate">{acc.email.split('@')[0]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Login Form */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {t('common.email')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. manager@ofdms.et"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-agri-600 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-agri-700 hover:underline font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-agri-600 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm shadow-md shadow-agri-700/20 disabled:opacity-50 transition flex items-center justify-center space-x-2"
            >
              <span>{submitting ? 'Authenticating...' : t('common.login')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              New Ethiopian Farmer?{' '}
              <Link to="/register" className="font-bold text-agri-700 hover:underline ml-1">
                {t('common.register')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
