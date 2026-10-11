import type { Evidence } from '../api/types'
import { useLang } from '../i18n/LangContext'

interface EvidenceCardProps {
  evidence: Evidence
}

/** Rule number, title, page, exact quote and PDF link — always rendered from backend records. */
export function EvidenceCard({ evidence }: EvidenceCardProps) {
  const { t } = useLang()
  const pageText = evidence.page ? `${t('page')} ${evidence.page}` : `${t('pages')} ${evidence.page_start}–${evidence.page_end}`

  return (
    <article className="evidence-card rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-indigo-200 hover:shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-700 ring-1 ring-indigo-200">
            {t('rule')} {evidence.clause ?? evidence.rule}
          </span>
          {evidence.title && (
            <span className="text-xs font-bold text-slate-800">{evidence.title}</span>
          )}
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 font-mono">
          📄 {pageText}
        </span>
      </header>

      <blockquote className="mt-3 rounded-xl border-l-4 border-indigo-500 bg-slate-50/80 p-3.5 text-xs italic leading-relaxed text-slate-800">
        “{evidence.quote}”
      </blockquote>

      <footer className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100 pt-2.5">
        <div className="flex items-center gap-2">
          {evidence.quote_verified ? (
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[10px]">✓</span>
              <span>{t('verified_quote')}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-bold text-amber-700">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-[10px]">!</span>
              <span>{t('unverified_quote')}</span>
            </span>
          )}
          {evidence.source_version && (
            <span className="text-slate-400 text-[11px] font-mono">
              (Consolidated to {evidence.source_version})
            </span>
          )}
        </div>

        <a
          className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 transition"
          href={evidence.pdf_url}
          target="_blank"
          rel="noreferrer"
        >
          <span>{t('open_pdf_page')}</span>
          <span>↗</span>
        </a>
      </footer>
    </article>
  )
}
