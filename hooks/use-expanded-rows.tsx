'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'servicios-table-expanded-rows'

export function useExpandedRows(initialExpanded: Set<string> = new Set()) {
  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded)
  const [isMounted, setIsMounted] = useState(false)

  // Cargar desde localStorage en el cliente
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setExpanded(new Set(JSON.parse(stored)))
      } catch {
        // Ignorar errores de parseo
      }
    }
    setIsMounted(true)
  }, [])

  // Guardar a localStorage cuando cambia
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(expanded)))
    }
  }, [expanded, isMounted])

  const toggleExpanded = useCallback((n_ot: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(n_ot)) {
        next.delete(n_ot)
      } else {
        next.add(n_ot)
      }
      return next
    })
  }, [])

  const expandAll = useCallback((n_ots: string[]) => {
    setExpanded((prev) => new Set([...prev, ...n_ots]))
  }, [])

  const collapseAll = useCallback(() => setExpanded(new Set()), [])

  const isExpanded = useCallback((n_ot: string) => expanded.has(n_ot), [expanded])

  return { expanded, toggleExpanded, expandAll, collapseAll, isExpanded, isMounted }
}
