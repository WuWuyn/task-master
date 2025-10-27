import type { FC } from 'react';
import { useMemo } from 'react';
import { Card, Row, Col, Statistic, Tag } from 'antd';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  RiseOutlined, 
  PieChartOutlined, 
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { Todo } from '../../services/todoService';

interface AnalyticsProps {
  todos: Todo[];
}

const Analytics: FC<AnalyticsProps> = ({ todos }) => {
  // Analyze data for charts
  const analytics = useMemo(() => {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    // 1. Daily completion trend (last 7 days)
    const dailyCompletions = last7Days.map(date => {
      const dayTodos = todos.filter(todo => {
        const todoDate = todo.updatedAt.toDate().toISOString().split('T')[0];
        return todoDate === date;
      });
      
      const completed = dayTodos.filter(todo => todo.completed).length;
      const total = dayTodos.length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        completed,
        total,
        completionRate
      };
    });

    // 2. Priority distribution
    const priorityStats = {
      high: todos.filter(todo => todo.priority === 3).length,
      medium: todos.filter(todo => todo.priority === 2).length,
      low: todos.filter(todo => todo.priority === 1).length,
    };

    const priorityData = [
      { name: 'High Priority', value: priorityStats.high, color: '#ff4d4f' },
      { name: 'Medium Priority', value: priorityStats.medium, color: '#faad14' },
      { name: 'Low Priority', value: priorityStats.low, color: '#52c41a' },
    ].filter(item => item.value > 0);

    // 3. Productivity by day of week
    const weekdayStats = Array.from({ length: 7 }, (_, i) => {
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i];
      const dayTodos = todos.filter(todo => {
        const todoDay = todo.createdAt.toDate().getDay();
        return todoDay === i;
      });
      
      const completed = dayTodos.filter(todo => todo.completed).length;
      const pending = dayTodos.filter(todo => !todo.completed).length;
      
      return {
        day: dayName,
        completed,
        pending,
        total: completed + pending,
        productivity: completed + pending > 0 ? Math.round((completed / (completed + pending)) * 100) : 0
      };
    });

    // 4. Key metrics for insights
    const totalTasks = todos.length;
    const completedTasks = todos.filter(todo => todo.completed).length;
    const averageCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const overdueTasks = todos.filter(todo => {
      if (!todo.dueDate || todo.completed) return false;
      return new Date(todo.dueDate) < now;
    }).length;

    const avgTasksPerDay = Math.round(totalTasks / 7);

    return {
      dailyCompletions,
      priorityData,
      weekdayStats,
      insights: {
        averageCompletionRate,
        overdueTasks,
        avgTasksPerDay,
        mostProductiveDay: weekdayStats.reduce((prev, current) => 
          prev.productivity > current.productivity ? prev : current
        ).day,
        totalTasks,
        completedTasks
      }
    };
  }, [todos]);

  const generateInsights = () => {
    const { insights, weekdayStats, priorityData } = analytics;
    const insights_list = [];

    // Completion rate insight
    if (insights.averageCompletionRate >= 80) {
      insights_list.push({
        type: 'success',
        text: `Excellent! You maintain a ${insights.averageCompletionRate}% completion rate.`
      });
    } else if (insights.averageCompletionRate >= 60) {
      insights_list.push({
        type: 'warning',
        text: `Good progress with ${insights.averageCompletionRate}% completion rate. Try to push to 80%+.`
      });
    } else {
      insights_list.push({
        type: 'error',
        text: `Your ${insights.averageCompletionRate}% completion rate needs improvement. Focus on fewer tasks.`
      });
    }

    // Overdue insight
    if (insights.overdueTasks > 0) {
      insights_list.push({
        type: 'error',
        text: `You have ${insights.overdueTasks} overdue tasks. Consider reviewing your deadlines.`
      });
    } else {
      insights_list.push({
        type: 'success',
        text: 'Great job staying on top of your deadlines!'
      });
    }

    // Productivity pattern insight
    const maxProductivity = Math.max(...weekdayStats.map(d => d.productivity));
    if (maxProductivity > 0) {
      insights_list.push({
        type: 'info',
        text: `Your most productive day is ${insights.mostProductiveDay}. Schedule important tasks then.`
      });
    }

    // Priority balance insight
    const highPriorityTasks = priorityData.find(p => p.name === 'High Priority')?.value || 0;
    const totalPriorityTasks = priorityData.reduce((sum, p) => sum + p.value, 0);
    
    if (totalPriorityTasks > 0 && highPriorityTasks / totalPriorityTasks > 0.5) {
      insights_list.push({
        type: 'warning',
        text: 'Too many high priority tasks. Consider redistributing priorities for better focus.'
      });
    } else if (highPriorityTasks === 0 && totalPriorityTasks > 0) {
      insights_list.push({
        type: 'info',
        text: 'No high priority tasks. Make sure important items are properly prioritized.'
      });
    }

    return insights_list;
  };

  const insights = generateInsights();


  return (
    <div style={{ marginTop: '40px' }}>
      {/* Analytics Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-text)' }}>
          📊 Analytics & Insights
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-muted)' }}>
          Understand your productivity patterns and optimize your workflow
        </p>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Average Completion Rate"
              value={analytics.insights.averageCompletionRate}
              suffix="%"
              prefix={<RiseOutlined style={{ color: analytics.insights.averageCompletionRate >= 70 ? '#52c41a' : '#faad14' }} />}
              valueStyle={{ color: analytics.insights.averageCompletionRate >= 70 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tasks per Day"
              value={analytics.insights.avgTasksPerDay}
              prefix={<BarChartOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Most Productive Day"
              value={analytics.insights.mostProductiveDay}
              prefix={<PieChartOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        {/* Daily Completion Trend */}
        <Col xs={24} xl={12}>
          <Card title={<span style={{ color: 'var(--color-text)' }}>📈 7-Day Completion Trend</span>}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.dailyCompletions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#e6f4ff" name="Total Tasks" />
                <Bar dataKey="completed" fill="#52c41a" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Priority Distribution */}
        <Col xs={24} xl={12}>
          <Card title={<span style={{ color: 'var(--color-text)' }}>🎯 Task Priority Distribution</span>}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name} ${((entry.value / analytics.priorityData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Weekly Productivity and Completion Rate Trend */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} xl={12}>
          <Card title={<span style={{ color: 'var(--color-text)' }}>📅 Weekly Productivity Pattern</span>}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.weekdayStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#52c41a" name="Completed" />
                <Bar dataKey="pending" stackId="a" fill="#faad14" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card title={<span style={{ color: 'var(--color-text)' }}>📊 Daily Completion Rate Trend</span>}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.dailyCompletions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                <Line 
                  type="monotone" 
                  dataKey="completionRate" 
                  stroke="#1890ff" 
                  strokeWidth={3}
                  name="Completion Rate (%)"
                  dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* AI-Powered Insights */}
      <Card 
        title={<span style={{ color: 'var(--color-text)' }}>🧠 Smart Insights & Recommendations</span>}
      >
        <Row gutter={[16, 16]}>
          {insights.map((insight, index) => (
            <Col xs={24} md={12} key={index}>
              <div style={{ 
                padding: '16px', 
                border: `1px solid ${insight.type === 'success' ? 'var(--color-success)' : insight.type === 'warning' ? 'var(--color-warning)' : insight.type === 'error' ? 'var(--color-error)' : 'var(--color-primary)'}`,
                borderRadius: '8px',
                backgroundColor: 'var(--color-background-elevated)',
                borderLeft: `4px solid ${insight.type === 'success' ? 'var(--color-success)' : insight.type === 'warning' ? 'var(--color-warning)' : insight.type === 'error' ? 'var(--color-error)' : 'var(--color-primary)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {insight.type === 'success' ? 
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
                    <ClockCircleOutlined style={{ color: insight.type === 'warning' ? '#faad14' : insight.type === 'error' ? '#ff4d4f' : '#1890ff' }} />
                  }
                  <Tag color={insight.type === 'success' ? 'green' : insight.type === 'warning' ? 'orange' : insight.type === 'error' ? 'red' : 'blue'}>
                    {insight.type.toUpperCase()}
                  </Tag>
                </div>
                <p style={{ margin: '8px 0 0 0', color: 'var(--color-text)' }}>{insight.text}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default Analytics;
