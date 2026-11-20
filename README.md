# 数字桥梁 BridgeAI

面向老年人及数字技能基础薄弱群体的 AI 情景式数字技能学习平台。
用户在不登录真实账号、不产生真实支付的前提下，通过仿真的手机界面反复练习预约挂号等日常数字技能。

2026 Qoder 高校创造力大赛 · Hack4Good 技术向善赛道参赛作品。

## 技术栈

- React 18 + TypeScript
- Vite 5（开发与构建）
- Tailwind CSS 3（样式，蓝 / 青绿 / 白配色）
- 无路由库：使用浏览器 `location.hash` 实现的轻量路由，天然支持前进/后退

## 目录结构

```
bridgeai/
├─ index.html                 页面入口
├─ vite.config.ts             开发服务器与构建配置（base: './' 便于静态托管）
├─ tailwind.config.js         配色、字号、阴影、动效
├─ postcss.config.js
├─ src/
│  ├─ main.tsx                应用挂载
│  ├─ App.tsx                 导航栏 + 页面 + 页脚，按路由渲染页面
│  ├─ router.ts               hash 路由：home / learning / about / simulation
│  ├─ index.css               Tailwind 与 .btn/.surface-card 基础样式
│  ├─ data/appointment.ts     虚构医院 / 科室 / 医生 / 时段数据与号源、编号生成
│  ├─ simulation/             appointmentState（6 步状态机 + 统计 + 持久化）
│  │                          helpProvider（本地提示规则，可替换为 AI）
│  │                          learningReport（学习小结数据）
│  ├─ components/             NavBar / Footer / FeatureCard / CourseCard / PhoneFrame / BackLink / icons
│  ├─ components/simulation/  流程编排、进度、选项按钮、提示条、帮助面板、学习小结、六个步骤
│  └─ pages/                  HomePage / LearningCenterPage / AboutPage / SimulationPage
└─ dist/                      构建产物（部署到 Qoder Sites 时上传此目录）
```

## 本地预览

直接双击 `start-preview.bat`，浏览器会自动打开 `http://127.0.0.1:5173`。
（该脚本优先使用系统中已安装的 Node.js；若没有，则自动借用 Qoder 自带的 Node 运行时。）

若已自行安装 Node.js 18+，也可使用标准命令：

```bash
npm install
npm run dev      # 开发预览
npm run build    # 类型检查 + 生产构建，输出 dist/
npm run preview  # 预览构建产物
```

## 页面与交互

| 页面 | 路由 | 内容 |
| --- | --- | --- |
| 首页 | `#/` | 导航栏、主标题“跨越数字鸿沟，让科技触手可及”、项目介绍、开始学习按钮、三张功能卡片、页脚标语 |
| 学习中心 | `#/learning` | “模拟预约挂号”课程卡片、安全承诺、筹备中课程 |
| 模拟手机 | `#/simulation` | 仿真手机外壳 + 欢迎页 + 完整 6 步挂号练习 + 学习小结 |
| 关于项目 | `#/about` | 项目定位、设计原则、10 天计划、当前实现 |

返回方式：导航栏、页面内“返回”按钮，以及浏览器返回键均可用。

### 模拟挂号练习（6 步）

选择医院 → 选择科室 → 选择医生 → 选择日期与时段 → 确认信息 → 模拟预约成功。

- 全部为虚构数据：3 家医院、8 个科室、16 位医生、6 个时段、未来 5 天日期；号源与预约编号由确定性算法生成，刷新后不变。
- 每步显示“第 X 步 / 共 6 步”与大白话说明；漏选时给出带图标的文字提醒。
- 每步都有“我需要帮助”按钮，按当前选择状态给出针对性提示（本地规则生成，`helpProvider` 可替换为 AI 模型）。
- 支持“上一步”“返回修改信息”“退出练习”“再练一次”；换医院/科室/医生/日期会自动清空下游选择。
- 进度与统计写入 `sessionStorage`，刷新可续练；失效数据（过期日期、跨医院科室、损坏 JSON）会自动降级。
- 成功后显示学习小结：完成情况、用时与完成时刻、错误操作次数、使用提示次数、需要复习的步骤。

### 无障碍与适老化

- 正文 19px，主按钮 ≥60px，选项按钮 ≥72px；选中态有图标 **和“已选择”文字**，不依赖颜色区分。
- 全站 `:focus-visible` 高对比焦点环；提供“跳到主要内容”按钮；换步骤时焦点移到新步骤标题。
- 错误提醒用 `role="alert"`，帮助提示用 `role="status"`，进度用 `aria-live="polite"`，选项用 `aria-pressed`。
- 已约满时段使用 `aria-disabled`（仍可聚焦、可朗读原因），点击会给出文字提醒而不是静默无反应。
- 尊重 `prefers-reduced-motion`。

## 部署到 Qoder Sites

`npm run build` 生成的 `dist/` 目录是纯静态产物，且资源路径为相对路径，可直接上传：
项目根目录 `bridgeai`，构建输出目录 `dist`。站点已上线，更新时用同一 Project 准备新版本再发布。

## 后续阶段规划

1. AI 情景引导接入（替换 `helpProvider`、语音朗读、随时追问解释）
2. 更多情景课程（生活缴费、出行打车、医保查询）
3. 长辈试用反馈与无障碍细节打磨
4. 跨天保存学习记录（当前为同一标签页内续练）
