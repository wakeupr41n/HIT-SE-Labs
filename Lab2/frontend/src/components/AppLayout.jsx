import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Dropdown } from 'antd';
import { useEffect, useState } from 'react';
import { getMe } from '../api';

const { Header, Content } = Layout;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    getMe().then(r => setUser(r.data)).catch(() => navigate('/login'));
  }, [navigate]);

  const menuItems = [
    { key: '/', label: '概览' },
    { key: '/entry', label: '记录' },
    { key: '/chat', label: 'Intelligence' }, // Gemini Intelligence
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const userMenu = {
    items: [
      { key: 'profile', label: '账号设置' },
      { type: 'divider' },
      { key: 'logout', label: '退出登录', danger: true, onClick: handleLogout },
    ]
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#131314', position: 'relative' }}>
      
      {/* 模糊顶栏 */}
      <Header className="apple-glass" style={{ 
        padding: '0 24px', 
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 1000 }}>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: 18 }}>
            <span className="gemini-text-glow">Aura</span>
          </div>
          
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ 
              background: 'transparent', 
              borderBottom: 'none',
              fontSize: 14,
              fontWeight: 500,
              width: 320,
              justifyContent: 'center',
              lineHeight: '60px'
            }}
          />

          {user && (
            <Dropdown menu={userMenu} placement="bottomRight">
              <div style={{ cursor: 'pointer', fontSize: 14, color: '#e3e3e3', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #4285f4, #9b72cb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff', fontWeight: 600 }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>
            </Dropdown>
          )}
        </div>
      </Header>
      
      <Content style={{ margin: '0 auto', padding: '64px 24px', width: '100%', maxWidth: 1040, zIndex: 1 }}>
        <div className="fade-in">
          <Outlet />
        </div>
      </Content>
      
    </Layout>
  );
}
