import type { CheckStatus, QuestionStatus } from '../api/types'
import { useLang } from '../i18n/LangContext'
import type { StringKey } from '../i18n/strings'

const STYLE: Record<CheckStatus | QuestionStatus, { pill: string; icon: string }> = {
  pass: {
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-500/20',
    icon: '✓',
  },
  answered: {
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-500/20',
    icon: '✓',
  },
  potential_issue: {
    pill: 'bg-rose-50 text-rose-700 border-rose-200/80 ring-1 ring-rose-500/20',
    icon: '⚠️',
  },
  needs_information: {
    pill: 'bg-amber-50 text-amber-800 border-amber-200/80 ring-1 ring-amber-500/20',
    icon: 'ℹ️',
  },
  manual_review: {
    pill: 'bg-purple-50 text-purple-700 border-purple-200/80 ring-1 ring-purple-500/20',
    icon: '📋',
  },
  calculated: {
    pill: 'bg-sky-50 text-sky-700 border-sky-200/80 ring-1 ring-sky-500/20',
    icon: '🧮',
  },
  reference: {
    pill: 'bg-slate-100 text-slate-700 border-slate-200 ring-1 ring-slate-400/20',
    icon: '📄',
  },
  not_found: {
    pill: 'bg-slate-100 text-slate-600 border-slate-200 ring-1 ring-slate-400/20',
    icon: '🚫',
  },
  evidence_only: {
    pill: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 ring-1 ring-indigo-500/20',
    icon: '🔍',
  },
}

interface StatusBadgeProps {
  status: CheckStatus | QuestionStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useLang()
  const meta = STYLE[status] || {
    pill: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: '•',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-bold tracking-wide shadow-xs ${meta.pill}`}>
      <span>{meta.icon}</span>
      <span>{t(`status_${status}` as StringKey)}</span>
    </span>
  )
}
