import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Table, THead, TBody, TR, TH, TD } from '../../components/ui/Table'
import { apiGet, apiPost } from '../../lib/http'
import Button from '../../components/ui/Button'

type DocRow = {
  documentId: string
  name: string
  date: string
  cpf: string
  hash: string
}

type Signer = {
  id: string
  name: string
  cpf: string
  status: 'PENDING' | 'SIGNED'
  signedAt?: string
}

export default function Signatures() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery<DocRow[]>({
    queryKey: ['admin-signatures'],
    queryFn: async () => (await apiGet('/admin/signatures', { cache: 'no-store' })) as DocRow[],
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  })

  const listSigners = (documentId: string) =>
    qc.fetchQuery({
      queryKey: ['doc-signers', documentId],
      queryFn: async () => (await apiGet(`/documents/${documentId}/signatures`, { cache: 'no-store' })) as Signer[],
      staleTime: 0,
    })

  const createSigner = useMutation({
    mutationFn: async (p: { documentId: string; name: string; cpf: string }) =>
      apiPost(`/admin/documents/${p.documentId}/signatures`, { name: p.name, cpf: p.cpf }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['doc-signers', vars.documentId] })
    },
  })

  const signMutation = useMutation<unknown, Error, { signatureId: string; documentId: string }>({
    mutationFn: async (vars) => apiPost(`/signatures/${vars.signatureId}/sign`),
    onSuccess: (_data, vars) => {
      if (vars?.documentId) qc.invalidateQueries({ queryKey: ['doc-signers', vars.documentId] })
    },
  })

  if (isLoading) return <div className="p-6">Carregando...</div>
  if (!data || data.length === 0) return <div className="p-6">Nenhum documento enviado ainda.</div>

  return (
    <div className="p-6 space-y-6">
      <Table>
        <THead>
          <TR>
            <TH>Doc ID</TH>
            <TH>Nome</TH>
            <TH>Data</TH>
            <TH>CPF</TH>
            <TH>Hash</TH>
            <TH>Ações</TH>
          </TR>
        </THead>
        <TBody>
          {data.map((d) => (
            <TR key={`${d.documentId}-${d.hash}`}>
              <TD className="font-mono">{d.documentId}</TD>
              <TD>{d.name}</TD>
              <TD>{new Date(d.date).toLocaleString()}</TD>
              <TD>{d.cpf}</TD>
              <TD className="font-mono truncate max-w-[320px]">{d.hash}</TD>
              <TD className="space-x-2">
                <Button
                  size="sm"
                  onClick={async () => {
                    const signers = await listSigners(d.documentId)
                    const text = signers
                      .map((s) => `${s.name} (${s.cpf}) - ${s.status}${s.signedAt ? ` @ ${new Date(s.signedAt).toLocaleString()}` : ''}`)
                      .join('\n') || 'Sem assinantes'
                    alert(text)
                  }}
                >
                  Ver assinantes
                </Button>
                <Button
                  size="sm"
                  onClick={async () => {
                    const name = prompt('Nome do assinante?')?.trim()
                    if (!name) return
                    const cpf = prompt('CPF (somente números)?')?.replace(/\D/g, '')
                    if (!cpf) return
                    await createSigner.mutateAsync({ documentId: d.documentId, name, cpf })
                    alert('Assinante adicionado')
                  }}
                >
                  Adicionar
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    const signers = await listSigners(d.documentId)
                    const firstPending = signers.find((s) => s.status === 'PENDING')
                    if (!firstPending) return alert('Não há assinantes pendentes')
                    await signMutation.mutateAsync({ signatureId: firstPending.id, documentId: d.documentId })
                    alert(`Assinado: ${firstPending.name}`)
                  }}
                >
                  Assinar (primeiro pendente)
                </Button>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  )
}


