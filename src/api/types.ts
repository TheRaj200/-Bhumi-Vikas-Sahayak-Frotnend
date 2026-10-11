// Types = docs/API_CONTRACT.md v2.0. Keep identical. Do not "adapt" to a different backend shape.

export type Lang = 'en' | 'hi'

export interface AmendmentWarning {
  id: string
  rule: string
  date: string
  message_en: string
  message_hi: string
  source_url: string
  source_type: 'official' | 'secondary'
  verified: boolean
}

export interface VersionInfo {
  rules_source: string
  consolidated_to: string
  amendment_warnings: AmendmentWarning[]
}

export interface Evidence {
  rule: string
  parent_rule: string
  title: string
  part: string
  page_start: number
  page_end: number
  page: number | null
  clause: string | null
  quote: string
  quote_verified: boolean
  pdf_url: string
  source_version: string
}

export type CheckStatus = 'pass' | 'potential_issue' | 'needs_information' | 'manual_review' | 'calculated' | 'reference'

export type QuestionStatus = 'answered' | 'not_found' | 'needs_information' | 'manual_review' | 'evidence_only'

export type BuildingType =
  | 'residential'
  | 'commercial'
  | 'shop_cum_residence'
  | 'public_semi_public'
  | 'industrial'
  | 'farm_house'
  | 'agricultural_tourist_facility'

export type LandUseZone =
  | 'residential'
  | 'commercial'
  | 'public_semi_public'
  | 'industrial'
  | 'agricultural'
  | 'recreational'
  | 'transportation'

export type CommercialCategory =
  | 'city_centre'
  | 'sub_city_centre'
  | 'community_centre'
  | 'local_shopping_centre'
  | 'convenience_shopping_centre'

export interface ProposedBuilding {
  building_height_m?: number | null
  floors?: number | null
  footprint_width_m?: number | null
  footprint_depth_m?: number | null
  front_setback_m?: number | null
  rear_setback_m?: number | null
  side_setback_left_m?: number | null
  side_setback_right_m?: number | null
  total_built_up_area_sqm?: number | null
  entrance_width_m?: number | null
  has_lift?: boolean | null
  live_trees_count?: number | null
  gift_shop_area_sqm?: number | null
}

export interface CaseInputs {
  plot_area_sqm?: number | null
  plot_width_m?: number | null
  plot_depth_m?: number | null
  road_width_m?: number | null
  road_facing_side?: 'north' | 'south' | 'east' | 'west' | null
  additional_road_widths_m?: number[]
  land_use_zone?: LandUseZone | null
  building_type?: BuildingType | null
  building_form?: 'detached' | 'semi_detached' | 'row' | null
  commercial_category?: CommercialCategory | null
  planning_area_population?: 'more_than_10_lakh' | '5_to_10_lakh' | 'less_than_5_lakh' | null
  application_type?: 'building_permission' | 'development_permission' | null
  in_existing_developed_area?: boolean | null
  near_aerodrome?: boolean | null
  proposed?: ProposedBuilding
  electric_line?: {
    present?: boolean | null
    voltage_class?: 'low_medium_or_service' | 'high_upto_33kv' | 'extra_high_above_33kv' | null
    vertical_clearance_m?: number | null
    horizontal_clearance_m?: number | null
  }
  permission?: {
    type?: 'development' | 'building' | null
    granted_on?: string | null
    execution_started?: boolean | null
    as_of?: string | null
  }
}

export interface InputIssue {
  field: string
  severity: 'warning' | 'error'
  code: 'inconsistent' | 'out_of_range' | 'unit_suspect'
  message_en: string
  message_hi: string
}

export interface MissingInput {
  field: string
  label_en: string
  label_hi: string
  question_en: string
  question_hi: string
  needed_by: string[]
}

export interface NextAction {
  action_id: string
  type: 'provide_input' | 'fix_input' | 'verify_zone' | 'revise_dimension' | 'human_review' | 'check_amendment' | 'verify_rule'
  priority: 1 | 2 | 3
  message_en: string
  message_hi: string
  field?: string
  rule_id?: string
}

export type ManualReason =
  | 'rule_not_verified'
  | 'tests_failing'
  | 'exception_may_apply'
  | 'outside_table_range'
  | 'ambiguous'
  | 'amendment_may_apply'
  | 'conflict'
  | 'development_plan_may_override'
  | 'inconsistent_input'

export type Unit = 'm' | 'sqm' | 'ratio' | 'INR' | 'years' | 'date' | 'count' | 'hectare' | 'percent'

export type OverlayEdge = 'front' | 'rear' | 'left' | 'right' | 'sides' | 'sides_rear' | 'all'

export interface Finding {
  finding_id: string
  rule_id: string
  rule_ref: string
  rule_version: number
  check_key: string
  kind: 'check' | 'calculation' | 'reference'
  title_en: string
  title_hi: string
  status: CheckStatus
  entered_value: number | null
  required_value: number | null
  comparator: 'gte' | 'lte' | 'eq' | null
  difference: number | null
  unit: Unit | null
  calculated_value?: number | string | null
  calculation: { formula_en: string; steps: string[] } | null
  explanation_en: string
  explanation_hi: string
  missing_inputs: string[]
  manual_reasons: ManualReason[]
  notes_en: string[]
  notes_hi: string[]
  evidence: Evidence[]
  verification: { status: 'verified' | 'unverified' | 'rejected'; verified_by: string | null; verified_on: string | null }
  overlay: { edge: OverlayEdge; required_m: number | null; entered_m: number | null } | null
}

export interface ComplianceResult {
  check_run_id: string | null
  application_id: string | null
  run_at: string
  engine_version: string
  source_version: string
  inputs: CaseInputs
  rules_evaluated: { rule_id: string; rule_ref: string; version: number; enabled_for_checks: boolean; applicable: boolean }[]
  input_issues: InputIssue[]
  missing_inputs: MissingInput[]
  findings: Finding[]
  summary: Record<CheckStatus, number>
  next_actions: NextAction[]
  version: VersionInfo
  disclaimer: string
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'RULE_NOT_FOUND'
  | 'APPLICATION_NOT_FOUND'
  | 'ENCODED_RULE_NOT_FOUND'
  | 'NO_EVAL'
  | 'CHECK_REQUIRED'
  | 'TESTS_FAILING'
  | 'DB_UNAVAILABLE'
  | 'LLM_UNAVAILABLE'
  | 'NOT_IMPLEMENTED'
  | 'INTERNAL'

export interface ApiErrorBody {
  error: { code: ApiErrorCode; message: string; details?: { field: string; message: string }[] }
}

// ---------- endpoint responses ----------

export interface HealthResponse {
  ok: true
  contract_version: string
  rules_loaded: number
  rules_source: 'mongo' | 'jsonl'
  encoded_rules_loaded: number
  db: 'connected' | 'disconnected' | 'not_configured'
  llm: 'configured' | 'missing_key'
}

export interface StatusMeta {
  key: CheckStatus | QuestionStatus
  label_en: string
  label_hi: string
  description_en: string
  description_hi: string
}

export interface MetaResponse {
  app_name: 'NiyamSetu'
  contract_version: string
  version: VersionInfo
  statuses: StatusMeta[]
  disclaimer_en: string
  disclaimer_hi: string
  not_found_en: string
  not_found_hi: string
}

export interface QuestionRequest {
  question: string
  lang?: Lang
  inputs?: CaseInputs
  application_id?: string
}

export interface QuestionResponse {
  question_id: string | null
  status: QuestionStatus
  lang: Lang
  answer: string
  evidence: Evidence[]
  clarifications: { field: string; question_en: string; question_hi: string }[]
  related_encoded_rules: { rule_id: string; rule_ref: string; title_en: string; title_hi: string; enabled_for_checks: boolean }[]
  version: VersionInfo
  disclaimer: string
  ai_used: boolean
  ai_error: string | null
  latency_ms: number
}

export interface SearchResult {
  rule: string
  title: string
  part: string
  page_start: number
  page_end: number
  score: number
  snippet: string
  snippet_page: number | null
  pdf_url: string
  encoded_rule_ids: string[]
}

export interface SearchResponse {
  query: string
  lang: Lang
  results: SearchResult[]
}

export interface RuleListItem {
  rule: string
  title: string
  part: string
  page_start: number
  page_end: number
  encoded_rule_ids: string[]
}

export interface RulesResponse {
  source_version: string
  rules: RuleListItem[]
}

export interface RuleDetail extends RuleListItem {
  parent_rule: string
  text: string
  pdf_url: string
  source_version: string
}

export interface ComplianceCheckRequest {
  inputs: CaseInputs
  application_id?: string
  rule_ids?: string[]
  lang?: Lang
}

export interface Application {
  id: string
  title: string
  is_sample: boolean
  inputs: CaseInputs
  latest_check_id: string | null
  created_at: string
  updated_at: string
}

export interface ApplicationSummary {
  id: string
  title: string
  is_sample: boolean
  updated_at: string
  latest_summary: Record<CheckStatus, number> | null
}

export interface ReviewEvent {
  id: string
  application_id: string | null
  type: 'note' | 'manual_decision' | 'rule_verification'
  rule_id: string | null
  finding_id: string | null
  decision: 'accept_finding' | 'needs_revision' | 'escalate' | null
  note: string
  reviewer_label: string
  created_at: string
}

export interface ApplicationDetailResponse {
  application: Application
  latest_check: ComplianceResult | null
  review_events: ReviewEvent[]
}

export interface ReviewEventRequest {
  type: 'note' | 'manual_decision'
  rule_id?: string
  finding_id?: string
  decision?: 'accept_finding' | 'needs_revision' | 'escalate'
  note: string
  reviewer_label: string
}

export interface EncodedRuleVerification {
  status: 'verified' | 'unverified' | 'rejected'
  verified_by: string | null
  verified_on: string | null
  checked_pdf_pages: number[]
  notes: string
}

export interface EncodedRuleSummary {
  rule_id: string
  rule_ref: string
  title_en: string
  title_hi: string
  topic: string
  version: number
  verification: EncodedRuleVerification
  test_status: 'not_run' | 'passing' | 'failing'
  tests_total: number
  tests_passed: number
  enabled_for_checks: boolean
  checks: { check_key: string; kind: 'check' | 'calculation' | 'reference'; title_en: string; title_hi: string }[]
}

export interface ReportResponse {
  report_id: string
  generated_at: string
  application: { id: string; title: string; inputs: CaseInputs }
  check: ComplianceResult
  sections: { verified_findings: Finding[]; unresolved_findings: Finding[]; references: Finding[] }
  missing_inputs: MissingInput[]
  unverified_rules: EncodedRuleSummary[]
  review_events: ReviewEvent[]
  next_actions: NextAction[]
  version: VersionInfo
  limitations_en: string[]
  limitations_hi: string[]
  disclaimer_en: string
  disclaimer_hi: string
}

export interface EncodedRulesResponse {
  source: 'mongo' | 'files'
  rules: EncodedRuleSummary[]
}

/** Full encoded rule record (docs/RULE_COMPILER.md) merged with summary fields. Checks kept loose on purpose. */
export interface EncodedRuleDetail extends EncodedRuleSummary {
  parent_rule: string
  jurisdiction: string
  source_document: string
  source_version: string
  related_rules: string[]
  interpretation_notes: string
  checks: (EncodedRuleSummary['checks'][number] & {
    source: { clause: string; page: number; quote: string }
    [key: string]: unknown
  })[]
}

export interface VerificationRequest {
  status: 'verified' | 'rejected' | 'unverified'
  verified_by: string
  checked_pdf_pages: number[]
  notes?: string
  confirm_checked_against_pdf: true
}

export type RuleTestExpectedStatus = CheckStatus | 'not_applicable'

export interface RuleTest {
  test_id: string
  rule_id: string
  check_key: string
  name: string
  kind: 'normal' | 'boundary' | 'missing_input' | 'exception'
  inputs: CaseInputs
  expected: { status: RuleTestExpectedStatus; required_value?: number | null; calculated_value?: number | string | null }
  created_by: 'seed' | 'user'
  last_run: {
    at: string
    pass: boolean
    actual_status: RuleTestExpectedStatus
    actual_required_value: number | null
    actual_calculated_value: number | string | null
    message: string
  } | null
}

export type RuleTestCreateRequest = Omit<RuleTest, 'test_id' | 'rule_id' | 'created_by' | 'last_run'>

export interface RuleTestRunResponse {
  rule_id: string
  run_at: string
  total: number
  passed: number
  failed: number
  results: RuleTest[]
  test_status: 'passing' | 'failing'
}

export interface RunAllTestsResponse {
  run_at: string
  total: number
  passed: number
  failed: number
  by_rule: { rule_id: string; total: number; passed: number; test_status: 'passing' | 'failing' | 'not_run' }[]
}

export interface EvalLatestResponse {
  run_at: string
  total: number
  passed: number
  answer_key_complete: boolean
  items: {
    id: number
    question: string
    lang: Lang
    expected_status: QuestionStatus | null
    expected_rules: string[]
    got_status: QuestionStatus | 'error'
    got_rules: string[]
    pass: boolean | null
    latency_ms: number
  }[]
}

export interface LookupTimingRequest {
  case_label: string
  mode: 'manual' | 'assisted'
  seconds: number
  correct: boolean | null
  tester_label: string
}

export interface LookupTiming extends LookupTimingRequest {
  id: string
  created_at: string
}

export interface LookupTimingSummary {
  manual: { count: number; median_seconds: number | null; correct_count: number }
  assisted: { count: number; median_seconds: number | null; correct_count: number }
  items: { id: string; case_label: string; mode: 'manual' | 'assisted'; seconds: number; correct: boolean | null; created_at: string }[]
}
