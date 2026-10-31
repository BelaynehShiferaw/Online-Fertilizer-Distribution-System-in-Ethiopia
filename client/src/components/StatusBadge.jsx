import React from 'react';
import { useTranslation } from 'react-i18next';

const statusColorMap = {
  // Fertilizer request statuses
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  under_agricultural_review: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  changes_requested: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  awaiting_payment: 'bg-purple-50 text-purple-700 border-purple-200',
  payment_under_verification: 'bg-orange-50 text-orange-700 border-orange-200',
  payment_verified: 'bg-teal-50 text-teal-700 border-teal-200',
  ready_for_distribution: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  partially_distributed: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  completed: 'bg-green-100 text-green-800 border-green-300',

  // General & payments
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  inactive: 'bg-gray-100 text-gray-600 border-gray-300',
  suspended: 'bg-red-50 text-red-700 border-red-200',
};

const StatusBadge = ({ status, className = '' }) => {
  const { t } = useTranslation();
  if (!status) return null;

  const colorClasses = statusColorMap[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  const label = t(`status.${status}`, status.replace(/_/g, ' '));

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {label}
    </span>
  );
};

export default StatusBadge;
