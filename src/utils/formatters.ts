// Format currency amount
export const formatCurrency = (amount: number, locale = 'ru-RU', currency = 'RUB'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date for display
export const formatDate = (dateString: string, locale = 'ru-RU'): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// Format date for input fields (YYYY-MM-DD)
export const formatDateForInput = (date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

// Get current month and year (YYYY-MM)
export const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Get month name from date string
export const getMonthName = (dateString: string, locale = 'ru-RU'): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
};

// Calculate percentage
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Generate random color for charts
export const generateRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Generate consistent colors for categories
export const getCategoryColor = (category: string): string => {
  // Predefined colors for common categories
  const colorMap: Record<string, string> = {
    'Продукты': '#10B981', // Green
    'Транспорт': '#3B82F6', // Blue
    'Жилье': '#8B5CF6', // Purple
    'Развлечения': '#F59E0B', // Yellow
    'Здоровье': '#EF4444', // Red
    'Образование': '#6366F1', // Indigo
    'Одежда': '#EC4899', // Pink
    'Рестораны': '#F97316', // Orange
    'Путешествия': '#14B8A6', // Teal
    'Другое': '#6B7280', // Gray
  };

  // Return the predefined color or generate a consistent one
  return colorMap[category] || `hsl(${Math.abs(hashCode(category) % 360)}, 70%, 50%)`;
};

// Simple hash function to generate consistent colors
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

// Get expense categories
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

// Get income sources
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