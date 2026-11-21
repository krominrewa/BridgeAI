# 数字桥梁 BridgeAI

面向老年人及数字技能基础薄弱群体的 AI 情景式数字技能学习平台。
用户在不登录真实账号、不产生真实支付的前提下，通过仿真的手机界面反复练习挂号、缴费、出行、医保四类日常数字技能，并在虚构的电话与短信里识破退款、假警察、补贴短信三类常见骗局。
七节情景课已全部开放，每课 6 步，练熟一课再练下一课。

2026 Qoder 高校创造力大赛 · Hack4Good 技术向善赛道参赛作品。

## 技术栈

- React 18 + TypeScript
- Vite 5（开发与构建）
- Tailwind CSS 3（样式，蓝 / 青绿 / 白配色）
- 无路由库：使用浏览器 `location.hash` 实现的轻量路由，天然支持前进/后退
- 服务端代理与回归工具都是零依赖 Node 18+ 脚本（`server/`、`tools/`），不新增任何 npm 依赖

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
│  ├─ router.ts               hash 路由：home / learning / about / simulation/<courseId>
│  ├─ index.css               Tailwind 与 .btn/.surface-card 基础样式、字号三档、高对比模式
│  ├─ data/                   appointment / payment / transit / insurance / fraud 五套虚构数据与确定性编号生成
│  ├─ simulation/             flowKit（通用 6 步引擎 + 统计 + 持久化）
│  │                          courseFlow（课程外壳钩子：步骤组件、确认按钮文案）
│  │                          helpRequest（求助上下文的数据结构）
│  │                          teachingAssistant（AI 指导接入与降级）
│  │                          learningReport（学习小结数据）
│  ├─ courses/                registry.ts 登记七课；appointment / payment / transit / insurance / fraud
│  │                          每课含 state.ts（状态机）、summary.ts、course.tsx（引擎配置）、steps/
│  ├─ speech/                 speechReader（桥桥中文朗读，语音引导默认开启，也可手动点击；不用麦克风）
│  ├─ settings/               SettingsContext（字号、对比度、动效、简洁/逐步/语音/主动提示，写入 localStorage）
│  ├─ components/             NavBar / Footer / FeatureCard / CourseCard / PhoneFrame / SettingsPanel / BackLink / icons
│  ├─ components/simulation/  CourseShell（编排）+ 欢迎页、进度、选项与磁贴、提示条、帮助面板、学习小结
│  └─ pages/                  HomePage / LearningCenterPage / AboutPage / SimulationPage
├─ server/                    teaching-proxy.mjs（AI 代理服务，密钥只在此进程）、mock-llm.mjs（本地测试上游）
├─ tools/                     capture.mjs（无头 Chrome 场景回归与截图）
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
| 学习中心 | `#/learning` | 七门课程卡片（挂号、缴费、出行、医保，以及三节防骗训练），均可展开课程介绍与步骤；页尾是安全承诺 |
| 模拟手机 | `#/simulation/<courseId>` | 仿真手机外壳 + 欢迎页 + 对应课程的 6 步练习 + 学习小结；只写 `#/simulation` 时默认打开第一课（挂号） |
| 关于项目 | `#/about` | 项目定位、设计原则、10 天计划、当前实现 |

返回方式：导航栏、页面内“返回”按钮，以及浏览器返回键均可用。

### 七节情景课程（每课 6 步）

- 第一课 模拟预约挂号 `#/simulation/appointment`：选择医院 → 选择科室 → 选择医生 → 选择时间 → 确认信息 → 预约成功。虚构数据：3 家医院、8 个科室、16 位医生、6 个时段、未来 5 天日期。确认按钮「确认预约」，存档键 `bridgeai:appointment:v1`。
- 第二课 数字生活缴费（水电燃气）`#/simulation/payment`：选择缴费类型 → 选择户号 → 查看账单 → 选择金额 → 确认信息 → 缴费成功。虚构数据：电 / 水 / 燃气 3 类、6 个户号、3 种缴费方式，账单含用量、单价、最后期限，少数账单模拟为逾期以讲解违约金。确认按钮「确认缴费」，存档键 `bridgeai:payment:v1`。
- 第三课 出行打车与公交查询 `#/simulation/transit`：选择出行方式 → 选择目的地 → 选择上车点 → 选车或线路 → 确认行程 → 出行完成。同样的 6 步里分打车与公交两条走法：5 个目的地、4 个上车点（其中马路中间那个点了只会得到安全提醒）、5 种车型（顺风车约不到）、12 条公交线路（含今日不停车的班次）。确认按钮「确认行程」，存档键 `bridgeai:transit:v1`。
- 第四课 医保与电子凭证查询 `#/simulation/insurance`：认识电子凭证 → 选择使用场景 → 选择使用人 → 验证身份 → 出示凭证 → 余额与记录。虚构数据：4 个使用场景、4 位使用人（未绑定亲情账户的那位点了会被拒绝）、个人账户余额与 3 条使用记录；验证身份可选短信验证码或刷脸，出示后显示模拟二维码。确认按钮「出示凭证」，存档键 `bridgeai:insurance:v1`。验证码一步反复提醒：这 6 个数字谁要都是骗子。
- 第五课 识破冒充客服退款 `#/simulation/fraud-refund`：看清情境 → 找出可疑点 → 选择做法 → 安全操作演练 → 安全知识小测 → 训练完成。虚构的“客服来电”用双倍退款把您引向微信和假链接，再索要验证码；练“挂断电话、自己查订单”。确认按钮「完成训练」，存档键 `bridgeai:fraud-refund:v1`。
- 第六课 识破冒充公检法 `#/simulation/fraud-official`：六步同上。虚构的“假警察来电”用涉案、保密和“安全账户”施压；练“挂断后用自己手机打 110 / 96110 核实”。确认按钮「完成训练」，存档键 `bridgeai:fraud-official:v1`。
- 第七课 识破补贴短信链接 `#/simulation/fraud-subsidy`：六步同上。虚构的“补贴未领取”短信用限时链接套取卡号、取款密码和验证码；练“不点链接、删除短信、自己用官方渠道核实”。确认按钮「完成训练」，存档键 `bridgeai:fraud-subsidy:v1`。

防骗三课的对话、号码、公司、链接全部虚构，页面里不出现任何可点击的外部链接；官方号码（96110、110、12333）只作为文字提醒。点到正常句子不算错，会解释为什么这句没问题；选错做法、安全操作跳步或小测答错会即时解释，可以重选。

七课共用同一套流程引擎（`src/simulation/flowKit.ts` + `courseFlow.ts`），交互口径完全一致：

- 每步显示“第 X 步 / 共 6 步”与大白话说明；漏选时给出带图标的文字提醒。
- 每步都有“我需要帮助”按钮，按当前选择状态给出针对性提示（本地规则优先，可接入 Qoder API 真模型）。
- 全部为虚构数据：号源、账单金额、车牌与司机、凭证与缴费编号由确定性算法生成，刷新后不变；只有医保课的短信验证码每次点“获取验证码”都会换一个。
- 支持“上一步”“返回修改信息”“退出练习”“再练一次”；换上层选择会自动清空下游结果（换医院清科室与医生、换缴费类型清户号、换出行方式清车型与线路、换场景或换人后旧验证结果作废）。
- 进度与统计写入 `sessionStorage`，刷新可续练；失效数据（过期日期、跨医院科室、马路中间的上车点、未绑定亲属、损坏 JSON）会自动降级。
- 成功后显示学习小结：完成情况、用时与完成时刻、错误操作次数、使用提示次数、需要复习的步骤；同一提醒连续重复点击只记 1 次错误。

### 辅助模式与语音引导（全站设置）

- 设置入口有三处：首页顶部语音条、导航栏“显示与辅助”、每节课工具栏与欢迎页。面板分四组：阅读（字号三档、高对比、简洁模式）、操作（逐步操作、桥桥主动提示）、语音（语音引导、语速三档）、动画（减少动效）。
- **语音引导默认开启**：进入首页会自动朗读欢迎语，参考《我的世界》Java 版，在首屏提供显眼的“关闭朗读”。关闭后全站不再自动朗读，但仍可手动“朗读这一步”。朗读不使用麦克风，不采集任何声音。
- **简洁模式**默认关闭：只收起进度圆点、欢迎页收获列表和选项里的次要小字，选项标题、金额、状态、提醒与核对信息都不隐藏。
- **逐步操作模式**默认关闭：在步骤上方显示“桥桥带您做”，把当前一步拆成一两个小动作；没做到就点“我做好了”只会得到温和提醒，不记错误。
- 设置保存在 `localStorage` 的 `bridgeai:display:v1`，刷新、换课都保留；浏览器拒绝保存时本次会话内仍然有效。

### 无障碍与适老化

- 正文 19px，主按钮 ≥60px，选项按钮 ≥72px；选中态有图标 **和“已选择”文字**，不依赖颜色区分。
- 导航栏与练习页都有“显示与辅助”面板：字号三档（根字号 16 / 20 / 24px，全站等比放大）、高对比模式、减少动效开关；选择写入 `localStorage`，无法保存时本次会话内依然有效。
- 全站 `:focus-visible` 高对比焦点环；提供“跳到主要内容”按钮；换步骤时焦点移到新步骤标题。
- 「桥桥」的帮助卡片带“读给我听 / 重新朗读”，用系统中文语音朗读当前提示；语音引导开启时，换步与纠错提醒也会自动朗读。不使用麦克风，浏览器不支持时显示文字替代说明；导航栏与首页都有一键关闭。
- 错误提醒用 `role="alert"`，帮助提示用 `role="status"`，进度用 `aria-live="polite"`，选项用 `aria-pressed`。
- 已约满时段、不可代用的人员、不能上车的地点使用 `aria-disabled`（仍可聚焦、可朗读原因），点击会给出文字提醒而不是静默无反应。
- 尊重 `prefers-reduced-motion`，也可以在设置里自行关闭动效。

## AI 情景指导（可开关，失败不影响练习）

前端 `src/simulation/teachingAssistant.ts` 把当前步骤压成一份结构化上下文（课程名、步骤名、已选内容、本步可选项、最近一条提醒），POST 给 `server/teaching-proxy.mjs`。代理只转发白名单字段并逐项截断长度，回传的指导文字不超过 300 字，再用 OpenAI 兼容接口请求模型；**API 密钥只存在代理进程的环境变量里，浏览器永远拿不到**。

- 代理环境变量：`TEACHING_API_KEY`（必填，缺省直接返回 503）、`TEACHING_API_URL`（默认 `https://dashscope.aliyuncs.com/compatible-mode/v1`）、`TEACHING_MODEL`（默认 `qwen-plus`）、`PORT`（默认 8787）、`TEACHING_ALLOW_ORIGIN`（默认 `http://127.0.0.1:5174,http://127.0.0.1:5175`）。
- **接入 Qoder API（比赛要求）**：代理使用 OpenAI 兼容协议，把 Qoder 控制台提供的兼容地址、模型名和密钥分别写入上面的 `TEACHING_API_URL`、`TEACHING_MODEL`、`TEACHING_API_KEY` 即可，前端与课程代码不用改，密钥只留在服务端环境变量。若 Qoder 接口不是 OpenAI 兼容格式，只需改 `callUpstream` 一处。未配置时全部七课使用本地规则提示，不影响比赛演示。
- 前端构建时配置：`VITE_TEACHING_API_URL=http://127.0.0.1:8787/api/teaching`；不配置时只用各课自带的本地规则提示。
- 代理没启动、返回非 2xx、或超过 8 秒没有回应，前端一律静默回退到本地规则文字，帮助卡片会如实标注当前是“本地规则提示”还是“AI 智能指导”，练习本身不受任何影响。

```bash
# 接真实模型：密钥只在代理进程里
TEACHING_API_KEY=sk-xxx node server/teaching-proxy.mjs

# 本地 QA：先起零依赖的假上游（默认 8788），再让代理指向它
node server/mock-llm.mjs
TEACHING_API_URL=http://127.0.0.1:8788 TEACHING_API_KEY=dummy node server/teaching-proxy.mjs
```

## 界面回归与截图工具

`tools/capture.mjs` 零依赖，直接驱动系统已安装的 Chrome / Edge 无头模式（CDP 协议），一轮跑完输出截图与每个场景的结果。

- 需要先有静态预览服务（例如 `npm run preview`），默认地址 `http://127.0.0.1:5173`，可用环境变量 `BASE_URL` 覆盖。
- 用法：`node tools/capture.mjs <输出目录> [场景名过滤]`，如 `node tools/capture.mjs screenshots/run payment` 只跑缴费课的场景。
- 当前覆盖 105 个场景：七门课的欢迎页、逐步操作、漏选纠错、帮助与朗读、刷新续练、返回与重练、大字号与高对比、键盘操作、三档屏幕尺寸，防骗三课的找破绽、选错做法、安全操作跳步、小测与完成页，以及 AI 通路的成功 / 失败 / 降级三条分支（未配置代理时 AI 场景自动跳过）。每个场景开始前会清掉七课的 `bridgeai:*:v1` 存档键与首页自动朗读标记。

## 部署到 Qoder Sites

`npm run build` 生成的 `dist/` 目录是纯静态产物，且资源路径为相对路径，可直接上传：
项目根目录 `bridgeai`，构建输出目录 `dist`。

线上站点由其他组员维护并实时更新；本分支**不部署、不修改线上站点**，部署以组长安排为准。
另外 `dist/` 里没有 `server/` 代理，AI 指导在静态托管上不会自动生效，未配置时站点照常使用本地规则提示。

## 后续阶段规划

1. 支持长辈自己提问（目前只能就当前这一步求助，还不能自由追问）。
2. 线上部署时配置教学代理：静态站点不含 Node 进程，需要另找地方跑 `server/teaching-proxy.mjs` 并配好密钥与允许的来源。
3. 跨天保存多次练习记录（当前进度只存在同一标签页内，关闭即清除）。
4. 更多情景课程（如视频通话、查询体检报告）。
5. 长辈试用反馈与无障碍细节打磨。
