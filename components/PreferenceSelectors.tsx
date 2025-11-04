import { motion } from 'framer-motion'
import { CATEGORIES, TASK_TYPES } from '@/lib/labels'

/**
 * Componente de seleção de categorias com switch buttons
 * - Opção "ALL" (todas as categorias)
 * - Se não ALL, mostra lista com on/off switches
 * - Validação: pelo menos 1 deve estar selecionado
 */
export function CategorySelector({
  selected,
  onChange
}: {
  selected: string[]
  onChange: (categories: string[]) => void
}) {
  // ALL = array vazio (backend interpreta como "todas")
  const isAll = selected.length === 0

  function toggleAll() {
    if (isAll) {
      // Desliga ALL → usuário vai escolher manualmente (começa com nenhuma)
      // Para não ficar vazio (que = ALL), força ter pelo menos a primeira
      onChange([CATEGORIES[0]])
    } else {
      // Liga ALL → volta para vazio (= todas)
      onChange([])
    }
  }

  function toggleCategory(category: string) {
    const newSelected = selected.includes(category)
      ? selected.filter(c => c !== category)
      : [...selected, category]

    // Se desmarcar a ÚLTIMA, volta para ALL automaticamente
    if (newSelected.length === 0) {
      onChange([]) // Vazio = ALL
    } else {
      onChange(newSelected)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toggle ALL */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
        <span className="text-sm font-semibold text-white">Todas as Categorias</span>
        <button
          type="button"
          onClick={toggleAll}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isAll ? 'bg-purple-500' : 'bg-gray-700'
          }`}
        >
          <motion.div
            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
            animate={{ x: isAll ? 24 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* Lista de categorias */}
      {!isAll && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2"
        >
          {CATEGORIES.map((cat) => (
            <div
              key={cat}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50 border border-gray-700/30 hover:border-cyan-500/50 transition-colors"
            >
              <span className="text-sm text-gray-200">{cat}</span>
              <button
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  selected.includes(cat) ? 'bg-cyan-500' : 'bg-gray-700'
                }`}
              >
                <motion.div
                  className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md"
                  animate={{ x: selected.includes(cat) ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

/**
 * Componente de seleção de tipos de tarefas com switch buttons
 * - Opção "ALL" (todos os tipos)
 * - Se não ALL, mostra lista com on/off switches
 * - Validação: pelo menos 1 deve estar selecionado
 */
export function TaskTypeSelector({
  selected,
  onChange
}: {
  selected: string[]
  onChange: (types: string[]) => void
}) {
  const allSlugs = TASK_TYPES.map(t => t.slug)
  // ALL = array vazio (backend interpreta como "todos")
  const isAll = selected.length === 0

  function toggleAll() {
    if (isAll) {
      // Desliga ALL → usuário vai escolher manualmente (começa com o primeiro)
      onChange([allSlugs[0]])
    } else {
      // Liga ALL → volta para vazio (= todos)
      onChange([])
    }
  }

  function toggleType(slug: string) {
    const newSelected = selected.includes(slug)
      ? selected.filter(s => s !== slug)
      : [...selected, slug]

    // Se desmarcar o ÚLTIMO, volta para ALL automaticamente
    if (newSelected.length === 0) {
      onChange([]) // Vazio = ALL
    } else {
      onChange(newSelected)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toggle ALL */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/30">
        <span className="text-sm font-semibold text-white">Todos os Tipos de Tarefa</span>
        <button
          type="button"
          onClick={toggleAll}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isAll ? 'bg-green-500' : 'bg-gray-700'
          }`}
        >
          <motion.div
            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
            animate={{ x: isAll ? 24 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* Lista de tipos */}
      {!isAll && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2"
        >
          {TASK_TYPES.map((type) => (
            <div
              key={type.slug}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50 border border-gray-700/30 hover:border-green-500/50 transition-colors"
            >
              <span className="text-sm text-gray-200">{type.label}</span>
              <button
                type="button"
                onClick={() => toggleType(type.slug)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  selected.includes(type.slug) ? 'bg-green-500' : 'bg-gray-700'
                }`}
              >
                <motion.div
                  className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md"
                  animate={{ x: selected.includes(type.slug) ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
