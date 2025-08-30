import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Table, THead, TBody, TR, TH, TD } from '../../components/ui/Table'
import { apiGet, apiPost } from '../../lib/http'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

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
  const [viewModalDocId, setViewModalDocId] = useState<string | null>(null)
  const [addModal, setAddModal] = useState<{ documentId: string } | null>(null)
  const [signModal, setSignModal] = useState<{ documentId: string; signer?: Signer } | null>(null)
  const [detailsDoc, setDetailsDoc] = useState<DocRow | null>(null)
  const [newName, setNewName] = useState('')
  const [newCpf, setNewCpf] = useState('')
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
            <TR key={`${d.documentId}-${d.hash}`} onClick={() => setDetailsDoc(d)}>
              <TD className="font-mono">{d.documentId}</TD>
              <TD>{d.name}</TD>
              <TD>{new Date(d.date).toLocaleString()}</TD>
              <TD>{d.cpf}</TD>
              <TD className="font-mono truncate max-w-[320px]">{d.hash}</TD>
              <TD className="space-x-2">
                <Button size="sm" onClick={() => setViewModalDocId(d.documentId)}>Ver assinantes</Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setNewName('')
                    setNewCpf('')
                    setAddModal({ documentId: d.documentId })
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
                    if (!firstPending) {
                      setSignModal({ documentId: d.documentId })
                      return
                    }
                    setSignModal({ documentId: d.documentId, signer: firstPending })
                  }}
                >
                  Assinar (primeiro pendente)
                </Button>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
      {viewModalDocId && (
        <ViewSignersModal documentId={viewModalDocId} onClose={() => setViewModalDocId(null)} loader={listSigners} />
      )}
      {addModal && (
        <AddSignerModal
          documentId={addModal.documentId}
          onClose={() => setAddModal(null)}
          onSubmit={async (p) => createSigner.mutateAsync({ documentId: addModal.documentId, name: p.name, cpf: p.cpf })}
          name={newName}
          setName={setNewName}
          cpf={newCpf}
          setCpf={setNewCpf}
        />
      )}
      {signModal && (
        <SignModal
          signer={signModal.signer}
          onClose={() => setSignModal(null)}
          onConfirm={async () => {
            if (!signModal.signer) return
            await signMutation.mutateAsync({ signatureId: signModal.signer.id, documentId: signModal.documentId })
          }}
        />
      )}
      {detailsDoc && (
        <Modal
          open
          onClose={() => setDetailsDoc(null)}
          title={detailsDoc.name}
          description={<span className="text-xs text-gray-500">ID {detailsDoc.documentId}</span>}
          actions={<Button onClick={() => setDetailsDoc(null)}>Fechar</Button>}
        >
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><span className="text-gray-600">Data/Hora:</span> {new Date(detailsDoc.date).toLocaleString()}</div>
            <div className="flex items-center gap-2"><span className="text-gray-600">CPF:</span> {detailsDoc.cpf}</div>
            <div>
              <div className="mb-1 text-gray-600">Hash:</div>
              <div className="relative">
                <input readOnly className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs" value={detailsDoc.hash} />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// Modais
function ViewSignersModal({ documentId, onClose, loader }: { documentId: string; onClose: () => void; loader: (id: string) => Promise<Signer[]> }) {
  const [data, setData] = useState<Signer[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | undefined>()
  useState(() => {
    loader(documentId)
      .then((r) => setData(r))
      .catch((e) => setErr(e?.message || 'Erro ao carregar'))
      .finally(() => setLoading(false))
  })
  return (
    <Modal open onClose={onClose} title="Assinantes" description={`Documento ${documentId}`}
      actions={<Button onClick={onClose}>Fechar</Button>}>
      {loading && <div className="text-sm text-gray-600">Carregando...</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}
      {!loading && !err && (
        <div className="max-h-60 overflow-auto text-sm">
          {data && data.length > 0 ? (
            <ul className="space-y-2">
              {data.map((s) => (
                <li key={s.id} className="flex items-center justify-between">
                  <span>{s.name} ({s.cpf})</span>
                  <span className={s.status === 'SIGNED' ? 'text-green-700' : 'text-yellow-700'}>{s.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-600">Sem assinantes</div>
          )}
        </div>
      )}
    </Modal>
  )
}

function AddSignerModal({ documentId, onClose, onSubmit, name, setName, cpf, setCpf }:
  { documentId: string; onClose: () => void; onSubmit: (p: { name: string; cpf: string }) => Promise<void>; name: string; setName: (v: string) => void; cpf: string; setCpf: (v: string) => void }) {
  const [saving, setSaving] = useState(false)
  const handle = async () => {
    if (!name?.trim()) return
    const only = cpf.replace(/\D/g, '')
    if (only.length !== 11) return
    setSaving(true)
    await onSubmit({ name: name.trim(), cpf: only })
    setSaving(false)
    onClose()
  }
  return (
    <Modal open onClose={onClose} title="Adicionar assinante" actions={
      <>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={handle} disabled={saving}>{saving ? 'Salvando...' : 'Adicionar'}</Button>
      </>
    }>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nome</label>
          <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do assinante" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">CPF (somente números)</label>
          <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="00000000000" />
        </div>
      </div>
    </Modal>
  )
}

function SignModal({ onClose, signer, onConfirm }:
  { onClose: () => void; signer?: Signer; onConfirm: () => Promise<void> }) {
  const [loading, setLoading] = useState(false)
  const handle = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
    onClose()
  }
  return (
    <Modal open onClose={onClose} title="Assinar documento" actions={
      <>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={handle} disabled={loading}>{loading ? 'Assinando...' : 'Confirmar'}</Button>
      </>
    }>
      {signer ? (
        <p className="text-sm text-gray-700">Será realizada a assinatura para <strong>{signer.name}</strong> ({signer.cpf}).</p>
      ) : (
        <p className="text-sm text-gray-700">Não há assinantes pendentes para este documento.</p>
      )}
    </Modal>
  )
}


