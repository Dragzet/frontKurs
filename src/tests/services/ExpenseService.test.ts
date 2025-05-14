import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExpenseService } from '../../services/ExpenseService';
import { IStorageService } from '../../services/storage';
import { IExpense } from '../../types/models';

const mockStorage: IStorageService = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
};

describe('ExpenseService', () => {
  let service: ExpenseService;
  const testExpense = {
    amount: 100,
    category: 'Test',
    description: 'Test expense',
    date: '2024-03-15',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (mockStorage.get as any).mockReturnValue([]);
    service = new ExpenseService(mockStorage);
  });

  it('should add an expense', () => {
    const expense = service.add(testExpense);
    
    expect(expense.id).toBeDefined();
    expect(expense.amount).toBe(100);
    expect(expense.category).toBe('Test');
    
    expect(mockStorage.set).toHaveBeenCalledTimes(1);
    
    const all = service.getAll();
    expect(all.length).toBe(1);
    expect(all[0].id).toBe(expense.id);
  });

  it('should filter expenses by period', () => {
    const expense1 = service.add({...testExpense, date: '2024-03-15'});
    const expense2 = service.add({...testExpense, date: '2024-04-15'});
    
    const marchExpenses = service.getByPeriod('2024-03');
    expect(marchExpenses.length).toBe(1);
    expect(marchExpenses[0].id).toBe(expense1.id);
    
    const aprilExpenses = service.getByPeriod('2024-04');
    expect(aprilExpenses.length).toBe(1);
    expect(aprilExpenses[0].id).toBe(expense2.id);
  });

  it('should remove an expense', () => {
    const expense = service.add(testExpense);
    expect(service.getAll().length).toBe(1);
    
    service.remove(expense.id);
    expect(service.getAll().length).toBe(0);
  });

  it('should calculate total expenses by period', () => {
    service.add({...testExpense, amount: 100, date: '2024-03-15'});
    service.add({...testExpense, amount: 200, date: '2024-03-20'});
    service.add({...testExpense, amount: 300, date: '2024-04-15'});
    
    expect(service.getTotalByPeriod('2024-03')).toBe(300);
    expect(service.getTotalByPeriod('2024-04')).toBe(300);
    expect(service.getTotalByPeriod()).toBe(600);
  });

  it('should group expenses by category', () => {
    service.add({...testExpense, amount: 100, category: 'Food', date: '2024-03-15'});
    service.add({...testExpense, amount: 200, category: 'Food', date: '2024-03-20'});
    service.add({...testExpense, amount: 300, category: 'Transport', date: '2024-03-15'});
    
    const byCategory = service.getByCategory('2024-03');
    expect(byCategory.Food).toBe(300);
    expect(byCategory.Transport).toBe(300);
  });

  it('should load expenses from storage', () => {
    const savedExpenses: IExpense[] = [
      { 
        id: '1', 
        amount: 100, 
        category: 'Food', 
        description: 'Groceries', 
        date: '2024-03-15' 
      }
    ];
    
    (mockStorage.get as any).mockReturnValue(savedExpenses);
    
    const newService = new ExpenseService(mockStorage);
    
    expect(newService.getAll().length).toBe(1);
    expect(newService.getAll()[0].id).toBe('1');
  });
});
