import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ClipboardList, Check, X, RotateCcw, AlertCircle, CheckCircle, Info } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import ConfirmationModal from '../../components/ConfirmationModal';

const ExpertReviews = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [reviewModalAction, setReviewModalAction] = useState(null); // 'approved' | 'rejected' | 'changes_requested'

  const [approvedDap, setApprovedDap] = useState('');
  const [approvedUrea, setApprovedUrea] = useState('');
  const [expertNotes, setExpertNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/fertilizer-requests');
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openReviewModal = (req, action) => {
    setSelectedReq(req);
    setReviewModalAction(action);
    setApprovedDap(req.requestedDap);
    setApprovedUrea(req.requestedUrea);
    setExpertNotes('');
  };

  const handleConfirmReview = async () => {
    if (!selectedReq || !reviewModalAction) return;

    if ((reviewModalAction === 'rejected' || reviewModalAction === 'changes_requested') && !expertNotes.trim()) {
      return alert('A written explanation is mandatory when rejecting or requesting changes.');
    }

    setSubmitting(true);
    setMessage('');

    try {
      await api.post(`/fertilizer-requests/${selectedReq._id}/review`, {
        decision: reviewModalAction,
        approvedDap: Number(approvedDap),
        approvedUrea: Number(approvedUrea),
        expertNotes,
      });

      setMessage(`Request #${selectedReq.requestNumber} review successfully recorded as ${reviewModalAction}.`);
      setSelectedReq(null);
      setReviewModalAction(null);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Review submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading farmer requests for review..." size="lg" />;

  const columns = [
    { header: 'Request #', accessor: 'requestNumber', render: (row) => <span className="font-bold">{row.requestNumber}</span> },
    {
      header: 'Farmer Details',
      render: (row) => (
        <div>
          <p className="font-bold text-gray-900">{row.farmer?.name}</p>
          <p className="text-[11px] text-gray-500">{row.farmerProfile?.farmerId} • {row.farmer?.phone}</p>
        </div>
      ),
    },
    {
      header: 'Plot & Crop',
      render: (row) => (
        <div>
          <p className="font-semibold text-agri-950">{row.crop?.nameEn} ({row.crop?.nameAm})</p>
          <p className="text-[11px] text-gray-500">{row.cultivatedArea} ha • {row.plot?.soilType || 'Soil'}</p>
        </div>
      ),
    },
    {
      header: 'Requested Volume',
      render: (row) => (
        <span className="font-semibold text-xs">
          {row.requestedDap} Qtl DAP • {row.requestedUrea} Qtl Urea
        </span>
      ),
    },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Agronomic Actions',
      render: (row) =>
        row.status === 'submitted' || row.status === 'under_agricultural_review' ? (
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => openReviewModal(row, 'approved')}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition"
            >
              Approve
            </button>
            <button
              onClick={() => openReviewModal(row, 'changes_requested')}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold transition"
            >
              Changes
            </button>
            <button
              onClick={() => openReviewModal(row, 'rejected')}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold transition"
            >
              Reject
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400 font-medium">Reviewed</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Agricultural Request Review Desk</h1>
        <p className="text-xs text-gray-500">
          Verify cultivated areas, soil characteristics, and authorize crop-specific DAP & Urea quotas with electronic endorsement
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
        data={requests}
        searchPlaceholder="Search requests by request #, farmer, or crop..."
        emptyTitle="No Requests Under Review"
        emptyMessage="Farmer fertilizer requests submitted for review will appear in this workspace."
      />

      {/* Review Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!selectedReq}
        title={
          reviewModalAction === 'approved'
            ? 'Endorse & Approve Fertilizer Quota'
            : reviewModalAction === 'rejected'
            ? 'Reject Fertilizer Request'
            : 'Request Corrections from Farmer'
        }
        message={`Farmer: ${selectedReq?.farmer?.name} • Crop: ${selectedReq?.crop?.nameEn} • Land: ${selectedReq?.cultivatedArea} ha`}
        confirmVariant={reviewModalAction === 'rejected' ? 'danger' : 'primary'}
        onConfirm={handleConfirmReview}
        onCancel={() => {
          setSelectedReq(null);
          setReviewModalAction(null);
        }}
      >
        <div className="space-y-3 mt-3">
          {reviewModalAction === 'approved' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-agri-50/70 rounded-xl border border-agri-200">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Approved DAP (Qtl)</label>
                <input
                  type="number"
                  step="0.25"
                  required
                  value={approvedDap}
                  onChange={(e) => setApprovedDap(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Approved Urea (Qtl)</label>
                <input
                  type="number"
                  step="0.25"
                  required
                  value={approvedUrea}
                  onChange={(e) => setApprovedUrea(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-hidden"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {reviewModalAction === 'approved'
                ? 'Expert Endorsement Comments (Optional):'
                : 'Mandatory Agronomic Explanation:'}
            </label>
            <textarea
              rows="3"
              required={reviewModalAction !== 'approved'}
              value={expertNotes}
              onChange={(e) => setExpertNotes(e.target.value)}
              placeholder={
                reviewModalAction === 'approved'
                  ? 'e.g. Endorsed based on standard application quota for Ada\'a Vertisol soil.'
                  : 'e.g. Requested quantity exceeds maximum recommended rate for 1.5 ha Teff. Please reduce DAP to 1.5 Qtl.'
              }
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
            />
          </div>
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default ExpertReviews;
