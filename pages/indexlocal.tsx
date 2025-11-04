import Head from 'next/head';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import Dashboard from '../components/Dashboard';

export default function IndexLocal() {
  const [hasSession, setHasSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch('/api/me', {
        cache: 'no-store',
        headers: { 
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (res.ok) {
        setHasSession(true);
      } else {
        setHasSession(false);
      }
    } catch (error) {
      setHasSession(false);
    } finally {
      setIsCheckingSession(false);
    }
  }

  async function handleDevLogin() {
    setIsLoggingIn(true);
    const loadingToast = toast.loading('Criando usuário de teste...');
    
    try {
      const res = await fetch('/api/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: 'dev_user_test' })
      });

      if (res.ok) {
        toast.dismiss(loadingToast);
        toast.success('✅ Logado como usuário DEV!');
        setTimeout(() => window.location.reload(), 500);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao fazer login');
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleAddSeeds() {
    try {
      const res = await fetch('/api/dev/seed-advanced', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message || 'Seeds adicionados!');
      } else {
        toast.error(data.error || 'Erro ao adicionar seeds');
      }
    } catch (error) {
      toast.error('Erro ao adicionar seeds');
    }
  }

  if (isCheckingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-xl">Verificando sessão...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>AdsGram - DEV Mode</title>
      </Head>

      <Toaster position="top-center" />

      <div className="fixed top-4 right-4 z-50 bg-yellow-500 text-black px-4 py-2 rounded-full font-bold text-sm shadow-lg">
        DEV MODE
      </div>

      {hasSession ? (
        <>
          <Dashboard />
          <button
            onClick={handleAddSeeds}
            className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
            title="Popular Banco de Dados"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </>
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl border-2 border-purple-500/40"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <span className="text-4xl">🚀</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">AdsGram DEV</h1>
              <p className="text-gray-400 text-sm">Ambiente de Desenvolvimento</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDevLogin}
              disabled={isLoggingIn}
              className="w-full py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isLoggingIn ? 'Entrando...' : '🔓 Entrar como DEV'}
            </motion.button>

            <div className="mt-6 text-center text-xs text-gray-500">
              <p>✓ Cria usuário de teste automaticamente</p>
              <p>✓ Sem necessidade de token</p>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
