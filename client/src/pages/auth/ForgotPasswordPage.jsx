import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, Send } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [devToken, setDevToken] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setDevToken('');
    setSubmitting(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      if (res.data.devToken) {
        setDevToken(res.data.devToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit password recovery request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Reset Password
          </h2>
          <p className="text-xs text-gray-500">
            Enter your registered email address to receive password reset instructions.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs">
          {message && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
              {devToken && (
                <div className="p-2 bg-white rounded border border-emerald-300">
                  <span className="font-bold">Dev Recovery Link: </span>
                  <Link
                    to={`/reset-password?token=${devToken}`}
                    className="text-agri-700 underline font-mono break-all"
                  >
                    Click here to reset with token
                  </Link>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. farmer@ofdms.et"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-agri-600 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm shadow-md shadow-agri-700/20 disabled:opacity-50 transition flex items-center justify-center space-x-2"
            >
              <span>{submitting ? 'Sending Request...' : 'Send Recovery Instructions'}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-xs font-bold text-gray-600 hover:text-agri-700"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
