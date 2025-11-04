import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineUser, HiOutlinePencil, HiOutlineTrophy, HiOutlineSparkles, HiOutlineArrowLeft, HiOutlineFire, HiOutlineShieldCheck, HiOutlineStar } from 'react-icons/hi2'
import Header from '@/components/Header'
import { CategorySelector, TaskTypeSelector } from '@/components/PreferenceSelectors'
import toast from 'react-hot-toast'

type ProfileData = {
  name: string
  email: string
  walletAddress: string
  pixKey: string
  country: string
  state: string
  city: string
  preferredCategories: string[]
  preferredTaskTypes: string[]
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [data, setData] = useState<ProfileData>({
    name: '', email: '', walletAddress: '', pixKey: '', country: '', state: '', city: '', preferredCategories: [], preferredTaskTypes: []
  })
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    let abort = false
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile')
        if (!res.ok) throw new Error('Falha ao carregar perfil')
        const json = await res.json()
        if (abort) return
        setData({
          name: json.user?.name ?? '',
          email: json.user?.email ?? '',
          walletAddress: json.user?.walletAddress ?? '',
          pixKey: json.user?.pixKey ?? '',
          country: json.user?.country ?? '',
          state: json.user?.state ?? '',
          city: json.user?.city ?? '',
          preferredCategories: json.user?.preferredCategories ?? [],
          preferredTaskTypes: json.user?.preferredTaskTypes ?? [],
        })
      } catch (e: any) {
        setError(e?.message || 'Erro desconhecido')
      } finally {
        if (!abort) setLoading(false)
      }
    }
    fetchProfile()
    return () => { abort = true }
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setOk(false)
    try {
      const payload = {
        name: data.name,
        email: data.email || null,
        walletAddress: data.walletAddress || null,
        pixKey: data.pixKey || null,
        country: data.country || null,
        state: data.state || null,
        city: data.city || null,
        preferredCategories: data.preferredCategories,
        preferredTaskTypes: data.preferredTaskTypes,
      }
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || 'Falha ao salvar')
      }
      setOk(true)
    } catch (e: any) {
      setError(e?.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  function setField<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <>
        <Head><title>Perfil – AdsGram</title></Head>
        <div className="min-h-screen bg-[var(--brand-bg)] flex items-center justify-center">
          <p className="text-gray-400">Carregando perfil...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Head><title>Meu Perfil – AdsGram</title></Head>
      <div className="min-h-screen bg-[var(--brand-bg)]">
        <Header />

        <div className="container mx-auto px-4 py-6">
          {/* Header com voltar */}
          <div className="flex items-center gap-3 mb-6">
            <Link href="/" className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <HiOutlineArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Meu Perfil
            </h1>
          </div>

          {/* Profile View - MOBILE FIRST SEM GRID */}
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Card Principal: Avatar e Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-6 bg-gradient-to-br from-gray-900 to-gray-800 border border-cyan-500/30 shadow-xl text-center"
            >
              {/* Avatar gamificado */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 animate-pulse"></div>
                <div className="absolute inset-1 rounded-full bg-gray-900 flex items-center justify-center">
                  <HiOutlineUser className="w-16 h-16 text-cyan-400" />
                </div>
                {/* Badge de nível */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold shadow-lg">
                  LVL 1
                </div>
              </div>

              <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {data.name || 'Usuário'}
              </h2>
              <p className="text-sm text-gray-400 mb-4">{data.email || 'Sem email'}</p>

              {/* Stats - MOBILE FIRST: VERTICAL NO MOBILE, HORIZONTAL NO DESKTOP */}
                            {/* Stats - GAMIFICADO */}
              <div className="space-y-3 mb-4">
                {/* XP Progress Bar */}
                <div className="rounded-xl p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-purple-300 font-semibold flex items-center gap-1">
                      <HiOutlineFire className="w-4 h-4" />
                      XP Progress
                    </span>
                    <span className="text-xs text-purple-300">125 / 500</span>
                  </div>
                  <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '25%' }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="flex gap-3">
                  <div className="flex-1 rounded-xl p-3 bg-yellow-500/10 border border-yellow-500/40">
                    <HiOutlineTrophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                    <p className="text-xs text-yellow-300">Pontos</p>
                    <p className="text-lg font-bold text-white">1,250</p>
                  </div>
                  <div className="flex-1 rounded-xl p-3 bg-cyan-500/10 border border-cyan-500/40">
                    <HiOutlineStar className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                    <p className="text-xs text-cyan-300">Badges</p>
                    <p className="text-lg font-bold text-white">3</p>
                  </div>
                  <div className="flex-1 rounded-xl p-3 bg-green-500/10 border border-green-500/40">
                    <HiOutlineShieldCheck className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <p className="text-xs text-green-300">Conquistas</p>
                    <p className="text-lg font-bold text-white">5</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setEditMode(true)}
                className="w-full py-2 rounded-xl text-white font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-2"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <HiOutlinePencil className="w-4 h-4" />
                Editar Perfil
              </button>
            </motion.div>

            {/* Card: Informações Detalhadas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl p-6 bg-gradient-to-br from-gray-900 to-gray-800 border border-cyan-500/30 shadow-xl space-y-4"
            >
              <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Informações
              </h3>

              {/* MOBILE FIRST: VERTICAL STACK */}
              <div className="space-y-3">
                <InfoItem label="Carteira USDT" value={data.walletAddress || 'Não cadastrada'} />
                <InfoItem label="Chave PIX" value={data.pixKey || 'Não cadastrada'} />
                <InfoItem label="País" value={data.country || 'N/A'} />
                <InfoItem label="Estado" value={data.state || 'N/A'} />
                <InfoItem label="Cidade" value={data.city || 'N/A'} />
              </div>

              <div>
                <p className="text-sm text-gray-200 mb-2 font-medium">Categorias preferidas</p>
                <div className="flex flex-wrap gap-2">
                  {data.preferredCategories.length > 0 ? (
                    data.preferredCategories.map((cat, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-medium">
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">Nenhuma categoria selecionada</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-200 mb-2 font-medium">Tipos de tarefa preferidos</p>
                <div className="flex flex-wrap gap-2">
                  {data.preferredTaskTypes.length > 0 ? (
                    data.preferredTaskTypes.map((type, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-300 text-xs font-medium">
                        {type}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">Nenhum tipo selecionado</span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Edit Drawer (slide from left) */}
        <AnimatePresence>
          {editMode && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditMode(false)}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
              />

              {/* Drawer - COM SCROLLBAR ESTILIZADA */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className="fixed left-0 top-0 bottom-0 z-50 w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl overflow-y-auto custom-scrollbar"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Editar Perfil
                    </h2>
                    <button
                      onClick={() => setEditMode(false)}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <HiOutlineArrowLeft className="w-6 h-6 text-white" />
                    </button>
                  </div>

                  <form onSubmit={onSubmit} className="space-y-4">
                    {error && (
                      <div className="rounded-xl border border-red-500/50 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
                        {error}
                      </div>
                    )}
                    {ok && (
                      <div className="rounded-xl border border-green-500/50 bg-green-500/10 text-green-200 px-4 py-3 text-sm">
                        ✓ Salvo com sucesso!
                      </div>
                    )}

                    <InputField
                      label="Nome *"
                      value={data.name}
                      onChange={(v) => setField('name', v)}
                      placeholder="Seu nome"
                      required
                    />
                    <InputField
                      label="Email"
                      type="email"
                      value={data.email}
                      onChange={(v) => setField('email', v)}
                      placeholder="voce@email.com"
                    />
                    <InputField
                      label="Carteira USDT"
                      value={data.walletAddress}
                      onChange={(v) => setField('walletAddress', v)}
                      placeholder="0x..."
                    />
                    <InputField
                      label="Chave PIX"
                      value={data.pixKey}
                      onChange={(v) => setField('pixKey', v)}
                      placeholder="sua@chave.pix"
                    />
                    <InputField
                      label="País"
                      value={data.country}
                      onChange={(v) => setField('country', v)}
                      placeholder="Brasil"
                    />
                    <InputField
                      label="Estado"
                      value={data.state}
                      onChange={(v) => setField('state', v)}
                      placeholder="SP"
                    />
                    <InputField
                      label="Cidade"
                      value={data.city}
                      onChange={(v) => setField('city', v)}
                      placeholder="São Paulo"
                    />
                    {/* Categorias com Switch Buttons */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-100 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Categorias de Interesse
                      </label>
                      <CategorySelector
                        selected={data.preferredCategories}
                        onChange={(cats) => setField('preferredCategories', cats)}
                      />
                    </div>

                    {/* Tipos de Tarefa com Switch Buttons */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-100 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Tipos de Tarefa Preferidos
                      </label>
                      <TaskTypeSelector
                        selected={data.preferredTaskTypes}
                        onChange={(types) => setField('preferredTaskTypes', types)}
                      />
                    </div>

                    <div className="pt-4 space-y-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-green-600 to-emerald-500 hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="w-full py-3 rounded-xl text-white font-semibold border border-white/20 hover:bg-white/10 transition-all"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

// Helper components - CORES CLARAS
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-3 bg-white/5 border border-white/10">
      <p className="text-xs text-gray-200 mb-1 font-medium">{label}</p>
      <p className="text-sm text-white font-semibold truncate">{value}</p>
    </div>
  )
}

function InputField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-100 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border-2 border-gray-700 bg-gray-900/80 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 transition-all"
      />
    </div>
  )
}
