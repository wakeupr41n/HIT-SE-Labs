import { useState } from 'react';
import { Form, InputNumber, Button, message, Typography, Row, Col } from 'antd';
import { motion } from 'framer-motion';
import { HeartPulse, Activity, Save } from 'lucide-react';
import { createRecord } from '../api';

const { Title, Text } = Typography;

export default function DataEntry() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await createRecord(values);
      message.success('健康数据已同步');
      form.resetFields();
    } catch (err) {
      message.error(err.response?.data?.detail || '同步失败');
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 100 }}
    >
      <div className="ambient-glow-v3" />
      
      <header style={{ textAlign: 'center', marginBottom: 60 }}>
        <Title level={1} className="outfit" style={{ fontSize: 40, fontWeight: 700, marginBottom: 12 }}>
          <span className="gemini-gradient-text">记录今日身体脉动</span>
        </Title>
        <Text style={{ color: 'var(--text-tertiary)', fontSize: 16 }}>
          精准的数据输入是 AI 为您提供科学建议的基础。
        </Text>
      </header>

      <Form form={form} onFinish={handleSubmit} layout="vertical" size="large">
        {/* Vital Signs Section */}
        <div className="bento-card" style={{ marginBottom: 24, borderLeft: '4px solid var(--aura-pink)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <HeartPulse size={24} color="var(--aura-pink)" />
            <Title level={4} className="outfit" style={{ margin: 0, fontWeight: 600 }}>生命体征监测</Title>
          </div>
          
          <Row gutter={24}>
            <Col xs={24} sm={8}>
              <Form.Item name="heart_rate" label={<span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>静息心率 (BPM)</span>}>
                <InputNumber min={30} max={220} style={{ width: '100%' }} placeholder="72" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="systolic_bp" label={<span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>收缩压 (mmHg)</span>}>
                <InputNumber min={60} max={250} style={{ width: '100%' }} placeholder="120" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="diastolic_bp" label={<span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>舒张压 (mmHg)</span>}>
                <InputNumber min={40} max={150} style={{ width: '100%' }} placeholder="80" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Lifestyle Section */}
        <div className="bento-card" style={{ marginBottom: 48, borderLeft: '4px solid var(--aura-blue)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <Activity size={24} color="var(--aura-blue)" />
            <Title level={4} className="outfit" style={{ margin: 0, fontWeight: 600 }}>生活质量指数</Title>
          </div>
          
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item name="weight" label={<span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>当前体重 (kg)</span>}>
                <InputNumber min={30} max={300} step={0.1} style={{ width: '100%' }} placeholder="70.0" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="sleep_hours" label={<span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>昨日睡眠 (hrs)</span>}>
                <InputNumber min={0} max={24} step={0.5} style={{ width: '100%' }} placeholder="8.0" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="water_intake" label={<span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>今日饮水 (ml)</span>}>
                <InputNumber min={0} max={10000} step={100} style={{ width: '100%' }} placeholder="2000" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="steps" label={<span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>今日步数 (steps)</span>}>
                <InputNumber min={0} max={100000} step={100} style={{ width: '100%' }} placeholder="8000" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ textAlign: 'center' }}>
          <Button 
            htmlType="submit" 
            loading={loading} 
            type="primary" 
            icon={<Save size={18} />}
            style={{ padding: '0 60px', height: 56, fontSize: 17 }}
          >
            同步至 Aura 全球库
          </Button>
        </motion.div>
      </Form>
    </motion.div>
  );
}

