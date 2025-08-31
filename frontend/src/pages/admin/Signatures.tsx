import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Table, THead, TBody, TR, TH, TD } from '../../components/ui/Table'
import { apiGet, apiPost } from '../../lib/http'
import Button from '../../components/ui/Button'
import Toast from '../../components/Toast'
import Modal from '../../components/ui/Modal'

type DocRow = {
  documentId: string
  name: string
  date: string
  cpf: string
  hash: string
}

function RowActions({ onOpen, onView, onAdd, onSign }:
  { onOpen: (e: React.MouseEvent) => void; onView: () => void; onAdd: () => void; onSign: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative inline-block text-left">
      <Button size="sm" variant="ghost" aria-label="Mais ações" title="Mais ações" onClick={(e) => { onOpen(e); setOpen((v) => !v) }}>
        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
      </Button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="py-1 text-sm text-gray-700">
            <button className="w-full px-4 py-2 text-left hover:bg-gray-50" onClick={() => { setOpen(false); onView() }}>Ver assinantes</button>
            <button className="w-full px-4 py-2 text-left hover:bg-gray-50" onClick={() => { setOpen(false); onAdd() }}>Adicionar assinante</button>
            <button className="w-full px-4 py-2 text-left hover:bg-gray-50" onClick={() => { setOpen(false); onSign() }}>Assinar (primeiro pendente)</button>
          </div>
        </div>
      )}
    </div>
  )
}

type Signer = {
  id: string
  name: string
  cpf: string
  status: 'PENDING' | 'SIGNED'
  signedAt?: string
}

function abbreviateMiddle(value: string, start: number = 8, end: number = 6): string {
  if (!value) return ''
  if (value.length <= start + end) return value
  return `${value.slice(0, start)}…${value.slice(-end)}`
}

function formatCpf(cpf: string): string {
  const only = (cpf || '').replace(/\D/g, '')
  return only.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function formatDate(dateIso: string): string {
  const d = new Date(dateIso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy}, ${hh}:${mi}`
}

export default function Signatures() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [viewModalDocId, setViewModalDocId] = useState<string | null>(null)
  const [addModal, setAddModal] = useState<{ documentId: string } | null>(null)
  const [signModal, setSignModal] = useState<{ documentId: string; signer?: Signer } | null>(null)
  const [detailsDoc, setDetailsDoc] = useState<DocRow | null>(null)
  const [newName, setNewName] = useState('')
  const [newCpf, setNewCpf] = useState('')
  const [toast, setToast] = useState<string | undefined>()
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo e Título */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                    <path d="M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="white"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">SecureSign</h1>
                  <p className="text-xs text-gray-500">Assinatura Digital</p>
                </div>
              </div>
              <div className="border-l border-gray-300 pl-4">
                <h2 className="text-lg font-semibold text-gray-900">Área Administrativa</h2>
                <p className="text-sm text-gray-600">Gerenciar documentos e assinaturas</p>
              </div>
            </div>

            {/* Botão Sair */}
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-gray-900"
              onClick={async () => {
                try {
                  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
                } catch {}
                localStorage.removeItem('accessToken')
                navigate('/admin/login', { replace: true })
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Navegação */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link to="/admin/documents/new" className="block">
            <div className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 flex items-center justify-center hover:bg-gray-50">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium text-gray-800">Cadastrar Documento</span>
            </div>
          </Link>
          <div className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 flex items-center justify-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-800">Lista de Assinaturas</span>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="bg-white rounded-lg border border-gray-200 p-0 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
              </svg>
              <h3 className="text-base font-semibold text-gray-900">Lista de Assinaturas</h3>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">{data.length} registros</span>
          </div>
          <div className="px-6 pt-3">
            <div className="mb-4 inline-flex rounded-md border border-gray-300 bg-gray-50 p-1">
              <button className="px-3 py-1.5 text-sm rounded-md text-gray-600 hover:text-gray-900">🏷️ Cards</button>
              <button className="px-3 py-1.5 text-sm rounded-md bg-white text-gray-900 border border-gray-200 -ml-px">📋 Tabela</button>
            </div>
          </div>
          <div className="p-6 pt-0">
      <Table>
        <THead>
                <TR className="bg-gray-50">
                  <TH className="w-24">ID</TH>
                  <TH className="w-72">Documento</TH>
                  <TH className="w-44">Data/Hora</TH>
                  <TH className="w-36">CPF</TH>
                  <TH className="w-56">Hash da Assinatura</TH>
                  <TH className="w-28 text-right">Ações</TH>
          </TR>
        </THead>
        <TBody>
          {data.map((d, idx) => (
                  <TR key={`${d.documentId}-${d.hash}`} onClick={() => setDetailsDoc(d)} className="cursor-pointer">
                    <TD>
                      <span className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700" title={d.documentId}>
                        {`DOC${String(idx + 1).padStart(3, '0')}`}
                      </span>
                    </TD>
                    <TD className="text-gray-900">
                      <span className="mr-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: '#F3F4F6', color: '#374151' }}>
                        {d.cpf ? 'PENDENTE' : 'ASSINADO'}
                      </span>
                      <span className="inline-block max-w-[18rem] align-middle truncate" title={d.name}>{d.name}</span>
                    </TD>
                    <TD className="text-gray-700"><span className="inline-flex items-center gap-1"><svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3"/></svg>{formatDate(d.date)}</span></TD>
                    <TD className="text-gray-700"><span className="inline-flex items-center gap-1"><svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"/></svg>{formatCpf(d.cpf)}</span></TD>
                    <TD>
                      <span className="block max-w-[14rem] truncate font-mono text-xs text-gray-700" title={d.hash}># {abbreviateMiddle(d.hash)}</span>
                    </TD>
                    <TD className="text-right relative">
                      <div className="inline-flex items-center gap-1">
                        <Button size="sm" variant="ghost" aria-label="Copiar hash" title="Copiar hash" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(d.hash).then(() => setToast('Hash copiado para a área de transferência')) }}>
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M8 16h8a2 2 0 002-2v-2m-6 8H8a2 2 0 01-2-2v-2m8-8h2a2 2 0 012 2v2"/></svg>
                        </Button>
                        <RowActions
                          onOpen={(e) => e.stopPropagation()}
                          onView={() => setViewModalDocId(d.documentId)}
                          onAdd={() => { setNewName(''); setNewCpf(''); setAddModal({ documentId: d.documentId }) }}
                          onSign={async () => {
                            const signers = await listSigners(d.documentId)
                            const firstPending = signers.find((s) => s.status === 'PENDING')
                            if (!firstPending) { setSignModal({ documentId: d.documentId }); return }
                            setSignModal({ documentId: d.documentId, signer: firstPending })
                          }}
                        />
                      </div>
                    </TD>
                  </TR>
                ))}
        </TBody>
      </Table>
    </div>
        </div>
      </div>
      {viewModalDocId && (
        <ViewSignersModal documentId={viewModalDocId} onClose={() => setViewModalDocId(null)} loader={listSigners} />
      )}
      {addModal && (
        <AddSignerModal
          documentId={addModal.documentId}
          onClose={() => setAddModal(null)}
          onSubmit={(p) => createSigner.mutateAsync({ documentId: addModal.documentId, name: p.name, cpf: p.cpf }).then(() => undefined)}
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
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-700 hover:underline"
                  onClick={() => navigator.clipboard.writeText(detailsDoc.hash).then(() => setToast('Hash copiado para a área de transferência'))}
                >
                  Copiar
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
      <Toast message={toast} type="success" onClose={() => setToast(undefined)} />
    </div>
  )
}

// Modais
function ViewSignersModal({ documentId, onClose, loader }: { documentId: string; onClose: () => void; loader: (id: string) => Promise<Signer[]> }) {
  const [data, setData] = useState<Signer[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | undefined>()
  useEffect(() => {
    let mounted = true
    loader(documentId)
      .then((r) => mounted && setData(r))
      .catch((e) => mounted && setErr(e?.message || 'Erro ao carregar'))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [documentId, loader])
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


