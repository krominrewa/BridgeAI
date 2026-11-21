/**
 * 医保课程用的虚构数据：使用场景、亲情账户、余额、使用记录与凭证码。
 * 所有编号、金额、记录都是编的，只用于练习。
 */

export type SceneId = 'register' | 'pharmacy' | 'settle' | 'remote'

export type Scene = {
  id: SceneId
  name: string
  hint: string
  /** 在什么地方出示凭证。 */
  where: string
  /** 出示之前要准备什么。 */
  needs: string
  tag?: string
}

export type InsuredUser = {
  id: string
  name: string
  relation: string
  cardTail: string
  insuredPlace: string
  /** 个人账户余额（元），仅供练习展示。 */
  personal: number
  /** 当年额度已用（元）。 */
  usedThisYear: number
  note: string
  /** 不能自助使用（例如还没绑定亲情账户）。 */
  unavailable?: boolean
}

export type UseRecord = {
  date: string
  place: string
  kind: string
  amount: number
  result: '已结算' | '已报销' | '待结算'
}

export const SCENES: Scene[] = [
  {
    id: 'register',
    name: '医院挂号',
    hint: '窗口或自助机上刷医保凭证，不用带卡',
    where: '医院挂号收费窗口、大厅自助机',
    needs: '到了先找“医保自助机”或收费窗口，把二维码对着扫描口',
  },
  {
    id: 'pharmacy',
    name: '药店买药',
    hint: '买药时用个人账户里的钱付',
    where: '医保定点药店的收银台',
    needs: '看清药店门口有没有“医保定点”牌子，不是所有店都能刷',
    tag: '常用',
  },
  {
    id: 'settle',
    name: '门诊结算',
    hint: '看完医生付费时，医保直接抵掉该报的部分',
    where: '诊区收费窗口或诊室门口的结算机',
    needs: '医生开完单子再去，凭证一刷，自付部分才需要自己掏钱',
  },
  {
    id: 'remote',
    name: '异地就医备案',
    hint: '去别的城市看病前先在网上备案，报销比例才不降',
    where: '手机App里的“异地就医”页面',
    needs: '要填就医城市和定点医院，一般当天或次日生效',
    tag: '提前办',
  },
]

export const INSURED_USERS: InsuredUser[] = [
  {
    id: 'self',
    name: '张淑芬（虚构）',
    relation: '本人',
    cardTail: '尾号 4471',
    insuredPlace: '模拟市职工医保',
    personal: 1286.4,
    usedThisYear: 342.0,
    note: '这是您自己的账户，余额可以从个人账户里扣',
  },
  {
    id: 'spouse',
    name: '李长顺（虚构）',
    relation: '老伴 · 已绑定亲情账户',
    cardTail: '尾号 8802',
    insuredPlace: '模拟市居民医保',
    personal: 0,
    usedThisYear: 156.5,
    note: '亲情账户：您可以帮他出示凭证，但钱从他自己的账户算',
  },
  {
    id: 'mother',
    name: '王桂兰（虚构）',
    relation: '母亲 · 已绑定亲情账户',
    cardTail: '尾号 3109',
    insuredPlace: '县城居民医保',
    personal: 0,
    usedThisYear: 980.0,
    note: '老人不会用手机时，子女可以代出示；就医时要带本人身份证',
  },
  {
    id: 'neighbour',
    name: '邻居老姐姐（虚构）',
    relation: '未绑定，不能代办',
    cardTail: '—',
    insuredPlace: '—',
    personal: 0,
    usedThisYear: 0,
    note: '医保凭证只能本人或已绑定的家人使用，借给别人刷是违规的',
    unavailable: true,
  },
]

function hash(text: string): number {
  let value = 0
  for (let index = 0; index < text.length; index += 1) {
    value = (value * 31 + text.charCodeAt(index)) >>> 0
  }
  return value
}

export function yuan(value: number): string {
  return `${value.toFixed(2)} 元`
}

export function findScene(id: SceneId | null): Scene | undefined {
  return SCENES.find((item) => item.id === id)
}

export function findUser(id: string | null): InsuredUser | undefined {
  return INSURED_USERS.find((item) => item.id === id)
}

export function usableUsers(): InsuredUser[] {
  return INSURED_USERS.filter((item) => !item.unavailable)
}

/** 使用记录：同一个账户每次查到的结果一致，方便反复讲解。 */
export function recordsFor(userId: string | null): UseRecord[] {
  const user = findUser(userId)
  if (!user) return []
  const seed = hash(`record|${userId}`)
  const places = ['市人民医院门诊', '健康路大药房', '社区卫生服务中心', '康民药店']
  const kinds = ['门诊挂号', '买药', '检查费', '买药']
  const results: UseRecord['result'][] = ['已结算', '已报销', '已结算', '待结算']
  return [0, 1, 2].map((offset) => {
    const index = (seed + offset * 7) % places.length
    const day = 3 + ((seed >> (offset + 2)) % 24)
    const amount = Math.round(((seed >> (offset * 3)) % 380 + 18) * 10) / 10
    return {
      date: `11月${day}日`,
      place: places[index],
      kind: kinds[index],
      amount,
      result: results[index],
    }
  })
}

/** 六位验证码：练习里直接显示在屏幕上，用来练“自己看短信，不念给别人”。 */
export function makeSmsCode(): string {
  return `${100000 + Math.floor(Math.random() * 900000)}`
}

export function evidenceCode(userId: string, sceneId: string): string {
  const seed = hash(`evidence|${userId}|${sceneId}`)
  return `H32${`${seed % 100000000}`.padStart(8, '0')}`
}

/** 伪二维码：由凭证码确定性地生成方块，只用于展示版式。 */
export function qrMatrix(text: string, size = 21): boolean[][] {
  let state = hash(text) || 1
  const next = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state
  }
  const grid: boolean[][] = []
  for (let row = 0; row < size; row += 1) {
    const line: boolean[] = []
    for (let col = 0; col < size; col += 1) {
      line.push(next() % 100 < 46)
    }
    grid.push(line)
  }
  const finder = (top: number, left: number) => {
    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 7; col += 1) {
        const edge = row === 0 || row === 6 || col === 0 || col === 6
        const core = row >= 2 && row <= 4 && col >= 2 && col <= 4
        grid[top + row][left + col] = edge || core
      }
    }
    for (let row = -1; row <= 7; row += 1) {
      for (let col = -1; col <= 7; col += 1) {
        if (row === -1 || row === 7 || col === -1 || col === 7) {
          const r = top + row
          const c = left + col
          if (r >= 0 && c >= 0 && r < size && c < size) grid[r][c] = false
        }
      }
    }
  }
  finder(0, 0)
  finder(0, size - 7)
  finder(size - 7, 0)
  return grid
}
