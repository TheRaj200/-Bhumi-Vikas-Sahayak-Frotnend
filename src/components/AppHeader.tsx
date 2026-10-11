import { useState } from 'react'
import { getApiBase, setApiBase, USE_MOCKS } from '../api/client'
import { useLang } from '../i18n/LangContext'
import type { StringKey } from '../i18n/strings'
import { hrefFor, type Route } from '../lib/router'
import { MpGovLogo } from './MpGovLogo'

const NAV: { route: Route; key: StringKey; match: Route['page'][]; label_hi: string }[] = [
  { route: { page: 'ask' }, key: 'nav_ask', match: ['ask'], label_hi: 'नियम पूछें' },
  { route: { page: 'cases' }, key: 'nav_cases', match: ['cases', 'case', 'report'], label_hi: 'केस समीक्षा' },
  { route: { page: 'rule-lab' }, key: 'nav_rule_lab', match: ['rule-lab', 'rule'], label_hi: 'नियम' },
  { route: { page: 'upload' }, key: 'nav_upload', match: ['upload'], label_hi: 'राजपत्र अपलोड' },
]

interface AppHeaderProps {
  route: Route
}

export function AppHeader({ route }: AppHeaderProps) {
  const { lang, setLang, t } = useLang()
  const currentApiBase = getApiBase()
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  const [customUrl, setCustomUrl] = useState(currentApiBase || '')
  const [editingBackend, setEditingBackend] = useState(false)

  return (
    <header className="no-print sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Live Backend connector banner for Vercel / Cloud deployments without configured URL */}
      {(!isLocal && !currentApiBase) || editingBackend ? (
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2 text-white text-xs font-semibold shadow-inner">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🔗</span>
              <span>
                {lang === 'hi'
                  ? 'लाइव बैकएंड कनेक्ट करें: अपना Render URL यहाँ दर्ज करें (उदा. https://your-backend.onrender.com)'
                  : 'Connect Live Backend: Enter your Render server URL (e.g. https://your-backend.onrender.com)'}
              </span>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (customUrl.trim()) setApiBase(customUrl.trim())
              }}
              className="flex items-center gap-2"
            >
              <input
                type="url"
                required
                placeholder="https://...onrender.com"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="rounded-lg bg-white px-3 py-1 text-xs text-slate-900 border-0 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-3.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
              >
                {lang === 'hi' ? 'कनेक्ट करें' : 'Connect'}
              </button>
              {editingBackend && (
                <button
                  type="button"
                  onClick={() => setEditingBackend(false)}
                  className="text-xs text-white/80 hover:text-white underline ml-1"
                >
                  ✕
                </button>
              )}
            </form>
          </div>
        </div>
      ) : null}

      {USE_MOCKS && (
        <div className="bg-amber-600 px-4 py-0.5 text-center text-xs font-bold tracking-wide text-white">
          ⚠️ {t('mock_banner')}
        </div>
      )}

      {/* Official Government of India & MP Tricolor Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        {/* Left: Official MP Government & Portal Identity */}
        <a href="#/ask" className="flex items-center gap-3 group shrink-0">
          <MpGovLogo className="h-11 w-11 drop-shadow-xs transition-transform group-hover:scale-105" />
          <div className="border-l border-slate-200 pl-3">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-indigo-900 transition-colors">
                {lang === 'hi' ? 'भूमि विकास सहायक' : 'Bhumi Vikas Sahayak'}
              </span>
              <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-extrabold text-red-800 border border-red-200 uppercase tracking-wide">
                BMC Bhopal
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-600 leading-tight">
              {lang === 'hi' ? 'भोपाल नगर निगम • मध्य प्रदेश शासन' : 'Bhopal Municipal Corporation • Govt of MP'}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              {lang === 'hi' ? 'भवन अनुज्ञा व प्लान समीक्षा पटल' : 'Building Permission & Plan Review Desk'}
            </p>
          </div>
        </a>

        {/* Center: Clean Text-Only Navigation Buttons */}
        <nav className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80 shadow-2xs" aria-label="Main">
          {NAV.map((item) => {
            const active = item.match.includes(route.page)
            return (
              <a
                key={item.key}
                href={hrefFor(item.route)}
                aria-current={active ? 'page' : undefined}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all duration-150 ${
                  active
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                }`}
              >
                {lang === 'hi' ? item.label_hi : t(item.key)}
              </a>
            )
          })}
        </nav>

        {/* Right: Language Toggle Only */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setLang('hi')}
            className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
              lang === 'hi'
                ? 'bg-indigo-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            हिंदी
          </button>
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
              lang === 'en'
                ? 'bg-indigo-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  )
}
