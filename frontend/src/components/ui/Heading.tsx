import { PropsWithChildren } from 'react'
import clsx from 'clsx'

export function H1({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <h1 className={clsx('mb-4 text-2xl font-semibold text-gray-900', className)}>{children}</h1>
}

export function H2({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <h2 className={clsx('mb-3 text-xl font-semibold text-gray-900', className)}>{children}</h2>
}


