import { PropsWithChildren, ReactNode } from 'react'
import clsx from 'clsx'

type ModalProps = PropsWithChildren<{
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}>

export default function Modal({ open, onClose, title, description, actions, className, children }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={clsx('relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl', className)} role="dialog" aria-modal="true">
        {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        <div className="mt-4">{children}</div>
        {actions && <div className="mt-6 flex justify-end gap-2">{actions}</div>}
      </div>
    </div>
  )
}


