import React from 'react';
import { Plus, Trash2, Clock, Search } from 'lucide-react';
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
  getIncomeSources
} from '../utils/formatters';
import { IncomeCreateDTO, IIncome } from '../types/models';

/**
 * Props interface for IncomePageClass
 */
interface IncomePageProps {
  incomes: IIncome[];
  addIncome: (income: IncomeCreateDTO) => void;
  removeIncome: (id: string) => void;
}

/**
 * State interface for IncomePageClass
 */
interface IncomePageState extends MonthPageState {
  isAddingIncome: boolean;
  filterSource: string;
  searchTerm: string;
  amount: string;
  source: string;
  description: string;
  date: string;
  isRecurring: boolean;
  errors: {
    amount: string;
    source: string;
    description: string;
    date: string;
  };
}

/**
 * IncomePage implemented as a class component
 */
class IncomePageClass extends MonthBasePage<IncomePageProps, IncomePageState> {
  /**
   * Get initial state
   */
  protected getInitialState(): Partial<IncomePageState> {
    return {
      isAddingIncome: false,
      filterSource: '',
      searchTerm: '',
      amount: '',
      source: '',
      description: '',
      date: formatDateForInput(),
      isRecurring: false,
      errors: {
        amount: '',
        source: '',
        description: '',
        date: '',
      },
    };
  }
  
  /**
   * Get the page title
   */
  protected getPageTitle(): string {
    return 'Доходы';
  }
  
  /**
   * Render page actions
   */
  protected renderActions(): React.ReactNode {
    return (
      <Button 
        variant="success" 
        icon={<Plus size={18} />}
        onClick={this.toggleAddIncomeForm}
      >
        Добавить доход
      </Button>
    );
  }

  /**
   * Toggle add income form
   */
  private toggleAddIncomeForm = (): void => {
    this.setState(prevState => ({ 
      isAddingIncome: !prevState.isAddingIncome 
    }));
  };

  /**
   * Handle income form submission
   */
  private handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    const { amount, source, description, date, isRecurring } = this.state;
    
    // Validate form
    const newErrors = {
      amount: !amount ? 'Введите сумму' : '',
      source: !source ? 'Выберите источник' : '',
      description: !description ? 'Введите описание' : '',
      date: !date ? 'Выберите дату' : '',
    };
    
    this.setState({ errors: newErrors });
    
    if (Object.values(newErrors).some(error => error)) {
      return;
    }
    
    // Add income
    this.props.addIncome({
      amount: parseFloat(amount),
      source,
      description,
      date,
      isRecurring,
    });
    
    // Reset form
    this.setState({
      amount: '',
      source: '',
      description: '',
      date: formatDateForInput(),
      isRecurring: false,
      isAddingIncome: false
    });
  };

  /**
   * Get filtered incomes
   */
  private getFilteredIncomes(): IIncome[] {
    const { incomes } = this.props;
    const { currentMonth, filterSource, searchTerm } = this.state;
    
    return incomes.filter(income => {
      const matchesMonth = income.date.startsWith(currentMonth);
      const matchesSource = !filterSource || income.source === filterSource;
      const matchesSearch = !searchTerm || 
        income.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        income.source.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesMonth && matchesSource && matchesSearch;
    });
  }

  /**
   * Group incomes by date
   */
  private getIncomesByDate(): Record<string, IIncome[]> {
    const filteredIncomes = this.getFilteredIncomes();
    
    return filteredIncomes.reduce((acc, income) => {
      const date = income.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(income);
      return acc;
    }, {} as Record<string, IIncome[]>);
  }

  /**
   * Get total amount of filtered incomes
   */
  private getFilteredTotal(): number {
    return this.getFilteredIncomes().reduce((sum, income) => sum + income.amount, 0);
  }

  /**
   * Render add income form
   */
  private renderAddIncomeForm(): React.ReactNode {
    const { 
      isAddingIncome, 
      amount, 
      source, 
      description, 
      date, 
      isRecurring, 
      errors 
    } = this.state;
    
    if (!isAddingIncome) {
      return null;
    }

    const sources = getIncomeSources();
    const sourceOptions = sources.map(src => ({
      value: src,
      label: src,
    }));
    
    return (
      <Card title="Новый доход">
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
              label="Источник"
              options={sourceOptions}
              value={source}
              onChange={(value) => this.setState({ source: value })}
              error={errors.source}
              required
              fullWidth
            />
            
            <Input
              label="Описание"
              type="text"
              placeholder="Например: Зарплата за апрель"
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
            
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => this.setState({ isRecurring: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span>Повторяющийся доход</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end mt-6 space-x-3">
            <Button 
              variant="outline" 
              type="button"
              onClick={this.toggleAddIncomeForm}
            >
              Отмена
            </Button>
            <Button 
              variant="success" 
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
   * Render income filters
   */
  private renderFilters(): React.ReactNode {
    const { filterSource, searchTerm } = this.state;
    const sources = getIncomeSources();
    
    const sourceOptions = [
      { value: '', label: 'Все источники' },
      ...sources.map(src => ({ value: src, label: src }))
    ];
    
    return (
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex items-center space-x-2">
          <Select
            options={sourceOptions}
            value={filterSource}
            onChange={(value) => this.setState({ filterSource: value })}
            className="mb-0 w-48"
          />
          <Badge variant="success" size="md">
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
   * Render income list
   */
  private renderIncomeList(): React.ReactNode {
    const incomesByDate = this.getIncomesByDate();
    const sortedDates = Object.keys(incomesByDate).sort((a, b) => 
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
              {incomesByDate[date].map(income => (
                <div 
                  key={income.id}
                  className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between">
                    <div className="flex items-start">
                      <div className="w-2 h-full rounded-full mr-3 bg-green-500"></div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium">{income.description}</h3>
                          {income.isRecurring && (
                            <span className="ml-2 flex items-center text-xs text-gray-500">
                              <Clock size={12} className="mr-1" />
                              Повторяющийся
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{income.source}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <p className="text-lg font-medium text-green-600 mr-3">
                        {formatCurrency(income.amount)}
                      </p>
                      <button
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        onClick={() => this.props.removeIncome(income.id)}
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
    const { searchTerm, filterSource, isAddingIncome } = this.state;
    
    return (
      <Card>
        <div className="py-12 text-center">
          <p className="text-gray-500 mb-4">
            {searchTerm || filterSource 
              ? 'Доходы не найдены. Попробуйте изменить параметры поиска.' 
              : 'В этом месяце еще нет доходов.'}
          </p>
          {!isAddingIncome && (
            <Button 
              variant="success" 
              icon={<Plus size={18} />}
              onClick={this.toggleAddIncomeForm}
            >
              Добавить доход
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
        {this.renderAddIncomeForm()}
        {this.renderFilters()}
        {this.renderIncomeList()}
      </>
    );
  }
}

/**
 * Functional wrapper for the class component to use hooks
 */
const IncomePage: React.FC = () => {
  const { incomes, addIncome, removeIncome } = useBudget();

  return (
    <IncomePageClass
      incomes={incomes}
      addIncome={addIncome}
      removeIncome={removeIncome}
    />
  );
};

export default IncomePage;