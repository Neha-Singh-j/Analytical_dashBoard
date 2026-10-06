import React from 'react';
import { Search, Bell, Globe, LogOut } from 'lucide-react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useAuth } from '../../context/AuthContext';

export const Header = () => {
  const { filters, updateFilters } = useAnalytics();
  const { user, logout } = useAuth();

  const currencies = [
    { code: 'USD', symbol: '$', label: 'USD ($)' },
    { code: 'EUR', symbol: '€', label: 'EUR (€)' },
    { code: 'INR', symbol: '₹', label: 'INR (₹)' },
    { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  ];

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search orders, products, customers..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {/* Currency Switcher Dropdown */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium">
          <Globe className="w-4 h-4 text-slate-500" />
          <span className="text-[11px] text-slate-500 font-semibold uppercase">Currency:</span>
          <select
            value={filters.currency}
            onChange={(e) => updateFilters({ currency: e.target.value })}
            className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* User Badge & Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <span className="block text-xs font-bold text-slate-800 leading-none">{user?.name || 'User'}</span>
            <span className="text-[10px] text-slate-400 font-semibold">{user?.role || 'Data Lead'}</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-xs">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};
