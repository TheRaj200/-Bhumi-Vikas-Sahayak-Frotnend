// Mock responses (VITE_USE_MOCKS=true) so the UI can be built before the backend endpoints exist.
// Shapes follow docs/API_CONTRACT.md exactly. Values are illustrative only — the UI shows a MOCK banner.
import { ApiClientError } from './errors'
import type {
  ComplianceResult,
  EncodedRulesResponse,
  Evidence,
  HealthResponse,
  MetaResponse,
  QuestionResponse,
  VersionInfo,
} from './types'

const DISCLAIMER =
  'Preliminary check only. This points to the rules; it is not legal advice or official approval. The authorised officer decides.'

const version: VersionInfo = { rules_source: 'MP Bhumi Vikas Rules, 2012', consolidated_to: '2025-03-06', amendment_warnings: [] }

const evidence56: Evidence = {
  rule: '56',
  parent_rule: '56',
  title: 'Residential Buildings',
  part: 'Part V: General Building Requirements',
  page_start: 77,
  page_end: 80,
  page: 77,
  clause: '56(1)(a)',
  quote: '2. More than 9.0 meters and up to 12 meters 3.6 meters',
  quote_verified: true,
  pdf_url: '/pdf/en.pdf#page=77',
  source_version: '2025-03-06',
}

const health: HealthResponse = {
  ok: true,
  contract_version: '2.0',
  rules_loaded: 106,
  rules_source: 'jsonl',
  encoded_rules_loaded: 11,
  db: 'not_configured',
  llm: 'missing_key',
}

const meta: MetaResponse = {
  app_name: 'NiyamSetu',
  contract_version: '2.0',
  version,
  statuses: [],
  disclaimer_en: DISCLAIMER,
  disclaimer_hi: 'यह केवल प्रारंभिक जाँच है। यह नियमों का संदर्भ है, कानूनी सलाह या आधिकारिक स्वीकृति नहीं। अंतिम निर्णय अधिकृत अधिकारी का है।',
  not_found_en: 'Not found in the provided sources (MP Bhumi Vikas Rules 2012, consolidated to 6 Mar 2025).',
  not_found_hi: 'दिए गए स्रोतों में नहीं मिला (म.प्र. भूमि विकास नियम 2012, 6 मार्च 2025 तक संशोधित)।',
}

function questionMock(question: string): QuestionResponse {
  const outside = /tax|market rate|कर|बाज़ार/i.test(question)
  return {
    question_id: null,
    status: outside ? 'not_found' : 'answered',
    lang: /[\u0900-\u097F]/.test(question) ? 'hi' : 'en',
    answer: outside ? meta.not_found_en : '[MOCK] Rule 56(1)(a) says a street of more than 9 m and up to 12 m needs a front open space of 3.6 m.',
    evidence: outside ? [] : [evidence56],
    clarifications: [],
    related_encoded_rules: outside
      ? []
      : [{ rule_id: 'R56_RESIDENTIAL_OPEN_SPACES', rule_ref: '56', title_en: 'Residential open spaces', title_hi: 'आवासीय खुली जगह', enabled_for_checks: false }],
    version,
    disclaimer: DISCLAIMER,
    ai_used: false,
    ai_error: null,
    latency_ms: 420,
  }
}

const complianceMock: ComplianceResult = {
  check_run_id: null,
  application_id: null,
  run_at: '2026-10-11T10:30:00.000Z',
  engine_version: '1',
  source_version: '2025-03-06',
  inputs: {},
  rules_evaluated: [{ rule_id: 'R56_RESIDENTIAL_OPEN_SPACES', rule_ref: '56', version: 1, enabled_for_checks: false, applicable: true }],
  input_issues: [],
  missing_inputs: [],
  findings: [
    {
      finding_id: 'R56_RESIDENTIAL_OPEN_SPACES:front_open_space',
      rule_id: 'R56_RESIDENTIAL_OPEN_SPACES',
      rule_ref: '56',
      rule_version: 1,
      check_key: 'front_open_space',
      kind: 'check',
      title_en: 'Front open space',
      title_hi: 'सामने की खुली जगह',
      status: 'manual_review',
      entered_value: 3,
      required_value: null,
      comparator: 'gte',
      difference: null,
      unit: 'm',
      calculation: null,
      explanation_en: '[MOCK] Rule not verified yet — manual review required.',
      explanation_hi: '[MOCK] नियम अभी सत्यापित नहीं — मैनुअल समीक्षा आवश्यक।',
      missing_inputs: [],
      manual_reasons: ['rule_not_verified'],
      notes_en: [],
      notes_hi: [],
      evidence: [evidence56],
      verification: { status: 'unverified', verified_by: null, verified_on: null },
      overlay: { edge: 'front', required_m: null, entered_m: 3 },
    },
  ],
  summary: { pass: 0, potential_issue: 0, needs_information: 0, manual_review: 1, calculated: 0, reference: 0 },
  next_actions: [
    { action_id: 'verify-R56', type: 'verify_rule', priority: 3, message_en: '[MOCK] Ask the verifier to check Rule 56 in Rule Lab.', message_hi: '[MOCK] सत्यापनकर्ता से Rule Lab में नियम 56 जाँचने को कहें।', rule_id: 'R56_RESIDENTIAL_OPEN_SPACES' },
  ],
  version,
  disclaimer: DISCLAIMER,
}

const encodedRules: EncodedRulesResponse = {
  source: 'files',
  rules: [
    {
      rule_id: 'R56_RESIDENTIAL_OPEN_SPACES',
      rule_ref: '56',
      title_en: 'Residential buildings up to 12.5 m — exterior open spaces',
      title_hi: 'आवासीय भवन (12.5 मी. तक) — बाहरी खुली जगह',
      topic: 'setback',
      version: 1,
      verification: { status: 'unverified', verified_by: null, verified_on: null, checked_pdf_pages: [], notes: '' },
      test_status: 'not_run',
      tests_total: 25,
      tests_passed: 0,
      enabled_for_checks: false,
      checks: [{ check_key: 'front_open_space', kind: 'check', title_en: 'Front open space', title_hi: 'सामने की खुली जगह' }],
    },
  ],
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function mockRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  await delay(300)
  const route = `${method} ${path.split('?')[0]}`
  if (route === 'GET /api/health') return health as T
  if (route === 'GET /api/meta') return meta as T
  if (route === 'POST /api/questions') return questionMock(String((body as { question?: string })?.question ?? '')) as T
  if (route === 'POST /api/compliance/check') return complianceMock as T
  if (route === 'GET /api/encoded-rules') return encodedRules as T
  throw new ApiClientError(501, 'NOT_IMPLEMENTED', `No mock for ${route}. Add one in src/api/mocks.ts.`)
}
