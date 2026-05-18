'use client'

import { useState, useTransition } from 'react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { deleteAscent } from '@/app/ascents/actions'

interface DeleteAscentButtonProps {
  peakId: string
  peakName: string
}

export function DeleteAscentButton({ peakId, peakName }: DeleteAscentButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    const fd = new FormData()
    fd.append('peak_id', peakId)
    startTransition(async () => { await deleteAscent(fd) })
    setConfirmOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        disabled={isPending}
        className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
      >
        {isPending ? '…' : 'Fjern'}
      </button>
      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
        message={`Fjerne bestigning av ${peakName}?`}
      />
    </>
  )
}
