import { useEffect, useState } from 'react'

const key = 'appdate:my-apps:v1'

function restore(allowed: Set<string>): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && allowed.has(id)))] : []
  } catch { return [] }
}

export function useMyApps(allowed: Set<string>) {
  const [selectedAppIds, setSelected] = useState<string[]>(() => restore(allowed))
  const [storageMessage, setStorageMessage] = useState('')
  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key === key || event.key === null) setSelected(restore(allowed))
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [allowed])
  function onToggleApp(id: string) {
    if (!allowed.has(id)) return
    const next = selectedAppIds.includes(id) ? selectedAppIds.filter(item => item !== id) : [...selectedAppIds, id]
    setSelected(next)
    try {
      localStorage.setItem(key, JSON.stringify(next))
      setStorageMessage('')
    } catch { setStorageMessage('이 브라우저에서는 새로고침하면 선택이 사라져요.') }
  }
  return { selectedAppIds, onToggleApp, storageMessage }
}
