import { cn } from '@/lib/utils'

const BRAND_ICON = '/brand/2for1-icon.png'

export default function AppLogo({ className, markClassName, wordmarkClassName, taglineClassName, showWordmark = true, tagline = false }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="shrink-0 rounded-2xl bg-white p-1 shadow-sm">
        <img
          src={BRAND_ICON}
          alt="2for1"
          className={cn('block object-contain', markClassName || 'h-10 w-10')}
        />
      </div>
      {showWordmark && (
        <div className="leading-none">
          <p className={cn('font-display font-bold tracking-[0.08em] text-slate-900 leading-none', wordmarkClassName)}>2for1</p>
          {tagline && <p className={cn('text-[10px] tracking-[0.22em] uppercase text-muted-foreground mt-1', taglineClassName)}>Seu foco compartilhado</p>}
        </div>
      )}
    </div>
  )
}
