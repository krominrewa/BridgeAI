import type { ReactNode } from 'react'
import { SCENES, type SceneId } from '../../../data/insurance'
import { HospitalIcon, MedicalIcon, PinIcon, TicketIcon } from '../../../components/icons'
import NoteCard from '../../../components/simulation/NoteCard'
import OptionGroup from '../../../components/simulation/OptionGroup'
import StepHeading from '../../../components/simulation/StepHeading'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import type { ExtraAction, FlowState } from '../state'

const SCENE_ICONS: Record<SceneId, ReactNode> = {
  register: <HospitalIcon />,
  pharmacy: <MedicalIcon />,
  settle: <TicketIcon />,
  remote: <PinIcon />,
}

export default function SceneStep({ state, dispatch }: CourseStepProps<FlowState, ExtraAction>) {
  const scene = SCENES.find((item) => item.id === state.sceneId)
  return (
    <>
      <StepHeading title="这次要做什么" hint="点一个场景，App 会带您走到对应的页面。" />
      <OptionGroup
        options={SCENES.map((item) => ({
          id: item.id,
          title: item.name,
          description: item.hint,
          meta: `在${item.where}出示`,
          icon: SCENE_ICONS[item.id],
          tag: item.tag ? { text: item.tag, tone: item.id === 'remote' ? 'amber' : 'lagoon' } : undefined,
        }))}
        selectedId={state.sceneId}
        onSelect={(id) => dispatch({ type: 'select', field: 'sceneId', value: id })}
      />
      <NoteCard
        tone="brand"
        title={scene ? `“${scene.name}”怎么操作` : '选完再看'}
        text={
          scene
            ? `${scene.needs}。出示时把手机屏幕上的二维码对着扫描口，听到“滴”一声就好；扫不上可以让窗口工作人员帮忙。`
            : '不同的场景在App里进的是不同页面，但出示的都是同一个二维码。第一次练建议选“药店买药”。'
        }
      />
    </>
  )
}
