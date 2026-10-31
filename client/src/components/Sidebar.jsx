import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  DollarSign,
  Tag,
  ShoppingBag,
  PackageCheck,
  Truck,
  ClipboardList,
  Sliders,
  BookOpen,
  MapPin,
  FilePlus,
  Receipt,
  History,
  Users,
  BellRing,
  BarChart3,
  X,
  Wheat,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) return null;

  const role = user.role;

  // Build navigation items based on role
  let navItems = [];

  if (role === 'manager') {
    navItems = [
      { to: '/manager', label: t('nav.overview'), icon: LayoutDashboard },
      { to: '/manager/financials', label: t('nav.financials'), icon: DollarSign },
      { to: '/manager/prices', label: t('nav.prices'), icon: Tag },
      { to: '/manager/procurement', label: t('nav.procurement'), icon: ShoppingBag },
      { to: '/manager/users', label: t('nav.users'), icon: Users },
      { to: '/manager/reports', label: t('nav.reports'), icon: BarChart3 },
    ];
  } else if (role === 'office_manager') {
    navItems = [
      { to: '/office', label: t('nav.overview'), icon: LayoutDashboard },
      { to: '/office/inventory', label: t('nav.inventory'), icon: PackageCheck },
      { to: '/office/consolidation', label: t('office.consolidationTitle'), icon: ShoppingBag },
      { to: '/office/payments', label: t('nav.payments'), icon: Receipt },
      { to: '/office/distribution', label: t('nav.distribution'), icon: Truck },
      { to: '/office/prices', label: t('nav.prices'), icon: Tag },
      { to: '/office/announcements', label: t('nav.announcements'), icon: BellRing },
      { to: '/office/reports', label: t('nav.reports'), icon: BarChart3 },
    ];
  } else if (role === 'agricultural_expert') {
    navItems = [
      { to: '/expert', label: t('nav.overview'), icon: LayoutDashboard },
      { to: '/expert/reviews', label: t('nav.reviews'), icon: ClipboardList },
      { to: '/expert/recommendations', label: t('nav.recommendations'), icon: Sliders },
      { to: '/expert/advisory', label: t('nav.advisory'), icon: BookOpen },
    ];
  } else if (role === 'laborer') {
    navItems = [
      { to: '/laborer', label: t('nav.overview'), icon: LayoutDashboard },
      { to: '/laborer/tasks', label: t('laborer.ordersTitle'), icon: Truck },
      { to: '/laborer/stock-logs', label: t('laborer.reportDamageTitle'), icon: PackageCheck },
    ];
  } else if (role === 'farmer') {
    navItems = [
      { to: '/farmer', label: t('nav.overview'), icon: LayoutDashboard },
      { to: '/farmer/plots', label: t('nav.myPlots'), icon: MapPin },
      { to: '/farmer/requests/new', label: t('farmer.requestTitle'), icon: FilePlus },
      { to: '/farmer/requests', label: t('nav.requests'), icon: ClipboardList },
      { to: '/farmer/payments', label: t('nav.payments'), icon: Receipt },
      { to: '/farmer/orders', label: t('nav.orders'), icon: Truck },
      { to: '/farmer/history', label: 'History & Archive', icon: History },
    ];
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between lg:hidden">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Menu Navigation
          </span>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === `/${role}`}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-agri-700 text-white shadow-sm shadow-agri-700/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Cooperative Footer Info */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/60 m-2 rounded-xl text-center">
          <p className="text-[11px] font-bold text-gray-700">Federal Democratic Republic of Ethiopia</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Ministry of Agriculture & Cooperatives</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
