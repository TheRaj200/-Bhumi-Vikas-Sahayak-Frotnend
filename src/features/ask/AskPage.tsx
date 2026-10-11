import { useState } from 'react'
import { askQuestion, searchRules } from '../../api/client'
import type { QuestionResponse, SearchResult } from '../../api/types'
import { CitizenSlip } from '../../components/CitizenSlip'
import { ErrorBox, Loader } from '../../components/Feedback'
import { GazettePdfViewer } from '../../components/GazettePdfViewer'
import { StatusBadge } from '../../components/StatusBadge'
import { AmendmentAlert, Disclaimer } from '../../components/VersionInfoBlock'
import { useLang } from '../../i18n/LangContext'

interface SampleCategory {
  category_en: string
  category_hi: string
  icon: string
  questions: {
    id: number
    label_en: string
    label_hi: string
    text_en: string
    text_hi: string
  }[]
}

const SAMPLE_CATEGORIES: SampleCategory[] = [
  {
    category_en: 'Open Spaces & Setbacks',
    category_hi: 'खुली जगह व सेटबैक',
    icon: '🏡',
    questions: [
      {
        id: 1,
        label_en: 'Front open space for 9 m building on 10 m road',
        label_hi: '10 मी. सड़क पर 9 मी. मकान का फ्रंट सेटबैक',
        text_en: 'My house faces a 10 m wide street and will be 9 m tall. How much open space do I leave at the front?',
        text_hi: '10 मी. चौड़ी सड़क और 9 मी. ऊँचाई वाले मकान के सामने कितनी खुली जगह छोड़नी होगी?',
      },
      {
        id: 10,
        label_en: 'Rear setback for 150 sq m plot',
        label_hi: '150 वर्ग मी. प्लॉट पर पीछे की जगह',
        text_en: 'What is the minimum rear open space for a 150 sq m residential plot?',
        text_hi: '150 वर्ग मीटर के आवासीय प्लॉट के लिए पीछे की न्यूनतम खुली जगह कितनी है?',
      },
      {
        id: 14,
        label_en: '200 sq m plot on 9 m road (Hindi)',
        label_hi: '200 वर्ग मी. प्लॉट व 9 मी. सड़क (हिंदी)',
        text_en: 'मेरा प्लॉट 200 वर्ग मीटर का है और सामने 9 मीटर चौड़ी सड़क है। आगे कितनी जगह खाली छोड़नी होगी?',
        text_hi: 'मेरा प्लॉट 200 वर्ग मीटर का है और सामने 9 मीटर चौड़ी सड़क है। आगे कितनी जगह खाली छोड़नी होगी?',
      },
    ],
  },
  {
    category_en: 'Agriculture & Farm Houses',
    category_hi: 'कृषि व फार्म हाउस',
    icon: '🚜',
    questions: [
      {
        id: 2,
        label_en: 'Farm house min plot size and FAR',
        label_hi: 'फार्म हाउस न्यूनतम प्लॉट आकार व FAR',
        text_en: 'I want a farm house on agricultural land. What is the minimum plot size and the maximum FAR?',
        text_hi: 'कृषि भूमि पर फार्म हाउस के लिए न्यूनतम प्लॉट आकार और अधिकतम FAR क्या है?',
      },
    ],
  },
  {
    category_en: 'Permissions & Validity',
    category_hi: 'अनुज्ञा व वैधता',
    icon: '⏱️',
    questions: [
      {
        id: 3,
        label_en: 'Development permission validity & renewal',
        label_hi: 'विकास अनुज्ञा की वैधता व नवीनीकरण',
        text_en: 'My development permission was granted in 2023. How long does it stay valid, and how many times can I renew it?',
        text_hi: 'विकास अनुज्ञा 2023 में मिली थी। यह कब तक वैध रहेगी और कितनी बार नवीनीकरण हो सकता है?',
      },
      {
        id: 4,
        label_en: 'Deemed permission if BMC misses deadline',
        label_hi: 'समय सीमा में जवाब न मिलने पर डीम्ड परमिशन',
        text_en: 'I applied for building permission and the authority has not replied. What happens if they miss the deadline?',
        text_hi: 'भवन अनुज्ञा के आवेदन पर समय सीमा में जवाब न मिलने पर क्या प्रावधान है?',
      },
    ],
  },
  {
    category_en: 'Heights, Lifts & Safety',
    category_hi: 'ऊंचाई, लिफ्ट व सुरक्षा',
    icon: '⚡',
    questions: [
      {
        id: 5,
        label_en: 'Clearance from low-voltage power lines',
        label_hi: 'निम्न वोल्टेज बिजली लाइन से सुरक्षित दूरी',
        text_en: 'How far must my balcony stay from a low-voltage overhead electric line, vertically and horizontally?',
        text_hi: 'निम्न वोल्टेज बिजली लाइन से बालकनी की ऊर्ध्वाधर और क्षैतिज दूरी कितनी होनी चाहिए?',
      },
      {
        id: 13,
        label_en: 'Lift requirements for buildings above 15 m',
        label_hi: '15 मीटर से ऊँचे भवनों में लिफ्ट के नियम',
        text_en: 'What are the rules for lifts in a building taller than 15 m?',
        text_hi: '15 मीटर से ऊँचे भवनों में लिफ्ट के क्या नियम हैं?',
      },
    ],
  },
  {
    category_en: 'Fees & 2026 Amendments',
    category_hi: 'शुल्क व 2026 संशोधन',
    icon: '📜',
    questions: [
      {
        id: 8,
        label_en: 'Residential building permission fees',
        label_hi: 'आवासीय भवन अनुज्ञा शुल्क दरें',
        text_en: 'What is the fee for building permission for a residential house?',
        text_hi: 'आवासीय भवन अनुज्ञा का शुल्क कितना है?',
      },
      {
        id: 11,
        label_en: 'Plot ≤ 500 sq m (28 Aug 2026 Amendment Warning)',
        label_hi: '500 वर्ग मी. प्लॉट (28 अगस्त 2026 संशोधन चेतावनी)',
        text_en: 'Do I need separate development permission for a 300 sq m plot that matches the Development Plan?',
        text_hi: 'क्या 300 वर्ग मी. प्लॉट के लिए अलग विकास अनुज्ञा की आवश्यकता है? (अगस्त 2026 संशोधन)',
      },
      {
        id: 16,
        label_en: 'Property Tax (Out of Rulebook Scope)',
        label_hi: 'प्रॉपर्टी टैक्स (नियम पुस्तिका से बाहर)',
        text_en: 'How do I pay my property tax online?',
        text_hi: 'संपत्ति कर (प्रॉपर्टी टैक्स) ऑनलाइन कैसे भरें?',
      },
    ],
  },
]

export function AskPage() {
  const { lang, pick } = useLang()
  const [activeTab, setActiveTab] = useState<'ask' | 'search'>('ask')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [answerData, setAnswerData] = useState<QuestionResponse | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedEvidenceIdx, setSelectedEvidenceIdx] = useState(0)
  const [copied, setCopied] = useState(false)

  async function handleAsk(e?: React.FormEvent, customQ?: string) {
    if (e) e.preventDefault()
    const textToQuery = (customQ ?? query).trim()
    if (!textToQuery) return

    setLoading(true)
    setError(null)
    setAnswerData(null)
    setSelectedEvidenceIdx(0)

    try {
      if (activeTab === 'ask') {
        const res = await askQuestion({ question: textToQuery, lang })
        setAnswerData(res)
      } else {
        const res = await searchRules(textToQuery)
        setSearchResults(res.results || [])
      }
    } catch (err: unknown) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  function handleChipClick(chipText: string) {
    setQuery(chipText)
    handleAsk(undefined, chipText)
  }

  function handleCopyAnswer() {
    if (!answerData?.answer) return
    navigator.clipboard.writeText(answerData.answer)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Convert search results into evidence format for right-side PDF preview
  const searchEvidenceList: QuestionResponse['evidence'] = searchResults.map((r) => ({
    rule: r.rule,
    parent_rule: r.rule,
    clause: r.rule,
    title: r.title,
    part: r.part || '',
    page: r.page_start,
    page_start: r.page_start,
    page_end: r.page_end,
    quote: r.snippet,
    quote_verified: true,
    pdf_url: r.pdf_url,
    source_version: '2025-03-06',
  }))

  const activeEvidenceList = activeTab === 'ask' ? (answerData?.evidence || []) : searchEvidenceList

  return (
    <div className="mx-auto max-w-7xl">
      <div className="no-print space-y-8 animate-fade-in">
        {/* Hero Header with Authentic MP Secretariat Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 sm:p-9 text-white shadow-xl ring-1 ring-white/10">
          {/* Background Government Building Photo on the right with gradient overlay */}
          <div className="absolute inset-y-0 right-0 w-full sm:w-3/5 pointer-events-none">
            <img
              src="/images/mp_secretariat.jpg"
              alt="Vallabh Bhawan, MP Government Secretariat"
              className="h-full w-full object-cover object-center opacity-30 sm:opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/20 px-3 py-1 text-[11px] font-bold text-orange-200 border border-orange-400/30">
                  <span>🏛️</span>
                  <span>{lang === 'hi' ? 'वल्लभ भवन, भोपाल • मध्य प्रदेश शासन' : 'Vallabh Bhawan, Bhopal • Govt of MP'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-indigo-200 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {lang === 'hi' ? 'भोपाल नगर निगम भवन अनुज्ञा काउंटर' : 'Bhopal Municipal Corporation Building Permission Desk'}
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-white">
                {lang === 'hi' ? 'भवन नियम सहायक (AI Assistant)' : 'Building Rules Assistant'}
              </h1>
              <p className="text-sm leading-relaxed text-slate-300">
                {lang === 'hi'
                  ? 'मध्य प्रदेश भूमि विकास नियम, 2012 के तहत तुरंत उत्तर, सटीक नियम संख्या और आधिकारिक राजपत्र उद्धरण खोजें।'
                  : 'Deterministic regulatory assistant grounded in MP Bhumi Vikas Rules, 2012 with side-by-side Gazette PDF verification.'}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex rounded-2xl bg-white/10 p-1.5 backdrop-blur-md ring-1 ring-white/15">
            <button
              type="button"
              onClick={() => setActiveTab('ask')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                activeTab === 'ask'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {lang === 'hi' ? 'सवाल पूछें' : 'Ask Question'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                activeTab === 'search'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {lang === 'hi' ? 'नियम खोजें' : 'Search Rules'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Command Bar Input */}
      <form onSubmit={(e) => handleAsk(e)} className="relative">
        <div className="group relative flex items-center rounded-2xl border-2 border-slate-200/90 bg-white p-2 shadow-sm transition-all duration-200 focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-100/70 hover:border-slate-300">
          <div className="flex h-12 w-12 items-center justify-center text-slate-400 group-focus-within:text-indigo-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              activeTab === 'ask'
                ? lang === 'hi'
                  ? 'उदा. 200 वर्ग मी. प्लॉट पर 9 मी. सड़क के सामने कितना सेटबैक छोड़ना होगा?'
                  : 'e.g. My plot is 200 sq m on a 9 m road. How much front open space do I leave?'
                : lang === 'hi'
                  ? 'खोजें: खुली जगह, सड़क चौड़ाई, फार्म हाउस, लिफ्ट, शुल्क, नियम 56...'
                  : 'Search keywords: open space, road width, farm house, lift, fees, Rule 56...'
            }
            className="flex-1 bg-transparent px-3 py-3 text-base font-medium text-slate-900 placeholder:text-slate-400 border-0 outline-none focus:outline-none focus:ring-0 shadow-none"
            autoFocus
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="mr-2 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-600/30 transition-all duration-150 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>{lang === 'hi' ? 'खोज जारी...' : 'Analyzing...'}</span>
              </>
            ) : (
              <>
                <span>{activeTab === 'ask' ? (lang === 'hi' ? 'उत्तर पाएं' : 'Ask') : (lang === 'hi' ? 'खोजें' : 'Search')}</span>
                <span className="text-xs opacity-75">↵</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Loading state */}
      {loading && <Loader />}

      {/* Error display */}
      {error !== null && <ErrorBox error={error} onRetry={() => handleAsk()} />}

      {/* ========================================================================= */}
      {/* DUAL-PANEL WORKSPACE: Left = AI Response, Right = Live PDF Gazette Page   */}
      {/* ========================================================================= */}
      {((answerData && activeTab === 'ask') || (searchResults.length > 0 && activeTab === 'search')) && (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 animate-fade-in">
          {/* LEFT PANEL: AI Analysis & Legal Explanation (Col 6 or 7) */}
          <div className="space-y-6 lg:col-span-6">
            {activeTab === 'ask' && answerData && (
              <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                {/* Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <StatusBadge status={answerData.status} />
                    {answerData.latency_ms && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-slate-500">
                        ⏱ {answerData.latency_ms} ms
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyAnswer}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                    >
                      {copied ? '✓ Copied' : '📋 Copy'}
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                    >
                      🖨 Print Slip
                    </button>
                  </div>
                </div>

                {/* Amendment Alert Banner if triggered */}
                {answerData.version?.amendment_warnings?.length > 0 && (
                  <AmendmentAlert version={answerData.version} />
                )}

                {/* AI Synthesized Rule Explanation */}
                <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 p-6 shadow-xs">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-900">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white text-[10px]">⚖️</span>
                      <span>{lang === 'hi' ? 'आधिकारिक नियम समाधान (Rule Explanation)' : 'Official Rulebook Explanation'}</span>
                    </div>
                    {answerData.ai_used && (
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
                        AI Grounded
                      </span>
                    )}
                  </div>

                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800">
                    {answerData.answer}
                  </p>
                </div>

                {/* Citations Quick Summary */}
                {answerData.evidence && answerData.evidence.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {lang === 'hi' ? 'उद्धृत आधिकारिक नियम (Click to view page)' : 'Cited Rules & Pages'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {answerData.evidence.map((ev, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedEvidenceIdx(idx)}
                          className={`flex items-center gap-1.5 rounded-xl border p-2.5 text-left text-xs transition ${
                            selectedEvidenceIdx === idx
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span className="font-mono font-bold text-indigo-700">Rule {ev.clause || ev.rule}</span>
                          <span className="text-slate-400">•</span>
                          <span className="font-semibold text-slate-600">Page {ev.page || ev.page_start}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <Disclaimer text={answerData.disclaimer} />
              </div>
            )}

            {/* Search Results in Left Panel */}
            {activeTab === 'search' && searchResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
                    {lang === 'hi' ? 'प्रासंगिक नियम' : 'Matching Rules'} ({searchResults.length})
                  </h2>
                </div>

                <div className="space-y-2.5">
                  {searchResults.map((hit, idx) => (
                    <div
                      key={hit.rule}
                      onClick={() => setSelectedEvidenceIdx(idx)}
                      className={`cursor-pointer rounded-2xl border p-4 transition ${
                        selectedEvidenceIdx === idx
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="rounded-lg bg-indigo-50 px-2.5 py-0.5 text-xs font-black text-indigo-700 ring-1 ring-indigo-200">
                          Rule {hit.rule}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          Page {hit.page_start}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{hit.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 italic">“...{hit.snippet}...”</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Interactive Live Gazette PDF & Quote Inspector (Col 6 or 5) */}
          <div className="space-y-4 lg:col-span-6 sticky top-20 self-start">
            <GazettePdfViewer
              evidenceList={activeEvidenceList}
              selectedIndex={selectedEvidenceIdx}
              onSelectIndex={(idx) => setSelectedEvidenceIdx(idx)}
            />
          </div>
        </section>
      )}

      {/* Categorized Sample Chips (When no search active or at bottom) */}
      <div className="space-y-4 border-t border-slate-200 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>✨</span>
            <span>{lang === 'hi' ? 'त्वरित विषय व आधिकारिक नमूना प्रश्न' : 'Frequent Counter Questions (Bhopal Benchmarks)'}</span>
          </div>
          <span className="text-xs text-slate-400">Click any card to ask and inspect PDF page</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_CATEGORIES.map((cat, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-indigo-200 hover:shadow-sm"
            >
              <div className="mb-2.5 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="text-base">{cat.icon}</span>
                <span className="text-xs font-bold text-slate-800">
                  {pick(cat.category_en, cat.category_hi)}
                </span>
              </div>
              <div className="space-y-1.5">
                {cat.questions.map((q) => {
                  const label = pick(q.label_en, q.label_hi)
                  const fullText = pick(q.text_en, q.text_hi)
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleChipClick(fullText)}
                      className="group flex w-full items-start gap-2 rounded-lg p-1.5 text-left text-xs font-medium text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-900"
                    >
                      <span className="mt-0.5 rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px] font-bold text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-700">
                        Q{q.id}
                      </span>
                      <span className="line-clamp-2 leading-relaxed">{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* Dedicated 1-Page Official Citizen Print Slip */}
      {answerData && <CitizenSlip question={query} answerData={answerData} />}
    </div>
  )
}
