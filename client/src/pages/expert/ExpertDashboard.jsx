import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { ClipboardList, CheckCircle, XCircle, AlertCircle, Sliders, BookOpen, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const ExpertDashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    changesRequested: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/fertilizer-requests');
        const reqs = res.data.requests || [];
        setCounts({
          pendingReview: reqs.filter((r) => r.status === 'submitted' || r.status === 'under_agricultural_review').length,
          approved: reqs.filter((r) => r.status === 'approved' || r.status === 'awaiting_payment').length,
          rejected: reqs.filter((r) => r.status === 'rejected').length,
          changesRequested: reqs.filter((r) => r.status === 'changes_requested').length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner text="Loading agronomic review queue..." size="lg" />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Agricultural Expert Agronomy Portal</h1>
          <p className="text-xs text-gray-500">
            Scientific request evaluations, crop-soil quota authorizations, and farmer application guidelines
          </p>
        </div>
        <Link
          to="/expert/reviews"
          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-agri-700 hover:bg-agri-800 text-white shadow-xs transition"
        >
          Review Pending Requests ({counts.pendingReview})
        </Link>
      </div>

      {/* Review Queue Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase">Pending Review</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{counts.pendingReview}</p>
          <p className="text-[10px] text-gray-400 mt-1">Awaiting agronomic inspection</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase">Approved Quotas</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{counts.approved}</p>
          <p className="text-[10px] text-gray-400 mt-1">Authorized for payment</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase">Changes Requested</span>
          <p className="text-2xl font-black text-orange-600 mt-1">{counts.changesRequested}</p>
          <p className="text-[10px] text-gray-400 mt-1">Returned for land/crop adjustments</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase">Rejected Requests</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{counts.rejected}</p>
          <p className="text-[10px] text-gray-400 mt-1">With documented explanations</p>
        </div>
      </div>

      {/* Modules Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-gray-200/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Agronomic Request Queue</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Review plot coordinates, soil type, crop requirements, and approve or adjust DAP and Urea quotas.
            </p>
          </div>
          <Link
            to="/expert/reviews"
            className="inline-flex items-center text-xs font-bold text-agri-700 hover:text-agri-800 pt-2"
          >
            <span>Open Review Queue</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-200/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Configurable Crop Rates</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Adjust baseline DAP and Urea quintal application rates per hectare for Teff, Maize, Wheat, and Barley.
            </p>
          </div>
          <Link
            to="/expert/recommendations"
            className="inline-flex items-center text-xs font-bold text-agri-700 hover:text-agri-800 pt-2"
          >
            <span>Configure Standards</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-200/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Fertilizer Advisory Hub</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Publish agronomic guidelines for DAP basal application and Urea split dressing in English and Amharic.
            </p>
          </div>
          <Link
            to="/expert/advisory"
            className="inline-flex items-center text-xs font-bold text-agri-700 hover:text-agri-800 pt-2"
          >
            <span>Publish Guidelines</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ExpertDashboard;
