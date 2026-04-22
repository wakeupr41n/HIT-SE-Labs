import { useState, useEffect } from 'react';
import { Typography, Modal, Radio, message, Popconfirm } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Trash2, ArrowLeft, Sparkles, Plus, Calendar } from 'lucide-react';
import { getReports, getReport, generateReport, deleteReport, downloadReportPdf } from '../api';

const { Title, Text, Paragraph } = Typography;

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDetail, setReportDetail] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reportType, setReportType] = useState('weekly');
  const [generating, setGenerating] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await getReports();
      setReports(res.data);
    } catch {}
  };

  useEffect(() => { fetchReports(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateReport({ report_type: reportType });
      message.success('报告生成成功');
      setModalOpen(false);
      fetchReports();
    } catch (err) {
      message.error(err.response?.data?.detail || '生成失败');
    }
    setGenerating(false);
  };

  const handleViewDetail = async (id) => {
    try {
      const res = await getReport(id);
      setReportDetail(res.data);
      setSelectedReport(id);
    } catch {
      message.error('获取报告详情失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReport(id);
      message.success('报告已删除');
      if (selectedReport === id) {
        setSelectedReport(null);
        setReportDetail(null);
      }
      fetchReports();
    } catch {
      message.error('删除失败');
    }
  };

  const handleDownloadPdf = async (id) => {
    try {
      const res = await downloadReportPdf(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `aura_health_report_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      message.error('PDF下载失败');
    }
  };

  // Detail View
  if (reportDetail) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ paddingBottom: 80 }}
      >
        <div className="ambient-glow-v3" />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, marginTop: 20 }}>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { setSelectedReport(null); setReportDetail(null); }}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
              borderRadius: 12, padding: '10px 16px', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <ArrowLeft size={16} /> 返回列表
          </motion.button>
        </div>

        <div className="bento-card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <Title level={3} className="syne-display" style={{ margin: 0, marginBottom: 8 }}>
                {reportDetail.title}
              </Title>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="glass-pill" style={{
                  background: reportDetail.report_type === 'weekly'
                    ? 'rgba(0, 122, 255, 0.15)' : 'rgba(155, 114, 203, 0.15)',
                  color: reportDetail.report_type === 'weekly' ? 'var(--aura-blue)' : 'var(--aura-purple)',
                }}>
                  {reportDetail.report_type === 'weekly' ? '周报' : '月报'}
                </div>
                <Text style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
                  <Calendar size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  {formatDate(reportDetail.start_date)} - {formatDate(reportDetail.end_date)}
                </Text>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => handleDownloadPdf(reportDetail.id)}
                style={{
                  background: 'var(--aura-blue)', color: '#fff', border: 'none',
                  padding: '10px 20px', borderRadius: 100, fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <Download size={16} /> 下载 PDF
              </motion.button>
              <Popconfirm title="确定删除此报告？" onConfirm={() => handleDelete(reportDetail.id)} okText="删除" cancelText="取消">
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  style={{
                    background: 'rgba(217, 101, 112, 0.15)', color: 'var(--aura-pink)',
                    border: '1px solid rgba(217, 101, 112, 0.3)',
                    padding: '10px 20px', borderRadius: 100, fontSize: 14, fontWeight: 500,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Trash2 size={16} /> 删除
                </motion.button>
              </Popconfirm>
            </div>
          </div>
        </div>

        <div className="bento-card" style={{ whiteSpace: 'pre-wrap' }}>
          <Text style={{ color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.8 }}>
            {reportDetail.content}
          </Text>
        </div>
      </motion.div>
    );
  }

  // List View
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ paddingBottom: 80 }}
    >
      <div className="ambient-glow-v3" />

      <header style={{ marginBottom: 40, marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
              <div className="glass-pill" style={{ width: 'fit-content', marginBottom: 16 }}>
                <Sparkles size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                AI Reports
              </div>
              <Title level={1} className="syne-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', margin: 0 }}>
                <span className="gemini-gradient-text">AI 健康报告</span>
              </Title>
              <Text style={{ fontSize: 16, color: 'var(--text-secondary)', display: 'block', marginTop: 8 }}>
                基于您的健康数据，AI 智能生成周期性分析报告
              </Text>
            </motion.div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setModalOpen(true)}
            style={{
              background: 'var(--aura-blue)', color: '#fff', border: 'none',
              padding: '12px 24px', borderRadius: 100, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <Plus size={18} /> 生成新报告
          </motion.button>
        </div>
      </header>

      {reports.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '80px 0' }}
        >
          <FileText size={48} style={{ color: 'var(--text-tertiary)', marginBottom: 16 }} />
          <Text style={{ color: 'var(--text-tertiary)', fontSize: 16, display: 'block' }}>
            暂无报告，点击上方按钮生成您的第一份健康报告
          </Text>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show">
          <AnimatePresence>
            {reports.map(report => (
              <motion.div key={report.id} variants={item} layout style={{ marginBottom: 16 }}>
                <div
                  className="bento-card"
                  onClick={() => handleViewDetail(report.id)}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <FileText size={18} color={report.report_type === 'weekly' ? 'var(--aura-blue)' : 'var(--aura-purple)'} />
                      <div className="glass-pill" style={{
                        background: report.report_type === 'weekly'
                          ? 'rgba(0, 122, 255, 0.15)' : 'rgba(155, 114, 203, 0.15)',
                        color: report.report_type === 'weekly' ? 'var(--aura-blue)' : 'var(--aura-purple)',
                        fontSize: 12,
                      }}>
                        {report.report_type === 'weekly' ? '周报' : '月报'}
                      </div>
                    </div>
                    <Text style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', display: 'block' }}>
                      {report.title}
                    </Text>
                    <Text style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                      {formatDate(report.start_date)} - {formatDate(report.end_date)}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Text style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                      生成于 {formatDate(report.created_at)}
                    </Text>
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); handleDownloadPdf(report.id); }}
                      style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                        borderRadius: 10, padding: 8, cursor: 'pointer', color: 'var(--text-secondary)',
                      }}
                    >
                      <Download size={16} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Generate Modal */}
      <Modal
        title="生成 AI 健康报告"
        open={modalOpen}
        onOk={handleGenerate}
        onCancel={() => setModalOpen(false)}
        okText={generating ? '生成中...' : '开始生成'}
        cancelText="取消"
        confirmLoading={generating}
        styles={{
          body: { padding: '24px 0' },
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <Text style={{ color: 'var(--text-secondary)', marginBottom: 12, display: 'block' }}>
            选择报告类型：
          </Text>
          <Radio.Group value={reportType} onChange={e => setReportType(e.target.value)}>
            <Radio.Button value="weekly">周报（近7天）</Radio.Button>
            <Radio.Button value="monthly">月报（近30天）</Radio.Button>
          </Radio.Group>
        </div>
        <Text style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
          AI 将根据您近期的健康数据，生成包含综合评估、指标分析和改善建议的结构化报告。
        </Text>
      </Modal>
    </motion.div>
  );
}
