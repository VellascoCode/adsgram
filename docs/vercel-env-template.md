# Template de Variáveis de Ambiente (Vercel)

Use esta tabela no painel da Vercel (Settings → Environment Variables) para preencher suas envs em Production:

| Name | Value (exemplo) | Environment |
|------|------------------|-------------|
| DATABASE_URL | mongodb+srv://user:pass@cluster/db?retryWrites=true&w=majority | Production |
| JWT_SECRET | gere-um-segredo-forte | Production |
| SESSION_SECRET | gere-um-segredo-forte | Production |
| NEXTAUTH_SECRET | gere-um-segredo-diferente | Production |
| NEXTAUTH_URL | https://adsgram-ten.vercel.app | Production |
| ADMIN_PIN | 1234 | Production |
| TELEGRAM_BOT_TOKEN | 123456:ABC... | Production |
| NEXT_PUBLIC_TELEGRAM_BOT_USERNAME | SeuBotUsername | Production |

Dica: após salvar, dispare um redeploy para as variáveis entrarem em vigor.

Para Development (local), crie um arquivo `.env.local` com:

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
