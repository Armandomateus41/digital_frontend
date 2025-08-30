import { pdfjs } from 'react-pdf'
// Utiliza import de asset via Vite (retorna URL string)
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = (workerSrc as unknown as string) || ''


