import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShoppingBag, Calculator, Send, CheckCircle, ArrowRight, Layers, Package } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

const OfficeConsolidation = () => {
  const [loading, setLoading] = useState(true);
  const [demandData, setDemandData] = useState(null);
  const [procurements, setProcurements] = useState([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [justification, setJustification] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchConsolidation = async () => {
    try {
      setLoading(true);
      const [demandRes, procRes] = await Promise.all([
        api.get('/procurement-requests/consolidated-demand'),
        api.get('/procurement-requests'),
      ]);
      setDemandData(demandRes.data);
      setProcurements(procRes.data.procurements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsolidation();
  }, []);

  const handleSubmitProcurement = async (e) => {
    e.preventDefault();
    if (!demandData) return;
    setSubmitting(true);
    setMessage('');

    try {
      const estimatedCost = (demandData.totalDapQuintals * 4200) + (demandData.totalUreaQuintals * 3600); // wholesale base estimate
      const includedIds = (demandData.approvedRequests || []).map((r) => r._id);

      await api.post('/procurement-requests', {
        dapQuantity: demandData.totalDapQuintals,
        ureaQuantity: demandData.totalUreaQuintals,
        estimatedCost,
        justification: justification || 'Consolidated demand calculation from approved farmer requirements',
        includedRequestIds: includedIds,
      });

      setMessage('Consolidated procurement proposal successfully submitted to the General Manager for authorization.');
      setShowSubmitModal(false);
      setJustification('');
      fetchConsolidation();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit procurement proposal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Consolidating farmer agricultural demand..." size="lg" />;

  const requestColumns = [
    { header: 'Request #', accessor: 'requestNumber', render: (row) => <span className="font-bold">{row.requestNumber}</span> },
    { header: 'Farmer', render: (row) => row.farmer?.name || 'Farmer' },
    { header: 'Crop', render: (row) => <span className="font-semibold text-agri-900">{row.crop?.nameEn}</span> },
    { header: 'Cultivated Area', render: (row) => `${row.cultivatedArea} ha` },
    { header: 'Approved DAP', render: (row) => <span className="font-bold text-agri-700">{row.approvedDap} Qtl</span> },
    { header: 'Approved Urea', render: (row) => <span className="font-bold text-blue-700">{row.approvedUrea} Qtl</span> },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Farmer Demand Consolidation</h1>
          <p className="text-xs text-gray-500">
            Aggregate expert-approved farmer requests into bulk seasonal procurement orders
          </p>
        </div>
        <button
          onClick={() => setShowSubmitModal(true)}
          disabled={!demandData || (demandData.totalDapQuintals === 0 && demandData.totalUreaQuintals === 0)}
          className="inline-flex items-center px-4 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-semibold text-xs shadow-xs disabled:opacity-50 transition"
        >
          <Send className="w-4 h-4 mr-1.5" />
          <span>Submit Proposal to Manager</span>
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Demand Aggregate Totals */}
      {demandData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-gray-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold text-gray-500 uppercase">Approved Farmer Requests</span>
            <p className="text-3xl font-black text-gray-900">{demandData.totalRequests}</p>
            <p className="text-[10px] text-gray-400">Validated by Agricultural Experts</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-gray-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold text-agri-800 uppercase flex items-center">
              <Package className="w-4 h-4 mr-1" /> Consolidated DAP Requirement
            </span>
            <p className="text-3xl font-black text-agri-700">{demandData.totalDapQuintals} Qtl</p>
            <p className="text-[10px] text-gray-400">Total Di-Ammonium Phosphate needed</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-gray-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold text-blue-800 uppercase flex items-center">
              <Layers className="w-4 h-4 mr-1" /> Consolidated Urea Requirement
            </span>
            <p className="text-3xl font-black text-blue-700">{demandData.totalUreaQuintals} Qtl</p>
            <p className="text-[10px] text-gray-400">Total Granular Urea needed</p>
          </div>
        </div>
      )}

      {/* Demand Breakdown by Crop */}
      {demandData?.cropBreakdown && (
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Requirement Grouping by Crop Type
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(demandData.cropBreakdown).map(([cropName, stats]) => (
              <div key={cropName} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-bold text-gray-900 text-xs block">{cropName}</span>
                <span className="text-[10px] text-gray-400 block">{stats.count} Requests</span>
                <div className="mt-2 text-xs font-semibold space-y-0.5">
                  <div className="text-agri-800">DAP: {stats.dap} Qtl</div>
                  <div className="text-blue-800">Urea: {stats.urea} Qtl</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table of Included Requests */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Individual Approved Farmer Requests In Calculation
        </h3>
        <DataTable
          columns={requestColumns}
          data={demandData?.approvedRequests || []}
          searchPlaceholder="Search approved requests by farmer or crop..."
          emptyTitle="No Approved Requests"
          emptyMessage="Agricultural Expert must review and approve farmer requests before they appear in consolidation."
        />
      </div>

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-1">Submit Bulk Procurement Proposal</h3>
            <p className="text-xs text-gray-500 mb-4">
              Send consolidated demand ({demandData?.totalDapQuintals} Qtl DAP, {demandData?.totalUreaQuintals} Qtl Urea) to General Manager.
            </p>

            <form onSubmit={handleSubmitProcurement} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Procurement Justification & Urgency
                </label>
                <textarea
                  rows="3"
                  required
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="e.g. Urgent consolidated requirement for Meher seasonal Teff and Wheat planting in Ada'a woreda."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-agri-700 rounded-xl hover:bg-agri-800 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Send to Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeConsolidation;
