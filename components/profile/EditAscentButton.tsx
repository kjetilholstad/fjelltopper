'use client'

import { useState, useTransition } from 'react'
import { Pencil } from 'lucide-react'
import { updateAscent } from '@/app/ascents/actions'

interface EditAscentButtonProps {
  ascentId: string
  peakId: string
  peakName: string
  currentDate: string
  currentNotes: string | null
  currentWeather: string | null
}

export function EditAscentButton({
  ascentId, peakId, peakName, currentDate, currentNotes, currentWeather,
}: EditAscentButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    const fd = new FormData(e.currentTarget)
    fd.append('ascent_id', ascentId)
    fd.append('peak_id', peakId)
    startTransition(async () => {
      await updateAscent(fd)
      setOpen(false)
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(true) }}
        className="text-xs text-text-warm hover:text-forest transition-colors"
        title="Rediger bestigning"
      >
        <Pencil size={13} strokeWidth={1.75} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(false) }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-[#1A1A1A] mb-4">
              Rediger bestigning av {peakName}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-[#1A1A1A] mb-1.5">Dato</label>
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={currentDate}
                  className="w-full bg-parchment border border-border-warm rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-forest transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
                  Notater <span className="text-text-warm font-normal">(valgfritt)</span>
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={currentNotes ?? ''}
                  className="w-full bg-parchment border border-border-warm rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-forest transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
                  Vær <span className="text-text-warm font-normal">(valgfritt)</span>
                </label>
                <input
                  name="weather"
                  type="text"
                  defaultValue={currentWeather ?? ''}
                  placeholder="F.eks. Klarvær, vindstille"
                  className="w-full bg-parchment border border-border-warm rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-text-warm focus:outline-none focus:border-forest transition-colors"
                />
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setOpen(false) }}
                  className="px-4 py-2 text-sm font-medium text-text-warm border border-border-warm rounded-lg hover:bg-parchment transition-colors"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-forest rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isPending ? '…' : 'Lagre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
