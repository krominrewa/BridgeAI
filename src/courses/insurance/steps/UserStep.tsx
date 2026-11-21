import { INSURED_USERS } from '../../../data/insurance'
import { IdCardIcon, UserIcon } from '../../../components/icons'
import NoteCard from '../../../components/simulation/NoteCard'
import OptionGroup from '../../../components/simulation/OptionGroup'
import StepHeading from '../../../components/simulation/StepHeading'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import type { ExtraAction, FlowState } from '../state'

export default function UserStep({ state, dispatch }: CourseStepProps<FlowState, ExtraAction>) {
  return (
    <>
      <StepHeading title="这次给谁用" hint="给自己用就点“本人”；帮家人代办，点已经绑定的家人。" />
      <OptionGroup
        options={INSURED_USERS.map((user) => ({
          id: user.id,
          title: user.name,
          description: user.note,
          meta: `${user.relation} · ${user.cardTail} · ${user.insuredPlace}`,
          icon: user.relation === '本人' ? <IdCardIcon /> : <UserIcon />,
          unavailable: user.unavailable,
          tag: user.relation === '本人' ? { text: '常用', tone: 'brand' } : user.unavailable ? { text: '不能代办', tone: 'amber' } : undefined,
        }))}
        selectedId={state.userId}
        onSelect={(id) => dispatch({ type: 'select', field: 'userId', value: id })}
        onUnavailable={(id) => dispatch({ type: 'blocked', id })}
      />
      <NoteCard
        tone="brand"
        title="“亲情账户”是什么"
        text="家人之间先在App里做一次绑定（要身份证和关系证明），绑上以后就能替不会用手机的老人、小孩出示凭证。注意：只是替他们操作，钱还是从他们自己的账户扣；没有绑定的人不能代刷，把自己的凭证给别人用也不合规。"
      />
    </>
  )
}
