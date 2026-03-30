"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import {
  Users, AlertTriangle, CheckCircle, TrendingUp,
  ChevronDown, ChevronUp, X, Loader2, ArrowUpDown
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const initials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');

const successColor = (rate) =>
  rate >= 90 ? 'bg-green-100 text-green-700' :
  rate >= 70 ? 'bg-orange-100 text-orange-700' :
               'bg-red-100 text-red-700';

const STATUS_COLORS = {
  NOT_STARTED: 'bg-gray-100 text-gray-600',
  IN_PROGRESS:  'bg-blue-100 text-blue-700',
  COMPLETED:    'bg-green-100 text-green-700',
  OVERDUE:      'bg-red-100 text-red-700',
  CANCELLED:    'bg-gray-200 text-gray-500',
};

const PRIORITY_COLORS = {
  URGENT: { bg: 'bg-red-600',    text: 'text-white',      radio: 'accent-red-600' },
  HIGH:   { bg: 'bg-orange-500', text: 'text-white',      radio: 'accent-orange-500' },
  MEDIUM: { bg: 'bg-blue-500',   text: 'text-white',      radio: 'accent-blue-500' },
  LOW:    { bg: 'bg-gray-300',   text: 'text-gray-800',   radio: 'accent-gray-400' },
};

const TASK_TYPES = [
  'VENDOR_REVIEW','RFQ_EVALUATION','CONTRACT_REVIEW',
  'IPC_PROCESSING','DOCUMENT_VERIFICATION','PROJECT_FOLLOWUP','GENERAL',
];
const MODULE_OPTIONS = ['','VENDOR','RFQ','CONTRACT','PO','IPC','GENERAL'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function TeamOverviewPage() {
  const router = useRouter();

  const [teamData, setTeamData]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // Card expand
  const [expandedMember, setExpandedMember] = useState(null);

  // Table sort + filter
  const [sort, setSort]             = useState({ col: 'dueDate', dir: 'asc' });
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterStatus,   setFilterStatus]   = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // Assignment modal
  const [assignModal, setAssignModal] = useState({ open: false, preselectedUserId: '' });
  const [form, setForm] = useState({
    title: '', taskType: 'GENERAL', assignedToId: '',
    dueDate: '', priority: 'MEDIUM', relatedModule: '', remarks: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchTeamData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) { router.replace('/login'); return; }

      const res = await fetch(`${API}/api/tasks/team-overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { router.replace('/login'); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setTeamData(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchTeamData(); }, [fetchTeamData]);

  // ── Toast helper ───────────────────────────────────────────────────────────

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Open modal ─────────────────────────────────────────────────────────────

  const openModal = (preselectedUserId = '') => {
    setForm(f => ({ ...f, assignedToId: String(preselectedUserId) }));
    setAssignModal({ open: true, preselectedUserId });
  };

  // ── Submit task ────────────────────────────────────────────────────────────

  const handleAssignTask = async () => {
    if (!form.title.trim() || !form.assignedToId || !form.dueDate) {
      showToast('Title, assignee, and due date are required', 'error');
      return;
    }
    const token = localStorage.getItem('authToken');
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/tasks`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          assignedToId: parseInt(form.assignedToId),
          relatedEntityId: form.relatedModule && form.relatedModule !== '' ? undefined : undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed');
      const assigneeName =
        teamData?.teamMembers?.find(m => String(m.userId) === String(form.assignedToId))?.userName || 'team member';
      showToast(`Task assigned to ${assigneeName}`);
      setAssignModal({ open: false, preselectedUserId: '' });
      setForm({ title:'', taskType:'GENERAL', assignedToId:'', dueDate:'', priority:'MEDIUM', relatedModule:'', remarks:'' });
      await fetchTeamData();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived table data ─────────────────────────────────────────────────────

  const allTasks = (teamData?.teamMembers || []).flatMap(m =>
    (m.tasks || []).map(t => ({ ...t, userName: m.userName, userId: m.userId }))
  );

  const filteredTasks = allTasks
    .filter(t => !filterAssignee || String(t.userId) === filterAssignee)
    .filter(t => !filterStatus   || t.status === filterStatus)
    .filter(t => !filterPriority || t.priority === filterPriority)
    .sort((a, b) => {
      let va = a[sort.col], vb = b[sort.col];
      if (sort.col === 'dueDate') { va = new Date(va); vb = new Date(vb); }
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (col) =>
    setSort(s => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }));

  // ── Totals ─────────────────────────────────────────────────────────────────

  const totals = teamData?.totals || { totalTasks: 0, totalOverdue: 0, totalCompleted: 0, averageSuccessRate: 0 };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-64 py-12">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-500">Loading team overview…</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-64 py-12">
          <div className="text-center max-w-sm">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-gray-700 font-medium mb-1">Failed to load team data</p>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button onClick={fetchTeamData} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Retry</button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold transition-all ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
          }`}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Team Overview</h1>
            <p className="text-gray-500 text-sm mt-1">Monitor your team's workload and task completion.</p>
          </div>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: '#B8960A' }}
          >
            + Assign Task
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Active Tasks', value: totals.totalTasks, icon: <Users className="text-blue-500" size={20} />, bg: 'bg-blue-50' },
            { label: 'Overdue Tasks',       value: totals.totalOverdue, icon: <AlertTriangle className="text-red-500" size={20} />, bg: 'bg-red-50' },
            { label: 'Completed (All)',      value: totals.totalCompleted, icon: <CheckCircle className="text-green-500" size={20} />, bg: 'bg-green-50' },
            {
              label: 'Avg Success Rate',
              value: `${totals.averageSuccessRate}%`,
              icon: <TrendingUp className={totals.averageSuccessRate >= 90 ? 'text-green-500' : totals.averageSuccessRate >= 70 ? 'text-orange-500' : 'text-red-500'} size={20} />,
              bg: totals.averageSuccessRate >= 90 ? 'bg-green-50' : totals.averageSuccessRate >= 70 ? 'bg-orange-50' : 'bg-red-50',
            },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${card.bg}`}>{card.icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Team Member Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {(teamData?.teamMembers || []).map(member => {
            const isExpanded = expandedMember === member.userId;
            const totalMemberTasks = member.tasks?.length || 0;
            const progressPct = totalMemberTasks > 0
              ? Math.min(100, Math.round((member.inProgressCount / totalMemberTasks) * 100))
              : 0;

            return (
              <div key={member.userId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                {/* Avatar + Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: '#0A1628' }}
                  >
                    {initials(member.userName)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{member.userName}</p>
                    <p className="text-xs text-gray-500 truncate">{member.jobTitle || 'Team Member'}</p>
                  </div>
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${successColor(member.successRate)}`}>
                    {member.successRate}%
                  </span>
                </div>

                {/* Mini stats */}
                <div className="flex gap-2 mb-3">
                  {[
                    { label: 'In Progress', val: member.inProgressCount,     color: 'bg-blue-50 text-blue-700' },
                    { label: 'Overdue',     val: member.overdueCount,         color: 'bg-red-50 text-red-700' },
                    { label: 'Done (30d)',  val: member.completedLast30Days,  color: 'bg-green-50 text-green-700' },
                  ].map(stat => (
                    <div key={stat.label} className={`flex-1 text-center rounded-lg py-1.5 ${stat.color}`}>
                      <p className="text-lg font-bold">{stat.val}</p>
                      <p className="text-xs">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Workload</span><span>{progressPct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${progressPct}%`, backgroundColor: '#B8960A' }}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setExpandedMember(isExpanded ? null : member.userId)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50 flex items-center justify-center gap-1"
                  >
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    View Tasks
                  </button>
                  <button
                    onClick={() => openModal(member.userId)}
                    className="flex-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center justify-center"
                    style={{ backgroundColor: '#0A1628' }}
                  >
                    Assign Task
                  </button>
                </div>

                {/* Inline task list */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    {(member.tasks || []).length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-2">No tasks assigned</p>
                    ) : (member.tasks || []).map(t => (
                      <div key={t.id} className="flex items-center justify-between text-xs gap-2">
                        <span className="flex-1 truncate text-gray-700 font-medium">{t.title}</span>
                        <span className={`px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${STATUS_COLORS[t.status] || 'bg-gray-100 text-gray-600'}`}>
                          {t.status?.replace(/_/g, ' ')}
                        </span>
                        <span className={`whitespace-nowrap font-semibold ${t.daysUntilDue < 0 ? 'text-red-600' : t.daysUntilDue <= 2 ? 'text-orange-500' : 'text-gray-500'}`}>
                          {t.daysUntilDue < 0 ? `${Math.abs(t.daysUntilDue)}d overdue` : t.daysUntilDue === 0 ? 'Today' : `${t.daysUntilDue}d`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Full Team Task Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-800">All Team Tasks</h2>
            <div className="flex flex-wrap gap-2 items-center">
              {/* Assignee filter */}
              <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-700">
                <option value="">All Assignees</option>
                {(teamData?.teamMembers || []).map(m => (
                  <option key={m.userId} value={String(m.userId)}>{m.userName}</option>
                ))}
              </select>
              {/* Status filter */}
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-700">
                <option value="">All Statuses</option>
                {['NOT_STARTED','IN_PROGRESS','COMPLETED','OVERDUE','CANCELLED'].map(s => (
                  <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
                ))}
              </select>
              {/* Priority filter */}
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-700">
                <option value="">All Priorities</option>
                {['URGENT','HIGH','MEDIUM','LOW'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {/* Export placeholder */}
              <button
                onClick={() => showToast('Export coming soon')}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
              >
                Export to Excel
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {[
                    { col: 'title',    label: 'Task' },
                    { col: 'userName', label: 'Assigned To' },
                    { col: 'taskType', label: 'Type' },
                    { col: 'priority', label: 'Priority' },
                    { col: 'dueDate',  label: 'Due Date' },
                    { col: 'status',   label: 'Status' },
                    { col: 'daysUntilDue', label: 'Days Until Due' },
                  ].map(({ col, label }) => (
                    <th
                      key={col}
                      onClick={() => toggleSort(col)}
                      className="text-left py-3 px-4 text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-800 select-none"
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        <ArrowUpDown size={11} className={sort.col === col ? 'text-blue-500' : 'text-gray-300'} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-400 text-sm">No tasks match the selected filters.</td></tr>
                ) : filteredTasks.map(t => (
                  <tr key={`${t.userId}-${t.id}`} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800 max-w-[180px] truncate">{t.title}</td>
                    <td className="py-3 px-4 text-gray-600">{t.userName}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{t.taskType?.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${PRIORITY_COLORS[t.priority]?.bg || 'bg-gray-400'}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-SA') : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[t.status] || 'bg-gray-100 text-gray-600'}`}>
                        {t.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-xs font-semibold ${t.daysUntilDue < 0 ? 'text-red-600' : t.daysUntilDue <= 2 ? 'text-orange-500' : 'text-gray-600'}`}>
                      {t.daysUntilDue < 0 ? `${Math.abs(t.daysUntilDue)}d overdue` : t.daysUntilDue === 0 ? 'Today' : `${t.daysUntilDue}d`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Task Assignment Modal */}
        {assignModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">Assign Task</h3>
                <button onClick={() => setAssignModal({ open: false, preselectedUserId: '' })}>
                  <X className="w-5 h-5 text-gray-500 hover:text-gray-800" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Enter task title..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Task Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
                  <select
                    value={form.taskType}
                    onChange={e => setForm(f => ({ ...f, taskType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    {TASK_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>

                {/* Assign To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
                  <select
                    value={form.assignedToId}
                    onChange={e => setForm(f => ({ ...f, assignedToId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select team member...</option>
                    {(teamData?.teamMembers || []).map(m => (
                      <option key={m.userId} value={String(m.userId)}>{m.userName}</option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <div className="flex gap-3 flex-wrap">
                    {['LOW','MEDIUM','HIGH','URGENT'].map(p => (
                      <label key={p} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="priority"
                          value={p}
                          checked={form.priority === p}
                          onChange={() => setForm(f => ({ ...f, priority: p }))}
                          className={PRIORITY_COLORS[p]?.radio}
                        />
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${PRIORITY_COLORS[p]?.bg}`}>{p}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Related Module */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Related Module (optional)</label>
                  <select
                    value={form.relatedModule}
                    onChange={e => setForm(f => ({ ...f, relatedModule: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    {MODULE_OPTIONS.map(m => <option key={m} value={m}>{m || 'None'}</option>)}
                  </select>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (optional)</label>
                  <textarea
                    rows={3}
                    value={form.remarks}
                    onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                    placeholder="Additional notes or instructions..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 px-5 pb-5">
                <button
                  onClick={() => setAssignModal({ open: false, preselectedUserId: '' })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignTask}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
                  style={{ backgroundColor: '#0A1628' }}
                >
                  {submitting ? 'Assigning…' : 'Assign Task'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
}
