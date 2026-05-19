'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { PlannerPanel } from './PlannerPanel'
import { PlannerProfile } from './PlannerProfile'
import { calcLeg, CreditExhaustedError } from '@/lib/plannerLegs'
import type { Waypoint, LegStats } from '@/types/planner'
import type { Peak } from '@/types'

const STORAGE_KEY = 'fjelltopper-plan'

const PlannerMap = dynamic(
  () => import('./PlannerMap').then(m => m.PlannerMap),
  { ssr: false }
)

function loadState(): { waypoints: Waypoint[]; snapEnabled: boolean; minHeight: string; minPF: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveState(waypoints: Waypoint[], snapEnabled: boolean, minHeight: string, minPF: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ waypoints, snapEnabled, minHeight, minPF }))
  } catch {}
}

interface PlannerShellProps {
  peaks: Peak[]
}

export function PlannerShell({ peaks }: PlannerShellProps) {
  const [waypoints, setWaypoints]       = useState<Waypoint[]>([])
  const [legs, setLegs]                 = useState<(LegStats | null)[]>([])
  const [snapEnabled, setSnapEnabled]   = useState(false)
  const [minHeight, setMinHeight]       = useState('0')
  const [minPF, setMinPF]               = useState('0')
  const [loading, setLoading]           = useState(false)
  const [creditExhausted, setCreditExhausted] = useState(false)
  const [hydrated, setHydrated]         = useState(false)
  const batchRef                        = useRef(0)

  // Restore from localStorage
  useEffect(() => {
    const saved = loadState()
    if (saved) {
      setWaypoints(saved.waypoints)
      setSnapEnabled(saved.snapEnabled)
      if (saved.minHeight) setMinHeight(saved.minHeight)
      if (saved.minPF) setMinPF(saved.minPF)
    }
    setHydrated(true)
  }, [])

  // Recalculate all legs when waypoints or snap changes
  useEffect(() => {
    if (!hydrated) return
    saveState(waypoints, snapEnabled, minHeight, minPF)

    if (waypoints.length < 2) {
      setLegs([])
      setLoading(false)
      return
    }

    const batchId = ++batchRef.current
    setLegs(Array(waypoints.length - 1).fill(null))
    setLoading(true)

    Promise.all(
      waypoints.slice(1).map(async (to, i) => {
        try {
          return await calcLeg(waypoints[i], to, snapEnabled)
        } catch (err) {
          if (err instanceof CreditExhaustedError) {
            setCreditExhausted(true)
            try { return await calcLeg(waypoints[i], to, false) } catch { return null }
          }
          return null
        }
      })
    ).then(results => {
      if (batchRef.current === batchId) {
        setLegs(results)
        setLoading(false)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waypoints, snapEnabled, hydrated])

  // Save filter changes to localStorage without recalculating legs
  useEffect(() => {
    if (!hydrated) return
    saveState(waypoints, snapEnabled, minHeight, minPF)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minHeight, minPF])

  const addWaypoint = useCallback((lat: number, lng: number, label?: string) => {
    setWaypoints(prev => [...prev, { id: crypto.randomUUID(), lat, lng, label }])
  }, [])

  const moveWaypoint = useCallback((id: string, lat: number, lng: number) => {
    setWaypoints(prev => prev.map(wp => wp.id === id ? { ...wp, lat, lng } : wp))
  }, [])

  const removeWaypoint = useCallback((id: string) => {
    setWaypoints(prev => prev.filter(wp => wp.id !== id))
  }, [])

  const clearAll = useCallback(() => {
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

  const toggleSnap = useCallback(() => {
    setCreditExhausted(false)
    setSnapEnabled(s => !s)
  }, [])

  const minH = parseInt(minHeight, 10)
  const minP = parseInt(minPF, 10)
  const visiblePeaks = peaks.filter(p =>
    p.lat != null && p.lng != null &&
    p.height >= minH &&
    (minP === 0 || (p.primary_factor != null && p.primary_factor >= minP))
  )

  const hasProfile = legs.some(l => l !== null && l.elevationPoints.length >= 2)
  const waypointLabels = waypoints.map((wp, i) => wp.label ?? `Punkt ${i + 1}`)

  if (!hydrated) return null

  return (
    <div className="flex" style={{ height: 'calc(100vh - 64px)' }}>
      <PlannerPanel
        waypoints={waypoints}
        legs={legs}
        snapEnabled={snapEnabled}
        minHeight={minHeight}
        minPF={minPF}
        loading={loading}
        creditExhausted={creditExhausted}
        peakCount={visiblePeaks.length}
        totalPeakCount={peaks.length}
        onSnapToggle={toggleSnap}
        onMinHeightChange={setMinHeight}
        onMinPFChange={setMinPF}
        onRemoveWaypoint={removeWaypoint}
        onClearAll={clearAll}
        onMoveUp={moveUp}
        onMoveDown={moveDown}
      />

      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <div className="flex-1 min-h-0">
          <PlannerMap
            waypoints={waypoints}
            legs={legs}
            peaks={visiblePeaks}
            snapEnabled={snapEnabled}
            onAddWaypoint={addWaypoint}
            onMoveWaypoint={moveWaypoint}
            onRemoveWaypoint={removeWaypoint}
          />
        </div>
        {hasProfile && (
          <div className="hidden sm:block shrink-0">
            <PlannerProfile legs={legs} waypointLabels={waypointLabels} />
          </div>
        )}
      </div>
    </div>
  )
}
