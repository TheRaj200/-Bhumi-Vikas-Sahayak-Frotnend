import type { VersionInfo } from '../api/types'
import { useLang } from '../i18n/LangContext'

export function VersionBadge() {
  const { t } = useLang()
  return (
    <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
      <span>{t('version_badge')}</span>
    </span>
  )
}

interface AmendmentAlertProps {
  version: VersionInfo
}

/** Prominent warning for every amendment the backend attaches to a response. */
export function AmendmentAlert({ version }: AmendmentAlertProps) {
  const { t, pick } = useLang()
  if (!version?.amendment_warnings || version.amendment_warnings.length === 0) return null

  return (
    <div className="space-y-3">
      {version.amendment_warnings.map((w) => (
        <div
          key={w.id}
          role="alert"
          className="relative overflow-hidden rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/30 p-5 text-amber-950 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white font-bold text-base shadow-xs">
              ⚠️
            </span>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-sm text-amber-950">
                  {t('amendment_title')} — Rule {w.rule} ({w.date})
                </span>
                {!w.verified && (
                  <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                    {t('amendment_unverified')}
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed text-amber-900 font-medium">
                {pick(w.message_en, w.message_hi)}
              </p>
              <div className="pt-2">
                <a
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 underline hover:text-amber-950"
                  href={w.source_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>{t('amendment_source')}</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface DisclaimerProps {
  text: string
}

export function Disclaimer({ text }: DisclaimerProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 text-xs text-slate-500 leading-relaxed">
      <div className="flex items-center gap-2 mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <span>⚖️</span>
        <span>Legal Disclaimer</span>
      </div>
      <p>{text}</p>
    </div>
  )
}
