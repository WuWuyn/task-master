import type { FC } from "react";
import { Layout, Menu, Button, Space, Avatar, Dropdown, message } from "antd";
import type { MenuProps } from "antd";
import { MenuOutlined, UserOutlined, LogoutOutlined, LoginOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { navigationRoutes } from "../../App";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import naverLogonaverLogo from "../../assets/naver-logo.svg";
import "./style.css";

const { Header } = Layout;

type HeaderComponentProps = object;

const HeaderComponent: FC<HeaderComponentProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const { isDark, toggleTheme } = useTheme();
  
  const menuItems = navigationRoutes.map(route => ({
    key: route.key,
    label: <Link to={route.path}>{route.label}</Link>,
  }));

  // Get current selected key based on pathname
  const selectedKey = location.pathname;

  const handleLogout = async () => {
    try {
      await logout();
      messageApi.success('Logged out successfully');
      navigate('/');
    } catch (error: any) {
      messageApi.error(error.message || 'Logout failed');
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontWeight: 'bold', color: 'var(--color-text)' }}>{user?.name}</div>
          <div style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>@{user?.username}</div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: (
        <span style={{ color: 'var(--color-text)' }}>
          <LogoutOutlined style={{ marginRight: '8px' }} />
          Logout
        </span>
      ),
      onClick: handleLogout,
    },
  ];

  return (
    <>
      {contextHolder}
      <Header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link to="/">
            <img 
              src={naverLogonaverLogo}
              alt="RegToDos" 
              className="logo-image"
            />
          </Link>
        </div>

        <div className="header-nav desktop-nav">
          <Menu
            mode="horizontal"
            items={menuItems}
            className="header-menu"
            selectedKeys={[selectedKey]}
          />
        </div>

        <div className="header-actions desktop-nav">
          <Space>
            <Button
              type="text"
              className="theme-toggle-btn"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={toggleTheme}
              icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            />
            {isLoggedIn ? (
              <Dropdown 
                menu={{ items: userMenuItems }}
                trigger={['click']}
                placement="bottomRight"
                overlayClassName="user-dropdown"
                arrow={false}
                destroyPopupOnHide={false}
              >
                <Button 
                  type="text" 
                  className="user-profile-btn"
                  style={{ cursor: 'pointer' }}
                >
                  <Space>
                    <Avatar 
                      size="small" 
                      icon={<UserOutlined />}
                      style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
                    />
                    <span>{user?.name}</span>
                  </Space>
                </Button>
              </Dropdown>
            ) : (
              <>
                <Link to="/login">
                  <Button type="text" className="login-btn" icon={<LoginOutlined />}>
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button type="primary" className="signup-btn">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </Space>
        </div>

        <div className="mobile-menu-btn">
          <Button 
            type="text" 
            icon={<MenuOutlined />}
            className="mobile-menu-trigger"
          />
        </div>
      </div>
    </Header>
    </>
  );
};

export default HeaderComponent;