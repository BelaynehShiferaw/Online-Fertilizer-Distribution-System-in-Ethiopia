import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import LanguageSwitcher from './LanguageSwitcher';
import {
  Bell,
  Menu,
  User,
  LogOut,
  ShieldCheck,
  CheckCircle,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

const roleColorMap = {
  manager: 'bg-purple-100 text-purple-800 border-purple-200',
  office_manager: 'bg-blue-100 text-blue-800 border-blue-200',
  agricultural_expert: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  laborer: 'bg-amber-100 text-amber-800 border-amber-200',
  farmer: 'bg-green-100 text-green-800 border-green-200',
};

const Navbar = ({ onToggleSidebar }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  const isAmharic = i18n.language === 'am';

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleBadgeClass = user ? roleColorMap[user.role] || 'bg-gray-100 text-gray-800' : '';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand / Mobile Toggle */}
          <div className="flex items-center space-x-3">
            {user && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-hidden"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}

            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-agri-800 to-agri-600 flex items-center justify-center shadow-md shadow-agri-700/20 text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-gray-900 leading-none">
                  OFDMS <span className="text-agri-700 font-medium text-xs ml-1">Ethiopia</span>
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {t('systemShort')}
                </span>
              </div>
            </Link>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />

            {user ? (
              <>
                {/* Role Pill Badge */}
                <span
                  className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${roleBadgeClass}`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  {t(`roles.${user.role}`, user.role)}
                </span>

                {/* Notifications Bell Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-900">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-agri-700 hover:underline font-medium"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-gray-400">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                markAsRead(n._id);
                                if (n.actionUrl) navigate(n.actionUrl);
                                setShowNotifications(false);
                              }}
                              className={`p-3.5 hover:bg-gray-50/80 cursor-pointer transition flex items-start space-x-3 ${
                                !n.isRead ? 'bg-agri-50/40' : ''
                              }`}
                            >
                              <div className="mt-0.5 text-agri-700">
                                <CheckCircle className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-900 truncate">
                                  {isAmharic ? n.titleAm || n.titleEn : n.titleEn}
                                </p>
                                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                  {isAmharic ? n.messageAm || n.messageEn : n.messageEn}
                                </p>
                                <span className="text-[10px] text-gray-400 mt-1 block">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar Menu Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-agri-100 text-agri-800 font-bold text-xs flex items-center justify-center border border-agri-300">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden md:inline-block text-xs font-semibold text-gray-800 max-w-[120px] truncate">
                      {user.name}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900">{user.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{t('nav.profile')}</span>
                      </Link>

                      <button
                        type="button"
                        onClick={logout}
                        className="w-full text-left flex items-center space-x-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 border-t border-gray-100 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('common.logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-agri-800 hover:bg-gray-100 rounded-lg transition"
                >
                  {t('common.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-agri-700 hover:bg-agri-800 rounded-lg shadow-sm transition"
                >
                  {t('common.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
