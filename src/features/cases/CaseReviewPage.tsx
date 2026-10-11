import { useCallback, useState } from 'react'
import { getApplication, runComplianceCheck, updateApplication } from '../../api/client'
import type { CaseInputs, ComplianceResult, Finding } from '../../api/types'
import { EvidenceCard } from '../../components/EvidenceCard'
import { ErrorBox, Loader } from '../../components/Feedback'
import { StatusBadge } from '../../components/StatusBadge'
import { useLang } from '../../i18n/LangContext'
import { useApi } from '../../lib/useApi'

interface CaseReviewPageProps {
  id: string
}

export function CaseReviewPage({ id }: CaseReviewPageProps) {
  const { lang } = useLang()
  const loader = useCallback(() => getApplication(id), [id])
  const { data: detail, loading, error: loadError, reload } = useApi(loader)
  const [checking, setChecking] = useState(false)
  const [checkError, setCheckError] = useState<unknown>(null)
  const [inputs, setInputs] = useState<CaseInputs>({})
  const [checkResult, setCheckResult] = useState<ComplianceResult | null>(null)
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null)

  // Sync inputs from loaded application
  const [lastLoadedId, setLastLoadedId] = useState<string | null>(null)
  if (detail?.application && detail.application.id !== lastLoadedId) {
    setLastLoadedId(detail.application.id)
    setInputs(detail.application.inputs || {})
    if (detail.latest_check) {
      setCheckResult(detail.latest_check)
      if (detail.latest_check.findings?.length > 0) {
        setSelectedFinding(detail.latest_check.findings[0])
      }
    }
  }

  async function handleRunCheck() {
    setChecking(true)
    setCheckError(null)
    try {
      await updateApplication(id, { inputs })
      const res = await runComplianceCheck({ inputs, application_id: id, lang })
      setCheckResult(res)
      if (res.findings?.length > 0) {
        setSelectedFinding(res.findings[0])
      }
    } catch (err: unknown) {
      setCheckError(err)
    } finally {
      setChecking(false)
    }
  }

  function updateInput<K extends keyof CaseInputs>(key: K, val: CaseInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: val }))
  }

  function updateProposed(key: string, val: number | boolean | null) {
    setInputs((prev) => ({
      ...prev,
      proposed: {
        ...(prev.proposed || {}),
        [key]: val,
      },
    }))
  }

  const plotW = Number(inputs.plot_width_m || 10)
  const plotD = Number(inputs.plot_depth_m || 20)
  const frontSetback = Number(inputs.proposed?.front_setback_m || 3.0)
  const rearSetback = Number(inputs.proposed?.rear_setback_m || 2.0)
  const leftSetback = Number(inputs.proposed?.side_setback_left_m || 1.5)
  const rightSetback = Number(inputs.proposed?.side_setback_right_m || 3.0)

  // Scale for SVG rendering (normalized to 320px container)
  const maxDim = Math.max(plotW, plotD, 1)
  const scale = 260 / maxDim
  const svgW = plotW * scale
  const svgH = plotD * scale

  const footX = leftSetback * scale
  const footY = frontSetback * scale
  const footW = Math.max(0, (plotW - leftSetback - rightSetback) * scale)
  const footH = Math.max(0, (plotD - frontSetback - rearSetback) * scale)

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-xl bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-800 border border-orange-200">
              🏛️ BMC Plan Review
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {detail?.application.title || `Case ${id}`}
            </h1>
            {checkResult && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                ✓ Evaluated ({checkResult.findings?.length || 0} Findings)
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400 font-mono">Application Reference: {id}</p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`#/cases/${id}/report`}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50"
          >
            <span>📄</span>
            <span>{lang === 'hi' ? 'समीक्षा रिपोर्ट' : 'Official Report'}</span>
          </a>
          <button
            type="button"
            onClick={handleRunCheck}
            disabled={checking}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 active:scale-95"
          >
            {checking ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>{lang === 'hi' ? 'जाँच हो रही है...' : 'Evaluating Rules...'}</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>{lang === 'hi' ? 'नियमों की जाँच करें' : 'Run Compliance Engine'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {loadError !== null && <ErrorBox error={loadError} onRetry={reload} />}
      {checkError !== null && <ErrorBox error={checkError} />}
      {loading && <Loader />}

      {/* 3-Column Plan Inspector */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Dimensions Form (4 cols) */}
        <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
              📐 {lang === 'hi' ? 'प्लॉट व भवन माप' : 'Plot & Building Inputs'}
            </h2>
            <span className="text-[11px] font-semibold text-slate-400">Live Parameters</span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Plot Width (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.plot_width_m ?? ''}
                  onChange={(e) => updateInput('plot_width_m', parseFloat(e.target.value) || null)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Plot Depth (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.plot_depth_m ?? ''}
                  onChange={(e) => updateInput('plot_depth_m', parseFloat(e.target.value) || null)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Plot Area (m²)</label>
                <input
                  type="number"
                  value={inputs.plot_area_sqm ?? ''}
                  onChange={(e) => updateInput('plot_area_sqm', parseFloat(e.target.value) || null)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Road Width (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.road_width_m ?? ''}
                  onChange={(e) => updateInput('road_width_m', parseFloat(e.target.value) || null)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Building Height (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.proposed?.building_height_m ?? ''}
                  onChange={(e) => updateProposed('building_height_m', parseFloat(e.target.value) || null)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Floors</label>
                <input
                  type="number"
                  value={inputs.proposed?.floors ?? ''}
                  onChange={(e) => updateProposed('floors', parseInt(e.target.value, 10) || null)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Setbacks Container */}
            <div className="rounded-2xl bg-slate-50 p-4 space-y-3 border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Proposed Setbacks (m)
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500">Front (सामने)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.proposed?.front_setback_m ?? ''}
                    onChange={(e) => updateProposed('front_setback_m', parseFloat(e.target.value) || null)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500">Rear (पीछे)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.proposed?.rear_setback_m ?? ''}
                    onChange={(e) => updateProposed('rear_setback_m', parseFloat(e.target.value) || null)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500">Left Side (बाईं)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.proposed?.side_setback_left_m ?? ''}
                    onChange={(e) => updateProposed('side_setback_left_m', parseFloat(e.target.value) || null)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500">Right Side (दाईं)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.proposed?.side_setback_right_m ?? ''}
                    onChange={(e) => updateProposed('side_setback_right_m', parseFloat(e.target.value) || null)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Center Column: 2D Architectural SVG Plan Inspector (5 cols) */}
        <section className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                🗺️ 2D Architectural Plan View
              </h2>
              <p className="text-[11px] text-slate-400">Scale-accurate plot footprint & setback boundary</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-[10px] font-bold text-slate-600">
              1:{scale.toFixed(1)}
            </span>
          </div>

          {/* Blueprint Canvas */}
          <div className="my-auto flex flex-col items-center justify-center py-4">
            {/* Street Frontage Strip */}
            <div className="mb-2 flex w-full max-w-xs items-center justify-center rounded-xl bg-slate-900 py-2 text-xs font-bold text-slate-200 shadow-sm border border-slate-700">
              <span className="mr-2">🛣️</span>
              <span>Frontage Street ({inputs.road_width_m || 9} m)</span>
            </div>

            {/* Architectural SVG container */}
            <div className="blueprint-grid relative rounded-2xl border-2 border-indigo-500/40 p-4 shadow-xl">
              <svg width={svgW + 40} height={svgH + 40} className="overflow-visible">
                {/* Plot Boundary */}
                <rect
                  x="20"
                  y="20"
                  width={svgW}
                  height={svgH}
                  fill="rgba(15, 23, 42, 0.4)"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />

                {/* Building Footprint */}
                <rect
                  x={20 + footX}
                  y={20 + footY}
                  width={footW}
                  height={footH}
                  fill="rgba(59, 130, 246, 0.35)"
                  stroke="#60a5fa"
                  strokeWidth="2.5"
                />

                {/* Center Label */}
                <text
                  x={20 + footX + footW / 2}
                  y={20 + footY + footH / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white text-[11px] font-extrabold tracking-wide"
                >
                  PROPOSED STRUCTURE
                </text>
              </svg>

              {/* Dimension badges */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs">
                {plotW} m
              </div>
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs">
                {plotD} m
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex w-full items-center justify-around rounded-xl bg-slate-50 p-2.5 text-[11px] font-semibold text-slate-600 border border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
              <span>Footprint ({footW > 0 ? ((plotW - leftSetback - rightSetback) * (plotD - frontSetback - rearSetback)).toFixed(1) : 0} m²)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-sky-400" />
              <span>Setbacks Boundary</span>
            </span>
          </div>
        </section>

        {/* Right Column: Finding Details & Action Plan (3 cols) */}
        <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
              🔍 Findings Inspector
            </h2>
            <span className="text-[11px] font-bold text-slate-400">Rule Checks</span>
          </div>

          {/* Findings List Selector */}
          {checkResult && checkResult.findings && (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {checkResult.findings.map((f, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedFinding(f)}
                  className={`flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs transition ${
                    selectedFinding === f
                      ? 'bg-indigo-50 border border-indigo-200 font-bold text-indigo-900'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="truncate">{f.title_en}</span>
                  <StatusBadge status={f.status} />
                </button>
              ))}
            </div>
          )}

          {/* Selected Finding Details */}
          {selectedFinding ? (
            <div className="space-y-3 rounded-2xl bg-slate-50 p-4 border border-slate-200/80 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900">{selectedFinding.title_en}</span>
                <StatusBadge status={selectedFinding.status} />
              </div>

              <div className="space-y-1.5 border-t border-slate-200/60 pt-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Legal Rule:</span>
                  <span className="font-bold text-slate-800">Rule {selectedFinding.rule_ref}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Entered:</span>
                  <span className="font-bold text-slate-800">
                    {selectedFinding.entered_value !== null ? `${selectedFinding.entered_value} ${selectedFinding.unit || ''}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mandatory Norm:</span>
                  <span className="font-bold text-slate-800">
                    {selectedFinding.required_value !== null ? `${selectedFinding.required_value} ${selectedFinding.unit || ''}` : '—'}
                  </span>
                </div>
                {selectedFinding.difference !== null && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Deviation:</span>
                    <span>{selectedFinding.difference} {selectedFinding.unit || ''}</span>
                  </div>
                )}
              </div>

              <p className="text-[11px] leading-relaxed text-slate-600">
                {selectedFinding.explanation_en}
              </p>

              {Array.isArray(selectedFinding.evidence) && selectedFinding.evidence.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200/60">
                  {selectedFinding.evidence.map((ev, eIdx) => (
                    <EvidenceCard key={eIdx} evidence={ev} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
              Run compliance check to inspect rule findings.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
