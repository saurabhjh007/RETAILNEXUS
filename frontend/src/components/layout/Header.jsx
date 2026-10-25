import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { alertService } from '../../services/alertService';
import { formatDate } from '../../utils/formatters';

const ROUTE_TITLES = {
  '/': { title: 'Operational Dashboard', section: 'Overview' },
  '/products': { title: 'Product Catalog', section: 'Inventory' },
  '/warehouses': { title: 'Warehouse Facilities', section: 'Inventory' },
  '/inventory': { title: 'Stock Levels & Availability', section: 'Inventory' },
  '/transfers': { title: 'Inter-Warehouse Transfers', section: 'Inventory' },
  '/movements': { title: 'Inventory Movement Ledger', section: 'Inventory' },
  '/alerts': { title: 'Low Stock & Critical Alerts', section: 'Inventory' },
  '/orders': { title: 'Customer Orders & Fulfillment', section: 'Operations' },
  '/suppliers': { title: 'Supplier Directory', section: 'Operations' },
  '/purchase-orders': { title: 'Procurement & Purchase Orders', section: 'Operations' },
  '/reports': { title: 'Reports & Financial Analytics', section: 'Insights' },
  '/users': { title: 'User Management & Access Control', section: 'Administration' },
  '/agile': { title: 'Agile Scrum Capstone Delivery', section: 'Project' },
};

export const Header = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const alertRef = useRef(null);
  const profileRef = useRef(null);

  const routeMeta = ROUTE_TITLES[location.pathname] || {
    title: 'RetailNexus Operations',
    section: 'System',
  };

  const currentDateFormatted = formatDate(new Date().toISOString(), false);

  const fetchAlerts = async () => {
    try {
      const res = await alertService.getAlerts({ acknowledged: false, size: 5 });
      if (res.data?.content) {
        setAlerts(res.data.content);
        setUnreadCount(res.data.totalElements || res.data.content.length);
      }
    } catch {
      // silently fallback
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (alertRef.current && !alertRef.current.contains(e.target)) {
        setIsAlertOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAcknowledgeAlert = async (id, e) => {
    e.stopPropagation();
    try {
      await alertService.acknowledge(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // fallback
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?query=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left section: Hamburger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>{routeMeta.section}</span>
            <span>/</span>
            <span className="text-slate-800 font-medium">{routeMeta.title}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {routeMeta.title}
          </h1>
        </div>
      </div>

      {/* Right section: Date, Search, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
          <span>{currentDateFormatted}</span>
        </div>

        {/* Global Search trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline">Search catalog...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white border border-slate-200 rounded">
            /
          </kbd>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={alertRef}>
          <button
            onClick={() => setIsAlertOpen(!isAlertOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isAlertOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Notifications & Alerts</h4>
                  <p className="text-[10px] text-slate-500">Unresolved operational warnings</p>
                </div>
                <button
                  onClick={() => {
                    navigate('/alerts');
                    setIsAlertOpen(false);
                  }}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  View all
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {alerts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                    No active unacknowledged alerts.
                  </div>
                ) : (
                  alerts.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 hover:bg-slate-50 flex items-start justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        {a.severity === 'CRITICAL' ? (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">{a.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{a.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {formatDate(a.createdAt, true)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleAcknowledgeAlert(a.id, e)}
                        className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded shrink-0"
                      >
                        Acknowledge
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                {user?.fullName || 'User'}
              </p>
              <p className="text-[10px] text-slate-400 capitalize">
                {user?.roles?.[0]?.replace('ROLE_', '').toLowerCase().replace('_', ' ') || 'Staff'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in">
              <div className="px-3.5 py-2.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                  {user?.roles?.[0]}
                </span>
              </div>
              <div className="p-1">
                <button
                  onClick={() => {
                    navigate('/users');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg text-left"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account Management</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg text-left font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-in">
            <form onSubmit={handleSearchSubmit} className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-indigo-500 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by SKU or Name (e.g., Tata Salt, boAt)..."
                className="w-full text-sm outline-none text-slate-800 placeholder-slate-400"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 bg-slate-100 rounded"
              >
                ESC
              </button>
            </form>
            <div className="p-3 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Press <b>Enter</b> to execute catalog search</span>
              <span>Searches live inventory catalog</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
