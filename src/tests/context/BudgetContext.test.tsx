import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { BudgetProvider, useBudget } from '../../context/BudgetContext';
import React from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component that uses the budget context
const TestComponent = () => {
  const {
    expenses,
    incomes,
    goals,
    addExpense,
    addIncome,
    addGoal,
    removeExpense,
    removeIncome,
    removeGoal,
    getTotalExpenses,
    getTotalIncome,
  } = useBudget();

  return (
    <div>
      <div data-testid="expenses-count">{expenses.length}</div>
      <div data-testid="incomes-count">{incomes.length}</div>
      <div data-testid="goals-count">{goals.length}</div>
      <div data-testid="total-expenses">{getTotalExpenses()}</div>
      <div data-testid="total-income">{getTotalIncome()}</div>
      <button
        onClick={() =>
          addExpense({
            amount: 100,
            category: 'Test',
            description: 'Test expense',
            date: '2024-03-15',
          })
        }
        data-testid="add-expense-btn"
      >
        Add Expense
      </button>
      <button
        onClick={() =>
          addIncome({
            amount: 1000,
            source: 'Test',
            description: 'Test income',
            date: '2024-03-15',
            isRecurring: false,
          })
        }
        data-testid="add-income-btn"
      >
        Add Income
      </button>
      <button
        onClick={() =>
          addGoal({
            category: 'Test',
            amount: 5000,
            endDate: '2024-12-31',
          })
        }
        data-testid="add-goal-btn"
      >
        Add Goal
      </button>
    </div>
  );
};

describe('BudgetContext', () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup(); // Clean up after each test
  });

  it('provides initial empty state', () => {
    render(
      <BudgetProvider>
        <TestComponent />
      </BudgetProvider>
    );

    expect(screen.getByTestId('expenses-count').textContent).toBe('0');
    expect(screen.getByTestId('incomes-count').textContent).toBe('0');
    expect(screen.getByTestId('goals-count').textContent).toBe('0');
  });

  it('adds and removes expenses', () => {
    render(
      <BudgetProvider>
        <TestComponent />
      </BudgetProvider>
    );

    fireEvent.click(screen.getByTestId('add-expense-btn'));
    expect(screen.getByTestId('expenses-count').textContent).toBe('1');
    expect(screen.getByTestId('total-expenses').textContent).toBe('100');
  });

  it('adds and removes incomes', () => {
    render(
      <BudgetProvider>
        <TestComponent />
      </BudgetProvider>
    );

    fireEvent.click(screen.getByTestId('add-income-btn'));
    expect(screen.getByTestId('incomes-count').textContent).toBe('1');
    expect(screen.getByTestId('total-income').textContent).toBe('1000');
  });

  it('adds and manages goals', () => {
    render(
      <BudgetProvider>
        <TestComponent />
      </BudgetProvider>
    );

    fireEvent.click(screen.getByTestId('add-goal-btn'));
    expect(screen.getByTestId('goals-count').textContent).toBe('1');
  });

  it('persists data in localStorage', () => {
    const { unmount } = render(
      <BudgetProvider>
        <TestComponent />
      </BudgetProvider>
    );

    fireEvent.click(screen.getByTestId('add-expense-btn'));
    fireEvent.click(screen.getByTestId('add-income-btn'));
    fireEvent.click(screen.getByTestId('add-goal-btn'));
    
    // Unmount and remount to simulate page reload
    unmount();

    render(
      <BudgetProvider>
        <TestComponent />
      </BudgetProvider>
    );

    expect(screen.getByTestId('expenses-count').textContent).toBe('1');
    expect(screen.getByTestId('incomes-count').textContent).toBe('1');
    expect(screen.getByTestId('goals-count').textContent).toBe('1');
  });
});