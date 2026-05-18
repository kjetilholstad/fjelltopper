'use client'

interface ConfirmDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  message?: string
}

export function ConfirmDialog({ open, onConfirm, onCancel, message = 'Er du sikker?' }: ConfirmDialogProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={e => { e.preventDefault(); e.stopPropagation(); onCancel() }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-sm text-[#1A1A1A] mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={e => { e.stopPropagation(); onCancel() }}
            className="px-4 py-2 text-sm font-medium text-text-warm border border-border-warm rounded-lg hover:bg-parchment transition-colors"
          >
            Avbryt
          </button>
          <button
            onClick={e => { e.stopPropagation(); onConfirm() }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            Ja, fjern
          </button>
        </div>
      </div>
    </div>
  )
}
