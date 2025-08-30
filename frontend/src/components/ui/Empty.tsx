export default function Empty({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-md border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
      <div className="mb-1 text-sm font-medium">{title}</div>
      {description && <div className="text-xs text-gray-500">{description}</div>}
    </div>
  )
}


