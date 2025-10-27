import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Button, Space, Typography } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { Todo } from '../../services/todoService';
import { subscribeTodos, getPriorityLabel } from '../../services/todoService';
import Analytics from '../../components/Analytics/Analytics';

const { Title, Paragraph } = Typography;

const Dashboard: FC = () => {
  const { user, isLoggedIn } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeTodos(user.uid, (todos) => {
      setTodos(todos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Calculate stats from real data
  const stats = {
    total: todos.length,
    completed: todos.filter(todo => todo.completed).length,
    pending: todos.filter(todo => !todo.completed).length,
    overdue: todos.filter(todo => {
      if (!todo.dueDate || todo.completed) return false;
      const today = new Date();
      const dueDate = new Date(todo.dueDate);
      return dueDate < today;
    }).length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const recentTodos = todos
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
    .slice(0, 4)
    .map(todo => ({
      id: todo.id,
      title: todo.title,
      status: todo.completed ? 'completed' : (
        todo.dueDate && new Date(todo.dueDate) < new Date() ? 'overdue' : 'pending'
      ),
      priority: getPriorityLabel(todo.priority || 0)
    }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#52c41a';
      case 'pending': return '#1890ff';
      case 'overdue': return '#ff4d4f';
      default: return '#666';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#666';
    }
  };

  // Show login prompt if not authenticated
  if (!isLoggedIn) {
    return (
      <div style={{ 
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
        padding: '40px 24px'
      }}>
        {/* Welcome Section */}
        <Card className="animate-fade-in-up" style={{ 
          marginBottom: '32px',
          borderRadius: '16px',
          border: '1px solid var(--color-border)',
          background: 'var(--color-background)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ 
            textAlign: 'center', 
            padding: '48px 32px',
            background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)',
            borderRadius: '12px',
            margin: '-24px -24px 24px -24px'
          }}>
            <Title level={2} className="animate-bounce-in animate-delay-200" style={{ 
              marginBottom: '16px', 
              color: 'var(--color-text)',
              fontWeight: '700'
            }}>
              Welcome to Excellence!
            </Title>
            <Paragraph className="animate-fade-in-up animate-delay-300" style={{ 
              fontSize: '1.1rem', 
              color: 'var(--color-text-secondary)', 
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              Sign in to unlock your productivity command center and embark on your journey to extraordinary achievement.
            </Paragraph>
            <Space size="large" direction="vertical" style={{ width: '100%' }}>
              <Link to="/login" style={{ width: '100%' }}>
                <Button 
                  type="primary" 
                  size="large" 
                  className="animate-scale-in animate-delay-500 hover-lift hover-glow"
                  style={{ 
                    width: '100%',
                    height: '48px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  Launch Your First Mission
                </Button>
              </Link>
              <Link to="/register" style={{ width: '100%' }}>
                <Button 
                  size="large" 
                  className="animate-scale-in animate-delay-600 hover-scale"
                  style={{ 
                    width: '100%',
                    height: '48px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    border: '2px solid var(--color-primary)',
                    color: 'var(--color-primary)',
                    background: 'transparent'
                  }}
                >
                  Join the Elite
                </Button>
              </Link>
            </Space>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'var(--color-background)',
      padding: '40px 0'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div className="animate-fade-in-up" style={{ 
          marginBottom: '48px',
          textAlign: 'center'
        }}>
          <Title level={1} className="animate-bounce-in animate-delay-200" style={{ 
            fontSize: '3.5rem', 
            fontWeight: '800', 
            marginBottom: '16px', 
            color: 'var(--color-text)',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Command Center
          </Title>
            <Paragraph className="animate-fade-in-up animate-delay-400" style={{ 
              fontSize: '1.3rem', 
              color: 'var(--color-text-secondary)',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Your strategic headquarters for orchestrating productivity excellence and achieving extraordinary results
            </Paragraph>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: '48px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="animate-scale-in animate-delay-100 hover-lift" style={{ 
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
              color: 'white'
            }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>Total Tasks</span>}
                value={todos.length}
                valueStyle={{ color: 'white', fontSize: '2.5rem', fontWeight: '700' }}
                suffix={<span style={{ fontSize: '1rem', opacity: 0.8 }}>tasks</span>}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="animate-scale-in animate-delay-400 hover-lift" style={{ 
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
              color: 'white'
            }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>Overdue Tasks</span>}
                value={stats.overdue}
                valueStyle={{ color: 'white', fontSize: '2.5rem', fontWeight: '700' }}
                suffix={<ExclamationCircleOutlined style={{ fontSize: '1.5rem', opacity: 0.8 }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="animate-scale-in animate-delay-300 hover-lift" style={{ 
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
              color: 'white'
            }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>Completed Tasks</span>}
                value={stats.completed}
                valueStyle={{ color: 'white', fontSize: '2.5rem', fontWeight: '700' }}
                suffix={<CheckCircleOutlined style={{ fontSize: '1.5rem', opacity: 0.8 }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="animate-scale-in animate-delay-200 hover-lift" style={{ 
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
              color: 'white'
            }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>Pending Tasks</span>}
                value={stats.pending}
                valueStyle={{ color: 'white', fontSize: '2.5rem', fontWeight: '700' }}
                suffix={<ClockCircleOutlined style={{ fontSize: '1.5rem', opacity: 0.8 }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Progress and Recent Tasks */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card 
              title={<Title level={4} style={{ margin: 0, color: 'var(--color-text)' }}>Achievement Progress</Title>}
              style={{ 
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Progress
                  type="circle"
                  percent={completionRate}
                  size={140}
                  strokeColor={{
                    '0%': '#3B82F6',
                    '100%': '#10B981',
                  }}
                  trailColor="#f0f0f0"
                  strokeWidth={8}
                  format={(percent) => (
                    <span style={{ 
                      fontSize: '24px', 
                      fontWeight: '700',
                      color: 'var(--color-text)'
                    }}>
                      {percent}%
                    </span>
                  )}
                />
                <Title level={4} style={{ 
                  marginTop: '24px', 
                  marginBottom: '8px',
                  color: 'var(--color-text)',
                  fontWeight: '600'
                }}>
                  Excellence Mastered
                </Title>
                <Paragraph style={{ 
                  color: 'var(--color-text-secondary)',
                  fontSize: '16px',
                  margin: 0
                }}>
                  {stats.completed} of {stats.total} tasks completed
                </Paragraph>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card 
              title={<Title level={4} style={{ margin: 0, color: 'var(--color-text)' }}>Latest Endeavors</Title>}
              style={{ 
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <div>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Paragraph style={{ color: 'var(--color-text-secondary)', fontSize: '16px' }}>
                      Retrieving your latest endeavors...
                    </Paragraph>
                  </div>
                ) : recentTodos.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {recentTodos.map((task) => (
                      <div
                        key={task.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '20px',
                          borderRadius: '12px',
                          background: 'var(--color-background-elevated)',
                          border: '1px solid var(--color-border)',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <Title level={5} style={{ 
                            margin: 0, 
                            marginBottom: '8px',
                            color: 'var(--color-text)',
                            fontWeight: '600'
                          }}>
                            {task.title}
                          </Title>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <span
                              style={{
                                color: getStatusColor(task.status),
                                fontSize: '12px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: `${getStatusColor(task.status)}20`
                              }}
                            >
                              {task.status}
                            </span>
                            <span
                              style={{
                                color: getPriorityColor(task.priority),
                                fontSize: '12px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: `${getPriorityColor(task.priority)}20`
                              }}
                            >
                              {task.priority} priority
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <CheckCircleOutlined style={{ 
                      fontSize: '48px', 
                      color: 'var(--color-text-secondary)', 
                      marginBottom: '16px' 
                    }} />
                    <Title level={4} style={{ 
                      color: 'var(--color-text)', 
                      marginBottom: '8px',
                      fontWeight: '600'
                    }}>
                      Your journey awaits
                    </Title>
                    <Paragraph style={{ 
                      color: 'var(--color-text-secondary)', 
                      marginBottom: '24px',
                      fontSize: '16px'
                    }}>
                      Begin your path to excellence by crafting your first mission!
                    </Paragraph>
                    <Link to="/tasks">
                      <Button 
                        type="primary" 
                        size="large"
                        style={{ 
                          borderRadius: '8px',
                          height: '48px',
                          fontSize: '16px',
                          fontWeight: '600'
                        }}
                      >
                        Launch Your First Mission
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Productivity Tips */}
        <Card 
          title={<Title level={3} style={{ margin: 0, color: 'var(--color-text)', textAlign: 'center' }}>Mastery Principles</Title>}
          style={{ 
            marginTop: '48px',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, var(--color-background) 0%, var(--color-background-elevated) 100%)'
          }}
        >
          <Row gutter={[32, 32]} style={{ marginTop: '24px' }}>
            <Col xs={24} md={8}>
              <div style={{ 
                textAlign: 'center',
                padding: '32px 20px',
                borderRadius: '12px',
                background: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                height: '100%',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <CheckCircleOutlined style={{ fontSize: '28px', color: 'white' }} />
                </div>
                <Title level={4} style={{ 
                  color: 'var(--color-text)', 
                  marginBottom: '12px',
                  fontWeight: '600'
                }}>
                  Divide and Conquer
                </Title>
                <Paragraph style={{ 
                  color: 'var(--color-text-secondary)', 
                  fontSize: '15px',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  Transform overwhelming challenges into strategic milestones that build unstoppable momentum
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ 
                textAlign: 'center',
                padding: '32px 20px',
                borderRadius: '12px',
                background: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                height: '100%',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <ClockCircleOutlined style={{ fontSize: '28px', color: 'white' }} />
                </div>
                <Title level={4} style={{ 
                  color: 'var(--color-text)', 
                  marginBottom: '12px',
                  fontWeight: '600'
                }}>
                  Master Time Dynamics
                </Title>
                <Paragraph style={{ 
                  color: 'var(--color-text-secondary)', 
                  fontSize: '15px',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  Harness strategic deadlines to fuel urgency and accelerate breakthrough achievements
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ 
                textAlign: 'center',
                padding: '32px 20px',
                borderRadius: '12px',
                background: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                height: '100%',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <TrophyOutlined style={{ fontSize: '28px', color: 'white' }} />
                </div>
                <Title level={4} style={{ 
                  color: 'var(--color-text)', 
                  marginBottom: '12px',
                  fontWeight: '600'
                }}>
                  Amplify Victories
                </Title>
                <Paragraph style={{ 
                  color: 'var(--color-text-secondary)', 
                  fontSize: '15px',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  Celebrate every triumph to fuel sustained excellence and cultivate unstoppable confidence
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Analytics Section */}
        {todos.length > 0 && <Analytics todos={todos} />}
      </div>
    </div>
  );
};

export default Dashboard;
