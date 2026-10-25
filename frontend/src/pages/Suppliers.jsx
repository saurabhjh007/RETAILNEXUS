import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  MapPin,
  FileText,
  Truck,
  Hash
} from 'lucide-react';
import { supplierService } from '../services/supplierService';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';

export const Suppliers = () => {
  const toast = useToast();
  const { hasRole } = useAuth();
  const canManage = hasRole('ROLE_INVENTORY_MANAGER') || hasRole('ROLE_ADMIN');

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [gstin, setGstin] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchSuppliers = async (currentPage = page) => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: 15,
      };
      if (searchQuery) params.query = searchQuery;
      if (activeFilter !== '') params.active = activeFilter === 'true';

      const res = await supplierService.getSuppliers(params);
      const data = res.data || {};
      setSuppliers(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      toast.error('Failed to load suppliers: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers(0);
    setPage(0);
  }, [searchQuery, activeFilter]);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setCode('');
    setName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCity('');
    setGstin('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    setCode(sup.code || '');
    setName(sup.name || '');
    setContactPerson(sup.contactPerson || '');
    setEmail(sup.email || '');
    setPhone(sup.phone || '');
    setAddress(sup.address || '');
    setCity(sup.city || '');
    setGstin(sup.gstin || '');
    setIsActive(sup.active);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        code,
        name,
        contactPerson,
        email,
        phone,
        address,
        city,
        gstin,
        active: isActive,
      };

      if (editingSupplier) {
        await supplierService.updateSupplier(editingSupplier.id, payload);
        toast.success('Supplier updated successfully');
      } else {
        await supplierService.createSupplier(payload);
        toast.success('Supplier partner registered successfully');
      }

      setIsModalOpen(false);
      fetchSuppliers(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save supplier');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await supplierService.toggleActive(id);
      toast.success('Supplier status toggled');
      fetchSuppliers(page);
    } catch (err) {
      toast.error('Failed to change status: ' + (err.response?.data?.message || err.message));
    }
  };

  const columns = [
    {
      header: 'Supplier Code',
      accessor: 'code',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
          {row.code}
        </span>
      ),
    },
    {
      header: 'Vendor Name & GSTIN',
      accessor: 'name',
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.name}</div>
          <div className="text-xs font-mono text-slate-500 mt-0.5">GSTIN: {row.gstin || 'Unregistered'}</div>
        </div>
      ),
    },
    {
      header: 'Contact Details',
      accessor: 'contactPerson',
      cell: (row) => (
        <div className="text-xs space-y-1">
          <div className="font-medium text-slate-800">{row.contactPerson || '—'}</div>
          <div className="text-slate-500 flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-400" />
            {row.email}
          </div>
          <div className="text-slate-500 flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" />
            {row.phone}
          </div>
        </div>
      ),
    },
    {
      header: 'Location',
      accessor: 'city',
      cell: (row) => (
        <div className="text-xs text-slate-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{row.city || row.address || '—'}</span>
        </div>
      ),
    },
    {
      header: 'PO Orders Count',
      accessor: 'totalOrdersCount',
      cell: (row) => (
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
          <Truck className="w-3.5 h-3.5 text-indigo-500" />
          <span>{row.totalOrdersCount} POs</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'active',
      cell: (row) => (
        <Badge variant={row.active ? 'success' : 'neutral'} dot>
          {row.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (row) => (
        <div className="flex items-center gap-2">
          {canManage && (
            <>
              <button
                onClick={() => handleOpenEdit(row)}
                className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                title="Edit Supplier"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleToggleActive(row.id)}
                className={`p-1 rounded ${
                  row.active ? 'text-slate-400 hover:text-rose-600' : 'text-slate-400 hover:text-emerald-600'
                }`}
                title={row.active ? 'Deactivate' : 'Activate'}
              >
                {row.active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              </button>
            </>
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Vendors & Suppliers Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Authorized supply-chain vendors, GST credentials, and inbound procurement partners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSuppliers(page)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {canManage && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAdd}
            >
              <Plus className="w-4 h-4" />
              Add Supplier
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
            placeholder="Search by vendor name, code, GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-500">Status:</span>
          </div>

          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 py-2 px-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={suppliers}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={(p) => {
          setPage(p);
          fetchSuppliers(p);
        }}
        emptyMessage="No suppliers registered matching criteria."
      />

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? `Edit Supplier: ${editingSupplier.name}` : 'Register New Vendor Partner'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supplier Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. SUP-TECH"
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GSTIN Tax ID
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="e.g. 27AABCT3518Q1ZV"
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500 uppercase font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company / Vendor Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. TechCorp India Pvt Ltd"
              className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Rajesh Kumar"
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City / Region
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mumbai"
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="procure@techcorp.in"
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 22 2876 5432"
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Registered Office Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Plot 12, Industrial Area, Andheri East"
              className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isSupActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isSupActive" className="text-xs font-medium text-slate-700">
              Active Vendor for Purchase Orders
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
