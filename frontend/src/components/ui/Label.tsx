import { LabelHTMLAttributes } from 'react'
import clsx from 'clsx'

type Props = LabelHTMLAttributes<HTMLLabelElement>

export default function Label({ className, ...props }: Props) {
  return <label className={clsx('mb-1 block text-sm font-medium text-gray-700', className)} {...props} />
}


