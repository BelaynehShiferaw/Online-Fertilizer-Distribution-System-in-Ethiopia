import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Truck, CheckCircle2, MapPin, Calendar, User, Printer } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

const FarmerOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/distribution-orders');
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <LoadingSpinner text="Loading fertilizer pickup vouchers..." size="lg" />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Depot Pickup Vouchers</h1>
        <p className="text-xs text-gray-500">
          Present these verified collection vouchers to the assigned warehouse laborer at the distribution center
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-gray-200/80 text-center space-y-2">
          <Truck className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="font-bold text-gray-900 text-sm">No Active Pickup Vouchers</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Once your payment receipt is verified by the Office Manager, your distribution pickup order will be issued here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="p-6 bg-white rounded-3xl border border-gray-200/80 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Official Pickup Voucher
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-black text-gray-900">Order #{order.orderNumber}</span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 self-start sm:self-auto"
                >
                  <Printer className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  <span>Print Voucher</span>
                </button>
              </div>

              {/* Allocation Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50/70 rounded-2xl text-xs">
                <div>
                  <span className="text-gray-400 block">Authorized DAP</span>
                  <span className="text-sm font-bold text-agri-800">{order.authorizedDap} Quintals</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Authorized Urea</span>
                  <span className="text-sm font-bold text-blue-800">{order.authorizedUrea} Quintals</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Scheduled Date</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(order.scheduledDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Assigned Laborer</span>
                  <span className="font-semibold text-gray-800">{order.assignedLaborer?.name || 'Staff'}</span>
                </div>
              </div>

              {/* Depot Location */}
              <div className="flex items-start space-x-2 text-xs text-gray-600 bg-agri-50/40 p-3 rounded-xl border border-agri-100">
                <MapPin className="w-4 h-4 text-agri-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-agri-900 block">Collection Depot:</span>
                  <span>{order.distributionLocation}</span>
                </div>
              </div>

              {order.status === 'completed' && (
                <div className="p-3 bg-emerald-50 rounded-xl text-xs font-semibold text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Successfully collected on {new Date(order.distributionDate).toLocaleDateString()}. Signed by: {order.farmerSignatureName}.
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerOrders;
