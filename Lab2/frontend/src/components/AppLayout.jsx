import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Dropdown, Badge, Drawer } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, PenTool, MessageSquare, LogOut, Settings, User, Bell, FileText, Menu as MenuIcon } from 'lucide-react';
import { getMe, getUnreadCount } from '../api';

const { Header, Content } = Layout;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const pollRef = useRef(null);

  useEffect(() => {
    getMe().then(r => setUser(r.data)).catch(() => navigate('/login'));
  }, [navigate]);

  // Poll unread count
  useEffect(() => {
    const fetchCount = () => {
      getUnreadCount().then(r => setUnreadCount(r.data.count)).catch(() => {});
    };
    fetchCount();
    pollRef.current = setInterval(fetchCount, 30000);
    return () => clearInterval(pollRef.current);
  }, []);

  // Responsive listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { key: '/', label: '概览', icon: <LayoutDashboard size={18} /> },
    { key: '/entry', label: '记录', icon: <PenTool size={18} /> },
    { key: '/chat', label: 'Intelligence', icon: <MessageSquare size={18} /> },
    { key: '/reminders', label: '提醒', icon: <Bell size={18} /> },
    { key: '/reports', label: '报告', icon: <FileText size={18} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleMenuClick = (key) => {
    navigate(key);
    setDrawerOpen(false);
  };

  const userMenu = {
    items: [
      { key: 'profile', label: '个人中心', icon: <User size={14} /> },
      { key: 'settings', label: '偏好设置', icon: <Settings size={14} /> },
      { type: 'divider' },
      { key: 'logout', label: '退出登录', danger: true, icon: <LogOut size={14} />, onClick: handleLogout },
    ]
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <div className="noise-overlay" />
      <Header className="nav-glass" style={{
        position: 'fixed',
        width: '100%',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 1200 }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--aura-blue)', boxShadow: '0 0 20px rgba(66, 133, 244, 0.4)' }} />
            <span className="gemini-gradient-text outfit" style={{ fontSize: 22, letterSpacing: '-0.03em' }}>Aura</span>
          </motion.div>

          {isMobile ? (
            <motion.div
              whileTap={{ scale: 0.9 }}
              onClick={() => setDrawerOpen(true)}
              style={{ cursor: 'pointer', padding: '8px' }}
            >
              <MenuIcon size={22} color="var(--text-primary)" />
            </motion.div>
          ) : (
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={({ key }) => navigate(key)}
              style={{
                flex: 1,
                justifyContent: 'center',
                border: 'none'
              }}
            />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Notification Bell */}
            <motion.div
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/reminders')}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <Badge count={unreadCount} size="small" offset={[-4, 4]} color="var(--aura-pink)">
                <Bell size={20} color="var(--text-secondary)" />
              </Badge>
            </motion.div>

            {/* User Dropdown */}
            {user && (
              <Dropdown menu={userMenu} placement="bottomRight" arrow={{ pointAtCenter: true }}>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  {!isMobile && (
                    <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name || user.username}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Pro Member</div>
                    </div>
                  )}
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, var(--aura-blue), var(--aura-purple))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    color: '#fff',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </motion.div>
              </Dropdown>
            )}
          </div>
        </div>
      </Header>

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={280}
        styles={{
          header: { background: 'var(--bg-card)', border: 'none' },
          body: { background: 'var(--bg-card)', padding: '24px 16px' },
        }}
        title={<span className="gemini-gradient-text outfit" style={{ fontSize: 18 }}>Aura</span>}
      >
        <Menu
          theme="dark"
          mode="vertical"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
          style={{ background: 'transparent', border: 'none' }}
        />
      </Drawer>

      <Content style={{ margin: '0 auto', padding: '120px 24px 64px', width: '100%', maxWidth: 1200 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Outlet />
        </motion.div>
      </Content>
    </Layout>
  );
}
