import React from 'react';
import { ShoppingBag, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext';
import { useAuth } from '../context/AuthContext';
import { FilterBar } from '../components/common/FilterBar';
import { KpiCard } from '../components/common/KpiCard';
import { RevenueTrendChart } from '../components/charts/RevenueTrendChart';
import { CategoryRevenueChart } from '../components/charts/CategoryRevenueChart';
import { DeliveryPerformanceChart } from '../components/charts/DeliveryPerformanceChart';
import { Modal } from '../components/common/Modal';

export const DashboardPage = () => {
  const { summary, loading, error, formatCurrency, drillDownModal, closeDrillDown, openDrillDown } = useAnalytics();
  const { user } = useAuth();

  if (loading && !summary) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-semibold text-sm">Processing normalized backend data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
          <h3 className="font-bold text-lg mb-1">Failed to load analytics</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const {
    total_orders = 0,
    total_revenue = 0,
    delayed_orders = 0,
    on_time_orders = 0,
    category_revenue = [],
    revenue_trend = [],
    delivery_performance = [],
  } = summary || {};

  const onTimePercentage = total_orders > 0 ? ((on_time_orders / total_orders) * 100).toFixed(0) : 100;

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Top Welcome Heading (Matching Reference Image 1 & 3) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Hi, Welcome back{user?.name ? `, ${user.name}` : ''}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time cross-dataset analytics for Orders, Products, and Shipments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            SQLite Pipeline Active
          </span>
        </div>
      </div>

      {/* Global Interactive Filter Bar */}
      <FilterBar />

      {/* 4 Pastel KPI Cards (Matching Reference Image 1 & 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Orders"
          value={total_orders}
          subtitle="Processed items across channels"
          icon={ShoppingBag}
          variant="blue"
          onClick={() => openDrillDown('kpi', { title: 'Total Orders', value: total_orders })}
        />
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(total_revenue)}
          subtitle="Converted target currency"
          icon={DollarSign}
          variant="cyan"
          onClick={() => openDrillDown('kpi', { title: 'Total Revenue', value: formatCurrency(total_revenue) })}
        />
        <KpiCard
          title="Delayed Orders"
          value={delayed_orders}
          subtitle="Shipments past expected date"
          icon={Clock}
          variant="pink"
          onClick={() => openDrillDown('kpi', { title: 'Delayed Orders', value: delayed_orders })}
        />
        <KpiCard
          title="On-Time Rate"
          value={`${onTimePercentage}%`}
          subtitle={`${on_time_orders} on-time deliveries`}
          icon={CheckCircle2}
          variant="yellow"
          onClick={() => openDrillDown('kpi', { title: 'On-Time Rate', value: `${onTimePercentage}%` })}
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Combo Chart (Spans 2 columns) */}
        <div className="lg:col-span-2">
          <RevenueTrendChart data={revenue_trend} />
        </div>

        {/* Category Breakdown Pie/Donut Chart */}
        <div>
          <CategoryRevenueChart data={category_revenue} />
        </div>
      </div>

      {/* Bottom Row: Delivery Performance & Quick Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DeliveryPerformanceChart data={delivery_performance} />
        </div>

        {/* Insights & Metrics Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Business Highlights</h3>
            <p className="text-xs text-slate-400 font-medium mb-4">Calculated pipeline metrics</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Top Category</span>
              <span className="font-bold text-slate-800">
                {category_revenue[0]?.category || 'N/A'} ({formatCurrency(category_revenue[0]?.revenue || 0)})
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Logistics Status</span>
              <span className="font-bold text-emerald-600">
                {delayed_orders === 0 ? 'All Deliveries On-Time' : `${delayed_orders} Delivery Delayed`}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Exchange Rate API</span>
              <span className="font-bold text-blue-600">Live Cached Rates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drill-Down Modal */}
      <Modal isOpen={drillDownModal.isOpen} onClose={closeDrillDown} title="Detailed Drill-Down Inspection">
        {drillDownModal.data && (
          <div className="space-y-4 text-sm">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h4 className="font-bold text-blue-900 text-base mb-1">
                {drillDownModal.type?.toUpperCase()} DRILL-DOWN
              </h4>
              <p className="text-xs text-blue-700">Inspecting exact joined record details from SQLite database.</p>
            </div>

            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs overflow-x-auto font-mono">
              {JSON.stringify(drillDownModal.data, null, 2)}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
};
