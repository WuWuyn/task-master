import { FC } from 'react';
import { Badge, Dropdown, List, Button, Empty } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { useNotifications } from '../../contexts/NotificationContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const NotificationIcon: FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: 'warning' | 'info' | 'success') => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '🔔';
    }
  };

  const menu = (
    <div style={{
      width: '350px',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h4 style={{ margin: 0, color: 'var(--color-text)', fontSize: '16px' }}>Notifications</h4>
        {notifications.length > 0 && (
          <Button type="link" size="small" onClick={markAllAsRead} style={{ color: 'var(--accent)' }}>
            Mark all as read
          </Button>
        )}
      </div>
      <List
        dataSource={notifications}
        style={{ maxHeight: '400px', overflowY: 'auto' }}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: item.read ? 'transparent' : 'rgba(var(--accent-rgb), 0.05)',
              transition: 'background-color 0.3s'
            }}
          >
            <List.Item.Meta
              avatar={<span style={{ fontSize: '20px' }}>{getIcon(item.type)}</span>}
              title={
                <span style={{ color: item.read ? 'var(--color-muted)' : 'var(--color-text)', fontWeight: item.read ? 400 : 600 }}>
                  {item.message}
                </span>
              }
              description={
                <span style={{ color: 'var(--color-muted)', fontSize: '12px' }}>
                  {dayjs(item.createdAt).fromNow()}
                </span>
              }
            />
            {!item.read && (
              <Button
                type="text"
                shape="circle"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => markAsRead(item.id)}
                title="Mark as read"
                style={{ color: 'var(--color-muted)' }}
              />
            )}
          </List.Item>
        )}
        locale={{
          emptyText: <Empty description="No new notifications" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: '20px 0' }} />
        }}
      />
    </div>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
      <Badge count={unreadCount} size="small">
        <BellOutlined style={{ fontSize: '20px', color: 'var(--color-text)', cursor: 'pointer' }} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationIcon;
