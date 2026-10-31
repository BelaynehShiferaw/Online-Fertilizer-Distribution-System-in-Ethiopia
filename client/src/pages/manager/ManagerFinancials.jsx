import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DollarSign, Check, X, Plus, AlertCircle, FileText } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import ConfirmationModal from '../../components/ConfirmationModal';

const ManagerFinancials = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'salaries'

  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'approve_expense' | 'reject_expense' | 'approve_salary'
  const [modalNotes, setModalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchFinancials = async () => {
    try {
      setLoading(true);
      const [sumRes, expRes, salRes] = await Promise.all([
        api.get('/financial/summary'),
        api.get('/financial/expenses'),
        api.get('/financial/salaries'),
      ]);
      setSummary(sumRes.data.summary);
      setExpenses(expRes.data.expenses || []);
      setSalaries(salRes.data.salaries || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  const handleConfirmDecision = async () => {
    if (!selectedItem || !modalAction) return;
    setSubmitting(true);
    try {
      if (modalAction === 'approve_expense') {
        await api.patch(`/financial/expenses/${selectedItem._id}`, { status: 'approved', notes: modalNotes });
      } else if (modalAction === 'reject_expense') {
        await api.patch(`/financial/expenses/${selectedItem._id}`, { status: 'rejected', notes: modalNotes });
      } else if (modalAction === 'approve_salary') {
        await api.patch(`/financial/salaries/${selectedItem._id}`, { status: 'approved', notes: modalNotes });
      } else if (modalAction === 'pay_salary') {
        await api.patch(`/financial/salaries/${selectedItem._id}`, { status: 'paid', notes: modalNotes });
      }
      setSelectedItem(null);
      setModalAction(null);
      setModalNotes('');
      fetchFinancials();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading financial records..." size="lg" />;

  const expenseColumns = [
    { header: 'Category', accessor: 'category', render: (row) => <span className="font-semibold">{row.category.replace(/_/g, ' ')}</span> },
    { header: 'Description', accessor: 'description' },
    { header: 'Amount (ETB)', accessor: 'amount', render: (row) => <span className="font-bold text-gray-900">{row.amount.toLocaleString()} ETB</span> },
    { header: 'Requested By', render: (row) => row.requestedBy?.name || 'Staff' },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      render: (row) =>
        row.status === 'pending' ? (
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => {
                setSelectedItem(row);
                setModalAction('approve_expense');
              }}
              className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700"
            >
              Approve
            </button>
            <button
              onClick={() => {
                setSelectedItem(row);
                setModalAction('reject_expense');
              }}
              className="px-2 py-1 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700"
            >
              Reject
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Decided</span>
        ),
    },
  ];

  const salaryColumns = [
    { header: 'Employee', render: (row) => <span className="font-semibold">{row.employeeName}</span> },
    { header: 'Role', accessor: 'role' },
    { header: 'Period', accessor: 'period' },
    { header: 'Amount (ETB)', render: (row) => <span className="font-bold text-gray-900">{row.amount.toLocaleString()} ETB</span> },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-1.5">
          {row.status === 'pending' && (
            <button
              onClick={() => {
                setSelectedItem(row);
                setModalAction('approve_salary');
              }}
              className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700"
            >
              Approve
            </button>
          )}
          {row.status === 'approved' && (
            <button
              onClick={() => {
                setSelectedItem(row);
                setModalAction('pay_salary');
              }}
              className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
            >
              Mark Paid
            </button>
          )}
          {row.status === 'paid' && <span className="text-xs text-emerald-700 font-semibold">Paid</span>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Cooperative Financial Oversight</h1>
        <p className="text-xs text-gray-500">
          Authorize operational budgets, employee wages, and review consolidated income vs expenditures
        </p>
      </div>

      {/* Financial Health Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
            <span className="text-xs font-bold text-gray-500 uppercase">Verified Income</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {summary.totalIncome.toLocaleString()} ETB
            </p>
            <p className="text-[10px] text-gray-400 mt-1">{summary.verifiedPaymentCount} Farmer Payments</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
            <span className="text-xs font-bold text-gray-500 uppercase">Operational Expenses</span>
            <p className="text-2xl font-black text-rose-700 mt-1">
              {summary.totalExpenses.toLocaleString()} ETB
            </p>
            <p className="text-[10px] text-gray-400 mt-1">Warehouse, Logistics, Security</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
            <span className="text-xs font-bold text-gray-500 uppercase">Employee Salaries</span>
            <p className="text-2xl font-black text-blue-700 mt-1">
              {summary.totalSalaries.toLocaleString()} ETB
            </p>
            <p className="text-[10px] text-gray-400 mt-1">Warehouse staff & laborers</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
            <span className="text-xs font-bold text-gray-500 uppercase">Net Reserve Balance</span>
            <p className={`text-2xl font-black mt-1 ${summary.netBalance >= 0 ? 'text-agri-800' : 'text-rose-600'}`}>
              {summary.netBalance.toLocaleString()} ETB
            </p>
            <p className="text-[10px] text-gray-400 mt-1">Income minus all obligations</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'expenses'
              ? 'border-agri-700 text-agri-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Operational Expenses ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab('salaries')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'salaries'
              ? 'border-agri-700 text-agri-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Staff Salaries ({salaries.length})
        </button>
      </div>

      {/* Tables */}
      {activeTab === 'expenses' ? (
        <DataTable
          columns={expenseColumns}
          data={expenses}
          searchPlaceholder="Search expenses by category or description..."
          emptyTitle="No Expenses Recorded"
          emptyMessage="Operational expense claims will appear here for manager authorization."
        />
      ) : (
        <DataTable
          columns={salaryColumns}
          data={salaries}
          searchPlaceholder="Search salaries by employee or role..."
          emptyTitle="No Salary Payments"
          emptyMessage="Employee salary payments will appear here for authorization."
        />
      )}

      {/* Decision Modal */}
      <ConfirmationModal
        isOpen={!!selectedItem}
        title={
          modalAction?.includes('approve')
            ? 'Approve Financial Transaction'
            : modalAction?.includes('reject')
            ? 'Reject Financial Expense'
            : 'Mark Salary Paid'
        }
        message={`Are you sure you want to proceed with this action for ${
          selectedItem?.description || selectedItem?.employeeName || 'this item'
        }?`}
        confirmVariant={modalAction?.includes('reject') ? 'danger' : 'primary'}
        onConfirm={handleConfirmDecision}
        onCancel={() => {
          setSelectedItem(null);
          setModalAction(null);
        }}
      >
        <div className="mt-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Manager Notes / Payment Reference:
          </label>
          <input
            type="text"
            value={modalNotes}
            onChange={(e) => setModalNotes(e.target.value)}
            placeholder="e.g. Approved under fiscal budget 2026 / CBE Ref #9921"
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
          />
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default ManagerFinancials;
