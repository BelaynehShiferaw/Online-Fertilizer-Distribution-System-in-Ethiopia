import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FilePlus, Calculator, DollarSign, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const FarmerNewRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plots, setPlots] = useState([]);
  const [crops, setCrops] = useState([]);
  const [prices, setPrices] = useState({ DAP: 4850, UREA: 4200 });

  const [formData, setFormData] = useState({
    plotId: '',
    cropId: '',
    cultivatedArea: '',
    requestedDap: 0,
    requestedUrea: 0,
    isAdditional: false,
    originalRequestId: '',
  });

  const [estimatedCost, setEstimatedCost] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [plotRes, cropRes, priceRes] = await Promise.all([
          api.get('/plots'),
          api.get('/crops'),
          api.get('/fertilizer-prices/public'),
        ]);

        const fetchedPlots = plotRes.data.plots || [];
        const fetchedCrops = cropRes.data.crops || [];
        setPlots(fetchedPlots);
        setCrops(fetchedCrops);

        const dapPriceObj = (priceRes.data.prices || []).find((p) => p.productCode === 'DAP');
        const ureaPriceObj = (priceRes.data.prices || []).find((p) => p.productCode === 'UREA');
        setPrices({
          DAP: dapPriceObj ? dapPriceObj.pricePerQuintal : 4850,
          UREA: ureaPriceObj ? ureaPriceObj.pricePerQuintal : 4200,
        });

        if (fetchedPlots.length > 0 && fetchedCrops.length > 0) {
          const firstPlot = fetchedPlots[0];
          const firstCrop = fetchedCrops[0];
          const area = firstPlot.areaInHectares;
          const dap = area * (firstCrop.defaultDapRatePerHa || 1.0);
          const urea = area * (firstCrop.defaultUreaRatePerHa || 1.0);

          setFormData({
            plotId: firstPlot._id,
            cropId: firstCrop._id,
            cultivatedArea: area,
            requestedDap: dap,
            requestedUrea: urea,
            isAdditional: false,
            originalRequestId: '',
          });

          setEstimatedCost(dap * (dapPriceObj?.pricePerQuintal || 4850) + urea * (ureaPriceObj?.pricePerQuintal || 4200));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Recalculate on plot/crop change
  const handlePlotOrCropChange = (plotId, cropId) => {
    const selectedPlot = plots.find((p) => p._id === plotId);
    const selectedCrop = crops.find((c) => c._id === cropId);

    const area = selectedPlot ? selectedPlot.areaInHectares : Number(formData.cultivatedArea) || 1;
    const dap = selectedCrop ? area * (selectedCrop.defaultDapRatePerHa || 1.0) : 1;
    const urea = selectedCrop ? area * (selectedCrop.defaultUreaRatePerHa || 1.0) : 1;

    setFormData((prev) => ({
      ...prev,
      plotId,
      cropId,
      cultivatedArea: area,
      requestedDap: Number(dap.toFixed(2)),
      requestedUrea: Number(urea.toFixed(2)),
    }));

    setEstimatedCost(dap * prices.DAP + urea * prices.UREA);
  };

  const handleManualVolumeChange = (field, val) => {
    const num = Number(val);
    const updated = { ...formData, [field]: num };
    setFormData(updated);
    setEstimatedCost(updated.requestedDap * prices.DAP + updated.requestedUrea * prices.UREA);
  };

  const handleSubmitRequest = async (isDraft = false) => {
    if (!formData.plotId || !formData.cropId || !formData.cultivatedArea) {
      return setError('Please select a valid plot and crop.');
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post('/fertilizer-requests', {
        ...formData,
        isDraft,
      });
      navigate('/farmer/requests');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Initializing fertilizer calculator..." size="lg" />;

  if (plots.length === 0) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-3xl border border-gray-200/80 text-center space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Land Plot Required</h2>
        <p className="text-xs text-gray-500">
          You must register at least one agricultural plot before requesting fertilizer quotas.
        </p>
        <button
          onClick={() => navigate('/farmer/plots')}
          className="px-4 py-2 bg-agri-700 text-white rounded-xl text-xs font-bold hover:bg-agri-800"
        >
          Go to Land Registration
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Fertilizer Requirement Form</h1>
        <p className="text-xs text-gray-500">
          Calculate and submit seasonal DAP & Urea requirements for Agricultural Expert review
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
        {/* Plot and Crop Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              1. Select Agricultural Plot
            </label>
            <select
              value={formData.plotId}
              onChange={(e) => handlePlotOrCropChange(e.target.value, formData.cropId)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
            >
              {plots.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.plotIdentifier} ({p.areaInHectares} ha • {p.soilType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              2. Select Crop Type
            </label>
            <select
              value={formData.cropId}
              onChange={(e) => handlePlotOrCropChange(formData.plotId, e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
            >
              {crops.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.nameEn} ({c.nameAm}) - Standard: {c.defaultDapRatePerHa} DAP / {c.defaultUreaRatePerHa} Urea Qtl/ha
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantities Form */}
        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
            3. Scientific Recommended Volumes
          </span>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Requested DAP (Quintals)
              </label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                value={formData.requestedDap}
                onChange={(e) => handleManualVolumeChange('requestedDap', e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold text-agri-800 rounded-xl border border-gray-200 bg-white"
              />
              <span className="text-[10px] text-gray-400">@ {prices.DAP.toLocaleString()} ETB/Qtl</span>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Requested Urea (Quintals)
              </label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={formData.requestedUrea}
                onChange={(e) => handleManualVolumeChange('requestedUrea', e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold text-blue-800 rounded-xl border border-gray-200 bg-white"
              />
              <span className="text-[10px] text-gray-400">@ {prices.UREA.toLocaleString()} ETB/Qtl</span>
            </div>
          </div>
        </div>

        {/* Estimated Cost Summary Card */}
        <div className="p-5 bg-agri-50/70 rounded-2xl border border-agri-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-agri-900 uppercase">Estimated Total Cost</span>
            <p className="text-2xl font-black text-agri-800 mt-0.5">
              {estimatedCost.toLocaleString()} ETB
            </p>
            <p className="text-[10px] text-agri-600">Calculated based on current official price gazette</p>
          </div>
          <DollarSign className="w-8 h-8 text-agri-700 opacity-60" />
        </div>

        {/* Additional Request Toggle */}
        <div className="pt-2">
          <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isAdditional}
              onChange={(e) => setFormData({ ...formData, isAdditional: e.target.checked })}
              className="w-4 h-4 text-agri-700 rounded border-gray-300"
            />
            <span>This is an additional/supplemental fertilizer request for this crop</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmitRequest(true)}
            className="px-4 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmitRequest(false)}
            className="px-6 py-2.5 text-xs font-bold text-white bg-agri-700 rounded-xl hover:bg-agri-800 shadow-md shadow-agri-700/20 transition flex items-center space-x-1.5"
          >
            <span>{submitting ? 'Submitting...' : 'Submit for Agricultural Review'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FarmerNewRequest;
