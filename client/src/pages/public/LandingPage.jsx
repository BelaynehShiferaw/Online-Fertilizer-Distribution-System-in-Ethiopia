import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import {
  Sprout,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Truck,
  Users,
  Award,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await api.get('/fertilizer-prices/public');
        if (res.data.success) {
          setPrices(res.data.prices || []);
        }
      } catch (e) {
        // Fallback demo prices if backend offline
        setPrices([
          { productCode: 'DAP', pricePerQuintal: 4850, currency: 'ETB', effectiveDate: '2026-01-01' },
          { productCode: 'UREA', pricePerQuintal: 4200, currency: 'ETB', effectiveDate: '2026-01-01' },
        ]);
      }
    };
    fetchPrices();
  }, []);

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-agri-950 via-agri-900 to-agri-800 text-white p-8 sm:p-14 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-agri-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-ethiopia-yellow/10 blur-3xl pointer-events-none"></div>

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-agri-800/80 border border-agri-700/60 text-xs font-semibold text-agri-300">
            <ShieldCheck className="w-4 h-4 text-agri-400" />
            <span>{t('landing.badge')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {t('landing.heroTitle')}
          </h1>

          <p className="text-base sm:text-lg text-agri-100/90 leading-relaxed max-w-2xl">
            {t('landing.heroSubtitle')}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-agri-500 hover:bg-agri-400 text-agri-950 font-bold text-sm shadow-lg shadow-agri-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <span>{t('landing.ctaRegister')}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-xs border border-white/15 transition-all"
            >
              <span>{t('landing.ctaLogin')}</span>
            </Link>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 mt-12 border-t border-white/10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-agri-300">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">50,000+</p>
              <p className="text-xs text-agri-200">Registered Farmers</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-ethiopia-yellow">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">120+ Unions</p>
              <p className="text-xs text-agri-200">Cooperative Distribution Depots</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-agri-300">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">1,200,000 Qtl</p>
              <p className="text-xs text-agri-200">Subsidized Fertilizer Disbursed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Official Subsidized Fertilizer Prices Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-agri-700 tracking-wider uppercase">
            Official 2026 Price Gazette
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Current Subsidized Fertilizer Rates
          </h2>
          <p className="text-sm text-gray-500">
            Set by the cooperative management and published for total transparency across Ethiopia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* DAP Card */}
          <div className="bg-white rounded-2xl p-6 border-2 border-agri-600/30 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-agri-100 text-agri-800 font-black flex items-center justify-center text-sm">
                  DAP
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Di-Ammonium Phosphate (DAP)</h3>
                  <p className="text-xs text-gray-500">ዳፕ ማዳበሪያ (18-46-0)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-agri-50 text-agri-700 border border-agri-200">
                Official Rate
              </span>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-gray-900">4,850</span>
                <span className="text-xs font-semibold text-gray-500 ml-1.5">ETB / Quintal</span>
              </div>
              <span className="text-xs text-gray-400">1 Quintal = 100 kg (2 Bags)</span>
            </div>
          </div>

          {/* Urea Card */}
          <div className="bg-white rounded-2xl p-6 border-2 border-blue-500/30 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-black flex items-center justify-center text-sm">
                  UREA
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Granular Urea Fertilizer</h3>
                  <p className="text-xs text-gray-500">ዩሪያ ማዳበሪያ (46% ናይትሮጅን)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Official Rate
              </span>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-gray-900">4,200</span>
                <span className="text-xs font-semibold text-gray-500 ml-1.5">ETB / Quintal</span>
              </div>
              <span className="text-xs text-gray-400">1 Quintal = 100 kg (2 Bags)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Workflow Section */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-xs space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-agri-700 tracking-wider uppercase">
            End-To-End Integrity
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {t('landing.workflowTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-agri-700 text-white font-bold flex items-center justify-center text-xs">
              1
            </div>
            <h4 className="font-bold text-sm text-gray-900">{t('landing.workflowStep1')}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{t('landing.workflowStep1Desc')}</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-agri-700 text-white font-bold flex items-center justify-center text-xs">
              2
            </div>
            <h4 className="font-bold text-sm text-gray-900">{t('landing.workflowStep2')}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{t('landing.workflowStep2Desc')}</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-agri-700 text-white font-bold flex items-center justify-center text-xs">
              3
            </div>
            <h4 className="font-bold text-sm text-gray-900">{t('landing.workflowStep3')}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{t('landing.workflowStep3Desc')}</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-agri-700 text-white font-bold flex items-center justify-center text-xs">
              4
            </div>
            <h4 className="font-bold text-sm text-gray-900">{t('landing.workflowStep4')}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{t('landing.workflowStep4Desc')}</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-agri-700 text-white font-bold flex items-center justify-center text-xs">
              5
            </div>
            <h4 className="font-bold text-sm text-gray-900">{t('landing.workflowStep5')}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{t('landing.workflowStep5Desc')}</p>
          </div>
        </div>
      </section>

      {/* Role Ecosystem Callout */}
      <section className="bg-agri-50/70 rounded-3xl p-8 sm:p-12 border border-agri-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h3 className="text-xl sm:text-2xl font-black text-agri-950">
            Dedicated Portals for Every Supply Chain Role
          </h3>
          <p className="text-sm text-agri-800/80">
            Connecting General Managers, Office Managers, Agricultural Experts, Warehouse Laborers, and Farmers in a single secure platform.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs shadow-sm transition"
          >
            Farmer Self-Registration
          </Link>
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs border border-gray-200 shadow-xs transition"
          >
            Staff Portal Login
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
