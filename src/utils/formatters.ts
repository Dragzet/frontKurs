export const formatCurrency = (amount: number, locale = 'ru-RU', currency = 'RUB'): string => {
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    currencyDisplay: 'symbol'
  }).format(amount);
  
  return formatted.replace(/\s+/g, ' ').replace(/\u00A0/g, ' ');
};

export const formatDate = (dateString: string, locale = 'ru-RU'): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const formatDateForInput = (date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

export const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const getMonthName = (dateString: string, locale = 'ru-RU'): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
};

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const generateRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    'Продукты': '#10B981',
    'Транспорт': '#3B82F6',
    'Жилье': '#8B5CF6',
    'Развлечения': '#F59E0B',
    'Здоровье': '#EF4444',
    'Образование': '#6366F1',
    'Одежда': '#EC4899',
    'Рестораны': '#F97316',
    'Путешествия': '#14B8A6',
    'Другое': '#6B7280',
  };

  return colorMap[category] || `hsl(${Math.abs(hashCode(category) % 360)}, 70%, 50%)`;
};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

export const getExpenseCategories = (): string[] => {
  return [
    'Продукты',
    'Транспорт',
    'Жилье',
    'Развлечения',
    'Здоровье',
    'Образование',
    'Одежда',
    'Рестораны',
    'Путешествия',
    'Другое',
  ];
};

export const getIncomeSources = (): string[] => {
  return [
    'Зарплата',
    'Фриланс',
    'Инвестиции',
    'Подарки',
    'Аренда',
    'Продажи',
    'Другое',
  ];
};