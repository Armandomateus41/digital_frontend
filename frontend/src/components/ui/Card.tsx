import { PropsWithChildren } from 'react'
import clsx from 'clsx'

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={clsx('rounded-lg border border-gray-200 bg-white p-6 shadow-sm', className)}>{children}</div>
}

export function CardHeader({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={clsx('mb-4 flex items-center justify-between', className)}>{children}</div>
}

export function CardTitle({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <h2 className={clsx('text-xl font-semibold text-gray-900', className)}>{children}</h2>
}

export function CardContent({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={clsx('space-y-3', className)}>{children}</div>
}


