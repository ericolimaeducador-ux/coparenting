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
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
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
