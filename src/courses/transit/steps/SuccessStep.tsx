import { findDestination, findMode, routesFor, yuan } from '../../../data/transit'
import { ShareIcon } from '../../../components/icons'
import NoteCard from '../../../components/simulation/NoteCard'
import SuccessHeading from '../../../components/simulation/SuccessHeading'
import SummaryCard from '../../../components/simulation/SummaryCard'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import type { ExtraAction, FlowState } from '../state'
import { plateInfo, summaryRows } from '../summary'

export default function SuccessStep({ state }: CourseStepProps<FlowState, ExtraAction>) {
  const bus = findMode(state.mode)?.id === 'bus'
  const info = plateInfo(state)
  const route = routesFor(state.destinationId).find((item) => item.id === state.routeId)
  const destination = findDestination(state.destinationId)

  return (
    <>
      {bus ? (
        <SuccessHeading title="行程已生成" lead="您学会了查公交、认线路，做得很好！" />
      ) : (
        <SuccessHeading title="叫车成功" lead="您完整走完了一次打车流程，做得很好！" />
      )}

      <div className="mt-4 overflow-hidden rounded-3xl border-2 border-brand-200 bg-white">
        <p className={`px-4 py-2 text-base font-bold ${bus ? 'bg-lagoon-50 text-lagoon-800' : 'bg-brand-600 text-white'}`}>
          {bus ? '乘车提醒（模拟）' : '司机接单了（模拟）'}
        </p>
        <div className="px-4 py-3">
          {bus ? (
            <>
              <p className="text-xl font-bold text-ink">{route ? `${route.name} · ${route.board} 上车` : '您的行程'}</p>
              <p className="mt-1 text-base text-ink-soft">
                {route ? `${route.alight} 下车，约 ${route.minutes} 分钟、${yuan(route.price)}。` : ''}
                行程号 {info.code}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-ink-muted">车牌号 · 上车前请核对</p>
              <p className="text-3xl font-bold tracking-wider text-ink">{info.plate}</p>
              <p className="mt-2 text-lg text-ink-soft">
                {info.driver} · 评分 {info.rating}
              </p>
              <p className="mt-1 text-base text-ink-muted">
                行程号 {info.code} · 去{destination?.name ?? '目的地'}
              </p>
            </>
          )}
        </div>
      </div>

      {bus ? (
        <NoteCard
          tone="brand"
          title="坐过站了怎么办"
          text="上车记两件事：听报站、看站牌数站数。真坐过站不要慌，下一站下车、换反方向的车坐回来即可。晚上或节假日，先看清首末班时间。"
        />
      ) : (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border-2 border-amber-400 bg-amber-50 px-4 py-3">
          <span className="mt-0.5 h-6 w-6 shrink-0 text-amber-900">
            <ShareIcon />
          </span>
          <p className="text-base leading-relaxed text-amber-900">
            <span className="mr-1 font-bold text-ink">上车前做两件事</span>
            一是对车牌：和屏幕上不一致就不要上车，可以取消重叫。二是用App里的“行程分享”，把实时位置发给家人，晚上或身体不舒服时尤其有用。
          </p>
        </div>
      )}

      <SummaryCard rows={summaryRows(state)} title="模拟行程单" />

      <p className="mt-4 text-base leading-relaxed text-ink-muted">
        这一单是练习生成的模拟数据：不会真的派车，也不会扣钱，不会有陌生人联系您。
      </p>
    </>
  )
}
