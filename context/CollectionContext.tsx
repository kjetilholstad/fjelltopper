'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Collection } from '@/types'

const STORAGE_KEY = 'fjelltopper_collection_slug'
const DEFAULT_SLUG = 'norges-2000m'

interface CollectionContextValue {
  collections: Collection[]
  activeCollection: Collection | null
  setActiveCollection: (c: Collection) => void
}

const CollectionContext = createContext<CollectionContextValue | null>(null)

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [activeCollection, setActiveCollectionState] = useState<Collection | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('collections')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (!data) return
        const mapped: Collection[] = data.map((row: any) => ({
          id: row.id,
          slug: row.slug,
          name: row.name,
          description: row.description ?? null,
          minHeight: row.min_height,
          minPrimaryFactor: row.min_primary_factor,
          nearestHigherMinHeight: row.nearest_higher_min_height,
          nearestHigherLabel: row.nearest_higher_label,
        }))
        setCollections(mapped)

        const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
        const slug = saved ?? DEFAULT_SLUG
        const active =
          mapped.find(c => c.slug === slug) ??
          mapped.find(c => c.slug === DEFAULT_SLUG) ??
          mapped[0] ??
          null
        setActiveCollectionState(active)
      })
  }, [])

  function setActiveCollection(c: Collection) {
    setActiveCollectionState(c)
    localStorage.setItem(STORAGE_KEY, c.slug)
  }

  return (
    <CollectionContext.Provider value={{ collections, activeCollection, setActiveCollection }}>
      {children}
    </CollectionContext.Provider>
  )
}

export function useCollection(): CollectionContextValue {
  const ctx = useContext(CollectionContext)
  if (!ctx) throw new Error('useCollection must be used within CollectionProvider')
  return ctx
}
