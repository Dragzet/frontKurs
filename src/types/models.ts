/**
 * Base interface for financial transactions
 */
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
}

/**
 * Interface for expense items
 */
export interface IExpense extends Transaction {
  category: string;
}

/**
 * Interface for income items
 */
export interface IIncome extends Transaction {
  source: string;
  isRecurring: boolean;
}

/**
 * Interface for financial goals
 */
export interface IGoal {
  id: string;
  category: string;
  amount: number;
  currentAmount: number;
  endDate: string;
}

/**
 * Type definitions for expense and income creation payloads
 */
export type ExpenseCreateDTO = Omit<IExpense, 'id'>;
export type IncomeCreateDTO = Omit<IIncome, 'id'>;
export type GoalCreateDTO = Omit<IGoal, 'id' | 'currentAmount'>;
