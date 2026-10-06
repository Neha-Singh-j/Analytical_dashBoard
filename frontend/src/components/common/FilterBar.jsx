import React from 'react';
import { Filter, Calendar, Tag, Truck, RefreshCw } from 'lucide-react';
import { useAnalytics } from '../../context/AnalyticsContext';

export const FilterBar = () => {
  const { filters, updateFilters, resetFilters } = useAnalytics();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 font-semibold text-slate-700 text-sm">
        <Filter className="w-4 h-4 text-blue-600" />
        <span>Filters & Controls</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Date Range Start */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">From:</span>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => updateFilters({ startDate: e.target.value })}
            className="bg-transparent text-slate-700 font-semibold focus:outline-none"
          />
        </div>

        {/* Date Range End */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">To:</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => updateFilters({ endDate: e.target.value })}
            className="bg-transparent text-slate-700 font-semibold focus:outline-none"
          />
        </div>

        {/* Category Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
          <Tag className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Category:</span>
          <select
            value={filters.category}
            onChange={(e) => updateFilters({ category: e.target.value })}
            className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer capitalize"
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="furniture">Furniture</option>
          </select>
        </div>

        {/* Delivery Status Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
          <Truck className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Status:</span>
          <select
            value={filters.deliveryStatus}
            onChange={(e) => updateFilters({ deliveryStatus: e.target.value })}
            className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer capitalize"
          >
            <option value="all">All Statuses</option>
            <option value="delivered">Delivered (On-Time)</option>
            <option value="delayed">Delayed</option>
            <option value="in transit">In Transit</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
