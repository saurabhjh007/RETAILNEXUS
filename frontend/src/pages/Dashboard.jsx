import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Boxes,
  IndianRupee,
  AlertTriangle,
  ShoppingCart,
  Truck,
  Plus,
  ArrowLeftRight,
  TrendingUp,
  Warehouse,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { warehouseService } from '../services/warehouseService';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { formatINR, formatNumber, formatDate } from '../utils/formatters';

const CATEGORY_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6'];

export const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [summary, setSummary] = useState(null);

  const fetchData = async (whId = selectedWarehouse) => {
    setLoading(true);
    try {
      const [whRes, summaryRes] = await Promise.all([
        warehouseService.getWarehouses(),
        dashboardService.getSummary(whId ? Number(whId) : null),
      ]);
      setWarehouses(whRes.data || []);
      setSummary(summaryRes.data || {});
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedWarehouse);
  }, [selectedWarehouse]);

  if (loading && !summary) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Active Products',
      value: formatNumber(summary?.totalActiveProducts),
      icon: Package,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100',
      change: 'Catalog count',
    },
    {
      label: 'Available Units',
      value: formatNumber(summary?.totalAvailableUnits),
      icon: Boxes,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
      change: 'Across all hubs',
    },
    {
      label: 'Inventory Valuation',
      value: formatINR(summary?.inventoryValuation),
      icon: IndianRupee,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-100',
      change: 'At cost value',
    },
    {
      label: 'Low Stock Items',
      value: formatNumber(summary?.lowStockItemsCount),
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100',
      change: `${summary?.outOfStockItemsCount || 0} out of stock`,
      alert: summary?.lowStockItemsCount > 0,
    },
    {
      label: 'Pending Orders',
      value: formatNumber(summary?.pendingOrdersCount),
      icon: ShoppingCart,
      color: 'text-violet-600',
      bg: 'bg-violet-50 border-violet-100',
      change: 'Awaiting fulfillment',
    },
    {
      label: 'Pending POs',
      value: formatNumber(summary?.pendingPurchaseOrdersCount),
      icon: Truck,
      color: 'text-teal-600',
      bg: 'bg-teal-50 border-teal-100',
      change: 'In procurement pipeline',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls: Filter by warehouse & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <Warehouse className="w-5 h-5 text-indigo-600" />
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Filter Warehouse
            </label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="text-sm font-semibold text-slate-800 bg-transparent outline-none cursor-pointer hover:text-indigo-600 transition-colors"
            >
              <option value="">All Warehouses (National Fleet)</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name} ({wh.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchData()}
            icon={RefreshCw}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/transfers')}
            icon={ArrowLeftRight}
          >
            Transfer Stock
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/orders')}
            icon={ShoppingCart}
          >
            New Order
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/purchase-orders')}
            icon={Plus}
          >
            New PO
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} hover className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">{kpi.label}</span>
                  <div className={`p-2 rounded-lg border ${kpi.bg}`}>
                    <Icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                </div>
                <div className="text-xl font-bold text-slate-900 tracking-tight">{kpi.value}</div>
                <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>{kpi.change}</span>
                  {kpi.alert && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      Action Required
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section: Movement Trend & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Inventory Movement Activity (Past 7 Days)"
            subtitle="Inbound receipts vs outbound dispatch waves in Asia/Kolkata operations"
          />
          <CardContent className="p-4 pt-0">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={summary?.movementTrend || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', color: '#FFF' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="inbound"
                    name="Inbound Goods"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorInbound)"
                  />
                  <Area
                    type="monotone"
                    dataKey="outbound"
                    name="Customer Dispatches"
                    stroke="#6366F1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOutbound)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Inbound Procurement</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500" />
                <span>Customer Order Dispatches</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown (1 col) */}
        <Card>
          <CardHeader
            title="Stock Distribution by Category"
            subtitle="Unit volume across retail categories"
          />
          <CardContent className="p-4 pt-0">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary?.stockByCategory || []}
                    dataKey="units"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {(summary?.stockByCategory || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${formatNumber(val)} Units`, name]}
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', color: '#FFF' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2 max-h-24 overflow-y-auto">
              {(summary?.stockByCategory || []).map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                    />
                    <span className="truncate">{cat.category}</span>
                  </div>
                  <span className="font-semibold text-slate-900 shrink-0">{formatNumber(cat.units)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warehouse Comparison Bar Chart */}
      <Card>
        <CardHeader
          title="Warehouse Stock Capacity & Valuation"
          subtitle="Regional distribution center volume comparison"
        />
        <CardContent className="p-4 pt-0">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={summary?.warehouseComparison || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="warehouseName" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val, name) => [
                    name === 'valuation' ? formatINR(val) : `${formatNumber(val)} Units`,
                    name === 'valuation' ? 'Stock Valuation' : 'OnHand Units',
                  ]}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', color: '#FFF' }}
                />
                <Bar dataKey="totalUnits" name="Units" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Tables: Low Stock Alerts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Watchlist */}
        <Card>
          <CardHeader
            title="Critical Stock Watchlist"
            subtitle="Products requiring immediate replenishment"
            action={
              <Button variant="ghost" size="xs" onClick={() => navigate('/alerts')}>
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            }
          />
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {(!summary?.lowStockAlerts || summary.lowStockAlerts.length === 0) ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  All inventory levels are within safe operational thresholds.
                </div>
              ) : (
                summary.lowStockAlerts.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900">{item.productName}</span>
                        <Badge status={item.stockStatus} size="xs" />
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        SKU: <span className="font-mono text-slate-700">{item.productSku}</span> • {item.warehouseName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-rose-600">
                        {item.availableQuantity} {item.unit} left
                      </div>
                      <div className="text-[10px] text-slate-400">Threshold: {item.reorderThreshold}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader
            title="Recent Customer Orders"
            subtitle="Latest fulfillment transactions"
            action={
              <Button variant="ghost" size="xs" onClick={() => navigate('/orders')}>
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            }
          />
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {(!summary?.recentOrders || summary.recentOrders.length === 0) ? (
                <div className="p-8 text-center text-xs text-slate-500">No recent orders recorded.</div>
              ) : (
                summary.recentOrders.map((order) => (
                  <div key={order.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-slate-900">{order.orderNumber}</span>
                        <Badge status={order.status} size="xs" />
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {order.customerName} • {order.warehouseCode}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">{formatINR(order.totalAmount)}</div>
                      <div className="text-[10px] text-slate-400">{formatDate(order.orderDate)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
