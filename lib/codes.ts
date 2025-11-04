// Códigos numéricos padronizados (DB-lean)

// Anúncios
export const AdStatus = {
  Inactive: 0,
  Active: 1,
  Finished: 2,
  Paused: 3,
} as const

export const MediaType = {
  Image: 0,
  Video: 1,
  Html: 2,
} as const

export const Currency = {
  USD: 0,
  BRL: 1,
} as const

// Tarefas
export const TaskStatus = {
  Inactive: 0,
  Active: 1,
  Finished: 2,
} as const

export const TaskType = {
  JoinTelegram: 0,
  VisitSite: 1,
  SignupApp: 2,
} as const

// Submissões de tarefas
export const TaskCompletionStatus = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
} as const

// Saques
export const WithdrawalMethod = {
  USDT: 0,
  PIX: 1,
} as const

export const WithdrawalStatus = {
  Pending: 0,
  Paid: 1,
  Cancelled: 2,
} as const

// Helpers
export function todayYyyymmdd(date = new Date()): number {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  return y * 10000 + m * 100 + d
}
