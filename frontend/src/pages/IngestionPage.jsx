import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  FileCode,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  RefreshCw,
  Upload,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { api } from '../services/api';
import { useAnalytics } from '../context/AnalyticsContext';

export const IngestionPage = () => {
  const { refreshSummary } = useAnalytics();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(true);
  const [ingestStatus, setIngestStatus] = useState(null);

  const fetchLogs = useCallback(async (pageNum = 1) => {
    setLogsLoading(true);
    try {
      const res = await api.getIngestionLogs({ page: pageNum, limit: 10 });
      if (res.success) {
        setLogs(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const handleIngestSingle = async (type) => {
    setLoading(true);
    setIngestStatus(null);
    try {
      const res = await api.triggerIngestFile(type);
      setIngestStatus({ success: true, message: res.message || `${type.toUpperCase()} ingested successfully` });
      fetchLogs(1);
      refreshSummary();
    } catch (err) {
      setIngestStatus({ success: false, message: err?.response?.data?.detail || 'Ingestion failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleIngestAll = async () => {
    setLoading(true);
    setIngestStatus(null);
    try {
      await api.triggerIngestAll();
      setIngestStatus({ success: true, message: 'All pipeline datasets ingested successfully' });
      fetchLogs(1);
      refreshSummary();
    } catch (err) {
      setIngestStatus({ success: false, message: err?.response?.data?.detail || 'Pipeline trigger failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (type, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setIngestStatus(null);
    try {
      const res = await api.triggerIngestFile(type, file);
      setIngestStatus({ success: true, message: `Uploaded and ingested ${file.name}` });
      fetchLogs(1);
      refreshSummary();
    } catch (err) {
      setIngestStatus({ success: false, message: err?.response?.data?.detail || 'File upload ingestion failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Data Ingestion Pipeline</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage JSON, CSV, and XML data sources and monitor pipeline logs
          </p>
        </div>

        <button
          onClick={handleIngestAll}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-run Full Pipeline</span>
        </button>
      </div>

      {ingestStatus && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            ingestStatus.success
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {ingestStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{ingestStatus.message}</span>
        </div>
      )}

      {/* Dataset Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* JSON Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <FileCode className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> Processed
            </span>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-base">Orders.json</h3>
            <p className="text-xs text-slate-400 font-medium">Nested JSON (Orders & Items)</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Target Table:</span>
              <span className="font-mono font-bold">orders, order_items</span>
            </div>
            <div className="flex justify-between">
              <span>Quote Sanitizer:</span>
              <span className="font-bold text-emerald-600">Active</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleIngestSingle('json')}
              disabled={loading}
              className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 transition-colors"
            >
              Trigger Ingest
            </button>
            <label className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer">
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={(e) => handleFileUpload('json', e)} className="hidden" />
            </label>
          </div>
        </div>

        {/* CSV Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> Processed
            </span>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-base">Products.csv</h3>
            <p className="text-xs text-slate-400 font-medium">Catalog & Category mapping</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Target Table:</span>
              <span className="font-mono font-bold">products</span>
            </div>
            <div className="flex justify-between">
              <span>CSV Header Normalizer:</span>
              <span className="font-bold text-emerald-600">Active</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleIngestSingle('csv')}
              disabled={loading}
              className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 transition-colors"
            >
              Trigger Ingest
            </button>
            <label className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer">
              <Upload className="w-4 h-4" />
              <input type="file" accept=".csv" onChange={(e) => handleFileUpload('csv', e)} className="hidden" />
            </label>
          </div>
        </div>

        {/* XML Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
              <FileText className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> Processed
            </span>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-base">Shipment.xml</h3>
            <p className="text-xs text-slate-400 font-medium">Tracking & delivery dates XML</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Target Table:</span>
              <span className="font-mono font-bold">shipments</span>
            </div>
            <div className="flex justify-between">
              <span>Delay Flag Evaluator:</span>
              <span className="font-bold text-emerald-600">Active</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleIngestSingle('xml')}
              disabled={loading}
              className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 transition-colors"
            >
              Trigger Ingest
            </button>
            <label className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer">
              <Upload className="w-4 h-4" />
              <input type="file" accept=".xml" onChange={(e) => handleFileUpload('xml', e)} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Ingestion Logs Table with 10 Rows Pagination */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Pipeline Audit & Ingestion Logs</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Showing 10 records per page from SQLite ingestion_logs table</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Total Logs: {pagination.total}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase text-[10px]">
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-6">File Type</th>
                <th className="py-3.5 px-6">File Name</th>
                <th className="py-3.5 px-6">Records</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logsLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                    Loading ingestion logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                    No ingestion logs available
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-slate-500">{log.timestamp}</td>
                    <td className="py-3.5 px-6 font-bold text-slate-700">{log.file_type}</td>
                    <td className="py-3.5 px-6 font-medium text-slate-800">{log.file_name}</td>
                    <td className="py-3.5 px-6 font-bold text-blue-600">{log.records_processed}</td>
                    <td className="py-3.5 px-6">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 font-medium">{log.message}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{logs.length}</span> of{' '}
            <span className="font-bold text-slate-800">{pagination.total}</span> log records
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchLogs(pagination.page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchLogs(pagination.page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
