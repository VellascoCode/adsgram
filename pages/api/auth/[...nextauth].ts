import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Rate limit simples por IP: aguarda 15s após erro de PIN
const lockMap = new Map<string, number>()
const LOCK_MS = 15_000

const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'AdminPIN',
      credentials: {
        pin: { label: 'PIN', type: 'password' }
      },
      async authorize(credentials, req) {
        const ip = (req as any)?.headers?.['x-forwarded-for'] ?? (req as any)?.socket?.remoteAddress ?? 'unknown'
        const last = lockMap.get(ip) || 0
        if (Date.now() - last < LOCK_MS) {
          throw new Error('Aguarde 15s para nova tentativa')
        }
        const expected = process.env.ADMIN_PIN || '1234'
        if (credentials?.pin === expected) {
          return { id: 'admin', name: 'Admin' }
        }
        lockMap.set(ip, Date.now())
        throw new Error('PIN inválido. Aguarde 15s.')
      }
    })
  ],
  pages: { signIn: '/admin' },
}

export default NextAuth(authOptions)
export { authOptions }
