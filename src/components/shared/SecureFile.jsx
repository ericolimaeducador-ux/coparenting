import { ExternalLink } from 'lucide-react'
import { useStorageUrl } from '@/lib/uploads'

export function SecureImage({ src, alt = '', className }) {
  const resolvedSrc = useStorageUrl(src)
  if (!resolvedSrc) return null
  return <img src={resolvedSrc} alt={alt} className={className} />
}

export function SecureFileLink({ href, children = 'Ver anexo', className }) {
  const resolvedHref = useStorageUrl(href)
  if (!resolvedHref) return null
  return (
    <a href={resolvedHref} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      {!children && <ExternalLink className="h-3.5 w-3.5" />}
    </a>
  )
}
