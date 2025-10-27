import type { FC } from 'react';
import { useState } from 'react';
import { Card, Form, Input, Button, message, Divider } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  UserAddOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const Register: FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async (values: {
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = values;
      const userData = await registerUser(registerData);
      login(userData);
      messageApi.success(`Welcome to our platform, ${userData.name}! 🎉`);
      navigate('/dashboard');
    } catch (error: any) {
      messageApi.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%',
          maxWidth: '450px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <UserAddOutlined style={{ fontSize: '3rem', color: 'var(--color-text)', marginBottom: '16px' }} />
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: 'var(--color-text)', 
            margin: 0,
            marginBottom: '8px'
          }}>
            Join Us Today
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '1.1rem' }}>
            Create your account to start managing tasks
          </p>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="name"
            label={<span style={{ color: 'var(--color-text)', fontWeight: '500' }}>Full Name</span>}
            rules={[
              { required: true, message: 'Please input your full name!' },
              { min: 2, message: 'Name must be at least 2 characters!' }
            ]}
          >
            <Input
              prefix={<TeamOutlined style={{ color: 'var(--color-muted)' }} />}
              placeholder="Enter your full name"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="username"
            label={<span style={{ color: 'var(--color-text)', fontWeight: '500' }}>Username</span>}
            rules={[
              { required: true, message: 'Please input your username!' },
              { min: 3, message: 'Username must be at least 3 characters!' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores!' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: 'var(--color-muted)' }} />}
              placeholder="Choose a username"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span style={{ color: 'var(--color-text)', fontWeight: '500' }}>Email Address</span>}
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address!' }
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: 'var(--color-muted)' }} />}
              placeholder="Enter your email address"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ color: 'var(--color-text)', fontWeight: '500' }}>Password</span>}
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--color-muted)' }} />}
              placeholder="Create a password"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={<span style={{ color: 'var(--color-text)', fontWeight: '500' }}>Confirm Password</span>}
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--color-muted)' }} />}
              placeholder="Confirm your password"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '16px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: '100%',
                height: '48px',
                background: 'var(--accent)',
                borderColor: 'var(--accent)',
                color: 'var(--accent-contrast)',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '500'
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ color: 'var(--color-muted)' }}>Already have an account?</Divider>

        <div style={{ textAlign: 'center' }}>
          <Link to="/login">
            <Button
              size="large"
              style={{
                width: '100%',
                height: '48px',
                borderColor: 'var(--accent)',
                color: 'var(--accent)',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '500'
              }}
            >
              Sign In
            </Button>
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link 
            to="/" 
            style={{ 
              color: 'var(--color-muted)', 
              textDecoration: 'none',
              fontSize: '0.95rem'
            }}
          >
            ← Back to Home
          </Link>
        </div>
      </Card>
    </div>
    </>
  );
};

export default Register;
