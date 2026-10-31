import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  confirmVariant = 'primary', // 'primary' | 'danger'
  onConfirm,
  onCancel,
  children,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  confirmVariant === 'danger'
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-agri-100 text-agri-700'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">{message}</p>

          {children}

          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              {cancelText || t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition ${
                confirmVariant === 'danger'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-agri-700 hover:bg-agri-800'
              }`}
            >
              {confirmText || t('common.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
