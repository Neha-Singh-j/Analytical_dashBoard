import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  TrendingUp,
  Database,
  LogOut,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Orders', path: '/orders', icon: ShoppingBag },
    { label: 'Analytics', path: '/analytics', icon: TrendingUp },
    { label: 'Data Ingestion', path: '/data', icon: Database },
  ];

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col justify-between p-4 fixed left-0 top-0 z-30 shadow-xs">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-3 py-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800 tracking-tight leading-none">Pulse Analytics</h1>
            <span className="text-xs text-slate-400 font-medium">Enterprise SaaS</span>
          </div>
        </div>

        {/* Dynamic Logged-in User Profile Header (Matching Reference Image 1 & 3) */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-xs shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-xs text-slate-800 truncate">{user?.name || 'User'}</h4>
              <p className="text-[11px] text-slate-400 truncate">{user?.role || 'Data Lead'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Footer Settings Card */}
      <div className="pt-4 border-t border-slate-100">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-4 shadow-md shadow-blue-500/10">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-5 h-5 text-blue-200" />
            <h5 className="font-bold text-sm">PRO Data Pipeline</h5>
          </div>
          <p className="text-xs text-blue-100 mb-3 leading-relaxed">
            Automatic normalization and live API currency conversion active.
          </p>
          <div className="w-full bg-blue-400/30 rounded-full h-1.5 overflow-hidden">
            <div className="bg-white h-full w-[85%] rounded-full"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};
