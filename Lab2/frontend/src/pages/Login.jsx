import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, message, Space } from 'antd';
import { login, register } from '../api';

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const res = await login(values);
      localStorage.setItem('token', res.data.access_token);
      message.success('登录成功，欢迎使用');
      navigate('/');
    } catch (err) {
      message.error(err.response?.data?.detail || '认证失败');
    }
    setLoading(false);
  };

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      await register(values);
      message.success('创建成功，请登录您的账户');
      setIsLogin(true);
    } catch (err) {
      message.error(err.response?.data?.detail || '注册失败');
    }
    setLoading(false);
  };

  return (
    <div className="fade-in" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#131314', // Gemini Dark
      padding: 24,
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* 氛围发光背景 */}
      <div className="ambient-glow"></div>

      {/* 极简深色卡片 */}
      <div className="apple-card" style={{ 
        width: '100%', 
        maxWidth: 440, 
        padding: '56px 48px', 
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
        background: '#1e1f22',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        
        <div style={{ marginBottom: 40 }}>
          <Title level={2} style={{ marginBottom: 8, color: '#e3e3e3' }}>
            <span className="gemini-text-glow">Aura Health</span>
          </Title>
          <Text style={{ color: '#c4c7c5', fontSize: 15 }}>
            {isLogin ? '您的智能健康管家' : '开启专属健康追踪'}
          </Text>
        </div>
        
        {isLogin ? (
          <Form onFinish={handleLogin} layout="vertical" size="large">
            <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input placeholder="用户名" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password placeholder="密码" />
            </Form.Item>
            <Form.Item style={{ marginTop: 32 }}>
              <Button htmlType="submit" loading={loading} block className="auth-btn" style={{ height: 48, fontSize: 16 }}>
                登录
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Form onFinish={handleRegister} layout="vertical" size="large">
            <Space style={{ display: 'flex', width: '100%' }} align="baseline">
              <Form.Item name="username" rules={[{ required: true, message: '必填' }]} style={{ flex: 1 }}>
                <Input placeholder="用户名" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, min: 6, message: '最少6位' }]} style={{ flex: 1 }}>
                <Input.Password placeholder="密码" />
              </Form.Item>
            </Space>
            <Form.Item name="name"><Input placeholder="姓名 (选填)" /></Form.Item>
            <Space style={{ display: 'flex', width: '100%' }} align="baseline">
               <Form.Item name="age" style={{ flex: 1 }}><Input type="number" placeholder="年龄" /></Form.Item>
               <Form.Item name="occupation" style={{ flex: 1 }}><Input placeholder="职业" /></Form.Item>
            </Space>
            <Form.Item style={{ marginTop: 24 }}>
              <Button htmlType="submit" loading={loading} block className="auth-btn" style={{ height: 48, fontSize: 16 }}>
                创建账户
              </Button>
            </Form.Item>
          </Form>
        )}

        <div style={{ marginTop: 32 }}>
          <Button type="link" onClick={() => setIsLogin(!isLogin)} style={{ color: '#9b72cb', fontSize: 14, fontWeight: 500 }}>
            {isLogin ? '没有账户？创建账户' : '已有账户？返回登录'}
          </Button>
        </div>

      </div>
      
    </div>
  );
}
