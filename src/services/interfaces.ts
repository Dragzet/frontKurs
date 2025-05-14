import { IExpense, ExpenseCreateDTO, IIncome, IncomeCreateDTO, IGoal, GoalCreateDTO } from '../types/models';

/**
 * Interface for expense service
 */
export interface IExpenseService {
  getAll(): IExpense[];
  getByPeriod(period: string): IExpense[];
  getById(id: string): IExpense | undefined;
  add(expenseData: ExpenseCreateDTO): IExpense;
  remove(id: string): void;
  getTotalByPeriod(period?: string): number;
  getByCategory(period?: string): Record<string, number>;
}

/**
 * Interface for income service
 */
export interface IIncomeService {
  getAll(): IIncome[];
  getByPeriod(period: string): IIncome[];
  getById(id: string): IIncome | undefined;
  add(incomeData: IncomeCreateDTO): IIncome;
  remove(id: string): void;
  getTotalByPeriod(period?: string): number;
}

/**
 * Interface for goal service
 */
export interface IGoalService {
  getAll(): IGoal[];
  getById(id: string): IGoal | undefined;
  add(goalData: GoalCreateDTO): IGoal;
  updateProgress(id: string, amount: number): IGoal | undefined;
  remove(id: string): void;
}
