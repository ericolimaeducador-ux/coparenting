import { Badge } from '@/components/ui/misc'

const EVENT_CATEGORIES = {
  custody: { label: 'Custódia', color: 'default' },
  medical: { label: 'Médico', color: 'destructive' },
  vaccine: { label: 'Vacina', color: 'sage' },
  school: { label: 'Escola', color: 'warm' },
  activity: { label: 'Atividade', color: 'secondary' },
  leisure: { label: 'Lazer', color: 'secondary' },
  birthday: { label: 'Aniversário', color: 'warm' },
  holiday: { label: 'Feriado', color: 'outline' },
  vacation: { label: 'Férias', color: 'sage' },
  other: { label: 'Outro', color: 'outline' },
}

const EXPENSE_CATEGORIES = {
  food: { label: 'Alimentação', color: 'warm' },
  transport: { label: 'Transporte', color: 'default' },
  leisure: { label: 'Lazer', color: 'sage' },
  school: { label: 'Escola', color: 'default' },
  health: { label: 'Saúde', color: 'destructive' },
  clothing: { label: 'Vestuário', color: 'secondary' },
  activities: { label: 'Atividades', color: 'sage' },
  other: { label: 'Outro', color: 'outline' },
}

export function CategoryBadge({ category, type = 'event' }) {
  const map = type === 'expense' ? EXPENSE_CATEGORIES : EVENT_CATEGORIES
  const info = map[category] || { label: category, color: 'outline' }
  return <Badge variant={info.color}>{info.label}</Badge>
}

export { EVENT_CATEGORIES, EXPENSE_CATEGORIES }
