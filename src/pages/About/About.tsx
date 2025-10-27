import type { FC } from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { 
  TrophyOutlined, 
  RocketOutlined,
  BulbOutlined,
  UserOutlined,
  HeartOutlined,
  GlobalOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Paragraph, Text } = Typography;

const About: FC = () => {
  const { isDark } = useTheme();

  const stats = [
    { 
      title: 'Achievements Unlocked', 
      value: '25M+', 
      description: 'Milestones conquered by our global community',
      icon: <CheckCircleOutlined style={{ fontSize: '2rem', color: 'var(--success)' }} />,
      color: 'var(--success)'
    },
    { 
      title: 'Productivity Champions', 
      value: '2M+', 
      description: 'Visionaries who elevate their potential daily',
      icon: <UserOutlined style={{ fontSize: '2rem', color: 'var(--primary)' }} />,
      color: 'var(--primary)'
    },
    { 
      title: 'Global Presence', 
      value: '180+', 
      description: 'Nations embracing excellence with TaskMaster Pro',
      icon: <GlobalOutlined style={{ fontSize: '2rem', color: 'var(--secondary)' }} />,
      color: 'var(--secondary)'
    },
    { 
      title: 'Reliability Score', 
      value: '99.9%', 
      description: 'Unwavering performance you can depend on',
      icon: <SafetyOutlined style={{ fontSize: '2rem', color: 'var(--warning)' }} />,
      color: 'var(--warning)'
    }
  ];

  const team = [
    {
      name: 'Alexander Sterling',
      role: 'Visionary & Chief Executive',
      bio: 'Orchestrating innovation to unlock human potential and transform ambitious dreams into reality.',
      avatar: '👨‍💼'
    },
    {
      name: 'Sophia Nakamura',
      role: 'Creative Architect',
      bio: 'Crafting extraordinary experiences that seamlessly blend aesthetics with intuitive functionality.',
      avatar: '👩‍🎨'
    },
    {
      name: 'Marcus Thompson',
      role: 'Technical Maestro',
      bio: 'Engineering resilient, cutting-edge solutions that empower millions to achieve excellence.',
      avatar: '👨‍💻'
    },
    {
      name: 'Isabella Rodriguez',
      role: 'Product Strategist',
      bio: 'Ensuring every innovation delivers transformative value and elevates user experiences.',
      avatar: '👩‍💼'
    }
  ];

  const values = [
    {
      title: 'Elegant Simplicity',
      description: 'We craft sophisticated tools that amplify your capabilities while staying beautifully invisible.',
      icon: <BulbOutlined style={{ fontSize: '2.5rem', color: 'var(--primary)' }} />,
      color: 'var(--primary)'
    },
    {
      title: 'Human-Centered Excellence',
      description: 'Every innovation begins with deep empathy for the ambitious individuals we serve.',
      icon: <HeartOutlined style={{ fontSize: '2.5rem', color: 'var(--error)' }} />,
      color: 'var(--error)'
    },
    {
      title: 'Uncompromising Trust',
      description: 'Your aspirations and data are safeguarded with enterprise-grade security and unwavering commitment.',
      icon: <SafetyOutlined style={{ fontSize: '2.5rem', color: 'var(--success)' }} />,
      color: 'var(--success)'
    },
    {
      title: 'Relentless Evolution',
      description: 'We continuously push boundaries to unlock new dimensions of productivity and achievement.',
      icon: <ThunderboltOutlined style={{ fontSize: '2.5rem', color: 'var(--warning)' }} />,
      color: 'var(--warning)'
    }
  ];

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section className="animate-fade-in-up" style={{ 
        background: isDark 
          ? 'linear-gradient(135deg, #111827 0%, #1F2937 50%, #374151 100%)'
          : 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 50%, #F3F4F6 100%)',
        padding: '120px 0 100px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <Title 
              level={1} 
              className="animate-bounce-in animate-delay-200"
              style={{ 
                fontSize: '3.5rem', 
                fontWeight: 700, 
                marginBottom: '24px', 
                color: 'var(--color-text)',
                lineHeight: '1.1',
                letterSpacing: '-0.02em'
              }}
            >
              Pioneering the future of 
              <Text className="animate-pulse" style={{ color: 'var(--primary)' }}> human productivity</Text>
            </Title>
            
            <Paragraph className="animate-fade-in-up animate-delay-400" style={{ 
              fontSize: '1.25rem', 
              color: 'var(--color-muted)', 
              marginBottom: '48px',
              lineHeight: '1.6',
              fontWeight: 400
            }}>
              TaskMaster Pro emerged from a profound vision: to unlock human potential through intelligent organization. 
              We are the architects of tomorrow's productivity revolution.
            </Paragraph>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="animate-fade-in-up" style={{ padding: '100px 0', background: 'var(--color-bg)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
          <Row gutter={[40, 40]}>
            {stats.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  className={`animate-scale-in animate-delay-${(index + 1) * 100} hover-lift`}
                  style={{ 
                    textAlign: 'center',
                    borderRadius: '16px',
                    border: `1px solid var(--border-color)`,
                    background: 'var(--color-surface)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    height: '280px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  bodyStyle={{ 
                    padding: '32px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    height: '100%'
                  }}
                >  
                  <div style={{ 
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}CC 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '24px'
                  }}>
                    {stat.icon}
                  </div>
                  <Title level={2} style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 700, 
                    marginBottom: '8px', 
                    color: 'var(--color-text)',
                    margin: '0 0 8px 0'
                  }}>
                    {stat.value}
                  </Title>
                  <Title level={4} style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 600, 
                    marginBottom: '8px', 
                    color: 'var(--color-text)',
                    margin: '0 0 8px 0'
                  }}>
                    {stat.title}
                  </Title>
                  <Paragraph style={{ 
                    color: 'var(--color-muted)', 
                    margin: 0,
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}>
                    {stat.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Mission & Vision */}
      <section style={{ 
        padding: '100px 0',
        background: isDark ? 'var(--color-surface)' : '#F9FAFB'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
          <Row gutter={[40, 40]} align="stretch">
            <Col xs={24} md={12}>
              <Card style={{ 
                height: '100%', 
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                background: 'var(--color-bg)'
              }} bodyStyle={{ padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <RocketOutlined style={{ fontSize: '3rem', color: 'var(--primary)' }} />
                </div>
                <Title level={3} style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 600, 
                  marginBottom: '16px', 
                  color: 'var(--color-text)', 
                  textAlign: 'center' 
                }}>
                  Our Mission
                </Title>
                <Paragraph style={{ 
                  color: 'var(--color-muted)', 
                  lineHeight: '1.6', 
                  textAlign: 'center',
                  fontSize: '1rem'
                }}>
                  To simplify task management and empower users to achieve more by providing an intuitive, 
                  feature-rich platform that turns chaos into clarity and goals into accomplishments.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card style={{ 
                height: '100%', 
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                background: 'var(--color-bg)'
              }} bodyStyle={{ padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <TrophyOutlined style={{ fontSize: '3rem', color: 'var(--warning)' }} />
                </div>
                <Title level={3} style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 600, 
                  marginBottom: '16px', 
                  color: 'var(--color-text)', 
                  textAlign: 'center' 
                }}>
                  Our Vision
                </Title>
                <Paragraph style={{ 
                  color: 'var(--color-muted)', 
                  lineHeight: '1.6', 
                  textAlign: 'center',
                  fontSize: '1rem'
                }}>
                  To become the go-to productivity solution that helps millions of users worldwide 
                  transform their daily tasks into meaningful achievements and long-term success.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Team Section */}
      <section style={{ padding: '100px 0', background: 'var(--color-bg)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <Title level={2} style={{ 
              fontSize: '2.5rem', 
              fontWeight: 700, 
              marginBottom: '16px', 
              color: 'var(--color-text)',
              letterSpacing: '-0.01em'
            }}>
              Meet our team
            </Title>
            <Paragraph style={{ 
              fontSize: '1.1rem', 
              color: 'var(--color-muted)', 
              maxWidth: '600px', 
              margin: '0 auto'
            }}>
              The passionate people behind TaskMaster Pro, working every day to make productivity accessible to everyone.
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {team.map((member, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card style={{ 
                  textAlign: 'center', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  background: 'var(--color-surface)',
                  height: '100%'
                }} bodyStyle={{ padding: '32px 24px' }}>
                  <div style={{ 
                    fontSize: '4rem', 
                    marginBottom: '24px',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    {member.avatar}
                  </div>
                  <Title level={4} style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 600, 
                    marginBottom: '8px', 
                    color: 'var(--color-text)'
                  }}>
                    {member.name}
                  </Title>
                  <Text style={{ 
                    color: 'var(--primary)', 
                    fontWeight: 500,
                    display: 'block',
                    marginBottom: '16px'
                  }}>
                    {member.role}
                  </Text>
                  <Paragraph style={{ 
                    color: 'var(--color-muted)', 
                    lineHeight: '1.6',
                    margin: 0,
                    fontSize: '0.9rem'
                  }}>
                    {member.bio}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Values */}
      <section style={{ 
        padding: '100px 0',
        background: isDark ? 'var(--color-surface)' : '#F9FAFB'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <Title level={2} style={{ 
              fontSize: '2.5rem', 
              fontWeight: 700, 
              marginBottom: '16px', 
              color: 'var(--color-text)',
              letterSpacing: '-0.01em'
            }}>
              Our values
            </Title>
            <Paragraph style={{ 
              fontSize: '1.1rem', 
              color: 'var(--color-muted)', 
              maxWidth: '600px', 
              margin: '0 auto'
            }}>
              The principles that guide everything we do at TaskMaster Pro.
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {values.map((value, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card style={{ 
                  textAlign: 'center', 
                  height: '100%', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  background: 'var(--color-bg)'
                }} bodyStyle={{ padding: '32px 24px' }}>
                  <div style={{ marginBottom: '24px' }}>
                    {value.icon}
                  </div>
                  <Title level={4} style={{ 
                    color: 'var(--color-text)', 
                    marginBottom: '12px',
                    fontSize: '1.25rem',
                    fontWeight: 600
                  }}>
                    {value.title}
                  </Title>
                  <Paragraph style={{ 
                    color: 'var(--color-muted)',
                    lineHeight: '1.6',
                    margin: 0,
                    fontSize: '1rem'
                  }}>
                    {value.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>
    </div>
  );
};

export default About;
