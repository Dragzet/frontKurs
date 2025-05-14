import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthName } from '../utils/formatters';

type MonthSelectorProps = {
  currentMonth: string;
  onChange: (month: string) => void;
};

const MonthSelector = ({ currentMonth, onChange }: MonthSelectorProps) => {
  const [year, month] = currentMonth.split('-').map(Number);
  
  const handlePrevMonth = () => {
    let prevMonth = month - 1;
    let prevYear = year;
    
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    
    onChange(`${prevYear}-${String(prevMonth).padStart(2, '0')}`);
  };
  
  const handleNextMonth = () => {
    let nextMonth = month + 1;
    let nextYear = year;
    
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    
    onChange(`${nextYear}-${String(nextMonth).padStart(2, '0')}`);
  };

  return (
    <div className="flex items-center justify-center space-x-4 mb-6">
      <button
        onClick={handlePrevMonth}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Предыдущий месяц"
      >
        <ChevronLeft size={20} />
      </button>
      
      <div className="font-medium text-lg">
        {getMonthName(`${currentMonth}-01`)} {year}
      </div>
      
      <button
        onClick={handleNextMonth}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Следующий месяц"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default MonthSelector;