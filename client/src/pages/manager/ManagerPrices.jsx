import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Tag, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import DataTable from '../../components/DataTable';

const ManagerPrices = () => {
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    productCode: 'DAP',
    pricePerQuintal: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/fertilizer-prices');
      setPrices(res.data.prices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const handleCreatePrice = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await api.post('/fertilizer-prices', formData);
      setMessage('New price established successfully. The Office Manager can now publish it to farmers.');
      setShowAddForm(false);
      setFormData({
        productCode: 'DAP',
        pricePerQuintal: '',
        effectiveDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
      fetchPrices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to set price');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading fertilizer price records..." size="lg" />;

  const columns = [
    {
      header: 'Product',
      accessor: 'productCode',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <span className="font-bold text-gray-900">{row.productCode}</span>
          <span className="text-xs text-gray-500">({row.product?.nameEn})</span>
        </div>
      ),
    },
    {
      header: 'Price / Quintal',
      render: (row) => (
        <span className="font-extrabold text-agri-800 text-sm">
          {row.pricePerQuintal.toLocaleString()} ETB
        </span>
      ),
    },
    {
      header: 'Effective Date',
      render: (row) => new Date(row.effectiveDate).toLocaleDateString(),
    },
    {
      header: 'Publication Status',
      render: (row) =>
        row.isPublished ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1" /> Published to Farmers
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 mr-1" /> Pending Publication
          </span>
        ),
    },
    { header: 'Set By', render: (row) => row.setBy?.name || 'Manager' },
    { header: 'Notes', accessor: 'notes' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Fertilizer Price Management</h1>
          <p className="text-xs text-gray-500">
            Set and review official subsidized prices for DAP and Urea per quintal
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center px-3.5 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-semibold text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Set New Price</span>
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Add New Price Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreatePrice}
          className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4 animate-in fade-in duration-200"
        >
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Establish Subsidized Fertilizer Price
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Fertilizer Product</label>
              <select
                value={formData.productCode}
                onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
              >
                <option value="DAP">DAP (Di-Ammonium Phosphate)</option>
                <option value="UREA">UREA (Granular 46% N)</option>
                <option value="NPS">NPS</option>
                <option value="NPSB">NPSB</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Price per Quintal (ETB)
              </label>
              <input
                type="number"
                required
                min="100"
                value={formData.pricePerQuintal}
                onChange={(e) => setFormData({ ...formData, pricePerQuintal: e.target.value })}
                placeholder="e.g. 4850"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Effective Date</label>
              <input
                type="date"
                required
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Official Notes</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Approved under Federal Agricultural Subsidy Scheme for 2026 Season"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-agri-700 rounded-xl hover:bg-agri-800 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Set Price'}
            </button>
          </div>
        </form>
      )}

      {/* Historical Price Records */}
      <DataTable
        columns={columns}
        data={prices}
        searchPlaceholder="Search price history..."
        emptyTitle="No Prices Found"
        emptyMessage="Use the button above to set the first official fertilizer price."
      />
    </div>
  );
};

export default ManagerPrices;
