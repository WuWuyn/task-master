import type { FC } from 'react';
import { Button, Card, Row, Col } from 'antd';
import { 
  CheckCircleOutlined, 
  RocketOutlined,
  TrophyOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  StarOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import './animations.css';

const Home: FC = () => {
  const { isDark } = useTheme();
  
  const features = [
    {
      title: 'Smart Task Management',
      description: 'Organize, prioritize, and track your tasks with our intelligent interface designed for maximum productivity',
      icon: <CheckCircleOutlined style={{ fontSize: '3rem', color: '#3B82F6' }} />
    },
    {
      title: 'Advanced Analytics',
      description: 'Gain deep insights into your productivity patterns with comprehensive analytics and performance metrics',
      icon: <BarChartOutlined style={{ fontSize: '3rem', color: '#10B981' }} />
    },
    {
      title: 'Priority Intelligence',
      description: 'Focus on what truly matters with our smart priority system that adapts to your workflow',
      icon: <ThunderboltOutlined style={{ fontSize: '3rem', color: '#F59E0B' }} />
    },
    {
      title: 'Achievement Rewards',
      description: 'Stay motivated with our gamified achievement system that celebrates your progress and milestones',
      icon: <TrophyOutlined style={{ fontSize: '3rem', color: '#22C55E' }} />
    }
  ];

  return (
    <div style={{ margin: 0, padding: 0 }}>
      {/* Hero Section */}
      <section className="hero-section" style={{ 
        background: isDark 
          ? 'linear-gradient(135deg, #1a1d23 0%, #2d3748 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '80px 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        margin: 0
      }}>
        <div className="hero-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div className="hero-icon" style={{ marginBottom: '32px' }}>
            <RocketOutlined style={{ fontSize: '5rem', color: isDark ? '#60A5FA' : '#3B82F6' }} />
          </div>
          <h1 className="hero-title" style={{ 
            fontSize: '4rem', 
            fontWeight: 'bold', 
            marginBottom: '24px', 
            color: isDark ? '#F9FAFB' : '#111827',
            lineHeight: '1.2'
          }}>
            Transform Your <span style={{ color: isDark ? '#60A5FA' : '#3B82F6' }}>Productivity</span>, Achieve Excellence
          </h1>
          <p className="hero-subtitle" style={{ 
            fontSize: '1.5rem', 
            color: isDark ? '#D1D5DB' : '#374151', 
            marginBottom: '40px',
            maxWidth: '800px',
            margin: '0 auto 40px auto',
            lineHeight: '1.6'
          }}>
            Experience the next generation of task management with intelligent features, 
            comprehensive analytics, and seamless workflow optimization designed for modern professionals.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/tasks">
              <Button 
                type="primary" 
                size="large"
                icon={<RocketOutlined />}
                className="cta-button-primary"
                style={{ 
                  background: isDark ? '#60A5FA' : '#3B82F6', 
                  borderColor: isDark ? '#60A5FA' : '#3B82F6',
                  color: '#ffffff',
                  padding: '12px 32px',
                  height: 'auto',
                  fontSize: '1.1rem'
                }}
              >
                Launch Your Productivity
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button 
                size="large"
                icon={<BarChartOutlined />}
                className="cta-button-secondary"
                style={{ 
                  color: isDark ? '#60A5FA' : '#3B82F6',
                  borderColor: isDark ? '#60A5FA' : '#3B82F6',
                  padding: '12px 32px',
                  height: 'auto',
                  fontSize: '1.1rem'
                }}
              >
                Explore Analytics
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" style={{ 
        padding: '60px 0', 
        background: isDark ? '#1F2937' : '#F9FAFB', 
        margin: 0,
        minHeight: '600px',
        opacity: 1,
        visibility: 'visible'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div className="features-header" style={{ 
            textAlign: 'center', 
            marginBottom: '60px',
            opacity: 1,
            visibility: 'visible'
          }}>
            <div className="section-icon" style={{ marginBottom: '24px' }}>
              <StarOutlined style={{ fontSize: '3rem', color: isDark ? '#60A5FA' : '#3B82F6' }} />
            </div>
            <h2 className="section-title" style={{ 
              fontSize: '3rem', 
              fontWeight: 'bold', 
              marginBottom: '16px', 
              color: isDark ? '#F9FAFB' : '#111827'
            }}>
              Why Choose TaskMaster Pro?
            </h2>
            <p className="section-subtitle" style={{ fontSize: '1.2rem', color: isDark ? '#D1D5DB' : '#374151', maxWidth: '700px', margin: '0 auto' }}>
              Discover the advanced features and intelligent capabilities that set us apart from traditional task management solutions
            </p>
          </div>

          <Row gutter={[32, 32]} style={{ opacity: 1, visibility: 'visible' }}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  className={`feature-card feature-card-${index + 1}`}
                  style={{ 
                    textAlign: 'center', 
                    height: '100%',
                    border: isDark ? '1px solid #374151' : '1px solid #E5E7EB',
                    borderRadius: '16px',
                    background: isDark ? '#111827' : '#FFFFFF',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    opacity: 1,
                    visibility: 'visible'
                  }}
                  bodyStyle={{ padding: '40px 24px' }}
                  hoverable
                >
                  <div className="feature-icon" style={{ marginBottom: '24px' }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    marginBottom: '16px', 
                    color: isDark ? '#F9FAFB' : '#111827'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: isDark ? '#D1D5DB' : '#374151', lineHeight: '1.6' }}>
                    {feature.description}
                  </p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section" style={{ 
        padding: '60px 0', 
        background: isDark 
          ? 'linear-gradient(135deg, #1F2937 0%, #374151 100%)'
          : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
        margin: 0
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div className="stats-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title" style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              marginBottom: '16px', 
              color: 'var(--color-text)' 
            }}>
              Trusted by Professionals Worldwide
            </h2>
            <p className="section-subtitle" style={{ fontSize: '1.2rem', color: 'var(--color-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Join millions who have transformed their productivity with TaskMaster Pro
            </p>
          </div>

          <Row gutter={[32, 32]}>
            <Col xs={24} sm={12} lg={6}>
              <div className="stat-item" style={{ 
                textAlign: 'center',
                padding: '32px 20px',
                borderRadius: '16px',
                background: 'var(--color-background-elevated)',
                border: '1px solid var(--color-border)',
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ 
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '24px'
                }}>
                  <CheckCircleOutlined style={{ color: 'white' }} />
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-text)', marginBottom: '8px' }}>
                  25M+
                </div>
                <div style={{ fontSize: '1.1rem', color: 'var(--color-text)', fontWeight: '600', marginBottom: '4px' }}>
                  Achievements Unlocked
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                  Milestones conquered by our global community
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <div className="stat-item" style={{ 
                textAlign: 'center',
                padding: '32px 20px',
                borderRadius: '16px',
                background: 'var(--color-background-elevated)',
                border: '1px solid var(--color-border)',
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ 
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '24px'
                }}>
                  👤
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-text)', marginBottom: '8px' }}>
                  2M+
                </div>
                <div style={{ fontSize: '1.1rem', color: 'var(--color-text)', fontWeight: '600', marginBottom: '4px' }}>
                  Productivity Champions
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                  Visionaries who elevate their potential daily
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <div className="stat-item" style={{ 
                textAlign: 'center',
                padding: '32px 20px',
                borderRadius: '16px',
                background: 'var(--color-background-elevated)',
                border: '1px solid var(--color-border)',
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ 
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '24px'
                }}>
                  🌍
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-text)', marginBottom: '8px' }}>
                  180+
                </div>
                <div style={{ fontSize: '1.1rem', color: 'var(--color-text)', fontWeight: '600', marginBottom: '4px' }}>
                  Global Presence
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                  Nations embracing excellence with TaskMaster Pro
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <div className="stat-item" style={{ 
                textAlign: 'center',
                padding: '32px 20px',
                borderRadius: '16px',
                background: 'var(--color-background-elevated)',
                border: '1px solid var(--color-border)',
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ 
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '24px'
                }}>
                  🛡️
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-text)', marginBottom: '8px' }}>
                  99.9%
                </div>
                <div style={{ fontSize: '1.1rem', color: 'var(--color-text)', fontWeight: '600', marginBottom: '4px' }}>
                  Reliability Score
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                  Unwavering performance you can depend on
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section" style={{ padding: '60px 0', background: isDark ? '#1F2937' : '#F9FAFB', margin: 0 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div className="testimonials-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title" style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              marginBottom: '16px', 
              color: isDark ? '#F9FAFB' : '#111827'
            }}>
              What Our Users Say
            </h2>
            <p className="section-subtitle" style={{ fontSize: '1.2rem', color: isDark ? '#D1D5DB' : '#374151', maxWidth: '600px', margin: '0 auto' }}>
              Real stories from professionals who transformed their productivity
            </p>
          </div>

          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card
                className="testimonial-card"
                style={{ 
                  height: '100%',
                  borderRadius: '16px',
                  border: isDark ? '1px solid #374151' : '1px solid #E5E7EB',
                  background: isDark ? '#111827' : '#FFFFFF',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
                bodyStyle={{ padding: '32px' }}
              >
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '2rem', color: '#3B82F6', marginBottom: '16px' }}>⭐⭐⭐⭐⭐</div>
                  <p style={{ 
                    fontSize: '1rem', 
                    color: isDark ? '#F9FAFB' : '#111827', 
                    lineHeight: '1.6',
                    fontStyle: 'italic',
                    marginBottom: '24px'
                  }}>
                    "TaskMaster Pro completely revolutionized how I manage my projects. The analytics dashboard gives me insights I never had before."
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    background: '#3B82F6', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    marginRight: '16px'
                  }}>
                    S
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: isDark ? '#F9FAFB' : '#111827' }}>Sarah Chen</div>
                    <div style={{ fontSize: '0.9rem', color: isDark ? '#D1D5DB' : '#374151' }}>Product Manager</div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                className="testimonial-card"
                style={{ 
                  height: '100%',
                  borderRadius: '16px',
                  border: isDark ? '1px solid #374151' : '1px solid #E5E7EB',
                  background: isDark ? '#111827' : '#FFFFFF',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
                bodyStyle={{ padding: '32px' }}
              >
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '2rem', color: '#3B82F6', marginBottom: '16px' }}>⭐⭐⭐⭐⭐</div>
                  <p style={{ 
                    fontSize: '1rem', 
                    color: isDark ? '#F9FAFB' : '#111827', 
                    lineHeight: '1.6',
                    fontStyle: 'italic',
                    marginBottom: '24px'
                  }}>
                    "The priority intelligence feature is a game-changer. I'm now 40% more productive and never miss important deadlines."
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    background: '#10B981', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    marginRight: '16px'
                  }}>
                    M
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: isDark ? '#F9FAFB' : '#111827' }}>Marcus Johnson</div>
                    <div style={{ fontSize: '0.9rem', color: isDark ? '#D1D5DB' : '#374151' }}>Software Engineer</div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                className="testimonial-card"
                style={{ 
                  height: '100%',
                  borderRadius: '16px',
                  border: isDark ? '1px solid #374151' : '1px solid #E5E7EB',
                  background: isDark ? '#111827' : '#FFFFFF',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
                bodyStyle={{ padding: '32px' }}
              >
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '2rem', color: '#3B82F6', marginBottom: '16px' }}>⭐⭐⭐⭐⭐</div>
                  <p style={{ 
                    fontSize: '1rem', 
                    color: isDark ? '#F9FAFB' : '#111827', 
                    lineHeight: '1.6',
                    fontStyle: 'italic',
                    marginBottom: '24px'
                  }}>
                    "As a team lead, TaskMaster Pro helps me track everyone's progress effortlessly. The interface is intuitive and powerful."
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    background: '#22C55E', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    marginRight: '16px'
                  }}>
                    A
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: isDark ? '#F9FAFB' : '#111827' }}>Anna Rodriguez</div>
                    <div style={{ fontSize: '0.9rem', color: isDark ? '#D1D5DB' : '#374151' }}>Team Lead</div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" style={{ 
        background: isDark 
          ? 'linear-gradient(135deg, #111827 0%, #1F2937 50%, #374151 100%)'
          : 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 50%, #1D4ED8 100%)',
        color: 'white',
        padding: '60px 0',
        textAlign: 'center',
        position: 'relative',
        margin: 0,
        minHeight: '400px',
        opacity: 1,
        visibility: 'visible'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 24px',
          opacity: 1,
          visibility: 'visible'
        }}>
          <div className="cta-icon" style={{ 
            marginBottom: '32px',
            opacity: 1,
            visibility: 'visible'
          }}>
            <ThunderboltOutlined style={{ fontSize: '4rem', color: 'white' }} />
          </div>
          <h2 className="cta-title" style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            marginBottom: '24px', 
            color: 'white',
            opacity: 1,
            visibility: 'visible'
          }}>
            Ready to Transform Your Workflow?
          </h2>
          <p className="cta-subtitle" style={{ 
            fontSize: '1.2rem', 
            color: 'rgba(255, 255, 255, 0.9)', 
            marginBottom: '40px',
            maxWidth: '700px',
            margin: '0 auto 40px auto',
            opacity: 1,
            visibility: 'visible'
          }}>
            Join thousands of professionals who have revolutionized their productivity with TaskMaster Pro. 
            Start your journey to peak performance today.
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            opacity: 1,
            visibility: 'visible'
          }}>
            <Link to="/tasks">
              <Button 
                type="primary" 
                size="large"
                icon={<RocketOutlined />}
                className="cta-final-button"
                style={{ 
                  background: 'white', 
                  borderColor: 'white',
                  color: '#3B82F6',
                  padding: '12px 32px',
                  height: 'auto',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  opacity: 1,
                  visibility: 'visible'
                }}
              >
                Start Your Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
