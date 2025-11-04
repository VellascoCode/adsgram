import { useState } from 'react'
import { formatCentsToUSD } from '@/lib/labels'

export type TaskItem = { id: string; title: string; rewardCents: number; type?: string }

type Props = {
  task: TaskItem
  onClose: () => void
  onSubmitted: () => Promise<void> | void
}

export default function TaskModal({ task, onClose, onSubmitted }: Props) {
  const [proof, setProof] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function submitTask() {
    if (submitting || done) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/tasks/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, proof: proof || undefined })
      })
      if (!res.ok) throw new Error(await res.text())
      setDone(true)
      await onSubmitted()
    } catch (e) {
      console.error(e)
      alert('Falha ao enviar tarefa.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl p-4 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold">{task.title}</h3>
          <button className="text-sm text-gray-500" onClick={onClose}>Fechar</button>
        </div>
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          <p>Leia as instruções da tarefa, execute a ação, e depois clique em Concluir.</p>
          <p className="mt-2">Recompensa (após aprovação): <b>💰 {formatCentsToUSD(task.rewardCents)}</b></p>
        </div>
        <div className="mt-4">
          <label className="block text-sm mb-1">Prova (opcional)</label>
          <input
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
            placeholder="Ex.: usuário/email usado, código, etc."
            value={proof}
            onChange={(e) => setProof(e.target.value)}
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            className="flex-1 px-3 py-2 rounded-md text-white bg-emerald-600 disabled:opacity-60"
            onClick={submitTask}
            disabled={submitting || done}
          >{done ? 'Enviado' : 'Concluir Tarefa'}</button>
        </div>
      </div>
    </div>
  )
}
