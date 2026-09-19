"use client"

import { useEffect, useState } from "react"

/**
 * Mantiene el orden de columnas sincronizado con localStorage.
 * Devuelve el orden actual y un setter compatible con TanStack Table.
 */
export function usePersistedColumnOrder(storageKey: string, defaultOrder: string[]) {
  const [columnOrder, setColumnOrder] = useState<string[]>(defaultOrder)
  const [hydrated, setHydrated] = useState(false)

  // Cargar desde localStorage al montar (evita mismatch de SSR).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as string[]
        // Conservar solo columnas válidas y agregar nuevas que no estuvieran guardadas.
        const valid = parsed.filter((id) => defaultOrder.includes(id))
        const missing = defaultOrder.filter((id) => !valid.includes(id))
        setColumnOrder([...valid, ...missing])
      }
    } catch {
      // Ignorar JSON corrupto y usar el orden por defecto.
    }
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  // Persistir cada vez que cambie el orden (luego de la hidratación).
  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(columnOrder))
    } catch {
      // Almacenamiento no disponible: continuar sin persistir.
    }
  }, [columnOrder, hydrated, storageKey])

  return [columnOrder, setColumnOrder] as const
}
