import { useCallback } from 'react'
import { getReport } from '../../api/client'
import type { Finding } from '../../api/types'
import { EvidenceCard } from '../../components/EvidenceCard'
import { ErrorBox, Loader } from '../../components/Feedback'
import { StatusBadge } from '../../components/StatusBadge'
import { Disclaimer } from '../../components/VersionInfoBlock'
import { useLang } from '../../i18n/LangContext'
import { useApi } from '../../lib/useApi'

interface ReportPageProps {
  id: string
}

export function ReportPage({ id }: ReportPageProps) {
  const { lang, pick } = useLang()
  const loader = useCallback(() => getReport(id), [id])
  const { data: report, loading, error, reload } = useApi(loader)

  if (loading) return <Loader />
  if (error !== null) return <ErrorBox error={error} onRetry={reload} />
  if (!report) return null

  const allFindings = [
    ...(report.sections?.verified_findings || []),
    ...(report.sections?.unresolved_findings || []),
    ...(report.sections?.references || []),
  ]

  const summary = report.check?.summary

  return (
    <div className="mx-auto max-w-4xl space-y-6 bg-white p-8 rounded-2xl border border-slate-300 shadow-sm print:border-none print:shadow-none print:p-0">
      {/* Printable Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-slate-900 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Government of Madhya Pradesh · Urban Development & Housing
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Preliminary Building Plan Compliance Report
          </h1>
          <p className="text-sm font-medium text-slate-700">
            NiyamSetu (नियमसेतु) — Bhopal Municipal Corporation Plan Review
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-800 print:hidden"
        >
          🖨 {lang === 'hi' ? 'रिपोर्ट प्रिंट / सेव करें' : 'Print / Save PDF'}
        </button>
      </div>

      {/* Case Details */}
      <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 border border-slate-200 text-sm">
        <div>
          <span className="text-xs text-slate-500 block">Application / Case:</span>
          <span className="font-bold text-slate-900">{report.application?.title || id}</span>
        </div>
        <div>
          <span className="text-xs text-slate-500 block">Application ID:</span>
          <span className="font-mono text-slate-800">{report.application?.id || id}</span>
        </div>
        <div>
          <span className="text-xs text-slate-500 block">Generated On:</span>
          <span className="text-slate-800">{new Date(report.generated_at).toLocaleString()}</span>
        </div>
        <div>
          <span className="text-xs text-slate-500 block">Engine Assessment:</span>
          <span className="rounded bg-blue-100 text-blue-900 px-2 py-0.5 text-xs font-semibold">
            {report.check ? 'Complete' : 'Pending'}
          </span>
        </div>
      </div>

      {/* Summary Counts */}
      {summary && (
        <div className="flex justify-around rounded-lg border border-slate-200 bg-white p-3 text-center text-sm">
          <div>
            <div className="text-xl font-bold text-green-700">{summary.pass || 0}</div>
            <div className="text-xs text-slate-500">Compliant (Pass)</div>
          </div>
          <div>
            <div className="text-xl font-bold text-red-700">{summary.potential_issue || 0}</div>
            <div className="text-xs text-slate-500">Potential Issues</div>
          </div>
          <div>
            <div className="text-xl font-bold text-amber-700">{summary.needs_information || 0}</div>
            <div className="text-xs text-slate-500">Needs Info</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-700">{summary.manual_review || 0}</div>
            <div className="text-xs text-slate-500">Manual Review</div>
          </div>
        </div>
      )}

      {/* Findings Table */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-1.5">
          Detailed Regulatory Findings
        </h2>
        <div className="space-y-3">
          {allFindings.map((f: Finding, i: number) => (
            <div key={i} className="rounded-lg border border-slate-200 p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">Rule {f.rule_ref} — {f.title_en}</span>
                <StatusBadge status={f.status} />
              </div>
              <p className="text-xs text-slate-700">{f.explanation_en}</p>
              {f.difference !== null && (
                <p className="text-xs font-semibold text-red-600">Difference from norm: {f.difference} {f.unit || ''}</p>
              )}
              {f.evidence?.length > 0 && (
                <div className="pt-2">
                  <EvidenceCard evidence={f.evidence[0]} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Limitations */}
      <section className="rounded-lg bg-slate-50 p-4 border border-slate-200 space-y-2 text-xs text-slate-600">
        <h3 className="font-bold uppercase tracking-wider text-slate-700">Scope & Limitations:</h3>
        <ul className="list-disc pl-4 space-y-1">
          {(lang === 'hi' ? report.limitations_hi : report.limitations_en)?.map((lim: string, i: number) => (
            <li key={i}>{lim}</li>
          ))}
        </ul>
      </section>

      {/* Legal Disclaimer */}
      <Disclaimer text={pick(report.disclaimer_en, report.disclaimer_hi)} />
    </div>
  )
}
