import { useEffect, useState } from 'react'
import clsx from 'clsx'

type Props = {
  message?: string
  type?: 'success' | 'error' | 'info'
  onClose?: () => void
}

export default function Toast({ message, type = 'info', onClose }: Props) {
  const [open, setOpen] = useState(Boolean(message))
  useEffect(() => setOpen(Boolean(message)), [message])
  useEffect(() => {
    if (!open) return
    const id = setTimeout(() => {
      setOpen(false)
      onClose?.()
    }, 3000)
    return () => clearTimeout(id)
  }, [open, onClose])

  if (!open || !message) return null

  return (
    <div
      role="status"
      className={clsx(
        'fixed right-4 top-4 z-50 rounded-md border px-4 py-2 shadow-md',
        type === 'success' && 'border-green-200 bg-green-50 text-green-800',
        type === 'error' && 'border-red-200 bg-red-50 text-red-800',
        type === 'info' && 'border-blue-200 bg-blue-50 text-blue-800',
      )}
    >
      {message}
    </div>
  )
}


