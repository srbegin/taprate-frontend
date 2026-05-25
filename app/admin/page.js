'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

const TABS = ['Overview', 'Organizations', 'Tags', 'Signups'];

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-[#1a1a1f] border border-white/10 rounded-xl p-5">
      <p className="text-xs text-white/40 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-semibold text-white">{value ?? '—'}</p>
      {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
    </div>
  );
}

function Badge({ value }) {
  const colours = {
    free:    'bg-white/10 text-white/50',
    starter: 'bg-blue-500/20 text-blue-300',
    growth:  'bg-violet-500/20 text-violet-300',
    pro:     'bg-emerald-500/20 text-emerald-300',
  };
  const cls = colours[value] ?? colours.free;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {value}
    </span>
  );
}

function Table({ cols, rows, empty = 'No data yet.', onRowClick }) {
  if (!rows?.length) {
    return <p className="text-white/30 text-sm py-8 text-center">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {cols.map(c => (
              <th key={c.key} className="text-left text-xs text-white/40 uppercase tracking-wider pb-3 pr-6 font-medium">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-white/5 transition-colors ${
                onRowClick
                  ? 'hover:bg-white/[0.04] cursor-pointer'
                  : 'hover:bg-white/[0.02]'
              }`}
            >
              {cols.map(c => (
                <td key={c.key} className="py-3 pr-6 text-white/70 align-middle">
                  {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ── Tab panels ───────────────────────────────────────────────────────────────

function OverviewTab() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/overview/').then(r => setData(r.data));
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Organizations"   value={data?.orgs} />
      <StatCard label="Locations"       value={data?.locations} />
      <StatCard
        label="Responses"
        value={data?.responses_total?.toLocaleString()}
        sub={`${data?.responses_30d ?? '…'} in last 30 days`}
      />
      <StatCard
        label="NFC Tags"
        value={data?.tags_total}
        sub={`${data?.tags_claimed ?? '…'} claimed · ${data?.tags_unclaimed ?? '…'} unclaimed`}
      />
    </div>
  );
}

function OrganizationsTab() {
  const router = useRouter();
  const [rows, setRows] = useState(null);

  useEffect(() => {
    api.get('/admin/organizations/').then(r => setRows(r.data));
  }, []);

  const cols = [
    {
      key: 'name',
      label: 'Organization',
      render: (v) => (
        <span className="text-white font-medium group-hover:text-violet-300 transition-colors">
          {v}
        </span>
      ),
    },
    { key: 'plan',           label: 'Plan',      render: v => <Badge value={v} /> },
    { key: 'location_count', label: 'Locations' },
    { key: 'response_count', label: 'Responses' },
    { key: 'user_count',     label: 'Users' },
    { key: 'created_at',     label: 'Created',   render: fmt },
    {
      key: '_arrow',
      label: '',
      render: () => (
        <span className="text-white/20 text-xs">→</span>
      ),
    },
  ];

  if (!rows) return <p className="text-white/30 text-sm py-8 text-center">Loading…</p>;
  return (
    <Table
      cols={cols}
      rows={rows}
      empty="No organizations yet."
      onRowClick={row => router.push(`/admin/orgs/${row.id}`)}
    />
  );
}

function TagsTab() {
  const [rows, setRows]       = useState(null);
  const [filter, setFilter]   = useState('all');
  const [confirming, setConfirming] = useState(new Set());
  const [releasing, setReleasing]   = useState(new Set());

  useEffect(() => {
    api.get('/admin/tags/').then(r => setRows(r.data));
  }, []);

  const handleRelease = (tagId) => {
    setConfirming(prev => new Set(prev).add(tagId));
  };

  const handleCancel = (tagId) => {
    setConfirming(prev => { const s = new Set(prev); s.delete(tagId); return s; });
  };

  const handleConfirm = async (tagId) => {
    setConfirming(prev => { const s = new Set(prev); s.delete(tagId); return s; });
    setReleasing(prev => new Set(prev).add(tagId));
    try {
      await api.post(`/admin/tags/${tagId}/release/`);
      setRows(prev => {
        if (filter === 'claimed') {
          return prev.filter(r => r.id !== tagId);
        }
        return prev.map(r => r.id === tagId
          ? { ...r, claimed: false, org_name: null, location_name: null, claimed_at: null }
          : r
        );
      });
    } catch {
      // silently restore
    } finally {
      setReleasing(prev => { const s = new Set(prev); s.delete(tagId); return s; });
    }
  };

  const visible = rows?.filter(r => {
    if (filter === 'claimed')   return r.claimed;
    if (filter === 'unclaimed') return !r.claimed;
    return true;
  });

  const cols = [
    {
      key: 'id',
      label: 'Tag UUID',
      render: v => <span className="font-mono text-xs text-white/50">{v}</span>,
    },
    {
      key: 'claimed',
      label: 'Status',
      render: v => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          v ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/40'
        }`}>
          {v ? 'Claimed' : 'Unclaimed'}
        </span>
      ),
    },
    { key: 'org_name',      label: 'Organization' },
    { key: 'location_name', label: 'Location' },
    { key: 'claimed_at',    label: 'Claimed',  render: fmt },
    { key: 'created_at',    label: 'Imported', render: fmt },
    {
      key: '_action',
      label: '',
      render: (_, row) => {
        const tagId = row.id;
        if (!row.claimed) return null;
        if (releasing.has(tagId)) {
          return <span className="text-xs text-white/30">Releasing…</span>;
        }
        if (confirming.has(tagId)) {
          return (
            <span className="flex items-center gap-2">
              <button
                onClick={() => handleConfirm(tagId)}
                className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => handleCancel(tagId)}
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                Cancel
              </button>
            </span>
          );
        }
        return (
          <button
            onClick={() => handleRelease(tagId)}
            className="text-xs text-white/30 hover:text-red-400 transition-colors"
          >
            Release
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['all', 'claimed', 'unclaimed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors capitalize ${
              filter === f
                ? 'bg-violet-600 border-violet-600 text-white'
                : 'border-white/10 text-white/50 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
        {rows && (
          <span className="ml-auto text-xs text-white/30 self-center">
            {visible?.length} of {rows.length} tags
          </span>
        )}
      </div>
      {!rows
        ? <p className="text-white/30 text-sm py-8 text-center">Loading…</p>
        : <Table cols={cols} rows={visible} empty="No tags imported yet." />
      }
    </div>
  );
}

function SignupsTab() {
  const [data, setData] = useState(null);
  const [view, setView] = useState('orgs');

  useEffect(() => {
    api.get('/admin/signups/').then(r => setData(r.data));
  }, []);

  const orgCols = [
    { key: 'name',       label: 'Organization' },
    { key: 'plan',       label: 'Plan',    render: v => <Badge value={v} /> },
    { key: 'created_at', label: 'Signed up', render: fmt },
  ];

  const userCols = [
    { key: 'email',    label: 'Email' },
    { key: 'name',     label: 'Name' },
    { key: 'org_name', label: 'Organization' },
    { key: 'role',     label: 'Role' },
    { key: 'joined',   label: 'Joined', render: fmt },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[['orgs', 'Organizations'], ['users', 'Users']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              view === key
                ? 'bg-violet-600 border-violet-600 text-white'
                : 'border-white/10 text-white/50 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {!data
        ? <p className="text-white/30 text-sm py-8 text-center">Loading…</p>
        : view === 'orgs'
          ? <Table cols={orgCols}  rows={data.recent_orgs}  empty="No organizations yet." />
          : <Table cols={userCols} rows={data.recent_users} empty="No users yet." />
      }
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="min-h-screen bg-[#0e0e11] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-violet-400 font-medium tracking-widest uppercase mb-1">
            Platform
          </p>
          <h1 className="text-2xl font-semibold">Admin</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-white/10 pb-0">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-violet-500 text-white'
                  : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div>
          {activeTab === 'Overview'      && <OverviewTab />}
          {activeTab === 'Organizations' && <OrganizationsTab />}
          {activeTab === 'Tags'          && <TagsTab />}
          {activeTab === 'Signups'       && <SignupsTab />}
        </div>

      </div>
    </div>
  );
}