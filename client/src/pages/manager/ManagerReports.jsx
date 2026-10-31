import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart3, Download, Printer, Filter, Calendar } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManagerReports = () => {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('inventory'); // 'inventory' | 'distribution' | 'financial'
  const [reportData, setReportData] = useState(null);

  const fetchReport = async (type) => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/${type}`);
      setReportData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(reportType);
  }, [reportType]);

  const handleDownloadCsv = () => {
    window.open(`/api/v1/reports/export-csv?type=${reportType}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Cooperative Audit Reports</h1>
          <p className="text-xs text-gray-500">
            Generate and export verified inventory, distribution, and financial statements
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-4 h-4 mr-1.5 text-gray-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-semibold shadow-xs transition"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200">
        <button
          onClick={() => setReportType('inventory')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            reportType === 'inventory' ? 'border-agri-700 text-agri-800' : 'border-transparent text-gray-500'
          }`}
        >
          Inventory & Warehouse Ledger
        </button>
        <button
          onClick={() => setReportType('distribution')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            reportType === 'distribution' ? 'border-agri-700 text-agri-800' : 'border-transparent text-gray-500'
          }`}
        >
          Fertilizer Distribution Ledger
        </button>
        <button
          onClick={() => setReportType('financial')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            reportType === 'financial' ? 'border-agri-700 text-agri-800' : 'border-transparent text-gray-500'
          }`}
        >
          Financial & Payment Audit
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Generating report dataset..." />
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-extrabold text-gray-900 text-base uppercase tracking-wider">
                {reportType === 'inventory'
                  ? 'Official Stock Ledger Summary'
                  : reportType === 'distribution'
                  ? 'Official Fertilizer Distribution Log'
                  : 'Financial Ledger & Cashflow Audit'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Generated: {new Date(reportData?.generatedAt || Date.now()).toLocaleString()}
              </p>
            </div>
            <span className="text-xs font-bold text-agri-800 bg-agri-50 px-3 py-1 rounded-full border border-agri-200">
              Verified Audit Data
            </span>
          </div>

          {/* Render Inventory Report Content */}
          {reportType === 'inventory' && reportData?.summaryByProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(reportData.summaryByProduct).map(([code, p]) => (
                  <div key={code} className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{code} - {p.nameEn}</span>
                      <span className="text-xs font-bold text-agri-700">{p.availableStock} Qtl Available</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-gray-200">
                      <div>
                        <span className="text-gray-400 block">Total Inbound</span>
                        <span className="font-bold text-gray-800">{p.totalIncoming} Qtl</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Distributed</span>
                        <span className="font-bold text-cyan-800">{p.totalDistributed} Qtl</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Damaged/Loss</span>
                        <span className="font-bold text-rose-800">{p.totalDamaged} Qtl</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Ledger Transactions */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Recent Ledger Transactions (Audit Trail)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase">
                      <tr>
                        <th className="p-2">Txn #</th>
                        <th className="p-2">Product</th>
                        <th className="p-2">Type</th>
                        <th className="p-2">Quantity</th>
                        <th className="p-2">Balance After</th>
                        <th className="p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(reportData.recentTransactions || []).map((t) => (
                        <tr key={t._id}>
                          <td className="p-2 font-mono font-medium">{t.transactionNumber}</td>
                          <td className="p-2 font-bold">{t.productCode}</td>
                          <td className="p-2 capitalize">{t.transactionType.replace(/_/g, ' ')}</td>
                          <td className="p-2 font-bold">{t.quantityQuintals} Qtl</td>
                          <td className="p-2">{t.newStockBalance} Qtl</td>
                          <td className="p-2 text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Render Distribution Report Content */}
          {reportType === 'distribution' && reportData?.metrics && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-xs text-gray-500">Total Orders</span>
                  <p className="text-xl font-bold text-gray-900">{reportData.metrics.totalOrders}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-xs text-gray-500">Completed Deliveries</span>
                  <p className="text-xl font-bold text-emerald-700">{reportData.metrics.completedOrders}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-xs text-gray-500">DAP Disbursed</span>
                  <p className="text-xl font-bold text-agri-700">{reportData.metrics.totalDapDistributed} Qtl</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-xs text-gray-500">Urea Disbursed</span>
                  <p className="text-xl font-bold text-blue-700">{reportData.metrics.totalUreaDistributed} Qtl</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase">
                    <tr>
                      <th className="p-2">Order #</th>
                      <th className="p-2">Farmer</th>
                      <th className="p-2">DAP (Qtl)</th>
                      <th className="p-2">Urea (Qtl)</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Signed Ack</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(reportData.orders || []).map((o) => (
                      <tr key={o._id}>
                        <td className="p-2 font-mono font-medium">{o.orderNumber}</td>
                        <td className="p-2 font-bold">{o.farmer?.name}</td>
                        <td className="p-2">{o.distributedDap} / {o.authorizedDap}</td>
                        <td className="p-2">{o.distributedUrea} / {o.authorizedUrea}</td>
                        <td className="p-2 uppercase font-semibold">{o.status}</td>
                        <td className="p-2">{o.farmerAcknowledgmentSigned ? '✓ Yes' : 'Pending'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Render Financial Report Content */}
          {reportType === 'financial' && reportData?.financials && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <span className="text-xs text-emerald-800 font-bold uppercase">Total Verified Income</span>
                  <p className="text-2xl font-black text-emerald-900 mt-1">
                    {reportData.financials.totalVerifiedIncome.toLocaleString()} ETB
                  </p>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl">
                  <span className="text-xs text-rose-800 font-bold uppercase">Total Approved Expenses</span>
                  <p className="text-2xl font-black text-rose-900 mt-1">
                    {(reportData.financials.totalExpenses + reportData.financials.totalSalaries).toLocaleString()} ETB
                  </p>
                </div>
                <div className="p-4 bg-agri-50 rounded-xl">
                  <span className="text-xs text-agri-800 font-bold uppercase">Net Cash Balance</span>
                  <p className="text-2xl font-black text-agri-950 mt-1">
                    {reportData.financials.netCashflow.toLocaleString()} ETB
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManagerReports;
