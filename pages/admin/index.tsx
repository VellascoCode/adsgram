import { signIn, signOut, useSession } from 'next-auth/react'
import Head from 'next/head'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HiOutlineShieldCheck, 
  HiOutlineCheckCircle, 
  HiOutlineXCircle, 
  HiOutlineBanknotes,
  HiOutlineArrowPath,
  HiOutlineArrowRightOnRectangle,
  HiOutlineSparkles,
  HiOutlineUser,
  HiOutlineRectangleGroup,
  HiOutlineClipboardDocumentCheck,
  HiOutlineCreditCard,
  HiOutlineUsers,
  HiOutlineMegaphone
} from 'react-icons/hi2'
import toast, { Toaster } from 'react-hot-toast'

/**
 * Painel Admin profissional com design gamificado
 * - Login PIN com 4 inputs estilizados e lock visual
 * - Dashboard mobile-first (SEM grid no mobile)
 * - Cards grandes com ações claras
 * - Toasts para feedback
 */
export default function AdminPage() {
  const { data: session, status } = useSession()
  const [digits, setDigits] = useState<string[]>(['', '', '', ''])
  const inputsRef = useRef<Array<HTMLInputElement | null>>([null, null, null, null])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lockedUntil, setLockedUntil] = useState<number>(0)
  const [lockCountdown, setLockCountdown] = useState<number>(0)

  // Countdown visual do lock
  useEffect(() => {
    if (lockedUntil === 0) return
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
      setLockCountdown(remaining)
      if (remaining === 0) {
        setLockedUntil(0)
        clearInterval(interval)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [lockedUntil])

  async function handleLogin(pin: string) {
    if (Date.now() < lockedUntil) return
    setLoading(true)
    setError(null)
    const res = await signIn('credentials', { redirect: false, pin })
    if (res?.error) {
      setError(res.error)
      toast.error('PIN incorreto! Aguarde 5 segundos.')
      // trava 5s
      const until = Date.now() + 5000
      setLockedUntil(until)
      // feedback visual: limpar e focar no primeiro
      setDigits(['', '', '', ''])
      inputsRef.current[0]?.focus()
    } else {
      toast.success('Login realizado com sucesso!')
    }
    setLoading(false)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const pin = digits.join('')
    await handleLogin(pin)
  }

  const authed = !!session

  if (!authed) {
    return (
      <>
        <Head><title>Admin Login – AdsGram</title></Head>
        <Toaster position="top-center" />
        <div className="min-h-screen bg-[var(--brand-bg)] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            {/* Badge Admin */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
                <HiOutlineShieldCheck className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Painel Admin
              </h1>
              <p className="text-sm text-gray-400">Digite o PIN de 4 dígitos</p>
            </motion.div>

            {/* Card de Login */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl border border-purple-500/30"
            >
              <form onSubmit={onSubmit} className="space-y-6">
                {/* PIN Inputs */}
                <div className="flex items-center gap-3 justify-center">
                  {digits.map((d, idx) => (
                    <motion.input
                      key={idx}
                      ref={(el) => { inputsRef.current[idx] = el }}
                      value={d}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 1)
                        const next = [...digits]
                        next[idx] = v
                        setDigits(next)
                        if (v && idx < 3) {
                          inputsRef.current[idx + 1]?.focus()
                        }
                        // Auto-submit quando preencher o 4º dígito
                        if (v && idx === 3) {
                          setTimeout(() => {
                            const pin = [...next.slice(0, 3), v].join('')
                            if (pin.length === 4) {
                              handleLogin(pin)
                            }
                          }, 100)
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
                          inputsRef.current[idx - 1]?.focus()
                        }
                      }}
                      disabled={loading || Date.now() < lockedUntil}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      whileFocus={{ scale: 1.05 }}
                      className={`w-16 h-16 text-center rounded-2xl border-2 bg-gray-900/50 text-2xl font-bold text-white focus:outline-none focus:ring-2 transition-all ${
                        error ? 'border-red-500 focus:ring-red-500' : 'border-purple-500/50 focus:ring-purple-500'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                  ))}
                </div>

                {/* Lock Countdown Visual */}
                {lockCountdown > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-3 rounded-xl bg-red-500/20 border border-red-500/40"
                  >
                    <p className="text-red-300 text-sm font-semibold">
                      🔒 Bloqueado por {lockCountdown}s
                    </p>
                  </motion.div>
                )}

                {/* Error Message */}
                <AnimatePresence>
                  {error && lockCountdown === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-center p-3 rounded-xl bg-red-500/20 border border-red-500/40"
                    >
                      <p className="text-red-300 text-sm">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button (hidden, form submits on 4th digit) */}
                <p className="text-center text-xs text-gray-500">
                  {loading ? 'Validando...' : 'O login é automático após 4 dígitos'}
                </p>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head><title>Admin Dashboard – AdsGram</title></Head>
      <Toaster position="top-center" />
      <AdminDashboard onLogout={() => signOut()} />
    </>
  )
}

type TabType = 'dashboard' | 'users' | 'ads' | 'tasks' | 'adviews' | 'taskcompletions' | 'withdrawals' | 'allwithdrawals'

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState<{ tasks: any[], withdrawals: any[] }>({ tasks: [], withdrawals: [] })
  const [stats, setStats] = useState({
    users: 0,
    ads: 0,
    tasks: 0,
    adViews: 0,
    pendingTaskCompletions: 0,
    allTaskCompletions: 0,
    pendingWithdrawals: 0,
    allWithdrawals: 0
  })
  
  // Sistema de badges: rastreia quais tabs foram visitadas
  const [viewedTabs, setViewedTabs] = useState<Set<TabType>>(new Set())
  
  // Carregar tabs visitadas do localStorage
  useEffect(() => {
    const stored = localStorage.getItem('admin_viewed_tabs')
    if (stored) {
      try {
        setViewedTabs(new Set(JSON.parse(stored)))
      } catch (e) {
        // Ignore invalid data
      }
    }
  }, [])
  
  // Marcar tab como visitada quando mudar
  useEffect(() => {
    if (activeTab !== 'dashboard') {
      const newViewed = new Set(viewedTabs)
      newViewed.add(activeTab)
      setViewedTabs(newViewed)
      localStorage.setItem('admin_viewed_tabs', JSON.stringify([...newViewed]))
    }
  }, [activeTab])
  
  // Função auxiliar para verificar se deve mostrar badge
  const shouldShowBadge = (tab: TabType, count: number): boolean => {
    if (count === 0) return false // Sem itens, sem badge
    return !viewedTabs.has(tab) // Mostra badge se não foi visitado
  }

  async function refresh() {
    setLoading(true)
    try {
      const [pendingRes, statsRes] = await Promise.all([
        fetch('/api/admin/pending'),
        fetch('/api/admin/stats')
      ])
      if (!pendingRes.ok || !statsRes.ok) throw new Error('Falha ao carregar dados')
      const pendingData = await pendingRes.json()
      const statsData = await statsRes.json()
      setPending(pendingData)
      setStats(statsData)
    } catch (e: any) {
      toast.error('Falha ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function approveTask(id: string, approve: boolean) {
    const loadingToast = toast.loading(approve ? 'Aprovando...' : 'Rejeitando...')
    const res = await fetch('/api/admin/approveTask', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ id, approve }) 
    })
    toast.dismiss(loadingToast)
    if (!res.ok) { 
      toast.error('Falha ao processar') 
      return 
    }
    toast.success(approve ? '✅ Tarefa aprovada!' : '❌ Tarefa rejeitada')
    refresh()
  }

  async function markPaid(id: string) {
    const loadingToast = toast.loading('Marcando como pago...')
    const res = await fetch('/api/admin/markWithdrawPaid', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ id }) 
    })
    toast.dismiss(loadingToast)
    if (!res.ok) { 
      toast.error('Falha ao marcar como pago') 
      return 
    }
    toast.success('✅ Pagamento marcado como pago!')
    refresh()
  }

  const menuItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: HiOutlineRectangleGroup },
    { id: 'users' as TabType, label: 'Usuários', icon: HiOutlineUsers, badge: stats.users },
    { id: 'ads' as TabType, label: 'Anúncios', icon: HiOutlineMegaphone, badge: stats.ads },
    { id: 'tasks' as TabType, label: 'Tarefas Pendentes', icon: HiOutlineClipboardDocumentCheck, badge: stats.pendingTaskCompletions },
    { id: 'taskcompletions' as TabType, label: 'Todas Tarefas', icon: HiOutlineCheckCircle, badge: stats.allTaskCompletions },
    { id: 'withdrawals' as TabType, label: 'Saques Pendentes', icon: HiOutlineCreditCard, badge: stats.pendingWithdrawals },
    { id: 'allwithdrawals' as TabType, label: 'Todos Saques', icon: HiOutlineBanknotes, badge: stats.allWithdrawals },
    { id: 'adviews' as TabType, label: 'Visualizações', icon: HiOutlineSparkles, badge: stats.adViews },
  ]

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] relative">
      {/* Slide Menu Lateral */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            {/* Menu */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-gradient-to-br from-gray-900 to-gray-800 border-r border-purple-500/30 z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Logo/Header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <HiOutlineShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Admin Panel
                    </h2>
                    <p className="text-xs text-gray-400">Gerenciamento</p>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.id
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id)
                          setMenuOpen(false)
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="font-semibold">{item.label}</span>
                        </div>
                        {item.badge && item.badge > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            isActive ? 'bg-white text-purple-600' : 'bg-red-500 text-white'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>

                {/* Logout */}
                <div className="mt-8 pt-8 border-t border-gray-700">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                  >
                    <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                    <span className="font-semibold">Sair</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* NavHeader Profissional */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl p-4 bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeTab !== 'dashboard' ? (
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 transition-all shadow-lg"
                  title="Voltar ao Dashboard"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 transition-all shadow-lg"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              
              <div>
                <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {activeTab === 'dashboard' ? 'Dashboard' : menuItems.find(m => m.id === activeTab)?.label}
                </h1>
                <p className="text-xs text-gray-400">Admin • Gerenciamento</p>
              </div>
            </div>
            
            <button
              onClick={() => refresh()}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              title="Atualizar"
            >
              <HiOutlineArrowPath className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* Navegação removida - agora é slide menu */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 hidden"
        >
          {menuItems.map((tab, idx) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 relative ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {tab.badge}
                </span>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Conteúdo Dinâmico por Tab - TRUE MOUNT/UNMOUNT */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* TAB: Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={refresh}
                disabled={loading}
                className="w-full mb-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <HiOutlineArrowPath className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Atualizando...' : 'Atualizar Dados'}
              </motion.button>
              <div className="space-y-6">
                {/* Stats Grid - GRID 2 COLUNAS */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Card 1: Usuários */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('users')}
                    className="w-full rounded-2xl p-4 bg-gradient-to-br from-purple-600 to-purple-700 shadow-lg text-left flex flex-col items-center justify-center relative"
                  >
                    {shouldShowBadge('users', stats.users) && (
                      <motion.div
                        className="absolute -top-2 -right-2 min-w-[28px] h-7 rounded-full bg-red-500 shadow-lg flex items-center justify-center px-2"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-sm font-bold text-white">{stats.users}</span>
                      </motion.div>
                    )}
                    <HiOutlineUsers className="w-8 h-8 text-white mb-2" />
                    <p className="text-3xl font-bold text-white">{stats.users}</p>
                    <p className="text-xs text-white/80 mt-1">Usuários</p>
                  </motion.button>

                  {/* Card 2: Anúncios */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('ads')}
                    className="w-full rounded-2xl p-4 bg-gradient-to-br from-cyan-600 to-cyan-700 shadow-lg text-left flex flex-col items-center justify-center relative"
                  >
                    {shouldShowBadge('ads', stats.ads) && (
                      <motion.div
                        className="absolute -top-2 -right-2 min-w-[28px] h-7 rounded-full bg-red-500 shadow-lg flex items-center justify-center px-2"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-sm font-bold text-white">{stats.ads}</span>
                      </motion.div>
                    )}
                    <HiOutlineMegaphone className="w-8 h-8 text-white mb-2" />
                    <p className="text-3xl font-bold text-white">{stats.ads}</p>
                    <p className="text-xs text-white/80 mt-1">Anúncios</p>
                  </motion.button>

                  {/* Card 3: Tarefas Pendentes */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('tasks')}
                    className="w-full rounded-2xl p-4 bg-gradient-to-br from-green-600 to-green-700 shadow-lg text-left flex flex-col items-center justify-center relative"
                  >
                    {shouldShowBadge('tasks', stats.pendingTaskCompletions) && (
                      <motion.div
                        className="absolute -top-2 -right-2 min-w-[28px] h-7 rounded-full bg-red-500 shadow-lg flex items-center justify-center px-2"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-sm font-bold text-white">{stats.pendingTaskCompletions}</span>
                      </motion.div>
                    )}
                    <HiOutlineCheckCircle className="w-8 h-8 text-white mb-2" />
                    <p className="text-3xl font-bold text-white">{stats.pendingTaskCompletions}</p>
                    <p className="text-xs text-white/80 mt-1">Tarefas Pendentes</p>
                  </motion.button>

                  {/* Card 4: Saques Pendentes */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('withdrawals')}
                    className="w-full rounded-2xl p-4 bg-gradient-to-br from-orange-600 to-orange-700 shadow-lg text-left flex flex-col items-center justify-center relative"
                  >
                    {shouldShowBadge('withdrawals', stats.pendingWithdrawals) && (
                      <motion.div
                        className="absolute -top-2 -right-2 min-w-[28px] h-7 rounded-full bg-red-500 shadow-lg flex items-center justify-center px-2"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-sm font-bold text-white">{stats.pendingWithdrawals}</span>
                      </motion.div>
                    )}
                    <HiOutlineBanknotes className="w-8 h-8 text-white mb-2" />
                    <p className="text-3xl font-bold text-white">{stats.pendingWithdrawals}</p>
                    <p className="text-xs text-white/80 mt-1">Saques Pendentes</p>
                  </motion.button>

                  {/* Card 5: Visualizações */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('adviews')}
                    className="w-full rounded-2xl p-4 bg-gradient-to-br from-red-600 to-red-700 shadow-lg text-left flex flex-col items-center justify-center relative"
                  >
                    {shouldShowBadge('adviews', stats.adViews) && (
                      <motion.div
                        className="absolute -top-2 -right-2 min-w-[28px] h-7 rounded-full bg-red-500 shadow-lg flex items-center justify-center px-2"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-sm font-bold text-white">{stats.adViews}</span>
                      </motion.div>
                    )}
                    <HiOutlineSparkles className="w-8 h-8 text-white mb-2" />
                    <p className="text-3xl font-bold text-white">{stats.adViews}</p>
                    <p className="text-xs text-white/80 mt-1">Visualizações</p>
                  </motion.button>

                  {/* Card 6: Todas Tarefas */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('taskcompletions')}
                    className="w-full rounded-2xl p-4 bg-gradient-to-br from-teal-600 to-teal-700 shadow-lg text-left flex flex-col items-center justify-center relative"
                  >
                    {shouldShowBadge('taskcompletions', stats.allTaskCompletions) && (
                      <motion.div
                        className="absolute -top-2 -right-2 min-w-[28px] h-7 rounded-full bg-red-500 shadow-lg flex items-center justify-center px-2"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-sm font-bold text-white">{stats.allTaskCompletions}</span>
                      </motion.div>
                    )}
                    <HiOutlineClipboardDocumentCheck className="w-8 h-8 text-white mb-2" />
                    <p className="text-3xl font-bold text-white">{stats.allTaskCompletions}</p>
                    <p className="text-xs text-white/80 mt-1">Todas Tarefas</p>
                  </motion.button>

                  {/* Card 7: Todos Saques */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('allwithdrawals')}
                    className="w-full rounded-2xl p-4 bg-gradient-to-br from-indigo-600 to-indigo-700 shadow-lg text-left flex flex-col items-center justify-center relative"
                  >
                    {shouldShowBadge('allwithdrawals', stats.allWithdrawals) && (
                      <motion.div
                        className="absolute -top-2 -right-2 min-w-[28px] h-7 rounded-full bg-red-500 shadow-lg flex items-center justify-center px-2"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-sm font-bold text-white">{stats.allWithdrawals}</span>
                      </motion.div>
                    )}
                    <HiOutlineCreditCard className="w-8 h-8 text-white mb-2" />
                    <p className="text-3xl font-bold text-white">{stats.allWithdrawals}</p>
                    <p className="text-xs text-white/80 mt-1">Todos Saques</p>
                  </motion.button>

                  {/* Card 8: Tasks Cadastradas */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="w-full rounded-2xl p-4 bg-gradient-to-br from-pink-600 to-pink-700 shadow-lg text-left flex flex-col items-center justify-center"
                  >
                    <HiOutlineRectangleGroup className="w-8 h-8 text-white mb-2" />
                    <p className="text-3xl font-bold text-white">{stats.tasks}</p>
                    <p className="text-xs text-white/80 mt-1">Tasks Cadastradas</p>
                  </motion.button>
                </div>

                {/* Pendências Rápidas */}
                <div className="rounded-2xl p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-purple-500"
                      />
                      <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Ações Pendentes
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab('tasks')}
                        className="w-full p-4 rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border-2 border-emerald-500/40 hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/20 transition-all text-left flex items-center justify-between group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-3 relative z-10">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <HiOutlineCheckCircle className="w-6 h-6 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">Tarefas Pendentes</p>
                            <p className="text-xs text-gray-400">Aprovar ou rejeitar submissões</p>
                          </div>
                        </div>
                        {pending.tasks.length > 0 ? (
                          <motion.span 
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-xl font-bold text-emerald-400 relative z-10 px-3 py-1 rounded-full bg-emerald-500/20"
                          >
                            {pending.tasks.length}
                          </motion.span>
                        ) : (
                          <span className="text-sm text-gray-500 relative z-10">✓</span>
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab('withdrawals')}
                        className="w-full p-4 rounded-xl bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border-2 border-yellow-500/40 hover:border-yellow-500/60 hover:shadow-lg hover:shadow-yellow-500/20 transition-all text-left flex items-center justify-between group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-3 relative z-10">
                          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <HiOutlineBanknotes className="w-6 h-6 text-yellow-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">Saques Pendentes</p>
                            <p className="text-xs text-gray-400">Marcar pagamentos como pagos</p>
                          </div>
                        </div>
                        {pending.withdrawals.length > 0 ? (
                          <motion.span 
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-xl font-bold text-yellow-400 relative z-10 px-3 py-1 rounded-full bg-yellow-500/20"
                          >
                            {pending.withdrawals.length}
                          </motion.span>
                        ) : (
                          <span className="text-sm text-gray-500 relative z-10">✓</span>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB: Tarefas */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <HiOutlineCheckCircle className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Tarefas Pendentes
                </h2>
              </div>

              {pending.tasks.length === 0 ? (
              <div className="rounded-2xl p-6 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/30 text-center">
                <HiOutlineSparkles className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Nenhuma tarefa pendente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.tasks.map((t, idx) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.02, borderColor: 'rgba(16, 185, 129, 0.5)' }}
                    className="rounded-2xl p-4 bg-gradient-to-br from-gray-900 to-gray-800 border border-emerald-500/30 cursor-pointer"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <HiOutlineUser className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">
                          Tarefa: <span className="text-emerald-400">{t.taskId?.slice(-8) || 'N/A'}</span>
                        </p>
                        <p className="text-xs text-gray-400">
                          Usuário: <span className="text-cyan-400">{t.userId?.slice(-8) || 'N/A'}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {t.submissionAt ? new Date(t.submissionAt).toLocaleString('pt-BR', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : 'Data indisponível'}
                        </p>
                        {t.proof && (
                          <p className="text-xs text-gray-400 mt-2 p-2 rounded bg-gray-800/50 border border-gray-700">
                            <span className="font-semibold">Prova:</span> {t.proof.substring(0, 100)}{t.proof.length > 100 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Botões GRANDES mobile-friendly */}
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => approveTask(t.id, true)}
                        className="py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-emerald-600 to-green-500 hover:shadow-lg hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-2"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        <HiOutlineCheckCircle className="w-5 h-5" />
                        Aprovar
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => approveTask(t.id, false)}
                        className="py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-red-600 to-red-500 hover:shadow-lg hover:shadow-red-500/50 transition-all flex items-center justify-center gap-2"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        <HiOutlineXCircle className="w-5 h-5" />
                        Rejeitar
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
              )}
            </div>
          )}

          {/* TAB: Saques */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <HiOutlineBanknotes className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Saques Pendentes
                </h2>
              </div>

              {pending.withdrawals.length === 0 ? (
              <div className="rounded-2xl p-6 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/30 text-center">
                <HiOutlineSparkles className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Nenhum saque pendente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.withdrawals.map((w, idx) => (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.02, borderColor: 'rgba(234, 179, 8, 0.5)' }}
                    className="rounded-2xl p-4 bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-500/30 cursor-pointer"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                        <HiOutlineBanknotes className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-bold text-white">
                          ${(w.amountCents / 100).toFixed(2)} {w.methodCode === 0 ? 'USDT' : 'PIX'}
                        </p>
                        <p className="text-xs text-gray-400">
                          Usuário: <span className="text-cyan-400">{w.userId?.slice(-8) || 'N/A'}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {w.requestDate ? new Date(w.requestDate).toLocaleString('pt-BR', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : 'Data indisponível'}
                        </p>
                        {w.pixKeySnapshot && (
                          <p className="text-xs text-yellow-300 mt-2 p-2 rounded bg-yellow-900/20 border border-yellow-500/30">
                            <span className="font-semibold">PIX:</span> {w.pixKeySnapshot}
                          </p>
                        )}
                        {w.walletAddressSnapshot && (
                          <p className="text-xs text-yellow-300 mt-2 p-2 rounded bg-yellow-900/20 border border-yellow-500/30 font-mono">
                            <span className="font-semibold">Wallet:</span> {w.walletAddressSnapshot}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Botão GRANDE mobile-friendly */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => markPaid(w.id)}
                      className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-green-600 to-emerald-500 hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      <HiOutlineCheckCircle className="w-5 h-5" />
                      Marcar como Pago
                    </motion.button>
                  </motion.div>
                ))}
              </div>
              )}
            </div>
          )}

          {/* TAB: Usuários */}
          {activeTab === 'users' && <UsersTab />}

          {/* TAB: Anúncios */}
          {activeTab === 'ads' && <AdsTab />}

          {/* TAB: Todas Task Completions */}
          {activeTab === 'taskcompletions' && <AllTaskCompletionsTab />}

          {/* TAB: Todos Saques */}
          {activeTab === 'allwithdrawals' && <AllWithdrawalsTab />}

          {/* TAB: Ad Views */}
          {activeTab === 'adviews' && <AdViewsTab />}
        </motion.div>
      </div>
    </div>
  )
}

// Componente: Tab de Usuários - COMPLETO E PROFISSIONAL
function UsersTab() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/admin/users')
        if (res.ok) {
          const data = await res.json()
          setUsers(data.users || [])
        }
      } catch (e) {
        console.error(e)
        toast.error('Erro ao carregar usuários')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-400">Carregando usuários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <HiOutlineUsers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Usuários Cadastrados
            </h2>
            <p className="text-xs text-purple-300">Todos os usuários da plataforma</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{users.length}</p>
          <p className="text-xs text-gray-400">total</p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="rounded-2xl p-12 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/30 text-center">
          <HiOutlineUsers className="w-20 h-20 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">Nenhum usuário encontrado</p>
          <p className="text-gray-500 text-sm">Execute o seed para popular dados</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((u, idx) => (
            <motion.div
              key={u._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl p-5 bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-purple-500/30 hover:border-purple-500/60 transition-all hover:shadow-lg hover:shadow-purple-500/20"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">{u.name?.[0]?.toUpperCase() || '?'}</span>
                  </div>
                  {u.isAdmin && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                      <HiOutlineShieldCheck className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white truncate">{u.name || 'Usuário sem nome'}</h3>
                    {u.isAdmin && (
                      <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-semibold">
                        ADMIN
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <p className="text-xs text-gray-400">
                      <span className="text-gray-500">@</span>{u.telegramUsername || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-400">
                      <span className="text-gray-500">ID:</span> {u.telegramId || 'N/A'}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/30">
                      <p className="text-xs text-green-300">Saldo</p>
                      <p className="text-sm font-bold text-white">${(u.balanceCents / 100).toFixed(2)}</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-900/40 to-violet-900/40 border border-purple-500/30">
                      <p className="text-xs text-purple-300">Level</p>
                      <p className="text-sm font-bold text-white">{u.level || 1}</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30">
                      <p className="text-xs text-cyan-300">XP</p>
                      <p className="text-sm font-bold text-white">{u.xpPoints || 0}</p>
                    </div>
                  </div>

                  {/* Detalhes */}
                  <div className="space-y-1.5">
                    {u.email && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">📧</span>
                        <span className="text-gray-400">{u.email}</span>
                      </div>
                    )}
                    {u.pixKey && (
                      <div className="flex items-center gap-2 text-xs p-2 rounded bg-yellow-900/20 border border-yellow-500/20">
                        <span className="text-yellow-400 font-semibold">PIX:</span>
                        <span className="text-yellow-300 font-mono">{u.pixKey}</span>
                      </div>
                    )}
                    {u.walletAddress && (
                      <div className="flex items-center gap-2 text-xs p-2 rounded bg-cyan-900/20 border border-cyan-500/20">
                        <span className="text-cyan-400 font-semibold">Wallet:</span>
                        <span className="text-cyan-300 font-mono text-[10px]">{u.walletAddress}</span>
                      </div>
                    )}
                    {u.referralCode && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">🔗 Referral:</span>
                        <span className="text-purple-400 font-mono">{u.referralCode}</span>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <p className="text-xs text-gray-600 mt-3">
                    Cadastrado: {new Date(u.createdAt).toLocaleString('pt-BR', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// Componente: Tab de Anúncios - COMPLETO E PROFISSIONAL
function AdsTab() {
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAds() {
      try {
        const res = await fetch('/api/admin/ads')
        if (res.ok) {
          const data = await res.json()
          setAds(data.ads || [])
        }
      } catch (e) {
        console.error(e)
        toast.error('Erro ao carregar anúncios')
      } finally {
        setLoading(false)
      }
    }
    fetchAds()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-400">Carregando anúncios...</p>
        </div>
      </div>
    )
  }

  const statusLabels = { 0: 'Inativo', 1: 'Ativo', 2: 'Finalizado', 3: 'Pausado' }
  const statusColors = { 
    0: { bg: 'from-gray-900/40 to-gray-800/40', border: 'border-gray-500/30', text: 'text-gray-400', badge: 'bg-gray-900/30 text-gray-400 border-gray-500/30' },
    1: { bg: 'from-green-900/40 to-emerald-800/40', border: 'border-green-500/30', text: 'text-green-400', badge: 'bg-green-900/30 text-green-400 border-green-500/30' },
    2: { bg: 'from-blue-900/40 to-cyan-800/40', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-900/30 text-blue-400 border-blue-500/30' },
    3: { bg: 'from-yellow-900/40 to-amber-800/40', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30' }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <HiOutlineMegaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Anúncios Cadastrados
            </h2>
            <p className="text-xs text-cyan-300">Todos os anúncios da plataforma</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{ads.length}</p>
          <p className="text-xs text-gray-400">total</p>
        </div>
      </div>

      {ads.length === 0 ? (
        <div className="rounded-2xl p-12 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/30 text-center">
          <HiOutlineMegaphone className="w-20 h-20 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">Nenhum anúncio encontrado</p>
          <p className="text-gray-500 text-sm">Execute o seed para popular dados</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {ads.map((ad, idx) => {
            const colors = statusColors[ad.statusCode as keyof typeof statusColors] || statusColors[0]
            const budgetRemaining = ad.budgetCents - (ad.viewsCount * ad.rewardCents)
            const budgetPercent = (budgetRemaining / ad.budgetCents) * 100
            
            return (
              <motion.div
                key={ad._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-2xl p-5 bg-gradient-to-br ${colors.bg} border-2 ${colors.border} hover:border-cyan-500/60 transition-all hover:shadow-lg hover:shadow-cyan-500/20`}
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0">
                    <img 
                      src={ad.mediaUrl} 
                      alt={ad.title}
                      className="w-24 h-24 rounded-xl object-cover border-2 border-white/10"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xs">{ad.viewsCount}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white">{ad.title}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full ${colors.badge} border font-semibold whitespace-nowrap`}>
                        {statusLabels[ad.statusCode as keyof typeof statusLabels]}
                      </span>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-900/40 to-green-900/40 border border-emerald-500/30">
                        <p className="text-xs text-emerald-300">Recompensa</p>
                        <p className="text-sm font-bold text-white">${(ad.rewardCents / 100).toFixed(2)}</p>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-900/40 to-violet-900/40 border border-purple-500/30">
                        <p className="text-xs text-purple-300">Views</p>
                        <p className="text-sm font-bold text-white">{ad.viewsCount}</p>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-900/40 to-yellow-900/40 border border-amber-500/30">
                        <p className="text-xs text-amber-300">Orçamento</p>
                        <p className="text-sm font-bold text-white">${(ad.budgetCents / 100).toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Budget Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">Orçamento restante</span>
                        <span className="text-white font-semibold">${(budgetRemaining / 100).toFixed(2)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(0, budgetPercent)}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.05 }}
                          className={`h-full ${budgetPercent > 50 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : budgetPercent > 20 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}
                        />
                      </div>
                    </div>

                    {/* Details */}
                    {ad.targetUrl && (
                      <div className="flex items-center gap-2 text-xs p-2 rounded bg-cyan-900/20 border border-cyan-500/20">
                        <span className="text-cyan-400">🔗</span>
                        <span className="text-cyan-300 truncate">{ad.targetUrl}</span>
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-gray-600 mt-2">
                      Criado: {new Date(ad.createdAt).toLocaleString('pt-BR', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric'
                      })} • Duração: {ad.duration}s
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Componente: Tab de Todas Task Completions
function AllTaskCompletionsTab() {
  const [completions, setCompletions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCompletions() {
      try {
        const res = await fetch('/api/admin/taskcompletions')
        if (res.ok) {
          const data = await res.json()
          setCompletions(data.taskCompletions || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchCompletions()
  }, [])

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Carregando task completions...</div>
  }

  const statusLabels = { 0: 'Pendente', 1: 'Aprovada', 2: 'Rejeitada' }
  const statusColors = { 0: 'yellow', 1: 'green', 2: 'red' }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiOutlineCheckCircle className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Todas as Task Completions
          </h2>
        </div>
        <span className="text-sm text-gray-400">{completions.length} total</span>
      </div>

      {completions.length === 0 ? (
        <div className="rounded-2xl p-8 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/30 text-center">
          <HiOutlineCheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhuma task completion encontrada</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {completions.map((tc, idx) => {
            const color = statusColors[tc.statusCode as keyof typeof statusColors] || 'gray'
            return (
              <motion.div
                key={tc._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`rounded-xl p-4 bg-gradient-to-br from-gray-900 to-gray-800 border border-${color}-500/30 hover:border-${color}-500/50 transition-all`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full bg-${color}-500/20 flex items-center justify-center flex-shrink-0`}>
                    <HiOutlineClipboardDocumentCheck className={`w-5 h-5 text-${color}-400`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white mb-1">
                      Task: <span className="text-cyan-400">{tc.taskId?.toString().slice(-8) || 'N/A'}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      Usuário: <span className="text-purple-400">{tc.userId?.toString().slice(-8) || 'N/A'}</span>
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded bg-${color}-900/30 text-${color}-400 border border-${color}-500/30`}>
                        {statusLabels[tc.statusCode as keyof typeof statusLabels] || 'Desconhecido'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {tc.submissionAt ? new Date(tc.submissionAt).toLocaleString('pt-BR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : 'Data indisponível'}
                    </p>
                    {tc.proof && (
                      <p className="text-xs text-gray-400 mt-2 p-2 rounded bg-gray-800/50 border border-gray-700">
                        <span className="font-semibold">Prova:</span> {tc.proof.substring(0, 80)}{tc.proof.length > 80 ? '...' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Componente: Tab de Todos Saques
function AllWithdrawalsTab() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWithdrawals() {
      try {
        const res = await fetch('/api/admin/withdrawals')
        if (res.ok) {
          const data = await res.json()
          setWithdrawals(data.withdrawals || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchWithdrawals()
  }, [])

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Carregando saques...</div>
  }

  const statusLabels = { 0: 'Pendente', 1: 'Pago', 2: 'Cancelado' }
  const statusColors = { 0: 'yellow', 1: 'green', 2: 'red' }
  const methodLabels = { 0: 'USDT', 1: 'PIX' }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiOutlineBanknotes className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Todos os Saques
          </h2>
        </div>
        <span className="text-sm text-gray-400">{withdrawals.length} total</span>
      </div>

      {withdrawals.length === 0 ? (
        <div className="rounded-2xl p-8 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/30 text-center">
          <HiOutlineBanknotes className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhum saque encontrado</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {withdrawals.map((w, idx) => {
            const color = statusColors[w.statusCode as keyof typeof statusColors] || 'gray'
            return (
              <motion.div
                key={w._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`rounded-xl p-4 bg-gradient-to-br from-gray-900 to-gray-800 border border-${color}-500/30 hover:border-${color}-500/50 transition-all`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full bg-${color}-500/20 flex items-center justify-center flex-shrink-0`}>
                    <HiOutlineBanknotes className={`w-5 h-5 text-${color}-400`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-white">
                      ${(w.amountCents / 100).toFixed(2)} {methodLabels[w.methodCode as keyof typeof methodLabels]}
                    </p>
                    <p className="text-xs text-gray-400">
                      Usuário: <span className="text-purple-400">{w.userId?.toString().slice(-8) || 'N/A'}</span>
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded bg-${color}-900/30 text-${color}-400 border border-${color}-500/30`}>
                        {statusLabels[w.statusCode as keyof typeof statusLabels] || 'Desconhecido'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {w.requestDate ? new Date(w.requestDate).toLocaleString('pt-BR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : 'Data indisponível'}
                    </p>
                    {w.pixKeySnapshot && (
                      <p className="text-xs text-yellow-300 mt-2 p-2 rounded bg-yellow-900/20 border border-yellow-500/30">
                        <span className="font-semibold">PIX:</span> {w.pixKeySnapshot}
                      </p>
                    )}
                    {w.walletAddressSnapshot && (
                      <p className="text-xs text-cyan-300 mt-2 p-2 rounded bg-cyan-900/20 border border-cyan-500/30 font-mono text-[10px]">
                        <span className="font-semibold">Wallet:</span> {w.walletAddressSnapshot}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Componente: Tab de Ad Views
function AdViewsTab() {
  const [adViews, setAdViews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAdViews() {
      try {
        const res = await fetch('/api/admin/adviews')
        if (res.ok) {
          const data = await res.json()
          setAdViews(data.adViews || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchAdViews()
  }, [])

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Carregando visualizações...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiOutlineSparkles className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Visualizações de Anúncios
          </h2>
        </div>
        <span className="text-sm text-gray-400">{adViews.length} total</span>
      </div>

      {adViews.length === 0 ? (
        <div className="rounded-2xl p-8 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/30 text-center">
          <HiOutlineSparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhuma visualização encontrada</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {adViews.map((view, idx) => (
            <motion.div
              key={view._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="rounded-xl p-4 bg-gradient-to-br from-gray-900 to-gray-800 border border-amber-500/30 hover:border-amber-500/50 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <HiOutlineSparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white mb-1">
                    Ad: <span className="text-cyan-400">{view.adId?.toString().slice(-8) || 'N/A'}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Usuário: <span className="text-purple-400">{view.userId?.toString().slice(-8) || 'N/A'}</span>
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded bg-amber-900/30 text-amber-400 border border-amber-500/30">
                      {view.yyyymmdd}
                    </span>
                    {view.credited && (
                      <span className="text-xs px-2 py-1 rounded bg-green-900/30 text-green-400 border border-green-500/30">
                        ✓ Creditado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {view.viewedAt ? new Date(view.viewedAt).toLocaleString('pt-BR', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : 'Data indisponível'}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

