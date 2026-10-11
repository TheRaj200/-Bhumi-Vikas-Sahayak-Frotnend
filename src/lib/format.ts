import type { Lang, Unit } from '../api/types'

// Formatting only. Never compute, round differently or change values from the backend.

const UNIT_LABEL: Record<Unit, { en: string; hi: string }> = {
  m: { en: 'm', hi: 'मी.' },
  sqm: { en: 'sq m', hi: 'वर्ग मी.' },
  ratio: { en: '', hi: '' },
  INR: { en: '', hi: '' },
  years: { en: 'years', hi: 'वर्ष' },
  date: { en: '', hi: '' },
  count: { en: '', hi: '' },
  hectare: { en: 'ha', hi: 'हेक्टेयर' },
  percent: { en: '%', hi: '%' },
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 4 }).format(value)
}

export function formatInr(value: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value)
}

export function formatValue(value: number | string | null | undefined, unit: Unit | null, lang: Lang): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'string') return value
  if (unit === 'INR') return formatInr(value)
  const label = unit ? UNIT_LABEL[unit][lang] : ''
  if (unit === 'percent') return `${formatNumber(value)}%`
  return label ? `${formatNumber(value)} ${label}` : formatNumber(value)
}

export function formatDateTime(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}
