import { cn } from '@/lib/utils'

const BRAND_ICON = '/brand/2for1-icon.png'

export default function AppLogo({
  className,
  markClassName,
  wordmarkClassName,
  taglineClassName,
  showWordmark = true,
  tagline = false,
  compact = false,
}) {
  const markSizeClass = markClassName || (compact ? 'h-8 w-8' : 'h-10 w-10')

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'shrink-0 overflow-hidden bg-white/95 ring-1 ring-black/5',
          compact ? 'rounded-xl p-1 shadow-sm' : 'rounded-2xl p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.10)]'
        )}
      >
        <img
          src={BRAND_ICON}
          alt="2for1"
          className={cn('block object-contain', markSizeClass)}
        />
      </div>
      {showWordmark && (
        <div className="leading-none">
          <p className={cn('font-display font-bold tracking-[0.08em] text-slate-900 leading-none', wordmarkClassName)}>2for1</p>
          {tagline && <p className={cn('text-[10px] tracking-[0.22em] uppercase text-muted-foreground mt-1', taglineClassName)}>Coparentalidade inteligente</p>}
        </div>
      )}
    </div>
  )
}
