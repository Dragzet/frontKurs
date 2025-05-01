import React, { useState } from 'react';
import { Plus, Target, Trash2, CheckCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency, formatDateForInput, calculatePercentage } from '../utils/formatters';

const GoalsPage: React.FC = () => {
  const { goals, addGoal, updateGoalProgress, removeGoal } = useBudget();
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Form state
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  
  // Progress update form
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [progressAmount, setProgressAmount] = useState('');
  
  // Form error state
  const [errors, setErrors] = useState({
    category: '',
    amount: '',
    endDate: '',
  });

  const goalCategories = [
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
  
  const categoryOptions = [
    ...goalCategories.map(cat => ({
      value: cat,
      label: cat,
    })),
    { value: 'custom', label: 'Своя категория...' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCategory = category === 'custom' ? customCategory : category;
    
    // Validate form
    const newErrors = {
      category: !finalCategory ? 'Выберите или введите категорию' : '',
      amount: !amount ? 'Введите сумму' : '',
      endDate: !endDate ? 'Выберите дату' : '',
    };
    
    setErrors(newErrors);
    
    if (Object.values(newErrors).some(error => error)) {
      return;
    }
    
    // Add goal
    addGoal({
      category: finalCategory,
      amount: parseFloat(amount),
      endDate,
    });
    
    // Reset form
    setCategory('');
    setAmount('');
    setEndDate('');
    setCustomCategory('');
    
    // Close add goal form
    setIsAddingGoal(false);
  };
  
  const handleProgressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGoalId || !progressAmount) {
      return;
    }
    
    updateGoalProgress(selectedGoalId, parseFloat(progressAmount));
    
    // Reset form
    setSelectedGoalId(null);
    setProgressAmount('');
  };
  
  // Filter goals based on completion status
  const filteredGoals = goals.filter(goal => {
    const isCompleted = goal.currentAmount >= goal.amount;
    return showCompleted ? true : !isCompleted;
  });
  
  // Sort goals by end date (closest first)
  const sortedGoals = [...filteredGoals].sort((a, b) => 
    new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
  );
  
  // Group goals by completion status
  const activeGoals = sortedGoals.filter(goal => goal.currentAmount < goal.amount);
  const completedGoals = sortedGoals.filter(goal => goal.currentAmount >= goal.amount);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Финансовые цели</h1>
        <Button 
          variant="primary" 
          icon={<Plus size={18} />}
          onClick={() => setIsAddingGoal(!isAddingGoal)}
        >
          Добавить цель
        </Button>
      </div>
      
      {isAddingGoal && (
        <Card title="Новая финансовая цель">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={category === 'custom' ? 'col-span-2' : ''}>
                <Select
                  label="Категория"
                  options={categoryOptions}
                  value={category}
                  onChange={setCategory}
                  error={errors.category}
                  required
                  fullWidth
                />
                
                {category === 'custom' && (
                  <Input
                    placeholder="Введите свою категорию"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
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
                onChange={(e) => setAmount(e.target.value)}
                error={errors.amount}
                required
                fullWidth
              />
              
              <Input
                label="Планируемая дата достижения"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                error={errors.endDate}
                required
                fullWidth
              />
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => setIsAddingGoal(false)}
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
      )}
      
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowCompleted(!showCompleted)}
        >
          {showCompleted ? 'Скрыть завершенные' : 'Показать завершенные'}
        </Button>
      </div>
      
      {activeGoals.length > 0 ? (
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
                        onClick={() => removeGoal(goal.id)}
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
                      onClick={() => setSelectedGoalId(isSelected ? null : goal.id)}
                    >
                      {isSelected ? 'Отмена' : 'Пополнить'}
                    </Button>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <form onSubmit={handleProgressSubmit} className="flex items-end gap-3">
                      <Input
                        label="Сумма пополнения"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={progressAmount}
                        onChange={(e) => setProgressAmount(e.target.value)}
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
      ) : (
        <Card>
          {completedGoals.length > 0 && !showCompleted ? (
            <div className="py-8 text-center">
              <p className="text-gray-500 mb-4">
                У вас нет активных целей. Все цели достигнуты!
              </p>
              <Button 
                variant="primary" 
                icon={<Plus size={18} />}
                onClick={() => setIsAddingGoal(true)}
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
                  onClick={() => setIsAddingGoal(true)}
                >
                  Добавить цель
                </Button>
              )}
            </div>
          )}
        </Card>
      )}
      
      {showCompleted && completedGoals.length > 0 && (
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
      )}
    </div>
  );
};

export default GoalsPage;