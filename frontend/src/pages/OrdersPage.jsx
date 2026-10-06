import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye, Package, Truck, User, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { useAnalytics } from '../context/AnalyticsContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const OrdersPage = () => {
  const { filters, formatCurrency } = useAnalytics();

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchOrders = useCallback(
    async (pageNum = 1) => {
      setLoading(true);
      try {
        const res = await api.getOrders({
          page: pageNum,
          limit: 10,
          category: filters.category !== 'all' ? filters.category : undefined,
          status: filters.deliveryStatus !== 'all' ? filters.deliveryStatus : undefined,
          search: search || undefined,
          currency: filters.currency,
        });

        if (res.success) {
          setOrders(res.data);
          setPagination(res.pagination);
        }
      } catch (err) {
        console.error('Fetch orders error:', err);
      } finally {
        setLoading(false);
      }
    },
    [filters.category, filters.deliveryStatus, filters.currency, search]
  );

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const handleOrderClick = async (orderId) => {
    try {
      const res = await api.getOrderById(orderId, filters.currency);
      if (res.success) {
        setSelectedOrder(res.data);
        setModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to load order detail:', err);
    }
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Orders Registry</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Normalized data join of Orders + Products + Shipments
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Order ID, Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Order ID</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Items Summary</th>
                <th className="py-3.5 px-6">Total Value</th>
                <th className="py-3.5 px-6">Carrier</th>
                <th className="py-3.5 px-6">Delivery Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    Loading order records...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No order records found matching criteria
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr
                    key={o.order_id}
                    onClick={() => handleOrderClick(o.order_id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-6 font-bold text-blue-600">#{o.order_id}</td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">{o.customer_name}</div>
                      <div className="text-[10px] text-slate-400">{o.customer_id}</div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">{o.order_date}</td>
                    <td className="py-4 px-6 max-w-xs truncate font-medium text-slate-600">{o.items_summary}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{formatCurrency(o.total_value)}</td>
                    <td className="py-4 px-6 font-medium text-slate-600">{o.carrier}</td>
                    <td className="py-4 px-6">
                      <StatusBadge status={o.status} isDelayed={o.is_delayed} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderClick(o.order_id);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{orders.length}</span> of{' '}
            <span className="font-bold text-slate-800">{pagination.total}</span> orders
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchOrders(pagination.page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchOrders(pagination.page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Order #${selectedOrder?.order_id} Details`}>
        {selectedOrder && (
          <div className="space-y-6 text-xs">
            {/* Header info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-slate-400 font-medium block">Customer</span>
                <span className="font-bold text-slate-800 text-sm">{selectedOrder.customer.name}</span>
                <span className="text-slate-500 block">ID: {selectedOrder.customer.id}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Order Date</span>
                <span className="font-bold text-slate-800 text-sm">{selectedOrder.order_date}</span>
                <StatusBadge
                  status={selectedOrder.shipment.status}
                  isDelayed={selectedOrder.shipment.is_delayed}
                />
              </div>
            </div>

            {/* Shipment Tracking info */}
            <div className="p-4 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                Shipment Information
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-600">
                <div>
                  <span className="text-slate-400 block">Carrier</span>
                  <span className="font-semibold">{selectedOrder.shipment.carrier || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tracking Number</span>
                  <span className="font-semibold font-mono">{selectedOrder.shipment.tracking_number || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Expected Delivery</span>
                  <span className="font-semibold">{selectedOrder.shipment.expected_delivery || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Actual Delivery</span>
                  <span className="font-semibold">{selectedOrder.shipment.actual_delivery || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                Order Items Breakdown
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 font-bold text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3">Unit Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-semibold text-slate-800">{item.product_name}</td>
                        <td className="p-3 font-medium text-slate-500">{item.category}</td>
                        <td className="p-3 font-bold">{item.qty}</td>
                        <td className="p-3">{formatCurrency(item.unit_price)}</td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          {formatCurrency(item.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Footer */}
            <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="font-bold text-blue-900 text-sm">Calculated Total Order Value</span>
              <span className="font-extrabold text-blue-900 text-lg">
                {formatCurrency(selectedOrder.total_value)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
