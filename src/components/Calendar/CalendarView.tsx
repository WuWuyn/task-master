import { useState } from 'react';
import type { FC } from 'react';
import { Button, Select, Space, Row, Col, Typography } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { 
  CALENDAR_VIEWS, 
  getWeekRange, 
  getWeekDays, 
  getMonthDays, 
  groupTodosByDate, 
  isToday, 
  getDayOfMonth,
  formatDateRange,
  formatMonthYear
} from '../../utils/calendarUtils';
import type { Todo } from '../../services/todoService';

const { Title, Text } = Typography;
const { Option } = Select;

interface CalendarViewProps {
  todos: Todo[];
  onEditTodo: (todo: Todo) => void;
  onDeleteTodo: (todoId: string) => void;
  onToggleTodo: (todoId: string, completed: boolean) => void;
}

// Helper function to get priority color
const getPriorityColor = (priority: number): string => {
  switch (priority) {
    case 3: return '#ff4d4f'; // High - Red
    case 2: return '#faad14'; // Medium - Orange
    case 1: return '#52c41a'; // Low - Green
    default: return '#faad14'; // Default - Orange
  }
};

// Helper function to get priority label
const getPriorityLabel = (priority: number): string => {
  switch (priority) {
    case 3: return 'High';
    case 2: return 'Medium';
    case 1: return 'Low';
    default: return 'Medium';
  }
};

// WeekView Component with TimeTable-inspired design
const WeekView: FC<{ todos: Todo[]; currentDate: Date; onEditTodo: (todo: Todo) => void }> = ({ 
  todos, 
  currentDate, 
  onEditTodo 
}) => {
  const weekDays = getWeekDays(currentDate);
  const groupedTodos = groupTodosByDate(todos);
  const HOUR_HEIGHT = 60; // Height per hour in pixels
  const hours = Array.from({ length: 25 }, (_, i) => i); // 0-24 hours (includes next day's 12AM)
  
  // Helper function to format hour display
  const formatHour = (hour: number) => {
    if (hour === 0 || hour === 24) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };

  // Helper function to get day abbreviation
  const getDayShort = (dayIndex: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  };

  // Helper function to filter todos into all-day and timed categories
  const categorizeTodos = (dayTodos: Todo[]) => {
    // Todos with both startTime and endTime are considered timed
    // Others are treated as all-day tasks
    const allDayTodos = dayTodos.filter(todo => !todo.startTime || !todo.endTime);
    const timedTodos = dayTodos.filter(todo => todo.startTime && todo.endTime);
    
    return { allDayTodos, timedTodos };
  };

  // Helper function to position todos based on time (if available)
  const getTodoPosition = (todo: Todo, index: number) => {
    if (todo.startTime && todo.endTime) {
      // Convert time to minutes and position accordingly
      const [startHour, startMin] = todo.startTime.split(':').map(Number);
      const [endHour, endMin] = todo.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const duration = endMinutes - startMinutes;
      
      return {
        top: (startMinutes / 60) * HOUR_HEIGHT,
        height: Math.max(30, (duration / 60) * HOUR_HEIGHT)
      };
    }
    
    // Fallback for todos without specific time
    const baseTop = index * 80;
    return {
      top: baseTop,
      height: 70
    };
  };

  return (
    <div style={{ 
      background: '#ffffff', 
      borderRadius: '16px', 
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      overflow: 'hidden',
      height: 'calc(100vh - 200px)',
      margin: '20px'
    }}>
      {/* Week Header - Fixed */}
      <div style={{ 
        display: 'flex', 
        marginBottom: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: '#ffffff',
        borderRadius: '12px',
        paddingRight: '17px' // Account for scrollbar width
      }}>
        <div style={{ 
          width: '80px', 
          padding: '16px 12px', 
          background: '#f8f9fa', 
          borderRadius: '12px 0 0 12px',
          borderRight: '1px solid #f0f0f0'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#8c8c8c', textAlign: 'center' }}>TIME</div>
        </div>
        {weekDays.map((day, dayIndex) => {
          const isCurrentDay = isToday(day);
          return (
            <div key={day.toISOString()} style={{ 
              flex: 1, 
              padding: '16px 12px', 
              textAlign: 'center',
              background: isCurrentDay ? 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' : '#f8f9fa',
              borderRadius: dayIndex === 6 ? '0 12px 12px 0' : '0',
              borderRight: dayIndex < 6 ? '1px solid #f0f0f0' : 'none'
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                color: isCurrentDay ? 'rgba(255, 255, 255, 0.8)' : '#8c8c8c',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {getDayShort(day.getDay())}
              </div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: isCurrentDay ? '#ffffff' : '#262626'
              }}>
                {getDayOfMonth(day)}
              </div>
            </div>
          );
        })}
      </div>

      {/* All-Day Tasks Section */}
      <div style={{
        marginBottom: '16px',
        border: '1px solid #f0f0f0',
        borderRadius: '12px',
        background: '#ffffff',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
        paddingRight: '17px' // Account for scrollbar width
      }}>
        <div style={{ 
          display: 'flex',
          minHeight: '60px'
        }}>
          <div style={{ 
            width: '80px', 
            background: '#f8f9fa',
            borderRadius: '12px 0 0 12px',
            borderRight: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ 
              fontSize: '0.7rem', 
              fontWeight: '600', 
              color: '#8c8c8c', 
              textAlign: 'center',
              lineHeight: '1.2'
            }}>
              ALL-DAY
            </div>
          </div>
          
          {weekDays.map((day, dayIndex) => {
            const isCurrentDay = isToday(day);
            const dayKey = day.toISOString().split('T')[0];
            const dayTodos = groupedTodos[dayKey] || [];
            const { allDayTodos } = categorizeTodos(dayTodos);
            
            return (
              <div key={`allday-${day.toISOString()}`} style={{
                flex: 1,
                borderRight: dayIndex < 6 ? '1px solid #f0f0f0' : 'none',
                padding: '8px 6px',
                background: isCurrentDay ? 'rgba(24, 144, 255, 0.02)' : '#ffffff',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {allDayTodos.map((todo) => {
                  const priorityColor = getPriorityColor(todo.priority || 2);
                  return (
                    <div
                      key={`allday-${todo.id}`}
                      style={{
                        background: priorityColor,
                        color: '#ffffff',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                        border: `1px solid ${priorityColor}`,
                        textDecoration: todo.completed ? 'line-through' : 'none',
                        opacity: todo.completed ? 0.7 : 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      onClick={() => onEditTodo(todo)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      title={todo.title} // Show full title on hover
                    >
                      {todo.title}
                    </div>
                  );
                })}
                
                {allDayTodos.length === 0 && (
                  <div style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#d9d9d9',
                    fontSize: '0.7rem'
                  }}>
                    {/* Empty state - no visual indicator needed */}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable Time Grid */}
      <div style={{ 
        height: '500px',
        overflow: 'auto',
        border: '1px solid #f0f0f0',
        borderRadius: '12px',
        background: '#fafafa'
      }}>
        <div style={{ display: 'flex', position: 'relative', height: `${25 * 60}px` }}>
          {/* Time Column - Sticky */}
          <div style={{ 
            width: '80px', 
            background: '#f8f9fa',
            position: 'sticky',
            left: 0,
            zIndex: 5,
            borderRight: '1px solid #f0f0f0'
          }}>
            {hours.map((hour) => (
              <div key={hour} style={{
                height: `${HOUR_HEIGHT}px`,
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: '8px',
                position: 'relative'
              }}>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  color: '#8c8c8c',
                  textAlign: 'center',
                  lineHeight: '1'
                }}>
                  {formatHour(hour)}
                </div>
                {/* Half-hour marker */}
                <div style={{
                  position: 'absolute',
                  top: `${HOUR_HEIGHT / 2}px`,
                  right: '8px',
                  width: '8px',
                  height: '1px',
                  background: '#d9d9d9'
                }} />
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ flex: 1, display: 'flex' }}>
            {weekDays.map((day, dayIndex) => {
              const isCurrentDay = isToday(day);
              const dayKey = day.toISOString().split('T')[0];
              const dayTodos = groupedTodos[dayKey] || [];
              
              return (
                <div key={day.toISOString()} style={{ 
                  flex: 1, 
                  borderRight: dayIndex < 6 ? '1px solid #f0f0f0' : 'none',
                  position: 'relative',
                  background: isCurrentDay ? 'rgba(24, 144, 255, 0.02)' : '#ffffff'
                }}>
                  {/* Hour grid lines */}
                  {hours.map((hour) => (
                    <div key={hour} style={{
                      height: `${HOUR_HEIGHT}px`,
                      borderBottom: '1px solid #f5f5f5',
                      position: 'relative'
                    }}>
                      {/* Half-hour line */}
                      <div style={{
                        position: 'absolute',
                        top: `${HOUR_HEIGHT / 2}px`,
                        left: '0',
                        right: '0',
                        height: '1px',
                        background: '#fafafa'
                      }} />
                    </div>
                  ))}

                  {/* Timed Todos positioned absolutely */}
                  {(() => {
                    const { timedTodos } = categorizeTodos(dayTodos);
                    return timedTodos.map((todo, todoIndex) => {
                      const position = getTodoPosition(todo, todoIndex);
                      const priorityColor = getPriorityColor(todo.priority || 2);
                    
                    return (
                      <div
                        key={todo.id}
                        style={{
                          position: 'absolute',
                          top: `${position.top}px`,
                          left: '6px',
                          right: '6px',
                          height: `${position.height}px`,
                          background: priorityColor,
                          color: '#ffffff',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          border: `2px solid ${priorityColor}`,
                          zIndex: 3,
                          transition: 'all 0.3s ease',
                          overflow: 'hidden'
                        }}
                        onClick={() => onEditTodo(todo)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
                          e.currentTarget.style.zIndex = '10';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.zIndex = '3';
                        }}
                      >
                        <div style={{
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          marginBottom: '4px',
                          lineHeight: '1.2',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          opacity: todo.completed ? 0.7 : 1
                        }}>
                          {todo.title}
                        </div>
                        
                        <div style={{
                          fontSize: '0.7rem',
                          opacity: 0.9,
                          fontWeight: '500'
                        }}>
                          {todo.startTime && todo.endTime ? `${todo.startTime} - ${todo.endTime}` : `${getPriorityLabel(todo.priority || 2)} Priority`}
                        </div>
                        
                        {position.height > 50 && (
                          <div style={{
                            fontSize: '0.65rem',
                            opacity: 0.8,
                            marginTop: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {todo.description ? `📝 ${todo.description}` : `🏷️ ${getPriorityLabel(todo.priority || 2)}`}
                          </div>
                        )}
                      </div>
                    );
                    });
                  })()}

                  {/* Current time indicator for today */}
                  {isCurrentDay && (() => {
                    const now = new Date();
                    const currentHour = now.getHours() + now.getMinutes() / 60;
                    return (
                      <div style={{
                        position: 'absolute',
                        top: `${currentHour * HOUR_HEIGHT}px`,
                        left: '0',
                        right: '0',
                        height: '2px',
                        background: '#ff4d4f',
                        zIndex: 15,
                        boxShadow: '0 0 6px rgba(255, 77, 79, 0.6)'
                      }}>
                        <div style={{
                          position: 'absolute',
                          left: '-6px',
                          top: '-5px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: '#ff4d4f',
                          boxShadow: '0 0 6px rgba(255, 77, 79, 0.6)'
                        }} />
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// MonthView Component
const MonthView: FC<{ todos: Todo[]; currentDate: Date; onEditTodo: (todo: Todo) => void }> = ({ 
  todos, 
  currentDate, 
  onEditTodo 
}) => {
  const monthDays = getMonthDays(currentDate.getMonth(), currentDate.getFullYear());
  const groupedTodos = groupTodosByDate(todos);

  // Group days by weeks (limit to 5 weeks maximum)
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  monthDays.forEach((day, index) => {
    if (index === 0) {
      const dayOfWeek = day.getDay();
      const adjustedStartDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      for (let i = 0; i < adjustedStartDay; i++) {
        currentWeek.push(new Date(0));
      }
    }
    
    currentWeek.push(day);
    
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek = [];
      
      // Limit to 5 weeks maximum
      if (weeks.length >= 5) {
        return;
      }
    }
  });
  
  // Only add the last partial week if we haven't reached 5 weeks yet
  if (currentWeek.length > 0 && weeks.length < 5) {
    while (currentWeek.length < 7) {
      currentWeek.push(new Date(0));
    }
    weeks.push(currentWeek);
  }

  return (
    <div style={{ 
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff',
      margin: '20px',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 6px 24px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(0, 0, 0, 0.04)'
    }}>
      {/* Month Header */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName) => (
          <div key={dayName} style={{
            padding: '20px 12px',
            textAlign: 'center',
            borderRight: '1px solid rgba(0, 0, 0, 0.04)'
          }}>
            <Text style={{ 
              color: '#595959', 
              fontWeight: '500',
              fontSize: '0.85rem',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              {dayName}
            </Text>
          </div>
        ))}
      </div>

      {/* Month Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            minHeight: '140px'
          }}>
            {week.map((day, dayIndex) => {
              const isEmptyDay = day.getTime() === 0;
              // Fix date key generation to match the format used in groupTodosByDate
              const dayKey = isEmptyDay ? '' : dayjs(day).format('YYYY-MM-DD');
              const dayTodos = isEmptyDay ? [] : (groupedTodos[dayKey] || []);
              const isCurrentMonth = !isEmptyDay && day.getMonth() === currentDate.getMonth();
              
              return (
                <div key={`${weekIndex}-${dayIndex}`} style={{
                  borderRight: '1px solid rgba(0, 0, 0, 0.04)',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
                  padding: '12px 8px',
                  background: isToday(day) ? 'linear-gradient(135deg, rgba(82, 196, 26, 0.08) 0%, rgba(115, 209, 61, 0.05) 100%)' : '#ffffff',
                  opacity: isCurrentMonth ? 1 : 0.3,
                  overflowY: 'auto',
                  transition: 'background 0.2s ease'
                }}>
                  {!isEmptyDay && (
                    <>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: isToday(day) ? '#52c41a' : '#262626',
                        marginBottom: '8px',
                        transition: 'color 0.2s ease'
                      }}>
                        {getDayOfMonth(day)}
                      </div>
                      
                      {dayTodos.slice(0, 3).map((todo) => (
                        <div
                          key={todo.id}
                          style={{
                            background: '#ffffff',
                            borderRadius: '8px',
                            padding: '4px 8px',
                            marginBottom: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: 'none',
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                          onClick={() => onEditTodo(todo)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.12)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.06)';
                          }}
                        >
                          <Text style={{ 
                            color: todo.completed ? '#8c8c8c' : '#262626',
                            textDecoration: todo.completed ? 'line-through' : 'none',
                            fontSize: '0.75rem',
                            lineHeight: '1.3'
                          }}>
                            {todo.title.length > 12 ? `${todo.title.substring(0, 12)}...` : todo.title}
                          </Text>
                          {todo.priority && (
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: getPriorityColor(todo.priority),
                              marginLeft: '6px',
                              flexShrink: 0
                            }} />
                          )}
                        </div>
                      ))}
                      
                      {dayTodos.length > 3 && (
                        <div style={{
                          fontSize: '0.7rem',
                          color: '#8c8c8c',
                          textAlign: 'center',
                          marginTop: '4px',
                          fontWeight: '500'
                        }}>
                          +{dayTodos.length - 3} more
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const CalendarView: FC<CalendarViewProps> = ({ todos, onEditTodo }) => {
  const [viewType, setViewType] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else if (viewType === 'month') {
      newDate.setMonth(currentDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else if (viewType === 'month') {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getDateRangeTitle = () => {
    if (viewType === 'week') {
      const { start, end } = getWeekRange(currentDate);
      return formatDateRange(start, end);
    } else {
      return formatMonthYear(currentDate.getMonth(), currentDate.getFullYear());
    }
  };

  const renderContent = () => {
    if (viewType === 'week') {
      return <WeekView todos={todos} currentDate={currentDate} onEditTodo={onEditTodo} />;
    } else {
      return <MonthView todos={todos} currentDate={currentDate} onEditTodo={onEditTodo} />;
    }
  };

  return (
    <div style={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.06)'
    }}>
      {/* Enhanced Header */}
      <div style={{ 
        padding: '28px 36px',
        background: 'linear-gradient(135deg, #262626 0%, #404040 100%)',
        borderBottom: 'none'
      }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <Select 
                value={viewType} 
                onChange={setViewType} 
                style={{ minWidth: '140px', width: 'auto' }}
                size="large"
                dropdownStyle={{
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
                }}
              >
                {CALENDAR_VIEWS.map(view => (
                  <Option key={view.type} value={view.type}>
                    <Space>
                      <span>{view.type === 'week' ? '📅' : '🗓️'}</span>
                      {view.label}
                    </Space>
                  </Option>
                ))}
              </Select>
              
              <Space>
                <Button 
                  icon={<LeftOutlined />} 
                  onClick={navigatePrevious}
                  size="large"
                  style={{
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    color: '#262626',
                    fontWeight: '500',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    backdropFilter: 'blur(8px)',
                    height: '44px',
                    width: '44px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                  }}
                />
                <Button 
                  onClick={() => setCurrentDate(new Date())}
                  size="large"
                  style={{
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: '600',
                    boxShadow: '0 4px 16px rgba(82, 196, 26, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    padding: '0 24px',
                    height: '44px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(82, 196, 26, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(82, 196, 26, 0.3)';
                  }}
                >
                  Today
                </Button>
                <Button 
                  icon={<RightOutlined />} 
                  onClick={navigateNext}
                  size="large"
                  style={{
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    color: '#262626',
                    fontWeight: '500',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    backdropFilter: 'blur(8px)',
                    height: '44px',
                    width: '44px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                  }}
                />
              </Space>
            </Space>
          </Col>
          
          <Col>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ 
                margin: 0, 
                color: '#ffffff',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                fontWeight: '700'
              }}>
                {getDateRangeTitle()}
              </Title>
            </div>
          </Col>
          
          <Col>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              padding: '12px 20px',
              border: 'none',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              backdropFilter: 'blur(12px)'
            }}>
              <Text style={{ 
                color: '#262626', 
                fontWeight: '600',
                fontSize: '0.9rem',
                letterSpacing: '0.5px'
              }}>
                📊 {todos.length} tasks
              </Text>
            </div>
          </Col>
        </Row>
      </div>

      {/* Calendar Content - Full height */}
      <div style={{ 
        flex: 1,
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default CalendarView;
