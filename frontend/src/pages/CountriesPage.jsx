import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Users,
  BarChart2,
  Search,
  Filter,
  RefreshCw,
  Code,
  MapPin,
  Coins,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { api } from '../services/api';
import { Modal } from '../components/common/Modal';

const REGION_COLORS = ['#2563EB', '#06B6D4', '#F59E0B', '#10B981', '#EC4899'];

export const CountriesPage = () => {
  const [summary, setSummary] = useState(null);
  const [countries, setCountries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  
  const [region, setRegion] = useState('all');
  const [sortBy, setSortBy] = useState('population');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [explorerModal, setExplorerModal] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await api.getCountriesSummary();
      if (res.success) setSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch countries summary:', err);
    }
  };

  const fetchCountries = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await api.getCountries({
        region: region !== 'all' ? region : undefined,
        search: search || undefined,
        sort_by: sortBy,
        page: pageNum,
        limit: 12,
      });
      if (res.success) {
        setCountries(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch countries list:', err);
    } finally {
      setLoading(false);
    }
  }, [region, search, sortBy]);

  useEffect(() => {
    fetchSummary();
    fetchCountries(1);
  }, [fetchCountries]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.syncCountries();
      await fetchSummary();
      await fetchCountries(1);
    } catch (err) {
      console.error('Failed to sync countries API:', err);
    } finally {
      setSyncing(false);
    }
  };

  const formatPop = (num) => {
    if (!num) return '0';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Globe className="w-7 h-7 text-blue-600" />
            Global Intelligence — REST Countries API
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Deeply nested JSON extraction for Countries, Currencies, Regions, and Population Density
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setExplorerModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors shadow-xs"
          >
            <Code className="w-4 h-4 text-blue-400" />
            <span>API Playground / Code Explorer</span>
          </button>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>Sync Live REST API</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl p-6 border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-900 shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <Globe className="w-6 h-6 text-blue-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              REST Countries
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900">{summary?.total_countries || 0}</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Tracked Countries</p>
        </div>

        <div className="rounded-2xl p-6 border border-cyan-200 bg-gradient-to-br from-cyan-50 to-teal-50 text-cyan-900 shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <Users className="w-6 h-6 text-cyan-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full">
              Demographics
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900">{formatPop(summary?.total_population)}</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Total Population</p>
        </div>

        <div className="rounded-2xl p-6 border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 text-amber-900 shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <BarChart2 className="w-6 h-6 text-amber-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              Density Proxy
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900">
            {summary?.avg_density || 0} <span className="text-xs font-semibold text-slate-500">/km²</span>
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Avg Population Density</p>
        </div>

        <div className="rounded-2xl p-6 border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-900 shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <Sparkles className="w-6 h-6 text-emerald-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Top Region
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">{summary?.region_breakdown[0]?.region || 'Asia'}</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
            {formatPop(summary?.region_breakdown[0]?.population)} People
          </p>
        </div>
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 10 Populated Countries Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 text-base">Top 10 Most Populated Countries</h3>
            <p className="text-xs text-slate-400 font-medium">Extracting country → population relationships</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.top_populated || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={formatPop} />
                <Tooltip
                  formatter={(val, name, item) => [formatPop(val), `${item.payload.name} Population`]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="population" fill="#2563EB" radius={[8, 8, 0, 0]} barSize={28}>
                  {(summary?.top_populated || []).map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={REGION_COLORS[idx % REGION_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Region Breakdown Donut Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="font-bold text-slate-800 text-base">Regional Distribution</h3>
            <p className="text-xs text-slate-400 font-medium">Population grouped by continent</p>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary?.region_breakdown || []}
                  dataKey="population"
                  nameKey="region"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {(summary?.region_breakdown || []).map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={REGION_COLORS[idx % REGION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatPop(val)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {(summary?.region_breakdown || []).map((r, idx) => (
              <div key={r.region} className="flex items-center justify-between text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: REGION_COLORS[idx % REGION_COLORS.length] }}></span>
                  <span>{r.region} ({r.count})</span>
                </div>
                <span className="font-bold text-slate-900">{formatPop(r.population)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-semibold text-slate-700 text-sm">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Country Filters</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Region Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Region:</span>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer capitalize"
            >
              <option value="all">All Regions</option>
              <option value="americas">Americas</option>
              <option value="europe">Europe</option>
              <option value="asia">Asia</option>
              <option value="africa">Africa</option>
              <option value="oceania">Oceania</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="population">Population (High to Low)</option>
              <option value="density">Population Density (/km²)</option>
              <option value="name">Country Name (A-Z)</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search country, currency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Normalized Countries Table Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase text-[10px]">
                <th className="py-3.5 px-6">Country</th>
                <th className="py-3.5 px-6">Code</th>
                <th className="py-3.5 px-6">Region / Capital</th>
                <th className="py-3.5 px-6">Population</th>
                <th className="py-3.5 px-6">Density (/km²)</th>
                <th className="py-3.5 px-6">Currencies</th>
                <th className="py-3.5 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">Loading countries data...</td>
                </tr>
              ) : countries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">No countries found matching filter</td>
                </tr>
              ) : (
                countries.map((c) => (
                  <tr key={c.cca2} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        {c.flag_png ? (
                          <img src={c.flag_png} alt={c.name_common} className="w-6 h-4 object-cover rounded-xs border border-slate-200" />
                        ) : (
                          <span className="text-lg">{c.flag_emoji || '🏳️'}</span>
                        )}
                        <div>
                          <div className="font-bold text-slate-800">{c.name_common}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">{c.name_official}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-mono font-bold text-blue-600">{c.cca2} / {c.cca3}</td>
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-700">{c.region}</div>
                      <div className="text-[10px] text-slate-400">{c.capital || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-6 font-extrabold text-slate-900">{c.population?.toLocaleString()}</td>
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        {c.population_density} /km²
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-600 max-w-xs truncate">{c.currencies}</td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => setSelectedCountry(c)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100 transition-colors"
                      >
                        Inspect JSON
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{countries.length}</span> of{' '}
            <span className="font-bold text-slate-800">{pagination.total}</span> countries
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchCountries(pagination.page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchCountries(pagination.page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Country JSON Inspector Modal */}
      <Modal isOpen={!!selectedCountry} onClose={() => setSelectedCountry(null)} title={`${selectedCountry?.name_common} Normalized Record`}>
        {selectedCountry && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              {selectedCountry.flag_png && (
                <img src={selectedCountry.flag_png} alt="" className="w-10 h-7 object-cover rounded border border-slate-200" />
              )}
              <div>
                <h4 className="font-bold text-blue-900 text-base">{selectedCountry.name_common} ({selectedCountry.name_official})</h4>
                <p className="text-xs text-blue-700">CCA2: {selectedCountry.cca2} | Region: {selectedCountry.region}</p>
              </div>
            </div>

            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs overflow-x-auto font-mono">
              {JSON.stringify(selectedCountry, null, 2)}
            </pre>
          </div>
        )}
      </Modal>

      {/* REST API Explorer Playground Modal (Matching Screenshot) */}
      <Modal isOpen={explorerModal} onClose={() => setExplorerModal(false)} title="REST Countries Live API Explorer">
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-3 font-mono">
            <div className="flex justify-between items-center text-slate-400">
              <span>REQUEST</span>
              <span className="text-emerald-400 font-bold">200 OK</span>
            </div>
            <pre className="text-blue-300">
{`const response = await fetch(
  'https://restcountries.com/v3.1/all'
);
const data = await response.json();`}
            </pre>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-800">Relational Modeling & Normalization:</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Extracted nested <code>currencies</code> object into tabular strings.</li>
              <li>Extracted nested <code>languages</code> into comma-separated lists.</li>
              <li>Calculated Population Density: <code>population / area</code>.</li>
              <li>Indexed by <code>cca2</code> and <code>cca3</code> country codes in SQLite.</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};
