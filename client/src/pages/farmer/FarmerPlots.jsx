import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { MapPin, Plus, CheckCircle, Edit, Layers } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import DataTable from '../../components/DataTable';

const soilTypes = [
  'Vertisol (Walka / Black soil)',
  'Nitisol (Key / Red soil)',
  'Cambisol (Brown soil)',
  'Sandy loam',
  'Other',
];

const FarmerPlots = () => {
  const [loading, setLoading] = useState(true);
  const [plots, setPlots] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    plotIdentifier: '',
    areaInHectares: '',
    soilType: 'Vertisol (Walka / Black soil)',
    locationDescription: '',
    season: 'Meher (Main season)',
    year: 2026,
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchPlots = async () => {
    try {
      setLoading(true);
      const res = await api.get('/plots');
      setPlots(res.data.plots || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlots();
  }, []);

  const handleCreatePlot = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await api.post('/plots', formData);
      setMessage('New agricultural plot registered successfully.');
      setShowAddModal(false);
      setFormData({
        plotIdentifier: '',
        areaInHectares: '',
        soilType: 'Vertisol (Walka / Black soil)',
        locationDescription: '',
        season: 'Meher (Main season)',
        year: 2026,
      });
      fetchPlots();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register plot');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading registered land plots..." size="lg" />;

  const columns = [
    { header: 'Plot Name / ID', accessor: 'plotIdentifier', render: (row) => <span className="font-bold text-gray-900">{row.plotIdentifier}</span> },
    {
      header: 'Cultivated Area',
      render: (row) => <span className="font-extrabold text-agri-800">{row.areaInHectares} Hectares</span>,
    },
    { header: 'Soil Context', accessor: 'soilType' },
    { header: 'Agricultural Season', accessor: 'season' },
    { header: 'Location / Landmark', accessor: 'locationDescription' },
    { header: 'Year', accessor: 'year' },
  ];

  const totalHectares = plots.reduce((sum, p) => sum + (p.areaInHectares || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Agricultural Land & Plots</h1>
          <p className="text-xs text-gray-500">
            Register your farming plots to qualify for official DAP and Urea allocation quotas
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-semibold text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Register New Plot</span>
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Summary Card */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase">Total Registered Farm Land</span>
          <p className="text-2xl font-black text-agri-800 mt-1">{totalHectares.toFixed(2)} Hectares</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-agri-50 text-agri-700 rounded-full border border-agri-200">
          {plots.length} Active Plots
        </span>
      </div>

      {/* Register Plot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-1">Register Agricultural Plot</h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter your cultivated plot dimensions and soil type for expert agronomic review.
            </p>

            <form onSubmit={handleCreatePlot} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Plot Identifier / Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.plotIdentifier}
                  onChange={(e) => setFormData({ ...formData, plotIdentifier: e.target.value })}
                  placeholder="e.g. Plot 1 - Denkaka North Field"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Area in Hectares (ሄክታር)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    min="0.05"
                    value={formData.areaInHectares}
                    onChange={(e) => setFormData({ ...formData, areaInHectares: e.target.value })}
                    placeholder="e.g. 1.5"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Soil Type (የአፈር ዓይነት)
                  </label>
                  <select
                    value={formData.soilType}
                    onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
                  >
                    {soilTypes.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Season</label>
                  <select
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
                  >
                    <option value="Meher (Main season)">Meher (Main season / መኸር)</option>
                    <option value="Belg (Short rainy season)">Belg (Short season / በልግ)</option>
                    <option value="Irrigation">Irrigation / የመስኖ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Location Landmark / Description
                </label>
                <input
                  type="text"
                  value={formData.locationDescription}
                  onChange={(e) => setFormData({ ...formData, locationDescription: e.target.value })}
                  placeholder="e.g. Near kebele primary school / river road"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden"
                />
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
                  {submitting ? 'Registering...' : 'Save Plot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={plots}
        searchPlaceholder="Search plots by name or soil type..."
        emptyTitle="No Plots Registered"
        emptyMessage="Register your first agricultural plot using the button above."
      />
    </div>
  );
};

export default FarmerPlots;
