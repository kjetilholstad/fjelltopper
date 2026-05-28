'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { PlannerPanel } from './PlannerPanel'
import { PlannerProfile } from './PlannerProfile'
import { calcLeg, CreditExhaustedError } from '@/lib/plannerLegs'
import { useCollection } from '@/context/CollectionContext'
import type { Waypoint, LegStats } from '@/types/planner'
import type { Peak } from '@/types'

const STORAGE_KEY = 'fjelltopper-plan'

const PlannerMap = dynamic(
  () => import('./PlannerMap').then(m => m.PlannerMap),
  { ssr: false }
)

type LayerKey = 'topo' | 'topo2'

function loadState(): { waypoints: Waypoint[]; minHeight: string; minPF: string; activeLayer: LayerKey } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveState(waypoints: Waypoint[], minHeight: string, minPF: string, activeLayer: LayerKey) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ waypoints, minHeight, minPF, activeLayer }))
  } catch {}
}

interface PlannerShellProps {
  peaks: Peak[]
}

export function PlannerShell({ peaks }: PlannerShellProps) {
  const { activeCollection } = useCollection()
  const isVerden = activeCollection?.slug === 'verden'
  const skipElevation = isVerden

  const [waypoints, setWaypoints]             = useState<Waypoint[]>([])
  const [legs, setLegs]                       = useState<(LegStats | null)[]>([])
  const [activeLayer, setActiveLayer]         = useState<LayerKey>('topo')
  const [minHeight, setMinHeight]             = useState('0')
  const [minPF, setMinPF]                     = useState('0')
  const [loading, setLoading]                 = useState(false)
  const [creditExhausted, setCreditExhausted] = useState(false)
  const [snapFailed, setSnapFailed]           = useState(false)
  const [hydrated, setHydrated]               = useState(false)
  const [profileExpanded, setProfileExpanded] = useState(false)
  const batchRef                              = useRef(0)
  const abortRef                              = useRef<AbortController | null>(null)
  const moveDebounceRef                       = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Restore from localStorage
  useEffect(() => {
    const saved = loadState()
    if (saved) {
      setWaypoints(saved.waypoints)
      if (saved.minHeight) setMinHeight(saved.minHeight)
      if (saved.minPF) setMinPF(saved.minPF)
      if (saved.activeLayer) setActiveLayer(saved.activeLayer)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (isVerden) setActiveLayer('topo2')
  }, [isVerden, hydrated])

  // Recalculate legs when waypoints change — each leg uses its own waypoints[i].snapToNext
  useEffect(() => {
    if (!hydrated) return
    saveState(waypoints, minHeight, minPF, activeLayer)

    if (waypoints.length < 2) {
      setLegs([])
      setLoading(false)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const batchId = ++batchRef.current
    setLegs(Array(waypoints.length - 1).fill(null))
    setLoading(true)
    setSnapFailed(false)
    setCreditExhausted(false)

    Promise.all(
      waypoints.slice(1).map(async (to, i) => {
        const useSnap = waypoints[i].snapToNext ?? false
        try {
          return await calcLeg(waypoints[i], to, useSnap, controller.signal, skipElevation)
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return null
          if (err instanceof CreditExhaustedError) {
            setCreditExhausted(true)
            try { return await calcLeg(waypoints[i], to, false, undefined, skipElevation) } catch { return null }
          }
          setSnapFailed(true)
          return null
        }
      })
    ).then(results => {
      if (batchRef.current === batchId) {
        setLegs(results)
        setLoading(false)
        const anyFellBack = results.some((leg, i) =>
          leg !== null && !leg.snapped && (waypoints[i]?.snapToNext ?? false)
        )
        if (anyFellBack) setSnapFailed(true)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waypoints, hydrated])

  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

  useEffect(() => {
    return () => {
      if (moveDebounceRef.current) clearTimeout(moveDebounceRef.current)
    }
  }, [])

  // Save filter/layer changes without recalculating legs
  useEffect(() => {
    if (!hydrated) return
    saveState(waypoints, minHeight, minPF, activeLayer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minHeight, minPF, activeLayer])

  const addWaypoint = useCallback((lat: number, lng: number, label?: string) => {
    setWaypoints(prev => [...prev, { id: crypto.randomUUID(), lat, lng, label, snapToNext: false }])
  }, [])

  const moveWaypointRaw = useCallback((id: string, lat: number, lng: number) => {
    setWaypoints(prev => prev.map(wp => wp.id === id ? { ...wp, lat, lng } : wp))
  }, [])

  const moveWaypoint = useCallback((id: string, lat: number, lng: number) => {
    if (moveDebounceRef.current) clearTimeout(moveDebounceRef.current)
    moveDebounceRef.current = setTimeout(() => moveWaypointRaw(id, lat, lng), 300)
  }, [moveWaypointRaw])

  const removeWaypoint = useCallback((id: string) => {
    setWaypoints(prev => prev.filter(wp => wp.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    abortRef.current?.abort()
    batchRef.current++
    setWaypoints([])
    setLegs([])
    setLoading(false)
    setCreditExhausted(false)
  }, [])

  const moveUp = useCallback((index: number) => {
    setWaypoints(prev => {
      if (index === 0) return prev
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }, [])

  const moveDown = useCallback((index: number) => {
    setWaypoints(prev => {
      if (index >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }, [])

  const toggleLegSnap = useCallback((waypointIndex: number) => {
    setWaypoints(prev => prev.map((wp, i) =>
      i === waypointIndex ? { ...wp, snapToNext: !(wp.snapToNext ?? false) } : wp
    ))
  }, [])

  const visiblePeaks = useMemo(() =>
    peaks.filter(p => {
      if (p.lat == null || p.lng == null) return false
      if (p.height < parseInt(minHeight, 10)) return false
      const minP = parseInt(minPF, 10)
      if (minP > 0 && (p.primary_factor == null || p.primary_factor < minP)) return false
      return true
    }),
    [peaks, minHeight, minPF]
  )

  const collectionBounds = useMemo<[[number, number], [number, number]] | null>(() => {
    const valid = peaks.filter(p => p.lat != null && p.lng != null)
    if (valid.length === 0) return null
    const lats = valid.map(p => p.lat!)
    const lngs = valid.map(p => p.lng!)
    return [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]]
  }, [peaks])

  const hasProfile = useMemo(
    () => legs.some(l => l !== null && l.elevationPoints.length >= 2),
    [legs]
  )

  const totalTime = useMemo(() => {
    const sum = { naismith: 0, toblerStd: 0, toblerCal: 0 }
    for (const leg of legs) {
      if (!leg) continue
      sum.naismith  += leg.timeEstimates.naismith
      sum.toblerStd += leg.timeEstimates.toblerStd
      sum.toblerCal += leg.timeEstimates.toblerCal
    }
    return sum
  }, [legs])

  const waypointLabels = useMemo(
    () => waypoints.map((wp, i) => wp.label ?? `Punkt ${i + 1}`),
    [waypoints]
  )

  if (!hydrated) return null

  return (
    <div className="flex" style={{ height: 'calc(100vh - 64px)' }}>
      <PlannerPanel
        waypoints={waypoints}
        legs={legs}
        totalTime={totalTime}
        activeLayer={activeLayer}
        minHeight={minHeight}
        minPF={minPF}
        loading={loading}
        peakCount={visiblePeaks.length}
        totalPeakCount={peaks.length}
        onLayerChange={setActiveLayer}
        onMinHeightChange={setMinHeight}
        onMinPFChange={setMinPF}
        onRemoveWaypoint={removeWaypoint}
        onClearAll={clearAll}
        onMoveUp={moveUp}
        onMoveDown={moveDown}
        onToggleLegSnap={toggleLegSnap}
        snapFailed={snapFailed}
        isVerden={isVerden}
        mobileProfile={hasProfile ? (
          <PlannerProfile
            legs={legs}
            waypointLabels={waypointLabels}
            peaks={visiblePeaks}
            expanded={profileExpanded}
            onExpandChange={setProfileExpanded}
          />
        ) : undefined}
      />

      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <div className="flex-1 min-h-0">
          <PlannerMap
            waypoints={waypoints}
            legs={legs}
            peaks={visiblePeaks}
            activeLayer={activeLayer}
            collectionBounds={collectionBounds}
            onAddWaypoint={addWaypoint}
            onMoveWaypoint={moveWaypoint}
            onRemoveWaypoint={removeWaypoint}
          />
        </div>
        {hasProfile && (
          <div className="hidden sm:block shrink-0">
            <PlannerProfile
              legs={legs}
              waypointLabels={waypointLabels}
              peaks={visiblePeaks}
              expanded={profileExpanded}
              onExpandChange={setProfileExpanded}
            />
          </div>
        )}
      </div>
    </div>
  )
}
