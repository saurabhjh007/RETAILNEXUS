import React, { useState, useEffect } from 'react';
import {
  Warehouse as WarehouseIcon,
  Plus,
  MapPin,
  Mail,
  Phone,
  User,
  Boxes,
  IndianRupee,
  Edit2,
  ExternalLink,
} from 'lucide-react';
import { warehouseService } from '../services/warehouseService';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatNumber } from '../utils/formatters';

export const Warehouses = () => {
  const toast = useToast();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ROLE_ADMIN');

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    managerName: '',
    contactEmail: '',
    contactPhone: '',
    active: true,
  });

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await warehouseService.getWarehouses();
      setWarehouses(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch warehouses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleOpenCreate = () => {
    setEditingWarehouse(null);
    setFormData({
      code: '',
      name: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      managerName: '',
      contactEmail: '',
      contactPhone: '',
      active: true,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (wh) => {
    setEditingWarehouse(wh);
    setFormData({
      code: wh.code,
      name: wh.name,
      address: wh.address,
      city: wh.city,
      state: wh.state,
      postalCode: wh.postalCode,
      managerName: wh.managerName || '',
      contactEmail: wh.contactEmail || '',
      contactPhone: wh.contactPhone || '',
      active: wh.active,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (editingWarehouse) {
        await warehouseService.updateWarehouse(editingWarehouse.id, formData);
        toast.success(`Warehouse ${formData.name} updated successfully`);
      } else {
        await warehouseService.createWarehouse(formData);
        toast.success(`Warehouse ${formData.name} registered and mapped to catalog`);
      }
      setIsFormOpen(false);
      fetchWarehouses();
    } catch (err) {
      toast.error(err.message || 'Failed to save warehouse');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Warehouse Facilities</h2>
          <p className="text-xs text-slate-500 mt-1">
            Regional distribution hubs, fulfillment centers, and stock valuation
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
            Add Warehouse Facility
          </Button>
        )}
      </div>

      {/* Warehouse Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((wh) => (
            <Card key={wh.id} hover className="flex flex-col justify-between">
              <div>
                <CardHeader className="p-5 flex items-start justify-between gap-3 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0">
                      <WarehouseIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{wh.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded">
                          {wh.code}
                        </span>
                        <Badge status={wh.active ? 'ACTIVE' : 'INACTIVE'} size="xs" />
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenEdit(wh)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Warehouse"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start gap-2.5 text-xs text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      {wh.address}, {wh.city}, {wh.state} — {wh.postalCode}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {wh.managerName && (
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-800">{wh.managerName}</span>
                      </div>
                    )}
                    {wh.contactEmail && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{wh.contactEmail}</span>
                      </div>
                    )}
                    {wh.contactPhone && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{wh.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>

              {/* Warehouse Inventory Rollup Footer */}
              <div className="p-4 bg-slate-50/60 border-t border-slate-100 rounded-b-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Inventory</span>
                  <span className="font-bold text-slate-900">{formatNumber(wh.totalUnits)} Units</span>
                  <span className="text-[11px] text-slate-400 ml-1">({wh.totalProductsCount} SKUs)</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Valuation</span>
                  <span className="font-bold text-indigo-600 font-mono">{formatINR(wh.totalValuation)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Warehouse Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingWarehouse ? 'Edit Warehouse Facility' : 'Register New Warehouse'}
        subtitle="Specify geographic logistics details and management contacts"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Warehouse Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-mono"
                placeholder="WH-KOL-01"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Facility Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                placeholder="Kolkata Eastern Logistics Center"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              placeholder="Plot 12, Taratala Industrial Area"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                placeholder="Kolkata"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                placeholder="West Bengal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code *</label>
              <input
                type="text"
                required
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                placeholder="700088"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Manager</label>
              <input
                type="text"
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                placeholder="Amit Mukherjee"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                placeholder="kolkata.hub@retailnexus.in"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                placeholder="+91 33 2490 0000"
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
              {editingWarehouse ? 'Save Changes' : 'Create Warehouse'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
