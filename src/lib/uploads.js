import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const STORAGE_REF_PREFIX = 'storage:'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const DOCUMENT_TYPES = new Set([
  ...IMAGE_TYPES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

export function safeFileExtension(file) {
  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '')
  return ext || 'bin'
}

export function validateUploadFile(file, kind = 'document') {
  const allowedTypes = kind === 'image' ? IMAGE_TYPES : DOCUMENT_TYPES
  const maxSize = kind === 'image' ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE

  if (!allowedTypes.has(file.type)) {
    return kind === 'image'
      ? 'Envie uma imagem JPG, PNG, WEBP ou GIF.'
      : 'Envie JPG, PNG, WEBP, GIF, PDF, DOC ou DOCX.'
  }

  if (file.size > maxSize) {
    const sizeMb = Math.round(maxSize / 1024 / 1024)
    return `Arquivo deve ter no maximo ${sizeMb}MB.`
  }

  return null
}

export function createStorageReference(path) {
  return `${STORAGE_REF_PREFIX}${path}`
}

export function isStorageReference(value) {
  return typeof value === 'string' && value.startsWith(STORAGE_REF_PREFIX)
}

export function storagePathFromReference(value) {
  return isStorageReference(value) ? value.slice(STORAGE_REF_PREFIX.length) : null
}

export function useStorageUrl(value, expiresIn = 3600) {
  const [url, setUrl] = useState(isStorageReference(value) ? '' : value || '')

  useEffect(() => {
    let cancelled = false

    async function resolve() {
      if (!value) {
        setUrl('')
        return
      }

      const path = storagePathFromReference(value)
      if (!path) {
        setUrl(value)
        return
      }

      const { data, error } = await supabase.storage
        .from('uploads')
        .createSignedUrl(path, expiresIn)

      if (!cancelled) setUrl(error ? '' : data?.signedUrl || '')
    }

    resolve()
    return () => { cancelled = true }
  }, [expiresIn, value])

  return url
}
