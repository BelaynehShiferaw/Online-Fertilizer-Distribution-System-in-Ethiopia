import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { History, CheckCircle, Package } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

const FarmerHistory = () => {
  const [loading, setLoading] = useState(true);
  const [historyRequests, setHistoryRequests] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/fertilizer-requests');
        setHistoryRequests(res.data.requests || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <LoadingSpinner text="Compiling your agricultural archive..." size="lg" />;

  const columns = [
    { header: 'Request #', accessor: 'requestNumber', render: (row) => <span className="font-bold">{row.requestNumber}</span> },
    { header: 'Crop', render: (row) => row.crop?.nameEn },
    { header: 'Area Cultivated', render: (row) => `${row.cultivatedArea} ha` },
    { header: 'DAP (Qtl)', render: (row) => row.approvedDap || row.requestedDap },
    { header: 'Urea (Qtl)', render: (row) => row.approvedUrea || row.requestedUrea },
    { header: 'Date', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Agricultural Request History</h1>
        <p className="text-xs text-gray-500">
          Permanent digital archive of all previous crop registrations, quotas, and verified distributions
        </p>
      </div>

      <DataTable
        columns={columns}
        data={historyRequests}
        searchPlaceholder="Search archive by crop or request #..."
        emptyTitle="No Archived Records"
        emptyMessage="Your historical agricultural requests will be cataloged here."
      />
    </div>
  );
};

export default FarmerHistory;
