import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Generate time options in 30 minute intervals
function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      times.push(`${h}:${m}`);
    }
  }
  return times;
}

const TIME_OPTIONS = generateTimeOptions();

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Выберите дату и время',
  className,
  disabled = false,
}: DateTimePickerProps) {
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const timeDropdownRef = useRef<HTMLDivElement>(null);

  // Parse value into date and time parts
  const parseValue = (val: string) => {
    if (!val) return { date: '', time: '' };
    const [date, time] = val.split('T');
    return { date: date || '', time: time?.slice(0, 5) || '' };
  };

  const { date, time } = parseValue(value);

  const handleDateChange = (newDate: string) => {
    const newTime = time || '12:00';
    onChange(newDate ? `${newDate}T${newTime}` : '');
  };

  const handleTimeChange = (newTime: string) => {
    const newDate = date || new Date().toISOString().split('T')[0];
    onChange(`${newDate}T${newTime}`);
    setShowTimeDropdown(false);
  };

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    if (newTime) {
      const newDate = date || new Date().toISOString().split('T')[0];
      onChange(`${newDate}T${newTime}`);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setShowTimeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format time for display
  const formatTimeDisplay = (t: string) => {
    if (!t) return '';
    const [hours, minutes] = t.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <div className={cn('flex gap-2', className)}>
      {/* Date picker */}
      <div className="relative flex-1">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="date"
          value={date}
          onChange={(e) => handleDateChange(e.target.value)}
          disabled={disabled}
          className={cn(
            'w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            !date && 'text-gray-400'
          )}
        />
      </div>

      {/* Time picker with dropdown */}
      <div className="relative w-32" ref={timeDropdownRef}>
        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />

        {/* Time input - works as fallback */}
        <input
          type="time"
          value={time}
          onChange={handleTimeInputChange}
          disabled={disabled}
          className={cn(
            'w-full pl-10 pr-8 py-2 border border-gray-200 rounded-lg text-sm',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            // Hide native time picker on Safari - we'll use dropdown
            '[&::-webkit-calendar-picker-indicator]:opacity-0',
            '[&::-webkit-calendar-picker-indicator]:absolute',
            '[&::-webkit-calendar-picker-indicator]:right-0',
            '[&::-webkit-calendar-picker-indicator]:w-8',
            '[&::-webkit-calendar-picker-indicator]:h-full',
            '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
          )}
        />

        {/* Dropdown toggle button */}
        <button
          type="button"
          onClick={() => !disabled && setShowTimeDropdown(!showTimeDropdown)}
          disabled={disabled}
          className={cn(
            'absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100',
            'disabled:cursor-not-allowed'
          )}
        >
          <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', showTimeDropdown && 'rotate-180')} />
        </button>

        {/* Time dropdown */}
        {showTimeDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTimeChange(t)}
                className={cn(
                  'w-full px-3 py-1.5 text-left text-sm hover:bg-blue-50',
                  time === t && 'bg-blue-100 text-blue-700 font-medium'
                )}
              >
                {formatTimeDisplay(t)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
