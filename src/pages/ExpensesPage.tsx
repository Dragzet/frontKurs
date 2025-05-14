import React from 'react';
import { Plus, Trash2, Filter, Search } from 'lucide-react';
import { MonthBasePage, MonthPageState } from './BasePage';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import MonthSelector from '../components/MonthSelector';
import { useBudget } from '../context/BudgetContext';
import { 
  formatCurrency, 
  formatDate, 
  formatDateForInput, 
  getExpenseCategories,
  getCategoryColor
} from '../utils/formatters';
import { ExpenseCreateDTO, IExpense } from '../types/models';

/**
 * Props interface for ExpensesPageClass
 */
interface ExpensesPageProps {
  expenses: IExpense[];
  addExpense: (expense: ExpenseCreateDTO) => void;
  removeExpense: (id: string) => void;
}

/**
 * State interface for ExpensesPageClass
 */
interface ExpensesPageState extends MonthPageState {
  isAddingExpense: boolean;
  filterCategory: string;
  searchTerm: string;
  amount: string;
  category: string;
  description: string;
  date: string;
  errors: {
    amount: string;
    category: string;
    description: string;
    date: string;
  };
}

/**
 * ExpensesPage implemented as a class component
 */
class ExpensesPageClass extends MonthBasePage<ExpensesPageProps, ExpensesPageState> {
  /**
   * Get initial state
   */
  protected getInitialState(): Partial<ExpensesPageState> {
    return {
      isAddingExpense: false,
      filterCategory: '',
      searchTerm: '',
      amount: '',
      category: '',
      description: '',
      date: formatDateForInput(),
      errors: {
        amount: '',
        category: '',
        description: '',
        date: '',
      },
    };
  }
  
  /**
   * Get the page title
   */
  protected getPageTitle(): string {
    return 'Расходы';
  }
  
  /**
   * Render page actions
   */
  protected renderActions(): React.ReactNode {
    return (
      <Button 
        variant="primary" 
        icon={<Plus size={18} />}
        onClick={this.toggleAddExpenseForm}
      >
        Добавить расход
      </Button>
    );
  }

  /**
   * Toggle add expense form
   */
  private toggleAddExpenseForm = (): void => {
    this.setState(prevState => ({ 
      isAddingExpense: !prevState.isAddingExpense 
    }));
  };

  /**
   * Handle expense form submission
   */
  private handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    const { amount, category, description, date } = this.state;
    
    // Validate form
    const newErrors = {
      amount: !amount ? 'Введите сумму' : '',
      category: !category ? 'Выберите категорию' : '',
      description: !description ? 'Введите описание' : '',
      date: !date ? 'Выберите дату' : '',
    };
    
    this.setState({ errors: newErrors });
    
    if (Object.values(newErrors).some(error => error)) {
      return;
    }
    
    // Add expense (используем модуль суммы)
    this.props.addExpense({
      amount: Math.abs(parseFloat(amount)),
      category,
      description,
      date,
    });
    
    // Reset form
    this.setState({
      amount: '',
      category: '',
      description: '',
      date: formatDateForInput(),
      isAddingExpense: false
    });
  };

  /**
   * Get filtered expenses
   */
  private getFilteredExpenses(): IExpense[] {
    const { expenses } = this.props;
    const { currentMonth, filterCategory, searchTerm } = this.state;
    
    return expenses.filter(expense => {
      const matchesMonth = expense.date.startsWith(currentMonth);
      const matchesCategory = !filterCategory || expense.category === filterCategory;
      const matchesSearch = !searchTerm || 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesMonth && matchesCategory && matchesSearch;
    });
  }

  /**
   * Group expenses by date
   */
  private getExpensesByDate(): Record<string, IExpense[]> {
    const filteredExpenses = this.getFilteredExpenses();
    
    return filteredExpenses.reduce((acc, expense) => {
      const date = expense.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(expense);
      return acc;
    }, {} as Record<string, IExpense[]>);
  }

  /**
   * Get total amount of filtered expenses
   */
  private getFilteredTotal(): number {
    return this.getFilteredExpenses().reduce((sum, expense) => sum + expense.amount, 0);
  }

  /**
   * Render add expense form
   */
  private renderAddExpenseForm(): React.ReactNode {
    const { isAddingExpense, amount, category, description, date, errors } = this.state;
    
    if (!isAddingExpense) {
      return null;
    }

    const categories = getExpenseCategories();
    const categoryOptions = categories.map(cat => ({
      value: cat,
      label: cat,
    }));
    
    return (
      <Card title="Новый расход">
        <form onSubmit={this.handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Сумма"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => this.setState({ amount: e.target.value })}
              error={errors.amount}
              required
              fullWidth
            />
            
            <Select
              label="Категория"
              options={categoryOptions}
              value={category}
              onChange={(value) => this.setState({ category: value })}
              error={errors.category}
              required
              fullWidth
            />
            
            <Input
              label="Описание"
              type="text"
              placeholder="Например: Продукты в Пятерочке"
              value={description}
              onChange={(e) => this.setState({ description: e.target.value })}
              error={errors.description}
              required
              fullWidth
            />
            
            <Input
              label="Дата"
              type="date"
              value={date}
              onChange={(e) => this.setState({ date: e.target.value })}
              error={errors.date}
              required
              fullWidth
            />
          </div>
          
          <div className="flex justify-end mt-6 space-x-3">
            <Button 
              variant="outline" 
              type="button"
              onClick={this.toggleAddExpenseForm}
            >
              Отмена
            </Button>
            <Button 
              variant="primary" 
              type="submit"
            >
              Сохранить
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  /**
   * Render expense filters
   */
  private renderFilters(): React.ReactNode {
    const { filterCategory, searchTerm } = this.state;
    const categories = getExpenseCategories();
    
    const categoryOptions = [
      { value: '', label: 'Все категории' },
      ...categories.map(cat => ({ value: cat, label: cat }))
    ];
    
    return (
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex items-center space-x-2">
          <Select
            options={categoryOptions}
            value={filterCategory}
            onChange={(value) => this.setState({ filterCategory: value })}
            className="mb-0 w-48"
          />
          <Badge variant="primary" size="md">
            Всего: {formatCurrency(this.getFilteredTotal())}
          </Badge>
        </div>
        
        <Input
          placeholder="Поиск..."
          value={searchTerm}
          onChange={(e) => this.setState({ searchTerm: e.target.value })}
          className="mb-0"
          icon={<Search size={18} className="text-gray-400" />}
        />
      </div>
    );
  }

  /**
   * Render expense list
   */
  private renderExpenseList(): React.ReactNode {
    const expensesByDate = this.getExpensesByDate();
    const sortedDates = Object.keys(expensesByDate).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    if (sortedDates.length === 0) {
      return this.renderEmptyState();
    }
    
    return (
      <div className="space-y-6">
        {sortedDates.map(date => (
          <div key={date}>
            <div className="flex items-center mb-3">
              <div className="bg-gray-200 h-px flex-grow mr-3"></div>
              <span className="text-sm font-medium text-gray-500">
                {formatDate(date)}
              </span>
              <div className="bg-gray-200 h-px flex-grow ml-3"></div>
            </div>
            
            <div className="space-y-3">
              {expensesByDate[date].map(expense => (
                <div 
                  key={expense.id}
                  className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between">
                    <div className="flex items-start">
                      <div 
                        className="w-2 h-full rounded-full mr-3"
                        style={{ backgroundColor: getCategoryColor(expense.category) }}
                      ></div>
                      <div>
                        <h3 className="font-medium">{expense.description}</h3>
                        <p className="text-sm text-gray-500">{expense.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <p className="text-lg font-medium text-red-600 mr-3">
                        {formatCurrency(expense.amount)}
                      </p>
                      <button
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        onClick={() => this.props.removeExpense(expense.id)}
                        aria-label="Удалить"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  /**
   * Render empty state
   */
  private renderEmptyState(): React.ReactNode {
    const { searchTerm, filterCategory, isAddingExpense } = this.state;
    
    return (
      <Card>
        <div className="py-12 text-center">
          <p className="text-gray-500 mb-4">
            {searchTerm || filterCategory 
              ? 'Расходы не найдены. Попробуйте изменить параметры поиска.' 
              : 'В этом месяце еще нет расходов.'}
          </p>
          {!isAddingExpense && (
            <Button 
              variant="primary" 
              icon={<Plus size={18} />}
              onClick={this.toggleAddExpenseForm}
            >
              Добавить расход
            </Button>
          )}
        </div>
      </Card>
    );
  }

  /**
   * Render page content
   */
  protected renderContent(): React.ReactNode {
    return (
      <>
        <MonthSelector currentMonth={this.state.currentMonth} onChange={this.handleMonthChange} />
        {this.renderAddExpenseForm()}
        {this.renderFilters()}
        {this.renderExpenseList()}
      </>
    );
  }
}

/**
 * Functional wrapper for the class component to use hooks
 */
const ExpensesPage: React.FC = () => {
  const { expenses, addExpense, removeExpense } = useBudget();

  return (
    <ExpensesPageClass
      expenses={expenses}
      addExpense={addExpense}
      removeExpense={removeExpense}
    />
  );
};

export default ExpensesPage;