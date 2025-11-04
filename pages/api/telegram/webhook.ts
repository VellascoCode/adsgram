import type { NextApiRequest, NextApiResponse } from 'next'

// Placeholder para integrar com o BotFather (Telegram webhook)
// Mantém 200 OK para permitir configuração futura sem falhar o deploy.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // TODO: tratar updates do Telegram aqui
    return res.status(200).json({ ok: true })
  }
  return res.status(200).send('Telegram webhook OK')
}
