# SecureSign - Plataforma de Assinatura Digital

Uma plataforma moderna e segura para assinatura digital de documentos, desenvolvida com React, TypeScript e NestJS.

## 🚀 Funcionalidades

- **Login de Usuário**: Autenticação com CPF para usuários finais
- **Login Administrativo**: Acesso para gestão de documentos e assinaturas
- **Design System**: Interface moderna com Tailwind CSS e componentes reutilizáveis
- **Responsivo**: Layout mobile-first otimizado para todos os dispositivos
- **Segurança**: Validação robusta e tratamento de erros

## 🛠️ Tecnologias

### Frontend
- **React 19** + **TypeScript**
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **React Hook Form** + **Zod** para formulários e validação
- **React Router** para navegação
- **TanStack Query** para gerenciamento de estado do servidor

### Backend (BFF)
- **Node.js** + **TypeScript**
- **Express** para API REST
- **JWT** para autenticação
- **Validação** com class-validator

## 📦 Estrutura do Projeto

```
digital-front/
├── frontend/          # Aplicação React (SPA)
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── lib/           # Utilitários e helpers
│   │   └── styles/        # Estilos globais
├── server/            # Backend for Frontend (BFF)
│   ├── services/          # Serviços de integração
│   ├── middlewares/       # Middlewares customizados
│   └── utils/             # Utilitários do servidor
└── tests/             # Testes E2E com Playwright
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- pnpm (recomendado)

### Instalação
```bash
# Instalar dependências
pnpm install

# Executar em modo desenvolvimento (frontend + backend)
pnpm dev:all

# Executar apenas o frontend
pnpm dev

# Build para produção
pnpm build
```

### URLs de Desenvolvimento
- **Frontend**: http://localhost:5175
- **Backend (BFF)**: http://localhost:8787

## 🎨 Design System

### Paleta de Cores
- **Primary**: `#030213` (cor escura profissional)
- **Background**: Gradiente `from-gray-50 to-gray-100`
- **Text**: Hierarquia com tons de cinza

### Componentes
- **Logo**: Componente reutilizável com 3 tamanhos
- **Cards**: Elevação com shadow-xl
- **Buttons**: Estados hover e focus bem definidos
- **Inputs**: Altura de 48px para touch-friendly

## 📱 Páginas

### Login de Usuário (`/login`)
- Autenticação com CPF (formatação automática)
- Validação em tempo real
- Link para acesso administrativo

### Login Administrativo (`/admin/login`)
- Autenticação com e-mail
- Interface específica para administradores
- Link de retorno para login de usuário

## 🔒 Segurança

- Validação de CPF com algoritmo de verificação
- Sanitização de inputs
- Tratamento de erros padronizado
- Headers de segurança configurados

## 📋 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev:all          # Frontend + Backend simultaneamente
pnpm dev              # Apenas frontend

# Build
pnpm build            # Build de produção

# Testes
pnpm test:e2e         # Testes end-to-end com Playwright

# Utilitários
pnpm promote:admin    # Promover usuário a admin
```

## 🚀 Deploy

### Vercel (Frontend)
O projeto está configurado para deploy automático no Vercel:

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente necessárias
3. O deploy será automático a cada push na branch main

### Configuração de Build
- **Build Command**: `pnpm build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `pnpm install`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Armando Capita** - [GitHub](https://github.com/Armandomateus41)

---

Desenvolvido com ❤️ para assinatura digital segura e moderna.