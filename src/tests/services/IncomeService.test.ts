import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IncomeService } from '../../services/IncomeService';
import { IStorageService } from '../../services/storage';
import { IIncome } from '../../types/models';

// Mock storage service
const mockStorage: IStorageService = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
};

describe('IncomeService', () => {
  let service: IncomeService;
  const testIncome = {
    amount: 1000,
    source: 'Salary',
    description: 'Monthly salary',
    date: '2024-03-15',
    isRecurring: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock storage to return empty array by default
    (mockStorage.get as any).mockReturnValue([]);
    service = new IncomeService(mockStorage);
  });

  it('should add an income', () => {
    const income = service.add(testIncome);
    
    // Verify income is created with ID
    expect(income.id).toBeDefined();
    expect(income.amount).toBe(1000);
    expect(income.source).toBe('Salary');
    expect(income.isRecurring).toBe(true);
    
    // Verify storage was updated
    expect(mockStorage.set).toHaveBeenCalledTimes(1);
    
    // Verify getAll returns the added income
    const all = service.getAll();
    expect(all.length).toBe(1);
    expect(all[0].id).toBe(income.id);
  });

  it('should filter incomes by period', () => {
    const income1 = service.add({...testIncome, date: '2024-03-15'});
    const income2 = service.add({...testIncome, date: '2024-04-15'});
    
    const marchIncomes = service.getByPeriod('2024-03');
    expect(marchIncomes.length).toBe(1);
    expect(marchIncomes[0].id).toBe(income1.id);
    
    const aprilIncomes = service.getByPeriod('2024-04');
    expect(aprilIncomes.length).toBe(1);
    expect(aprilIncomes[0].id).toBe(income2.id);
  });

  it('should remove an income', () => {
    const income = service.add(testIncome);
    expect(service.getAll().length).toBe(1);
    
    service.remove(income.id);
    expect(service.getAll().length).toBe(0);
  });

  it('should calculate total income by period', () => {
    service.add({...testIncome, amount: 1000, date: '2024-03-15'});
    service.add({...testIncome, amount: 500, date: '2024-03-20'});
    service.add({...testIncome, amount: 2000, date: '2024-04-15'});
    
    expect(service.getTotalByPeriod('2024-03')).toBe(1500);
    expect(service.getTotalByPeriod('2024-04')).toBe(2000);
    expect(service.getTotalByPeriod()).toBe(3500);
  });

  it('should load incomes from storage', () => {
    const savedIncomes: IIncome[] = [
      { 
        id: '1', 
        amount: 1000, 
        source: 'Salary', 
        description: 'Monthly salary', 
        date: '2024-03-15',
        isRecurring: true
      }
    ];
    
    (mockStorage.get as any).mockReturnValue(savedIncomes);
    
    // Create a new service instance that should load from storage
    const newService = new IncomeService(mockStorage);
    
    expect(newService.getAll().length).toBe(1);
    expect(newService.getAll()[0].id).toBe('1');
  });
});
