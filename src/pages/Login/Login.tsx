import type { FC } from 'react';
import { useState } from 'react';
import { Card, Form, Input, Button, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const Login: FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const userData = await loginUser(values);
      
      login(userData);
      messageApi.success(`Welcome back, ${userData.name}! 🎉`);
      navigate('/dashboard');
    } catch (error: any) {
      messageApi.error(error.message || 'Login failed');
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
          maxWidth: '400px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <LoginOutlined style={{ fontSize: '3rem', color: 'var(--color-text)', marginBottom: '16px' }} />
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: 'var(--color-text)', 
            margin: 0,
            marginBottom: '8px'
          }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '1.1rem' }}>
            Sign in to continue to your tasks
          </p>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            label={<span style={{ color: 'var(--color-text)', fontWeight: '500' }}>Username</span>}
            rules={[
              { required: true, message: 'Please input your username!' },
              { min: 3, message: 'Username must be at least 3 characters!' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: 'var(--color-muted)' }} />}
              placeholder="Enter your username"
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
              placeholder="Enter your password"
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
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>


        <Divider style={{ color: 'var(--color-muted)' }}>New to our platform?</Divider>

        <div style={{ textAlign: 'center' }}>
          <Link to="/register">
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
              Create Account
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

export default Login;
