# Aura Health — 办公室健康监测系统

基于大模型技术的办公室健康监测系统，实时追踪员工健康状态（心率、血压、睡眠、活动量等），集成 AI 提供个性化健康建议。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + Vite + Ant Design + Framer Motion + Recharts |
| 后端 | Python FastAPI + SQLAlchemy |
| 数据库 | SQLite |
| AI | SiliconFlow (Qwen / DeepSeek) |
| 设计 | Aura V3 Design System (Bento Grid + Glassmorphism) |

## 快速启动 (Quick Start)

### 1. 配置环境变量 (关键步)
后端去除了硬编码的 API Key 以保证安全。请在 `backend` 目录下创建或修改 `.env` 文件：
```
OPENAI_API_KEY=sk-your-siliconflow-key
```
*(免费获取 Key：访问 https://cloud.siliconflow.cn/ 注册即可获取)*

### 2. 安装依赖

```bash
# 安装后端依赖
cd backend
pip install -r requirements.txt

# 安装前端依赖
cd ../frontend
npm install
```

### 3. 本地开发模式运行（推荐用于检查）

请打开**两个独立的终端**分别运行前后端：

```bash
# 终端 1：启动 FastAPI 后端（内置热重载）
cd backend
python -m uvicorn app.main:app --reload --port 8000

# 终端 2：启动 Vite 前端
cd frontend
npm run dev
```

前端开发服务器将运行在 `http://localhost:5173`。请在浏览器中打开此地址即可体验完整的 Aura V3 高阶设计。

## 项目结构

```
Lab2/
├── frontend/                # React + Vite 前端
│   ├── src/
│   │   ├── pages/           # Login, Dashboard, DataEntry, AIChat
│   │   ├── components/      # AppLayout (玻璃导航栏)
│   │   ├── api/             # Axios 请求封装
│   │   └── index.css        # Aura V3 设计系统 (CSS Variables)
│   └── package.json
├── backend/                 # FastAPI 后端
│   ├── app/
│   │   ├── main.py          # 入口 + 静态文件托管
│   │   ├── models.py        # SQLAlchemy 数据模型
│   │   ├── schemas.py       # Pydantic 校验
│   │   ├── routers/         # users, health, ai
│   │   ├── services/        # ai_service (SiliconFlow 集成)
│   │   └── database.py      # 数据库连接
│   ├── tests/               # pytest 测试
│   └── requirements.txt
└── README.md
```

## 运行测试

```bash
cd backend
python -m pytest tests/ -v --tb=short
python -m pytest tests/ --cov=app --cov-report=term-missing
```

当前覆盖率：**72%**

## 功能清单

### 第一次迭代 ✅
- [x] 用户注册 / 登录（JWT 鉴权）
- [x] 健康数据录入（心率、血压、体重、睡眠、饮水、步数）
- [x] 实时仪表盘 + 14 天趋势图
- [x] AI 健康助手（基于 SiliconFlow 大模型）
- [x] Aura V3 高阶 UI 设计

### 第二次迭代 🚧
- [ ] 智能提醒（久坐、饮水、异常预警）
- [ ] AI 周报 / 月报
- [ ] PDF 健康报告导出

## 分支说明

| 分支 | 说明 |
|------|------|
| `iter1` | 第一次迭代系统 |
| `iter2` | 第二次迭代系统（开发中） |

## 团队

HIT 软件工程课程实践项目
