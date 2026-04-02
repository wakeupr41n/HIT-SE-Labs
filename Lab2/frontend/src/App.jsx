import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DataEntry from './pages/DataEntry';
import AIChat from './pages/AIChat';
import AppLayout from './components/AppLayout';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#4285f4', // Aura Blue
          colorBgBase: '#0c0c0d', // Deep Obsidian
          colorBgContainer: '#161618', 
          colorTextBase: '#f2f2f2',
          fontFamily: "'Inter', 'Outfit', 'Noto Sans SC', sans-serif",
          borderRadius: 16,
        },
        components: {
          Card: {
            paddingLG: 24,
            borderRadiusLG: 28,
          },
          Button: {
            controlHeight: 44,
            borderRadius: 100,
            fontWeight: 600,
          },
          Input: {
            controlHeight: 44,
            borderRadius: 12,
            colorBgContainer: '#1c1c1f',
          }
        }
      }}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="entry" element={<DataEntry />} />
          <Route path="chat" element={<AIChat />} />
        </Route>
      </Routes>
    </ConfigProvider>
  );
}
