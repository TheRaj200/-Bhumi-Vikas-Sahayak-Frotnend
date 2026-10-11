import type { QuestionResponse } from '../api/types'
import { MpGovLogo } from './MpGovLogo'

interface CitizenSlipProps {
  question: string
  answerData: QuestionResponse
}

export function CitizenSlip({ question, answerData }: CitizenSlipProps) {
  const currentDate = new Date().toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const currentTime = new Date().toLocaleTimeString('hi-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="print-only mx-auto max-w-2xl bg-white p-8 text-black font-sans leading-normal">
      {/* Official Government Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
        <div className="flex items-center gap-4">
          <MpGovLogo className="h-16 w-16" />
          <div>
            <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
              भोपाल नगर निगम
            </h1>
            <p className="text-xs font-bold text-slate-700">
              BHOPAL MUNICIPAL CORPORATION • मध्य प्रदेश शासन
            </p>
            <p className="text-[11px] font-semibold text-slate-600">
              भवन अनुज्ञा व नियम परामर्श पटल (Building Permission Helpdesk)
            </p>
          </div>
        </div>

        <div className="text-right text-[11px] font-mono">
          <p className="font-bold text-slate-900">नागरिक पर्ची (CITIZEN SLIP)</p>
          <p className="text-slate-600">दिनांक: {currentDate}</p>
          <p className="text-slate-600">समय: {currentTime}</p>
        </div>
      </div>

      {/* Slip Title */}
      <div className="my-4 text-center">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 underline underline-offset-4">
          भवन विकास नियम प्रारंभिक परामर्श पर्ची
        </h2>
        <p className="mt-0.5 text-[10px] text-slate-500">
          (मध्य प्रदेश भूमि विकास नियम, 2012 — 6 मार्च 2025 तक समेकित)
        </p>
      </div>

      {/* Citizen Question Box */}
      <div className="mb-4 rounded-lg border border-slate-300 p-3 bg-slate-50">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
          नागरिक द्वारा पूछा गया प्रश्न (Citizen Query):
        </p>
        <p className="text-xs font-semibold text-slate-900">
          “{question}”
        </p>
      </div>

      {/* Official Rule Explanation */}
      <div className="mb-4 rounded-lg border-2 border-slate-800 p-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
          <span className="text-xs font-extrabold uppercase text-slate-900">
            आधिकारिक नियम समाधान (Rule Verdict & Explanation):
          </span>
          <span className="rounded bg-slate-200 px-2 py-0.5 font-mono text-[10px] font-bold">
            Status: {answerData.status.toUpperCase()}
          </span>
        </div>
        <p className="whitespace-pre-line text-xs leading-relaxed text-slate-900 font-medium">
          {answerData.answer}
        </p>
      </div>

      {/* Cited Rules and Evidence */}
      {answerData.evidence && answerData.evidence.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            उद्धृत आधिकारिक नियम व राजपत्र पृष्ठ (Gazette Citations):
          </p>
          <div className="space-y-2">
            {answerData.evidence.map((ev, idx) => (
              <div key={idx} className="rounded border border-slate-300 p-2.5 text-xs bg-white">
                <div className="flex justify-between font-bold text-slate-900 mb-1">
                  <span>नियम (Rule) {ev.clause || ev.rule}: {ev.title || 'Official Provision'}</span>
                  <span className="font-mono">राजपत्र पृष्ठ (Page): {ev.page || ev.page_start}</span>
                </div>
                <blockquote className="border-l-2 border-slate-400 pl-2 text-[11px] italic text-slate-700">
                  “{ev.quote}”
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legal Disclaimer */}
      <div className="mb-6 rounded border border-slate-300 p-2.5 text-[10px] leading-relaxed text-slate-600">
        <p className="font-bold text-slate-700 mb-0.5">वैधानिक सूचना (Legal Disclaimer):</p>
        <p>{answerData.disclaimer}</p>
      </div>

      {/* Official Signatures and Seal Box */}
      <div className="mt-8 pt-4 border-t border-slate-400 grid grid-cols-2 gap-8 text-center text-xs">
        <div>
          <div className="h-12 border-b border-dashed border-slate-400" />
          <p className="mt-1 font-bold text-slate-800">हस्ताक्षर काउंटर लिपिक</p>
          <p className="text-[10px] text-slate-500">Counter Clerk / Operator</p>
        </div>
        <div>
          <div className="h-12 border-b border-dashed border-slate-400 flex items-center justify-center">
            <span className="text-[10px] text-slate-400 uppercase">[ कार्यालय मुहर / SEAL ]</span>
          </div>
          <p className="mt-1 font-bold text-slate-800">कार्यालयीन मुहर</p>
          <p className="text-[10px] text-slate-500">Bhopal Municipal Corporation</p>
        </div>
      </div>
    </div>
  )
}
