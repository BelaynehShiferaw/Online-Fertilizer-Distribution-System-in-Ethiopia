import React, { useState } from 'react';
import api from '../../services/api';
import { BellRing, Send, CheckCircle, Globe } from 'lucide-react';

const OfficeAnnouncements = () => {
  const [formData, setFormData] = useState({
    targetRole: 'farmer',
    titleEn: '',
    titleAm: '',
    messageEn: '',
    messageAm: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    try {
      const res = await api.post('/notifications/announcement', formData);
      setSuccessMsg(res.data.message || 'Bilingual announcement broadcast successfully!');
      setFormData({
        targetRole: 'farmer',
        titleEn: '',
        titleAm: '',
        messageEn: '',
        messageAm: '',
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to broadcast announcement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Bilingual System Announcements</h1>
        <p className="text-xs text-gray-500">
          Broadcast official cooperative notices, price announcements, or pickup schedules in English and Amharic
        </p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleBroadcast} className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Target Audience
          </label>
          <select
            value={formData.targetRole}
            onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
          >
            <option value="farmer">All Registered Farmers</option>
            <option value="laborer">Warehouse Laborers</option>
            <option value="agricultural_expert">Agricultural Experts</option>
          </select>
        </div>

        {/* English Section */}
        <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-3">
          <span className="text-xs font-bold text-agri-800 flex items-center">
            <Globe className="w-3.5 h-3.5 mr-1" /> English Announcement
          </span>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Title (EN)</label>
            <input
              type="text"
              required
              value={formData.titleEn}
              onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
              placeholder="e.g. Scheduled Warehouse Hours for Meher DAP Distribution"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-hidden focus:ring-1 focus:ring-agri-600"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Message (EN)</label>
            <textarea
              rows="3"
              required
              value={formData.messageEn}
              onChange={(e) => setFormData({ ...formData, messageEn: e.target.value })}
              placeholder="e.g. Please bring your payment receipt and farmer national ID card to the depot between 8:00 AM and 5:00 PM."
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-hidden focus:ring-1 focus:ring-agri-600"
            />
          </div>
        </div>

        {/* Amharic Section */}
        <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100/60 space-y-3 font-ethiopic">
          <span className="text-xs font-bold text-emerald-800 flex items-center">
            <Globe className="w-3.5 h-3.5 mr-1" /> የአማርኛ ማስታወቂያ
          </span>

          <div>
            <label className="block text-xs text-gray-600 mb-1">አርዕስት (አማርኛ)</label>
            <input
              type="text"
              required
              value={formData.titleAm}
              onChange={(e) => setFormData({ ...formData, titleAm: e.target.value })}
              placeholder="ለምሳሌ፡ የመኸር ወቅት ዳፕ ማዳበሪያ መረከቢያ ሰዓት ማስታወቂያ"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-hidden focus:ring-1 focus:ring-agri-600"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">መልዕክት (አማርኛ)</label>
            <textarea
              rows="3"
              required
              value={formData.messageAm}
              onChange={(e) => setFormData({ ...formData, messageAm: e.target.value })}
              placeholder="ለምሳሌ፡ እባክዎን የከፈሉበትን ደረሰኝ እና የታደሰ የቀበሌ መታወቂያ በመያዝ ከጠዋቱ 2:00 እስከ ቀኑ 11:00 ድረስ በመጋዘኑ ይረከቡ።"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-hidden focus:ring-1 focus:ring-agri-600"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs shadow-md shadow-agri-700/20 disabled:opacity-50 transition"
          >
            <Send className="w-4 h-4 mr-1.5" />
            <span>{submitting ? 'Broadcasting...' : 'Broadcast Announcement'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfficeAnnouncements;
