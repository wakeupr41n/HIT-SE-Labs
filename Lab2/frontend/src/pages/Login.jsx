import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, message, Space } from 'antd';
import { motion } from 'framer-motion';
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
      message.success('登录成功');
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
      message.success('注册成功，请登录');
      setIsLogin(true);
    } catch (err) {
      message.error(err.response?.data?.detail || '注册失败');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--bg-main)'
    }}>
      <div className="ambient-glow-v3" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="bento-card" 
        style={{ 
          width: '100%', 
          maxWidth: 480, 
          padding: '64px 48px',
          textAlign: 'center'
        }}
      >
        <header style={{ marginBottom: 48 }}>
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            style={{ 
              width: 48, 
              height: 48, 
              borderRadius: '12px', 
              background: 'var(--aura-blue)', 
              margin: '0 auto 24px',
              boxShadow: '0 0 30px rgba(66, 133, 244, 0.3)'
            }} 
          />
          <Title level={2} className="outfit" style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>
            {isLogin ? '欢迎回到 Aura' : '加入智能健康社区'}
          </Title>
          <Text style={{ color: 'var(--text-tertiary)', fontSize: 16, marginTop: 8, display: 'block' }}>
            {isLogin ? '您的专属健康 AI 现已就绪' : '开启您的数字化健康之旅'}
          </Text>
        </header>

        <Form onFinish={isLogin ? handleLogin : handleRegister} layout="vertical" size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="密码" />
          </Form.Item>
          
          {!isLogin && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
              <Form.Item name="name"><Input placeholder="真实姓名" /></Form.Item>
              <Space style={{ display: 'flex' }}>
                <Form.Item name="age" style={{ flex: 1 }}><Input type="number" placeholder="年龄" /></Form.Item>
                <Form.Item name="occupation" style={{ flex: 1 }}><Input placeholder="职业" /></Form.Item>
              </Space>
            </motion.div>
          )}

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Button htmlType="submit" loading={loading} block type="primary" style={{ height: 52, fontSize: 16 }}>
              {isLogin ? '立即登录' : '创建账号'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 32 }}>
          <Button type="link" onClick={() => setIsLogin(!isLogin)} style={{ color: 'var(--aura-blue)', fontWeight: 500 }}>
            {isLogin ? '还没有账号？点击注册' : '已有账号？返回登录'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
