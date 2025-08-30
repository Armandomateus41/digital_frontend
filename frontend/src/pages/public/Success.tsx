import Button from '../../components/ui/Button'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function Success() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const hash = params.get('hash') || ''
  const short = hash ? hash.slice(0, 10) : ''
  return (
    <div className="mx-auto max-w-sm p-6 text-center">
      <div className="mb-4 text-5xl">✅</div>
      <h1 className="mb-2 text-xl font-semibold">Assinatura concluída</h1>
      {short && <p className="mb-4 text-gray-600">Hash: {short}</p>}
      <Button onClick={() => navigate('/document')}>Voltar</Button>
    </div>
  )
}


