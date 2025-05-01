import React, { useState } from 'react';
import { Plus, Trash2, Filter, Search } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import { useBudget, ExpenseItem } from '../context/BudgetContext';
import { 
  formatCurrency, 
  formatDate, 
  formatDateForInput, 
  getCurrentMonth,
  getExpenseCategories,
  getCategoryColor
} from '../utils/formatters';
import MonthSelector from '../components/MonthSelector';

const ExpensesPage: React.FC = () => {
  const { expenses, addExpense, removeExpense } = useBudget();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(formatDateForInput());
  
  // Form error state
  const [errors, setErrors] = useState({
    amount: '',
    category: '',
    description: '',
    date: '',
  });

  const categories = getExpenseCategories();
  
  const categoryOptions = categories.map(cat => ({
    value: cat,
    label: cat,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {
      amount: !amount ? 'Введите сумму' : '',
      category: !category ? 'Выберите категорию' : '',
      description: !description ? 'Введите описание' : '',
      date: !date ? 'Выберите дату' : '',
    };
    
    setErrors(newErrors);
    
    if (Object.values(newErrors).some(error => error)) {
      return;
    }
    
    // Add expense (используем модуль суммы)
    addExpense({
      amount: Math.abs(parseFloat(amount)),
      category,
      description,
      date,
    });
    
    // Reset form
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(formatDateForInput());
    
    // Close add expense form
    setIsAddingExpense(false);
  };
  
  // Filter expenses by month, category, and search term
  const filteredExpenses = expenses.filter(expense => {
    const matchesMonth = expense.date.startsWith(currentMonth);
    const matchesCategory = !filterCategory || expense.category === filterCategory;
    const matchesSearch = !searchTerm || 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesMonth && matchesCategory && matchesSearch;
  });
  
  // Calculate total for filtered expenses
  const filteredTotal = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Group expenses by date
  const expensesByDate = filteredExpenses.reduce((acc, expense) => {
    const date = expense.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(expense);
    return acc;
  }, {} as Record<string, ExpenseItem[]>);
  
  // Sort dates in descending order
  const sortedDates = Object.keys(expensesByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Расходы</h1>
        <Button 
          variant="primary" 
          icon={<Plus size={18} />}
          onClick={() => setIsAddingExpense(!isAddingExpense)}
        >
          Добавить расход
        </Button>
      </div>
      
      <MonthSelector currentMonth={currentMonth} onChange={setCurrentMonth} />
      
      {isAddingExpense && (
        <Card title="Новый расход">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Сумма"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                error={errors.amount}
                required
                fullWidth
              />
              
              <Select
                label="Категория"
                options={categoryOptions}
                value={category}
                onChange={setCategory}
                error={errors.category}
                required
                fullWidth
              />
              
              <Input
                label="Описание"
                type="text"
                placeholder="Например: Продукты в Пятерочке"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={errors.description}
                required
                fullWidth
              />
              
              <Input
                label="Дата"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                error={errors.date}
                required
                fullWidth
              />
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => setIsAddingExpense(false)}
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
      
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex items-center space-x-2">
          <Select
            options={[
              { value: '', label: 'Все категории' },
              ...categoryOptions
            ]}
            value={filterCategory}
            onChange={setFilterCategory}
            className="mb-0 w-48"
          />
          <Badge variant="primary" size="md">
            Всего: {formatCurrency(filteredTotal)}
          </Badge>
        </div>
        
        <Input
          placeholder="Поиск..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-0"
          icon={<Search size={18} className="text-gray-400" />}
        />
      </div>
      
      {sortedDates.length > 0 ? (
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
                          onClick={() => removeExpense(expense.id)}
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
      ) : (
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
                onClick={() => setIsAddingExpense(true)}
              >
                Добавить расход
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ExpensesPage;