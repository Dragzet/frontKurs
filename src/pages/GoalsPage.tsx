import React from 'react';
import { Plus, Target, Trash2, CheckCircle } from 'lucide-react';
import { BasePage } from './BasePage';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency, formatDateForInput, calculatePercentage } from '../utils/formatters';
import { GoalCreateDTO, IGoal } from '../types/models';

/**
 * Props interface for GoalsPageClass
 */
interface GoalsPageProps {
  goals: IGoal[];
  addGoal: (goal: GoalCreateDTO) => void;
  updateGoalProgress: (id: string, amount: number) => void;
  removeGoal: (id: string) => void;
}

/**
 * State interface for GoalsPageClass
 */
interface GoalsPageState {
  isAddingGoal: boolean;
  showCompleted: boolean;
  category: string;
  amount: string;
  endDate: string;
  customCategory: string;
  selectedGoalId: string | null;
  progressAmount: string;
  errors: {
    category: string;
    amount: string;
    endDate: string;
  };
}

/**
 * GoalsPage implemented as a class component
 */
class GoalsPageClass extends BasePage<GoalsPageProps, GoalsPageState> {
  /**
   * Initialize state
   */
  constructor(props: GoalsPageProps) {
    super(props);
    this.state = {
      isAddingGoal: false,
      showCompleted: false,
      category: '',
      amount: '',
      endDate: '',
      customCategory: '',
      selectedGoalId: null,
      progressAmount: '',
      errors: {
        category: '',
        amount: '',
        endDate: '',
      },
    };
  }
  
  /**
   * Get the page title
   */
  protected getPageTitle(): string {
    return 'Финансовые цели';
  }
  
  /**
   * Render page actions
   */
  protected renderActions(): React.ReactNode {
    return (
      <Button 
        variant="primary" 
        icon={<Plus size={18} />}
        onClick={this.toggleAddGoalForm}
      >
        Добавить цель
      </Button>
    );
  }

  /**
   * Toggle add goal form
   */
  private toggleAddGoalForm = (): void => {
    this.setState(prevState => ({ 
      isAddingGoal: !prevState.isAddingGoal 
    }));
  };

  /**
   * Toggle show completed goals
   */
  private toggleShowCompleted = (): void => {
    this.setState(prevState => ({ 
      showCompleted: !prevState.showCompleted 
    }));
  };

  /**
   * Select goal for progress update
   */
  private selectGoalForUpdate = (goalId: string | null): void => {
    this.setState({ 
      selectedGoalId: goalId,
      progressAmount: ''
    });
  };

  /**
   * Handle goal form submission
   */
  private handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    const { category, customCategory, amount, endDate } = this.state;
    
    const finalCategory = category === 'custom' ? customCategory : category;
    
    // Validate form
    const newErrors = {
      category: !finalCategory ? 'Выберите или введите категорию' : '',
      amount: !amount ? 'Введите сумму' : '',
      endDate: !endDate ? 'Выберите дату' : '',
    };
    
    this.setState({ errors: newErrors });
    
    if (Object.values(newErrors).some(error => error)) {
      return;
    }
    
    // Add goal
    this.props.addGoal({
      category: finalCategory,
      amount: parseFloat(amount),
      endDate,
    });
    
    // Reset form
    this.setState({
      category: '',
      amount: '',
      endDate: '',
      customCategory: '',
      isAddingGoal: false
    });
  };

  /**
   * Handle progress update submission
   */
  private handleProgressSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    const { selectedGoalId, progressAmount } = this.state;
    
    if (!selectedGoalId || !progressAmount) {
      return;
    }
    
    this.props.updateGoalProgress(
      selectedGoalId, 
      parseFloat(progressAmount)
    );
    
    // Reset form
    this.setState({
      selectedGoalId: null,
      progressAmount: ''
    });
  };

  /**
   * Get goal categories
   */
  private getGoalCategories(): string[] {
    return [
      'Отпуск',
      'Новый автомобиль',
      'Ремонт',
      'Образование',
      'Первоначальный взнос',
      'Свадьба',
      'Техника',
      'Резервный фонд',
      'Другое',
    ];
  }

  /**
   * Get category options for select
   */
  private getCategoryOptions(): { value: string, label: string }[] {
    return [
      ...this.getGoalCategories().map(cat => ({
        value: cat,
        label: cat,
      })),
      { value: 'custom', label: 'Своя категория...' },
    ];
  }

  /**
   * Split goals by completion status
   */
  private getGoalsByStatus(): { activeGoals: IGoal[], completedGoals: IGoal[] } {
    const { goals } = this.props;
    
    // Filter goals based on completion status
    const filteredGoals = goals.filter(goal => {
      const isCompleted = goal.currentAmount >= goal.amount;
      return this.state.showCompleted ? true : !isCompleted;
    });
    
    // Sort goals by end date (closest first)
    const sortedGoals = [...filteredGoals].sort((a, b) => 
      new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    );
    
    // Group goals by completion status
    return {
      activeGoals: sortedGoals.filter(goal => goal.currentAmount < goal.amount),
      completedGoals: sortedGoals.filter(goal => goal.currentAmount >= goal.amount)
    };
  }

  /**
   * Render add goal form
   */
  private renderAddGoalForm(): React.ReactNode {
    const { 
      isAddingGoal, 
      category, 
      customCategory, 
      amount, 
      endDate, 
      errors 
    } = this.state;
    
    if (!isAddingGoal) {
      return null;
    }
    
    return (
      <Card title="Новая финансовая цель">
        <form onSubmit={this.handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={category === 'custom' ? 'col-span-2' : ''}>
              <Select
                label="Категория"
                options={this.getCategoryOptions()}
                value={category}
                onChange={(value) => this.setState({ category: value })}
                error={errors.category}
                required
                fullWidth
              />
              
              {category === 'custom' && (
                <Input
                  placeholder="Введите свою категорию"
                  value={customCategory}
                  onChange={(e) => this.setState({ customCategory: e.target.value })}
                  error={errors.category}
                  required
                  fullWidth
                />
              )}
            </div>
            
            <Input
              label="Целевая сумма"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => this.setState({ amount: e.target.value })}
              error={errors.amount}
              required
              fullWidth
            />
            
            <Input
              label="Планируемая дата достижения"
              type="date"
              value={endDate}
              onChange={(e) => this.setState({ endDate: e.target.value })}
              error={errors.endDate}
              required
              fullWidth
            />
          </div>
          
          <div className="flex justify-end mt-6 space-x-3">
            <Button 
              variant="outline" 
              type="button"
              onClick={this.toggleAddGoalForm}
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
   * Render active goals section
   */
  private renderActiveGoals(): React.ReactNode {
    const { activeGoals } = this.getGoalsByStatus();
    const { selectedGoalId, progressAmount } = this.state;
    
    if (activeGoals.length === 0) {
      return this.renderEmptyState();
    }
    
    return (
      <div className="space-y-6">
        {activeGoals.map((goal) => {
          const progress = calculatePercentage(goal.currentAmount, goal.amount);
          const isSelected = selectedGoalId === goal.id;
          const daysLeft = Math.ceil((new Date(goal.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const isOverdue = daysLeft < 0;
          
          return (
            <Card key={goal.id} className="border-l-4 border-l-blue-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-grow space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-medium">{goal.category}</h3>
                    </div>
                    <button
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      onClick={() => this.props.removeGoal(goal.id)}
                      aria-label="Удалить"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>{formatCurrency(goal.currentAmount)} из {formatCurrency(goal.amount)}</span>
                    <span className="text-gray-500">{progress}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        isOverdue ? 'bg-red-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {isOverdue ? (
                      <span className="text-red-500">
                        Просрочено на {Math.abs(daysLeft)} {Math.abs(daysLeft) === 1 ? 'день' : Math.abs(daysLeft) < 5 ? 'дня' : 'дней'}
                      </span>
                    ) : (
                      <span>
                        Осталось {daysLeft} {daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'} (до {new Date(goal.endDate).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="shrink-0">
                  <Button
                    variant={isSelected ? 'primary' : 'outline'}
                    onClick={() => this.selectGoalForUpdate(isSelected ? null : goal.id)}
                  >
                    {isSelected ? 'Отмена' : 'Пополнить'}
                  </Button>
                </div>
              </div>
              
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <form onSubmit={this.handleProgressSubmit} className="flex items-end gap-3">
                    <Input
                      label="Сумма пополнения"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={progressAmount}
                      onChange={(e) => this.setState({ progressAmount: e.target.value })}
                      required
                      className="mb-0"
                    />
                    <Button type="submit" disabled={!progressAmount}>
                      Добавить
                    </Button>
                  </form>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  }

  /**
   * Render completed goals section
   */
  private renderCompletedGoals(): React.ReactNode {
    const { completedGoals } = this.getGoalsByStatus();
    const { showCompleted } = this.state;
    
    if (!showCompleted || completedGoals.length === 0) {
      return null;
    }
    
    return (
      <div>
        <h2 className="text-lg font-medium text-gray-700 mt-8 mb-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          Достигнутые цели
        </h2>
        
        <div className="space-y-4">
          {completedGoals.map((goal) => (
            <Card key={goal.id} className="border-l-4 border-l-green-500 opacity-80">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <h3 className="font-medium">{goal.category}</h3>
                </div>
                <div className="text-green-600 font-medium">
                  {formatCurrency(goal.amount)}
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-green-500 h-2.5 rounded-full"
                  style={{ width: '100%' }}
                ></div>
              </div>
              
              <div className="text-sm text-gray-500 mt-1">
                Достигнуто {new Date(goal.endDate).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  /**
   * Render empty state
   */
  private renderEmptyState(): React.ReactNode {
    const { completedGoals } = this.getGoalsByStatus();
    const { showCompleted, isAddingGoal } = this.state;
    
    return (
      <Card>
        {completedGoals.length > 0 && !showCompleted ? (
          <div className="py-8 text-center">
            <p className="text-gray-500 mb-4">
              У вас нет активных целей. Все цели достигнуты!
            </p>
            <Button 
              variant="primary" 
              icon={<Plus size={18} />}
              onClick={this.toggleAddGoalForm}
            >
              Добавить новую цель
            </Button>
          </div>
        ) : (
          <div className="py-12 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">У вас пока нет финансовых целей</p>
            {!isAddingGoal && (
              <Button 
                variant="primary" 
                icon={<Plus size={18} />}
                onClick={this.toggleAddGoalForm}
              >
                Добавить цель
              </Button>
            )}
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
        {this.renderAddGoalForm()}
        
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={this.toggleShowCompleted}
          >
            {this.state.showCompleted ? 'Скрыть завершенные' : 'Показать завершенные'}
          </Button>
        </div>
        
        {this.renderActiveGoals()}
        {this.renderCompletedGoals()}
      </>
    );
  }
}

/**
 * Functional wrapper for the class component to use hooks
 */
const GoalsPage: React.FC = () => {
  const { goals, addGoal, updateGoalProgress, removeGoal } = useBudget();

  return (
    <GoalsPageClass
      goals={goals}
      addGoal={addGoal}
      updateGoalProgress={updateGoalProgress}
      removeGoal={removeGoal}
    />
  );
};

export default GoalsPage;