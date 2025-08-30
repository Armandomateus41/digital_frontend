import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Label from '../../components/ui/Label'
import { Card, CardContent } from '../../components/ui/Card'
import Toast from '../../components/Toast'
import { apiPostForm } from '../../lib/http'
import { Link } from 'react-router-dom'

const schema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  file: z.instanceof(File, { message: 'Selecione um PDF' }),
})

type FormValues = z.infer<typeof schema>

export default function UploadDocument() {
  const [toast, setToast] = useState<string | undefined>()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    try {
      const fd = new FormData()
      fd.set('title', values.title)
      fd.set('file', values.file)
      await apiPostForm('/admin/documents', fd)
      setToast('Documento enviado com sucesso')
    } catch (e: any) {
      const rid = e?.requestId ? ` (reqId: ${e.requestId})` : ''
      console.error('Upload error', e)
      setToast((e?.problem?.detail || e.message || 'Erro ao enviar') + rid)
    }
  }

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
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
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
        <div className="flex space-x-4 mb-8">
          <Button className="bg-white text-gray-900 border border-gray-300 hover:bg-gray-50">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Cadastrar Documento
          </Button>
          <Link to="/admin/signatures">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Lista de Assinaturas
            </Button>
          </Link>
        </div>

        {/* Conteúdo Principal */}
        <div className="max-w-2xl">
          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              {/* Título da Seção */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <h3 className="text-2xl font-bold text-gray-900">Cadastro de Documento</h3>
                </div>
                <p className="text-gray-600">Faça upload de documentos PDF para disponibilizar para assinatura</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Título do Documento
                  </Label>
                  <Input 
                    id="title" 
                    placeholder="Ex: Contrato de Prestação de Serviços"
                    className="h-12 text-base"
                    {...register('title')} 
                  />
                  {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>}
                </div>

                <div>
                  <Label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                    Selecionar PDF
                  </Label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900 mb-2">Clique para selecionar um arquivo PDF</p>
                    <p className="text-sm text-gray-500">Apenas arquivos PDF são aceitos</p>
                    <input
                      id="file"
                      type="file"
                      accept="application/pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) setValue('file', f, { shouldValidate: true })
                      }}
                    />
                  </div>
                  {errors.file && <p className="mt-2 text-sm text-red-600">{errors.file.message as string}</p>}
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {isSubmitting ? 'Cadastrando...' : 'Cadastrar Documento'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Toast message={toast} type={toast?.includes('sucesso') ? 'success' : 'error'} onClose={() => setToast(undefined)} />
    </div>
  )
}


