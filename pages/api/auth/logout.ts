import { NextApiRequest, NextApiResponse } from 'next'

/**
 * POST /api/auth/logout
 * Remove o cookie de sessão JWT, fazendo logout do usuário
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // CRÍTICO: Remover cookie com MÚLTIPLAS tentativas para garantir
    // Alguns browsers precisam de configurações específicas
    const cookieOptions = [
      'adsgram_token=deleted; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'adsgram_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
      'adsgram_token=; Path=/; Max-Age=0',
    ]
    
    res.setHeader('Set-Cookie', cookieOptions)
    
    // Headers para forçar o browser a não cachear nada após logout
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    res.setHeader('Surrogate-Control', 'no-store')
    
    console.log('[LOG] /api/auth/logout - Usuário deslogado com sucesso, cookie removido')
    
    return res.status(200).json({ success: true, message: 'Logout realizado' })
  } catch (error: any) {
    console.error('[ERROR] /api/auth/logout:', error)
    return res.status(500).json({ error: 'Erro ao fazer logout' })
  }
}
