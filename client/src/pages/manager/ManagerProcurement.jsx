import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShoppingBag, Check, X, RotateCcw, AlertCircle, FileText } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import ConfirmationModal from '../../components/ConfirmationModal';

const ManagerProcurement = () => {
  const [loading, setLoading] = useState(true);
  const [procurements, setProcurements] = useState([]);
  const [selectedProc, setSelectedProc] = useState(null);
  const [decisionType, setDecisionType] = useState(null); // 'approved' | 'rejected' | 'revision_requested'
  const [managerNotes, setManagerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProcurements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/procurement-requests');
      setProcurements(res.data.procurements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcurements();
  }, []);

  const handleDecision = async () => {
    if (!selectedProc || !decisionType) return;
    setSubmitting(true);
    try {
      await api.post(`/procurement-requests/${selectedProc._id}/decision`, {
        decision: decisionType,
        managerNotes,
      });
      setSelectedProc(null);
      setDecisionType(null);
      setManagerNotes('');
      fetchProcurements();
    } catch (err) {
      alert(err.response?.data?.message || 'Decision failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading procurement requests..." size="lg" />;

  const columns = [
    { header: 'Procurement #', accessor: 'procurementNumber', render: (row) => <span className="font-bold">{row.procurementNumber}</span> },
    { header: 'Requested By', render: (row) => row.requestedBy?.name || 'Office Manager' },
    { header: 'DAP (Qtl)', accessor: 'dapQuantity', render: (row) => <span className="font-semibold text-agri-800">{row.dapQuantity} Qtl</span> },
    { header: 'Urea (Qtl)', accessor: 'ureaQuantity', render: (row) => <span className="font-semibold text-blue-800">{row.ureaQuantity} Qtl</span> },
    { header: 'Est. Cost', render: (row) => <span className="font-extrabold text-gray-900">{row.estimatedCost.toLocaleString()} ETB</span> },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Justification', accessor: 'justification' },
    {
      header: 'Actions',
      render: (row) =>
        row.status === 'pending' ? (
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => {
                setSelectedProc(row);
                setDecisionType('approved');
              }}
              className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700"
            >
              Approve
            </button>
            <button
              onClick={() => {
                setSelectedProc(row);
                setDecisionType('revision_requested');
              }}
              className="px-2 py-1 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700"
            >
              Revision
            </button>
            <button
              onClick={() => {
                setSelectedProc(row);
                setDecisionType('rejected');
              }}
              className="px-2 py-1 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700"
            >
              Reject
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400 font-medium">Decided</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Fertilizer Procurement Review</h1>
        <p className="text-xs text-gray-500">
          Review aggregated farmer demand and authorize centralized bulk fertilizer orders with suppliers
        </p>
      </div>

      <DataTable
        columns={columns}
        data={procurements}
        searchPlaceholder="Search procurement orders..."
        emptyTitle="No Procurement Requests"
        emptyMessage="Consolidated fertilizer procurement requests submitted by the Office Manager will appear here."
      />

      {/* Decision Modal */}
      <ConfirmationModal
        isOpen={!!selectedProc}
        title={
          decisionType === 'approved'
            ? 'Approve Procurement Budget'
            : decisionType === 'rejected'
            ? 'Reject Procurement Request'
            : 'Request Revision from Office Manager'
        }
        message={`Confirm decision for Procurement #${selectedProc?.procurementNumber} (${selectedProc?.dapQuantity} Qtl DAP, ${selectedProc?.ureaQuantity} Qtl Urea)?`}
        confirmVariant={decisionType === 'rejected' ? 'danger' : 'primary'}
        onConfirm={handleDecision}
        onCancel={() => {
          setSelectedProc(null);
          setDecisionType(null);
        }}
      >
        <div className="mt-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Manager Review Notes:
          </label>
          <textarea
            rows="3"
            value={managerNotes}
            onChange={(e) => setManagerNotes(e.target.value)}
            placeholder="e.g. Budget approved under credit allocation / Reduce quantity by 10% / Approved."
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
          />
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default ManagerProcurement;
