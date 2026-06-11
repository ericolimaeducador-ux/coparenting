import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO, differenceInYears, differenceInMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date, pattern = 'dd/MM/yyyy') {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, pattern, { locale: ptBR })
  } catch {
    return '—'
  }
}

export function formatDateTime(date) {
  return formatDate(date, "dd/MM/yyyy 'às' HH:mm")
}

export function formatRelative(date) {
  if (!date) return ''
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(d, { addSuffix: true, locale: ptBR })
  } catch {
    return ''
  }
}

export function calculateAge(birthDate) {
  if (!birthDate) return null
  try {
    const d = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate
    const years = differenceInYears(new Date(), d)
    if (years < 1) {
      const months = differenceInMonths(new Date(), d)
      return `${months} ${months === 1 ? 'mês' : 'meses'}`
    }
    return `${years} ${years === 1 ? 'ano' : 'anos'}`
  } catch {
    return null
  }
}

export function formatCurrency(value) {
  if (value == null) return 'R$ —'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function generateToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const cryptoObj = globalThis.crypto
  if (cryptoObj?.getRandomValues) {
    const values = new Uint32Array(length)
    cryptoObj.getRandomValues(values)
    return Array.from(values, (v) => chars[v % chars.length]).join('')
  }

  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function safeInternalRedirect(value, fallback = '/home') {
  if (!value || typeof value !== 'string') return fallback
  if (!value.startsWith('/') || value.startsWith('//')) return fallback
  if (value.includes('\\') || value.includes('\n') || value.includes('\r')) return fallback

  const [path] = value.split(/[?#]/)
  const allowed = new Set([
    '/home',
    '/calendar',
    '/finances',
    '/chat',
    '/gifts',
    '/billing',
    '/settings',
    '/child-profile',
    '/vaccination',
  ])
  return allowed.has(path) ? value : fallback
}

export function safeHttpUrl(value) {
  if (!value || typeof value !== 'string') return ''
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) ? url.toString() : ''
  } catch {
    return ''
  }
}

export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
