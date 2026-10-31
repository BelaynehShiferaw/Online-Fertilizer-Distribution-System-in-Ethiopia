import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ClipboardList,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  ChevronRight,
  Send,
  Eye,
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

const lifecycleSteps = [
  'submitted',
  'approved',
  'awaiting_payment',
  'payment_under_verification',
  'ready_for_distribution',
  'completed',
];

const FarmerRequests = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form State
  const [uploadData, setUploadData] = useState({
    paymentReference: '',
    amountPaid: '',
    paymentMethod: 'commercial_bank_of_ethiopia',
    paymentDate: new Date().toISOString().split('T')[0],
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/fertilizer-requests');
      setRequests(res.data.requests || []);
      if (res.data.requests?.length > 0 && !selectedReq) {
        setSelectedReq(res.data.requests[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openPaymentModal = (req) => {
    setSelectedReq(req);
    setUploadData({
      paymentReference: '',
      amountPaid: req.totalAmountDue || '',
      paymentMethod: 'commercial_bank_of_ethiopia',
      paymentDate: new Date().toISOString().split('T')[0],
    });
    setReceiptFile(null);
    setError('');
    setShowUploadModal(true);
  };

  const handleUploadPayment = async (e) => {
    e.preventDefault();
    if (!receiptFile) {
      return setError('Please select a receipt document or photo to upload.');
    }

    setSubmittingPayment(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('requestId', selectedReq._id);
      formData.append('paymentReference', uploadData.paymentReference);
      formData.append('amountPaid', uploadData.amountPaid);
      formData.append('paymentMethod', uploadData.paymentMethod);
      formData.append('paymentDate', uploadData.paymentDate);
      formData.append('receipt', receiptFile);

      await api.post('/payments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Payment receipt uploaded successfully! Pending verification by Office Manager.');
      setShowUploadModal(false);
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment upload failed');
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading fertilizer requests..." size="lg" />;

  const columns = [
    { header: 'Request #', accessor: 'requestNumber', render: (row) => <span className="font-bold">{row.requestNumber}</span> },
    { header: 'Crop', render: (row) => <span className="font-semibold text-agri-950">{row.crop?.nameEn}</span> },
    { header: 'Area', render: (row) => `${row.cultivatedArea} ha` },
    { header: 'DAP (Qtl)', render: (row) => row.approvedDap || row.requestedDap },
    { header: 'Urea (Qtl)', render: (row) => row.approvedUrea || row.requestedUrea },
    { header: 'Amount Due', render: (row) => <span className="font-bold">{row.totalAmountDue ? `${row.totalAmountDue.toLocaleString()} ETB` : 'Calculating'}</span> },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => setSelectedReq(row)}
          className="text-xs font-semibold text-agri-700 hover:underline"
        >
          View Tracker
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Fertilizer Request Tracking</h1>
          <p className="text-xs text-gray-500">
            Monitor the status of your requests across agronomic review, payment verification, and depot pickup
          </p>
        </div>
        <Link
          to="/farmer/requests/new"
          className="inline-flex items-center px-4 py-2 bg-agri-700 text-white rounded-xl text-xs font-bold hover:bg-agri-800 shadow-xs transition"
        >
          + Submit New Request
        </Link>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Selected Request Detail & Stepper Card */}
      {selectedReq && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-gray-400">Request ID: #{selectedReq.requestNumber}</span>
              <h2 className="text-lg font-black text-gray-900">
                {selectedReq.crop?.nameEn} ({selectedReq.cultivatedArea} ha)
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <StatusBadge status={selectedReq.status} />
              {(selectedReq.status === 'awaiting_payment' || selectedReq.status === 'changes_requested') && (
                <button
                  onClick={() => openPaymentModal(selectedReq)}
                  className="px-3.5 py-1.5 bg-agri-700 hover:bg-agri-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Payment Receipt</span>
                </button>
              )}
            </div>
          </div>

          {/* Stepper Progress */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Workflow Status Progression
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {lifecycleSteps.map((step, idx) => {
                const isPassed = lifecycleSteps.indexOf(selectedReq.status) >= idx || selectedReq.status === 'completed';
                const isCurrent = selectedReq.status === step;
                return (
                  <div
                    key={step}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      isCurrent
                        ? 'bg-agri-700 text-white border-agri-700 shadow-sm'
                        : isPassed
                        ? 'bg-agri-50 text-agri-900 border-agri-200'
                        : 'bg-gray-50 text-gray-400 border-gray-200'
                    }`}
                  >
                    <span className="text-[10px] font-bold block mb-0.5">Step {idx + 1}</span>
                    <span className="text-xs font-semibold capitalize block truncate">
                      {step.replace(/_/g, ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing & Expert Notes Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-gray-700 uppercase">Pricing Snapshot</span>
              <p className="text-xs text-gray-600">
                DAP: {selectedReq.approvedDap || selectedReq.requestedDap} Qtl @ {selectedReq.dapPricePerQuintal || 4850} ETB
              </p>
              <p className="text-xs text-gray-600">
                Urea: {selectedReq.approvedUrea || selectedReq.requestedUrea} Qtl @ {selectedReq.ureaPricePerQuintal || 4200} ETB
              </p>
              <p className="text-sm font-extrabold text-gray-900 pt-1">
                Total Amount Due: {selectedReq.totalAmountDue ? `${selectedReq.totalAmountDue.toLocaleString()} ETB` : 'Pending'}
              </p>
            </div>

            <div className="p-4 bg-agri-50/50 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-agri-900 uppercase">Agricultural Expert Endorsement</span>
              <p className="text-xs text-gray-700 italic">
                {selectedReq.expertNotes || 'Request submitted. Awaiting expert review and crop quota authorization.'}
              </p>
              {selectedReq.expertDecisionDate && (
                <p className="text-[10px] text-gray-400">
                  Reviewed: {new Date(selectedReq.expertDecisionDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Requests Table */}
      <DataTable
        columns={columns}
        data={requests}
        searchPlaceholder="Search your requests..."
        emptyTitle="No Requests Found"
      />

      {/* Upload Payment Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Upload Fertilizer Payment Receipt</h3>
              <p className="text-xs text-gray-500">
                Amount Due: {selectedReq?.totalAmountDue?.toLocaleString()} ETB for Request #{selectedReq?.requestNumber}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUploadPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={uploadData.paymentMethod}
                  onChange={(e) => setUploadData({ ...uploadData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
                >
                  <option value="commercial_bank_of_ethiopia">Commercial Bank of Ethiopia (CBE)</option>
                  <option value="telebirr">Telebirr SuperApp</option>
                  <option value="cbe_birr">CBE Birr</option>
                  <option value="coop_bank_of_oromia">Cooperative Bank of Oromia</option>
                  <option value="amhara_bank">Amhara Bank</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Bank Reference / Slip #
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadData.paymentReference}
                    onChange={(e) => setUploadData({ ...uploadData, paymentReference: e.target.value })}
                    placeholder="e.g. FT2609188219"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 uppercase focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Amount Paid (ETB)
                  </label>
                  <input
                    type="number"
                    required
                    value={uploadData.amountPaid}
                    onChange={(e) => setUploadData({ ...uploadData, amountPaid: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  required
                  value={uploadData.paymentDate}
                  onChange={(e) => setUploadData({ ...uploadData, paymentDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Receipt Photo or PDF Document
                </label>
                <input
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => setReceiptFile(e.target.files[0])}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-agri-50 file:text-agri-700 hover:file:bg-agri-100"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Supported: JPG, PNG, PDF (Max 5MB)</span>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-5 py-2 text-xs font-bold text-white bg-agri-700 rounded-xl hover:bg-agri-800 disabled:opacity-50"
                >
                  {submittingPayment ? 'Submitting...' : 'Upload & Submit Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerRequests;
