'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, CheckCircle2, Mountain } from 'lucide-react'
import { logAscent } from '@/app/ascents/actions'

interface SuggestedPeak {
  id: string
  name: string
  height: number
  minDistanceM: number
}

interface GpxUploaderProps {
  ascendedIds: string[]
}

type Status = 'idle' | 'parsing' | 'loading' | 'done' | 'error'

export function GpxUploader({ ascendedIds }: GpxUploaderProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [suggestions, setSuggestions] = useState<SuggestedPeak[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [dates, setDates] = useState<Record<string, string>>({})
  const [localAscended, setLocalAscended] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const ascendedSet = new Set([...ascendedIds, ...Array.from(localAscended)])
  const today = new Date().toISOString().split('T')[0]

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.gpx')) {
      setErrorMsg('Filen må være en .gpx-fil')
      setStatus('error')
      return
    }

    setStatus('parsing')
    setErrorMsg(null)
    setSuggestions([])

    const text = await file.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(text, 'application/xml')
    const trkpts = Array.from(doc.querySelectorAll('trkpt'))

    if (trkpts.length === 0) {
      setErrorMsg('Ingen trackpoints funnet i GPX-filen.')
      setStatus('error')
      return
    }

    const trackpoints = trkpts
      .map(pt => ({
        lat: parseFloat(pt.getAttribute('lat') ?? '0'),
        lon: parseFloat(pt.getAttribute('lon') ?? '0'),
      }))
      .filter(p => p.lat !== 0 || p.lon !== 0)

    setStatus('loading')

    try {
      const res = await fetch('/api/gpx-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackpoints }),
      })
      if (!res.ok) throw new Error('Serverfeil')
      const json = await res.json()
      const found: SuggestedPeak[] = json.suggestions ?? []
      setSuggestions(found)
      const initialDates: Record<string, string> = {}
      for (const s of found) initialDates[s.id] = today
      setDates(initialDates)
      setStatus('done')
    } catch {
      setErrorMsg('Kunne ikke hente toppsuggesjoner. Prøv igjen.')
      setStatus('error')
    }
  }

  function handleLog(peakId: string) {
    const fd = new FormData()
    fd.append('peak_id', peakId)
    fd.append('date', dates[peakId] ?? today)
    startTransition(async () => {
      await logAscent(fd)
      setLocalAscended(prev => new Set([...Array.from(prev), peakId]))
      router.refresh()
    })
  }

  const busy = status === 'parsing' || status === 'loading'

  return (
    <div className="bg-white rounded-xl border border-border-warm shadow-sm p-5 mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-[#1A1A1A]">GPX-analyse</h2>
          <p className="text-xs text-text-warm mt-0.5">
            Last opp en GPX-tur for å se hvilke topper du var innom
          </p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="flex items-center gap-2 bg-forest text-white text-xs font-medium px-3 py-2 rounded-lg hover:opacity-90 transition-opacity shrink-0 disabled:opacity-50"
        >
          <Upload size={13} />
          {busy ? 'Analyserer…' : 'Last opp GPX-tur'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".gpx"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
      </div>

      {status === 'error' && errorMsg && (
        <p className="text-xs text-red-500 mt-3">{errorMsg}</p>
      )}

      {status === 'done' && suggestions.length === 0 && (
        <p className="text-xs text-text-warm mt-3">
          Ingen topper over 2000 moh funnet innenfor 300 m fra sporet.
        </p>
      )}

      {status === 'done' && suggestions.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-xs text-text-warm mb-1">
            Fant{' '}
            <span className="font-semibold text-[#1A1A1A]">{suggestions.length}</span>{' '}
            topp{suggestions.length !== 1 ? 'er' : ''} nær sporet:
          </p>
          {suggestions.map(s => {
            const alreadyAscended = ascendedSet.has(s.id)
            return (
              <div
                key={s.id}
                className="flex items-center gap-3 bg-parchment rounded-lg border border-border-warm px-3 py-2.5 flex-wrap"
              >
                <Mountain size={14} className="text-forest shrink-0" strokeWidth={1.75} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A] leading-tight">{s.name}</p>
                  <p className="text-xs text-text-warm">
                    {s.height.toLocaleString('no')} moh
                    <span className="mx-1.5 text-border-warm">·</span>
                    {Math.round(s.minDistanceM)} m fra sporet
                  </p>
                </div>
                {alreadyAscended ? (
                  <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-forest-50 text-forest border border-forest/20 shrink-0">
                    <CheckCircle2 size={11} strokeWidth={2} />
                    Allerede registrert
                  </span>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="date"
                      value={dates[s.id] ?? today}
                      onChange={e => setDates(prev => ({ ...prev, [s.id]: e.target.value }))}
                      className="bg-white border border-border-warm rounded-md px-2 py-1 text-xs text-[#1A1A1A] focus:outline-none focus:border-forest transition-colors"
                    />
                    <button
                      onClick={() => handleLog(s.id)}
                      disabled={isPending}
                      className="bg-forest text-white text-xs font-medium px-3 py-1 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isPending ? '…' : 'Registrer'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
