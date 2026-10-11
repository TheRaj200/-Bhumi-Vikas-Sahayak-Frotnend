import { useCallback, useMemo, useState } from 'react'
import { getRule, getRules, listEncodedRules } from '../../api/client'
import type { EncodedRuleSummary, RuleDetail, RuleListItem } from '../../api/types'
import { ErrorBox, Loader } from '../../components/Feedback'
import { useLang } from '../../i18n/LangContext'
import type { StringKey } from '../../i18n/strings'
import { hrefFor } from '../../lib/router'
import { useApi } from '../../lib/useApi'

/* --- Encoded Rule Card (Logic & Tests) --- */
function EncodedRuleCard({ rule }: { rule: EncodedRuleSummary }) {
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
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-50 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-900 hover:text-white"
        >
          <span>Inspect Rule Code & Tests</span>
          <span>→</span>
        </a>
      </div>
    </div>
  )
}

/* --- Official 106 Gazette Rule Card --- */
function GazetteRuleCard({ rule }: { rule: RuleListItem }) {
  const [expanded, setExpanded] = useState(false)
  const [detail, setDetail] = useState<RuleDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const isEncoded = rule.encoded_rule_ids && rule.encoded_rule_ids.length > 0

  async function handleToggle() {
    if (!expanded) {
      setExpanded(true)
      if (!detail) {
        setLoading(true)
        try {
          const res = await getRule(rule.rule)
          setDetail(res)
        } catch {
          setDetail(null)
        } finally {
          setLoading(false)
        }
      }
    } else {
      setExpanded(false)
    }
  }

  function handleCopy() {
    if (detail?.text) {
      navigator.clipboard.writeText(detail.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      className={`group flex flex-col justify-between rounded-3xl border bg-white p-5 shadow-xs transition duration-200 ${
        expanded
          ? 'border-indigo-400 ring-2 ring-indigo-100 sm:col-span-2 lg:col-span-3'
          : 'border-slate-200/90 hover:border-indigo-300 hover:shadow-md'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="rounded-xl bg-slate-900 px-3 py-1 text-xs font-black text-white">
            Rule {rule.rule}
          </span>
          {isEncoded ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              <span>⚡</span>
              <span>Logic Encoded</span>
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              Gazette Text
            </span>
          )}
        </div>

        <span className="inline-block mb-1 text-[11px] font-medium text-indigo-700">
          {rule.part}
        </span>

        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
          {rule.title}
        </h3>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
          <span className="font-semibold text-slate-600">Gazette Pages:</span>
          <span className="font-mono font-bold text-slate-800">
            {rule.page_start === rule.page_end
              ? `Page ${rule.page_start}`
              : `Pages ${rule.page_start}–${rule.page_end}`}
          </span>
        </div>
      </div>

      {/* Expanded In-line Clause Reader */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-indigo-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              📜 Official Gazette Text (राजपत्र पाठ)
            </span>
            <div className="flex items-center gap-2">
              {detail?.text && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100"
                >
                  {copied ? '✓ Copied' : 'Copy Text'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-200"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {loading && (
            <div className="py-6 flex justify-center text-xs text-slate-500">
              <span>Loading verbatim clause...</span>
            </div>
          )}

          {!loading && detail && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto select-text">
              {detail.text || 'No verbatim text available.'}
            </div>
          )}

          {!loading && !detail && (
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 text-center">
              Could not load text.
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleToggle}
          className={`flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-bold transition ${
            expanded
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-800 hover:bg-indigo-50 hover:text-indigo-700'
          }`}
        >
          <span>{expanded ? 'Hide Text' : 'Read Text'}</span>
          <span>📜</span>
        </button>

        <a
          href={`/pdf/en.pdf#page=${rule.page_start}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1 rounded-xl bg-slate-50 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-900 hover:text-white"
        >
          <span>PDF p.{rule.page_start}</span>
          <span>↗</span>
        </a>
      </div>
    </div>
  )
}

/* --- Main Rule Lab Page --- */
export function RuleLabPage() {
  const { lang } = useLang()

  // State
  const [tab, setTab] = useState<'all' | 'encoded'>('all')
  const [search, setSearch] = useState('')
  const [selectedPart, setSelectedPart] = useState('ALL')

  // Data fetching via standard useApi hook
  const loadData = useCallback(async (): Promise<{ allRules: RuleListItem[]; encodedRules: EncodedRuleSummary[] }> => {
    const [allRes, encRes] = await Promise.all([
      getRules().catch(() => ({ source_version: '', rules: [] })),
      listEncodedRules().catch(() => ({ count: 0, rules: [] })),
    ])
    return {
      allRules: allRes.rules || [],
      encodedRules: encRes.rules || [],
    }
  }, [])

  const { data, loading, error, reload } = useApi(loadData)
  const allRules: RuleListItem[] = useMemo(() => data?.allRules || [], [data?.allRules])
  const encodedRules: EncodedRuleSummary[] = useMemo(() => data?.encodedRules || [], [data?.encodedRules])

  // Unique parts from all rules
  const uniqueParts = useMemo(() => {
    const set = new Set<string>()
    allRules.forEach((r: RuleListItem) => {
      if (r.part) set.add(r.part)
    })
    return Array.from(set)
  }, [allRules])

  // Filtered official rules
  const filteredOfficialRules = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allRules.filter((r: RuleListItem) => {
      if (selectedPart !== 'ALL' && r.part !== selectedPart) return false
      if (!q) return true
      const matchesNum = r.rule.toLowerCase().includes(q)
      const matchesTitle = r.title.toLowerCase().includes(q)
      const matchesPart = r.part.toLowerCase().includes(q)
      return matchesNum || matchesTitle || matchesPart
    })
  }, [allRules, search, selectedPart])

  // Filtered encoded rules
  const filteredEncodedRules = useMemo(() => {
    const q = search.trim().toLowerCase()
    return encodedRules.filter((r: EncodedRuleSummary) => {
      if (!q) return true
      const matchesRef = r.rule_ref.toLowerCase().includes(q)
      const matchesEn = r.title_en.toLowerCase().includes(q)
      const matchesHi = r.title_hi.toLowerCase().includes(q)
      const matchesId = r.rule_id.toLowerCase().includes(q)
      return matchesRef || matchesEn || matchesHi || matchesId
    })
  }, [encodedRules, search])

  const verifiedCount = encodedRules.filter((r) => r.verification.status === 'verified').length

  return (
    <div className="mx-auto max-w-6xl space-y-7 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {lang === 'hi' ? 'मध्य प्रदेश भूमि विकास नियम पुस्तिका (नियम लैब)' : 'MP Bhumi Vikas Rules — Rulebook & Verification Lab'}
            </h1>
            <span className="rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200">
              106 Rules
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {lang === 'hi'
              ? 'आधिकारिक समेकित राजपत्र के 106 नियम, 10 भाग, सांकेतिक लॉजिक इंजन और स्वचालित परीक्षण सूट।'
              : 'Complete repository of 106 official gazette rules across 10 Parts, plus 11 logic-encoded test suites.'}
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs">
            Gazette Rules: <span className="text-indigo-600">106</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs">
            Logic Encoded: <span className="text-emerald-600">11</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs">
            Human Verified: <span className="text-indigo-600">{verifiedCount}/11</span>
          </div>
        </div>
      </div>

      {/* Official State Gazette Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 sm:p-8 text-white shadow-xl ring-1 ring-white/10">
        <div className="absolute inset-y-0 right-0 w-full sm:w-1/2 pointer-events-none">
          <img
            src="/images/mp_secretariat.jpg"
            alt="Madhya Pradesh Official Gazette & Secretariat"
            className="h-full w-full object-cover object-center opacity-30 sm:opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
        </div>

        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-3 py-1 text-[11px] font-bold text-orange-200 border border-orange-400/30">
            <span>📜</span>
            <span>{lang === 'hi' ? 'मध्य प्रदेश राजपत्र (असाधारण) • 6 मार्च 2025 तक समेकित' : 'MP Government Gazette (Extraordinary) • Consolidated to 6 March 2025'}</span>
          </div>
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            {lang === 'hi' ? 'मध्य प्रदेश भूमि विकास नियम, 2012' : 'MP Bhumi Vikas Rules, 2012'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {lang === 'hi'
              ? 'नगरीय विकास एवं आवास विभाग द्वारा अधिसूचित संपूर्ण 106 नियम, 10 भाग तथा परीक्षण हेतु सांकेतिक नियम लॉजिक इंजन।'
              : 'Official statutory building regulations across 10 Parts with code-level logic verification and automated regression tests.'}
          </p>
        </div>
      </div>

      {loading && <Loader />}
      {error !== null && <ErrorBox error={error} onRetry={reload} />}

      {!loading && (
        <div className="space-y-6">
          {/* Controls Bar: Search, Part Filter, View Switcher */}
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            {/* View Tab Buttons */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => setTab('all')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                  tab === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{lang === 'hi' ? 'सभी 106 राजपत्र नियम' : 'All 106 Gazette Rules'}</span>
                <span
                  className={`rounded-full px-2 py-0.2 text-[10px] ${
                    tab === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {allRules.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTab('encoded')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                  tab === 'encoded'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>⚡ {lang === 'hi' ? '11 संकलित नियम (लॉजिक)' : '11 Encoded Rules'}</span>
                <span
                  className={`rounded-full px-2 py-0.2 text-[10px] ${
                    tab === 'encoded' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {encodedRules.length}
                </span>
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              {/* Search input */}
              <div className="relative min-w-[240px]">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    lang === 'hi'
                      ? 'नियम संख्या (e.g. 56, 14) या शीर्षक खोजें...'
                      : 'Search rule # (e.g. 56, 14, 42) or title...'
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
                <span className="absolute left-3 top-2 text-xs text-slate-400">🔍</span>
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-700"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Part Filter (Only active on 'all' tab) */}
              {tab === 'all' && uniqueParts.length > 0 && (
                <select
                  value={selectedPart}
                  onChange={(e) => setSelectedPart(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-medium text-slate-700 focus:border-indigo-600 focus:outline-none"
                >
                  <option value="ALL">
                    {lang === 'hi' ? 'सभी भाग (All 10 Parts)' : 'All 10 Parts'}
                  </option>
                  {uniqueParts.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Tab 1: All 106 Rules Grid */}
          {tab === 'all' && (
            <>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing {filteredOfficialRules.length} of {allRules.length} rules
                  {selectedPart !== 'ALL' && ` in ${selectedPart}`}
                </span>
                <span className="text-[11px] text-slate-400">
                  Click 'Read Text' to view full gazette clause
                </span>
              </div>

              {filteredOfficialRules.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
                  <p className="text-base font-bold text-slate-800">No matching rules found</p>
                  <p className="text-xs text-slate-400 mt-1">Try clearing your search query or part filter.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredOfficialRules.map((rule) => (
                    <GazetteRuleCard key={rule.rule} rule={rule} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Tab 2: 11 Encoded Rules Grid */}
          {tab === 'encoded' && (
            <>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing {filteredEncodedRules.length} of {encodedRules.length} logic-encoded rules
                </span>
                <span className="text-[11px] text-slate-400">
                  141 unit tests across 11 encoded rules
                </span>
              </div>

              {filteredEncodedRules.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
                  <p className="text-base font-bold text-slate-800">No matching encoded rules</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredEncodedRules.map((rule) => (
                    <EncodedRuleCard key={rule.rule_id} rule={rule} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
