import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Sprout, User, Phone, Mail, Lock, MapPin, AlertCircle, ArrowRight } from 'lucide-react';

const ethiopianRegions = [
  'Oromia',
  'Amhara',
  'Sidama',
  'Tigray',
  'Central Ethiopia',
  'South Ethiopia',
  'South West Ethiopia',
  'Somali',
  'Afar',
  'Benishangul-Gumuz',
  'Gambella',
  'Harari',
  'Addis Ababa City Admin',
  'Dire Dawa City Admin',
];

const RegisterPage = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    preferredLanguage: 'am',
    region: 'Oromia',
    zone: 'East Shewa',
    woreda: 'Ada\'a',
    kebele: 'Denkaka',
    village: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match. Please verify your password confirmation.');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    setSubmitting(true);

    try {
      const res = await register(formData);
      if (res.success) {
        navigate('/farmer');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please review your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-agri-800 to-agri-600 flex items-center justify-center mx-auto text-white shadow-md shadow-agri-700/20">
            <Sprout className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Register as an Ethiopian Farmer
          </h2>
          <p className="text-xs text-gray-500">
            Create your digital farmer profile to request and receive subsidized DAP & Urea
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Kebede Wolde"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-agri-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+251 91 123 4567"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-agri-600 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. farmer@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-agri-600 focus:border-transparent"
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-agri-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-type password"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-agri-600 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Administrative Hierarchy */}
            <div className="pt-2 border-t border-gray-100">
              <span className="text-[11px] font-bold text-agri-700 uppercase tracking-wider block mb-2">
                Agricultural Location (Ethiopia)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Region (ክልል)</label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-agri-600"
                  >
                    {ethiopianRegions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Zone (ዞን)</label>
                  <input
                    type="text"
                    name="zone"
                    required
                    value={formData.zone}
                    onChange={handleChange}
                    placeholder="e.g. East Shewa"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-agri-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Woreda (ወረዳ)</label>
                  <input
                    type="text"
                    name="woreda"
                    required
                    value={formData.woreda}
                    onChange={handleChange}
                    placeholder="e.g. Ada'a"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-agri-600"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Kebele (ቀበሌ)</label>
                  <input
                    type="text"
                    name="kebele"
                    required
                    value={formData.kebele}
                    onChange={handleChange}
                    placeholder="e.g. Denkaka"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-agri-600"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Village (መንደር)</label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-agri-600"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm shadow-md shadow-agri-700/20 disabled:opacity-50 transition flex items-center justify-center space-x-2 mt-4"
            >
              <span>{submitting ? 'Registering...' : 'Complete Farmer Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-agri-700 hover:underline ml-1">
                {t('common.login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
