import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Power,
  Eye,
  Boxes,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { productService } from '../services/productService';
import { inventoryService } from '../services/inventoryService';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatNumber, formatDate } from '../utils/formatters';

export const Products = () => {
  const toast = useToast();
  const { hasRole } = useAuth();
  const canEdit = hasRole('ROLE_INVENTORY_MANAGER');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedActive, setSelectedActive] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Details Modal
  const [detailsProduct, setDetailsProduct] = useState(null);
  const [productInventories, setProductInventories] = useState([]);
  const [loadingInventories, setLoadingInventories] = useState(false);

  // Toggle Active Dialog
  const [toggleTarget, setToggleTarget] = useState(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    categoryId: '',
    costPrice: '',
    sellingPrice: '',
    reorderThreshold: 10,
    unit: 'Units',
    barcode: '',
    active: true,
  });

  const fetchProducts = async (currentPage = page) => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: 10,
        query: searchQuery.trim() || undefined,
        categoryId: selectedCategory || undefined,
        active: selectedActive !== '' ? selectedActive === 'true' : undefined,
      };
      const res = await productService.getProducts(params);
      if (res.data) {
        setProducts(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await productService.getCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(0);
    setPage(0);
  }, [searchQuery, selectedCategory, selectedActive]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      sku: '',
      name: '',
      description: '',
      categoryId: categories[0]?.id || '',
      costPrice: '',
      sellingPrice: '',
      reorderThreshold: 10,
      unit: 'Units',
      barcode: '',
      active: true,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      sku: prod.sku,
      name: prod.name,
      description: prod.description || '',
      categoryId: prod.categoryId,
      costPrice: prod.costPrice,
      sellingPrice: prod.sellingPrice,
      reorderThreshold: prod.reorderThreshold,
      unit: prod.unit,
      barcode: prod.barcode || '',
      active: prod.active,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const payload = {
        ...formData,
        categoryId: Number(formData.categoryId),
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        reorderThreshold: Number(formData.reorderThreshold),
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, payload);
        toast.success(`Product ${payload.name} updated successfully`);
      } else {
        await productService.createProduct(payload);
        toast.success(`Product ${payload.name} created and initialized across hubs`);
      }
      setIsFormOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleActiveConfirm = async () => {
    if (!toggleTarget) return;
    setToggleLoading(true);
    try {
      await productService.toggleActive(toggleTarget.id);
      toast.success(
        `Product ${toggleTarget.name} ${
          toggleTarget.active ? 'deactivated' : 'activated'
        } successfully`
      );
      setToggleTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Status change failed');
    } finally {
      setToggleLoading(false);
    }
  };

  const handleViewDetails = async (prod) => {
    setDetailsProduct(prod);
    setLoadingInventories(true);
    try {
      const res = await inventoryService.getProductInventory(prod.id);
      setProductInventories(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInventories(false);
    }
  };

  const columns = [
    {
      header: 'Product & SKU',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.name}</div>
          <div className="text-xs font-mono text-slate-500 mt-0.5">{row.sku}</div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'categoryName',
      render: (row) => (
        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
          {row.categoryName}
        </span>
      ),
    },
    {
      header: 'Cost / Selling (INR)',
      render: (row) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-800">{formatINR(row.sellingPrice)}</div>
          <div className="text-slate-400">Cost: {formatINR(row.costPrice)}</div>
        </div>
      ),
    },
    {
      header: 'Total Available Stock',
      render: (row) => (
        <div className="text-xs">
          <div className="font-bold text-slate-900">
            {formatNumber(row.totalAvailableStock)} {row.unit}
          </div>
          <div className="text-[11px] text-slate-400">
            OnHand: {formatNumber(row.totalOnHandStock)} • Rsv: {formatNumber(row.totalReservedStock)}
          </div>
        </div>
      ),
    },
    {
      header: 'Stock Status',
      render: (row) => <Badge status={row.stockStatus} />,
    },
    {
      header: 'Active State',
      render: (row) => (
        <Badge
          status={row.active ? 'ACTIVE' : 'INACTIVE'}
          label={row.active ? 'Active' : 'Inactive'}
        />
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleViewDetails(row)}
            title="View Details"
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          {canEdit && (
            <>
              <button
                onClick={() => handleOpenEdit(row)}
                title="Edit Product"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setToggleTarget(row)}
                title={row.active ? 'Deactivate Product' : 'Activate Product'}
                className={`p-1.5 rounded-lg transition-colors ${
                  row.active
                    ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                    : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <Power className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Product Catalog</h2>
          <p className="text-xs text-slate-500 mt-1">
            Master registry of SKUs, pricing, categories, and inventory thresholds
          </p>
        </div>
        {canEdit && (
          <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
            Add New Product
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU or Product Name..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-slate-800"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-slate-700"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={selectedActive}
          onChange={(e) => setSelectedActive(e.target.value)}
          className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-slate-700"
        >
          <option value="">All Statuses (Active & Archived)</option>
          <option value="true">Active Only</option>
          <option value="false">Archived / Inactive Only</option>
        </select>
      </div>

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={(p) => {
          setPage(p);
          fetchProducts(p);
        }}
        emptyTitle="No products match your search criteria"
        emptyDescription="Try clearing your search filters or add a new product."
        emptyActionLabel={canEdit ? 'Add First Product' : undefined}
        onEmptyAction={handleOpenCreate}
      />

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingProduct ? 'Edit Product Catalog Item' : 'Register New Product'}
        subtitle="Configure pricing, category classification, and reorder alerts"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SKU Code *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-mono"
                placeholder="SKU-FOOD-010"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              placeholder="e.g., Tata Salt Vacuum Evaporated 1kg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Specifications
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              placeholder="Brief retail specifications..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cost Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-mono"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-mono"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reorder Threshold
              </label>
              <input
                type="number"
                min="0"
                value={formData.reorderThreshold}
                onChange={(e) => setFormData({ ...formData, reorderThreshold: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                placeholder="Pack, Bottle, Unit, Tin..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Barcode / EAN
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-mono"
                placeholder="8901030010012"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsFormOpen(false)}
              disabled={formSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={formSubmitting}>
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Product Details & Regional Stock Modal */}
      <Modal
        isOpen={!!detailsProduct}
        onClose={() => setDetailsProduct(null)}
        title={detailsProduct?.name || 'Product Details'}
        subtitle={`SKU: ${detailsProduct?.sku} • Category: ${detailsProduct?.categoryName}`}
      >
        {detailsProduct && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Cost Price</span>
                <p className="text-sm font-bold text-slate-800 font-mono">{formatINR(detailsProduct.costPrice)}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Selling Price</span>
                <p className="text-sm font-bold text-indigo-600 font-mono">{formatINR(detailsProduct.sellingPrice)}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Available Units</span>
                <p className="text-sm font-bold text-emerald-600">{formatNumber(detailsProduct.totalAvailableStock)} {detailsProduct.unit}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Threshold</span>
                <p className="text-sm font-bold text-slate-800">{detailsProduct.reorderThreshold} Units</p>
              </div>
            </div>

            {/* Warehouse Stock Breakdown */}
            <div>
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-indigo-600" />
                <span>Regional Warehouse Inventory Breakdown</span>
              </h4>

              {loadingInventories ? (
                <div className="p-6 text-center text-xs text-slate-400">Loading stock records...</div>
              ) : productInventories.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No warehouse stock mapped yet.</div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {productInventories.map((inv) => (
                    <div key={inv.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <span className="font-semibold text-slate-900">{inv.warehouseName}</span>
                        <span className="text-slate-400 ml-2 font-mono">({inv.warehouseCode})</span>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="text-slate-500">On-Hand:</span>{' '}
                          <span className="font-semibold text-slate-800">{inv.onHandQuantity}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Reserved:</span>{' '}
                          <span className="font-semibold text-amber-600">{inv.reservedQuantity}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Available:</span>{' '}
                          <span className="font-bold text-emerald-600">{inv.availableQuantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setDetailsProduct(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog for Archive / Reactivate */}
      <ConfirmDialog
        isOpen={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggleActiveConfirm}
        loading={toggleLoading}
        title={toggleTarget?.active ? 'Deactivate Product' : 'Reactivate Product'}
        message={`Are you sure you want to ${
          toggleTarget?.active ? 'deactivate' : 'activate'
        } "${toggleTarget?.name}"? Historical orders and movements will be preserved.`}
        confirmText={toggleTarget?.active ? 'Deactivate' : 'Activate'}
        variant={toggleTarget?.active ? 'danger' : 'emerald'}
      />
    </div>
  );
};
