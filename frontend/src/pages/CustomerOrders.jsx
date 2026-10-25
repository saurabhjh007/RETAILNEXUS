import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  Clock,
  Trash2,
  ChevronRight,
  MapPin,
  User,
  Phone,
  Mail,
  Building2
} from 'lucide-react';
import { customerOrderService } from '../services/customerOrderService';
import { warehouseService } from '../services/warehouseService';
import { productService } from '../services/productService';
import { inventoryService } from '../services/inventoryService';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatDate } from '../utils/formatters';

export const CustomerOrders = () => {
  const toast = useToast();
  const { hasRole } = useAuth();
  const canManage = hasRole('ROLE_WAREHOUSE_STAFF') || hasRole('ROLE_INVENTORY_MANAGER') || hasRole('ROLE_ADMIN');

  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Create Order Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [destWarehouseId, setDestWarehouseId] = useState('');
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState([{ productId: '', quantity: 1, maxAvailable: 0, price: 0 }]);
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchWarehousesAndProducts = async () => {
    try {
      const [whRes, prodRes] = await Promise.all([
        warehouseService.getWarehouses(),
        productService.getProducts({ size: 100, active: true })
      ]);
      setWarehouses(whRes.data || []);
      setProducts(prodRes.data?.content || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async (currentPage = page) => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: 15,
      };
      if (searchQuery) params.query = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (warehouseFilter) params.warehouseId = warehouseFilter;

      const res = await customerOrderService.getOrders(params);
      const data = res.data || {};
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      toast.error('Failed to load orders: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehousesAndProducts();
  }, []);

  useEffect(() => {
    fetchOrders(0);
    setPage(0);
  }, [searchQuery, statusFilter, warehouseFilter]);

  const handleOpenDetails = async (orderId) => {
    setIsDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const res = await customerOrderService.getOrderById(orderId);
      setSelectedOrder(res.data);
    } catch (err) {
      toast.error('Failed to load order details');
      setIsDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1, maxAvailable: 0, price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (orderItems.length === 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = async (index, field, value) => {
    const updated = [...orderItems];
    updated[index][field] = value;

    if (field === 'productId') {
      const prod = products.find((p) => p.id === Number(value));
      updated[index].price = prod ? prod.sellingPrice : 0;

      // Check warehouse stock
      if (destWarehouseId && value) {
        try {
          const invRes = await inventoryService.getInventory(Number(value), Number(destWarehouseId));
          updated[index].maxAvailable = invRes.data?.availableStock || 0;
        } catch {
          updated[index].maxAvailable = 0;
        }
      }
    }

    setOrderItems(updated);
  };

  const calculateTotal = () => {
    return orderItems.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return acc + (price * qty);
    }, 0);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!destWarehouseId) {
      toast.warning('Please select a fulfillment warehouse');
      return;
    }

    // Validate items
    for (const item of orderItems) {
      if (!item.productId) {
        toast.warning('Please select a product for all line items');
        return;
      }
      if (item.quantity <= 0) {
        toast.warning('Quantity must be greater than 0');
        return;
      }
      if (item.maxAvailable !== undefined && item.quantity > item.maxAvailable) {
        toast.error(`Quantity ${item.quantity} exceeds available stock (${item.maxAvailable})`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        warehouseId: Number(destWarehouseId),
        notes,
        items: orderItems.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
        })),
      };

      await customerOrderService.createOrder(payload);
      toast.success('Customer order placed and stock reserved successfully!');
      setIsCreateOpen(false);
      resetCreateForm();
      fetchOrders(0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create customer order');
    } finally {
      setSubmitting(false);
    }
  };

  const resetCreateForm = () => {
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setShippingAddress('');
    setDestWarehouseId('');
    setNotes('');
    setOrderItems([{ productId: '', quantity: 1, maxAvailable: 0, price: 0 }]);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setStatusUpdating(true);
    try {
      await customerOrderService.updateStatus(orderId, {
        status: newStatus,
        notes: `Status transitioned to ${newStatus}`
      });
      toast.success(`Order status changed to ${newStatus}`);
      fetchOrders(page);
      if (selectedOrder && selectedOrder.id === orderId) {
        const res = await customerOrderService.getOrderById(orderId);
        setSelectedOrder(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning" dot>Pending</Badge>;
      case 'PROCESSING':
        return <Badge variant="info" dot>Processing</Badge>;
      case 'READY_TO_DISPATCH':
        return <Badge variant="indigo" dot>Ready to Dispatch</Badge>;
      case 'DISPATCHED':
        return <Badge variant="neutral" dot>Dispatched</Badge>;
      case 'DELIVERED':
        return <Badge variant="success" dot>Delivered</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Order Number',
      accessor: 'orderNumber',
      cell: (row) => (
        <div>
          <span className="font-mono font-semibold text-slate-900">{row.orderNumber}</span>
          <div className="text-xs text-slate-500">{formatDate(row.orderDate)}</div>
        </div>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.customerName}</div>
          <div className="text-xs text-slate-500">{row.customerPhone || row.customerEmail || '—'}</div>
        </div>
      ),
    },
    {
      header: 'Fulfillment Facility',
      accessor: 'warehouseName',
      cell: (row) => (
        <span className="text-slate-700 font-medium">{row.warehouseName}</span>
      ),
    },
    {
      header: 'Line Items',
      accessor: 'items',
      cell: (row) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {row.items?.length || 0} items
        </span>
      ),
    },
    {
      header: 'Order Total',
      accessor: 'totalAmount',
      cell: (row) => (
        <span className="font-bold text-slate-900">{formatINR(row.totalAmount)}</span>
      ),
    },
    {
      header: 'Fulfillment Status',
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
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customer Orders & Fulfillment</h1>
          <p className="text-sm text-slate-500 mt-1">
            Dispatch pipeline, stock reservations, order management, and real-time delivery status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders(page)}
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
                resetCreateForm();
                setIsCreateOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              New Order
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order # or customer..."
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
            <option value="">All Fulfillment Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="READY_TO_DISPATCH">Ready to Dispatch</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
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

      {/* Orders Table */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={(p) => {
          setPage(p);
          fetchOrders(p);
        }}
        emptyMessage="No customer orders found."
      />

      {/* Create Order Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Place New Customer Order"
        size="lg"
      >
        <form onSubmit={handleCreateOrder} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Full Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh Sharma"
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fulfillment Warehouse *
              </label>
              <select
                required
                value={destWarehouseId}
                onChange={(e) => setDestWarehouseId(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Warehouse Hub</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} ({wh.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Email
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="ramesh@example.com"
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shipping Address
              </label>
              <textarea
                rows={2}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Flat 402, Shanti Heights, Powai, Mumbai - 400076"
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Order Line Items */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Ordered Products</h3>
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
              {orderItems.map((item, idx) => (
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
                          {p.name} ({p.sku}) - {formatINR(p.sellingPrice)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">
                      Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full text-xs rounded border border-slate-300 p-1.5 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="w-28 text-right">
                    <span className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">
                      Subtotal
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {formatINR((item.price || 0) * (item.quantity || 1))}
                    </span>
                  </div>

                  {orderItems.length > 1 && (
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
              <span className="text-xs font-medium text-indigo-900">Estimated Total (Inclusive of Taxes)</span>
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
              Confirm Order & Reserve Stock
            </Button>
          </div>
        </form>
      </Modal>

      {/* Order Details & Workflow Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={selectedOrder ? `Order Details: ${selectedOrder.orderNumber}` : 'Order Details'}
        size="lg"
      >
        {detailsLoading ? (
          <div className="py-12 text-center text-slate-500">Loading order info...</div>
        ) : selectedOrder ? (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase text-slate-400">Order Placed</span>
                <p className="text-sm font-bold text-slate-800">{formatDate(selectedOrder.orderDate)}</p>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase text-slate-400">Current Status</span>
                <div className="mt-0.5">{getStatusBadge(selectedOrder.status)}</div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase text-slate-400">Fulfillment Facility</span>
                <p className="text-sm font-bold text-slate-800">{selectedOrder.warehouseName}</p>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase text-slate-400">Total Value</span>
                <p className="text-base font-bold text-indigo-600">{formatINR(selectedOrder.totalAmount)}</p>
              </div>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 bg-white">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Customer Information
                </h4>
                <p className="text-sm font-semibold text-slate-900">{selectedOrder.customerName}</p>
                {selectedOrder.customerEmail && (
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {selectedOrder.customerEmail}
                  </p>
                )}
                {selectedOrder.customerPhone && (
                  <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {selectedOrder.customerPhone}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-lg border border-slate-200 bg-white">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Shipping Destination
                </h4>
                <p className="text-xs text-slate-700 whitespace-pre-line">
                  {selectedOrder.shippingAddress || 'Store Pickup / Counter Sale'}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Ordered Inventory Items</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Product</th>
                      <th className="py-2.5 px-3 font-semibold">SKU</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Unit Price</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Qty</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder.items?.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-slate-800">{item.productName}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{item.productSku}</td>
                        <td className="py-2.5 px-3 text-right">{formatINR(item.unitPrice)}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatINR(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Workflow Action Buttons */}
            {canManage && selectedOrder.status !== 'DELIVERED' && selectedOrder.status !== 'CANCELLED' && (
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Progress Fulfillment Pipeline
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.status === 'PENDING' && (
                    <Button
                      variant="primary"
                      size="sm"
                      loading={statusUpdating}
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'PROCESSING')}
                    >
                      Move to Processing
                    </Button>
                  )}

                  {selectedOrder.status === 'PROCESSING' && (
                    <Button
                      variant="primary"
                      size="sm"
                      loading={statusUpdating}
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'READY_TO_DISPATCH')}
                    >
                      <PackageCheck className="w-4 h-4" />
                      Mark Ready to Dispatch
                    </Button>
                  )}

                  {selectedOrder.status === 'READY_TO_DISPATCH' && (
                    <Button
                      variant="primary"
                      size="sm"
                      loading={statusUpdating}
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'DISPATCHED')}
                    >
                      <Truck className="w-4 h-4" />
                      Dispatch & Deduct Stock
                    </Button>
                  )}

                  {selectedOrder.status === 'DISPATCHED' && (
                    <Button
                      variant="success"
                      size="sm"
                      loading={statusUpdating}
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'DELIVERED')}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Customer Delivery
                    </Button>
                  )}

                  <Button
                    variant="danger"
                    size="sm"
                    loading={statusUpdating}
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'CANCELLED')}
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel Order & Release Stock
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
