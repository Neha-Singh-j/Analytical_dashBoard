import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useAnalytics } from '../../context/AnalyticsContext';

const COLORS = ['#2563EB', '#06B6D4', '#F59E0B', '#EC4899', '#8B5CF6'];

export const CategoryRevenueChart = ({ data = [] }) => {
  const { formatCurrency, openDrillDown } = useAnalytics();

  const totalRevenue = data.reduce((acc, curr) => acc + (curr.revenue || 0), 0);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      <div>
        <h3 className="font-bold text-slate-800 text-base mb-0.5">Category Breakdown</h3>
        <p className="text-xs text-slate-400 font-medium">Revenue distribution per category</p>
      </div>

      <div className="h-56 w-full relative flex items-center justify-center my-2">
        {data.length === 0 ? (
          <div className="text-slate-400 text-sm font-medium">No category data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="revenue"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                onClick={(entry) => openDrillDown('category', entry)}
                className="cursor-pointer focus:outline-none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val) => formatCurrency(val)}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend list */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        {data.map((cat, idx) => {
          const pct = totalRevenue > 0 ? ((cat.revenue / totalRevenue) * 100).toFixed(1) : 0;
          return (
            <div
              key={cat.category}
              onClick={() => openDrillDown('category', cat)}
              className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                ></span>
                <span className="font-semibold text-slate-700">{cat.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">{formatCurrency(cat.revenue)}</span>
                <span className="text-[11px] font-medium text-slate-400 w-10 text-right">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
