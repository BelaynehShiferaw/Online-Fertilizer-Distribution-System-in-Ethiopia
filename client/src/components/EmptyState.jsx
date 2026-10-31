import React from 'react';
import { PackageOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EmptyState = ({ title, message, icon: Icon = PackageOpen, actionText, onAction }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-gray-100 shadow-xs">
      <div className="w-14 h-14 rounded-full bg-agri-50 text-agri-700 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        {title || t('common.noData')}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        {message || 'There are no items recorded in this section yet.'}
      </p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-agri-700 hover:bg-agri-800 rounded-lg shadow-sm transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
