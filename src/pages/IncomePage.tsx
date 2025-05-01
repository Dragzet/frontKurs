import React, { useState } from 'react';
import { Plus, Trash2, Filter, Search, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import { useBudget, IncomeItem } from '../context/BudgetContext';
import { 
  formatCurrency, 
  formatDate, 
  formatDateForInput, 
  getCurrentMonth,
  getIncomeSources
} from '../utils/formatters';
import MonthSelector from '../components/MonthSelector';

const IncomePage: React.FC = () => {
  const { incomes, addIncome, removeIncome } = useBudget();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [filterSource, setFilterSource] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(formatDateForInput());
  const [isRecurring, setIsRecurring] = useState(false);
  
  // Form error state
  const [errors, setErrors] = useState({
    amount: '',
    source: '',
    description: '',
    date: '',
  });

  const sources = getIncomeSources();
  
  const sourceOptions = sources.map(src => ({
    value: src,
    label: src,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {
      amount: !amount ? 'Введите сумму' : '',
      source: !source ? 'Выберите источник' : '',
      description: !description ? 'Введите описание' : '',
      date: !date ? 'Выберите дату' : '',
    };
    
    setErrors(newErrors);
    
    if (Object.values(newErrors).some(error => error)) {
      return;
    }
    
    // Add income
    addIncome({
      amount: parseFloat(amount),
      source,
      description,
      date,
      isRecurring,
    });
    
    // Reset form
    setAmount('');
    setSource('');
    setDescription('');
    setDate(formatDateForInput());
    setIsRecurring(false);
    
    // Close add income form
    setIsAddingIncome(false);
  };
  
  // Filter incomes by month, source, and search term
  const filteredIncomes = incomes.filter(income => {
    const matchesMonth = income.date.startsWith(currentMonth);
    const matchesSource = !filterSource || income.source === filterSource;
    const matchesSearch = !searchTerm || 
      income.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      income.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesMonth && matchesSource && matchesSearch;
  });
  
  // Calculate total for filtered incomes
  const filteredTotal = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
  
  // Group incomes by date
  const incomesByDate = filteredIncomes.reduce((acc, income) => {
    const date = income.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(income);
    return acc;
  }, {} as Record<string, IncomeItem[]>);
  
  // Sort dates in descending order
  const sortedDates = Object.keys(incomesByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Доходы</h1>
        <Button 
          variant="success" 
          icon={<Plus size={18} />}
          onClick={() => setIsAddingIncome(!isAddingIncome)}
        >
          Добавить доход
        </Button>
      </div>
      
      <MonthSelector currentMonth={currentMonth} onChange={setCurrentMonth} />
      
      {isAddingIncome && (
        <Card title="Новый доход">
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
                label="Источник"
                options={sourceOptions}
                value={source}
                onChange={setSource}
                error={errors.source}
                required
                fullWidth
              />
              
              <Input
                label="Описание"
                type="text"
                placeholder="Например: Зарплата за апрель"
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
              
              <div className="md:col-span-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
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
                onClick={() => setIsAddingIncome(false)}
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
      )}
      
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex items-center space-x-2">
          <Select
            options={[
              { value: '', label: 'Все источники' },
              ...sourceOptions
            ]}
            value={filterSource}
            onChange={setFilterSource}
            className="mb-0 w-48"
          />
          <Badge variant="success" size="md">
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
                          onClick={() => removeIncome(income.id)}
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
              {searchTerm || filterSource 
                ? 'Доходы не найдены. Попробуйте изменить параметры поиска.' 
                : 'В этом месяце еще нет доходов.'}
            </p>
            {!isAddingIncome && (
              <Button 
                variant="success" 
                icon={<Plus size={18} />}
                onClick={() => setIsAddingIncome(true)}
              >
                Добавить доход
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default IncomePage;