import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DataEntry from './pages/DataEntry';
import AIChat from './pages/AIChat';
import Reminders from './pages/Reminders';
import Reports from './pages/Reports';
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
          colorPrimary: '#007aff',
          colorBgBase: '#050505',
          colorBgContainer: '#0e0e11',
          colorTextBase: '#ededed',
          fontFamily: "'Space Grotesk', 'Outfit', sans-serif",
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
          <Route path="reminders" element={<Reminders />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </ConfigProvider>
  );
}
