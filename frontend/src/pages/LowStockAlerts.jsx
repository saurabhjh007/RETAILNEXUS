import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Bell,
  RefreshCw,
  Filter,
  Package,
  Warehouse,
  Clock,
  ArrowRight
} from 'lucide-react';
import { alertService } from '../services/alertService';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatters';

export const LowStockAlerts = () => {
  const toast = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Filters
  const [acknowledgedFilter, setAcknowledgedFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [acknowledgingId, setAcknowledgingId] = useState(null);

  const fetchAlerts = async (currentPage = page) => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: 15,
      };
      if (acknowledgedFilter !== '') {
        params.acknowledged = acknowledgedFilter === 'true';
      }
      if (severityFilter) {
        params.severity = severityFilter;
      }

      const [alertsRes, countRes] = await Promise.all([
        alertService.getAlerts(params),
        alertService.getUnreadCount()
      ]);

      const pageData = alertsRes.data || {};
      setAlerts(pageData.content || []);
      setTotalPages(pageData.totalPages || 1);
      setTotalElements(pageData.totalElements || 0);
      setUnreadCount(countRes.data?.unreadCount || 0);
    } catch (err) {
      toast.error('Failed to load alerts: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts(0);
    setPage(0);
  }, [acknowledgedFilter, severityFilter]);

  const handleAcknowledge = async (id) => {
    setAcknowledgingId(id);
    try {
      await alertService.acknowledge(id);
      toast.success('Alert acknowledged successfully');
      fetchAlerts(page);
    } catch (err) {
      toast.error('Failed to acknowledge alert: ' + (err.response?.data?.message || err.message));
    } finally {
      setAcknowledgingId(null);
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return <Badge variant="danger" dot>CRITICAL</Badge>;
      case 'HIGH':
        return <Badge variant="warning" dot>HIGH</Badge>;
      case 'MEDIUM':
        return <Badge variant="neutral">MEDIUM</Badge>;
      default:
        return <Badge variant="info">INFO</Badge>;
    }
  };

  const columns = [
    {
      header: 'Severity',
      accessor: 'severity',
      cell: (row) => getSeverityBadge(row.severity),
    },
    {
      header: 'Alert Info',
      accessor: 'title',
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.title}</div>
          <p className="text-xs text-slate-500 mt-0.5 max-w-md">{row.message}</p>
        </div>
      ),
    },
    {
      header: 'Product Details',
      accessor: 'productName',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-slate-400 shrink-0" />
          <div>
            <div className="font-medium text-slate-800">{row.productName}</div>
            <span className="text-xs font-mono text-slate-500">{row.productSku}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Warehouse Facility',
      accessor: 'warehouseName',
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-slate-700">
          <Warehouse className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.warehouseName || 'All Facilities'}</span>
        </div>
      ),
    },
    {
      header: 'Timestamp',
      accessor: 'createdAt',
      cell: (row) => (
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          {formatDate(row.createdAt)}
        </div>
      ),
    },
    {
      header: 'Status & Action',
      accessor: 'acknowledged',
      cell: (row) => (
        <div>
          {row.acknowledged ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Resolved ({row.acknowledgedBy || 'Staff'})</span>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              loading={acknowledgingId === row.id}
              onClick={() => handleAcknowledge(row.id)}
              className="text-xs py-1 px-2.5 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
            >
              Acknowledge
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Stock & System Alerts</h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                {unreadCount} Unresolved
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Automated monitoring triggers for threshold breaches, reorder warnings, and stock-outs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAlerts(page)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Unresolved Warnings</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{unreadCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Total Recorded Events</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalElements}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Bell className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Automated Safeguard</p>
            <p className="text-sm font-medium text-emerald-700 mt-1">Real-time DB triggers enabled</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-500">Filters:</span>
          </div>

          <select
            value={acknowledgedFilter}
            onChange={(e) => setAcknowledgedFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 py-1.5 px-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Resolution Statuses</option>
            <option value="false">Unacknowledged (Active)</option>
            <option value="true">Acknowledged (Resolved)</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 py-1.5 px-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 w-full md:w-auto text-right">
          Showing {alerts.length} of {totalElements} alert items
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={alerts}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={(p) => {
          setPage(p);
          fetchAlerts(p);
        }}
        emptyMessage="No system alerts matching the current criteria."
      />
    </div>
  );
};
