# Guia de Acesso e Deploy — Web, Telegram e Bot/App

Este guia lista, em passos claros, tudo que você precisa para subir e testar:
- Acesso Web (fora do Telegram)
- Acesso via Telegram WebApp (dentro do Telegram)
- Acesso via Token (envio pelo bot)
- Itens de configuração (env vars, BotFather, Vercel)

Se algo já estiver feito, pode pular para a próxima seção.

---

## 1) Pré‑requisitos

- Banco de dados MongoDB
  - Dev (local): você já criou — `mongodb://localhost:27017/adsgram`
  - Prod (Vercel/Atlas): criar um cluster e gerar a `DATABASE_URL` (ou usar outro provedor Mongo gerenciado)
- Vercel (deploy com HTTPS)
  - Você já tem: `https://adsgram-ten.vercel.app/`
- Bot do Telegram (BotFather)
  - Passos abaixo ("Como criar o bot no BotFather")
- Domínio HTTPS (a Vercel já fornece)

---

## 2) Variáveis de Ambiente (Produção)

Modelo recomendado (copiar/colar no painel da Vercel → Settings → Environment Variables):

| Nome | Valor (exemplo) | Observações |
|------|------------------|-------------|
| DATABASE_URL | mongodb+srv://user:pass@cluster/db?retryWrites=true&w=majority | Em dev você usa `mongodb://localhost:27017/adsgram` |
| JWT_SECRET | gere-um-segredo-forte | Usado no JWT do usuário (`lib/jwt.ts`, `/api/auth/verify-token`) |
| SESSION_SECRET | gere-um-segredo-forte | Mantido para compatibilidade (seu ambiente local) |
| NEXTAUTH_SECRET | gere-um-segredo-diferente | Sessão do admin (NextAuth) |
| NEXTAUTH_URL | https://adsgram-ten.vercel.app | URL pública de produção |
| ADMIN_PIN | 1234 | PIN do admin (troque assim que possível) |
| TELEGRAM_BOT_TOKEN | 123456:ABC... | Token do BotFather |
| NEXT_PUBLIC_TELEGRAM_BOT_USERNAME | SeuBotUsername | Sem @; usado nos deep links e UI |

Para desenvolvimento local, crie um `.env.local` (não comitar) com:

```
DATABASE_URL="mongodb://localhost:27017/adsgram"
JWT_SECRET="dev-jwt-secret"
SESSION_SECRET="dev-session-secret"
NEXTAUTH_SECRET="dev-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_PIN="1234"
TELEGRAM_BOT_TOKEN="COLE_AQUI_O_TOKEN_DO_BOT"
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="SeuBotUsername"
```

Após preencher no Vercel, faça um redeploy para aplicar.

Configure no provedor (ex.: Vercel → Settings → Environment Variables):

Obrigatórias:
- `DATABASE_URL` = URL do MongoDB
- `JWT_SECRET` = um segredo forte (para JWT)
- `NEXTAUTH_SECRET` = outro segredo forte (para NextAuth do admin)
- `NEXTAUTH_URL` = URL pública (ex.: `https://seu-dominio.com`)
- `ADMIN_PIN` = PIN do admin (ex.: `1234`)
- `TELEGRAM_BOT_TOKEN` = token do seu bot (BotFather)
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` = username do seu bot (sem `@`)

Opcional (dev):
- Crie um `.env.local` com as mesmas chaves para rodar localmente.

---

## 3) Deploy do App (Vercel)

1. Conecte o repositório no painel da Vercel
2. Adicione as variáveis de ambiente (acima)
3. Faça o deploy
4. Valide:
   - Acesse `https://SEU_DOMINIO/`
   - Deve aparecer a tela com 3 formas de acesso (Telegram, Token, Abrir no Telegram)
   - `GET /api/me` sem sessão deve retornar 401

---

## 4) Configurar WebApp no BotFather (Telegram)

No chat com o BotFather:
1. “Bot Settings” → “Menu Button”
2. Defina “Web App” e informe a URL do seu app (ex.: `https://SEU_DOMINIO/`)
3. Salve o título e a URL

Teste o deep‑link do WebApp:
- `https://t.me/SEU_BOT_USERNAME?startapp=app`
- Deve abrir seu app DENTRO do Telegram

Requisitos do Telegram WebApp:
- Precisa ser HTTPS
- `TELEGRAM_BOT_TOKEN` deve estar correto no backend

### Como criar o bot no BotFather (passo a passo)

1. No Telegram, procure por `@BotFather` e inicie uma conversa
2. Envie `/newbot`
3. Dê um nome legível (ex.: `AdsGram`)
4. Dê um username único terminando com `bot` (ex.: `AdsGramAppBot`)
5. O BotFather vai te enviar o `TELEGRAM_BOT_TOKEN` — copie e coloque nas envs
6. (Opcional) Envie `/setuserpic` para definir um ícone
7. Envie `/setdescription` e `/setabouttext` para descrição
8. Envie `/setdomain` (em alguns casos) ou use “Bot Settings → Menu Button → Web App” para vincular a URL do seu app
9. Teste o deep link: `https://t.me/AdsGramAppBot?startapp=app`

---

## 5) Testar “Entrar com Telegram” (dentro do Telegram)

1. Abra `https://t.me/SEU_BOT_USERNAME?startapp=app`
2. O Telegram injeta `initData` na página
3. O front chama `POST /api/auth/telegram` com `initData`
4. Se ok, sessão criada (cookie httpOnly) e o Dashboard carrega

Validação:
- `GET /api/me` → 200
- Logout volta a mostrar a tela de login

Se falhar:
- Verifique `TELEGRAM_BOT_TOKEN` em produção
- Confirme que o WebApp do menu está apontando para o domínio certo

---

## 6) Testar “Acessar no Telegram” (deep link fora do Telegram)

Na página `/` (fora do Telegram):
- Clique em “Abrir no Telegram”
- Deve abrir o bot com `startapp=app`
- O fluxo é o mesmo do item 5 assim que entrar no Telegram

---

## 7) Testar “Entrar com Token” (fora do Telegram)

O que já está pronto:
- UI no `/` para digitar `@usuario ou ID` e solicitar token
- Campos de 6 dígitos + botão “Entrar” que chama `POST /api/auth/verify-token`

Backend (estado atual — simplificado e sem simulações):
- `POST /api/auth/generate-token` (público):
  - Aceita `{ identifier: '@usuario' | 'id' }`
  - Exige usuário já existente no banco (criado ao abrir o WebApp ao menos uma vez)
  - Gera um código de 6 dígitos e grava no próprio registro do usuário: `loginCode` + `loginCodeExpiresAt` (5 minutos)
  - Envia o código via **Bot API** para o `chat_id` do usuário; não retorna o código no JSON e não loga em texto claro
  - Se o envio falhar (ex.: chat não iniciado), retorna 400 pedindo para iniciar o bot
- `POST /api/auth/verify-token`:
  - Procura um usuário com `loginCode` igual e `loginCodeExpiresAt` ainda válido
  - Limpa os campos (`loginCode=null`, `loginCodeExpiresAt=null`) após uso
  - Cria a sessão para esse usuário (cookie httpOnly)

Validação do fluxo com token (produção):
1. Solicite token na UI (deve responder 200 e avisar que foi enviado)
2. Digite o token recebido (6 dígitos)
3. `POST /api/auth/verify-token` valida e cria sessão
4. Recarrega e abre o Dashboard

Obs.: Se receber 400 ao solicitar token, abra o app pelo Telegram para criar o usuário e vincular o chat; depois tente novamente.

---

## 8) (Opcional) Webhook do Bot Telegram

Arquivo: `pages/api/telegram/webhook.ts`
- Já existe como placeholder (retorna 200)
- Caso queira processar mensagens/comandos:
  1. Configure o webhook do Telegram para `https://SEU_DOMINIO/api/telegram/webhook`
  2. Trate `req.body` no handler para seus comandos (ex.: `/start`)

Para o login via WebApp, o webhook **não é necessário** — o `initData` já resolve a autenticação.

---

## 9) Checklists de QA (Go/No‑Go)

Sessão/Autenticação:
- [ ] `/api/me` retorna 401 sem sessão
- [ ] Dentro do Telegram, login automático funciona
- [ ] Fora do Telegram, tela mostra 3 opções de acesso
- [ ] Logout limpa sessão e volta à tela de login

Dashboard/Fluxos principais:
- [ ] Lista de anúncios e tarefas carrega
- [ ] Ver anúncio credita corretamente (sem NaN)
- [ ] Submeter tarefa cria pendência

Admin:
- [ ] Login com PIN funciona (NextAuth)
- [ ] Aprovar tarefa credita saldo do usuário
- [ ] Marcar saque como pago muda status
- [ ] Badges/contadores exibem dados reais

Token (quando liberado ao público):
- [ ] `generate-token` com rate limit e logs
- [ ] Token enviado via Bot API ao usuário

---

## 10) Roteiro rápido (primeiros testes + “pontos por view”)

Objetivo: subir na Vercel e validar em poucos minutos:
1) login/cadastro via Telegram WebApp
2) 1 anúncio aparecendo no Dashboard
3) ganhar saldo ao “ver” (crédito via `/api/ads/view`)

### Passo 0 — Preparar um banco “de teste”

Recomendado: usar um Mongo separado (ex.: `adsgram-dev`) para não sujar o banco final.

### Passo 1 — Seed de 1 anúncio + 1 tarefa (via DEV, usando o MESMO Mongo que você vai usar na Vercel)

Como os endpoints de seed são bloqueados quando `NODE_ENV=production` (Vercel), o jeito mais simples é rodar o seed local apontando para o Mongo que a Vercel vai usar.

1. Crie/edite `.env.local` com a `DATABASE_URL` do Mongo (Atlas) e seus secrets (exemplo na seção 2).
2. Rodar local:
   - `npm run dev`
3. Em outro terminal, disparar o seed (cria apenas se não existir nada):
   - `curl -X POST http://localhost:3000/api/dev/seed`

Opcional (seed grande para testar painel admin com bastante dados; use com cuidado):
   - `curl -X POST http://localhost:3000/api/dev/seed-advanced`

Dica DEV: existe a página `/indexlocal` e o endpoint `POST /api/auth/dev-login` para facilitar testes locais sem Telegram. Eles não devem ser usados em produção.

### Passo 2 — Deploy na Vercel

1. Conectar o repositório e configurar as env vars (seção 2).
2. Redeploy (para garantir que as env vars entraram).
3. Validar:
   - `GET /api/me` sem sessão → 401
   - abrir `https://SEU_DOMINIO/` → tela com 3 opções de acesso

### Passo 3 — BotFather (Telegram) + WebApp

1. Criar o bot e pegar `TELEGRAM_BOT_TOKEN`
2. Configurar `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` (sem `@`)
3. BotFather → Bot Settings → Menu Button → Web App → URL: `https://SEU_DOMINIO/`
4. Testar deep link:
   - `https://t.me/SEU_BOT_USERNAME?startapp=app`

### Passo 4 — Teste “primeiros pontos”

1. Abrir o deep link dentro do Telegram (Passo 3) e autenticar (WebApp).
2. Dashboard deve listar ao menos 1 anúncio (vindo do seed).
3. Clicar em “Ver” no anúncio:
   - o app chama `POST /api/ads/view`
   - o saldo em `GET /api/me` deve aumentar em `rewardCents`

### Passo 5 — (Opcional) Token login fora do Telegram

Pré‑requisito: o usuário precisa existir no banco (abrir WebApp ao menos uma vez) e ter iniciado conversa com o bot.

1. No chat do bot: apertar “Start”
2. Fora do Telegram (browser normal): pedir token na home
3. Digitar os 6 dígitos e entrar
- [ ] `verify-token` autentica e cria sessão do usuário correto

---

## 10) Troubleshooting rápido

- “Falha na verificação Telegram” ao abrir no WebApp:
  - Cheque `TELEGRAM_BOT_TOKEN`
  - Confirme que o domínio do WebApp no BotFather bate com o que você está usando
- “generate-token 401/403”:
  - Endpoint ainda está como admin‑only. Implementar versão pública (seção 7)
- “Token inválido/expirado”:
  - Verifique se o token não foi usado e está no prazo (5 minutos por padrão)
- “Deep link não abre o app no Telegram”:
  - Use `https://t.me/SEU_BOT_USERNAME?startapp=app`
  - Verifique se o bot realmente existe e está acessível

---

## 11) Próximas melhorias (recomendado)

- Liberar `/api/auth/generate-token` para público com:
  - Rate limit por IP/identifier
  - Associação `identifier → user` e envio do token via bot (sendMessage)
- Ajustar `/api/auth/verify-token` para usar o `identifier` do token e logar o usuário correto (evitar “guest”)
- Adicionar logs estruturados (sucesso/erro) em ambos endpoints
- (Opcional) Persistir `username → chat_id` no primeiro login via WebApp (facilita envio de token por username)

---

## 12) Comandos úteis

Dev local:
```bash
npm install
npm run dev
```

Build/Prod local:
```bash
npm run build
npm start
```

---

Referências rápidas:
- Deep link WebApp: `https://t.me/SEU_BOT_USERNAME?startapp=app`
- Env: `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` define o nome do bot exibido na UI
- Endpoint Telegram WebApp: `POST /api/auth/telegram` (usa `TELEGRAM_BOT_TOKEN`)
- Token: `POST /api/auth/generate-token` (liberar p/ público) e `POST /api/auth/verify-token`
