# 第 8–10 阶段设计说明：辅助模式、防诈骗训练与桥桥数字陪练

- 分支：`work/xwj`（基于 `main` 的四课架构，commit `d4e163a`）
- 日期：2026-11-21
- 负责人：肖文俊
- 约束：不修改、不部署线上站点 `bridgeai-h9osl7xtw5y.qoder.zone`；不向 `main` / `morescene` 推送；密钥只存在于服务端环境变量。

## 1. 目标

1. **第 8 阶段**：全站辅助设置，新增简洁模式、逐步操作模式、语音引导，并重排设置面板，让长辈和视力障碍用户更容易找到、更容易使用。
2. **第 9 阶段**：新增三节独立的防诈骗与数字安全训练课，覆盖虚拟诈骗情境识别、风险提示与安全知识教学。
3. **第 10 阶段**：把桥桥升级为数字陪练：主动引导、三级分层提示、练习后的学习总结与练习历史。

## 2. 已确认的取舍

| 决策 | 结论 |
| --- | --- |
| 模式作用范围 | **全站设置**，一次设置对所有页面和课程生效 |
| 防骗课结构 | **三节独立课**，各有一个入口、一份学习小结 |
| AI 接入 | 本地规则优先、离线可用；同时预留并文档化 **Qoder API** 真模型接入（比赛要求） |
| 自动朗读 | **默认开启**；进入首页即自动朗读欢迎语，并提供显眼的关闭按钮（参考《我的世界》Java 版） |
| 语音对象 | 主要为视力障碍用户，因此入口必须在首屏可发现，不能只藏在设置面板里 |

## 3. 现有架构与扩展点

- 通用引擎：`src/simulation/flowKit.ts`（步骤推进、纠错计数、会话保存）、`src/simulation/courseFlow.ts`（课程引擎与 `useCourseFlow`）。
- 统一外壳：`src/components/simulation/CourseShell.tsx`（欢迎页、进度、帮助、提醒、小结、底部操作栏）。
- 设置：`src/settings/SettingsContext.tsx` + `src/components/SettingsPanel.tsx`，作用于 `<html data-font data-contrast data-motion>`。
- 语音：`src/speech/speechReader.ts`，目前只服务帮助面板的手动朗读。
- 课程：`src/courses/<id>/{course.tsx,state.ts,steps/*}`，在 `src/courses/registry.ts` 与 `src/router.ts` 的 `CourseId` 联合类型登记。

## 4. 第 8 阶段：辅助设置与三种模式

### 4.1 设置模型

扩展 `DisplaySettings`，继续使用 `bridgeai:display:v1`（旧数据缺字段时自动落默认值，不需要迁移脚本）：

```ts
export type SpeechRate = 'slow' | 'normal' | 'fast'
export type DisplaySettings = {
  font: 'standard' | 'large' | 'xl'
  contrast: 'standard' | 'high'
  reduceMotion: boolean
  simple: boolean        // 简洁模式，默认 false
  guided: boolean        // 逐步操作模式，默认 false
  voiceGuide: boolean    // 语音引导，默认 true
  speechRate: SpeechRate // 默认 normal（0.92）
  proactive: boolean     // 桥桥主动提示，默认 true
}
```

- 新增 setter：`setSimple`、`setGuided`、`setVoiceGuide`、`setSpeechRate`、`setProactive`；`reset` 恢复以上默认值。
- 根节点新增 `data-simple="on|off"`、`data-guided="on|off"`；语音与主动提示不写 DOM，由组件读取。
- 语速映射：`slow` 0.8、`normal` 0.92、`fast` 1.05。

### 4.2 简洁模式

目标：屏幕里只保留“现在要做什么”，但**不影响判断的信息一律不隐藏**。

- 全局样式：`html[data-simple='on'] .simple-hide { display: none; }`。
- 隐藏：课程欢迎页的三条收获列表；进度条的步骤圆点（保留“第 2 步 / 共 6 步 · 选科室”一行）；选项卡片里的地址等 `meta` 次要信息。
- 不隐藏：选项标题与说明、预约/缴费金额、“已约满”状态、纠错提醒、安全说明、确认页的核对信息、学习小结。
- 实现以 CSS 类为主，不改各课流程逻辑；读屏软件同样不会读到被隐藏内容。

### 4.3 逐步操作模式

在步骤上方显示“桥桥带您做”面板，把一步拆成一到两个小动作。

```ts
export type MicroTask<S> = {
  id: string
  text: string    // 例如「先选一个看病的日期」
  done: (state: S) => boolean
  waiting: string // 还没完成就点「我做好了」时的温和提醒
}
```

- 课程引擎新增可选的 `tasks(state)`；面板只显示第一个未完成的小任务，完成的自动打勾。
- 面板按钮：“我做好了，下一步”（未完成时显示 `waiting`，不记错误）、“收起引导”（仅本步隐藏，换步恢复）。
- 默认关闭，避免熟练用户被打扰；开启后根节点 `data-guided="on"`。
- 无障碍：面板 `role="region"`、`aria-live="polite"`，按钮不小于 52px。

### 4.4 语音引导（默认开启，首页可关）

**首页自动朗读（参考《我的世界》Java 版）**

- 新增 `VoiceWelcome`，放在首页首屏顶部：
  - 文案：`朗读已开启：欢迎来到数字桥梁。这里可以练习挂号、缴费、出行、医保和防诈骗。`
  - 按钮：**关闭朗读**（立即停止并写回设置）、**再听一遍**、**语音与辅助设置**（打开设置面板）。
  - 每个标签页会话自动朗读一次（`sessionStorage: bridgeai:voice-intro:v1`）；用户点“再听一遍”不受次数限制。
- 浏览器不支持 Web Speech 时，横幅改为说明文字并提供“打开辅助设置”，不显示朗读按钮。
- 自动播放可能被浏览器策略拦截：不报错；横幅上的“再听一遍”就是手动兜底。

**全站快捷开关**

- 导航栏新增 `#voice-toggle-nav` 语音开关（`aria-pressed`，文字“朗读 开/关”），所有页面可见，视力障碍用户不必先找到设置面板。
- 关闭时立即 `stopSpeech()`；重新打开时朗读一句“朗读已开启”。

**练习内语音**

- 每课在引擎里提供 `voiceLine(state)`（两句以内，例如“第 1 步，选择医院。点一下您想去的医院，再点下一步。”）。
- 开启语音时：换步自动朗读本步说明；出现纠错提醒时朗读提醒；进入帮助面板时停止自动朗读，改由面板手动朗读。
- 工具行始终提供 `#voice-step-button`“朗读这一步”（浏览器支持时），不受自动朗读开关影响。

### 4.5 设置入口与面板

- 导航栏“显示与辅助”在移动端也显示文字（当前小屏被隐藏），并增加朗读开关；首页横幅、练习欢迎页、练习工具行都保留设置入口。
- 面板按四组重排，组标题清晰：
  - **阅读**：字号三档、对比度、简洁模式开关。
  - **操作**：逐步操作模式开关、桥桥主动提示开关。
  - **语音**：语音引导开关（默认开）、朗读速度三档；不支持语音时说明原因。
  - **动画**：减少动画开关（保留系统偏好说明）。
- 保留“恢复默认设置”和底部“完成”；所有开关沿用 `role="switch"` + `aria-checked`，选项沿用 `aria-pressed`。

### 4.6 第 8 阶段涉及文件

- 修改：`SettingsContext.tsx`、`SettingsPanel.tsx`、`NavBar.tsx`、`HomePage.tsx`、`speechReader.ts`、`CourseShell.tsx`、`CourseWelcome.tsx`、`FlowProgress.tsx`、`ChoiceButton.tsx`、`index.css`、四课 `course.tsx`（语音词与小任务）。
- 新增：`components/VoiceWelcome.tsx`、`components/simulation/GuidedPanel.tsx`。

## 5. 第 9 阶段：三节独立防诈骗课

### 5.1 课程与入口

| CourseId | 课程名 | 导航短名 | 情境 |
| --- | --- | --- | --- |
| `fraud-refund` | 识破冒充客服退款 | 退款骗局 | 快递丢失、双倍理赔短信，诱导点链接、加微信、报验证码 |
| `fraud-official` | 识破冒充公检法 | 假警察来电 | 自称公安，称涉嫌洗钱，要求转入“安全账户”并保密 |
| `fraud-subsidy` | 识破补贴短信链接 | 补贴短信 | 冒充社保中心，称养老补贴待领取，索要身份证、银行卡、验证码 |

- 登记到 `CourseId`、`COURSE_IDS`、`COURSE_META`、`COURSE_ORDER`、`COURSE_SCREENS`；学习中心显示七节课，首页文案同步改为“挂号、缴费、出行、医保、防诈骗”。
- 三课共用 `src/courses/fraud/` 下的状态机与步骤组件，各自只提供情境数据、课程文案与存储键，避免三份重复实现。

### 5.2 共享流程（每课 6 步）

`['看清情境', '找出可疑点', '选择做法', '安全操作演练', '安全知识小测', '训练完成']`，确认步 4，成功步 5。

1. **看清情境**：模拟短信或来电卡片，明确标注“虚构示例”；页面底部有安全提示卡。点“下一步”进入识别。
2. **找出可疑点**：逐行阅读，点选可疑行（`aria-pressed`）。
   - 标对：该行出现红色“可疑”标记与一句解释。
   - 标错：温和提醒“这一句本身没问题，再看看索要验证码、陌生链接这类地方”，记 1 次错误，不记录该行。
   - 点“下一步”时若漏标：提示“还有 N 处可疑”，不记错误。
3. **选择做法**：四个选项，一个正确。
   - 选错：立即给出为什么不对的解释并记 1 次错误，允许重选。
   - 选对：显示“这样最安全”，可进入下一步。
4. **安全操作演练**：三个承诺开关（不点陌生链接 / 不告诉别人验证码 / 不向陌生账户转账）+ 一个“拨打 96110”演练按钮（页面注明这是练习，不会真拨号）。四项都完成后才能继续。
5. **安全知识小测**：两道三选一。选错给出解释并记 1 次错误，可重选；两题都答对才能“完成训练”。
6. **训练完成**：安全口诀、官方求助号码回顾，加学习小结（第 10 阶段增强）。

### 5.3 情境数据模型

```ts
export type FraudScenario = {
  id: string
  title: string
  intro: string
  channel: '短信' | '电话'
  from: string                 // 虚构来源，例如「快递客服 000-0000」
  lines: { id: string; text: string; clue: string | null }[]
  actionPrompt: string
  actions: { id: string; label: string; correct: boolean; feedback: string }[]
  promiseIds: string[]
  quiz: {
    id: string
    question: string
    options: { id: string; label: string; correct: boolean; feedback: string }[]
  }[]
  takeaways: string[]
  officialTip: string
}
```

### 5.4 安全底线

- 情境内的链接、电话、账号**只做文字展示**，不生成 `href`、不调用任何外部地址。
- 虚构号码统一用 `000` 段；真实官方号码（96110 反诈专线、12333 社保热线、110）只在教学提示中说明“应该打给谁”，不做成可点击拨号。
- 不展示真实诈骗话术中的收款账户、二维码或个人信息样例；所有姓名、订单号均为虚构。
- 完成页明确：“遇到拿不准的事，先挂断、先不点，再问家人或打官方电话。”

### 5.5 AI 接入（Qoder API）

- 前端继续走 `src/simulation/teachingAssistant.ts` → `server/teaching-proxy.mjs`，**密钥不下发浏览器**。
- 代理是 OpenAI 兼容协议；接入 Qoder API 时只需服务端环境变量：
  - `TEACHING_API_URL`：Qoder 控制台提供的 OpenAI 兼容地址（以比赛文档为准）。
  - `TEACHING_MODEL`：控制台给出的模型名。
  - `TEACHING_API_KEY`：只在服务端设置，不写进仓库、不写进前端。
- 系统提示词增加防诈骗三课与三级提示说明；`sanitizeContext` 增加 `tier` 字段（1–3）。
- 不配置代理时，三课与现有四课一样使用完整的本地规则提示，界面如实标注“本地规则提示”。
- 如果 Qoder API 不是 OpenAI 兼容格式，只需改代理里的 `callUpstream`，前端与课程代码不动。README 会写清这一接入点，供组员后续配置。

## 6. 第 10 阶段：桥桥数字陪练

### 6.1 三级分层提示

- 每步三档：
  1. **方向**：这一步要做什么（一句话）。
  2. **具体**：现有的大白话提示（保留现有文案）。
  3. **手把手**：点名该点哪个按钮、哪个选项，以及找不到时的兜底办法。
- `FlowRules.helpText(state)` 改为 `hintText(state, tier)`；`FlowBase` 增加 `helpTier`。
- 帮助卡显示“提示 2/3”，提供“说得再具体一点”；升到第 3 档后显示“这已经是最具体的提示了”。每升一档计一次“使用提示”，并记录本步用到的最高档位。
- AI 请求带 `tier`，代理按层级调整答案；本地三档提示始终是兜底。

### 6.2 主动引导

- 设置项“桥桥主动提示”（默认开）。
- 触发条件（每个步骤最多主动出现一次）：
  - 同一屏 20 秒没有点击或按键；
  - 同一步连续出现 2 次纠错提醒。
- 形式：进度条下方的轻提示卡（`BuddyNudge`），不抢焦点、不自动展开帮助面板：
  - 文案由课程提供，例如“别着急，这一步是选医院。点一下医院卡片就行。”
  - 按钮：“看看提示”（展开第 1 档提示，计一次使用提示）、“我自己再试试”（关闭）。
- 主动提醒单独计数（`autoHints`），不记为用户求助；学习小结中如实显示“桥桥主动提醒 N 次”。
- 换步、重练、退出时清除提示；语音开启时朗读提醒文字。

### 6.3 学习总结与练习历史

扩展 `LearningReportData`：

```ts
type LearningReportData = {
  // 现有：完成步数、用时、错误、提示、需复习步骤
  autoHints: number
  deepHintSteps: string[]      // 用到第 3 档提示的步骤
  encouragement: string        // 桥桥评语（本地规则）
  takeaways: string[]          // 本课掌握要点
  nextSuggestion: { text: string; courseId?: CourseId }
}
```

- 评语规则：0 错误 0 提示 →“一次就做对了，真稳！”；少量错误 →“出错后能自己改过来，这就是学会的样子。”；错误较多 →“今天已经完整走了一遍，多练两次就熟了。”
- 下一步建议：错误不超过 1 次且没有用到第 3 档 → 推荐下一课；否则建议重练本课，并点名需复习的步骤。
- 防骗三课在总结里追加安全口诀与官方号码回顾。
- `practiceHistory.ts` 用 localStorage 保存每课最近一次结果（时间、用时、错误、提示、主动提醒）；课程欢迎页显示“上次练习：11 月 20 日，错误 1 次”，让陪练有连续性。

## 7. 数据模型变化汇总

- `FlowBase`：新增 `helpTier`、`nudge`、`nudgeSeq`、`nudgedStep`。
- `FlowStats`：新增 `autoHints`；`byStep[]` 新增 `maxTier`（读取旧存档时补 0）。
- `FlowActionBase`：`help` 支持 `tier`；新增 `nudge`（`kind: 'idle' | 'errors'`）与 `dismissNudge`。
- `FlowRules`：`helpText` → `hintText(state, tier)`；新增可选 `nudgeText(state)`。
- `CourseEngine`：新增 `voiceLine`、`tasks`、`takeaways`、`nextCourse`。
- `HelpRequest`：新增 `tier: 1 | 2 | 3`。
- `CourseShell`：新增 `courseId` 属性，供练习历史与下一课建议使用。

## 8. 文件清单

**新增**

- `components/VoiceWelcome.tsx`、`components/simulation/GuidedPanel.tsx`、`components/simulation/BuddyNudge.tsx`
- `simulation/practiceHistory.ts`
- `courses/fraud/{scenario-types.ts,data.ts,state.ts,course.tsx,steps/*}`
- `docs/superpowers/specs/2026-11-21-stages-8-10-design.md`（本文件）

**主要修改**

- 设置与语音：`SettingsContext.tsx`、`SettingsPanel.tsx`、`NavBar.tsx`、`HomePage.tsx`、`speechReader.ts`、`index.css`
- 引擎与外壳：`flowKit.ts`、`courseFlow.ts`、`helpRequest.ts`、`CourseShell.tsx`、`HelpPanel.tsx`、`CourseWelcome.tsx`、`FlowProgress.tsx`、`ChoiceButton.tsx`
- 总结：`learningReport.ts`、`LearningReport.tsx`
- 课程：四课 `state.ts` / `course.tsx`（提示三档、语音词、小任务、要点）
- 登记与文档：`router.ts`、`courses/registry.ts`、`LearningCenterPage.tsx`、`README.md`、`server/teaching-proxy.mjs`、`tools/capture.mjs`

## 9. 测试与验收

- `npm run build`（`tsc --noEmit` + Vite 构建）必须通过。
- `tools/capture.mjs` 增加场景：简洁/逐步/语音三模式开关与持久化、首页自动朗读条、三节防骗课完整流程（标对与标错、选错做法、漏勾承诺、答错小测）、三级提示升档、空闲与连续错误主动提示、学习总结与练习历史。
- 浏览器手动验收：大字 + 高对比 + 逐步模式 + 语音开启，走完至少一节防骗课；检查键盘 Tab 顺序、焦点提示、朗读停止、设置恢复默认。
- 不在本阶段引入测试框架；沿用仓库现有的无头 Chrome 场景验收。

## 10. 实施顺序与提交

1. **第 8 阶段**：设置模型与面板 → 首页语音条与导航开关 → 简洁模式 → 逐步操作 → 步骤语音。提交一次。
2. **第 9 阶段**：共享防骗状态机与三套情境 → 三课登记与页面文案 → 代理提示词与 QA 场景。提交一次。
3. **第 10 阶段**：三级提示 → 主动引导 → 学习总结与练习历史。提交一次。
4. 三次提交都在 `work/xwj`，各自可独立回退；`push` 前再次确认；全程不触碰线上站点。

## 11. 给组员的说明

- **语音为什么默认开**：朗读主要给视力障碍用户用。参考《我的世界》Java 版，进入首页就朗读欢迎语，并在首屏给出明显的“关闭朗读”按钮；关闭后全站不再自动朗读，但仍可手动“朗读这一步”。设置入口在导航栏和练习工具行都可见。
- **Qoder API 怎么接**：服务端 `server/teaching-proxy.mjs` 已是 OpenAI 兼容代理。把 Qoder 提供的地址、模型名、密钥写入服务端环境变量即可；前端不需要改，密钥不会进浏览器。若接口格式不同，只改 `callUpstream` 一处。未配置时全部课程使用本地规则提示，不影响比赛演示。
- **防骗课的内容维护**：三套情境的数据集中在 `src/courses/fraud/data.ts`，改文案不需要动流程代码；流程、计分与安全底线由共享状态机保证一致。