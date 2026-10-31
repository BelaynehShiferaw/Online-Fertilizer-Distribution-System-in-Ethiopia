import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { AlertTriangle, CheckCircle, Package } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const LaborerStockLog = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    productCode: 'DAP',
    quantityQuintals: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory');
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await api.post('/inventory/damage', formData);
      setMessage('Incident report submitted and stock adjustment ledger logged.');
      setFormData({ productCode: 'DAP', quantityQuintals: '', reason: '' });
      fetchStock();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Checking depot stock..." size="lg" />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Depot Incident & Loss Reporting</h1>
        <p className="text-xs text-gray-500">
          Report damaged bags, moisture loss, or physical discrepancies to ensure accurate stock ledger balance
        </p>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Stock Cards */}
      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <div key={p._id} className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
            <span className="text-xs font-bold text-gray-500">{p.code} In Depot</span>
            <p className="text-2xl font-black text-gray-900 mt-1">{p.currentStockQuintals} Qtl</p>
            <p className="text-[10px] text-gray-400 mt-1">Available: {p.availableStockQuintals} Qtl</p>
          </div>
        ))}
      </div>

      {/* Report Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
          <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-600" />
          <span>Submit Warehouse Incident Report</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Fertilizer Product</label>
            <select
              value={formData.productCode}
              onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
            >
              <option value="DAP">DAP</option>
              <option value="UREA">UREA</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Damaged Quantity (Qtl)</label>
            <input
              type="number"
              step="0.5"
              required
              min="0.5"
              value={formData.quantityQuintals}
              onChange={(e) => setFormData({ ...formData, quantityQuintals: e.target.value })}
              placeholder="e.g. 1.0 (2 bags)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Incident Description & Cause
          </label>
          <textarea
            rows="3"
            required
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="e.g. Bag burst during forklift transit; contents unusable."
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 transition"
        >
          {submitting ? 'Submitting Report...' : 'Log Damaged Stock'}
        </button>
      </form>
    </div>
  );
};

export default LaborerStockLog;
