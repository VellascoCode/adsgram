import { motion } from 'framer-motion'
import { HiOutlineCurrencyDollar, HiOutlineBanknotes, HiOutlineSparkles } from 'react-icons/hi2'
import { formatCentsToUSD, formatCentsToBRL } from '@/lib/labels'

type Props = {
  usdCents: number
  brlCents: number
  goldAds: number
}

/**
 * Card de carteira multi-moeda com design gamificado
 * - USD (USDT)
 * - BRL (PIX)
 * - GoldAds (moeda interna do app)
 */
export default function WalletCard({ usdCents, brlCents, goldAds }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 bg-gradient-to-br from-gray-900 to-gray-800 border border-cyan-500/30 shadow-xl"
    >
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineCurrencyDollar className="w-6 h-6 text-cyan-400" />
        <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Carteira
        </h3>
      </div>

      <div className="space-y-3">
        {/* USD */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-green-500/30">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-lg">💵</span>
            </div>
            <div>
              <p className="text-xs text-gray-400">USDT</p>
              <p className="text-base font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {formatCentsToUSD(usdCents)}
              </p>
            </div>
          </div>
        </div>

        {/* BRL */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-yellow-500/30">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <HiOutlineBanknotes className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">PIX (BRL)</p>
              <p className="text-base font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {formatCentsToBRL(brlCents)}
              </p>
            </div>
          </div>
        </div>

        {/* GoldAds */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-amber-500/30">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <HiOutlineSparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">GoldAds</p>
              <p className="text-base font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {goldAds.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
