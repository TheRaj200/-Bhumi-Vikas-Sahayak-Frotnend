// The ONLY place that calls fetch. Relative URLs only (Vite proxies /api and /pdf to the backend).
import { ApiClientError } from './errors'
import { mockRequest } from './mocks'
import type {
  ApiErrorBody,
  Application,
  ApplicationDetailResponse,
  ApplicationSummary,
  CaseInputs,
  ComplianceCheckRequest,
  ComplianceResult,
  EncodedRuleDetail,
  EncodedRuleSummary,
  EncodedRulesResponse,
  EvalLatestResponse,
  HealthResponse,
  LookupTiming,
  LookupTimingRequest,
  LookupTimingSummary,
  MetaResponse,
  QuestionRequest,
  QuestionResponse,
  ReportResponse,
  ReviewEvent,
  ReviewEventRequest,
  RuleDetail,
  RulesResponse,
  RuleTest,
  RuleTestCreateRequest,
  RuleTestRunResponse,
  RunAllTestsResponse,
  SearchResponse,
  VerificationRequest,
} from './types'

export { ApiClientError }

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

export function getApiBase(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL
  if (envUrl) return envUrl.replace(/\/+$/, '')
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('niyamsetu_api_base')
    if (stored) return stored.replace(/\/+$/, '')
  }
  return ''
}

export function setApiBase(url: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('niyamsetu_api_base', url.trim().replace(/\/+$/, ''))
    window.location.reload()
  }
}

export const API_BASE = getApiBase()

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH'

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  if (USE_MOCKS) return mockRequest<T>(method, path, body)

  const base = getApiBase()
  const url = path.startsWith('http') ? path : `${base}${path}`

  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiClientError(0, 'NETWORK', 'Cannot reach the Bhumi Vikas Sahayak server.')
  }

  const data: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    const err = (data as ApiErrorBody | null)?.error
    throw new ApiClientError(res.status, err?.code ?? 'INTERNAL', err?.message ?? `Request failed (${res.status})`, err?.details)
  }
  return data as T
}

const enc = encodeURIComponent

// §1–2
export const getHealth = () => request<HealthResponse>('GET', '/api/health')
export const getMeta = () => request<MetaResponse>('GET', '/api/meta')

// §3–6
export const askQuestion = (body: QuestionRequest) => request<QuestionResponse>('POST', '/api/questions', body)
export const searchRules = (q: string, limit = 8) => request<SearchResponse>('GET', `/api/rules/search?q=${enc(q)}&limit=${limit}`)
export const getRules = () => request<RulesResponse>('GET', '/api/rules')
export const getRule = (rule: string) => request<RuleDetail>('GET', `/api/rules/${enc(rule)}`)

// §7
export const runComplianceCheck = (body: ComplianceCheckRequest) => request<ComplianceResult>('POST', '/api/compliance/check', body)

// §8–13
export const createApplication = (title: string, inputs: CaseInputs, isSample = false) =>
  request<Application>('POST', '/api/applications', { title, inputs, is_sample: isSample })
export const listApplications = () => request<{ applications: ApplicationSummary[] }>('GET', '/api/applications')
export const getApplication = (id: string) => request<ApplicationDetailResponse>('GET', `/api/applications/${enc(id)}`)
export const updateApplication = (id: string, body: { title?: string; inputs?: CaseInputs }) =>
  request<Application>('PUT', `/api/applications/${enc(id)}`, body)
export const addReviewEvent = (id: string, body: ReviewEventRequest) =>
  request<ReviewEvent>('POST', `/api/applications/${enc(id)}/review-events`, body)
export const getReport = (id: string) => request<ReportResponse>('GET', `/api/applications/${enc(id)}/report`)

// §14–20
export const listEncodedRules = () => request<EncodedRulesResponse>('GET', '/api/encoded-rules')
export const getEncodedRule = (ruleId: string) => request<{ rule: EncodedRuleDetail }>('GET', `/api/encoded-rules/${enc(ruleId)}`)
export const setVerification = (ruleId: string, body: VerificationRequest) =>
  request<{ rule: EncodedRuleSummary }>('PATCH', `/api/encoded-rules/${enc(ruleId)}/verification`, body)
export const getRuleTests = (ruleId: string) => request<{ rule_id: string; tests: RuleTest[] }>('GET', `/api/encoded-rules/${enc(ruleId)}/tests`)
export const addRuleTest = (ruleId: string, body: RuleTestCreateRequest) =>
  request<RuleTest>('POST', `/api/encoded-rules/${enc(ruleId)}/tests`, body)
export const runRuleTests = (ruleId: string) => request<RuleTestRunResponse>('POST', `/api/encoded-rules/${enc(ruleId)}/tests/run`)
export const runAllRuleTests = () => request<RunAllTestsResponse>('POST', '/api/rule-tests/run')

// §21–23
export const getEvalLatest = () => request<EvalLatestResponse>('GET', '/api/eval/latest')
export const addLookupTiming = (body: LookupTimingRequest) => request<LookupTiming>('POST', '/api/metrics/lookup-timings', body)
export const getLookupTimingSummary = () => request<LookupTimingSummary>('GET', '/api/metrics/lookup-timings/summary')

// §24
export const pdfUrl = (page?: number | null, lang: 'en' | 'hi' = 'en') => {
  const base = getApiBase()
  return page ? `${base}/pdf/${lang}.pdf#page=${page}` : `${base}/pdf/${lang}.pdf`
}
