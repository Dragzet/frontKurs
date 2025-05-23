import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, TrendingUp, TrendingDown, Target } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

import { MonthBasePage, MonthPageState } from './BasePage';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MonthSelector from '../components/MonthSelector';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency, calculatePercentage, getCategoryColor } from '../utils/formatters';
import { IExpense, IIncome, IGoal } from '../types/models';

/**
 * Props for the DashboardPageClass component
 */
interface DashboardPageProps {
  expenses: IExpense[];
  incomes: IIncome[];
  goals: IGoal[];
  getTotalExpenses: (period?: string) => number;
  getTotalIncome: (period?: string) => number;
  getExpensesByCategory: (period?: string) => Record<string, number>;
}

/**
 * State for the DashboardPageClass component
 */
interface DashboardPageState extends MonthPageState {}

/**
 * DashboardPage implemented as a class component
 */
class DashboardPageClass extends MonthBasePage<DashboardPageProps, DashboardPageState> {
  /**
   * Get the page title
   */
  protected getPageTitle(): string {
    return 'SenyaMoney';
  }

  /**
   * Render page actions
   */
  protected renderActions(): React.ReactNode {
    return (
      <div className="flex space-x-3">
        <Link to="/expenses">
          <Button variant="primary" icon={<PlusCircle size={18} />}>
            Добавить расход
          </Button>
        </Link>
        <Link to="/income">
          <Button variant="outline" icon={<PlusCircle size={18} />}>
            Добавить доход
          </Button>
        </Link>
      </div>
    );
  }

  /**
   * Render financial summary cards
   */
  private renderFinancialSummary(): React.ReactNode {
    const { getTotalExpenses, getTotalIncome } = this.props;
    const { currentMonth } = this.state;
    
    const totalExpenses = getTotalExpenses(currentMonth);
    const totalIncome = getTotalIncome(currentMonth);
    const balance = totalIncome - totalExpenses;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="transition-transform duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Доходы</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="transition-transform duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Расходы</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="transition-transform duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Баланс</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {balance >= 0 ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  /**
   * Render expenses by category chart
   */
  private renderExpensesChart(): React.ReactNode {
    const { getExpensesByCategory } = this.props;
    const { currentMonth } = this.state;
    
    // Prepare data for pie chart
    const expensesByCategory = getExpensesByCategory(currentMonth);
    const expensesData = Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value,
    }));

    return (
      <Card title="Расходы по категориям">
        <div className="h-64">
          {expensesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expensesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Сумма']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">Нет расходов за выбранный период</p>
            </div>
          )}
        </div>
      </Card>
    );
  }

  /**
   * Render recent transactions
   */
  private renderRecentTransactions(): React.ReactNode {
    const { expenses, incomes } = this.props;
    const { currentMonth } = this.state;
    
    const recentTransactions = [...expenses, ...incomes]
      .filter(item => item.date.startsWith(currentMonth))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return (
      <Card title="Последние транзакции">
        <div className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => {
              const isExpense = 'category' in transaction;
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div
                      className={`p-2 rounded-full mr-3 ${
                        isExpense ? 'bg-red-100' : 'bg-green-100'
                      }`}
                    >
                      {isExpense ? (
                        <TrendingDown
                          size={16}
                          className="text-red-600"
                        />
                      ) : (
                        <TrendingUp
                          size={16}
                          className="text-green-600"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {isExpense
                          ? (transaction as any).category
                          : (transaction as any).source}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.description}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`font-medium ${
                      isExpense ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 flex items-center justify-center">
              <p className="text-gray-500">Нет транзакций за выбранный период</p>
            </div>
          )}
          <div className="flex justify-between mt-4">
            <Link to="/expenses">
              <Button variant="outline" size="sm">
                Все расходы
              </Button>
            </Link>
            <Link to="/income">
              <Button variant="outline" size="sm">
                Все доходы
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  /**
   * Render financial goals
   */
  private renderFinancialGoals(): React.ReactNode {
    const { goals } = this.props;
    
    const activeGoals = goals
      .filter(goal => {
        const endDate = new Date(goal.endDate);
        const now = new Date();
        return endDate >= now;
      })
      .slice(0, 3);

    return (
      <Card title="Финансовые цели">
        {activeGoals.length > 0 ? (
          <div className="space-y-4">
            {activeGoals.map((goal) => {
              const progress = calculatePercentage(goal.currentAmount, goal.amount);
              
              return (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-medium">{goal.category}</h4>
                    </div>
                    <div className="text-gray-600">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.amount)}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span>{progress}%</span>
                    <span className="text-gray-500">До {new Date(goal.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
            <div className="flex justify-center mt-4">
              <Link to="/goals">
                <Button>Все цели</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">У вас пока нет финансовых целей</p>
            <Link to="/goals">
              <Button>Добавить цель</Button>
            </Link>
          </div>
        )}
      </Card>
    );
  }

  /**
   * Render page content
   */
  protected renderContent(): React.ReactNode {
    return (
      <>
        <MonthSelector 
          currentMonth={this.state.currentMonth} 
          onChange={this.handleMonthChange} 
        />
        
        {/* Financial Summary */}
        {this.renderFinancialSummary()}
        
        {/* Charts and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {this.renderExpensesChart()}
          {this.renderRecentTransactions()}
        </div>
        
        {/* Financial Goals */}
        {this.renderFinancialGoals()}
      </>
    );
  }
}

/**
 * Functional wrapper for the class component to use hooks
 */
const DashboardPage: React.FC = () => {
  const { 
    expenses, 
    incomes, 
    goals, 
    getTotalExpenses, 
    getTotalIncome,
    getExpensesByCategory,
  } = useBudget();

  return (
    <DashboardPageClass
      expenses={expenses}
      incomes={incomes}
      goals={goals}
      getTotalExpenses={getTotalExpenses}
      getTotalIncome={getTotalIncome}
      getExpensesByCategory={getExpensesByCategory}
    />
  );
};

export default DashboardPage;