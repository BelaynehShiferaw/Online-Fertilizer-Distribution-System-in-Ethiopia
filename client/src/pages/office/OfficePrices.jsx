import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Tag, Send, CheckCircle, Clock, Globe } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import DataTable from '../../components/DataTable';

const OfficePrices = () => {
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState([]);
  const [publishingId, setPublishingId] = useState(null);
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

  const handlePublish = async (priceId) => {
    setPublishingId(priceId);
    setMessage('');
    try {
      await api.post(`/fertilizer-prices/${priceId}/publish`);
      setMessage('Fertilizer price published to all farmers. Notifications broadcast.');
      fetchPrices();
    } catch (err) {
      alert(err.response?.data?.message || 'Publishing failed');
    } finally {
      setPublishingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading price gazette..." size="lg" />;

  const columns = [
    {
      header: 'Product',
      accessor: 'productCode',
      render: (row) => (
        <span className="font-bold text-gray-900">{row.productCode}</span>
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
      header: 'Approved By',
      render: (row) => row.setBy?.name || 'General Manager',
    },
    {
      header: 'Publication Status',
      render: (row) =>
        row.isPublished ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1" /> Published
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 mr-1" /> Pending Publication
          </span>
        ),
    },
    {
      header: 'Actions',
      render: (row) =>
        !row.isPublished ? (
          <button
            onClick={() => handlePublish(row._id)}
            disabled={publishingId === row._id}
            className="inline-flex items-center px-3 py-1 bg-agri-700 hover:bg-agri-800 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            <span>{publishingId === row._id ? 'Publishing...' : 'Publish to Farmers'}</span>
          </button>
        ) : (
          <span className="text-xs text-gray-400">Live for Farmers</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Fertilizer Price Publication Desk</h1>
        <p className="text-xs text-gray-500">
          Review prices authorized by the General Manager and publish official rates to farmers across Ethiopia
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
        data={prices}
        searchPlaceholder="Search price publications..."
        emptyTitle="No Prices to Publish"
        emptyMessage="When the General Manager establishes new fertilizer prices, they will appear here for publication."
      />
    </div>
  );
};

export default OfficePrices;
