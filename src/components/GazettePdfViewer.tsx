import { useState } from 'react'
import type { Evidence } from '../api/types'
import { useLang } from '../i18n/LangContext'

interface GazettePdfViewerProps {
  evidenceList: Evidence[]
  selectedIndex: number
  onSelectIndex: (index: number) => void
}

export function GazettePdfViewer({ evidenceList, selectedIndex, onSelectIndex }: GazettePdfViewerProps) {
  const { lang } = useLang()
  const [viewMode, setViewMode] = useState<'pdf' | 'text'>('pdf')

  if (!evidenceList || evidenceList.length === 0) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-400">
        <span className="text-3xl mb-2">📜</span>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {lang === 'hi' ? 'राजपत्र प्रमाण उपलब्ध नहीं' : 'Gazette Evidence Panel'}
        </p>
        <p className="mt-1 text-xs text-slate-400 max-w-xs">
          {lang === 'hi'
            ? 'प्रश्न पूछने पर संबंधित आधिकारिक राजपत्र (Gazette PDF) का पृष्ठ यहाँ लाइव दिखेगा।'
            : 'Ask a question to inspect the official MP Bhumi Vikas Rules gazette page live here.'}
        </p>
      </div>
    )
  }

  const current = evidenceList[selectedIndex] || evidenceList[0]
  const pageNumber = current.page || current.page_start || 1

  return (
    <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 text-xs font-black ring-1 ring-indigo-200">
            PDF
          </span>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              {lang === 'hi' ? 'आधिकारिक राजपत्र प्रमाण (Gazette Inspector)' : 'Official Gazette Inspector'}
            </h3>
            <p className="text-[10px] text-slate-400">
              MP Bhumi Vikas Rules, 2012 (Consolidated 2025)
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode('pdf')}
            className={`rounded-md px-2.5 py-1 text-[11px] transition ${
              viewMode === 'pdf'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'hi' ? 'लाइव PDF' : 'Live PDF'}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('text')}
            className={`rounded-md px-2.5 py-1 text-[11px] transition ${
              viewMode === 'text'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'hi' ? 'उद्धरण' : 'Quote'}
          </button>
        </div>
      </div>

      {/* Evidence Tab Pills (if multiple citations) */}
      {evidenceList.length > 1 && (
        <div className="flex flex-wrap gap-1.5 py-3 border-b border-slate-100">
          {evidenceList.map((ev, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                selectedIndex === idx
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Rule {ev.clause || ev.rule} (Page {ev.page || ev.page_start})
            </button>
          ))}
        </div>
      )}

      {/* Citation Metadata Header */}
      <div className="flex items-center justify-between py-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-extrabold text-amber-900 border border-amber-200">
            Rule {current.clause || current.rule}
          </span>
          <span className="font-bold text-slate-800 truncate max-w-xs">
            {current.title || 'Official Provision'}
          </span>
        </div>

        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-[11px] font-bold text-slate-700">
          Page {pageNumber}
        </span>
      </div>

      {/* Main Content: Live PDF Iframe OR Highlighted Text */}
      <div className="relative my-2 flex-1 min-h-[480px]">
        {viewMode === 'pdf' ? (
          <div className="relative h-full min-h-[480px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner">
            <iframe
              src={`${current.pdf_url || `/pdf/en.pdf#page=${pageNumber}`}`}
              className="h-full min-h-[480px] w-full border-0"
              title={`Gazette Page ${pageNumber}`}
            />
          </div>
        ) : (
          <div className="flex h-full min-h-[480px] flex-col justify-between rounded-2xl border border-slate-200 bg-amber-50/20 p-5 shadow-inner">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                <span>📑</span>
                <span>{lang === 'hi' ? 'राजपत्र का मूल उद्धरण (Verbatim Quote)' : 'Verbatim Gazette Excerpt'}</span>
              </div>

              <blockquote className="rounded-2xl border-l-4 border-indigo-600 bg-white p-5 text-sm leading-relaxed text-slate-800 shadow-xs">
                “{current.quote}”
              </blockquote>

              <div className="space-y-1 rounded-xl bg-white/80 p-3.5 text-xs text-slate-600 border border-slate-200/60 font-mono">
                <div className="flex justify-between">
                  <span>Source Document:</span>
                  <span className="font-bold text-slate-800">MP_Bhumi_Vikas_Rules_2012_EN.pdf</span>
                </div>
                <div className="flex justify-between">
                  <span>Gazette Page:</span>
                  <span className="font-bold text-slate-800">{pageNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quote Verification:</span>
                  <span className={current.quote_verified ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                    {current.quote_verified ? '✓ Verified in Rulebook' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/80 text-[11px] text-slate-500">
              Official MP Bhumi Vikas Rules consolidated to 6 March 2025.
            </div>
          </div>
        )}
      </div>

      {/* Footer with External Link */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <span className="text-[11px] font-medium text-slate-400">
          Official Gazette Reference
        </span>
        <a
          href={current.pdf_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 transition"
        >
          <span>{lang === 'hi' ? 'पूरा PDF अलग विंडो में खोलें' : 'Open PDF in Full Window'}</span>
          <span>↗</span>
        </a>
      </div>
    </div>
  )
}
