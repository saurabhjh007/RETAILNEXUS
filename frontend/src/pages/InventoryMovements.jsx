import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  BookmarkCheck,
  RotateCcw,
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { warehouseService } from '../services/warehouseService';
import { DataTable } from '../components/ui/DataTable';
import { Badge } from '../components/ui/Badge';
import { formatNumber, formatDate } from '../utils/formatters';

export const InventoryMovements = () => {
  const [movements, setMovements] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [selectedType, setSelectedType] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');

  const fetchWarehouses = async () => {
    try {
      const res = await warehouseService.getWarehouses();
      setWarehouses(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMovements = async (currentPage = page) => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: 15,
        movementType: selectedType || undefined,
        warehouseId: selectedWarehouse || undefined,
      };
      const res = await inventoryService.getMovements(params);
      if (res.data) {
        setMovements(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchMovements(0);
    setPage(0);
  }, [selectedType, selectedWarehouse]);

  const getMovementTypeBadge = (type) => {
    switch (type) {
      case 'PURCHASE_RECEIPT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>PO Receipt</span>
          </span>
        );
      case 'ORDER_DISPATCH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Order Dispatch</span>
          </span>
        );
      case 'STOCK_TRANSFER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Stock Transfer</span>
          </span>
        );
      case 'MANUAL_ADJUSTMENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Adjustment</span>
          </span>
        );
      case 'STOCK_RESERVATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-violet-50 text-violet-700 border border-violet-200">
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Stock Reserved</span>
          </span>
        );
      case 'STOCK_RELEASE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Stock Released</span>
          </span>
        );
      default:
        return <Badge status="INFO" label={type} />;
    }
  };

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'createdAt',
      render: (row) => (
        <span className="text-xs font-medium text-slate-600">
          {formatDate(row.createdAt, true)}
        </span>
      ),
    },
    {
      header: 'Movement Type',
      render: (row) => getMovementTypeBadge(row.movementType),
    },
    {
      header: 'Product Item',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs">{row.productName}</div>
          <div className="text-[11px] font-mono text-slate-400">{row.productSku}</div>
        </div>
      ),
    },
    {
      header: 'Facility Route',
      render: (row) => (
        <div className="text-xs text-slate-700">
          {row.sourceWarehouseName && row.destinationWarehouseName ? (
            <span>
              {row.sourceWarehouseName} ➔ {row.destinationWarehouseName}
            </span>
          ) : row.destinationWarehouseName ? (
            <span>➔ {row.destinationWarehouseName}</span>
          ) : row.sourceWarehouseName ? (
            <span>{row.sourceWarehouseName} ➔ Outbound</span>
          ) : (
            '—'
          )}
        </div>
      ),
    },
    {
      header: 'Quantity',
      render: (row) => {
        const isDeduct = row.quantity < 0 || row.movementType === 'ORDER_DISPATCH';
        return (
          <span
            className={`font-bold font-mono text-xs ${
              isDeduct ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {row.quantity > 0 ? `+${row.quantity}` : row.quantity} Units
          </span>
        );
      },
    },
    {
      header: 'Reference & Notes',
      render: (row) => (
        <div className="text-xs">
          <span className="font-mono font-semibold text-slate-800">{row.referenceId || '—'}</span>
          {row.notes && <p className="text-[11px] text-slate-400 truncate max-w-xs">{row.notes}</p>}
        </div>
      ),
    },
    {
      header: 'Responsible User',
      render: (row) => (
        <span className="text-xs font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          {row.performedBy || 'System'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Inventory Movement Ledger</h2>
        <p className="text-xs text-slate-500 mt-1">
          Immutable audit record of all physical, inbound, outbound, and reservation movements
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-slate-700"
        >
          <option value="">All Movement Types</option>
          <option value="PURCHASE_RECEIPT">Inbound Goods Receipts (PO)</option>
          <option value="ORDER_DISPATCH">Outbound Customer Dispatches</option>
          <option value="STOCK_TRANSFER">Inter-Warehouse Transfers</option>
          <option value="MANUAL_ADJUSTMENT">Manual Cycle Adjustments</option>
          <option value="STOCK_RESERVATION">Order Stock Reservations</option>
          <option value="STOCK_RELEASE">Reservation Release (Cancellations)</option>
        </select>

        <select
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
          className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-slate-700"
        >
          <option value="">All Warehouse Facilities</option>
          {warehouses.map((wh) => (
            <option key={wh.id} value={wh.id}>
              {wh.name} ({wh.code})
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={movements}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={(p) => {
          setPage(p);
          fetchMovements(p);
        }}
        emptyTitle="No inventory movements found"
        emptyDescription="Transactions will be recorded here automatically when purchase orders are received, customer orders are dispatched, or transfers are completed."
      />
    </div>
  );
};
