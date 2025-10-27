import dayjs from 'dayjs';
import type { Todo } from '../services/todoService';

export interface CalendarViewType {
  type: 'week' | 'month';
  label: string;
}

export const CALENDAR_VIEWS: CalendarViewType[] = [
  { type: 'week', label: 'Week View' },
  { type: 'month', label: 'Month View' }
];

// Filter todos by date range
export const filterTodosByDateRange = (todos: Todo[], startDate: Date, endDate: Date): Todo[] => {
  return todos.filter(todo => {
    if (!todo.dueDate) return false;
    const todoDate = new Date(todo.dueDate);
    return todoDate >= startDate && todoDate <= endDate;
  });
};

// Filter todos by week
export const filterTodosByWeek = (todos: Todo[], weekStart: Date): Todo[] => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return filterTodosByDateRange(todos, weekStart, weekEnd);
};

// Filter todos by month
export const filterTodosByMonth = (todos: Todo[], month: number, year: number): Todo[] => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  return filterTodosByDateRange(todos, startDate, endDate);
};

// Get week range
export const getWeekRange = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  start.setDate(diff);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  return { start, end };
};

// Get month range
export const getMonthRange = (month: number, year: number): { start: Date; end: Date } => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start, end };
};

// Group todos by date and sort by time
export const groupTodosByDate = (todos: Todo[]): Record<string, Todo[]> => {
  const grouped: Record<string, Todo[]> = {};
  
  todos.forEach(todo => {
    if (todo.dueDate) {
      // Ensure consistent date format and timezone handling
      const dateKey = dayjs(todo.dueDate).format('YYYY-MM-DD');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(todo);
    }
  });
  
  // Sort tasks within each day by time
  Object.keys(grouped).forEach(dateKey => {
    grouped[dateKey].sort((a, b) => {
      // Tasks with start time come first, sorted by start time
      // Tasks without start time come after, sorted by priority (high to low)
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      if (a.startTime && !b.startTime) {
        return -1; // a comes first
      }
      if (!a.startTime && b.startTime) {
        return 1; // b comes first
      }
      // Both don't have start time, sort by priority (high to low)
      return (b.priority ?? 2) - (a.priority ?? 2);
    });
  });
  
  return grouped;
};

// Get week days
export const getWeekDays = (weekStart: Date): Date[] => {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  return days;
};

// Get month days (including padding days from previous/next month)
export const getMonthDays = (month: number, year: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  
  // Adjust to start from Monday
  const dayOfWeek = firstDay.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startDate.setDate(firstDay.getDate() - daysToSubtract);
  
  const days: Date[] = [];
  const currentDate = new Date(startDate);
  
  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};

// Format date range
export const formatDateRange = (start: Date, end: Date): string => {
  const startStr = dayjs(start).format('MMM D');
  const endStr = dayjs(end).format('MMM D, YYYY');
  return `${startStr} - ${endStr}`;
};

// Format month year
export const formatMonthYear = (month: number, year: number): string => {
  return dayjs(new Date(year, month)).format('MMMM YYYY');
};

// Check if date is today
export const isToday = (date: Date): boolean => {
  return dayjs(date).isSame(dayjs(), 'day');
};

// Check if task is overdue
export const isOverdue = (dueDate: string): boolean => {
  return dayjs(dueDate).isBefore(dayjs(), 'day');
};

// Get day of week
export const getDayOfWeek = (date: Date): string => {
  return dayjs(date).format('ddd');
};

// Get day of month
export const getDayOfMonth = (date: Date): number => {
  return date.getDate();
};