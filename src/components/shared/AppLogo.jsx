import { cn } from '@/lib/utils'

export default function AppLogo({ className, markClassName, wordmarkClassName, taglineClassName, showWordmark = true, tagline = false }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <LogoMark className={markClassName} />
      {showWordmark && (
        <div className="leading-none">
          <p className={cn('font-display font-bold text-slate-900 leading-none', wordmarkClassName)}>CoParent</p>
          {tagline && <p className={cn('text-xs text-muted-foreground mt-0.5', taglineClassName)}>Juntos pelos filhos</p>}
        </div>
      )}
    </div>
  )
}

export function LogoMark({ className }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="CoParent"
      className={cn('h-9 w-9 shrink-0', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="14" fill="url(#coparent-bg)" />
      <path
        d="M14.7 27.2c0-5.1 4.1-9.2 9.3-9.2s9.3 4.1 9.3 9.2"
        stroke="white"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M10.2 24.2c1.4-4.9 5.8-8.5 11.1-8.9"
        stroke="#DDF6FF"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M37.8 24.2c-1.4-4.9-5.8-8.5-11.1-8.9"
        stroke="#D9FBE8"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="15.5" cy="24.5" r="3.4" fill="#DDF6FF" />
      <circle cx="32.5" cy="24.5" r="3.4" fill="#D9FBE8" />
      <path
        d="M24 32.9l-1.1-1c-3.9-3.5-6.5-5.9-6.5-8.8 0-2.4 1.9-4.1 4.2-4.1 1.3 0 2.6.6 3.4 1.6.8-1 2.1-1.6 3.4-1.6 2.3 0 4.2 1.7 4.2 4.1 0 2.9-2.6 5.3-6.5 8.8l-1.1 1Z"
        fill="white"
      />
      <defs>
        <linearGradient id="coparent-bg" x1="6" y1="5" x2="43" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0E8FE7" />
          <stop offset="0.58" stopColor="#16A085" />
          <stop offset="1" stopColor="#52A85A" />
        </linearGradient>
      </defs>
    </svg>
  )
}
