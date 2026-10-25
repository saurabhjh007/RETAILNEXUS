import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  Boxes,
  Warehouse,
  CheckCircle2,
  AlertCircle,
  History,
  Search,
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { warehouseService } from '../services/warehouseService';
import { productService } from '../services/productService';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { useToast } from '../context/ToastContext';
import { formatNumber, formatDate } from '../utils/formatters';

export const StockTransfers = () => {
  const toast = useToast();

  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transferHistory, setTransferHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Form
  const [sourceWarehouseId, setSourceWarehouseId] = useState('');
  const [destWarehouseId, setDestWarehouseId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [availableStockAtSource, setAvailableStockAtSource] = useState(null);
  const [checkingStock, setCheckingStock] = useState(false);

  const fetchInitialData = async () => {
    try {
      const [whRes, prodRes] = await Promise.all([
        warehouseService.getWarehouses(),
        productService.getProducts({ size: 100, active: true }),
      ]);
      setWarehouses(whRes.data || []);
      setProducts(prodRes.data?.content || []);
    } catch (err) {
      toast.error('Failed to load initial metadata for transfers');
    }
  };

  const fetchTransferHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await inventoryService.getMovements({
        movementType: 'STOCK_TRANSFER',
        size: 15,
      });
      setTransferHistory(res.data?.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    fetchTransferHistory();
  }, []);

  // Check available stock whenever source warehouse or product changes
  useEffect(() => {
    const checkAvailable = async () => {
      if (sourceWarehouseId && productId) {
        setCheckingStock(true);
        try {
          const res = await inventoryService.getProductInventory(productId);
          const found = (res.data || []).find(
            (inv) => inv.warehouseId === Number(sourceWarehouseId)
          );
          setAvailableStockAtSource(found ? found.availableQuantity : 0);
        } catch {
          setAvailableStockAtSource(0);
        } finally {
          setCheckingStock(false);
        }
      } else {
        setAvailableStockAtSource(null);
      }
    };
    checkAvailable();
  }, [sourceWarehouseId, productId]);

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (sourceWarehouseId === destWarehouseId) {
      toast.error('Source and destination warehouses cannot be the same facility');
      return;
    }

    const transferQty = Number(quantity);
    if (!transferQty || transferQty <= 0) {
      toast.error('Please enter a positive transfer quantity');
      return;
    }

    if (availableStockAtSource !== null && transferQty > availableStockAtSource) {
      toast.error(`Transfer quantity (${transferQty}) exceeds available stock (${availableStockAtSource})`);
      return;
    }

    setLoading(true);
    try {
      await inventoryService.transferStock({
        productId: Number(productId),
        sourceWarehouseId: Number(sourceWarehouseId),
        destinationWarehouseId: Number(destWarehouseId),
        quantity: transferQty,
        notes: notes.trim() || 'Inter-warehouse stock rebalancing',
      });

      toast.success(`Successfully transferred ${transferQty} units atomically!`);
      // Reset form
      setQuantity('');
      setNotes('');
      // Refresh stock check & transfer history
      fetchTransferHistory();
      if (sourceWarehouseId && productId) {
        const res = await inventoryService.getProductInventory(productId);
        const found = (res.data || []).find((inv) => inv.warehouseId === Number(sourceWarehouseId));
        setAvailableStockAtSource(found ? found.availableQuantity : 0);
      }
    } catch (err) {
      toast.error(err.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Reference ID',
      accessor: 'referenceId',
      render: (row) => <span className="font-mono text-xs font-bold text-slate-800">{row.referenceId}</span>,
    },
    {
      header: 'Product',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs">{row.productName}</div>
          <div className="text-[11px] font-mono text-slate-400">{row.productSku}</div>
        </div>
      ),
    },
    {
      header: 'Route (Source ➔ Destination)',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            {row.sourceWarehouseName || 'Source Hub'}
          </span>
          <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500" />
          <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
            {row.destinationWarehouseName || 'Destination Hub'}
          </span>
        </div>
      ),
    },
    {
      header: 'Transferred Units',
      render: (row) => (
        <span className="font-bold text-slate-900 text-xs">{formatNumber(row.quantity)} Units</span>
      ),
    },
    {
      header: 'Operator & Timestamp',
      render: (row) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800">{row.performedBy}</div>
          <div className="text-[11px] text-slate-400">{formatDate(row.createdAt, true)}</div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Inter-Warehouse Stock Transfers</h2>
        <p className="text-xs text-slate-500 mt-1">
          Atomic transactional inventory movement between distribution hubs with audit tracking
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfer Form (1 Col) */}
        <Card className="lg:col-span-1">
          <CardHeader
            title="Execute Stock Transfer"
            subtitle="Atomically shifts available on-hand stock"
          />
          <CardContent className="p-5">
            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Source Warehouse (Origin) *
                </label>
                <select
                  required
                  value={sourceWarehouseId}
                  onChange={(e) => setSourceWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-slate-800"
                >
                  <option value="">Select origin facility</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination Warehouse (Target) *
                </label>
                <select
                  required
                  value={destWarehouseId}
                  onChange={(e) => setDestWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-slate-800"
                >
                  <option value="">Select destination facility</option>
                  {warehouses
                    .filter((wh) => wh.id !== Number(sourceWarehouseId))
                    .map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name} ({wh.code})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Product Item *
                </label>
                <select
                  required
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-slate-800"
                >
                  <option value="">Select retail SKU</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              {/* Source stock availability indicator */}
              {productId && sourceWarehouseId && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Available at Origin:</span>
                  {checkingStock ? (
                    <span className="text-slate-400">Checking...</span>
                  ) : (
                    <span
                      className={`font-bold ${
                        availableStockAtSource > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {availableStockAtSource} Units
                    </span>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity to Transfer *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-mono text-slate-900"
                  placeholder="e.g. 50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transfer Dispatch Notes / Waybill
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                  placeholder="Transport docket number, lorry receipt reference..."
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                loading={loading}
                icon={ArrowLeftRight}
              >
                Execute Atomic Transfer
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Transfer History Table (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <DataTable
            columns={columns}
            data={transferHistory}
            loading={historyLoading}
            emptyTitle="No transfer history recorded yet"
            emptyDescription="Execute your first inter-warehouse transfer using the form on the left."
          />
        </div>
      </div>
    </div>
  );
};
