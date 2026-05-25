'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';

// ── Shared primitives ─────────────────────────────────────────────────────────

function Badge({ value, variant }) {
  if (variant === 'status') {
    const map = {
      active:    'bg-emerald-500/20 text-emerald-300',
      trialing:  'bg-blue-500/20 text-blue-300',
      past_due:  'bg-amber-500/20 text-amber-300',
      canceled:  'bg-red-500/20 text-red-300',
      unpaid:    'bg-red-500/20 text-red-300',
    };
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[value] ?? 'bg-white/10 text-white/40'}`}>
        {value ?? 'none'}
      </span>
    );
  }
  const map = {
    free:    'bg-white/10 text-white/50',
    starter: 'bg-blue-500/20 text-blue-300',
    growth:  'bg-violet-500/20 text-violet-300',
    pro:     'bg-emerald-500/20 text-emerald-300',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[value] ?? map.free}`}>
      {value}
    </span>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="bg-white/[0.04] rounded-lg px-4 py-3 flex flex-col gap-0.5 min-w-[90px]">
      <span className="text-xl font-semibold text-white">{value ?? '—'}</span>
      <span className="text-xs text-white/40">{label}</span>
    </div>
  );
}

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function SectionPlaceholder({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center">
        <span className="text-white/20 text-lg">○</span>
      </div>
      <p className="text-white/50 text-sm font-medium">{title}</p>
      <p className="text-white/25 text-xs text-center max-w-xs">{description}</p>
    </div>
  );
}

// ── Section: NFC Tags ─────────────────────────────────────────────────────────

function TagsSection({ orgId }) {
  const [orgTags,          setOrgTags]          = useState(null);
  const [unowned,          setUnowned]          = useState(null);
  const [orgLocations,     setOrgLocations]     = useState(null); // all org locations with has_tag
  const [selectedLocation, setSelectedLocation] = useState('');   // location id chosen in assign panel
  const [tagSearch,        setTagSearch]        = useState('');
  const [assigning,        setAssigning]        = useState(null); // tag id mid-assign
  const [confirming,       setConfirming]       = useState(new Set());
  const [releasing,        setReleasing]        = useState(new Set());

  const loadOrgTags = useCallback(() => {
    api.get(`/admin/orgs/${orgId}/tags/`).then(r => setOrgTags(r.data));
  }, [orgId]);

  const loadUnowned = useCallback(() => {
    api.get('/admin/tags/?status=unclaimed').then(r => setUnowned(r.data));
  }, []);

  const loadOrgLocations = useCallback(() => {
    api.get(`/admin/orgs/${orgId}/locations/`).then(r => setOrgLocations(r.data));
  }, [orgId]);

  useEffect(() => {
    loadOrgTags();
    loadUnowned();
    loadOrgLocations();
  }, [loadOrgTags, loadUnowned, loadOrgLocations]);

  // Locations available for tag assignment (no tag yet)
  const availableLocations = orgLocations?.filter(l => !l.has_tag) ?? [];

  // ── Assign tag → location ──────────────────────────────────────────────────
  const handleAssign = async (tagId) => {
    if (!selectedLocation) return; // shouldn't be reachable but guard anyway
    setAssigning(tagId);
    try {
      const res = await api.post(`/admin/orgs/${orgId}/tags/`, {
        tag_id:      tagId,
        location_id: selectedLocation,
      });

      // Optimistic updates — no refetch needed
      setOrgTags(prev => [res.data, ...(prev ?? [])]);
      setUnowned(prev => prev.filter(t => t.id !== tagId));
      setOrgLocations(prev => prev.map(l =>
        l.id === selectedLocation ? { ...l, has_tag: true } : l
      ));
      setSelectedLocation('');
    } catch {
      // Could surface a toast here
    } finally {
      setAssigning(null);
    }
  };

  // ── Release ────────────────────────────────────────────────────────────────
  const handleReleaseRequest = (tagId) =>
    setConfirming(prev => new Set(prev).add(tagId));

  const handleReleaseCancel = (tagId) =>
    setConfirming(prev => { const s = new Set(prev); s.delete(tagId); return s; });

  const handleReleaseConfirm = async (tagId) => {
    setConfirming(prev => { const s = new Set(prev); s.delete(tagId); return s; });
    setReleasing(prev => new Set(prev).add(tagId));
    try {
      await api.post(`/admin/tags/${tagId}/release/`);
      const released = orgTags.find(t => t.id === tagId);

      setOrgTags(prev => prev.filter(t => t.id !== tagId));
      setUnowned(prev => [{ id: tagId, created_at: released?.created_at }, ...(prev ?? [])]);

      // Mark the location as available again in the assign panel
      if (released?.location_id) {
        setOrgLocations(prev => prev?.map(l =>
          l.id === released.location_id ? { ...l, has_tag: false } : l
        ));
      }
    } catch {
      // silently restore
    } finally {
      setReleasing(prev => { const s = new Set(prev); s.delete(tagId); return s; });
    }
  };

  const filteredUnowned = unowned?.filter(t =>
    tagSearch === '' || t.id.toLowerCase().includes(tagSearch.toLowerCase())
  );

  // ── Assign panel content ───────────────────────────────────────────────────
  const renderAssignPanel = () => {
    if (!orgLocations) {
      return <p className="text-white/30 text-xs py-8 text-center">Loading…</p>;
    }

    if (orgLocations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 px-5 gap-2 text-center">
          <span className="text-white/15 text-2xl">○</span>
          <p className="text-white/40 text-xs font-medium">No locations yet</p>
          <p className="text-white/25 text-xs leading-snug">
            The org owner must create at least one location before a tag can be assigned.
          </p>
        </div>
      );
    }

    if (availableLocations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 px-5 gap-2 text-center">
          <span className="text-emerald-400/40 text-2xl">✓</span>
          <p className="text-white/40 text-xs font-medium">All locations have tags</p>
          <p className="text-white/25 text-xs leading-snug">
            Every location at this org already has an NFC tag assigned.
          </p>
        </div>
      );
    }

    return (
      <>
        {/* Location selector */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-xs text-white/40 mb-1.5">Location</p>
          <select
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2
                       text-xs text-white outline-none focus:border-violet-500/50
                       transition-colors appearance-none cursor-pointer"
          >
            <option value="">Select a location…</option>
            {availableLocations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>

        {/* Tag search */}
        <div className="px-4 pb-2">
          <p className="text-xs text-white/40 mb-1.5">Tag</p>
          <input
            type="text"
            value={tagSearch}
            onChange={e => setTagSearch(e.target.value)}
            placeholder="Filter by UUID…"
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2
                       text-xs text-white placeholder-white/20 outline-none
                       focus:border-violet-500/50 transition-colors"
          />
        </div>

        {/* Tag list */}
        <div className="flex-1 overflow-y-auto max-h-[340px] divide-y divide-white/[0.06]">
          {!unowned ? (
            <p className="text-white/30 text-xs py-8 text-center">Loading…</p>
          ) : filteredUnowned.length === 0 ? (
            <p className="text-white/25 text-xs py-8 text-center">
              {tagSearch ? 'No tags match.' : 'No unowned tags available.'}
            </p>
          ) : (
            filteredUnowned.map(tag => (
              <div
                key={tag.id}
                className="px-4 py-3 flex items-center gap-3 group hover:bg-white/[0.02] transition-colors"
              >
                <p className="font-mono text-xs text-white/40 flex-1 truncate">{tag.id}</p>
                {assigning === tag.id ? (
                  <span className="text-xs text-white/30">Assigning…</span>
                ) : (
                  <button
                    onClick={() => handleAssign(tag.id)}
                    disabled={!selectedLocation}
                    title={!selectedLocation ? 'Select a location first' : undefined}
                    className={`text-xs font-medium transition-colors
                      opacity-0 group-hover:opacity-100
                      ${selectedLocation
                        ? 'text-violet-400 hover:text-violet-300'
                        : 'text-white/20 cursor-not-allowed'
                      }`}
                  >
                    Assign
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer count */}
        {unowned && (
          <div className="px-4 py-3 border-t border-white/[0.06]">
            <p className="text-xs text-white/25">
              {filteredUnowned?.length ?? 0} unowned tag{filteredUnowned?.length !== 1 ? 's' : ''} available
            </p>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

      {/* Left — org's assigned tags */}
      <div className="bg-[#1a1a1f] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Assigned Tags</p>
            <p className="text-xs text-white/40 mt-0.5">Tags allocated to this organisation</p>
          </div>
          {orgTags && (
            <span className="text-xs text-white/30 tabular-nums">{orgTags.length}</span>
          )}
        </div>

        {!orgTags ? (
          <p className="text-white/30 text-sm py-10 text-center">Loading…</p>
        ) : orgTags.length === 0 ? (
          <p className="text-white/25 text-sm py-10 text-center">No tags assigned yet.</p>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {orgTags.map(tag => (
              <div key={tag.id} className="px-5 py-3.5 flex items-center gap-3 group">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-white/50 truncate">{tag.id}</p>
                  <p className="text-xs text-white/30 mt-0.5">
                    {tag.location_name
                      ? <span className="text-emerald-400/70">→ {tag.location_name}</span>
                      : <span className="text-white/20">Not assigned to a location</span>
                    }
                  </p>
                </div>
                <p className="text-xs text-white/25 tabular-nums shrink-0">
                  {fmt(tag.claimed_at)}
                </p>

                {releasing.has(tag.id) ? (
                  <span className="text-xs text-white/25 w-24 text-right">Releasing…</span>
                ) : confirming.has(tag.id) ? (
                  <span className="flex items-center gap-2">
                    <button
                      onClick={() => handleReleaseConfirm(tag.id)}
                      className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleReleaseCancel(tag.id)}
                      className="text-xs text-white/25 hover:text-white/50 transition-colors"
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => handleReleaseRequest(tag.id)}
                    className="text-xs text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Release
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right — assign panel */}
      <div className="bg-[#1a1a1f] border border-white/10 rounded-xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-sm font-medium text-white">Assign a Tag</p>
          <p className="text-xs text-white/40 mt-0.5">
            Pick a location then select an unowned tag
          </p>
        </div>
        {renderAssignPanel()}
      </div>

    </div>
  );
}

// ── Section registry ──────────────────────────────────────────────────────────

const SECTIONS = [
  {
    key:       'tags',
    label:     'NFC Tags',
    component: ({ orgId }) => <TagsSection orgId={orgId} />,
  },
  {
    key:   'subscription',
    label: 'Subscription',
    component: () => (
      <SectionPlaceholder
        title="Subscription management"
        description="Override plan, adjust trial end date, sync Stripe status, and view billing history."
      />
    ),
  },
  {
    key:   'notes',
    label: 'Internal Notes',
    component: () => (
      <SectionPlaceholder
        title="Internal notes"
        description="Staff-only notes about this account — onboarding context, support history, custom agreements."
      />
    ),
  },
  {
    key:   'impersonate',
    label: 'Access',
    component: () => (
      <SectionPlaceholder
        title="Account access"
        description="Impersonate the org owner for debugging, or trigger account actions on their behalf."
      />
    ),
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OrgDetailPage() {
  const { id: orgId } = useParams();
  const router = useRouter();
  const [org, setOrg] = useState(null);
  const [activeSection, setActiveSection] = useState('tags');

  useEffect(() => {
    api.get(`/admin/orgs/${orgId}/`).then(r => setOrg(r.data));
  }, [orgId]);

  const ActiveComponent = SECTIONS.find(s => s.key === activeSection)?.component;

  return (
    <div className="min-h-screen bg-[#0e0e11] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Breadcrumb */}
        <button
          onClick={() => router.push('/admin')}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60
                     transition-colors mb-8 group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          <span>Admin</span>
          <span className="text-white/15">/</span>
          <span>Organizations</span>
        </button>

        {/* Org header */}
        {!org ? (
          <div className="mb-8">
            <div className="h-7 w-48 bg-white/[0.06] rounded animate-pulse mb-3" />
            <div className="h-4 w-64 bg-white/[0.04] rounded animate-pulse" />
          </div>
        ) : (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold">{org.name}</h1>
              <Badge value={org.plan} />
              {org.subscription_status && (
                <Badge value={org.subscription_status} variant="status" />
              )}
            </div>
            <p className="text-xs text-white/30 mb-5">
              <span className="font-mono">{org.slug}</span>
              <span className="mx-2 text-white/15">·</span>
              Created {fmt(org.created_at)}
              {org.trial_ends_at && (
                <>
                  <span className="mx-2 text-white/15">·</span>
                  Trial ends {fmt(org.trial_ends_at)}
                </>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              <StatPill label="Locations" value={org.stats?.locations} />
              <StatPill label="Responses" value={org.stats?.responses?.toLocaleString()} />
              <StatPill label="Users"     value={org.stats?.users} />
              <StatPill label="NFC Tags"  value={org.stats?.tags} />
            </div>
          </div>
        )}

        {/* Section nav */}
        <div className="flex gap-1 mb-8 border-b border-white/10">
          {SECTIONS.map(sec => (
            <button
              key={sec.key}
              onClick={() => setActiveSection(sec.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeSection === sec.key
                  ? 'border-violet-500 text-white'
                  : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {ActiveComponent && <ActiveComponent orgId={orgId} org={org} />}

      </div>
    </div>
  );
}