import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useBudget } from '../context/BudgetContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { 
  formatCurrency, 
  getCurrentMonth, 
  getMonthName,
  getCategoryColor,
  calculatePercentage
} from '../utils/formatters';
import { DownloadCloud, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import MonthSelector from '../components/MonthSelector';

const SummaryPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const { expenses, incomes, getTotalExpenses, getTotalIncome, getExpensesByCategory } = useBudget();
  
  const [compareMonth, setCompareMonth] = useState('');
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  // Generate last 6 months for comparison dropdown
  const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: `${getMonthName(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`)} ${date.getFullYear()}`,
    };
  });

  // Current month stats
  const totalExpenses = getTotalExpenses(currentMonth);
  const totalIncome = getTotalIncome(currentMonth);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? calculatePercentage(balance, totalIncome) : 0;
  
  // Expense categories data for current month
  const expensesByCategory = getExpensesByCategory(currentMonth);
  const expensesByCategoryData = Object.entries(expensesByCategory)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  // Compare data if a comparison month is selected
  const compareExpenses = compareMonth ? getTotalExpenses(compareMonth) : 0;
  const compareIncome = compareMonth ? getTotalIncome(compareMonth) : 0;
  const compareBalance = compareIncome - compareExpenses;
  
  // Prepare comparison data for the chart
  const comparisonData = [
    {
      name: 'Доходы',
      current: totalIncome,
      compare: compareMonth ? compareIncome : 0,
    },
    {
      name: 'Расходы',
      current: totalExpenses,
      compare: compareMonth ? compareExpenses : 0,
    },
    {
      name: 'Баланс',
      current: balance,
      compare: compareMonth ? compareBalance : 0,
    },
  ];

  // Generate monthly data for the last 6 months
  const last6MonthsData = lastSixMonths.map(month => {
    const monthExpenses = getTotalExpenses(month.value);
    const monthIncome = getTotalIncome(month.value);
    
    return {
      name: month.label.split(' ')[0], // Just get the month name
      expenses: monthExpenses,
      income: monthIncome,
      balance: monthIncome - monthExpenses,
    };
  }).reverse(); // So it shows chronologically from left to right

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-gray-700">{formatCurrency(data.value)}</p>
          <p className="text-gray-500">
            {calculatePercentage(data.value, totalExpenses)}% от общей суммы
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Финансовый отчет</h1>
        <Button 
          variant="outline" 
          icon={<DownloadCloud size={18} />}
          onClick={() => {
            // In a real app, this would generate a PDF or CSV export
            alert('В реальном приложении здесь был бы экспорт данных в PDF или CSV');
          }}
        >
          Экспорт отчета
        </Button>
      </div>

      <MonthSelector currentMonth={currentMonth} onChange={setCurrentMonth} />
      
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
              <p className="text-xs text-gray-500 mt-1">
                Норма накоплений: {savingsRate}%
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Расходы по категориям">
          <div className="mb-4 flex flex-wrap justify-between items-center">
            <div className="text-sm text-gray-500">
              {expensesByCategoryData.length} {expensesByCategoryData.length === 1 ? 'категория' : 
                expensesByCategoryData.length < 5 ? 'категории' : 'категорий'}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant={chartType === 'pie' ? 'primary' : 'outline'} 
                size="sm"
                onClick={() => setChartType('pie')}
              >
                Круговая
              </Button>
              <Button 
                variant={chartType === 'bar' ? 'primary' : 'outline'} 
                size="sm"
                onClick={() => setChartType('bar')}
              >
                Столбчатая
              </Button>
            </div>
          </div>
          
          <div className="h-64">
            {expensesByCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={expensesByCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expensesByCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                ) : (
                  <BarChart
                    data={expensesByCategoryData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Нет расходов за выбранный период</p>
              </div>
            )}
          </div>
        </Card>

        <Card title="Сравнение по месяцам">
          <div className="mb-4">
            <Select
              options={[
                { value: '', label: 'Выберите месяц для сравнения' },
                ...lastSixMonths.filter(month => month.value !== currentMonth)
              ]}
              value={compareMonth}
              onChange={setCompareMonth}
              fullWidth
            />
          </div>
          
          <div className="h-64">
            {compareMonth ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${formatCurrency(value)}`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar
                    name={`${getMonthName(`${currentMonth}-01`)}`}
                    dataKey="current"
                    fill="#3B82F6"
                  />
                  <Bar
                    name={`${getMonthName(`${compareMonth}-01`)}`}
                    dataKey="compare"
                    fill="#10B981"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <Calendar className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">Выберите месяц для сравнения</p>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      <Card title="Динамика за 6 месяцев">
        <div className="h-80">
          {last6MonthsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={last6MonthsData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${formatCurrency(value)}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Доходы"
                  stroke="#10B981"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Расходы"
                  stroke="#EF4444"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  name="Баланс"
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">Недостаточно данных для отображения графика</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SummaryPage;