import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Truck, CheckCircle2, User, Phone, MapPin, Check, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

const LaborerTasks = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [distributedDap, setDistributedDap] = useState('');
  const [distributedUrea, setDistributedUrea] = useState('');
  const [farmerAcknowledgmentSigned, setFarmerAcknowledgmentSigned] = useState(false);
  const [farmerSignatureName, setFarmerSignatureName] = useState('');
  const [laborerNotes, setLaborerNotes] = useState('');
  const [damagedBags, setDamagedBags] = useState('0');

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const openFulfillment = (order) => {
    setSelectedOrder(order);
    setDistributedDap(order.authorizedDap);
    setDistributedUrea(order.authorizedUrea);
    setFarmerAcknowledgmentSigned(false);
    setFarmerSignatureName(order.farmer?.name || '');
    setLaborerNotes('');
    setDamagedBags('0');
    setError('');
  };

  const handleCompleteDistribution = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    if (!farmerAcknowledgmentSigned) {
      return setError('Farmer signature / acknowledgment is required to release physical fertilizer bags.');
    }

    if (Number(distributedDap) > selectedOrder.authorizedDap || Number(distributedUrea) > selectedOrder.authorizedUrea) {
      return setError('Cannot distribute more fertilizer than authorized in the order voucher.');
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      await api.post(`/distribution-orders/${selectedOrder._id}/complete`, {
        distributedDap: Number(distributedDap),
        distributedUrea: Number(distributedUrea),
        farmerAcknowledgmentSigned: true,
        farmerSignatureName,
        laborerNotes,
        damagedBagsReported: Number(damagedBags),
      });

      setMessage(`Order #${selectedOrder.orderNumber} successfully fulfilled! Inventory deducted and farmer notified.`);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Fulfillment submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading assigned delivery vouchers..." size="lg" />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Warehouse Delivery Execution</h1>
        <p className="text-xs text-gray-500">
          Verify farmer vouchers, execute physical bag handovers, and collect signed acknowledgments
        </p>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-3">
        {orders.map((order) => {
          const isPending = order.status === 'pending' || order.status === 'in_progress';
          return (
            <div
              key={order._id}
              className={`p-5 rounded-2xl bg-white border transition shadow-xs ${
                isPending ? 'border-agri-600/30 ring-1 ring-agri-600/10' : 'border-gray-200 opacity-90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-agri-100 text-agri-800 font-bold flex items-center justify-center text-xs">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-xs text-gray-500">#{order.orderNumber}</span>
                    <h3 className="font-bold text-gray-900 text-sm">{order.farmer?.name}</h3>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <StatusBadge status={order.status} />
                  {isPending && (
                    <button
                      type="button"
                      onClick={() => openFulfillment(order)}
                      className="px-4 py-2 bg-agri-700 hover:bg-agri-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
                    >
                      Execute Handover
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
                <div>
                  <span className="text-gray-400 block">Farmer Contact</span>
                  <span className="font-semibold text-gray-700">{order.farmer?.phone}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Authorized DAP</span>
                  <span className="font-bold text-agri-800">{order.authorizedDap} Quintals</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Authorized Urea</span>
                  <span className="font-bold text-blue-800">{order.authorizedUrea} Quintals</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Fulfillment Date</span>
                  <span className="font-medium text-gray-700">
                    {order.distributionDate ? new Date(order.distributionDate).toLocaleDateString() : 'Scheduled'}
                  </span>
                </div>
              </div>

              {order.farmerAcknowledgmentSigned && (
                <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-emerald-800 flex items-center space-x-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Farmer Acknowledgment Endorsed by: {order.farmerSignatureName}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Handover Fulfillment Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <span className="text-xs font-mono text-agri-700 font-bold">#{selectedOrder.orderNumber}</span>
              <h3 className="text-base font-black text-gray-900">
                Confirm Physical Fertilizer Handover
              </h3>
              <p className="text-xs text-gray-500">
                Farmer: {selectedOrder.farmer?.name} ({selectedOrder.farmer?.phone})
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCompleteDistribution} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Actual DAP Handed Over (Qtl)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    max={selectedOrder.authorizedDap}
                    value={distributedDap}
                    onChange={(e) => setDistributedDap(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white"
                  />
                  <span className="text-[10px] text-gray-400">Max: {selectedOrder.authorizedDap} Qtl</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Actual Urea Handed Over (Qtl)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    max={selectedOrder.authorizedUrea}
                    value={distributedUrea}
                    onChange={(e) => setDistributedUrea(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white"
                  />
                  <span className="text-[10px] text-gray-400">Max: {selectedOrder.authorizedUrea} Qtl</span>
                </div>
              </div>

              {/* Farmer Digital Endorsement */}
              <div className="p-4 bg-agri-50/50 rounded-xl border border-agri-200 space-y-3">
                <span className="text-xs font-bold text-agri-900 block">
                  Farmer Acknowledgment & Identity Endorsement
                </span>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Receiver Name / Representative</label>
                  <input
                    type="text"
                    required
                    value={farmerSignatureName}
                    onChange={(e) => setFarmerSignatureName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white"
                  />
                </div>

                <label className="flex items-start space-x-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={farmerAcknowledgmentSigned}
                    onChange={(e) => setFarmerAcknowledgmentSigned(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-agri-700 rounded border-gray-300 focus:ring-agri-600"
                  />
                  <span className="text-xs text-gray-700 leading-tight">
                    I confirm that the farmer received the specified bags in good physical condition and signed the delivery voucher.
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Laborer Handover Notes</label>
                <input
                  type="text"
                  value={laborerNotes}
                  onChange={(e) => setLaborerNotes(e.target.value)}
                  placeholder="e.g. Loaded onto farmer's Isuzu truck, batch #ET-2026-9"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-agri-700 rounded-xl hover:bg-agri-800 disabled:opacity-50 shadow-md shadow-agri-700/20"
                >
                  {submitting ? 'Confirming Handover...' : 'Finalize Handover & Deduct Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaborerTasks;
