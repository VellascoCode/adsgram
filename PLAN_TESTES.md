# 📋 PLANO DE TESTES - AdsGram MVP

## 📍 ETAPA ATUAL DO PROJETO

### ✅ O QUE JÁ TEMOS (Implementado e Testado):

#### 1. **Infraestrutura Base**
- ✅ Next.js 14.2.33 com TypeScript
- ✅ Tailwind CSS + Framer Motion + React Icons
- ✅ MongoDB com Mongoose (models completos)
- ✅ NextAuth para admin (PIN 4 dígitos)
- ✅ JWT para sessão de usuários
- ✅ Device frame simulado (mobile-first)

#### 2. **Páginas Principais**
- ✅ `/indexlocal` - Login DEV com design gamificado profissional
- ✅ `/` (index) - Dashboard com anúncios e tarefas
- ✅ `/profile` - Perfil com avatar, stats, drawer de edição
- ✅ `/admin` - Painel admin completo com 8 tabs

#### 3. **Sistema de Seeds**
- ✅ Seed básico: 1 ad + 1 task (`/api/dev/seed`)
- ✅ Seed avançado: 10 users, 15 ads, 20 tasks, 30 views, 25 completions, 8 withdrawals (`/api/dev/seed-advanced`)

#### 4. **APIs Completas**
- ✅ Auth: `/api/auth/telegram`, `/api/auth/dev-login`, `/api/auth/[...nextauth]`
- ✅ User: `/api/me`, `/api/profile`, `/api/withdraw`
- ✅ Ads: `/api/ads/list`, `/api/ads/view`
- ✅ Tasks: `/api/tasks/list`, `/api/tasks/submit`
- ✅ Admin: `/api/admin/stats`, `/api/admin/pending`, `/api/admin/users`, `/api/admin/ads`, `/api/admin/taskcompletions`, `/api/admin/withdrawals`, `/api/admin/adviews`, `/api/admin/approveTask`, `/api/admin/markWithdrawPaid`

#### 5. **Admin Panel (8 Tabs Funcionais)**
- ✅ Dashboard - 8 cards com stats reais
- ✅ Usuários - lista completa com avatar, saldo, level
- ✅ Anúncios - lista com thumbnail, progress bar de budget
- ✅ Tarefas Pendentes - aprovação/rejeição com toasts
- ✅ Todas Tarefas - histórico completo
- ✅ Saques Pendentes - marcar como pago
- ✅ Todos Saques - histórico completo
- ✅ Visualizações - ad views com populate de dados

#### 6. **Design System**
- ✅ Dark neon web3 gamificado
- ✅ Gradientes vibrantes (cyan, purple, pink, etc)
- ✅ Animações Framer Motion (fade, slide, scale, pulse)
- ✅ Toast notifications (react-hot-toast)
- ✅ Badges pulsantes funcionais (rastreiam estado visitado)
- ✅ Mobile-first: layouts verticais, sem grid2 desnecessário
- ✅ **CORES CORRIGIDAS**: texto claro (white/gray-100/200) em fundos escuros

---

## 🔴 O QUE FALTA PARA TESTES COMPLETOS

### 1. 🔐 **Autenticação Telegram para Web**
**Status**: ❌ NÃO IMPLEMENTADO

**O que precisa**:
- Modal com 6 inputs (igual admin PIN, mas 6 dígitos)
- Gerar token de acesso seguro com JWT
- Validação no backend com expiração (ex: 5 minutos)
- Permitir login via token na web (fora do Telegram app)

**Implementação sugerida**:
```typescript
// Nova API: /api/auth/generate-token
// - Gera token de 6 dígitos aleatório
// - Salva no banco com expiração (5 min)
// - Retorna token para ser usado no modal

// Nova API: /api/auth/verify-token
// - Recebe token de 6 dígitos
// - Valida contra banco
// - Se válido: cria sessão JWT
// - Se inválido/expirado: retorna erro
```

**Onde usar**:
- Em `/` (index.tsx) quando **NÃO** está dentro do Telegram WebApp
- Detectar: `window.Telegram?.WebApp?.initData` existe? Se não, mostrar modal de token

---

### 2. 🌐 **Conexão Base Local (indexlocal)**
**Status**: ⚠️ PARCIALMENTE TESTADO

**Testes necessários**:
- [x] Login DEV funciona
- [x] Seed básico cria 1 ad + 1 task
- [x] Seed avançado cria 10 users, 15 ads, 20 tasks, 30 views, 25 completions, 8 withdrawals
- [ ] **Dashboard lista anúncios e tarefas**
- [ ] **AdModal abre, countdown 10s funciona, botão Concluir credita saldo**
- [ ] **TaskModal abre, campo prova opcional, botão Concluir submete**
- [ ] **Profile: editar dados, validar campos (wallet OU pix), salvar**
- [ ] **Admin: aprovar/rejeitar tarefas, marcar saques como pago**

**Como testar**:
1. Rodar `npm run dev`
2. Acessar `http://localhost:3000/indexlocal`
3. Login DEV → Popular dados (Seed Avançado)
4. Testar cada fluxo listado acima
5. Verificar logs no terminal com prefixo `[LOG]`

---

### 3. 🌍 **Conexão Web (index.tsx)**
**Status**: ❌ NÃO TESTADO (depende de auth token)

**Testes necessários**:
- [ ] Detectar ausência de Telegram WebApp
- [ ] Mostrar modal de token de 6 dígitos
- [ ] Validar token, criar sessão JWT
- [ ] Dashboard funciona normalmente após login
- [ ] Todos os fluxos (ads, tasks, profile) funcionam

**Como testar** (após implementar auth token):
1. Acessar `http://localhost:3000/` em navegador normal (não Telegram)
2. Modal de token aparece
3. Gerar token via endpoint (ou admin panel)
4. Digitar token no modal
5. Testar fluxo completo

---

### 4. 📱 **Conexão Telegram (WebApp)**
**Status**: ❌ NÃO CONFIGURADO

**Pré-requisitos**:
1. Deploy em Vercel
2. Configurar domínio com HTTPS
3. Criar bot no BotFather
4. Configurar webhook do bot
5. Configurar `/setdomain` no BotFather com URL da Vercel

**Testes necessários**:
- [ ] Bot responde no Telegram
- [ ] Botão "Abrir AdsGram" funciona
- [ ] WebApp abre dentro do Telegram
- [ ] `window.Telegram.WebApp.initData` traz dados do usuário
- [ ] Autenticação HMAC-SHA256 funciona
- [ ] Dashboard carrega dentro do Telegram
- [ ] Todos os fluxos funcionam
- [ ] MainButton do Telegram (se usado)

**Como testar**:
1. Deploy no Vercel: `vercel --prod`
2. Criar bot: `/newbot` no BotFather
3. Configurar: `/setdomain` com URL da Vercel
4. Abrir bot no Telegram
5. Clicar em "Abrir AdsGram"
6. Testar todos os fluxos

---

## 📝 CHECKLIST DE TESTES

### Local (indexlocal)
- [ ] Login DEV
- [ ] Seed avançado (popular banco)
- [ ] Dashboard lista anúncios e tarefas
- [ ] Ver anúncio (countdown 10s, creditar saldo)
- [ ] Iniciar tarefa (submeter com prova)
- [ ] Editar perfil (validar wallet OU pix)
- [ ] Admin: aprovar tarefa (creditar saldo)
- [ ] Admin: rejeitar tarefa (não creditar)
- [ ] Admin: marcar saque como pago
- [ ] Verificar logs no terminal

### Web (index.tsx) - APÓS IMPLEMENTAR TOKEN AUTH
- [ ] Detectar ausência de Telegram WebApp
- [ ] Modal de token aparece
- [ ] Gerar token via endpoint
- [ ] Validar token e criar sessão
- [ ] Dashboard funciona após login
- [ ] Todos os fluxos funcionam normalmente

### Telegram (WebApp) - APÓS DEPLOY E CONFIGURAÇÃO
- [ ] Bot responde no Telegram
- [ ] WebApp abre dentro do Telegram
- [ ] Autenticação HMAC funciona
- [ ] Dashboard carrega
- [ ] Ver anúncios funciona
- [ ] Iniciar tarefas funciona
- [ ] Perfil funciona
- [ ] Todos os flows end-to-end

---

## 🚀 PRÓXIMOS PASSOS (Ordem Recomendada)

### 1. **Testar Local Completo** (1-2h)
- Rodar todos os testes do checklist local
- Documentar bugs/problemas
- Corrigir antes de avançar

### 2. **Implementar Auth Token para Web** (2-3h)
- Criar `/api/auth/generate-token`
- Criar `/api/auth/verify-token`
- Adicionar modal de 6 dígitos em `index.tsx`
- Testar fluxo web completo

### 3. **Deploy Vercel + Config Bot** (1-2h)
- Deploy: `vercel --prod`
- Configurar variáveis de ambiente no Vercel
- Criar bot no BotFather
- Configurar webhook e domain
- Testar WebApp dentro do Telegram

### 4. **Testes End-to-End** (2-3h)
- Testar todos os fluxos no Telegram
- Testar edge cases (erros, validações)
- Ajustar UX conforme necessário

---

## 📊 RESUMO DO STATUS

| Componente | Status | Próximo Passo |
|------------|--------|---------------|
| Infraestrutura | ✅ Completo | - |
| Design System | ✅ Completo | - |
| APIs Backend | ✅ Completo | - |
| Seed System | ✅ Completo | - |
| Admin Panel | ✅ Completo | - |
| IndexLocal | ⚠️ Parcial | Testar fluxos completos |
| Profile | ✅ Completo | Testar validações |
| Auth Token Web | ❌ Falta | Implementar modal + endpoints |
| Deploy Vercel | ❌ Falta | Fazer deploy |
| Telegram Bot | ❌ Falta | Criar e configurar |
| Telegram WebApp | ❌ Falta | Testar após deploy |

---

## 🔧 VARIÁVEIS DE AMBIENTE NECESSÁRIAS

```env
# MongoDB
DATABASE_URL=mongodb+srv://...

# JWT
JWT_SECRET=your-secret-key-here

# Admin
ADMIN_PIN=1234

# Telegram Bot (após criar)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_BOT_SECRET=SHA256-of-token

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000 (dev) ou https://adsgram.vercel.app (prod)
```

---

## 📞 CONTATO PARA DÚVIDAS

Se houver dúvidas sobre qualquer etapa, documentar aqui:
- Qual teste falhou?
- Qual erro apareceu?
- Print do terminal/navegador?
