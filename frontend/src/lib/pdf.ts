import { pdfjs } from 'react-pdf'
// @ts-expect-error bundled asset path for Vite
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc as unknown as string


