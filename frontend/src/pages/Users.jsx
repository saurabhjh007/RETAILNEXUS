import React, { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Mail,
  Phone,
  UserCheck,
  Lock,
  Search
} from 'lucide-react';
import { userService } from '../services/userService';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';

const AVAILABLE_ROLES = [
  { id: 'ROLE_ADMIN', label: 'Administrator', desc: 'Full system privileges & user management' },
  { id: 'ROLE_INVENTORY_MANAGER', label: 'Inventory Manager', desc: 'Manages products, warehouses, POs & transfers' },
  { id: 'ROLE_WAREHOUSE_STAFF', label: 'Warehouse Staff', desc: 'Performs stock adjustments, transfers, PO receiving' },
  { id: 'ROLE_VIEWER', label: 'Auditor / Viewer', desc: 'Read-only access across all inventory modules' },
];

export const Users = () => {
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add User Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRoles, setSelectedRoles] = useState(['ROLE_WAREHOUSE_STAFF']);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      toast.error('Failed to load users: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setUsername('');
    setPassword('');
    setFullName('');
    setEmail('');
    setPhone('');
    setSelectedRoles(['ROLE_WAREHOUSE_STAFF']);
    setIsModalOpen(true);
  };

  const handleRoleToggle = (roleId) => {
    if (selectedRoles.includes(roleId)) {
      if (selectedRoles.length > 1) {
        setSelectedRoles(selectedRoles.filter((r) => r !== roleId));
      }
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        username,
        password,
        fullName,
        email,
        phone,
        roles: selectedRoles,
      };

      await userService.createUser(payload);
      toast.success('User account registered successfully');
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id, isCurrentlyActive) => {
    try {
      await userService.toggleActive(id);
      toast.success(isCurrentlyActive ? 'User account deactivated' : 'User account reactivated');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user status: ' + (err.response?.data?.message || err.message));
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return <Badge key={role} variant="danger" dot>Administrator</Badge>;
      case 'ROLE_INVENTORY_MANAGER':
        return <Badge key={role} variant="indigo" dot>Manager</Badge>;
      case 'ROLE_WAREHOUSE_STAFF':
        return <Badge key={role} variant="warning" dot>Staff</Badge>;
      case 'ROLE_VIEWER':
        return <Badge key={role} variant="neutral">Viewer</Badge>;
      default:
        return <Badge key={role}>{role}</Badge>;
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.username?.toLowerCase().includes(q) ||
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      header: 'User Account',
      accessor: 'username',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
            {row.fullName ? row.fullName.slice(0, 2) : row.username.slice(0, 2)}
          </div>
          <div>
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              {row.fullName}
              {row.username === currentUser?.username && (
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-semibold px-1.5 py-0.2 rounded">
                  You
                </span>
              )}
            </div>
            <span className="text-xs font-mono text-slate-500">@{row.username}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Roles',
      accessor: 'roles',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles?.map((r) => getRoleBadge(r))}
        </div>
      ),
    },
    {
      header: 'Contact Info',
      accessor: 'email',
      cell: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="text-slate-700 flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-slate-400" />
            {row.email}
          </div>
          {row.phone && (
            <div className="text-slate-500 flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-slate-400" />
              {row.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Created On',
      accessor: 'createdAt',
      cell: (row) => (
        <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'active',
      cell: (row) => (
        <Badge variant={row.active ? 'success' : 'neutral'} dot>
          {row.active ? 'Active' : 'Disabled'}
        </Badge>
      ),
    },
    {
      header: 'Action',
      accessor: 'id',
      cell: (row) => (
        <div>
          {row.username !== currentUser?.username && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleActive(row.id, row.active)}
              className="text-xs py-1 px-2.5"
            >
              {row.active ? 'Deactivate' : 'Activate'}
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management & RBAC</h1>
          <p className="text-sm text-slate-500 mt-1">
            Role-Based Access Control enforcing granular permission scopes for retail personnel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
          >
            <Plus className="w-4 h-4" />
            Create User Account
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="text-xs text-slate-500">
          Total accounts: {users.length}
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        emptyMessage="No users found."
      />

      {/* Create User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provision Personnel Account"
        size="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. jdoe"
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Employee Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@retailnexus.com"
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Role Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Assign Permissions & Roles *
            </label>
            <div className="space-y-2">
              {AVAILABLE_ROLES.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    selectedRoles.includes(r.id)
                      ? 'border-indigo-500 bg-indigo-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(r.id)}
                    onChange={() => handleRoleToggle(r.id)}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{r.label}</div>
                    <div className="text-[11px] text-slate-500">{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
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
              Provision Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
