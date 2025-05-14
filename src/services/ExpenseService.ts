import { IExpense, ExpenseCreateDTO } from '../types/models';
import { IExpenseService } from './interfaces';
import { IStorageService } from './storage';
import { generateUUID } from '../utils/uuid';

export class ExpenseService implements IExpenseService {
  private expenses: IExpense[] = [];
  private readonly storageKey = 'expenses';
  
  constructor(private storage: IStorageService) {
    this.loadFromStorage();
  }
  
  private loadFromStorage(): void {
    const storedExpenses = this.storage.get<IExpense[]>(this.storageKey);
    if (storedExpenses) {
      this.expenses = storedExpenses;
    }
  }
  
  private saveToStorage(): void {
    this.storage.set(this.storageKey, this.expenses);
  }
  
  getAll(): IExpense[] {
    return [...this.expenses];
  }
  
  getByPeriod(period: string): IExpense[] {
    return this.expenses.filter(expense => expense.date.startsWith(period));
  }
  
  getById(id: string): IExpense | undefined {
    return this.expenses.find(expense => expense.id === id);
  }
  
  add(expenseData: ExpenseCreateDTO): IExpense {
    const newExpense: IExpense = {
      ...expenseData,
      id: generateUUID()
    };
    
    this.expenses.push(newExpense);
    this.saveToStorage();
    
    return newExpense;
  }
  
  remove(id: string): void {
    this.expenses = this.expenses.filter(expense => expense.id !== id);
    this.saveToStorage();
  }
  
  getTotalByPeriod(period?: string): number {
    const filteredExpenses = period 
      ? this.getByPeriod(period)
      : this.expenses;
      
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }
  
  getByCategory(period?: string): Record<string, number> {
    const filteredExpenses = period
      ? this.getByPeriod(period)
      : this.expenses;
    
    return filteredExpenses.reduce((acc, expense) => {
      const { category } = expense;
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  }
}
