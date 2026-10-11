import { useState } from 'react'
import { createApplication, listApplications } from '../../api/client'
import { ErrorBox, Loader } from '../../components/Feedback'
import { useLang } from '../../i18n/LangContext'
import { useApi } from '../../lib/useApi'

const PRESET_SAMPLES = [
  {
    id: 'sample-a-200sqm-9m-road',
    title: 'Sample A: 200 sq m on 9 m road',
    desc: 'Standard residential plot, compliant front setback',
    tag: 'Residential',
    icon: '🏡',
  },
  {
    id: 'sample-b-missing-info',
    title: 'Sample B: 150 sq m, missing road width',
    desc: 'Triggers "needs_information" workflow',
    tag: 'Missing Info',
    icon: '⚠️',
  },
  {
    id: 'sample-c-tall-building',
    title: 'Sample C: 20 m height, 1600 sq m plot',
    desc: 'Triggers Rule 42 high-rise provisions & lifts',
    tag: 'High-Rise',
    icon: '🏢',
  },
  {
    id: 'sample-d-farm-house',
    title: 'Sample D: 0.5 ha agricultural land',
    desc: 'Triggers Rule 17 farm house norms & FAR 0.20',
    tag: 'Agriculture',
    icon: '🚜',
  },
]

export function CasesPage() {
  const { lang, t } = useLang()
  const { data, loading, error, reload } = useApi(listApplications)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [createError, setCreateError] = useState<unknown>(null)

  async function handleCreateCase(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return

    setCreating(true)
    setCreateError(null)
    try {
      const created = await createApplication(newTitle.trim(), {
        plot_area_sqm: 200,
        plot_width_m: 10,
        plot_depth_m: 20,
        road_width_m: 9,
        building_type: 'residential',
        proposed: {
          building_height_m: 9,
          floors: 2,
          front_setback_m: 3.0,
          rear_setback_m: 2.0,
          side_setback_left_m: 1.5,
          side_setback_right_m: 3.0,
        },
      })
      window.location.hash = `#/cases/${created.id}`
    } catch (err: unknown) {
      setCreateError(err)
    } finally {
      setCreating(false)
    }
  }

  const cases = data?.applications || []

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('nav_cases')}</h1>
            <span className="rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200">
              {cases.length} Applications
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {lang === 'hi'
              ? 'भवन अनुज्ञा आवेदन व नमूना केस: 2D प्लान पर नियमों की जाँच व समीक्षा करें।'
              : 'Review building permission applications against verified rules with 2D architectural plan overlay.'}
          </p>
        </div>

        {/* Quick check shortcut */}
        <a
          href="#/cases/sample-a-200sqm-9m-road"
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95"
        >
          <span>⚡</span>
          <span>{lang === 'hi' ? 'त्वरित नमूना खोलें (Sample A)' : 'Open Sample A (Quick Check)'}</span>
        </a>
      </div>

      {/* Visual Town Planning Desk Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 sm:p-8 text-white shadow-xl ring-1 ring-white/10">
        <div className="absolute inset-y-0 right-0 w-full sm:w-1/2 pointer-events-none">
          <img
            src="/images/plan_desk.jpg"
            alt="Town Planning Plan Review Examination Desk"
            className="h-full w-full object-cover object-center opacity-30 sm:opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
        </div>

        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-[11px] font-bold text-indigo-200 border border-indigo-400/30">
            <span>📐</span>
            <span>{lang === 'hi' ? 'नगर तथा ग्राम निवेश • नक्शा समीक्षा पटल' : 'Town & Country Planning • Plan Review Desk'}</span>
          </div>
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            {lang === 'hi' ? '2D आर्किटेक्चरल नक्शा व सेटबैक समीक्षा' : '2D Architectural Plan & Setback Review'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {lang === 'hi'
              ? 'प्लॉट चौड़ाई, गहराई, फ्रंट-रियर सेटबैक और रोड विड्थ के आधार पर MP Bhumi Vikas Rules, 2012 के तहत स्वचालित विसंगति जांच।'
              : 'Automated municipal regulatory check for plot boundaries, FAR, and setbacks against official Madhya Pradesh gazette rules.'}
          </p>
        </div>
      </div>

      {/* Preset Benchmark Sample Cases Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {lang === 'hi' ? 'आधिकारिक टेस्ट केस टेम्पलेट' : 'Official Review Cases (Click to inspect)'}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PRESET_SAMPLES.map((s) => (
            <a
              key={s.id}
              href={`#/cases/${s.id}`}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-indigo-300 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    {s.tag}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {s.title}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 leading-snug">
                  {s.desc}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>Inspect Plan</span>
                <span>→</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Create New Case Form */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          {lang === 'hi' ? 'नया आवेदन दर्ज करें' : 'Create Custom Building Application'}
        </h3>
        <form onSubmit={handleCreateCase} className="flex gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={
              lang === 'hi'
                ? 'नए केस का शीर्षक (उदा. House Plot 42, MP Nagar, Bhopal)'
                : 'New case title (e.g. Residential Plot 42, MP Nagar, Bhopal)'
            }
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            disabled={creating || !newTitle.trim()}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {creating ? (
              <span>Creating...</span>
            ) : (
              <>
                <span>+</span>
                <span>{lang === 'hi' ? 'केस जोड़ें' : 'Create Application'}</span>
              </>
            )}
          </button>
        </form>
      </div>

      {error !== null && <ErrorBox error={error} onRetry={reload} />}
      {createError !== null && <ErrorBox error={createError} />}

      {/* Case List */}
      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {lang === 'hi' ? 'सक्रिय आवेदन सूची' : 'Registered Building Applications'} ({cases.length})
          </h2>

          <div className="grid gap-3">
            {cases.map((c) => (
              <div
                key={c.id}
                className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-indigo-300 hover:shadow-md"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {c.title}
                    </span>
                    {c.is_sample && (
                      <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                        Official Sample
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                    <span>ID: {c.id}</span>
                    <span>•</span>
                    <span>Updated: {new Date(c.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={`#/cases/${c.id}/report`}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50"
                  >
                    📄 Report
                  </a>
                  <a
                    href={`#/cases/${c.id}`}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95"
                  >
                    <span>📐</span>
                    <span>Review 2D Plan</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
