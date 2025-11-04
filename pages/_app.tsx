import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import '@/styles/globals.css'

/**
 * Componente raiz que envolve todas as páginas.
 * - Importa estilos globais do Tailwind
 * - Fornece o SessionProvider do NextAuth (usado no /admin)
 * - Device Frame: simula mobile/tablet em desktop (max-w-lg, bordas, shadow)
 */
export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      {/* Device Frame Wrapper para simular mobile em web - APENAS LIMITA LARGURA, NÃO ALTURA */}
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex justify-center p-0 md:p-4">
        <div className="w-full max-w-lg bg-gray-900 md:rounded-3xl md:border-4 md:border-gray-800 md:shadow-2xl relative min-h-screen">
          {/* Notch simulado (opcional) */}
          <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-950 rounded-b-2xl z-50"></div>
          
          {/* App Content - LIVRE para rolar verticalmente */}
          <div className="w-full">
            <Component {...pageProps} />
          </div>
        </div>
      </div>
    </SessionProvider>
  )
}
