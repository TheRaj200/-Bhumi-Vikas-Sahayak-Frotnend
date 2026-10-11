import { useCallback, useState } from 'react'
import { getEncodedRule, getRuleTests, runRuleTests } from '../../api/client'
import type { RuleTestRunResponse } from '../../api/types'
import { ErrorBox, Loader } from '../../components/Feedback'
import { useLang } from '../../i18n/LangContext'
import { useApi } from '../../lib/useApi'

interface RuleDetailPageProps {
  ruleId: string
}

export function RuleDetailPage({ ruleId }: RuleDetailPageProps) {
  const { pick } = useLang()
  const [testResults, setTestResults] = useState<RuleTestRunResponse | null>(null)
  const [runningTests, setRunningTests] = useState(false)
  const [runError, setRunError] = useState<unknown>(null)

  const loader = useCallback(async () => {
    const [rRes, tRes] = await Promise.all([
      getEncodedRule(ruleId),
      getRuleTests(ruleId).catch(() => ({ rule_id: ruleId, count: 0, tests: [] })),
    ])
    return { rule: rRes.rule, tests: tRes.tests }
  }, [ruleId])

  const { data, loading, error, reload } = useApi(loader)

  async function handleRunTests() {
    setRunningTests(true)
    setRunError(null)
    try {
      const res = await runRuleTests(ruleId)
      setTestResults(res)
    } catch (err: unknown) {
      setRunError(err)
    } finally {
      setRunningTests(false)
    }
  }

  if (loading) return <Loader />
  if (error !== null) return <ErrorBox error={error} onRetry={reload} />
  if (!data?.rule) return null

  const { rule, tests } = data

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-100 px-2.5 py-1 text-sm font-bold text-blue-900 font-mono">
              {rule.rule_id}
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
              Rule {rule.rule_ref || rule.parent_rule}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            {pick(rule.title_en, rule.title_hi)}
          </h1>
        </div>

        <button
          type="button"
          onClick={handleRunTests}
          disabled={runningTests}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-800 disabled:bg-slate-300"
        >
          {runningTests ? 'Running Tests...' : '▶ Run Rule Tests'}
        </button>
      </div>

      {runError !== null && <ErrorBox error={runError} />}

      {/* Interpretation Notes */}
      {rule.interpretation_notes && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
          <span className="font-bold text-slate-900 block mb-1">Interpretation Notes:</span>
          {rule.interpretation_notes}
        </div>
      )}

      {/* Test Results Banner */}
      {testResults && (
        <div className={`rounded-xl border p-4 ${testResults.failed === 0 ? 'bg-green-50 border-green-300 text-green-950' : 'bg-red-50 border-red-300 text-red-950'}`}>
          <div className="flex justify-between items-center font-bold">
            <span>
              {testResults.failed === 0 ? '✓ All Tests Passed' : '⚠ Some Tests Failed'}
            </span>
            <span className="text-sm">
              Passed: {testResults.passed} / {testResults.total}
            </span>
          </div>
        </div>
      )}

      {/* Checks List */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Encoded Rule Checks ({rule.checks?.length || 0})</h2>
        <div className="space-y-4">
          {rule.checks?.map((chk) => (
            <div key={chk.check_key} className="rounded-xl border border-slate-300 bg-white p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-slate-900 text-base">{chk.title_en}</span>
                  <span className="text-xs text-slate-500 block font-mono">Key: {chk.check_key} ({chk.kind})</span>
                </div>
                {chk.source?.page && (
                  <a
                    href={`/pdf/en.pdf#page=${chk.source.page}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-blue-700 underline"
                  >
                    PDF Page {chk.source.page} →
                  </a>
                )}
              </div>

              {chk.source?.quote && (
                <blockquote className="border-l-4 border-slate-400 bg-slate-50 px-3 py-2 text-xs italic text-slate-800 font-serif">
                  “{chk.source.quote}”
                </blockquote>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Tests Cases Section */}
      {tests.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Seed Test Cases ({tests.length})</h2>
          <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <th className="px-4 py-2.5">Test Name</th>
                  <th className="px-4 py-2.5">Kind</th>
                  <th className="px-4 py-2.5">Check Key</th>
                  <th className="px-4 py-2.5">Expected Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tests.map((tItem, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-medium text-slate-800">{tItem.name}</td>
                    <td className="px-4 py-2.5 uppercase text-xs text-slate-500">{tItem.kind}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{tItem.check_key}</td>
                    <td className="px-4 py-2.5 font-semibold text-xs text-blue-900">{tItem.expected.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
