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
        algorithm: theme.darkAlgorithm, // 启用 Ant Design 官方暗黑模式算法
        token: {
          colorPrimary: '#9b72cb', // 偏向Gemini的紫色
          colorBgBase: '#131314', // Gemini 黑
          colorBgContainer: '#1e1f22',
          colorTextBase: '#e3e3e3',
          fontFamily: "'Inter', 'Noto Sans SC', sans-serif",
          borderRadius: 12,
        },
        components: {
          Card: {
            paddingLG: 32,
            borderRadiusLG: 24,
          },
          Button: {
            controlHeight: 44,
            paddingInline: 24,
          },
          Input: {
            controlHeight: 44,
          },
          InputNumber: {
            controlHeight: 44,
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
