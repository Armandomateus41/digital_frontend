import { PropsWithChildren } from 'react'

export function Table({ children }: PropsWithChildren) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">{children}</table>
    </div>
  )
}

export function THead({ children }: PropsWithChildren) {
  return <thead className="bg-gray-50">{children}</thead>
}

export function TBody({ children }: PropsWithChildren) {
  return <tbody className="divide-y divide-gray-200 bg-white">{children}</tbody>
}

export function TR({ children }: PropsWithChildren) {
  return <tr className="hover:bg-gray-50">{children}</tr>
}

export function TH({ children }: PropsWithChildren) {
  return <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">{children}</th>
}

export function TD({ children }: PropsWithChildren) {
  return <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{children}</td>
}


