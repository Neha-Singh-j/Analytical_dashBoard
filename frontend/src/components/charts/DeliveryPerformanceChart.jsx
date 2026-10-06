import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useAnalytics } from '../../context/AnalyticsContext';

export const DeliveryPerformanceChart = ({ data = [] }) => {
  const { openDrillDown } = useAnalytics();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      <div>
        <h3 className="font-bold text-slate-800 text-base mb-0.5">Delivery Performance</h3>
        <p className="text-xs text-slate-400 font-medium">Logistics & shipment fulfillment status</p>
      </div>

      <div className="h-48 w-full my-2">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            No delivery data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  openDrillDown('delivery', e.activePayload[0].payload);
                }
              }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="status"
                type="category"
                tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                formatter={(val) => [`${val} Shipments`, 'Count']}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={22} className="cursor-pointer">
                {data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color || '#3B82F6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>Click bar to view filtered shipments</span>
        <span className="font-bold text-slate-700">Live Logistics API</span>
      </div>
    </div>
  );
};
