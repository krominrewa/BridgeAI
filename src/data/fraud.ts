/**
 * AI 防骗训练的三段虚构情境：冒充客服退款、冒充公检法、补贴短信链接。
 * 所有对话、公司、号码、链接都是编的，只用于识别与应对练习；
 * 页面里不出现真实可点击链接，官方号码只作为文字提醒。
 */
import type { CourseId } from '../router'

export type FraudKey = 'refund' | 'official' | 'subsidy'

export type TranscriptLine = {
  id: string
  /** 说话人或来源，例如“对方 · 自称客服”“您”“短信”。 */
  from: string
  text: string
  /** 这一句属于哪一处可疑点。 */
  clueId?: string
}

export type FraudClue = {
  id: string
  /** 找出后在清单里显示的名字。 */
  label: string
  /** 为什么这句话不对劲。 */
  why: string
}

export type FraudAction = {
  id: string
  title: string
  description: string
  /** 是否是最安全的做法。 */
  correct?: boolean
  /** 选择后的解释：选对是肯定，选错说明风险。 */
  feedback: string
}

export type FraudDrillStep = {
  id: string
  label: string
  hint: string
}

export type FraudQuizOption = {
  id: string
  text: string
  correct?: boolean
  explain: string
}

export type FraudQuizQuestion = {
  id: string
  question: string
  options: FraudQuizOption[]
}

export type FraudScenario = {
  key: FraudKey
  courseId: CourseId
  /** 成功页训练编号里的短码。 */
  code: string
  lesson: string
  title: string
  navLabel: string
  summary: string
  kind: '电话' | '短信'
  sender: string
  transcriptLead: string
  lines: TranscriptLine[]
  clues: FraudClue[]
  actions: FraudAction[]
  drill: FraudDrillStep[]
  quiz: FraudQuizQuestion[]
  takeaways: string[]
  overview: {
    type: string
    trick: string
    right: string
  }
  welcomeLead: string
  points: string[]
  intro: string
}

export const NORMAL_LINE_HINT =
  '这句本身不说明问题。重点找这几类信号：让您离开官方渠道、让您转钱、向您要验证码或密码。'

export const SAFE_HOTLINE = '96110'

export const FRAUD_SCENARIOS: Record<FraudKey, FraudScenario> = {
  refund: {
    key: 'refund',
    courseId: 'fraud-refund',
    code: 'REFUND',
    lesson: '第五课',
    title: '识破冒充客服退款',
    navLabel: '退款骗局',
    summary: '一段“假客服”的电话：用双倍退款把人引到微信、假链接，再骗验证码。',
    kind: '电话',
    sender: '来电显示 000-8123-4567（虚构号码）',
    transcriptLead: '一个陌生电话打进来，对方自称是购物平台客服。',
    lines: [
      {
        id: 'r1',
        from: '对方 · 自称银河商城客服',
        text: '您好，您在银河商城买的电饭煲检测出质量问题，平台给您双倍退款。',
        clueId: 'refund-promise',
      },
      { id: 'r2', from: '您', text: '我没有申请退款呀。' },
      {
        id: 'r3',
        from: '对方',
        text: '是系统统一办理的。请先加我微信，我发您一个退款链接。',
        clueId: 'off-platform',
      },
      { id: 'r4', from: '您', text: '为什么不能在 App 里退？' },
      {
        id: 'r5',
        from: '对方',
        text: 'App 正在升级。您把银行卡余额转到我们的安全账户验证一下，验完原路退回。',
      },
      {
        id: 'r6',
        from: '对方',
        text: '马上会收到一条验证码短信，您念给我，我帮您操作，今天名额快没了。',
        clueId: 'code-request',
      },
    ],
    clues: [
      {
        id: 'refund-promise',
        label: '主动来电说商品有问题、要双倍退款',
        why: '真的退款会原路退回，不需要您额外操作。主动来电谈赔偿，本身就可疑。',
      },
      {
        id: 'off-platform',
        label: '让加微信、发链接，离开官方 App',
        why: '一旦离开官方平台，就没有订单记录和平台保护，发来的链接也很可能是假页面。',
      },
      {
        id: 'code-request',
        label: '索要短信验证码，还催“名额快没了”',
        why: '验证码是账户钥匙，任何人要都不能给；制造紧张是骗子常用的办法。',
      },
    ],
    actions: [
      {
        id: 'hangup',
        title: '挂断电话，自己打开购物 App 查订单',
        description: '用自己知道的入口核实，不用对方给的电话或链接',
        correct: true,
        feedback: '做得对：真退款在 App 的订单里能查到，不需要加微信，也不需要转钱。',
      },
      {
        id: 'wechat',
        title: '加微信，点开对方发的退款链接',
        description: '对方说 App 升级，只能走微信',
        feedback: '加微信就离开了平台保护，链接可能是假页面，填了卡号就会被盗刷。',
      },
      {
        id: 'transfer',
        title: '把银行卡余额转到“安全账户”验证',
        description: '对方保证验完就退回',
        feedback: '没有所谓的“安全账户”。钱一旦转出去，基本追不回来。',
      },
      {
        id: 'readcode',
        title: '把刚收到的验证码念给对方',
        description: '对方说帮您操作退款',
        feedback: '验证码等于您账户的钥匙，念给对方就等于把门打开。',
      },
    ],
    drill: [
      { id: 'hangup', label: '先挂断电话', hint: '不管对方说什么，先结束通话。' },
      {
        id: 'check',
        label: '打开购物 App，自己查订单',
        hint: '用自己手机里原本就有的 App，不点对方发的任何链接。',
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: '陌生客服来电说要给您退款，最安全的第一步是？',
        options: [
          {
            id: 'a',
            text: '挂断，自己打开官方 App 查订单',
            correct: true,
            explain: '自己核实最可靠，真退款不需要您配合转账或加微信。',
          },
          { id: 'b', text: '先加微信，看看对方发什么', explain: '加微信会离开平台保护，也容易被拉进假页面。' },
          { id: 'c', text: '把银行卡号发过去，方便退款', explain: '退款不需要完整卡号和密码，索要这些就是骗子。' },
        ],
      },
      {
        id: 'q2',
        question: '对方要您念出手机收到的 6 位验证码，应该？',
        options: [
          { id: 'a', text: '绝对不给，验证码只自己用', correct: true, explain: '验证码能直接操作您的账户，谁要都不能给。' },
          { id: 'b', text: '念给对方，反正是退款', explain: '对方拿到验证码就能转走您的钱。' },
          { id: 'c', text: '截图发给对方，看得更清楚', explain: '截图同样会泄露验证码，不能发。' },
        ],
      },
    ],
    takeaways: [
      '退款只会原路退回，不用加微信、不用转钱。',
      '验证码、密码、银行卡号，谁要都不能给。',
      '挂断后，用自己手机里的官方 App 或官方客服电话核实。',
      '拿不准就打 96110 咨询。',
    ],
    overview: {
      type: '冒充客服退款',
      trick: '用“双倍退款”把您引到微信和假链接',
      right: '挂断电话，自己在购物 App 里查订单',
    },
    welcomeLead: '我是桥桥。这段练习里，您会接到一个“退款客服”的电话。我们来识破它，只花几分钟。',
    points: ['认出退款骗局的常见话术', '学会挂断后自己核实', '记住验证码绝不能给'],
    intro:
      '从一段虚构的“客服退款”电话开始，练习找出可疑的话、选择最安全的做法，再完成挂断与自查的安全操作，最后用两道小测巩固。整个过程不会真的拨打电话，也没有任何真实链接。',
  },

  official: {
    key: 'official',
    courseId: 'fraud-official',
    code: 'OFFICIAL',
    lesson: '第六课',
    title: '识破冒充公检法',
    navLabel: '假警察来电',
    summary: '一段“公安局”来电：用涉案恐吓、要求保密，再把人骗去转“安全账户”。',
    kind: '电话',
    sender: '来电显示 000-5550-1100（虚构号码）',
    transcriptLead: '一个陌生电话打进来，对方自称是市公安局刑侦队的。',
    lines: [
      {
        id: 'o1',
        from: '对方 · 自称市公安局刑侦队',
        text: '我是市局刑侦队的。您的身份证涉嫌一起洗钱案，现在对您立案调查。',
        clueId: 'case-threat',
      },
      { id: 'o2', from: '您', text: '我没做过这些事啊。' },
      {
        id: 'o3',
        from: '对方',
        text: '这个案子保密，不许告诉家里人，否则算泄密。加我 QQ，我发通缉令给您看。',
        clueId: 'secrecy',
      },
      { id: 'o4', from: '您', text: '我该怎么配合？' },
      {
        id: 'o5',
        from: '对方',
        text: '把您名下存款转到检察院的安全账户接受审查，查清后原路退回。',
        clueId: 'safe-account',
      },
      { id: 'o6', from: '对方', text: '今天下午五点前必须办好，不然就上门抓人。' },
    ],
    clues: [
      {
        id: 'case-threat',
        label: '一上来就说您涉嫌洗钱、要立案',
        why: '真警察不会在电话里办案，更不会用“洗钱”“通缉”来吓唬您。',
      },
      {
        id: 'secrecy',
        label: '要求保密、不许告诉家人，还要加 QQ 看通缉令',
        why: '真办案不会阻止您联系家人；加社交软件、发通缉令都是假警察的套路。',
      },
      {
        id: 'safe-account',
        label: '让把钱转到“安全账户”接受审查',
        why: '根本没有“安全账户”。凡是让您转钱的“办案”，都是诈骗。',
      },
    ],
    actions: [
      {
        id: 'verify',
        title: '直接挂断，用自己手机拨打 110 或 96110 核实',
        description: '不按对方给的号码回拨',
        correct: true,
        feedback: '做得对：真警察不怕您核实，更不会让您转钱。',
      },
      {
        id: 'obey',
        title: '按对方要求保密，把钱转到安全账户',
        description: '对方说查清就退回',
        feedback: '转出去的钱很难追回；真办案不会让您转账，也没有安全账户。',
      },
      {
        id: 'qq',
        title: '加对方 QQ，先看看通缉令',
        description: '对方说看了就明白了',
        feedback: '通缉令是伪造的图片，加 QQ 只会被继续套取信息。',
      },
      {
        id: 'withdraw',
        title: '去银行取现，交给上门的“便衣”',
        description: '对方说这样最快洗清嫌疑',
        feedback: '真警察不会上门收现金，这是典型的假警察诈骗。',
      },
    ],
    drill: [
      { id: 'hangup', label: '先挂断电话', hint: '不能让对方继续用“涉案”吓您。' },
      {
        id: 'call',
        label: '用自己手机拨打 110 或 96110 核实',
        hint: '用自己手机拨，不按对方给的号码回拨。',
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: '真警察办案，会通过电话要求您转账吗？',
        options: [
          {
            id: 'a',
            text: '不会，提到转账就是诈骗',
            correct: true,
            explain: '真办案有正式程序，不会电话要钱，更不会让您转到私人或所谓安全账户。',
          },
          { id: 'b', text: '会，要配合调查', explain: '配合调查不等于转账，电话里要钱就是骗子。' },
          { id: 'c', text: '看金额大小', explain: '金额大小都一样，电话要求转账就是诈骗。' },
        ],
      },
      {
        id: 'q2',
        question: '对方说“这事保密，别告诉家人”，您应该？',
        options: [
          {
            id: 'a',
            text: '立刻告诉家人，并打 110 或 96110 核实',
            correct: true,
            explain: '骗子最怕您找人核实。说出来，骗局就很难继续。',
          },
          { id: 'b', text: '照做，谁也不说', explain: '要求保密正是为了切断您和家人朋友的联系。' },
          { id: 'c', text: '只告诉一个网友', explain: '网友也可能被冒充，应该告诉身边家人并打官方电话。' },
        ],
      },
    ],
    takeaways: [
      '真警察不会电话办案、不会让您转账、不会让您保密。',
      '遇到“涉案”电话，先挂断，再用自己手机打 110 或 96110。',
      '不点对方发来的通缉令、链接，不加陌生 QQ 或微信。',
      '把这事告诉家人，骗子最怕您去核实。',
    ],
    overview: {
      type: '冒充公检法',
      trick: '用“涉案”和“保密”吓住您，再骗转账',
      right: '挂断，用自己手机打 110 或 96110 核实',
    },
    welcomeLead: '我是桥桥。这次打来的是“假警察”。别慌，我们一起看清他的话哪里不对。',
    points: ['认出冒充公检法的话术', '学会挂断并向官方核实', '记住真警察不会要钱、不会让保密'],
    intro:
      '用一段虚构的“公安局来电”，练习识别涉案恐吓、要求保密和“安全账户”三种破绽，再做安全操作和两道小测。所有内容都是演练，不会真的拨号。',
  },

  subsidy: {
    key: 'subsidy',
    courseId: 'fraud-subsidy',
    code: 'SUBSIDY',
    lesson: '第七课',
    title: '识破补贴短信链接',
    navLabel: '补贴短信',
    summary: '一条“补贴未领取”的短信：用限时链接套取银行卡号、密码和验证码。',
    kind: '短信',
    sender: '发件人 000-9558-6688（虚构号码）',
    transcriptLead: '手机收到一条短信，说有一笔补贴没领。',
    lines: [
      {
        id: 's1',
        from: '短信 · 000-9558-6688',
        text: '【社保补贴】您有一笔 2680 元补贴未领取，今日 24 点过期，请点链接填写银行卡领取。',
        clueId: 'link-claim',
      },
      {
        id: 's2',
        from: '短信 · 000-9558-6688',
        text: '为验证身份，请填写银行卡号、取款密码和手机验证码。',
        clueId: 'password-request',
      },
      {
        id: 's3',
        from: '短信 · 000-9558-6688',
        text: '如不会操作，请加客服 QQ 0008123456，或拨打 400-000-1234。',
        clueId: 'fake-contact',
      },
    ],
    clues: [
      {
        id: 'link-claim',
        label: '陌生链接 + 限时领取补贴',
        why: '官方补贴不会用陌生链接催您领取，更不会“今天过期”。',
      },
      {
        id: 'password-request',
        label: '要银行卡取款密码和短信验证码',
        why: '任何正规机构都不会要您的取款密码和验证码。',
      },
      {
        id: 'fake-contact',
        label: '让加 QQ、打短信里的 400 电话',
        why: '短信里的联系方式也可能是骗子设的，核实要自己找官方入口。',
      },
    ],
    actions: [
      {
        id: 'delete',
        title: '不点链接，直接删除短信，自己打开官方 App 或打 12333 核实',
        description: '不用短信里的任何联系方式',
        correct: true,
        feedback: '做得对：补贴要通过官方渠道自己查，陌生链接一律不点。',
      },
      {
        id: 'click',
        title: '点开链接，按页面提示填写银行卡',
        description: '页面看起来很像官方',
        feedback: '假页面可以做得和官方一样，填了卡号和密码就会被盗刷。',
      },
      {
        id: 'qq',
        title: '加短信里的客服 QQ 问清楚',
        description: '对方说可以帮您代领',
        feedback: '短信里的 QQ 可能就是骗子，代领会套走您的卡号和验证码。',
      },
      {
        id: 'call400',
        title: '拨打短信里的 400 电话咨询',
        description: '号码看起来像客服电话',
        feedback: '短信里的电话也可能是骗子设的，核实要自己找官方号码。',
      },
    ],
    drill: [
      { id: 'delete', label: '不点链接，直接删除这条短信', hint: '陌生链接不点，也不转发给别人。' },
      {
        id: 'verify',
        label: '自己打开官方 App，或拨打 12333 核实',
        hint: '用自己知道的官方入口，不用短信里的电话或 QQ。',
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: '短信说有一笔补贴，附了一个链接，应该？',
        options: [
          {
            id: 'a',
            text: '不点链接，自己去官方 App 或打 12333 查',
            correct: true,
            explain: '官方补贴能通过官方渠道查到，不需要点陌生链接。',
          },
          { id: 'b', text: '点开看看，不填信息就没事', explain: '假页面可能诱导下载或窃取信息，陌生链接最好不点。' },
          { id: 'c', text: '转发给家人，让他们点', explain: '把风险转给家人，同样不安全。' },
        ],
      },
      {
        id: 'q2',
        question: '页面要求填写银行卡取款密码和验证码，应该？',
        options: [
          {
            id: 'a',
            text: '立刻退出，官方不会要密码和验证码',
            correct: true,
            explain: '密码和验证码是账户钥匙，任何网站索要都要警惕。',
          },
          { id: 'b', text: '填上，不然领不到钱', explain: '领钱不需要取款密码，索要就是诈骗。' },
          { id: 'c', text: '只填验证码，密码不填', explain: '验证码同样能转走钱，一个都不能填。' },
        ],
      },
    ],
    takeaways: [
      '陌生链接不点，短信里的电话和 QQ 也不轻易信。',
      '补贴、退款、中奖，都要自己从官方 App 或官方电话查。',
      '取款密码和短信验证码，任何网站、任何人都不能给。',
      '拿不准就打 12333 或 96110 咨询。',
    ],
    overview: {
      type: '补贴短信链接',
      trick: '用“限时补贴”骗您点链接、填卡号密码',
      right: '不点链接，自己用官方渠道核实',
    },
    welcomeLead: '我是桥桥。这条“补贴短信”看起来很诱人，我们来看看它哪里不对劲。',
    points: ['认出带链接的补贴短信', '学会不点、不填、自己核实', '记住密码和验证码不能给'],
    intro:
      '从一条虚构的“补贴未领取”短信开始，练习识别陌生链接、索要密码和假客服，再做删除与自查的安全操作，最后用两道小测巩固。短信里的号码和链接都是假的，不会跳转。',
  },
}

export function findFraudScenario(key: FraudKey): FraudScenario {
  return FRAUD_SCENARIOS[key]
}

export function findClue(scenario: FraudScenario, id: string): FraudClue | undefined {
  return scenario.clues.find((clue) => clue.id === id)
}

export function correctAction(scenario: FraudScenario): FraudAction {
  return scenario.actions.find((action) => action.correct) ?? scenario.actions[0]
}

export function correctOption(question: FraudQuizQuestion): FraudQuizOption {
  return question.options.find((option) => option.correct) ?? question.options[0]
}