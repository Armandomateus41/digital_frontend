import { Document, Page } from 'react-pdf'
import { useEffect } from 'react'
import '../lib/pdf'

type Props = {
  url: string
}

export default function PdfPreview({ url }: Props) {
  useEffect(() => {
    // noop: ensure worker configured by importing ../lib/pdf
  }, [])
  return (
    <div className="rounded-md border bg-white p-2">
      <Document file={url} loading={<div>Carregando PDF...</div>}>
        <Page pageNumber={1} width={600} />
      </Document>
    </div>
  )
}


