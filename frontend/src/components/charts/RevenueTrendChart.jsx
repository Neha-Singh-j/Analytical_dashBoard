import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useAnalytics } from '../../context/AnalyticsContext';

export const RevenueTrendChart = ({ data = [] }) => {
  const [viewType, setViewType] = useState('revenue'); // 'revenue' | 'orders'
  const { formatCurrency, openDrillDown } = useAnalytics();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Website Revenue & Orders Trend</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Historical breakdown over time</p>
        </div>

        {/* Revenue vs Orders Toggle Switch (Required Feature) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setViewType('revenue')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewType === 'revenue'
                ? 'bg-white text-blue-600 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setViewType('orders')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewType === 'orders'
                ? 'bg-white text-blue-600 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
            No trend data available for current filter criteria
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  openDrillDown('trend', e.activePayload[0].payload);
                }
              }}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val) => (viewType === 'revenue' ? formatCurrency(val) : `${val} Orders`)}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
              />

              {viewType === 'revenue' ? (
                <>
                  <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} fill="url(#revenueGrad)" />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={30} opacity={0.4} />
                </>
              ) : (
                <>
                  <Area type="monotone" dataKey="orders" stroke="#06B6D4" strokeWidth={3} fill="url(#ordersGrad)" />
                  <Bar dataKey="orders" fill="#22D3EE" radius={[6, 6, 0, 0]} maxBarSize={30} opacity={0.5} />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
