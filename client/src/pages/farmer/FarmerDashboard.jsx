import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Sprout,
  Plus,
  FilePlus,
  ClipboardList,
  Receipt,
  Truck,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

const FarmerDashboard = () => {
  const { t } = useTranslation();
  const { user, farmerProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [plots, setPlots] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchFarmerData = async () => {
      try {
        setLoading(true);
        const [reqRes, plotRes, orderRes] = await Promise.all([
          api.get('/fertilizer-requests'),
          api.get('/plots'),
          api.get('/distribution-orders'),
        ]);
        setRequests(reqRes.data.requests || []);
        setPlots(plotRes.data.plots || []);
        setOrders(orderRes.data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmerData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading farmer portal..." size="lg" />;

  const activeRequests = requests.filter((r) => r.status !== 'completed' && r.status !== 'rejected');
  const readyForPickupOrders = orders.filter((o) => o.status === 'pending');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Farmer Identity Card */}
      <div className="bg-gradient-to-r from-agri-900 via-agri-800 to-agri-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-agri-200">
            <Sprout className="w-4 h-4 text-ethiopia-yellow" />
            <span>Farmer ID: {farmerProfile?.farmerId || 'ETH-FARM-2026'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user?.name}</h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-agri-100">
            <span className="flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {farmerProfile?.region || 'Oromia'}, {farmerProfile?.woreda || 'Ada\'a'}, {farmerProfile?.kebele || 'Denkaka'}
            </span>
            <span>•</span>
            <span>Total Cultivated: {farmerProfile?.totalCultivatedHectares || 0} ha</span>
            <span>•</span>
            <span>Plots: {plots.length}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
          <Link
            to="/farmer/requests/new"
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-agri-500 hover:bg-agri-400 text-agri-950 font-bold text-xs shadow-lg shadow-agri-500/20 transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>{t('farmer.requestTitle')}</span>
          </Link>
          <Link
            to="/farmer/plots"
            className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-white/15 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition"
          >
            <span>{t('farmer.addPlot')}</span>
          </Link>
        </div>
      </div>

      {/* Pickup Alert if Ready */}
      {readyForPickupOrders.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-agri-600 text-white shadow-md flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Truck className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold text-sm">Fertilizer Ready for Pickup!</p>
              <p className="text-xs text-emerald-100">
                You have {readyForPickupOrders.length} order(s) waiting for collection at the cooperative warehouse.
              </p>
            </div>
          </div>
          <Link
            to="/farmer/orders"
            className="px-4 py-1.5 bg-white text-agri-900 rounded-xl text-xs font-bold shrink-0 hover:bg-emerald-50 transition"
          >
            View Voucher
          </Link>
        </div>
      )}

      {/* Overview Metric Panels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase">My Plots</span>
          <p className="text-2xl font-black text-gray-900 mt-1">{plots.length}</p>
          <p className="text-[10px] text-gray-400 mt-1">Cultivated Land</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase">Active Requests</span>
          <p className="text-2xl font-black text-agri-700 mt-1">{activeRequests.length}</p>
          <p className="text-[10px] text-gray-400 mt-1">In Processing Pipeline</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase">Pickup Vouchers</span>
          <p className="text-2xl font-black text-blue-700 mt-1">{readyForPickupOrders.length}</p>
          <p className="text-[10px] text-gray-400 mt-1">Ready at Depot</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase">Completed Orders</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {orders.filter((o) => o.status === 'completed').length}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">Harvest Fertilized</p>
        </div>
      </div>

      {/* Active Requests List */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Active Fertilizer Requests Status
          </h2>
          <Link to="/farmer/requests" className="text-xs font-bold text-agri-700 hover:underline">
            View All ({requests.length})
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            You haven't submitted any fertilizer requests yet. Click "Submit Fertilizer Requirement" above to begin.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.slice(0, 4).map((req) => (
              <div
                key={req._id}
                className="p-4 rounded-xl border border-gray-100 hover:border-agri-300 bg-gray-50/50 hover:bg-agri-50/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-agri-800">#{req.requestNumber}</span>
                    <span className="text-xs font-bold text-gray-900">• {req.crop?.nameEn} ({req.cultivatedArea} ha)</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Requested: {req.requestedDap} Qtl DAP • {req.requestedUrea} Qtl Urea
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <StatusBadge status={req.status} />
                  <Link
                    to="/farmer/requests"
                    className="p-1.5 text-gray-400 hover:text-agri-700 transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
