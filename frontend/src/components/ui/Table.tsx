import { PropsWithChildren, HTMLAttributes } from 'react'

export function Table({ children }: PropsWithChildren) {
  return (
    <div className="w-full">
      <table className="w-full table-fixed divide-y divide-gray-200">{children}</table>
    </div>
  )
}

export function THead({ children }: PropsWithChildren) {
  return <thead className="bg-gray-50">{children}</thead>
}

export function TBody({ children }: PropsWithChildren) {
  return <tbody className="divide-y divide-gray-200 bg-white">{children}</tbody>
}

export function TR({ children, className, ...rest }: PropsWithChildren & HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={`hover:bg-gray-50 ${className || ''}`} {...rest}>
      {children}
    </tr>
  )
}

export function TH({ children, className, ...rest }: PropsWithChildren & HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 ${className || ''}`}
      {...rest}
    >
      {children}
    </th>
  )
}

export function TD({ children, className, ...rest }: PropsWithChildren & HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`whitespace-nowrap px-4 py-3 text-sm text-gray-900 ${className || ''}`} {...rest}>
      {children}
    </td>
  )
}


