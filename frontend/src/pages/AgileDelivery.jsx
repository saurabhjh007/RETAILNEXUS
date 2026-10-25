import React, { useState, useEffect } from 'react';
import {
  Kanban,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Layers,
  ChevronRight,
  Calendar,
  Zap,
  Award,
  RefreshCw,
  GitBranch,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { agileService } from '../services/agileService';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';

const EPICS = [
  {
    id: 'EPIC-01',
    title: 'Enterprise Architecture, RBAC & Core Framework',
    description: 'Spring Boot 3.4 architecture, stateless JWT security, flyway database migration, and React Vite frontend framework.',
    points: 42,
    completedPoints: 42,
    status: 'COMPLETED',
    sprints: 'Sprint 1 - 2',
    color: 'border-l-indigo-500',
  },
  {
    id: 'EPIC-02',
    title: 'Product Catalog & Hierarchical Category Taxonomy',
    description: 'Complete SKU management, barcodes, cost and selling pricing, category hierarchy, and dynamic product search.',
    points: 38,
    completedPoints: 38,
    status: 'COMPLETED',
    sprints: 'Sprint 3',
    color: 'border-l-blue-500',
  },
  {
    id: 'EPIC-03',
    title: 'Multi-Warehouse Facility Operations & Capacity',
    description: 'Multi-location storage nodes (Mumbai, Delhi, Bengaluru), storage metrics, facility contact info, and warehouse managers.',
    points: 35,
    completedPoints: 35,
    status: 'COMPLETED',
    sprints: 'Sprint 4',
    color: 'border-l-cyan-500',
  },
  {
    id: 'EPIC-04',
    title: 'Real-Time Inventory Engine & Optimistic Locking',
    description: 'On-hand, reserved, and available stock math. JPA versioning prevents race conditions, overselling, and negative balances.',
    points: 52,
    completedPoints: 52,
    status: 'COMPLETED',
    sprints: 'Sprint 5 - 6',
    color: 'border-l-emerald-500',
  },
  {
    id: 'EPIC-05',
    title: 'Atomic Inter-Warehouse Transfers & Movement Ledger',
    description: 'Transactional stock movements between facilities with live stock verification, transfer tracking, and immutable audit history.',
    points: 45,
    completedPoints: 45,
    status: 'COMPLETED',
    sprints: 'Sprint 7 - 8',
    color: 'border-l-amber-500',
  },
  {
    id: 'EPIC-06',
    title: 'Automated Threshold Triggers & Low-Stock Alerts',
    description: 'Automatic safety stock monitoring, real-time trigger generation, severity classification, and acknowledgment workflows.',
    points: 34,
    completedPoints: 34,
    status: 'COMPLETED',
    sprints: 'Sprint 9',
    color: 'border-l-rose-500',
  },
  {
    id: 'EPIC-07',
    title: 'Vendor Procurement, Inbound POs & Goods Receipt',
    description: 'Supplier directory, GSTIN records, purchase order lifecycle (Draft to Approved), and partial/full goods receipt validation.',
    points: 58,
    completedPoints: 58,
    status: 'COMPLETED',
    sprints: 'Sprint 10 - 12',
    color: 'border-l-purple-500',
  },
  {
    id: 'EPIC-08',
    title: 'Customer Order Dispatch Pipeline & Analytics Reporting',
    description: 'Order reservation, fulfillment statuses, streaming RFC-4180 CSV export, executive valuation metrics, and burndown analytics.',
    points: 56,
    completedPoints: 56,
    status: 'COMPLETED',
    sprints: 'Sprint 13 - 15',
    color: 'border-l-violet-600',
  },
];

export const AgileDelivery = () => {
  const toast = useToast();
  const { hasRole } = useAuth();
  const canEdit = hasRole('ROLE_ADMIN') || hasRole('ROLE_INVENTORY_MANAGER');

  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sprints'); // 'sprints' | 'epics' | 'burndown'

  // Edit Sprint Modal
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editCompleted, setEditCompleted] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchSprints = async () => {
    setLoading(true);
    try {
      const res = await agileService.getSprints();
      setSprints(res.data || []);
    } catch (err) {
      toast.error('Failed to load agile delivery plan: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSprints();
  }, []);

  const handleOpenEdit = (sprint) => {
    setSelectedSprint(sprint);
    setEditStatus(sprint.status);
    setEditCompleted(sprint.storyPointsCompleted);
  };

  const handleUpdateSprint = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await agileService.updateSprintProgress(
        selectedSprint.sprintNumber,
        editStatus,
        Number(editCompleted)
      );
      toast.success(`Sprint ${selectedSprint.sprintNumber} updated successfully`);
      setSelectedSprint(null);
      fetchSprints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update sprint');
    } finally {
      setUpdating(false);
    }
  };

  const totalPlanned = sprints.reduce((acc, s) => acc + s.storyPointsPlanned, 0);
  const totalCompleted = sprints.reduce((acc, s) => acc + s.storyPointsCompleted, 0);
  const completedSprintsCount = sprints.filter((s) => s.status === 'COMPLETED').length;
  const overallProgress = totalPlanned > 0 ? ((totalCompleted / totalPlanned) * 100).toFixed(1) : 0;

  const chartData = sprints.map((s) => ({
    name: `S${s.sprintNumber}`,
    planned: s.storyPointsPlanned,
    completed: s.storyPointsCompleted,
  }));

  const getSprintStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success" dot>Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="indigo" dot>In Progress</Badge>;
      case 'PLANNED':
      default:
        return <Badge variant="neutral">Planned</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Agile Scrum Delivery Roadmap</h1>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
              8 Epics • 15 Sprints
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise delivery tracking: planned velocity, epic mapping, story point burndown, and sprint increments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSprints}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Sprints
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Overall Delivery</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{overallProgress}%</div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Story Points Burned</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {totalCompleted} <span className="text-sm font-normal text-slate-500">/ {totalPlanned} pts</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Across 15 scheduled sprint cycles</p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Sprints Completed</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {completedSprintsCount} <span className="text-sm font-normal text-slate-500">/ 15 Sprints</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">100% of planned sprints delivered</p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Target Epics</span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">8 Epics</div>
            <p className="text-xs text-slate-500 mt-1">All 8 core capability epics satisfied</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('sprints')}
          className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'sprints'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          15 Scrum Sprints Timeline
        </button>

        <button
          onClick={() => setActiveTab('epics')}
          className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'epics'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          8 Core Capability Epics
        </button>

        <button
          onClick={() => setActiveTab('burndown')}
          className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'burndown'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Velocity & Burndown Chart
        </button>
      </div>

      {/* Sprints Tab */}
      {activeTab === 'sprints' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sprints.map((sprint) => {
            const pct = sprint.completionPercentage || 0;
            return (
              <div
                key={sprint.sprintNumber}
                className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      SPRINT #{sprint.sprintNumber}
                    </span>
                    {getSprintStatusBadge(sprint.status)}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-2">{sprint.name}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-3">
                    {sprint.goal}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span>Story Points</span>
                    <span className="font-bold text-slate-800">
                      {sprint.storyPointsCompleted} / {sprint.storyPointsPlanned} pts ({pct}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}</span>
                    {canEdit && (
                      <button
                        onClick={() => handleOpenEdit(sprint)}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Epics Tab */}
      {activeTab === 'epics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EPICS.map((epic) => (
            <div
              key={epic.id}
              className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm border-l-4 ${epic.color}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {epic.id}
                </span>
                <Badge variant="success" dot>Delivered</Badge>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-1">{epic.title}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {epic.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Cadence: <span className="font-semibold text-slate-700">{epic.sprints}</span>
                </span>
                <span className="font-bold text-indigo-700">
                  {epic.completedPoints} / {epic.points} Story Points
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Burndown & Velocity Tab */}
      {activeTab === 'burndown' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Scrum Team Velocity per Sprint</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison between planned story point commitment and velocity delivered across all 15 sprints.
            </p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1E293B', color: '#fff', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="planned" name="Planned Points" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed Points" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Edit Sprint Progress Modal */}
      {selectedSprint && (
        <Modal
          isOpen={!!selectedSprint}
          onClose={() => setSelectedSprint(null)}
          title={`Update Sprint #${selectedSprint.sprintNumber}: ${selectedSprint.name}`}
          size="sm"
        >
          <form onSubmit={handleUpdateSprint} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sprint Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Completed Story Points (Max: {selectedSprint.storyPointsPlanned})
              </label>
              <input
                type="number"
                min="0"
                max={selectedSprint.storyPointsPlanned}
                value={editCompleted}
                onChange={(e) => setEditCompleted(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedSprint(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={updating}
              >
                Save Progress
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
