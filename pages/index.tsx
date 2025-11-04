import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import Dashboard from '@/components/Dashboard'

function isInTelegram(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof (window as any).Telegram !== 'undefined' &&
    !!(window as any).Telegram?.WebApp
  )
}

export default function Home() {
  const [authDone, setAuthDone] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checkingTG, setCheckingTG] = useState(false)

  // Token login state
  const [identifier, setIdentifier] = useState('') // @username, id numérico ou telefone
  const [sendingToken, setSendingToken] = useState(false)
  const [tokenRequested, setTokenRequested] = useState(false)
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const codeValue = useMemo(() => code.join(''), [code])
  const [verifying, setVerifying] = useState(false)

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'SeuBotAqui'

  useEffect(() => {
    let cancelled = false
    async function checkAuth() {
      try {
        const meRes = await fetch('/api/me', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        })

        if (cancelled) return

        if (meRes.ok) {
          setIsLoggedIn(true)
          setAuthDone(true)
          return
        }

        // Se estiver dentro do Telegram WebApp, autentica automaticamente
        if (isInTelegram()) {
          setCheckingTG(true)
          const tg = (window as any).Telegram.WebApp
          tg.ready?.()
          const initData = tg.initData
          if (!initData) {
            setAuthDone(true)
            setCheckingTG(false)
            return
          }

          const res = await fetch('/api/auth/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData }),
          })
          if (!res.ok) {
            // Não trava experiência fora do Telegram
            setCheckingTG(false)
            setAuthDone(true)
            return
          }

          setIsLoggedIn(true)
          setCheckingTG(false)
          setAuthDone(true)
        } else {
          // Fora do Telegram: mostra opções de login
          setAuthDone(true)
        }
      } catch {
        setAuthDone(true)
      }
    }
    checkAuth()
    return () => {
      cancelled = true
    }
  }, [])

  function openTelegramApp() {
    const link = `https://t.me/${botUsername}?startapp=app`
    try {
      if (isInTelegram()) {
        ;(window as any).Telegram?.WebApp?.openTelegramLink?.(link)
      } else {
        window.open(link, '_blank', 'noopener,noreferrer')
      }
    } catch {
      window.location.href = link
    }
  }

  async function requestToken() {
    if (!identifier.trim()) {
      toast.error('Informe seu usuário ou ID do Telegram')
      return
    }
    setSendingToken(true)
    const t = toast.loading('Gerando token...')
    try {
      // OBS: atualmente o endpoint exige admin. Implementaremos versão pública depois.
      const res = await fetch('/api/auth/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any))
        throw new Error(data?.error || 'Falha ao solicitar token')
      }
      // Em produção: o bot envia o token ao usuário no Telegram
      setTokenRequested(true)
      toast.success('Token enviado para seu Telegram')
    } catch (e: any) {
      toast.error(e?.message || 'Não foi possível gerar token agora')
    } finally {
      toast.dismiss(t)
      setSendingToken(false)
    }
  }

  async function verifyToken() {
    if (codeValue.length !== 6 || !/^\d{6}$/.test(codeValue)) {
      toast.error('Digite os 6 dígitos do token')
      return
    }
    setVerifying(true)
    const t = toast.loading('Verificando token...')
    try {
      const res = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeValue }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any))
        throw new Error(data?.error || 'Token inválido')
      }
      toast.success('Login realizado!')
      setTimeout(() => window.location.reload(), 400)
    } catch (e: any) {
      toast.error(e?.message || 'Falha ao verificar token')
    } finally {
      toast.dismiss(t)
      setVerifying(false)
    }
  }

  if (!authDone) {
    return (
      <div className="min-h-screen bg-[var(--brand-bg)] flex items-center justify-center">
        <p className="text-sm text-gray-400">{checkingTG ? 'Autenticando pelo Telegram…' : 'Verificando sessão…'}</p>
      </div>
    )
  }

  if (isLoggedIn) {
    return (
      <>
        <Head>
          <title>AdsGram</title>
        </Head>
        <Dashboard />
      </>
    )
  }

  // Não autenticado e fora do Telegram: mostrar as 3 formas de acesso
  return (
    <>
      <Head>
        <title>AdsGram — Entrar</title>
      </Head>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6">
          <h1 className="text-3xl font-bold text-center">Bem-vindo ao AdsGram</h1>
          <p className="text-center text-gray-400">Escolha uma das opções para entrar</p>

          <div className="space-y-4">
            {/* 1) Entrar com Telegram (abre o bot/app no Telegram) */}
            <div className="rounded-2xl border border-purple-600/40 bg-slate-900/60 p-5">
              <h2 className="font-semibold text-lg mb-2">Entrar com Telegram</h2>
              <p className="text-sm text-gray-400 mb-4">Abrir o bot/app no Telegram e autenticar automaticamente.</p>
              <button
                onClick={openTelegramApp}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 transition font-semibold"
              >
                Abrir no Telegram
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">Bot: @{botUsername}</p>
            </div>

            {/* 2) Entrar com Token (solicitar + digitar 6 dígitos) */}
            <div className="rounded-2xl border border-cyan-600/40 bg-slate-900/60 p-5">
              <h2 className="font-semibold text-lg mb-2">Entrar com Token</h2>
              <p className="text-sm text-gray-400 mb-4">Informe seu usuário ou ID do Telegram para receber um token de 6 dígitos.</p>
              <div className="flex gap-2 mb-3">
                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="@usuario ou ID"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={requestToken}
                  disabled={sendingToken}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 font-medium"
                >
                  {sendingToken ? 'Enviando…' : 'Enviar Token'}
                </button>
              </div>
              <AnimatePresence>
                {(tokenRequested || true) && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-3"
                  >
                    <p className="text-sm text-gray-400 mb-2">Já recebeu? Digite o token:</p>
                    <div className="flex justify-between gap-2">
                      {code.map((d, i) => (
                        <input
                          key={i}
                          value={d}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 1)
                            setCode((old) => {
                              const next = [...old]
                              next[i] = v
                              return next
                            })
                            if (v && i < 5) {
                              const el = document.getElementById(`code-${i + 1}`) as HTMLInputElement | null
                              el?.focus()
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !code[i] && i > 0) {
                              const el = document.getElementById(`code-${i - 1}`) as HTMLInputElement | null
                              el?.focus()
                            }
                          }}
                          id={`code-${i}`}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="w-12 text-center text-lg font-semibold bg-slate-800 border border-slate-700 rounded-xl px-2 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      ))}
                    </div>
                    <button
                      onClick={verifyToken}
                      disabled={verifying}
                      className="mt-4 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-semibold"
                    >
                      {verifying ? 'Entrando…' : 'Entrar'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3) Acessar no Telegram (deep link simples) */}
            <div className="rounded-2xl border border-blue-600/40 bg-slate-900/60 p-5">
              <h2 className="font-semibold text-lg mb-2">Acessar no Telegram</h2>
              <p className="text-sm text-gray-400 mb-4">Abrir o bot diretamente no Telegram.</p>
              <button
                onClick={openTelegramApp}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold"
              >
                Abrir bot @{botUsername}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
