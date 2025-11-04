import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlinePlay, HiOutlineSparkles } from 'react-icons/hi2'
import CountdownTimer from '@/components/CountdownTimer'
import { formatCentsToUSD } from '@/lib/labels'

export type AdItem = { id: string; title: string; rewardCents: number }

type Props = {
  ad: AdItem
  onClose: () => void
  onCompleted: () => Promise<void> | void
}

export default function AdModal({ ad, onClose, onCompleted }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [canComplete, setCanComplete] = useState(false)

  async function markView() {
    if (!canComplete || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/ads/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad.id })
      })
      if (!res.ok) throw new Error(await res.text())
      setDone(true)
      await onCompleted()
    } catch (e) {
      console.error(e)
      alert('Falha ao registrar visualização.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && canComplete) onClose()
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md mx-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-2xl border border-cyan-500/30"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HiOutlinePlay className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Anúncio
            </h3>
          </div>
          <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-sm font-semibold">
            +{formatCentsToUSD(ad.rewardCents)}
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {ad.title}
          </h4>
          <p className="text-sm text-gray-400">
            Mantenha este anúncio aberto por 10 segundos para ganhar a recompensa.
          </p>
        </div>

        {/* Timer */}
        <div className="mb-6">
          <CountdownTimer seconds={10} onComplete={() => setCanComplete(true)} />
        </div>

        {/* Action */}
        {!canComplete ? (
          <div className="text-center py-4">
            <HiOutlineSparkles className="w-12 h-12 text-cyan-400 mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-gray-400">Aguarde o timer completar...</p>
          </div>
        ) : (
          <motion.button
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-green-600 to-emerald-500 hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Poppins, sans-serif' }}
            onClick={markView}
            disabled={submitting || done}
          >
            {done ? '✓ Concluído!' : submitting ? 'Creditando...' : '🎉 Receber Recompensa'}
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  )
}
