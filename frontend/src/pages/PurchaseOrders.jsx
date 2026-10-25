import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  PackageCheck,
  Building2,
  Warehouse,
  Calendar,
  Trash2,
  Check,
  Send,
  XCircle,
  Clock,
  ArrowDownLeft
} from 'lucide-react';
import { purchaseOrderService } from '../services/purchaseOrderService';
import { supplierService } from '../services/supplierService';
import { warehouseService } from '../services/warehouseService';
import { productService } from '../services/productService';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatDate } from '../utils/formatters';

export const PurchaseOrders = () => {
  const toast = useToast();
  const { hasRole } = useAuth();
  const canManage = hasRole('ROLE_INVENTORY_MANAGER') || hasRole('ROLE_ADMIN');
  const canReceive = hasRole('ROLE_WAREHOUSE_STAFF') || hasRole('ROLE_INVENTORY_MANAGER') || hasRole('ROLE_ADMIN');

  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [selectedPo, setSelectedPo] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Create PO Form State
  const [supplierId, setSupplierId] = useState('');
  const [destinationWarehouseId, setDestinationWarehouseId] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [poItems, setPoItems] = useState([{ productId: '', quantityOrdered: 1, unitCost: '' }]);
  const [submitting, setSubmitting] = useState(false);

  // Receive Goods Form State
  const [receivingItems, setReceivingItems] = useState([]);
  const [receiveNotes, setReceiveNotes] = useState('');
  const [receiveSubmitting, setReceiveSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchDropdownData = async () => {
    try {
      const [supRes, whRes, prodRes] = await Promise.all([
        supplierService.getActiveSuppliers(),
        warehouseService.getWarehouses(),
        productService.getProducts({ size: 100, active: true })
      ]);
      setSuppliers(supRes.data || []);
      setWarehouses(whRes.data || []);
      setProducts(prodRes.data?.content || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPurchaseOrders = async (currentPage = page) => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: 15,
      };
      if (searchQuery) params.query = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (supplierFilter) params.supplierId = supplierFilter;
      if (warehouseFilter) params.warehouseId = warehouseFilter;

      const res = await purchaseOrderService.getPurchaseOrders(params);
      const data = res.data || {};
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      toast.error('Failed to load purchase orders: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchPurchaseOrders(0);
    setPage(0);
  }, [searchQuery, statusFilter, supplierFilter, warehouseFilter]);

  const handleOpenDetails = async (poId) => {
    setIsDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const res = await purchaseOrderService.getPurchaseOrderById(poId);
      setSelectedPo(res.data);
    } catch (err) {
      toast.error('Failed to load purchase order details');
      setIsDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleOpenReceive = (po) => {
    setSelectedPo(po);
    const initialItems = (po.items || []).map((item) => {
      const remaining = item.quantityOrdered - (item.quantityReceived || 0);
      return {
        itemId: item.id,
        productName: item.productName,
        productSku: item.productSku,
        quantityOrdered: item.quantityOrdered,
        quantityReceived: item.quantityReceived || 0,
        remaining,
        quantityToReceive: remaining > 0 ? remaining : 0,
      };
    });
    setReceivingItems(initialItems);
    setReceiveNotes('');
    setIsReceiveOpen(true);
  };

  const handleAddItem = () => {
    setPoItems([...poItems, { productId: '', quantityOrdered: 1, unitCost: '' }]);
  };

  const handleRemoveItem = (index) => {
    if (poItems.length === 1) return;
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...poItems];
    updated[index][field] = value;

    if (field === 'productId') {
      const prod = products.find((p) => p.id === Number(value));
      if (prod) {
        updated[index].unitCost = prod.costPrice || '';
      }
    }
    setPoItems(updated);
  };

  const calculateTotal = () => {
    return poItems.reduce((acc, item) => {
      const cost = Number(item.unitCost) || 0;
      const qty = Number(item.quantityOrdered) || 0;
      return acc + (cost * qty);
    }, 0);
  };

  const handleCreatePo = async (e) => {
    e.preventDefault();
    if (!supplierId || !destinationWarehouseId) {
      toast.warning('Please select both supplier and destination warehouse');
      return;
    }

    for (const item of poItems) {
      if (!item.productId) {
        toast.warning('Please select a product for each line');
        return;
      }
      if (item.quantityOrdered <= 0) {
        toast.warning('Quantity must be greater than zero');
        return;
      }
      if (!item.unitCost || Number(item.unitCost) <= 0) {
        toast.warning('Unit cost must be greater than zero');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        supplierId: Number(supplierId),
        destinationWarehouseId: Number(destinationWarehouseId),
        orderDate,
        expectedDeliveryDate: expectedDeliveryDate || null,
        notes,
        items: poItems.map((item) => ({
          productId: Number(item.productId),
          quantityOrdered: Number(item.quantityOrdered),
          unitCost: Number(item.unitCost),
        })),
      };

      await purchaseOrderService.createPurchaseOrder(payload);
      toast.success('Purchase order created successfully!');
      setIsCreateOpen(false);
      resetPoForm();
      fetchPurchaseOrders(0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create purchase order');
    } finally {
      setSubmitting(false);
    }
  };

  const resetPoForm = () => {
    setSupplierId('');
    setDestinationWarehouseId('');
    setOrderDate(new Date().toISOString().slice(0, 10));
    setExpectedDeliveryDate('');
    setNotes('');
    setPoItems([{ productId: '', quantityOrdered: 1, unitCost: '' }]);
  };

  const handleUpdateStatus = async (poId, newStatus) => {
    setStatusUpdating(true);
    try {
      await purchaseOrderService.updateStatus(poId, newStatus);
      toast.success(`Purchase order status updated to ${newStatus}`);
      fetchPurchaseOrders(page);
      if (selectedPo && selectedPo.id === poId) {
        const res = await purchaseOrderService.getPurchaseOrderById(poId);
        setSelectedPo(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleReceiveSubmit = async (e) => {
    e.preventDefault();
    const itemsToPost = receivingItems
      .filter((item) => Number(item.quantityToReceive) > 0)
      .map((item) => ({
        itemId: item.itemId,
        quantityToReceive: Number(item.quantityToReceive),
      }));

    if (itemsToPost.length === 0) {
      toast.warning('Please enter a quantity greater than zero for at least one item');
      return;
    }

    // Check for over-receiving
    for (const item of receivingItems) {
      if (Number(item.quantityToReceive) > item.remaining) {
        toast.error(`Cannot receive more than remaining ordered quantity (${item.remaining}) for ${item.productName}`);
        return;
      }
    }

    setReceiveSubmitting(true);
    try {
      await purchaseOrderService.receiveGoods(selectedPo.id, {
        items: itemsToPost,
        notes: receiveNotes,
      });
      toast.success('Goods received! Inventory quantities and cost valuation updated.');
      setIsReceiveOpen(false);
      fetchPurchaseOrders(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process receipt');
    } finally {
      setReceiveSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="neutral">Draft</Badge>;
      case 'SUBMITTED':
        return <Badge variant="info" dot>Submitted</Badge>;
      case 'APPROVED':
        return <Badge variant="indigo" dot>Approved</Badge>;
      case 'PARTIALLY_RECEIVED':
        return <Badge variant="warning" dot>Partially Received</Badge>;
      case 'COMPLETED':
        return <Badge variant="success" dot>Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'PO Number',
      accessor: 'poNumber',
      cell: (row) => (
        <div>
          <span className="font-mono font-semibold text-slate-900">{row.poNumber}</span>
          <div className="text-xs text-slate-500">{formatDate(row.orderDate)}</div>
        </div>
      ),
    },
    {
      header: 'Supplier Vendor',
      accessor: 'supplierName',
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.supplierName}</div>
          <span className="text-xs text-slate-500 font-mono">{row.supplierCode}</span>
        </div>
      ),
    },
    {
      header: 'Receiving Facility',
      accessor: 'destinationWarehouseName',
      cell: (row) => (
        <span className="text-slate-700 font-medium">{row.destinationWarehouseName}</span>
      ),
    },
    {
      header: 'Total Value',
      accessor: 'totalAmount',
      cell: (row) => (
        <span className="font-bold text-slate-900">{formatINR(row.totalAmount)}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenDetails(row.id)}
            className="text-xs py-1 px-2.5"
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </Button>

          {canReceive && (row.status === 'APPROVED' || row.status === 'PARTIALLY_RECEIVED') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenReceive(row)}
              className="text-xs py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Receive
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Purchase Orders & Inbound Receiving</h1>
          <p className="text-sm text-slate-500 mt-1">
            Vendor procurement, goods receipt validation, cost adjustments, and inventory replenishment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchPurchaseOrders(page)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {canManage && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                resetPoForm();
                setIsCreateOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              New Purchase Order
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by PO # or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-500">Filter:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 py-2 px-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All PO Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="PARTIALLY_RECEIVED">Partially Received</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 py-2 px-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 py-2 px-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PO Table */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={(p) => {
          setPage(p);
          fetchPurchaseOrders(p);
        }}
        emptyMessage="No purchase orders found."
      />

      {/* Create PO Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Draft Inbound Purchase Order"
        size="lg"
      >
        <form onSubmit={handleCreatePo} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Supplier Vendor *
              </label>
              <select
                required
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choose Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination Warehouse Hub *
              </label>
              <select
                required
                value={destinationWarehouseId}
                onChange={(e) => setDestinationWarehouseId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choose Receiving Facility</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} ({wh.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Order Issue Date *
              </label>
              <input
                type="date"
                required
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Terms / Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Net 30 payment terms; FOB Destination"
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Procurement Items</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="text-xs py-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {poItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">
                      Product
                    </label>
                    <select
                      required
                      value={item.productId}
                      onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                      className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select a product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">
                      Qty Ordered
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantityOrdered}
                      onChange={(e) => handleItemChange(idx, 'quantityOrdered', e.target.value)}
                      className="w-full text-xs rounded border border-slate-300 p-1.5 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="w-32">
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">
                      Unit Cost (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={item.unitCost}
                      onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                      className="w-full text-xs rounded border border-slate-300 p-1.5 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="w-28 text-right">
                    <span className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">
                      Subtotal
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {formatINR((Number(item.unitCost) || 0) * (Number(item.quantityOrdered) || 0))}
                    </span>
                  </div>

                  {poItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-rose-500 hover:text-rose-700 mt-4 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-indigo-50/60 rounded-lg flex items-center justify-between border border-indigo-100">
              <span className="text-xs font-medium text-indigo-900">Total Purchase Commitment</span>
              <span className="text-base font-bold text-indigo-700">{formatINR(calculateTotal())}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              Save Purchase Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* PO Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={selectedPo ? `Purchase Order: ${selectedPo.poNumber}` : 'PO Details'}
        size="lg"
      >
        {detailsLoading ? (
          <div className="py-12 text-center text-slate-500">Loading PO details...</div>
        ) : selectedPo ? (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase text-slate-400">Order Placed</span>
                <p className="text-sm font-bold text-slate-800">{formatDate(selectedPo.orderDate)}</p>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase text-slate-400">Status</span>
                <div className="mt-0.5">{getStatusBadge(selectedPo.status)}</div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase text-slate-400">Receiving Warehouse</span>
                <p className="text-sm font-bold text-slate-800">{selectedPo.destinationWarehouseName}</p>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase text-slate-400">Total Value</span>
                <p className="text-base font-bold text-indigo-600">{formatINR(selectedPo.totalAmount)}</p>
              </div>
            </div>

            {/* Supplier Banner */}
            <div className="p-4 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase text-slate-400">Supplier Vendor</div>
                <div className="text-base font-bold text-slate-900">{selectedPo.supplierName}</div>
                <div className="text-xs font-mono text-slate-500">{selectedPo.supplierCode}</div>
              </div>
              {selectedPo.expectedDeliveryDate && (
                <div className="text-right">
                  <div className="text-xs font-bold uppercase text-slate-400">Expected Delivery</div>
                  <div className="text-sm font-semibold text-slate-700">{formatDate(selectedPo.expectedDeliveryDate)}</div>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Line Items & Receipt Status</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Product</th>
                      <th className="py-2.5 px-3 font-semibold">SKU</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Unit Cost</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Ordered</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Received</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPo.items?.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-slate-800">{item.productName}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{item.productSku}</td>
                        <td className="py-2.5 px-3 text-right">{formatINR(item.unitCost)}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">{item.quantityOrdered}</td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          <span className={item.quantityReceived >= item.quantityOrdered ? 'text-emerald-600' : 'text-amber-600'}>
                            {item.quantityReceived || 0}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatINR(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Workflow Transition Buttons */}
            {canManage && (
              <div className="border-t border-slate-200 pt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {selectedPo.status === 'DRAFT' && (
                    <Button
                      variant="primary"
                      size="sm"
                      loading={statusUpdating}
                      onClick={() => handleUpdateStatus(selectedPo.id, 'SUBMITTED')}
                    >
                      <Send className="w-3.5 h-3.5" />
                      Submit to Supplier
                    </Button>
                  )}

                  {selectedPo.status === 'SUBMITTED' && (
                    <Button
                      variant="success"
                      size="sm"
                      loading={statusUpdating}
                      onClick={() => handleUpdateStatus(selectedPo.id, 'APPROVED')}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve Purchase Order
                    </Button>
                  )}

                  {(selectedPo.status === 'DRAFT' || selectedPo.status === 'SUBMITTED') && (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={statusUpdating}
                      onClick={() => handleUpdateStatus(selectedPo.id, 'CANCELLED')}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel PO
                    </Button>
                  )}
                </div>

                {canReceive && (selectedPo.status === 'APPROVED' || selectedPo.status === 'PARTIALLY_RECEIVED') && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setIsDetailsOpen(false);
                      handleOpenReceive(selectedPo);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    Receive Inbound Goods
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Receive Goods Modal */}
      <Modal
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
        title={selectedPo ? `Receive Goods: ${selectedPo.poNumber}` : 'Receive Goods'}
        size="md"
      >
        <form onSubmit={handleReceiveSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Verify shipment quantities delivered to <span className="font-semibold text-slate-800">{selectedPo?.destinationWarehouseName}</span>. Entering received units will increment on-hand inventory immediately.
          </p>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {receivingItems.map((item, idx) => (
              <div key={item.itemId} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{item.productName}</div>
                    <div className="text-[10px] font-mono text-slate-500">{item.productSku}</div>
                  </div>
                  <div className="text-right text-[10px] text-slate-600">
                    Ordered: <span className="font-semibold">{item.quantityOrdered}</span> | Received: <span className="font-semibold">{item.quantityReceived}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-slate-600">
                    Remaining: <span className="font-bold text-amber-600">{item.remaining}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-700">Receive Now:</label>
                    <input
                      type="number"
                      min="0"
                      max={item.remaining}
                      value={item.quantityToReceive}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0);
                        const updated = [...receivingItems];
                        updated[idx].quantityToReceive = val;
                        setReceivingItems(updated);
                      }}
                      className="w-20 text-xs font-bold text-center rounded border border-slate-300 p-1.5 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Goods Receipt Inspection Notes
            </label>
            <input
              type="text"
              value={receiveNotes}
              onChange={(e) => setReceiveNotes(e.target.value)}
              placeholder="e.g. Inspected shipment, carton seals intact"
              className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReceiveOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={receiveSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Confirm Goods Receipt
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
