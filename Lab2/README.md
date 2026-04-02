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

## 快速启动

### 1. 安装依赖

```bash
# 后端
cd backend
pip install -r requirements.txt

# 前端
cd frontend
npm install
```

### 2. 构建前端

```bash
cd frontend
npm run build
```

### 3. 启动服务

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

打开浏览器访问 **http://localhost:8000** 即可使用。

### 4. 开发模式（前后端分离）

```bash
# 终端 1：启动后端（热重载）
cd backend
python -m uvicorn app.main:app --reload --port 8000

# 终端 2：启动前端开发服务器
cd frontend
npm run dev
```

前端开发服务器运行在 `http://localhost:5173`，API 请求自动代理至后端。

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

## 环境变量（可选）

在 `backend/.env` 中配置：

```
SILICONFLOW_API_KEY=sk-your-key-here
```

若不配置，系统将使用内置的 fallback key。

## 分支说明

| 分支 | 说明 |
|------|------|
| `iter1` | 第一次迭代系统 |
| `iter2` | 第二次迭代系统（开发中） |

## 团队

HIT 软件工程课程实践项目
