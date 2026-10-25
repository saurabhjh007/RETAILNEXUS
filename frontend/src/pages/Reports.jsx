import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  RefreshCw,
  TrendingUp,
  Boxes,
  DollarSign,
  Package,
  Layers,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { reportService } from '../services/reportService';
import { warehouseService } from '../services/warehouseService';
import { inventoryService } from '../services/inventoryService';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useToast } from '../context/ToastContext';
import { formatINR, formatNumber } from '../utils/formatters';

const CHART_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

export const Reports = () => {
  const toast = useToast();
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [valuationData, setValuationData] = useState(null);
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchWarehouses = async () => {
    try {
      const res = await warehouseService.getWarehouses();
      setWarehouses(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const whId = selectedWarehouse ? Number(selectedWarehouse) : null;
      const [valRes, invRes] = await Promise.all([
        reportService.getValuationReport(whId),
        inventoryService.getStockLevels({ warehouseId: whId, size: 50 }),
      ]);

      setValuationData(valRes.data || {});
      setInventoryList(invRes.data?.content || []);
    } catch (err) {
      toast.error('Failed to load valuation analytics: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [selectedWarehouse]);

  const handleExportCsv = async () => {
    setDownloading(true);
    try {
      const whId = selectedWarehouse ? Number(selectedWarehouse) : null;
      await reportService.downloadInventoryCsv(whId);
      toast.success('Inventory ledger CSV downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download CSV: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  // Group top 5 inventory valuations
  const topValuedItems = [...inventoryList]
    .sort((a, b) => (b.totalValuation || 0) - (a.totalValuation || 0))
    .slice(0, 7)
    .map((item) => ({
      name: item.productName?.length > 18 ? item.productName.slice(0, 16) + '...' : item.productName,
      valuation: Number(item.totalValuation || 0),
      units: item.onHandQuantity,
    }));

  const marginPercentage = valuationData?.totalRetailValuation > 0
    ? ((valuationData.potentialGrossProfit / valuationData.totalRetailValuation) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory Valuation & Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time capital allocation, cost vs. retail valuation, margin exposure, and audit export.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReportData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCsv}
            loading={downloading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV Ledger
          </Button>
        </div>
      </div>

      {/* Warehouse Selector Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Facility Scope:</span>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 py-1.5 px-3 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Consolidated Network (All Warehouses)</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name} ({wh.city})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing metrics computed from live database ledger
        </div>
      </div>

      {/* Valuation KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Total On-Hand Stock</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {formatNumber(valuationData?.totalUnits || 0)} <span className="text-xs font-normal text-slate-500">units</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Across {valuationData?.skuCount || 0} active SKU positions</p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Cost Capital Value</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {formatINR(valuationData?.totalCostValuation || 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Capital invested at landed procurement cost</p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Retail Revenue Potential</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {formatINR(valuationData?.totalRetailValuation || 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Projected revenue at current selling prices</p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Potential Gross Profit</span>
            <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-violet-700">
              {formatINR(valuationData?.potentialGrossProfit || 0)}
            </div>
            <p className="text-xs font-semibold text-emerald-600 mt-1">
              ~{marginPercentage}% gross margin spread
            </p>
          </div>
        </Card>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Top 7 Capital-Allocated Inventory SKUs (₹ Value)</h2>
          <div className="h-72">
            {topValuedItems.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topValuedItems} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} textAnchor="middle" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip
                    formatter={(val) => [formatINR(val), 'Valuation']}
                    contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1E293B', color: '#fff', borderRadius: '8px' }}
                  />
                  <Bar dataKey="valuation" fill="#6366F1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No inventory data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-2">Audit & Compliance Export</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export an official CSV snapshot of all warehouse stock positions with on-hand, reserved, and available counts, cost prices, total valuations, and threshold flags.
            </p>

            <div className="mt-6 space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="font-semibold text-slate-800">CSV Standard:</span> RFC 4180 / UTF-8
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="font-semibold text-slate-800">Fields Included:</span> SKU, Product, Category, Facility, Units, Cost, Valuation, Status
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="font-semibold text-slate-800">Database Source:</span> Spring Boot streaming response
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button
              variant="primary"
              size="md"
              onClick={handleExportCsv}
              loading={downloading}
              className="w-full justify-center bg-emerald-600 hover:bg-emerald-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Official Ledger CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
