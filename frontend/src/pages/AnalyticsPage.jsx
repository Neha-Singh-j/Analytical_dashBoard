import React from 'react';
import { TrendingUp, PieChart as PieIcon, Truck, Layers, DollarSign } from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext';
import { FilterBar } from '../components/common/FilterBar';
import { RevenueTrendChart } from '../components/charts/RevenueTrendChart';
import { CategoryRevenueChart } from '../components/charts/CategoryRevenueChart';
import { DeliveryPerformanceChart } from '../components/charts/DeliveryPerformanceChart';

export const AnalyticsPage = () => {
  const { summary, loading, formatCurrency } = useAnalytics();

  if (loading && !summary) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-semibold text-sm">Loading deep analytics engine...</p>
      </div>
    );
  }

  const { category_revenue = [], revenue_trend = [], delivery_performance = [] } = summary || {};

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Deep Analytics & Reports</h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Multidimensional breakdown of revenue, categories, and logistics performance
        </p>
      </div>

      <FilterBar />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueTrendChart data={revenue_trend} />
        </div>
        <div>
          <CategoryRevenueChart data={category_revenue} />
        </div>
      </div>

      {/* Category Performance Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Category Performance Matrix</h3>
            <p className="text-xs text-slate-400 font-medium">Aggregated sales metrics per product category</p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Pandas Aggregation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase text-[10px]">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Total Revenue</th>
                <th className="py-3 px-4">Orders Count</th>
                <th className="py-3 px-4">Quantity Sold</th>
                <th className="py-3 px-4 text-right">Avg Order Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {category_revenue.map((cat) => (
                <tr key={cat.category} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{cat.category}</td>
                  <td className="py-3.5 px-4 font-bold text-blue-600">{formatCurrency(cat.revenue)}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{cat.orders}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{cat.quantity_sold}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {formatCurrency(cat.avg_order_value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logistics & Delivery Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeliveryPerformanceChart data={delivery_performance} />

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-base">Analytical Insights</h3>
          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></span>
              <div>
                <strong className="text-slate-800 block mb-0.5">Automated Multi-Dataset Joins:</strong>
                Data is dynamically normalized from raw JSON, CSV, and XML datasets into SQLite relational tables.
              </div>
            </li>
            <li className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5"></span>
              <div>
                <strong className="text-slate-800 block mb-0.5">Live Exchange Rate Conversion:</strong>
                Revenue figures adjust dynamically based on target currency selection.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
