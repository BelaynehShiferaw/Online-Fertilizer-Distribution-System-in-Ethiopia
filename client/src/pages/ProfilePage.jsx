import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAppLanguage } from '../context/LanguageContext';
import { CheckCircle, Lock, ShieldCheck } from 'lucide-react';

const ProfilePage = () => {
  const { user, farmerProfile, updateUserProfile } = useAuth();
  const { currentLang, changeLanguage } = useAppLanguage();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    preferredLanguage: user?.preferredLanguage || currentLang,
    region: farmerProfile?.region || 'Oromia',
    zone: farmerProfile?.zone || 'East Shewa',
    woreda: farmerProfile?.woreda || "Ada'a",
    kebele: farmerProfile?.kebele || 'Denkaka',
    village: farmerProfile?.village || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: user?.name || '',
      phone: user?.phone || '',
      preferredLanguage: user?.preferredLanguage || currentLang,
      region: farmerProfile?.region || prev.region || 'Oromia',
      zone: farmerProfile?.zone || prev.zone || 'East Shewa',
      woreda: farmerProfile?.woreda || prev.woreda || "Ada'a",
      kebele: farmerProfile?.kebele || prev.kebele || 'Denkaka',
      village: farmerProfile?.village || prev.village || '',
    }));
  }, [user, farmerProfile, currentLang]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const userRes = await api.patch('/users/me', {
        name: formData.name,
        phone: formData.phone,
        preferredLanguage: formData.preferredLanguage,
      });

      let updatedProfile = farmerProfile;
      if (user?.role === 'farmer') {
        const profRes = await api.patch('/farmers/me', {
          region: formData.region,
          zone: formData.zone,
          woreda: formData.woreda,
          kebele: formData.kebele,
          village: formData.village,
        });
        updatedProfile = profRes.data.profile;
      }

      updateUserProfile(userRes.data.user, updatedProfile);
      changeLanguage(formData.preferredLanguage);
      setMessage('Profile settings updated successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSubmitting(true);
    setPasswordMessage('');
    setPasswordError('');

    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      setPasswordSubmitting(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      setPasswordSubmitting(false);
      return;
    }

    try {
      const res = await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordMessage(res.data.message);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Account & Profile Settings</h1>
        <p className="text-xs text-gray-500">
          Manage your contact details, role information, language preferences, and account security.
        </p>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-agri-100 text-agri-800 font-bold flex items-center justify-center text-lg">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{user?.name}</h3>
            <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded-full bg-agri-100/70 text-agri-800">
              {user?.role?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Preferred Language</label>
            <select
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
            >
              <option value="en">English</option>
              <option value="am">አማርኛ (Amharic)</option>
            </select>
          </div>

          {user?.role === 'farmer' && (
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <span className="text-xs font-bold text-agri-800 uppercase tracking-wider block">
                Administrative Location (Ethiopia)
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Region</label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Zone</label>
                  <input
                    type="text"
                    name="zone"
                    value={formData.zone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Woreda</label>
                  <input
                    type="text"
                    name="woreda"
                    value={formData.woreda}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Kebele</label>
                  <input
                    type="text"
                    name="kebele"
                    value={formData.kebele}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Village</label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-gray-100">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs rounded-xl shadow-md shadow-agri-700/20 disabled:opacity-50 transition"
          >
            {submitting ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>
      </form>

      <form onSubmit={handlePasswordSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900">Change Password</h2>
            <p className="text-[11px] text-gray-500">Update your password to keep your account secure.</p>
          </div>
        </div>

        {passwordMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{passwordMessage}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {passwordError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-gray-100">
          <button
            type="submit"
            disabled={passwordSubmitting}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md shadow-slate-900/20 disabled:opacity-50 transition"
          >
            {passwordSubmitting ? 'Changing Password...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
