import { ApiClientError } from '../api/errors'
import { useLang } from '../i18n/LangContext'
import type { StringKey } from '../i18n/strings'

export function Loader() {
  const { t } = useLang()
  return (
    <div role="status" className="flex items-center gap-2 text-slate-700">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
      {t('loading')}
    </div>
  )
}

const CODE_TO_KEY: Partial<Record<string, StringKey>> = {
  NETWORK: 'error_network',
  DB_UNAVAILABLE: 'error_db',
  LLM_UNAVAILABLE: 'error_llm',
  NOT_IMPLEMENTED: 'error_not_implemented',
  VALIDATION_ERROR: 'error_validation',
}

interface ErrorBoxProps {
  error: unknown
  onRetry?: () => void
}

export function ErrorBox({ error, onRetry }: ErrorBoxProps) {
  const { t } = useLang()
  const apiError = error instanceof ApiClientError ? error : null
  const key = apiError ? CODE_TO_KEY[apiError.code] : undefined

  return (
    <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-900">
      <p className="font-semibold">{t(key ?? 'error_generic')}</p>
      {apiError && <p className="mt-1 text-sm">{apiError.message}</p>}
      {apiError?.details && (
        <ul className="mt-1 list-disc pl-5 text-sm">
          {apiError.details.map((d) => (
            <li key={d.field + d.message}>
              <code>{d.field}</code>: {d.message}
            </li>
          ))}
        </ul>
      )}
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-2 rounded bg-red-800 px-3 py-1 font-semibold text-white">
          {t('retry')}
        </button>
      )}
    </div>
  )
}

interface ComingSoonProps {
  features: string[]
}

/** Placeholder for screens not built yet. `features` = PRD feature ids (F1…F13). */
export function ComingSoon({ features }: ComingSoonProps) {
  const { t } = useLang()
  return (
    <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-slate-600">
      <p className="text-lg">{t('coming_soon')}</p>
      <p className="mt-1 text-sm">PRD: {features.join(', ')}</p>
    </div>
  )
}
