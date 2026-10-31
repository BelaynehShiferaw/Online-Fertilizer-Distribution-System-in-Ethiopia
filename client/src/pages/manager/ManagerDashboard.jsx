import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import {
  Users,
  Package,
  Layers,
  FileCheck,
  Clock,
  DollarSign,
  Truck,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import LoadingSpinner from '../../components/LoadingSpinner';

const COLORS = ['#15803d', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const ManagerDashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    farmersCount: 0,
    dapStock: 0,
    ureaStock: 0,
    requestsCount: 0,
    pendingProcurementCount: 0,
    totalVerifiedIncome: 0,
    totalDistributedQuintals: 0,
    totalExpenses: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [usersRes, invRes, reqRes, procRes, finRes, distRes] = await Promise.all([
          api.get('/users?role=farmer'),
          api.get('/inventory'),
          api.get('/fertilizer-requests'),
          api.get('/procurement-requests?status=pending'),
          api.get('/financial/summary'),
          api.get('/distribution-orders'),
        ]);

        const dapProduct = invRes.data.products?.find((p) => p.code === 'DAP');
        const ureaProduct = invRes.data.products?.find((p) => p.code === 'UREA');

        const dapStock = dapProduct ? dapProduct.currentStockQuintals : 0;
        const ureaStock = ureaProduct ? ureaProduct.currentStockQuintals : 0;

        let distributedTotal = 0;
        (distRes.data.orders || []).forEach((o) => {
          distributedTotal += (o.distributedDap || 0) + (o.distributedUrea || 0);
        });

        setMetrics({
          farmersCount: usersRes.data.count || 0,
          dapStock,
          ureaStock,
          requestsCount: reqRes.data.count || 0,
          pendingProcurementCount: procRes.data.count || 0,
          totalVerifiedIncome: finRes.data.summary?.totalIncome || 0,
          totalDistributedQuintals: distributedTotal,
          totalExpenses: (finRes.data.summary?.totalExpenses || 0) + (finRes.data.summary?.totalSalaries || 0),
        });

        setChartData([
          { name: 'DAP Stock', value: dapStock },
          { name: 'Urea Stock', value: ureaStock },
          { name: 'Distributed', value: distributedTotal },
        ]);

        setRecentRequests((reqRes.data.requests || []).slice(0, 5));
      } catch (err) {
        console.error('Failed to load manager metrics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner text="Compiling national cooperative metrics..." size="lg" />;

  const statCards = [
    { label: t('manager.kpiFarmers'), value: metrics.farmersCount, icon: Users, color: 'text-emerald-700 bg-emerald-50' },
    { label: t('manager.kpiDapStock'), value: `${metrics.dapStock} Qtl`, icon: Package, color: 'text-agri-700 bg-agri-50' },
    { label: t('manager.kpiUreaStock'), value: `${metrics.ureaStock} Qtl`, icon: Layers, color: 'text-blue-700 bg-blue-50' },
    { label: t('manager.kpiRequests'), value: metrics.requestsCount, icon: FileCheck, color: 'text-indigo-700 bg-indigo-50' },
    { label: t('manager.kpiProcurements'), value: metrics.pendingProcurementCount, icon: Clock, color: 'text-amber-700 bg-amber-50' },
    { label: t('manager.kpiVerifiedIncome'), value: `${metrics.totalVerifiedIncome.toLocaleString()} ETB`, icon: DollarSign, color: 'text-teal-700 bg-teal-50' },
    { label: t('manager.kpiDistributed'), value: `${metrics.totalDistributedQuintals} Qtl`, icon: Truck, color: 'text-cyan-700 bg-cyan-50' },
    { label: 'Authorized Expenditures', value: `${metrics.totalExpenses.toLocaleString()} ETB`, icon: TrendingUp, color: 'text-rose-700 bg-rose-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            General Manager Dashboard
          </h1>
          <p className="text-xs text-gray-500">
            Strategic operations, financial solvency, pricing, and national fertilizer balance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to="/manager/procurement"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-agri-700 hover:bg-agri-800 text-white shadow-xs transition"
          >
            Review Procurements ({metrics.pendingProcurementCount})
          </Link>
          <Link
            to="/manager/prices"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 shadow-xs transition"
          >
            Manage Prices
          </Link>
        </div>
      </div>

      {/* 8 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-black text-gray-900 tracking-tight">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Stock vs Distribution Volume (Quintals)
            </h3>
            <span className="text-xs text-agri-700 font-semibold bg-agri-50 px-2 py-0.5 rounded-full">
              Live Balance
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#15803d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
              Management Modules
            </h3>
            <div className="space-y-2">
              <Link
                to="/manager/financials"
                className="p-3 rounded-xl bg-gray-50 hover:bg-agri-50/60 border border-gray-100 flex items-center justify-between transition group"
              >
                <div>
                  <p className="text-xs font-bold text-gray-900 group-hover:text-agri-800">Financial Ledger</p>
                  <p className="text-[11px] text-gray-500">Approve salaries & operational expenses</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-agri-700 transition" />
              </Link>

              <Link
                to="/manager/procurement"
                className="p-3 rounded-xl bg-gray-50 hover:bg-agri-50/60 border border-gray-100 flex items-center justify-between transition group"
              >
                <div>
                  <p className="text-xs font-bold text-gray-900 group-hover:text-agri-800">Procurement Orders</p>
                  <p className="text-[11px] text-gray-500">Consolidated demand review</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-agri-700 transition" />
              </Link>

              <Link
                to="/manager/users"
                className="p-3 rounded-xl bg-gray-50 hover:bg-agri-50/60 border border-gray-100 flex items-center justify-between transition group"
              >
                <div>
                  <p className="text-xs font-bold text-gray-900 group-hover:text-agri-800">Personnel & Roles</p>
                  <p className="text-[11px] text-gray-500">Invite or authorize cooperative staff</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-agri-700 transition" />
              </Link>

              <Link
                to="/manager/reports"
                className="p-3 rounded-xl bg-gray-50 hover:bg-agri-50/60 border border-gray-100 flex items-center justify-between transition group"
              >
                <div>
                  <p className="text-xs font-bold text-gray-900 group-hover:text-agri-800">Audit Reports</p>
                  <p className="text-[11px] text-gray-500">Printable & CSV distribution data</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-agri-700 transition" />
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 text-[11px] text-gray-400">
            System status: Real MongoDB Atlas / Local Connection Active
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
