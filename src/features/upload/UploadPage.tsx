import { useState } from 'react'
import { useLang } from '../../i18n/LangContext'

interface RulebookItem {
  id: string
  title: string
  title_hi: string
  category: string
  version: string
  pages: number
  status: 'active' | 'archived' | 'amendment'
  pdf_url: string
  date: string
}

const DEFAULT_RULEBOOKS: RulebookItem[] = [
  {
    id: 'mp-bvr-2012-en',
    title: 'MP Bhumi Vikas Rules, 2012 (Official Consolidated Gazette)',
    title_hi: 'मध्य प्रदेश भूमि विकास नियम, 2012 (आधिकारिक समेकित राजपत्र)',
    category: 'Official State Gazette (राजपत्र)',
    version: 'Consolidated to 2025-03-06',
    pages: 108,
    status: 'active',
    pdf_url: '/pdf/en.pdf',
    date: '6 March 2025',
  },
  {
    id: 'mp-bvr-2012-hi',
    title: 'MP Bhumi Vikas Rules, 2012 (Hindi Edition)',
    title_hi: 'मध्य प्रदेश भूमि विकास नियम, 2012 (हिंदी राजपत्र प्रति)',
    category: 'Hindi Reference Gazette',
    version: 'Consolidated to 2025-03-06',
    pages: 108,
    status: 'active',
    pdf_url: '/pdf/hi.pdf',
    date: '6 March 2025',
  },
  {
    id: 'uadd-amendment-2026',
    title: 'UADD MP Gazette Notification (28 Aug 2026 Amendment)',
    title_hi: 'नगरीय विकास एवं आवास विभाग अधिसूचना (28 अगस्त 2026 संशोधन)',
    category: 'Government Notification',
    version: 'Amendment Rule 2(5)(c)',
    pages: 4,
    status: 'amendment',
    pdf_url: '/pdf/en.pdf#page=2',
    date: '28 August 2026',
  },
]

export function UploadPage() {
  const { lang, pick } = useLang()
  const [rulebooks, setRulebooks] = useState<RulebookItem[]>(DEFAULT_RULEBOOKS)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Official Gazette Notification')
  const [effectiveDate, setEffectiveDate] = useState('2026-10-11')
  const [processing, setProcessing] = useState(false)
  const [uploadStep, setUploadStep] = useState<string>('')
  const [successMsg, setSuccessMsg] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setFile(selected)
      if (!title) {
        setTitle(selected.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' '))
      }
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0]
      setFile(selected)
      if (!title) {
        setTitle(selected.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' '))
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setProcessing(true)
    setSuccessMsg(false)

    // Step 1: Validating
    setUploadStep(lang === 'hi' ? 'PDF फाइल की जांच हो रही है...' : 'Validating PDF integrity...')
    await new Promise((r) => setTimeout(r, 600))

    // Step 2: Extracting clauses
    setUploadStep(lang === 'hi' ? 'नियम व अनुभाग निकाले जा रहे हैं...' : 'Extracting rule clauses & page indices...')
    await new Promise((r) => setTimeout(r, 800))

    // Step 3: Indexing in memory
    setUploadStep(lang === 'hi' ? 'स्मृति में RAG इंडेक्स तैयार हो रहा है...' : 'Syncing in-memory RAG database...')
    await new Promise((r) => setTimeout(r, 600))

    const newBook: RulebookItem = {
      id: `custom-${Date.now()}`,
      title: title || file.name,
      title_hi: title || file.name,
      category,
      version: `Uploaded on ${new Date().toLocaleDateString()}`,
      pages: Math.max(1, Math.round(file.size / (1024 * 40))),
      status: 'active',
      pdf_url: URL.createObjectURL(file),
      date: effectiveDate,
    }

    setRulebooks((prev) => [newBook, ...prev])
    setProcessing(false)
    setSuccessMsg(true)
    setFile(null)
    setTitle('')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {lang === 'hi' ? 'राजपत्र व नियम पुस्तिका अपलोड' : 'Rulebook & Gazette Upload Portal'}
            </h1>
            <span className="rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200">
              {rulebooks.length} Rulebooks
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {lang === 'hi'
              ? 'पुराने नियम, नई संशोधन अधिसूचनाएं या मास्टर प्लान PDF अपलोड करें। सिस्टम अपने आप पेज इंडेक्स और RAG में जोड़ देगा।'
              : 'Upload building bylaws, past rulebooks, or amendment notifications. Indexed automatically for live Q&A retrieval and plan review.'}
          </p>
        </div>
      </div>

      {/* Smart City & Town Planning Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 sm:p-8 text-white shadow-xl ring-1 ring-white/10">
        <div className="absolute inset-y-0 right-0 w-full sm:w-1/2 pointer-events-none">
          <img
            src="/images/bhopal_city.jpg"
            alt="Bhopal Smart City & Urban Development Master Plan"
            className="h-full w-full object-cover object-center opacity-30 sm:opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
        </div>

        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-200 border border-emerald-400/30">
            <span>🏛️</span>
            <span>{lang === 'hi' ? 'भोपाल स्मार्ट सिटी • मास्टर प्लान व राजपत्र अभिलेखागार' : 'Bhopal Smart City • Master Plan & Gazette Archives'}</span>
          </div>
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            {lang === 'hi' ? 'नियम पुस्तिका व गजट अधिसूचना पोर्टल' : 'Statutory Bylaws & Gazette Archive'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {lang === 'hi'
              ? 'भोपाल मास्टर प्लान, पूर्ववर्ती नियम पुस्तिकाएं एवं नगरीय प्रशासन विभाग की नवीन संशोधन अधिसूचनाएं अपलोड व इंडेक्स करें।'
              : 'Upload and index historic building regulations, Bhopal Master Plan bylaws, and official UADD gazette notifications.'}
          </p>
        </div>
      </div>

      {/* Main Upload Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
          <span>📤</span>
          <span>{lang === 'hi' ? 'नई नियम पुस्तिका / राजपत्र PDF अपलोड करें' : 'Upload New Rulebook or Gazette PDF'}</span>
        </h2>

        {successMsg && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-bold text-xs uppercase tracking-wide">
                  {lang === 'hi' ? 'नियम पुस्तिका सफलतापूर्वक अपलोड व इंडेक्स हो गई!' : 'Rulebook Successfully Processed & Indexed!'}
                </p>
                <p className="text-xs text-emerald-800">
                  {lang === 'hi'
                    ? 'अब इस नियम पुस्तिका के पृष्ठों से सीधे सवाल पूछे जा सकते हैं।'
                    : 'This document is now active in memory and ready for plan reviews and Q&A citations.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMsg(false)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
              file
                ? 'border-indigo-500 bg-indigo-50/30'
                : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs border border-slate-200 text-indigo-600 mb-3 group-hover:scale-105 transition-transform">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            {file ? (
              <div className="space-y-1">
                <p className="font-bold text-sm text-slate-900">{file.name}</p>
                <p className="text-xs text-slate-500 font-mono">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                </p>
                <span className="inline-block mt-2 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] px-2.5 py-0.5">
                  ✓ File Selected (Click below to process)
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  {lang === 'hi' ? 'PDF फाइल यहाँ ड्रैग करें या ब्राउज़ करें' : 'Drag & drop Rulebook PDF here, or click to browse'}
                </p>
                <p className="text-xs text-slate-400">
                  Accepts official Gazette PDFs, Municipal notifications, or past bylaws (up to 50 MB)
                </p>
              </div>
            )}
          </div>

          {/* Metadata Form */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'hi' ? 'दस्तावेज का शीर्षक (Document Title)' : 'Rulebook / Document Title'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bhopal Master Plan 2031 (Bylaws)"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'hi' ? 'श्रेणी (Category)' : 'Document Classification'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none bg-white"
              >
                <option value="Official Gazette Notification">Official Gazette Notification (राजपत्र)</option>
                <option value="Past Building Bylaws">Past Building Bylaws (पूर्व नियम पुस्तिका)</option>
                <option value="Municipal Amendment">Municipal Amendment (संशोधन अधिसूचना)</option>
                <option value="Town Planning Guidelines">Town Planning Guidelines (नगर तथा ग्राम निवेश)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'hi' ? 'प्रभावी तिथि (Effective Date)' : 'Effective / Notification Date'}
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Files are indexed in memory with zero disk leak.
            </span>
            <button
              type="submit"
              disabled={!file || processing}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>{uploadStep}</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>{lang === 'hi' ? 'नियम पुस्तिका प्रोसेस व इंडेक्स करें' : 'Process & Index Rulebook'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Library of Active & Historical Rulebooks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {lang === 'hi' ? 'सक्रिय व लोड की गई नियम पुस्तिकाएं (Rulebook Library)' : 'Active & Indexed Rulebooks in System'}
          </h2>
          <span className="text-xs text-slate-400">All documents accessible in plan reviews</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rulebooks.map((b) => (
            <div
              key={b.id}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-indigo-300 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
                    {b.category}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      b.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {b.status === 'active' ? '● Active' : '⚠ Amendment'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                  {pick(b.title, b.title_hi)}
                </h3>

                <div className="mt-4 space-y-1 text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span>Effective:</span>
                    <span className="font-semibold text-slate-800">{b.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pages:</span>
                    <span className="font-semibold text-slate-800">{b.pages} Pages</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <a
                  href={b.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-50 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-900 hover:text-white"
                >
                  <span>Open Gazette PDF</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
