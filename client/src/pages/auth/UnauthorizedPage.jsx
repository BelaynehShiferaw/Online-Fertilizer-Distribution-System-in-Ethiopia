import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UnauthorizedPage = () => {
  const { user } = useAuth();
  const returnPath = user ? `/${user.role}` : '/';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-gray-900">403 - Access Denied</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          You do not possess the required RBAC permissions to access this module. Privileged workflows are restricted to designated cooperative personnel.
        </p>
        <div className="pt-2">
          <Link
            to={returnPath}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Return to Your Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs">
        <div className="text-6xl font-black text-agri-800">404</div>
        <h2 className="text-xl font-bold text-gray-900">Page Not Found</h2>
        <p className="text-xs text-gray-500">
          The requested page could not be located on the OFDMS Ethiopia portal.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
