import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Receipt, Check, X, Eye, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import ConfirmationModal from '../../components/ConfirmationModal';

const OfficePayments = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionType, setActionType] = useState(null); // 'verify' | 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [inspectReceiptUrl, setInspectReceiptUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments');
      setPayments(res.data.payments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleDecision = async () => {
    if (!selectedPayment || !actionType) return;
    setSubmitting(true);
    setMessage('');

    try {
      const res = await api.post(`/payments/${selectedPayment._id}/verify`, {
        status: actionType === 'verify' ? 'verified' : 'rejected',
        rejectionReason: actionType === 'reject' ? rejectionReason : undefined,
      });

      setMessage(
        actionType === 'verify'
          ? `Payment ${selectedPayment.paymentReference} verified successfully. Stock reserved for distribution.`
          : `Payment ${selectedPayment.paymentReference} rejected. Farmer notified.`
      );
      setSelectedPayment(null);
      setActionType(null);
      setRejectionReason('');
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading farmer payment submissions..." size="lg" />;

  const columns = [
    {
      header: 'Reference #',
      accessor: 'paymentReference',
      render: (row) => <span className="font-mono font-bold text-gray-900">{row.paymentReference}</span>,
    },
    {
      header: 'Farmer Details',
      render: (row) => (
        <div>
          <p className="font-bold text-gray-900">{row.farmer?.name}</p>
          <p className="text-[11px] text-gray-500">{row.farmer?.phone}</p>
        </div>
      ),
    },
    {
      header: 'Amount Paid',
      render: (row) => (
        <span className="font-black text-emerald-800 text-sm">
          {row.amountPaid.toLocaleString()} ETB
        </span>
      ),
    },
    {
      header: 'Method',
      render: (row) => <span className="capitalize text-xs">{row.paymentMethod.replace(/_/g, ' ')}</span>,
    },
    {
      header: 'Receipt Document',
      render: (row) => (
        <button
          onClick={() => setInspectReceiptUrl(`/api/v1/payments${row.receiptUrl}`)}
          className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition"
        >
          <Eye className="w-3.5 h-3.5 mr-1 text-gray-500" />
          <span>Inspect Slip</span>
        </button>
      ),
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.verificationStatus} />,
    },
    {
      header: 'Actions',
      render: (row) =>
        row.verificationStatus === 'pending' ? (
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => {
                setSelectedPayment(row);
                setActionType('verify');
              }}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition"
            >
              Verify
            </button>
            <button
              onClick={() => {
                setSelectedPayment(row);
                setActionType('reject');
              }}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold transition"
            >
              Reject
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400 font-medium">Verified & Locked</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Payment Verification Desk</h1>
        <p className="text-xs text-gray-500">
          Match farmer bank slips, prevent duplicate reference exploitation, and reserve physical stock for distribution
        </p>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <DataTable
        columns={columns}
        data={payments}
        searchPlaceholder="Search payments by reference number or farmer name..."
        emptyTitle="No Payments Pending"
        emptyMessage="Uploaded payment receipts from farmers will appear here for verification."
      />

      {/* Inspect Receipt Modal */}
      {inspectReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm">Farmer Payment Slip Inspection</h3>
              <button
                onClick={() => setInspectReceiptUrl(null)}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 bg-gray-100 rounded-lg"
              >
                Close Viewer
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto flex items-center justify-center bg-gray-50 rounded-xl p-4 border border-gray-200">
              {inspectReceiptUrl.endsWith('.pdf') ? (
                <iframe src={inspectReceiptUrl} className="w-full h-96 rounded-lg" title="Receipt PDF" />
              ) : (
                <img src={inspectReceiptUrl} alt="Payment Receipt" className="max-w-full max-h-96 rounded-lg object-contain shadow-md" />
              )}
            </div>

            <div className="flex justify-end pt-2">
              <a
                href={inspectReceiptUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-agri-700 text-white rounded-xl text-xs font-semibold hover:bg-agri-800"
              >
                Open in Full Window
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Decision Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!selectedPayment}
        title={actionType === 'verify' ? 'Confirm Payment Verification' : 'Reject Payment Submission'}
        message={`Confirm decision for payment reference #${selectedPayment?.paymentReference} (${selectedPayment?.amountPaid} ETB)?`}
        confirmVariant={actionType === 'reject' ? 'danger' : 'primary'}
        onConfirm={handleDecision}
        onCancel={() => {
          setSelectedPayment(null);
          setActionType(null);
        }}
      >
        {actionType === 'reject' && (
          <div className="mt-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Mandatory Rejection Explanation:
            </label>
            <textarea
              rows="3"
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Reference number does not match CBE bank statement / Amount paid is less than required."
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
            />
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
};

export default OfficePayments;
