import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateForInput,
  getCurrentMonth,
  getMonthName,
  calculatePercentage,
  getCategoryColor,
  getExpenseCategories,
  getIncomeSources,
} from '../../utils/formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats currency correctly for RUB', () => {
      expect(formatCurrency(1234.56)).toBe('1 234,56 ₽');
      expect(formatCurrency(0)).toBe('0,00 ₽');
      expect(formatCurrency(-1234.56)).toBe('-1 234,56 ₽');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly for ru-RU locale', () => {
      const date = '2024-03-15';
      expect(formatDate(date)).toMatch(/15 марта 2024 г\./);
    });
  });

  describe('formatDateForInput', () => {
    it('formats current date for input field', () => {
      const result = formatDateForInput();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('formats specific date for input field', () => {
      const date = new Date('2024-03-15');
      expect(formatDateForInput(date)).toBe('2024-03-15');
    });
  });

  describe('getCurrentMonth', () => {
    it('returns current month in YYYY-MM format', () => {
      const result = getCurrentMonth();
      expect(result).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe('getMonthName', () => {
    it('returns correct month name in Russian', () => {
      expect(getMonthName('2024-03-15')).toBe('март');
      expect(getMonthName('2024-01-15')).toBe('январь');
    });
  });

  describe('calculatePercentage', () => {
    it('calculates percentage correctly', () => {
      expect(calculatePercentage(50, 200)).toBe(25);
      expect(calculatePercentage(0, 100)).toBe(0);
      expect(calculatePercentage(200, 0)).toBe(0);
    });
  });

  describe('getCategoryColor', () => {
    it('returns consistent colors for predefined categories', () => {
      expect(getCategoryColor('Продукты')).toBe('#10B981');
      expect(getCategoryColor('Транспорт')).toBe('#3B82F6');
    });

    it('returns consistent colors for custom categories', () => {
      const color1 = getCategoryColor('CustomCategory1');
      const color2 = getCategoryColor('CustomCategory1');
      expect(color1).toBe(color2);
    });
  });

  describe('getExpenseCategories', () => {
    it('returns array of expense categories', () => {
      const categories = getExpenseCategories();
      expect(categories).toBeInstanceOf(Array);
      expect(categories).toContain('Продукты');
      expect(categories).toContain('Транспорт');
    });
  });

  describe('getIncomeSources', () => {
    it('returns array of income sources', () => {
      const sources = getIncomeSources();
      expect(sources).toBeInstanceOf(Array);
      expect(sources).toContain('Зарплата');
      expect(sources).toContain('Фриланс');
    });
  });
});