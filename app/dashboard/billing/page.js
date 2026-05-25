'use client';
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';

const PLANS = [
  {
    key:       'starter',
    name:      'Starter',
    price:     29,
    locations: 3,
    desc:      'Perfect for a single venue or small operation.',
  },
  {
    key:       'growth',
    name:      'Growth',
    price:     79,
    locations: 10,
    desc:      'For businesses with multiple locations.',
  },
  {
    key:       'pro',
    name:      'Pro',
    price:     149,
    locations: null,
    desc:      'Unlimited locations for large operations.',
  },
];

function StatusBanner({ org, verifying }) {
  const { subscription_status, trial_days_remaining, plan } = org;

  if (verifying) {
    return (
      <div className="flex items-center gap-3 bg-violet-500/10 border border-violet-500/20 rounded-xl px-5 py-3 text-sm text-violet-300">
        <span className="w-3 h-3 rounded-full border-2 border-violet-400 border-t-transparent animate-spin inline-block shrink-0" />
        Verifying your subscription…
      </div>
    );
  }

  if (subscription_status === 'active') {
    const planName = PLANS.find(p => p.key === plan)?.name ?? plan;
    return (
      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-3 text-sm text-emerald-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
        Active — {planName} plan
      </div>
    );
  }

  if (subscription_status === 'past_due') {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-3 text-sm text-amber-300">
        ⚠️ Your payment is past due. Please update your billing details to avoid interruption.
      </div>
    );
  }

  if (subscription_status === 'canceled') {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 text-sm text-red-300">
        Your subscription has been canceled. Subscribe below to restore access.
      </div>
    );
  }

  if (trial_days_remaining > 0) {
    return (
      <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-5 py-3 text-sm text-violet-300">
        🎉 You're on a free trial — <strong>{trial_days_remaining} day{trial_days_remaining !== 1 ? 's' : ''}</strong> remaining. Subscribe anytime to keep full access.
      </div>
    );
  }

  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 text-sm text-red-300">
      Your free trial has ended. Subscribe below to restore access.
    </div>
  );
}

function PlanCard({ plan, currentPlan, isActive, locationCount, onSelect, loading }) {
  const isCurrent  = currentPlan === plan.key && isActive;
  const isSelected = loading === plan.key;

  // A downgrade is blocked when the target plan has a location cap and the org
  // currently exceeds it. Only applies when switching away from the current plan.
  const overLimit  = !isCurrent && plan.locations !== null && locationCount > plan.locations;
  const excess     = overLimit ? locationCount - plan.locations : 0;

  return (
    <div className={`relative flex flex-col bg-[#1a1a1f] border rounded-xl p-6 transition-colors ${
      isCurrent    ? 'border-violet-500' :
      overLimit    ? 'border-white/10 opacity-60' :
                     'border-white/10 hover:border-white/20'
    }`}>
      {isCurrent && (
        <span className="absolute -top-3 left-5 text-xs bg-violet-600 text-white px-2.5 py-0.5 rounded-full font-medium">
          Current plan
        </span>
      )}

      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">{plan.name}</h3>
        <p className="text-white/40 text-xs mt-1">{plan.desc}</p>
      </div>
      <div className="mb-6">
        <span className="text-3xl font-bold text-white">${plan.price}</span>
        <span className="text-white/40 text-sm">/mo</span>
      </div>
      <p className="text-xs text-white/50 mb-6">
        {plan.locations
          ? `Up to ${plan.locations} location${plan.locations !== 1 ? 's' : ''}`
          : 'Unlimited locations'}
      </p>

      <div className="mt-auto space-y-2">
        {isCurrent ? (
          <button
            onClick={onSelect}
            disabled={isSelected}
            className="w-full text-sm py-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors"
          >
            {isSelected ? 'Redirecting…' : 'Manage'}
          </button>
        ) : overLimit ? (
          <>
            <button
              disabled
              className="w-full text-sm py-2 rounded-lg bg-white/5 text-white/25 cursor-not-allowed"
            >
              Unavailable
            </button>
            <p className="text-xs text-white/35 text-center leading-snug">
              Remove {excess} location{excess !== 1 ? 's' : ''} first.{' '}
              <Link href="/dashboard/locations" className="text-violet-400 hover:text-violet-300 transition-colors">
                Manage →
              </Link>
            </p>
          </>
        ) : (
          <button
            onClick={() => onSelect(plan.key)}
            disabled={!!loading}
            className="w-full text-sm py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors disabled:opacity-50"
          >
            {isSelected ? 'Redirecting…' : `Subscribe — $${plan.price}/mo`}
          </button>
        )}
      </div>
    </div>
  );
}

function BillingContent() {
  const searchParams = useSearchParams();

  const [org,       setOrg]       = useState(null);
  const [loading,   setLoading]   = useState(null);
  const [toast,     setToast]     = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Initial org fetch
  useEffect(() => {
    api.get('/auth/me/').then(r => setOrg(r.data.organization));
  }, []);

  // Handle Stripe redirect params — runs once on mount only.
  // Uses sessionStorage so the toast fires exactly once even if Next.js
  // caches the URL with ?success=1 and replays it on re-navigation.
  useEffect(() => {
    const didCheckout = sessionStorage.getItem('checkout_success');
    const canceled    = searchParams.get('canceled');

    // Always clean the URL without triggering a navigation or remount
    window.history.replaceState(null, '', '/dashboard/billing');

    if (canceled) {
      setToast({ type: 'info', msg: 'Checkout canceled — no charges made.' });
      return;
    }

    if (!didCheckout) return;
    sessionStorage.removeItem('checkout_success'); // consume immediately — won't fire again

    setToast({ type: 'success', msg: 'Subscription activated — welcome aboard!' });
    setVerifying(true);

    let attempts = 0;
    const MAX_ATTEMPTS = 5;
    const INTERVAL_MS  = 2000;

    const poll = async () => {
      try {
        const { data } = await api.get('/auth/me/');
        const freshOrg = data.organization;
        setOrg(freshOrg);
        if (freshOrg.subscription_status === 'active') {
          setVerifying(false);
          return;
        }
      } catch {
        // swallow — next tick will retry
      }

      attempts += 1;
      if (attempts < MAX_ATTEMPTS) {
        setTimeout(poll, INTERVAL_MS);
      } else {
        setVerifying(false);
      }
    };

    setTimeout(poll, 1500);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleCheckout(planKey) {
    setLoading(planKey);
    try {
      const { data } = await api.post('/billing/checkout/', { plan: planKey });
      // Flag must be set before the redirect — we lose JS state when the browser
      // navigates away to Stripe and back.
      sessionStorage.setItem('checkout_success', '1');
      window.location.href = data.url;
    } catch {
      setToast({ type: 'error', msg: 'Something went wrong. Please try again.' });
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading('portal');
    try {
      const { data } = await api.post('/billing/portal/');
      window.location.href = data.url;
    } catch {
      setToast({ type: 'error', msg: 'Could not open billing portal. Please try again.' });
      setLoading(null);
    }
  }

  const isActive     = org?.subscription_status === 'active';
  const currentPlan  = org?.plan;
  const locationCount = org?.location_count ?? 0;

  return (
    <div className="min-h-screen bg-[#0e0e11] text-white">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-violet-400 font-medium tracking-widest uppercase mb-1">
            Account
          </p>
          <h1 className="text-2xl font-semibold">Billing</h1>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`mb-6 px-5 py-3 rounded-xl text-sm border ${
            toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
            toast.type === 'error'   ? 'bg-red-500/10 border-red-500/20 text-red-300' :
                                       'bg-white/5 border-white/10 text-white/60'
          }`}>
            {toast.msg}
          </div>
        )}

        {!org ? (
          <p className="text-white/30 text-sm">Loading…</p>
        ) : (
          <div className="space-y-8">

            <StatusBanner org={org} verifying={verifying} />

            {isActive && (
              <div className="flex items-center justify-between bg-[#1a1a1f] border border-white/10 rounded-xl px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-white">Manage subscription</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Update payment method, download invoices, or cancel.
                  </p>
                </div>
                <button
                  onClick={handlePortal}
                  disabled={loading === 'portal'}
                  className="text-sm px-4 py-2 rounded-lg border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50 whitespace-nowrap ml-6"
                >
                  {loading === 'portal' ? 'Redirecting…' : 'Billing portal →'}
                </button>
              </div>
            )}

            <div>
              <h2 className="text-sm font-medium text-white/50 mb-4">
                {isActive ? 'Change plan' : 'Choose a plan'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PLANS.map(plan => (
                  <PlanCard
                    key={plan.key}
                    plan={plan}
                    currentPlan={currentPlan}
                    isActive={isActive}
                    locationCount={locationCount}
                    onSelect={isActive && currentPlan === plan.key ? handlePortal : handleCheckout}
                    loading={loading}
                  />
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingContent />
    </Suspense>
  );
}