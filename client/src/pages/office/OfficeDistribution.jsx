import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Truck, Plus, CheckCircle, Clock, AlertCircle, UserCheck } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

const OfficeDistribution = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [eligibleRequests, setEligibleRequests] = useState([]);
  const [laborers, setLaborers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    requestId: '',
    laborerId: '',
    distributionLocation: 'Ada\'a Woreda Central Fertilizer Depot',
    scheduledDate: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orderRes, reqRes, userRes] = await Promise.all([
        api.get('/distribution-orders'),
        api.get('/fertilizer-requests?status=ready_for_distribution'),
        api.get('/users?role=laborer'),
      ]);
      setOrders(orderRes.data.orders || []);
      setEligibleRequests(reqRes.data.requests || []);
      setLaborers(userRes.data.users || []);

      if (reqRes.data.requests?.length > 0) {
        setFormData((prev) => ({
          ...prev,
          requestId: reqRes.data.requests[0]._id,
          laborerId: userRes.data.users?.[0]?._id || '',
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const res = await api.post('/distribution-orders', formData);
      setMessage(`Distribution order ${res.data.order?.orderNumber} created and assigned to warehouse laborer.`);
      setShowCreateModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create distribution order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading distribution orders..." size="lg" />;

  const columns = [
    { header: 'Order #', accessor: 'orderNumber', render: (row) => <span className="font-mono font-bold">{row.orderNumber}</span> },
    { header: 'Farmer', render: (row) => row.farmer?.name || 'Farmer' },
    { header: 'Assigned Laborer', render: (row) => <span className="font-semibold">{row.assignedLaborer?.name || 'Laborer'}</span> },
    { header: 'Authorized DAP', render: (row) => `${row.authorizedDap} Qtl` },
    { header: 'Authorized Urea', render: (row) => `${row.authorizedUrea} Qtl` },
    { header: 'Depot Location', accessor: 'distributionLocation' },
    { header: 'Scheduled Date', render: (row) => new Date(row.scheduledDate).toLocaleDateString() },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Fertilizer Distribution Dispatch</h1>
          <p className="text-xs text-gray-500">
            Dispatch pickup orders for verified farmers to warehouse laborers with scheduled collection dates
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={eligibleRequests.length === 0}
          className="inline-flex items-center px-4 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-semibold text-xs shadow-xs disabled:opacity-50 transition"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Dispatch New Order ({eligibleRequests.length} Ready)</span>
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Dispatch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-1">Dispatch Fertilizer Distribution Order</h3>
            <p className="text-xs text-gray-500 mb-4">
              Assign an approved farmer to a warehouse laborer for pickup fulfillment.
            </p>

            <form onSubmit={handleCreateOrder} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Select Verified Farmer Request
                </label>
                <select
                  required
                  value={formData.requestId}
                  onChange={(e) => setFormData({ ...formData, requestId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
                >
                  {eligibleRequests.map((r) => (
                    <option key={r._id} value={r._id}>
                      #{r.requestNumber} - {r.farmer?.name} ({r.approvedDap} Qtl DAP, {r.approvedUrea} Qtl Urea)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Assign Distribution Laborer
                </label>
                <select
                  required
                  value={formData.laborerId}
                  onChange={(e) => setFormData({ ...formData, laborerId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
                >
                  {laborers.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.name} ({l.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Distribution Depot</label>
                  <input
                    type="text"
                    required
                    value={formData.distributionLocation}
                    onChange={(e) => setFormData({ ...formData, distributionLocation: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-agri-700 rounded-xl hover:bg-agri-800 disabled:opacity-50"
                >
                  {submitting ? 'Dispatching...' : 'Confirm Dispatch Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={orders}
        searchPlaceholder="Search distribution orders by order # or farmer..."
        emptyTitle="No Distribution Orders"
        emptyMessage="Distribution orders dispatched to laborers will appear here."
      />
    </div>
  );
};

export default OfficeDistribution;
