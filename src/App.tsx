import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import { Suspense, lazy, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import SimpleHeader from './components/Header/SimpleHeader';
import Sidebar from './components/Sidebar/Sidebar';
import Footer from './components/Footer/Footer';
import './App.css';

const { Content } = Layout;

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Tasks = lazy(() => import('./pages/Tasks/Tasks'));
const TimeTable = lazy(() => import('./pages/TimeTable/TimeTable'));
const About = lazy(() => import('./pages/About/About'));
const Login = lazy(() => import('./pages/Login/Login'));
const Register = lazy(() => import('./pages/Register/Register'));

// Navigation routes for Header component
export const navigationRoutes = [
  {
    key: '/',
    path: '/',
    label: 'Home',
  },
  {
    key: '/dashboard',
    path: '/dashboard',
    label: 'Analytics Dashboard',
  },
  {
    key: '/tasks',
    path: '/tasks',
    label: 'Task Management',
  },
  {
    key: '/timetable',
    path: '/timetable',
    label: 'Schedule Planner',
  },
  {
    key: '/about',
    path: '/about',
    label: 'About TaskMaster',
  },
];

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const handleMenuToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <LoadingProvider>
          <NotificationProvider>
            <Router>
              <Layout className="layout">
                <SimpleHeader onMenuClick={handleMenuToggle} />
                <Layout>
                  <Content 
                    className="main-content"
                    style={{ 
                      minHeight: 'calc(100vh - 128px)',
                      marginRight: sidebarCollapsed ? 0 : 280,
                      transition: 'margin-right 0.3s ease'
                    }}
                  >
                    <Suspense fallback={
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        minHeight: '400px' 
                      }}>
                        <Spin size="large" />
                      </div>
                    }>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/timetable" element={<TimeTable />} />
                        <Route path="/about" element={<About />} />
                        {/* Catch-all route for 404 */}
                        <Route path="*" element={<Home />} />
                      </Routes>
                    </Suspense>
                  </Content>
                  <Sidebar 
                    collapsed={sidebarCollapsed} 
                    onCollapse={handleSidebarCollapse}
                  />
                </Layout>
                <Footer />
              </Layout>
              {!sidebarCollapsed && (
                <div 
                  className="sidebar-overlay visible"
                  onClick={() => setSidebarCollapsed(true)}
                />
              )}
            </Router>
          </NotificationProvider>
        </LoadingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;