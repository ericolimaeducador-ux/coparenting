import { cn } from '@/lib/utils'

export default function AppLogo({ className, markClassName, wordmarkClassName, taglineClassName, showWordmark = true, tagline = false }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <LogoMark className={markClassName} />
      {showWordmark && (
        <div className="leading-none">
          <p className={cn('font-display font-bold tracking-[0.08em] text-slate-900 leading-none', wordmarkClassName)}>COPARENTING</p>
          {tagline && <p className={cn('text-[10px] tracking-[0.22em] uppercase text-muted-foreground mt-1', taglineClassName)}>Seu foco compartilhado</p>}
        </div>
      )}
    </div>
  )
}

export function LogoMark({ className }) {
  return (
    <svg
      viewBox="0 0 400 300"
      role="img"
      aria-label="Coparenting"
      className={cn('h-9 w-12 shrink-0', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="50%" stopColor="#F9E076" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
      </defs>
      <path d="M80 180C80 140 100 110 130 110" stroke="#2D5A6E" strokeWidth="12" strokeLinecap="round" />
      <circle cx="85" cy="95" r="12" fill="#2D5A6E" />
      <path d="M320 180C320 140 300 110 270 110" stroke="#7DA68D" strokeWidth="12" strokeLinecap="round" />
      <circle cx="315" cy="95" r="12" fill="#7DA68D" />
      <circle cx="185" cy="145" r="8" fill="#D4AF37" />
      <circle cx="215" cy="145" r="8" fill="#D4AF37" />
      <path d="M170 190C175 160 195 160 200 190" stroke="#D4AF37" strokeWidth="8" strokeLinecap="round" />
      <path d="M200 190C205 160 225 160 230 190" stroke="#D4AF37" strokeWidth="8" strokeLinecap="round" />
      <path
        d="M100 130C150 130 180 80 200 80C220 80 250 130 300 130"
        stroke="url(#goldGradient)"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  )
}
