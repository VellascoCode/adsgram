/**
 * Mapeamento de códigos numéricos para labels amigáveis na UI
 * Usado para exibir textos legíveis ao invés de números
 */

// Ad statusCode → Label
export function getAdStatusLabel(statusCode: number): string {
  const map: Record<number, string> = {
    0: 'Inativo',
    1: 'Ativo',
    2: 'Finalizado',
    3: 'Pausado',
  };
  return map[statusCode] || 'Desconhecido';
}

// Ad mediaTypeCode → Label
export function getMediaTypeLabel(mediaTypeCode: number): string {
  const map: Record<number, string> = {
    0: 'Imagem',
    1: 'Vídeo',
    2: 'HTML',
  };
  return map[mediaTypeCode] || 'Desconhecido';
}

// Ad currencyCode → Label
export function getCurrencyLabel(currencyCode: number): string {
  const map: Record<number, string> = {
    0: 'USD',
    1: 'BRL',
  };
  return map[currencyCode] || 'USD';
}

// Task statusCode → Label
export function getTaskStatusLabel(statusCode: number): string {
  const map: Record<number, string> = {
    0: 'Inativa',
    1: 'Ativa',
    2: 'Finalizada',
  };
  return map[statusCode] || 'Desconhecido';
}

// Task typeCode → Label
export function getTaskTypeLabel(typeCode: number): string {
  const map: Record<number, string> = {
    0: 'Entrar no Telegram',
    1: 'Visitar site',
    2: 'Cadastro em app',
    3: 'Assistir vídeo',
    4: 'Responder pesquisa',
    5: 'Seguir perfil',
    6: 'Baixar aplicativo',
    7: 'Compartilhar conteúdo',
    8: 'Completar quiz',
    9: 'Entrar no WhatsApp',
  };
  return map[typeCode] || 'Tarefa';
}

// TaskCompletion statusCode → Label
export function getCompletionStatusLabel(statusCode: number): string {
  const map: Record<number, string> = {
    0: 'Pendente',
    1: 'Aprovada',
    2: 'Rejeitada',
  };
  return map[statusCode] || 'Desconhecido';
}

// Withdrawal methodCode → Label
export function getWithdrawalMethodLabel(methodCode: number): string {
  const map: Record<number, string> = {
    0: 'USDT',
    1: 'PIX',
  };
  return map[methodCode] || 'Desconhecido';
}

// Withdrawal statusCode → Label
export function getWithdrawalStatusLabel(statusCode: number): string {
  const map: Record<number, string> = {
    0: 'Pendente',
    1: 'Pago',
    2: 'Cancelado',
  };
  return map[statusCode] || 'Desconhecido';
}

// Formatação de valores em centavos para exibição
export function formatCentsToUSD(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatCentsToBRL(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2)}`;
}

// Formatação automática baseada no currencyCode
export function formatMoney(cents: number, currencyCode: number): string {
  return currencyCode === 1 ? formatCentsToBRL(cents) : formatCentsToUSD(cents);
}

// 20 Categorias de Anúncios/Tarefas
export const CATEGORIES = [
  'Adulto', 'Crypto', 'Gambling', 'Games', 'Tech', 
  'Finance', 'Health', 'Education', 'Entertainment', 'Travel',
  'Food', 'Fashion', 'Sports', 'Music', 'Movies',
  'Books', 'Art', 'Pets', 'DIY', 'Other'
] as const;

// 10 Tipos de Tarefas (para backend typeCode)
export const TASK_TYPES = [
  { code: 0, label: 'Entrar no Telegram', slug: 'join_telegram' },
  { code: 1, label: 'Visitar site', slug: 'visit_site' },
  { code: 2, label: 'Cadastro em app', slug: 'signup_app' },
  { code: 3, label: 'Assistir vídeo', slug: 'watch_video' },
  { code: 4, label: 'Responder pesquisa', slug: 'survey' },
  { code: 5, label: 'Seguir perfil', slug: 'follow_social' },
  { code: 6, label: 'Baixar aplicativo', slug: 'download_app' },
  { code: 7, label: 'Compartilhar conteúdo', slug: 'share_content' },
  { code: 8, label: 'Completar quiz', slug: 'complete_quiz' },
  { code: 9, label: 'Entrar no WhatsApp', slug: 'join_whatsapp' },
] as const;

// Helper: obter categoria por código numérico
export function getCategoryLabel(categoryCode: number): string {
  return CATEGORIES[categoryCode] || 'Other';
}

// Helper: obter ícone emoji por tipo de tarefa
export function getTaskTypeIcon(typeCode: number): string {
  const icons: Record<number, string> = {
    0: '✈️', // Telegram
    1: '🌐', // Website
    2: '📱', // App
    3: '🎥', // Video
    4: '📝', // Survey
    5: '👤', // Follow
    6: '⬇️', // Download
    7: '📢', // Share
    8: '🎯', // Quiz
    9: '💬', // WhatsApp
  };
  return icons[typeCode] || '📌';
}
