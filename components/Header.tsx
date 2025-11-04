import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineUser, HiOutlineWallet, HiOutlineArrowLeft, HiOutlineCurrencyDollar, HiOutlineBanknotes, HiOutlineSparkles } from 'react-icons/hi2'
import { formatCentsToUSD, formatCentsToBRL } from '@/lib/labels'

type Props = {
  usdCents?: number
  brlCents?: number
  goldAds?: number
}

/**
 * Header profissional com design dark neon Web3
 * - Gradiente 90deg (primary → accent)
 * - Altura 64px fixa
 * - Montserrat 700 para logo
 * - Botão Carteira e Perfil
 * - Drawer lateral para carteira
 * - Mobile-first, responsivo
 */
export default function Header({ usdCents = 0, brlCents = 0, goldAds = 0 }: Props) {
  const [walletOpen, setWalletOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 bg-neon-gradient shadow-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-white text-xl md:text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            AdsGram
          </Link>

          {/* Direita: Carteira + Perfil */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Botão Carteira */}
            <button
              onClick={() => setWalletOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
              aria-label="Abrir Carteira"
            >
              <HiOutlineWallet className="w-5 h-5 text-white" />
              <span className="hidden sm:inline text-sm text-white font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Carteira
              </span>
            </button>

            {/* Link Perfil */}
            <Link
              href="/profile"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
              aria-label="Ir para Perfil"
            >
              <HiOutlineUser className="w-5 h-5 text-white" />
              <span className="hidden sm:inline text-sm text-white font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Perfil
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Wallet Drawer (slide from right) */}
      <AnimatePresence>
        {walletOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWalletOpen(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                {/* Header do Drawer */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <HiOutlineWallet className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Minha Carteira
                    </h2>
                  </div>
                  <button
                    onClick={() => setWalletOpen(false)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <HiOutlineArrowLeft className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Saldos */}
                <div className="space-y-4 mb-6">
                  {/* USD */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl p-4 bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-500/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <HiOutlineCurrencyDollar className="w-5 h-5 text-green-400" />
                        <span className="text-sm text-green-300">USDT</span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300">
                        Ativo
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {formatCentsToUSD(usdCents)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">≈ {(usdCents / 100).toFixed(8)} USDT</p>
                  </motion.div>

                  {/* BRL */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl p-4 bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 border border-yellow-500/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <HiOutlineBanknotes className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm text-yellow-300">PIX (BRL)</span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
                        Ativo
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {formatCentsToBRL(brlCents)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Real Brasileiro</p>
                  </motion.div>

                  {/* GoldAds */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl p-4 bg-gradient-to-br from-amber-900/40 to-amber-800/40 border border-amber-500/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <HiOutlineSparkles className="w-5 h-5 text-amber-400" />
                        <span className="text-sm text-amber-300">GoldAds</span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-300">
                        Moeda Interna
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {goldAds.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Pontos de recompensa</p>
                  </motion.div>
                </div>

                {/* Logs/Histórico (placeholder) */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Transações Recentes
                  </h3>
                  <div className="rounded-xl p-4 bg-white/5 border border-gray-700/50 text-center">
                    <HiOutlineSparkles className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Em breve: histórico de transações</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
