import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Receipt, CheckCircle, AlertTriangle, Eye, Clock } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

const FarmerPayments = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
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
    fetchPayments();
  }, []);

  if (loading) return <LoadingSpinner text="Loading payment receipts..." size="lg" />;

  const columns = [
    { header: 'Reference #', accessor: 'paymentReference', render: (row) => <span className="font-mono font-bold">{row.paymentReference}</span> },
    { header: 'Request #', render: (row) => row.request?.requestNumber || 'N/A' },
    { header: 'Amount Paid', render: (row) => <span className="font-bold text-gray-900">{row.amountPaid.toLocaleString()} ETB</span> },
    { header: 'Method', render: (row) => <span className="capitalize text-xs">{row.paymentMethod.replace(/_/g, ' ')}</span> },
    { header: 'Date', render: (row) => new Date(row.paymentDate).toLocaleDateString() },
    { header: 'Verification Status', render: (row) => <StatusBadge status={row.verificationStatus} /> },
    {
      header: 'Notes / Reason',
      render: (row) =>
        row.verificationStatus === 'rejected' ? (
          <span className="text-xs text-rose-700 font-semibold">{row.rejectionReason}</span>
        ) : row.verificationStatus === 'verified' ? (
          <span className="text-xs text-emerald-700 font-medium">Verified by Office</span>
        ) : (
          <span className="text-xs text-gray-400">Under Review</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Payment Receipts & Slips</h1>
        <p className="text-xs text-gray-500">
          History of all bank transfer slips and verification outcomes
        </p>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        searchPlaceholder="Search payments by reference number..."
        emptyTitle="No Payment Slips Uploaded"
        emptyMessage="Upload your payment receipts through the 'Fertilizer Requests' page when approved."
      />
    </div>
  );
};

export default FarmerPayments;
