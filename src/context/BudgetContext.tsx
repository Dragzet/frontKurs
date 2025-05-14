import React, { createContext, useContext, useState, ReactNode } from 'react';
import { IExpense, ExpenseCreateDTO, IIncome, IncomeCreateDTO, IGoal, GoalCreateDTO } from '../types/models';
import { ServiceFactory } from '../services/ServiceFactory';
import { IExpenseService } from '../services/interfaces';
import { IIncomeService } from '../services/interfaces';
import { IGoalService } from '../services/interfaces';

type BudgetContextType = {
  expenses: IExpense[];
  incomes: IIncome[];
  goals: IGoal[];
  addExpense: (expense: ExpenseCreateDTO) => void;
  addIncome: (income: IncomeCreateDTO) => void;
  addGoal: (goal: GoalCreateDTO) => void;
  updateGoalProgress: (id: string, amount: number) => void;
  removeExpense: (id: string) => void;
  removeIncome: (id: string) => void;
  removeGoal: (id: string) => void;
  getTotalExpenses: (period?: string) => number;
  getTotalIncome: (period?: string) => number;
  getExpensesByCategory: (period?: string) => Record<string, number>;
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function useBudget() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}

type BudgetProviderProps = {
  children: ReactNode;
};

export function BudgetProvider({ children }: BudgetProviderProps) {
  // Get service instances
  const expenseService: IExpenseService = ServiceFactory.getExpenseService();
  const incomeService: IIncomeService = ServiceFactory.getIncomeService();
  const goalService: IGoalService = ServiceFactory.getGoalService();
  
  // Initialize state from services
  const [expenses, setExpenses] = useState<IExpense[]>(expenseService.getAll());
  const [incomes, setIncomes] = useState<IIncome[]>(incomeService.getAll());
  const [goals, setGoals] = useState<IGoal[]>(goalService.getAll());
  
  // Add a new expense
  const addExpense = (expenseData: ExpenseCreateDTO) => {
    expenseService.add(expenseData);
    setExpenses(expenseService.getAll());
  };
  
  // Add a new income
  const addIncome = (incomeData: IncomeCreateDTO) => {
    incomeService.add(incomeData);
    setIncomes(incomeService.getAll());
  };
  
  // Add a new goal
  const addGoal = (goalData: GoalCreateDTO) => {
    goalService.add(goalData);
    setGoals(goalService.getAll());
  };
  
  // Update goal progress
  const updateGoalProgress = (id: string, amount: number) => {
    goalService.updateProgress(id, amount);
    setGoals(goalService.getAll());
  };
  
  // Remove expense
  const removeExpense = (id: string) => {
    expenseService.remove(id);
    setExpenses(expenseService.getAll());
  };
  
  // Remove income
  const removeIncome = (id: string) => {
    incomeService.remove(id);
    setIncomes(incomeService.getAll());
  };
  
  // Remove goal
  const removeGoal = (id: string) => {
    goalService.remove(id);
    setGoals(goalService.getAll());
  };
  
  // Calculate total expenses for a period
  const getTotalExpenses = (period?: string): number => {
    return expenseService.getTotalByPeriod(period);
  };
  
  // Calculate total income for a period
  const getTotalIncome = (period?: string): number => {
    return incomeService.getTotalByPeriod(period);
  };
  
  // Get expenses grouped by category
  const getExpensesByCategory = (period?: string): Record<string, number> => {
    return expenseService.getByCategory(period);
  };

  const value = {
    expenses,
    incomes,
    goals,
    addExpense,
    addIncome,
    addGoal,
    updateGoalProgress,
    removeExpense,
    removeIncome,
    removeGoal,
    getTotalExpenses,
    getTotalIncome,
    getExpensesByCategory,
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

// Export expense and income types for backward compatibility
export type { IExpense as ExpenseItem, IIncome as IncomeItem, IGoal as BudgetGoal };