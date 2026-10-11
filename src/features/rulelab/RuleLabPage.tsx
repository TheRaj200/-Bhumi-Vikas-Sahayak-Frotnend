import { listEncodedRules } from '../../api/client'
import type { EncodedRuleSummary } from '../../api/types'
import { ErrorBox, Loader } from '../../components/Feedback'
import { useLang } from '../../i18n/LangContext'
import type { StringKey } from '../../i18n/strings'
import { hrefFor } from '../../lib/router'
import { useApi } from '../../lib/useApi'

function RuleCard({ rule }: { rule: EncodedRuleSummary }) {
  const { t, pick } = useLang()
  const testsPassed = rule.tests_passed || 0
  const testsTotal = rule.tests_total || 0

  return (
    <div className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition hover:border-indigo-300 hover:shadow-md">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="rounded-xl bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700 ring-1 ring-indigo-200">
            Rule {rule.rule_ref}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              rule.verification.status === 'verified'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {t(`verification_${rule.verification.status}` as StringKey)}
          </span>
        </div>

        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
          {pick(rule.title_en, rule.title_hi)}
        </h3>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
          <span className="font-semibold">Engine Tests:</span>
          <span className="font-mono font-bold text-slate-800">
            {testsPassed}/{testsTotal} passed
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold">Compliance Status:</span>
          {rule.enabled_for_checks ? (
            <span className="font-bold text-emerald-600">✓ Enabled</span>
          ) : (
            <span className="text-slate-400 font-medium">Awaiting human sign-off</span>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100">
        <a
          href={hrefFor({ page: 'rule', ruleId: rule.rule_id })}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-50 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-indigo-600 hover:text-white"
        >
          <span>Inspect Rule Code & Tests</span>
          <span>→</span>
        </a>
      </div>
    </div>
  )
}

export function RuleLabPage() {
  const { t, lang } = useLang()
  const { data, error, loading, reload } = useApi(listEncodedRules)

  const rules = data?.rules || []
  const verifiedCount = rules.filter((r) => r.verification.status === 'verified').length

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('rule_lab_title')}</h1>
            <span className="rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200">
              {rules.length} Encoded Rules
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {lang === 'hi'
              ? 'नियम संकलन प्रयोगशाला: सांकेतिक नियम, मानवीय सत्यापन और स्वचालित टेस्ट सूट।'
              : 'Rulebook Compiler & Verification Lab: Encoded JSON rules, human audit workflow and engine test suites.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700">
            Human Verified: <span className="text-indigo-600">{verifiedCount}/{rules.length}</span>
          </div>
        </div>
      </div>

      {loading && <Loader />}
      {error !== null && <ErrorBox error={error} onRetry={reload} />}

      {/* Rules Grid */}
      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rules.map((rule) => (
            <RuleCard key={rule.rule_id} rule={rule} />
          ))}
        </div>
      )}
    </div>
  )
}
