'use client'

// Floating "unsaved changes" bar for edit pages. Sits above the phone tab bar.

export default function SaveBar({ dirty, saving, message, onSave, onDiscard }) {
  const visible = dirty || message
  return (
    <div className={`sticky bottom-20 sm:bottom-4 z-10 transition-opacity ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="rounded-xl border border-stone-200 bg-white shadow-lg p-3 flex items-center gap-3">
        <p className={`flex-1 text-sm ${message?.kind === 'error' ? 'text-red-700' : 'text-stone-600'}`}>
          {message?.text || 'You have unsaved changes.'}
        </p>
        {dirty && (
          <>
            <button type="button" onClick={onDiscard} className="text-sm text-stone-500 hover:text-stone-900">
              Discard
            </button>
            <button type="button" onClick={onSave} disabled={saving}
              className="bg-brand hover:bg-brand-hover text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
