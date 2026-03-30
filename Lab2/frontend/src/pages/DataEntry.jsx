import { useState } from 'react';
import { Form, InputNumber, Button, message, Typography, Row, Col } from 'antd';
import { createRecord } from '../api';

const { Title, Text } = Typography;

export default function DataEntry() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await createRecord(values);
      message.success('数据同步至 Aura');
      form.resetFields();
    } catch (err) {
      message.error(err.response?.data?.detail || '保存失败');
    }
    setLoading(false);
  };

  return (
    <div className="fade-in" style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 64, position: 'relative' }}>
      
      <div className="ambient-glow" style={{ opacity: 0.5, filter: 'blur(80px)' }}></div>
      
      <div style={{ textAlign: 'center', marginBottom: 48, position: 'relative', zIndex: 1 }}>
        <Title style={{ marginBottom: 12, fontSize: 36, fontWeight: 600 }}>
          <span className="gemini-text-glow">追踪今日身体脉动</span>
        </Title>
        <Text style={{ color: '#c4c7c5', fontSize: 15 }}>
          您的每一次记录，都在让 Aura 变得更懂您。
        </Text>
      </div>

      <Form form={form} onFinish={handleSubmit} layout="vertical" size="large" style={{ position: 'relative', zIndex: 1 }}>
        <div className="apple-card" style={{ padding: '32px 40px', marginBottom: 40, borderTop: '2px solid rgba(217, 101, 112, 0.5)' }}>
          <Title level={4} style={{ fontWeight: 600, marginBottom: 24, marginTop: 0, color: '#e3e3e3' }}>心脏与血压</Title>
          <Row gutter={24}>
            <Col xs={24} sm={8}>
              <Form.Item name="heart_rate" label={<Text style={{ fontWeight: 500, color: '#c4c7c5' }}>静息心率</Text>}>
                <InputNumber min={30} max={220} style={{ width: '100%' }} placeholder="次/分" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="systolic_bp" label={<Text style={{ fontWeight: 500, color: '#c4c7c5' }}>收缩压</Text>}>
                <InputNumber min={60} max={250} style={{ width: '100%' }} placeholder="mmHg" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="diastolic_bp" label={<Text style={{ fontWeight: 500, color: '#c4c7c5' }}>舒张压</Text>}>
                <InputNumber min={40} max={150} style={{ width: '100%' }} placeholder="mmHg" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="apple-card" style={{ padding: '32px 40px', marginBottom: 48, borderTop: '2px solid rgba(66, 133, 244, 0.5)' }}>
          <Title level={4} style={{ fontWeight: 600, marginBottom: 24, marginTop: 0, color: '#e3e3e3' }}>生活与活动</Title>
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item name="weight" label={<Text style={{ fontWeight: 500, color: '#c4c7c5' }}>体重 (kg)</Text>}>
                <InputNumber min={30} max={300} step={0.1} style={{ width: '100%' }} placeholder="千克" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="sleep_hours" label={<Text style={{ fontWeight: 500, color: '#c4c7c5' }}>睡眠 (小时)</Text>}>
                <InputNumber min={0} max={24} step={0.5} style={{ width: '100%' }} placeholder="小时" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="water_intake" label={<Text style={{ fontWeight: 500, color: '#c4c7c5' }}>饮水 (ml)</Text>}>
                <InputNumber min={0} max={10000} step={100} style={{ width: '100%' }} placeholder="毫升" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="steps" label={<Text style={{ fontWeight: 500, color: '#c4c7c5' }}>活力 (步数)</Text>}>
                <InputNumber min={0} max={100000} step={100} style={{ width: '100%' }} placeholder="步" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Button htmlType="submit" loading={loading} className="auth-btn" style={{ padding: '0 48px', height: 48, fontSize: 16 }}>
            同步至体征库
          </Button>
        </div>
      </Form>
    </div>
  );
}
