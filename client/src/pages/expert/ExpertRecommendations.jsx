import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Sliders, Plus, CheckCircle, Info } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import DataTable from '../../components/DataTable';

const ExpertRecommendations = () => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [crops, setCrops] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    cropId: '',
    soilContext: 'Vertisol (Walka / Black soil)',
    region: 'National Agricultural Corridors',
    season: 'Meher 2026',
    dapQuintalsPerHa: 1.0,
    ureaQuintalsPerHa: 1.0,
    instructionsEn: '',
    instructionsAm: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recRes, cropRes] = await Promise.all([
        api.get('/recommendations'),
        api.get('/crops'),
      ]);
      setRecommendations(recRes.data.recommendations || []);
      setCrops(cropRes.data.crops || []);
      if (cropRes.data.crops?.length > 0) {
        setFormData((prev) => ({ ...prev, cropId: cropRes.data.crops[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await api.post('/recommendations', formData);
      setMessage('New agronomic recommendation standard published.');
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save recommendation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading agronomic standards..." size="lg" />;

  const columns = [
    {
      header: 'Crop',
      render: (row) => (
        <div>
          <span className="font-bold text-gray-900">{row.crop?.nameEn}</span>
          <span className="text-xs text-gray-500 ml-1">({row.crop?.nameAm})</span>
        </div>
      ),
    },
    { header: 'Soil Context', accessor: 'soilContext' },
    { header: 'Region', accessor: 'region' },
    {
      header: 'DAP Standard',
      render: (row) => <span className="font-bold text-agri-700">{row.dapQuintalsPerHa} Qtl/ha</span>,
    },
    {
      header: 'Urea Standard',
      render: (row) => <span className="font-bold text-blue-700">{row.ureaQuintalsPerHa} Qtl/ha</span>,
    },
    { header: 'Endorsed By', render: (row) => row.expert?.name || 'Expert' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Agronomic Recommendation Standards</h1>
          <p className="text-xs text-gray-500">
            Configure dynamic application quotas per hectare based on soil fertility tests and agronomic research
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-semibold text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Recommendation Rate</span>
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-1">Define Agronomic Fertilizer Rate</h3>
            <p className="text-xs text-gray-500 mb-4">
              Configurable rates ensure application matches soil and crop biology.
            </p>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Crop</label>
                  <select
                    required
                    value={formData.cropId}
                    onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
                  >
                    {crops.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.nameEn} ({c.nameAm})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Season</label>
                  <input
                    type="text"
                    required
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Soil Type / Context</label>
                  <input
                    type="text"
                    required
                    value={formData.soilContext}
                    onChange={(e) => setFormData({ ...formData, soilContext: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Agricultural Region</label>
                  <input
                    type="text"
                    required
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">DAP Rate (Qtl / Ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min="0"
                    value={formData.dapQuintalsPerHa}
                    onChange={(e) => setFormData({ ...formData, dapQuintalsPerHa: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Urea Rate (Qtl / Ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min="0"
                    value={formData.ureaQuintalsPerHa}
                    onChange={(e) => setFormData({ ...formData, ureaQuintalsPerHa: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-agri-700 rounded-xl hover:bg-agri-800 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Recommendation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={recommendations}
        searchPlaceholder="Search recommendations by crop or soil..."
        emptyTitle="No Recommendations Defined"
      />
    </div>
  );
};

export default ExpertRecommendations;
