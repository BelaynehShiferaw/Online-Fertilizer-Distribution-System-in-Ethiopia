import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import {
  PackageCheck,
  Receipt,
  Truck,
  ShoppingBag,
  BellRing,
  Tag,
  ArrowRight,
  Clock,
  CheckCircle,
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const OfficeDashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    pendingPaymentsCount: 0,
    readyToDistributeCount: 0,
    dapStock: 0,
    ureaStock: 0,
    consolidatedDemandDap: 0,
    consolidatedDemandUrea: 0,
    completedDistributionsCount: 0,
  });

  useEffect(() => {
    const fetchOfficeData = async () => {
      try {
        setLoading(true);
        const [payRes, distRes, invRes, demandRes] = await Promise.all([
          api.get('/payments?status=pending'),
          api.get('/distribution-orders'),
          api.get('/inventory'),
          api.get('/procurement-requests/consolidated-demand'),
        ]);

        const dapProduct = invRes.data.products?.find((p) => p.code === 'DAP');
        const ureaProduct = invRes.data.products?.find((p) => p.code === 'UREA');

        const completedOrders = (distRes.data.orders || []).filter((o) => o.status === 'completed').length;
        const pendingOrders = (distRes.data.orders || []).filter((o) => o.status === 'pending').length;

        setKpis({
          pendingPaymentsCount: payRes.data.count || 0,
          readyToDistributeCount: pendingOrders,
          dapStock: dapProduct ? dapProduct.currentStockQuintals : 0,
          ureaStock: ureaProduct ? ureaProduct.currentStockQuintals : 0,
          consolidatedDemandDap: demandRes.data.totalDapQuintals || 0,
          consolidatedDemandUrea: demandRes.data.totalUreaQuintals || 0,
          completedDistributionsCount: completedOrders,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOfficeData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading office operational metrics..." size="lg" />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Office Manager Operations Desk</h1>
          <p className="text-xs text-gray-500">
            Cooperative demand consolidation, payment slip validation, stock receiving, and distribution dispatch
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to="/office/payments"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-agri-700 hover:bg-agri-800 text-white shadow-xs transition"
          >
            Verify Receipts ({kpis.pendingPaymentsCount})
          </Link>
          <Link
            to="/office/inventory"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 shadow-xs transition"
          >
            Receive Shipment
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase">Pending Receipts</span>
          <p className="text-2xl font-black text-orange-600 mt-1">{kpis.pendingPaymentsCount}</p>
          <p className="text-[10px] text-gray-400 mt-1">Requires bank reference matching</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase">DAP Warehouse Stock</span>
          <p className="text-2xl font-black text-agri-700 mt-1">{kpis.dapStock} Qtl</p>
          <p className="text-[10px] text-gray-400 mt-1">Physical inventory in depot</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase">Urea Warehouse Stock</span>
          <p className="text-2xl font-black text-blue-700 mt-1">{kpis.ureaStock} Qtl</p>
          <p className="text-[10px] text-gray-400 mt-1">Physical inventory in depot</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase">Completed Pickups</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{kpis.completedDistributionsCount}</p>
          <p className="text-[10px] text-gray-400 mt-1">Signed farmer receipts</p>
        </div>
      </div>

      {/* Main Operational Hub Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Payment Verification Desk */}
        <div className="p-6 bg-white rounded-2xl border border-gray-200/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Payment Verification Desk</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Inspect uploaded bank transfer and Telebirr receipts against farmer identity and requested fertilizer volume. Prevent duplicate slips.
            </p>
          </div>
          <Link
            to="/office/payments"
            className="inline-flex items-center text-xs font-bold text-agri-700 hover:text-agri-800 pt-2"
          >
            <span>Review Pending Payments</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Card 2: Consolidation & Procurement */}
        <div className="p-6 bg-white rounded-2xl border border-gray-200/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Farmer Demand Consolidation</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Consolidate expert-approved requests: {kpis.consolidatedDemandDap} Qtl DAP and {kpis.consolidatedDemandUrea} Qtl Urea. Submit procurement request to Manager.
            </p>
          </div>
          <Link
            to="/office/consolidation"
            className="inline-flex items-center text-xs font-bold text-agri-700 hover:text-agri-800 pt-2"
          >
            <span>Calculate Bulk Demand</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Card 3: Distribution Dispatching */}
        <div className="p-6 bg-white rounded-2xl border border-gray-200/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Warehouse Distribution Dispatch</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Create distribution orders for farmers with verified payments. Assign orders to depot laborers and track handover progress.
            </p>
          </div>
          <Link
            to="/office/distribution"
            className="inline-flex items-center text-xs font-bold text-agri-700 hover:text-agri-800 pt-2"
          >
            <span>Dispatch Distribution Orders</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OfficeDashboard;
