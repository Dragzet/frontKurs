import { IIncome, IncomeCreateDTO } from '../types/models';
import { IIncomeService } from './interfaces';
import { IStorageService } from './storage';
import { generateUUID } from '../utils/uuid';

export class IncomeService implements IIncomeService {
  private incomes: IIncome[] = [];
  private readonly storageKey = 'incomes';
  
  constructor(private storage: IStorageService) {
    this.loadFromStorage();
  }
  
  private loadFromStorage(): void {
    const storedIncomes = this.storage.get<IIncome[]>(this.storageKey);
    if (storedIncomes) {
      this.incomes = storedIncomes;
    }
  }
  
  private saveToStorage(): void {
    this.storage.set(this.storageKey, this.incomes);
  }
  
  getAll(): IIncome[] {
    return [...this.incomes];
  }
  
  getByPeriod(period: string): IIncome[] {
    return this.incomes.filter(income => income.date.startsWith(period));
  }
  
  getById(id: string): IIncome | undefined {
    return this.incomes.find(income => income.id === id);
  }
  
  add(incomeData: IncomeCreateDTO): IIncome {
    const newIncome: IIncome = {
      ...incomeData,
      id: generateUUID()
    };
    
    this.incomes.push(newIncome);
    this.saveToStorage();
    
    return newIncome;
  }
  
  remove(id: string): void {
    this.incomes = this.incomes.filter(income => income.id !== id);
    this.saveToStorage();
  }
  
  getTotalByPeriod(period?: string): number {
    const filteredIncomes = period 
      ? this.getByPeriod(period)
      : this.incomes;
      
    return filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
  }
}
