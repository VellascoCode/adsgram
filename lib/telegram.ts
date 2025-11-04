import crypto from 'crypto'

/**
 * Verifica initData do Telegram WebApp usando HMAC-SHA256 conforme especificação.
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 */
export function verifyTelegramInitData(initData: string, botToken: string): { ok: boolean; user?: any; error?: string } {
  try {
    const urlSearch = new URLSearchParams(initData)
    const receivedHash = urlSearch.get('hash') || ''

    // Monta data_check_string ordenado
    const pairs: string[] = []
    urlSearch.forEach((value, key) => {
      if (key === 'hash') return
      pairs.push(`${key}=${value}`)
    })
    pairs.sort()
    const dataCheckString = pairs.join('\n')

    // secret_key = sha256(bot_token)
    const secretKey = crypto.createHash('sha256').update(botToken).digest()
    const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

    if (hmac !== receivedHash) {
      return { ok: false, error: 'Hash inválido' }
    }

    const userStr = urlSearch.get('user')
    const user = userStr ? JSON.parse(userStr) : undefined
    return { ok: true, user }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Falha ao validar initData' }
  }
}
