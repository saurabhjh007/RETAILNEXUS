import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Boxes,
  ArrowLeftRight,
  History,
  AlertTriangle,
  ShoppingCart,
  Users,
  Truck,
  FileText,
  BarChart3,
  Kanban,
  Building2,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_GROUPS = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    ],
  },
  {
    title: 'INVENTORY',
    items: [
      { name: 'Products', path: '/products', icon: Package },
      { name: 'Warehouses', path: '/warehouses', icon: Warehouse },
      { name: 'Stock Levels', path: '/inventory', icon: Boxes },
      { name: 'Stock Transfers', path: '/transfers', icon: ArrowLeftRight },
      { name: 'Movements Ledger', path: '/movements', icon: History },
      { name: 'Low Stock Alerts', path: '/alerts', icon: AlertTriangle, badge: 'alerts' },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { name: 'Customer Orders', path: '/orders', icon: ShoppingCart },
      { name: 'Suppliers', path: '/suppliers', icon: Building2 },
      { name: 'Purchase Orders', path: '/purchase-orders', icon: Truck },
    ],
  },
  {
    title: 'INSIGHTS',
    items: [
      { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { name: 'Users & Roles', path: '/users', icon: Users, role: 'ROLE_ADMIN' },
    ],
  },
  {
    title: 'PROJECT',
    items: [
      { name: 'Agile Delivery', path: '/agile', icon: Kanban },
    ],
  },
];

export const Sidebar = ({ isOpen, onClose, alertCount = 0 }) => {
  const { user, hasRole } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B1120] text-slate-300 flex flex-col border-r border-slate-800/80 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 bg-[#070C16]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                RetailNexus
              </div>
              <p className="text-[10px] text-indigo-400/90 font-medium tracking-wide">ENTERPRISE SAAS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {NAV_GROUPS.map((group) => {
            const filteredItems = group.items.filter(
              (item) => !item.role || hasRole(item.role)
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={group.title}>
                <h4 className="px-3 text-[10px] font-bold text-slate-400/80 tracking-wider mb-1.5">
                  {group.title}
                </h4>
                <div className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => onClose && onClose()}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all duration-150 group ${
                            isActive
                              ? 'bg-indigo-600/15 text-white font-semibold shadow-sm'
                              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-2.5">
                              <Icon
                                className={`w-4 h-4 transition-colors ${
                                  isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                                }`}
                              />
                              <span>{item.name}</span>
                            </div>
                            {item.badge === 'alerts' && alertCount > 0 && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                                {alertCount}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer info & active user badge */}
        <div className="p-3.5 border-t border-slate-800/80 bg-[#070C16]">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/50 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'Operator'}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <p className="text-[10px] text-slate-400 truncate capitalize">
                  {user?.roles?.[0]?.replace('ROLE_', '').toLowerCase().replace('_', ' ') || 'Staff'}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>₹ INR | Asia/Kolkata</span>
            <span className="font-mono text-emerald-400">v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
