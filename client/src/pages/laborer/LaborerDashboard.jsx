import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { Truck, CheckCircle2, Clock, AlertTriangle, ArrowRight, Package } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const LaborerDashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await api.get('/distribution-orders');
        setTasks(res.data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) return <LoadingSpinner text="Loading assigned distribution tasks..." size="lg" />;

  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Mobile-First Header */}
      <div className="bg-gradient-to-r from-agri-800 to-agri-700 text-white p-6 rounded-3xl shadow-lg space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20">
          Warehouse Depot Fulfillment
        </span>
        <h1 className="text-xl sm:text-2xl font-black">Distribution Laborer Workspace</h1>
        <p className="text-xs text-agri-100">
          Verify farmer vouchers, execute physical bag handovers, and collect signed acknowledgments
        </p>
      </div>

      {/* Quick Counters */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-xs font-bold text-amber-600 flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1" /> Pending Deliveries
          </span>
          <p className="text-2xl font-black text-gray-900 mt-1">{pendingTasks.length}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-xs font-bold text-emerald-600 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Handed Over
          </span>
          <p className="text-2xl font-black text-gray-900 mt-1">{completedTasks.length}</p>
        </div>
      </div>

      {/* Action Shortcuts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Pending Farmer Pickups ({pendingTasks.length})
          </h2>
          <Link to="/laborer/tasks" className="text-xs font-bold text-agri-700 hover:underline">
            View All Tasks
          </Link>
        </div>

        {pendingTasks.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-gray-200/80 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-gray-900">All Assigned Deliveries Complete</p>
            <p className="text-[11px] text-gray-500">No pending farmer handovers at this depot.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingTasks.slice(0, 3).map((task) => (
              <div
                key={task._id}
                className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between hover:border-agri-600 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-agri-800">{task.orderNumber}</span>
                    <span className="text-xs font-bold text-gray-900">• {task.farmer?.name}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Quota: {task.authorizedDap} Qtl DAP • {task.authorizedUrea} Qtl Urea
                  </p>
                </div>
                <Link
                  to="/laborer/tasks"
                  className="px-3 py-1.5 bg-agri-700 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-agri-800 transition"
                >
                  Deliver
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2">
        <Link
          to="/laborer/stock-logs"
          className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-200 flex items-center justify-between transition"
        >
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div className="text-left">
              <p className="text-xs font-bold text-gray-900">Warehouse Incident Report</p>
              <p className="text-[11px] text-gray-500">Report torn bags or moisture discrepancies</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </Link>
      </div>
    </div>
  );
};

export default LaborerDashboard;
