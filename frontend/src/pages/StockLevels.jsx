import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  Filter,
  SlidersHorizontal,
  Plus,
  Minus,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { warehouseService } from '../services/warehouseService';
import { productService } from '../services/productService';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatNumber, formatDate } from '../utils/formatters';

export const StockLevels = () => {
  const toast = useToast();
  const { hasRole } = useAuth();
  const canAdjust = hasRole('ROLE_WAREHOUSE_STAFF');

  const [inventories, setInventories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');

  // Adjustment Modal
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  const fetchWarehouses = async () => {
    try {
      const res = await warehouseService.getWarehouses();
      setWarehouses(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStock = async (currentPage = page) => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: 15,
        query: searchQuery.trim() || undefined,
        warehouseId: selectedWarehouse || undefined,
      };
      const res = await inventoryService.getInventories(params);
      if (res.data) {
        setInventories(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch inventory stock levels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchStock(0);
    setPage(0);
  }, [searchQuery, selectedWarehouse]);

  const handleOpenAdjust = (inv) => {
    setAdjustTarget(inv);
    setAdjustQty('');
    setAdjustNotes('');
    setIsAdjustOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustTarget) return;

    const qty = Number(adjustQty);
    if (isNaN(qty) || qty === 0) {
      toast.error('Please enter a non-zero adjustment quantity');
      return;
    }

    setAdjustSubmitting(true);
    try {
      await inventoryService.adjustStock({
        productId: adjustTarget.productId,
        warehouseId: adjustTarget.warehouseId,
        adjustmentQuantity: qty,
        notes: adjustNotes,
      });

      toast.success(
        `Stock adjusted by ${qty > 0 ? '+' : ''}${qty} units for ${adjustTarget.productName}`
      );
      setIsAdjustOpen(false);
      fetchStock();
    } catch (err) {
      toast.error(err.message || 'Stock adjustment rejected');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Product Details',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.productName}</div>
          <div className="text-xs font-mono text-slate-500 mt-0.5">
            {row.productSku} • <span className="text-slate-400">{row.categoryName}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Warehouse Facility',
      render: (row) => (
        <div>
          <div className="font-medium text-slate-800">{row.warehouseName}</div>
          <div className="text-xs font-mono text-indigo-600 mt-0.5">{row.warehouseCode}</div>
        </div>
      ),
    },
    {
      header: 'On-Hand Stock',
      render: (row) => (
        <span className="font-semibold text-slate-900 text-xs">
          {formatNumber(row.onHandQuantity)} {row.unit}
        </span>
      ),
    },
    {
      header: 'Reserved Stock',
      render: (row) => (
        <span className="font-semibold text-amber-600 text-xs">
          {formatNumber(row.reservedQuantity)} {row.unit}
        </span>
      ),
    },
    {
      header: 'Available Stock',
      render: (row) => (
        <div className="text-xs">
          <span
            className={`font-bold ${
              row.availableQuantity <= 0
                ? 'text-rose-600'
                : row.availableQuantity <= row.reorderThreshold
                ? 'text-amber-600'
                : 'text-emerald-600'
            }`}
          >
            {formatNumber(row.availableQuantity)} {row.unit}
          </span>
          <div className="text-[10px] text-slate-400">Reorder at: {row.reorderThreshold}</div>
        </div>
      ),
    },
    {
      header: 'Valuation',
      render: (row) => (
        <span className="font-mono text-xs text-slate-800 font-medium">
          {formatINR(row.totalValuation)}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => <Badge status={row.stockStatus} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end">
          {canAdjust && (
            <Button
              variant="secondary"
              size="xs"
              onClick={() => handleOpenAdjust(row)}
              icon={SlidersHorizontal}
            >
              Adjust
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
          <h2 className="text-xl font-bold text-slate-900">Stock Levels & Availability</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-warehouse on-hand, reserved, and available retail units
          </p>
        </div>
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => fetchStock()}>
          Refresh Stock
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by SKU or Product Name..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-slate-800"
          />
        </div>

        <select
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
          className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-slate-700"
        >
          <option value="">All Warehouses</option>
          {warehouses.map((wh) => (
            <option key={wh.id} value={wh.id}>
              {wh.name} ({wh.city})
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={inventories}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={(p) => {
          setPage(p);
          fetchStock(p);
        }}
        emptyTitle="No stock records found"
        emptyDescription="Try clearing your search query or warehouse filter."
      />

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        title="Manual Stock Adjustment"
        subtitle={`Adjust inventory balance for ${adjustTarget?.productName} at ${adjustTarget?.warehouseName}`}
      >
        {adjustTarget && (
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">On-Hand</span>
                <span className="font-bold text-slate-900">{adjustTarget.onHandQuantity} Units</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Reserved</span>
                <span className="font-bold text-amber-600">{adjustTarget.reservedQuantity} Units</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Available</span>
                <span className="font-bold text-emerald-600">{adjustTarget.availableQuantity} Units</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adjustment Quantity (+ to add, - to deduct) *
              </label>
              <input
                type="number"
                required
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-mono"
                placeholder="e.g., +25 (cycle count gain) or -5 (damaged)"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Note: Cannot deduct more than available on-hand stock or breach active reservations.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adjustment Reason / Cycle Count Notes *
              </label>
              <textarea
                required
                rows={2}
                value={adjustNotes}
                onChange={(e) => setAdjustNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                placeholder="Discrepancy reason, physical audit reference, damage notes..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsAdjustOpen(false)}
                disabled={adjustSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={adjustSubmitting}>
                Confirm Adjustment
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
