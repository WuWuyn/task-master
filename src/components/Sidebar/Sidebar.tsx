import type { FC } from "react";
import { Layout, Menu, Button, Space, Avatar, Dropdown, message } from "antd";
import type { MenuProps } from "antd";
import { 
  HomeOutlined, 
  BarChartOutlined, 
  ProjectOutlined, 
  ScheduleOutlined, 
  InfoCircleOutlined,
  UserOutlined, 
  LogoutOutlined, 
  LoginOutlined, 
  MoonOutlined, 
  SunOutlined,
  CloseOutlined
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { navigationRoutes } from "../../App";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import Logo from "../Logo/Logo";
import "./style.css";

const { Sider } = Layout;

type SidebarProps = {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
};

const iconMap: Record<string, React.ReactNode> = {
  '/': <HomeOutlined />,
  '/dashboard': <BarChartOutlined />,
  '/tasks': <ProjectOutlined />,
  '/timetable': <ScheduleOutlined />,
  '/about': <InfoCircleOutlined />,
};

const Sidebar: FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const { isDark, toggleTheme } = useTheme();
  
  const menuItems = navigationRoutes.map(route => ({
    key: route.key,
    icon: iconMap[route.key] || <HomeOutlined />,
    label: <Link to={route.path}>{route.label}</Link>,
  }));

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
      <Sider
        className="sidebar"
        width={280}
        collapsedWidth={0}
        collapsed={collapsed}
        onCollapse={onCollapse}
        breakpoint="lg"
        collapsible={false}
        trigger={null}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Link to="/">
              <Logo />
            </Link>
          </div>
          <Button
            type="text"
            className="sidebar-close-btn"
            icon={<CloseOutlined />}
            onClick={() => onCollapse(true)}
          />
        </div>

        <div className="sidebar-content">
          <Menu
            mode="vertical"
            items={menuItems}
            className="sidebar-menu"
            selectedKeys={[selectedKey]}
          />
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-actions">
            <Button
              type="text"
              className="theme-toggle-btn"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={toggleTheme}
              icon={isDark ? <SunOutlined /> : <MoonOutlined />}
              block
            >
              {isDark ? 'Light Theme' : 'Dark Theme'}
            </Button>
            
            {isLoggedIn ? (
              <Dropdown 
                menu={{ items: userMenuItems }}
                trigger={['click']}
                placement="topRight"
                overlayClassName="user-dropdown"
                arrow={false}
              >
                <Button 
                  type="text" 
                  className="user-profile-btn"
                  block
                >
                  <Space>
                    <Avatar 
                      size="small" 
                      icon={<UserOutlined />}
                      style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                    />
                    <span>{user?.name}</span>
                  </Space>
                </Button>
              </Dropdown>
            ) : (
              <div className="auth-buttons">
                <Link to="/login">
                  <Button type="text" className="login-btn" icon={<LoginOutlined />} block>
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button type="primary" className="signup-btn" block>
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </Sider>
    </>
  );
};

export default Sidebar;
