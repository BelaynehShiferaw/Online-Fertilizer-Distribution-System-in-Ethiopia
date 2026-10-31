import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PackageCheck, Plus, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import DataTable from '../../components/DataTable';

const OfficeInventory = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showDamageModal, setShowDamageModal] = useState(false);

  // Form states
  const [shipmentData, setShipmentData] = useState({
    productCode: 'DAP',
    quantityQuintals: '',
    purchaseCostPerQuintal: '',
    supplier: 'Ethiopian Agricultural Businesses Corporation (EABC)',
    referenceId: '',
    notes: '',
  });

  const [damageData, setDamageData] = useState({
    productCode: 'DAP',
    quantityQuintals: '',
    reason: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [invRes, txnRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/inventory/transactions'),
      ]);
      setProducts(invRes.data.products || []);
      setTransactions(txnRes.data.transactions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleReceiveShipment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await api.post('/inventory/receipts', shipmentData);
      setMessage(`Shipment of ${shipmentData.quantityQuintals} Qtl ${shipmentData.productCode} registered in warehouse ledger.`);
      setShowShipmentModal(false);
      setShipmentData({
        productCode: 'DAP',
        quantityQuintals: '',
        purchaseCostPerQuintal: '',
        supplier: 'Ethiopian Agricultural Businesses Corporation (EABC)',
        referenceId: '',
        notes: '',
      });
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record shipment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportDamage = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await api.post('/inventory/damage', damageData);
      setMessage(`Damaged stock adjustment of ${damageData.quantityQuintals} Qtl recorded.`);
      setShowDamageModal(false);
      setDamageData({
        productCode: 'DAP',
        quantityQuintals: '',
        reason: '',
      });
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record damaged stock');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading inventory ledger..." size="lg" />;

  const columns = [
    { header: 'Txn #', accessor: 'transactionNumber', render: (row) => <span className="font-mono font-medium">{row.transactionNumber}</span> },
    { header: 'Product', accessor: 'productCode', render: (row) => <span className="font-bold">{row.productCode}</span> },
    {
      header: 'Type',
      render: (row) => (
        <span
          className={`capitalize text-xs font-semibold px-2 py-0.5 rounded-full ${
            row.transactionType.includes('received')
              ? 'bg-emerald-50 text-emerald-800'
              : row.transactionType.includes('damage')
              ? 'bg-rose-50 text-rose-800'
              : 'bg-blue-50 text-blue-800'
          }`}
        >
          {row.transactionType.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      header: 'Quantity',
      render: (row) => (
        <span className={`font-bold ${row.quantityQuintals > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
          {row.quantityQuintals > 0 ? `+${row.quantityQuintals}` : row.quantityQuintals} Qtl
        </span>
      ),
    },
    { header: 'Prev Balance', render: (row) => `${row.previousStockBalance} Qtl` },
    { header: 'New Balance', render: (row) => <span className="font-bold">{row.newStockBalance} Qtl</span> },
    { header: 'Reference', render: (row) => row.referenceId || 'N/A' },
    { header: 'Date', render: (row) => new Date(row.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Warehouse Receiving & Stock Ledger</h1>
          <p className="text-xs text-gray-500">
            Maintain an immutable audit trail of incoming shipments, physical balances, and loss adjustments
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDamageModal(true)}
            className="inline-flex items-center px-3 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-xs shadow-xs transition"
          >
            <AlertTriangle className="w-4 h-4 mr-1.5" />
            <span>Report Damage / Loss</span>
          </button>
          <button
            onClick={() => setShowShipmentModal(true)}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-semibold text-xs shadow-xs transition"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Receive Inbound Shipment</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Live Physical Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((p) => {
          const available = Math.max(0, p.currentStockQuintals - p.reservedQuintals);
          return (
            <div key={p._id} className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-base text-gray-900">{p.code}</span>
                  <p className="text-xs text-gray-500">{p.nameEn}</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-agri-50 text-agri-800 rounded-full border border-agri-200">
                  {available} Qtl Available
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400">Physical Stock in Depot</span>
                  <p className="font-bold text-gray-800 text-sm">{p.currentStockQuintals} Quintals</p>
                </div>
                <div>
                  <span className="text-gray-400">Reserved for Verified Farmers</span>
                  <p className="font-bold text-orange-700 text-sm">{p.reservedQuintals} Quintals</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inbound Shipment Modal */}
      {showShipmentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-1">Register Inbound Fertilizer Shipment</h3>
            <p className="text-xs text-gray-500 mb-4">
              Updates depot inventory balances and generates an auditable transaction.
            </p>

            <form onSubmit={handleReceiveShipment} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Product</label>
                  <select
                    value={shipmentData.productCode}
                    onChange={(e) => setShipmentData({ ...shipmentData, productCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
                  >
                    <option value="DAP">DAP</option>
                    <option value="UREA">UREA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Quantity (Quintals)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={shipmentData.quantityQuintals}
                    onChange={(e) => setShipmentData({ ...shipmentData, quantityQuintals: e.target.value })}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Purchase Cost / Qtl (ETB)</label>
                  <input
                    type="number"
                    value={shipmentData.purchaseCostPerQuintal}
                    onChange={(e) => setShipmentData({ ...shipmentData, purchaseCostPerQuintal: e.target.value })}
                    placeholder="e.g. 4200"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Reference / Waybill #</label>
                  <input
                    type="text"
                    required
                    value={shipmentData.referenceId}
                    onChange={(e) => setShipmentData({ ...shipmentData, referenceId: e.target.value })}
                    placeholder="e.g. WB-EABC-8812"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Supplier / Importer</label>
                <input
                  type="text"
                  required
                  value={shipmentData.supplier}
                  onChange={(e) => setShipmentData({ ...shipmentData, supplier: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Inspection Notes</label>
                <input
                  type="text"
                  value={shipmentData.notes}
                  onChange={(e) => setShipmentData({ ...shipmentData, notes: e.target.value })}
                  placeholder="e.g. Delivered via central railway from Djibouti port"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowShipmentModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-agri-700 rounded-xl hover:bg-agri-800 disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Record Inbound Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Damage / Loss Modal */}
      {showDamageModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-base font-bold text-rose-700 mb-1">Report Damaged Bags or Moisture Loss</h3>
            <p className="text-xs text-gray-500 mb-4">
              Safely adjusts ledger balances. Cannot reduce stock below zero.
            </p>

            <form onSubmit={handleReportDamage} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Product</label>
                  <select
                    value={damageData.productCode}
                    onChange={(e) => setDamageData({ ...damageData, productCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
                  >
                    <option value="DAP">DAP</option>
                    <option value="UREA">UREA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Loss (Quintals)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    min="0.5"
                    value={damageData.quantityQuintals}
                    onChange={(e) => setDamageData({ ...damageData, quantityQuintals: e.target.value })}
                    placeholder="e.g. 2.0"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Discrepancy Justification</label>
                <textarea
                  rows="2"
                  required
                  value={damageData.reason}
                  onChange={(e) => setDamageData({ ...damageData, reason: e.target.value })}
                  placeholder="e.g. 4 bags torn during unloading, confirmed by warehouse laborer"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDamageModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 disabled:opacity-50"
                >
                  {submitting ? 'Adjusting...' : 'Record Stock Loss'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ledger Transactions Table */}
      <DataTable
        columns={columns}
        data={transactions}
        searchPlaceholder="Search warehouse transactions by txn # or product..."
        emptyTitle="No Ledger Transactions"
        emptyMessage="Stock receiving transactions and disbursements will be logged here."
      />
    </div>
  );
};

export default OfficeInventory;
