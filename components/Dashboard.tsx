import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Header from '@/components/Header'
import WalletCard from '@/components/WalletCard'
import AdModal from '@/components/AdModal'
import TaskModal from '@/components/TaskModal'
import { HiOutlinePlay, HiOutlineCheckCircle, HiOutlineSparkles, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2'
import { formatCentsToUSD, getTaskTypeLabel, getTaskTypeIcon, getCategoryLabel } from '@/lib/labels'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

// Tipos mínimos para renderizar listas
export type Ad = { id: string; title: string; categoryCode?: number; rewardCents: number }
export type Task = { id: string; title: string; typeCode: number; categoryCode?: number; rewardCents: number }

/**
 * Dashboard principal com design profissional dark neon Web3
 * - Cards rounded-2xl com bordas neon translúcidas
 * - Badges de recompensa com ícone
 * - Estados: loading (skeletons), vazio (mensagem), erro
 * - Botões Ver/Iniciar com animações e glow
 * - Mobile-first, responsivo
 */
export default function Dashboard() {
  const [ads, setAds] = useState<Ad[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [usdCents, setUsdCents] = useState<number>(0)
  const [brlCents, setBrlCents] = useState<number>(0)
  const [goldAds, setGoldAds] = useState<number>(0)
  const [activeAd, setActiveAd] = useState<Ad | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [error, setError] = useState<string>('')
  const router = useRouter()

  // Função de logout REAL - chama API e limpa sessão
  async function handleLogout() {
    const loadingToast = toast.loading('Saindo...')
    try {
      console.log('[Dashboard] Iniciando logout...')
      
      // Chama endpoint de logout para remover cookie JWT
      const res = await fetch('/api/auth/logout', { 
        method: 'POST',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      if (!res.ok) {
        throw new Error('Erro ao fazer logout')
      }
      
      toast.dismiss(loadingToast)
      toast.success('👋 Até logo!')
      
      console.log('[Dashboard] Logout bem-sucedido, redirecionando...')
      
      // Aguarda 500ms para garantir que cookie foi limpo e toast foi visto
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Detecta página atual e redireciona para mesma (que agora vai mostrar modal de login)
      const currentPath = window.location.pathname
      console.log('[Dashboard] Caminho atual:', currentPath)
      
      if (currentPath === '/indexlocal') {
        console.log('[Dashboard] Recarregando /indexlocal')
        window.location.replace('/indexlocal')
      } else {
        console.log('[Dashboard] Recarregando /')
        window.location.replace('/')
      }
    } catch (e) {
      console.error('[Dashboard] Erro durante logout:', e)
      toast.dismiss(loadingToast)
      toast.error('Erro ao sair')
      
      // Mesmo com erro, tenta redirecionar
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Redireciona para página atual para forçar recheck de sessão
      window.location.reload()
    }
  }

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [adsRes, tasksRes, meRes] = await Promise.all([
          fetch('/api/ads/list'),
          fetch('/api/tasks/list'),
          fetch('/api/me')
        ])
        if (!mounted) return
        
        if (!adsRes.ok || !tasksRes.ok || !meRes.ok) {
          setError('Erro ao carregar dados. Tente novamente.')
          return
        }

        const [adsData, tasksData, meData] = await Promise.all([
          adsRes.json(), tasksRes.json(), meRes.json()
        ])
        setAds(adsData.ads ?? [])
        setTasks(tasksData.tasks ?? [])
        setUsdCents(meData.user?.balanceCents ?? 0)
        setBrlCents(meData.user?.brlBalanceCents ?? 0)
        setGoldAds(meData.user?.goldAds ?? 0)
      } catch (err) {
        if (mounted) setError('Erro de conexão. Verifique sua internet.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  async function refreshAll() {
    try {
      const [adsRes, tasksRes, meRes] = await Promise.all([
        fetch('/api/ads/list'),
        fetch('/api/tasks/list'),
        fetch('/api/me')
      ])
      const [adsData, tasksData, meData] = await Promise.all([
        adsRes.json(), tasksRes.json(), meRes.json()
      ])
      setAds(adsData.ads ?? [])
      setTasks(tasksData.tasks ?? [])
      setUsdCents(meData.user?.balanceCents ?? 0)
      setBrlCents(meData.user?.brlBalanceCents ?? 0)
      setGoldAds(meData.user?.goldAds ?? 0)
      setError('')
    } catch {
      setError('Erro ao atualizar dados.')
    }
  }

  // Skeleton loader
  const Skeleton = () => (
    <div className="rounded-2xl p-4 bg-gray-800/40 border border-gray-700/30 animate-pulse">
      <div className="h-5 bg-gray-700/50 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
    </div>
  )

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <Header 
        usdCents={usdCents} 
        brlCents={brlCents} 
        goldAds={goldAds}
      />
      
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Botão Logout */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600/30 transition-all text-sm font-semibold"
        >
          <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
          Sair
        </motion.button>
        {/* Erro global */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4 bg-red-900/20 border border-red-500/30 text-red-200 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Seção: Anúncios */}
        <section>
          <h2 
            className="text-2xl font-bold mb-4 text-white flex items-center gap-2"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <HiOutlinePlay className="w-6 h-6 text-cyan-400" />
            Anúncios disponíveis hoje
          </h2>

          {loading && (
            <div className="space-y-3">
              <Skeleton />
              <Skeleton />
            </div>
          )}

          {!loading && ads.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl p-6 bg-gray-800/40 border border-gray-700/30 text-center"
            >
              <HiOutlineSparkles className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                Nenhum anúncio disponível no momento. Volte mais tarde!
              </p>
            </motion.div>
          )}

          {/* ANÚNCIOS: SEMPRE GRID-1 (VERTICAL STACK) */}
          <div className="space-y-4">
            {ads.map((ad, idx) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-2xl p-4 bg-gray-800/40 border border-blue-700/30 hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-base mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {ad.title}
                    </h3>
                    <p className="text-xs text-cyan-400">
                      {ad.categoryCode !== undefined ? getCategoryLabel(ad.categoryCode) : 'Geral'}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* Badge recompensa */}
                    <span className="px-2 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-semibold">
                      +{formatCentsToUSD(ad.rewardCents)}
                    </span>

                    {/* Botão Ver */}
                    <button
                      onClick={() => setActiveAd(ad)}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all btn-neon"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      Ver
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Seção: Tarefas */}
        <section>
          <h2 
            className="text-2xl font-bold mb-4 text-white flex items-center gap-2"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <HiOutlineCheckCircle className="w-6 h-6 text-green-400" />
            Tarefas
          </h2>

          {loading && (
            <div className="space-y-3">
              <Skeleton />
              <Skeleton />
            </div>
          )}

          {!loading && tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl p-6 bg-gray-800/40 border border-gray-700/30 text-center"
            >
              <HiOutlineSparkles className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                Nenhuma tarefa disponível no momento. Volte mais tarde!
              </p>
            </motion.div>
          )}

          {/* TAREFAS: SEMPRE GRID-1 (VERTICAL STACK) - SEM limite de altura */}
          <div className="space-y-4">
            {tasks.map((task, idx) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-2xl p-4 bg-gray-800/40 border border-emerald-700/30 hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getTaskTypeIcon(task.typeCode)}</span>
                      <h3 className="font-semibold text-white text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {task.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-medium">
                        {getTaskTypeLabel(task.typeCode)}
                      </span>
                      {task.categoryCode !== undefined && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-medium">
                          {getCategoryLabel(task.categoryCode)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* Badge recompensa */}
                    <span className="px-2 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-semibold">
                      +{formatCentsToUSD(task.rewardCents)}
                    </span>

                    {/* Botão Iniciar */}
                    <button
                      onClick={() => setActiveTask(task)}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all btn-neon"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      Iniciar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Modais */}
      {activeAd && (
        <AdModal
          ad={activeAd}
          onClose={() => setActiveAd(null)}
          onCompleted={async () => {
            await refreshAll()
            setActiveAd(null)
          }}
        />
      )}

      {activeTask && (
        <TaskModal
          task={activeTask}
          onClose={() => setActiveTask(null)}
          onSubmitted={async () => {
            const tasksRes = await fetch('/api/tasks/list')
            const tasksData = await tasksRes.json()
            setTasks(tasksData.tasks ?? [])
            setActiveTask(null)
          }}
        />
      )}
    </main>
  )
}
