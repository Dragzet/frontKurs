import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types for our budget items
export type ExpenseItem = {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
};

export type IncomeItem = {
  id: string;
  amount: number;
  source: string;
  description: string;
  date: string;
  isRecurring: boolean;
};

export type BudgetGoal = {
  id: string;
  category: string;
  amount: number;
  currentAmount: number;
  endDate: string;
};

type BudgetContextType = {
  expenses: ExpenseItem[];
  incomes: IncomeItem[];
  goals: BudgetGoal[];
  addExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  addIncome: (income: Omit<IncomeItem, 'id'>) => void;
  addGoal: (goal: Omit<BudgetGoal, 'id' | 'currentAmount'>) => void;
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

// Simple UUID v4 generator (fallback for environments without crypto.randomUUID)
function generateUUID() {
  // Not cryptographically secure, but fine for local IDs
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function BudgetProvider({ children }: BudgetProviderProps) {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const savedExpenses = localStorage.getItem('expenses');
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });

  const [incomes, setIncomes] = useState<IncomeItem[]>(() => {
    const savedIncomes = localStorage.getItem('incomes');
    return savedIncomes ? JSON.parse(savedIncomes) : [];
  });

  const [goals, setGoals] = useState<BudgetGoal[]>(() => {
    const savedGoals = localStorage.getItem('goals');
    return savedGoals ? JSON.parse(savedGoals) : [];
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  // Add new expense
  const addExpense = (expense: Omit<ExpenseItem, 'id'>) => {
    const newExpense = {
      ...expense,
      id: generateUUID(),
    };
    setExpenses((prev) => [...prev, newExpense]);
  };

  // Add new income
  const addIncome = (income: Omit<IncomeItem, 'id'>) => {
    const newIncome = {
      ...income,
      id: generateUUID(),
    };
    setIncomes((prev) => [...prev, newIncome]);
  };

  // Add new goal
  const addGoal = (goal: Omit<BudgetGoal, 'id' | 'currentAmount'>) => {
    const newGoal = {
      ...goal,
      id: generateUUID(),
      currentAmount: 0,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  // Update goal progress
  const updateGoalProgress = (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id ? { ...goal, currentAmount: goal.currentAmount + amount } : goal
      )
    );
  };

  // Remove expense
  const removeExpense = (id: string) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  };

  // Remove income
  const removeIncome = (id: string) => {
    setIncomes((prev) => prev.filter((income) => income.id !== id));
  };

  // Remove goal
  const removeGoal = (id: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  // Calculate total expenses (optionally for a specific period)
  const getTotalExpenses = (period?: string) => {
    return expenses
      .filter((expense) => {
        if (!period) return true;
        // Filter by month if period is provided (format: 'YYYY-MM')
        return expense.date.startsWith(period);
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  // Calculate total income (optionally for a specific period)
  const getTotalIncome = (period?: string) => {
    return incomes
      .filter((income) => {
        if (!period) return true;
        // Filter by month if period is provided (format: 'YYYY-MM')
        return income.date.startsWith(period);
      })
      .reduce((sum, income) => sum + income.amount, 0);
  };

  // Get expenses grouped by category (optionally for a specific period)
  const getExpensesByCategory = (period?: string) => {
    return expenses
      .filter((expense) => {
        if (!period) return true;
        return expense.date.startsWith(period);
      })
      .reduce((acc, expense) => {
        const category = expense.category;
        acc[category] = (acc[category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);
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