'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useApi } from '@/hooks/useApi'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Minus, Star, MessageSquare,
  AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, FlaskConical,
} from 'lucide-react'

// ── Colour helpers ────────────────────────────────────────────────────────────

const RATING_COLORS = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#84cc16',
  5: '#22c55e',
}

function ratingColor(avg) {
  if (!avg) return '#94a3b8'
  if (avg >= 4.5) return '#22c55e'
  if (avg >= 3.5) return '#84cc16'
  if (avg >= 2.5) return '#eab308'
  if (avg >= 1.5) return '#f97316'
  return '#ef4444'
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function isoDateOnly(date) {
  return date.toISOString().split('T')[0]
}

// ── Overview sub-components ───────────────────────────────────────────────────

function SummaryCard({ label, value, delta, deltaLabel, icon: Icon, color }) {
  const isPositive = delta > 0
  const isNeutral  = delta === 0 || delta === null

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-gray-300" />}
      </div>
      <p className="text-3xl font-semibold text-gray-900 mb-2" style={{ color: color || 'inherit' }}>
        {value ?? '—'}
      </p>
      {delta !== null && delta !== undefined && (
        <div className={`flex items-center gap-1 text-xs ${
          isNeutral ? 'text-gray-400' : isPositive ? 'text-green-600' : 'text-red-500'
        }`}>
          {isNeutral
            ? <Minus className="w-3 h-3" />
            : isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
          }
          <span>{isPositive ? '+' : ''}{delta} {deltaLabel || 'vs prior period'}</span>
        </div>
      )}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const { avg, count } = payload[0]?.payload || {}
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      <p className="text-gray-500">Avg: <span className="text-gray-900 font-semibold">{avg ?? '—'}</span></p>
      <p className="text-gray-500">Responses: <span className="text-gray-900 font-semibold">{count}</span></p>
    </div>
  )
}

function ScoreChart({ data }) {
  const formatted = useMemo(() =>
    data.map(d => ({
      ...d,
      label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })), [data]
  )
  const tickInterval = Math.max(1, Math.floor(data.length / 6))

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-medium text-gray-900 mb-4">Score over time</h2>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#111827" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#111827" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={tickInterval} />
          <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="avg" stroke="#111827" strokeWidth={2} fill="url(#scoreGradient)" dot={false} connectNulls />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function DistributionChart({ distribution }) {
  const data = [1, 2, 3, 4, 5].map(r => ({
    rating: `${r}★`,
    count:  distribution[String(r)] || 0,
    color:  RATING_COLORS[r],
  }))

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-medium text-gray-900 mb-4">Rating breakdown</h2>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="rating" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: '#f8fafc' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-xs">
                  <p className="text-gray-700">{payload[0].payload.rating}: <strong>{payload[0].value}</strong></p>
                </div>
              )
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => <Cell key={entry.rating} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function LocationTable({ locations }) {
  if (!locations?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-medium text-gray-900 mb-3">By location</h2>
        <p className="text-sm text-gray-400">No data yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-medium text-gray-900 mb-4">By location</h2>
      <div className="space-y-3">
        {locations.map((loc) => {
          const color = ratingColor(loc.avg)
          const pct   = ((loc.avg - 1) / 4) * 100
          return (
            <div key={loc.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700 truncate flex-1 mr-3">{loc.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">{loc.count} resp.</span>
                  <span className="text-sm font-semibold w-8 text-right" style={{ color }}>{loc.avg}</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AlertsFeed({ alerts, onResolve }) {
  const [resolving, setResolving] = useState(null)

  const handleResolve = async (alertId) => {
    setResolving(alertId)
    await onResolve(alertId)
    setResolving(null)
  }

  if (!alerts?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <h2 className="text-sm font-medium text-gray-900">No pending alerts</h2>
        </div>
        <p className="text-sm text-gray-400 mt-1">All clear — no low ratings in this period.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <h2 className="text-sm font-medium text-gray-900">Pending alerts</h2>
        <span className="ml-auto text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full">
          {alerts.length}
        </span>
      </div>
      <div className="space-y-0 divide-y divide-gray-50">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span
              className="text-sm font-semibold w-6 text-center shrink-0"
              style={{ color: ratingColor(alert.rating) }}
            >
              {alert.rating}★
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 truncate">{alert.location}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-gray-400">
                  {new Date(alert.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
                {alert.status === 'owner_notified' && (
                  <span className="text-xs text-blue-500 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full leading-none">
                    notified
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => handleResolve(alert.id)}
              disabled={resolving === alert.id}
              title="Mark as resolved"
              className="shrink-0 flex items-center gap-1.5 text-xs text-gray-400 hover:text-green-600 border border-gray-200 hover:border-green-200 hover:bg-green-50 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-40"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {resolving === alert.id ? 'Resolving…' : 'Resolve'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Comments tab ──────────────────────────────────────────────────────────────

function CommentCard({ item }) {
  const color = ratingColor(item.rating)
  return (
    <div className={`bg-white border rounded-xl p-4 ${item.is_test ? 'border-amber-200' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-sm font-semibold px-2 py-0.5 rounded-md"
            style={{ color, background: `${color}18` }}
          >
            {item.rating}★
          </span>
          <span className="text-sm text-gray-700">{item.location_name}</span>
          {item.survey_name && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {item.survey_name}
            </span>
          )}
          {item.is_test && (
            <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <FlaskConical className="w-3 h-3" />
              Test
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400 shrink-0 mt-0.5">{formatDate(item.created_at)}</span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{item.comment}</p>
    </div>
  )
}

// showTest and onShowTestChange are lifted to InsightsPage so the Overview tab's
// "View test responses →" link can switch the tab AND enable the toggle together.
function CommentsFeed({ locations, showTest, onShowTestChange }) {
  const { ready, get } = useApi()

  const today        = isoDateOnly(new Date())
  const thirtyDaysAgo = isoDateOnly(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))

  const [locationFilter, setLocationFilter] = useState('')
  const [dateFrom, setDateFrom]             = useState(thirtyDaysAgo)
  const [dateTo, setDateTo]                 = useState(today)
  const [page, setPage]                     = useState(1)
  const [data, setData]                     = useState(null)
  const [loading, setLoading]               = useState(true)

  const fetchComments = useCallback(() => {
    if (!ready) return
    setLoading(true)
    const params = new URLSearchParams({ page, page_size: 20 })
    if (locationFilter)  params.set('location', locationFilter)
    if (dateFrom)        params.set('date_from', dateFrom)
    if (dateTo)          params.set('date_to', dateTo)
    if (showTest)        params.set('is_test', 'true')
    get(`/dashboard/comments/?${params}`)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [ready, page, locationFilter, dateFrom, dateTo, showTest]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchComments() }, [fetchComments])
  useEffect(() => { setPage(1) }, [locationFilter, dateFrom, dateTo, showTest])

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 1

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 bg-white"
        >
          <option value="">All locations</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>

        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={dateFrom}
            max={dateTo}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 bg-white"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom}
            max={today}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 bg-white"
          />
        </div>

        {/* Test toggle */}
        <button
          onClick={() => onShowTestChange(!showTest)}
          className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors ${
            showTest
              ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'border-gray-200 text-gray-500 hover:text-gray-700'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          {showTest ? 'Test responses' : 'Test responses'}
        </button>

        {data && (
          <span className="text-xs text-gray-400 ml-auto">
            {data.total} comment{data.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Results */}
      {loading && !data ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : (
        <div className={`space-y-3 transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
          {data?.results?.length ? (
            data.results.map((item) => <CommentCard key={item.id} item={item} />)
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <MessageSquare className="w-6 h-6 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                {showTest ? 'No test responses with comments yet.' : 'No comments in this period.'}
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const DAY_OPTIONS = [
  { label: '7 days',  value: 7  },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
]

const TABS = [
  { key: 'overview', label: 'Overview'  },
  { key: 'comments', label: 'Comments'  },
]

export default function InsightsPage() {
  const { ready, get, patch } = useApi()
  const [data, setData]               = useState(null)
  const [locations, setLocations]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [days, setDays]               = useState(30)
  const [locationFilter, setLocationFilter] = useState('')
  const [activeTab, setActiveTab]     = useState('overview')
  // Lifted so the Overview notice can switch tab + enable test mode in one click
  const [showTestComments, setShowTestComments] = useState(false)

  useEffect(() => {
    if (!ready) return
    // LocationListView now returns { locations, location_limit, at_limit }
    get('/dashboard/locations/')
      .then(r => {
        const locs = Array.isArray(r) ? r : (r.locations ?? r.data?.locations ?? [])
        setLocations(locs)
      })
      .catch(() => {})
  }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ready || activeTab !== 'overview') return
    setLoading(true)
    const params = new URLSearchParams({ days })
    if (locationFilter) params.set('location', locationFilter)
    get(`/dashboard/insights/?${params}`)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [ready, days, locationFilter, activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleResolve = useCallback(async (alertId) => {
    try {
      await patch(`/dashboard/alerts/${alertId}/`, { status: 'resolved' })
      setData((prev) => prev ? {
        ...prev,
        pending_alerts: prev.pending_alerts.filter((a) => a.id !== alertId),
      } : prev)
    } catch {
      // silently fail
    }
  }, [patch]) // eslint-disable-line react-hooks/exhaustive-deps

  const { summary, daily_series, by_location, distribution, pending_alerts } = data || {}

  const handleViewTestResponses = () => {
    setShowTestComments(true)
    setActiveTab('comments')
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Insights</h1>
          <p className="text-sm text-gray-500 mt-0.5">Response trends for your locations.</p>
        </div>

        {activeTab === 'overview' && (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            >
              <option value="">All locations</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>

            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {DAY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDays(opt.value)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    days === opt.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        loading && !data ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          </div>
        ) : (
          <div className={`space-y-4 transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <SummaryCard
                label="Avg. Score"
                value={summary?.avg_rating ? `${summary.avg_rating} / 5` : '—'}
                delta={summary?.avg_delta}
                icon={Star}
                color={ratingColor(summary?.avg_rating)}
              />
              <SummaryCard
                label="Responses"
                value={summary?.total_responses?.toLocaleString()}
                delta={summary?.count_delta}
                deltaLabel="vs prior period"
                icon={MessageSquare}
              />
              <SummaryCard
                label="Pending Alerts"
                value={pending_alerts?.length ?? 0}
                icon={AlertTriangle}
                color={pending_alerts?.length > 0 ? '#f59e0b' : undefined}
              />
            </div>

            {/* Test response notice — only shown when test responses exist */}
            {summary?.test_response_count > 0 && (
              <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                <FlaskConical className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700 flex-1">
                  {summary.test_response_count} test response{summary.test_response_count !== 1 ? 's' : ''} excluded from this view.
                </p>
                <button
                  onClick={handleViewTestResponses}
                  className="text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors whitespace-nowrap"
                >
                  View →
                </button>
              </div>
            )}

            {daily_series?.length > 0 && <ScoreChart data={daily_series} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LocationTable locations={by_location} />
              {distribution && <DistributionChart distribution={distribution} />}
            </div>

            <AlertsFeed alerts={pending_alerts} onResolve={handleResolve} />
          </div>
        )
      )}

      {/* Comments tab */}
      {activeTab === 'comments' && (
        <CommentsFeed
          locations={locations}
          showTest={showTestComments}
          onShowTestChange={setShowTestComments}
        />
      )}
    </div>
  )
}