import { useEffect, useRef, useState } from 'react'

type Props = {
  seconds: number
  onComplete?: () => void
}

export default function CountdownTimer({ seconds, onComplete }: Props) {
  const [remaining, setRemaining] = useState<number>(seconds)
  const timerRef = useRef<number | null>(null)
  const completedRef = useRef(false)

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => { if (timerRef.current) window.clearInterval(timerRef.current) }
  }, [])

  // Separate effect to call onComplete when remaining hits 0
  useEffect(() => {
    if (remaining === 0 && !completedRef.current && onComplete) {
      completedRef.current = true
      onComplete()
    }
  }, [remaining, onComplete])

  const progress = Math.min(1, (seconds - remaining) / seconds)

  return (
    <div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className="h-2" style={{ width: `${progress * 100}%`, background: 'var(--brand-warning)' }} />
      </div>
      <p className="mt-2 text-center text-sm">{remaining > 0 ? `Aguarde ${remaining}s…` : 'Pronto!'}</p>
    </div>
  )
}
