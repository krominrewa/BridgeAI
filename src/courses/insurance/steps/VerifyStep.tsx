import { FaceIcon, LockIcon, PhoneIcon } from '../../../components/icons'
import NoteCard from '../../../components/simulation/NoteCard'
import OptionGroup, { GroupTitle } from '../../../components/simulation/OptionGroup'
import StepHeading from '../../../components/simulation/StepHeading'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import { isVerified, type ExtraAction, type FlowState } from '../state'

const METHODS = [
  { id: 'sms', name: '短信验证码', hint: '手机收到 6 位数字，自己填进去', icon: <PhoneIcon /> },
  { id: 'face', name: '刷脸', hint: '对着摄像头，按提示眨眨眼', icon: <FaceIcon /> },
]

export default function VerifyStep({ state, dispatch }: CourseStepProps<FlowState, ExtraAction>) {
  const sms = state.verifyMethod === 'sms'
  const ok = isVerified(state)

  return (
    <>
      <StepHeading title="验证身份" hint="医保要用您的钱，所以要先确认是您本人。这一步最要紧，慢慢来。" />

      <OptionGroup
        index={1}
        text="选一种验证方式"
        options={METHODS.map((item) => ({
          id: item.id,
          title: item.name,
          description: item.hint,
          icon: item.icon,
        }))}
        selectedId={state.verifyMethod}
        onSelect={(id) => dispatch({ type: 'select', field: 'verifyMethod', value: id })}
      />

      {sms ? (
        <>
          <GroupTitle index={2} text="获取验证码" />
          {state.sentCode ? (
            <div className="mt-3 rounded-2xl border-2 border-brand-200 bg-white px-4 py-3">
              <p className="text-sm text-ink-muted">【模拟短信】桥桥保险</p>
              <p className="mt-1 text-lg leading-relaxed text-ink">
                您的医保电子凭证验证码是 <span id="sms-code" className="text-2xl font-bold tracking-widest text-brand-700">{state.sentCode}</span>
                ，5 分钟内有效，请勿告知他人。
              </p>
              <button
                type="button"
                className="btn btn-ghost mt-3 min-h-[48px] px-3 text-base"
                onClick={() => dispatch({ type: 'sendCode' })}
              >
                换一条（重新获取）
              </button>
            </div>
          ) : (
            <button
              type="button"
              id="send-code"
              className="btn btn-primary mt-3 min-h-[64px] w-full text-xl"
              onClick={() => dispatch({ type: 'sendCode' })}
            >
              获取验证码
            </button>
          )}

          <GroupTitle index={3} text="把 6 位数字填进去" />
          <div className="mt-3 flex items-center gap-3">
            <input
              id="code-input"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              value={state.code}
              onChange={(event) => dispatch({ type: 'inputCode', value: event.target.value })}
              placeholder="000000"
              aria-label="验证码，6 位数字"
              className="min-h-[64px] w-44 rounded-2xl border-2 border-brand-300 bg-white px-4 text-center text-3xl font-bold tracking-widest text-ink"
            />
            <button
              type="button"
              className="btn btn-secondary min-h-[56px] px-4 text-lg"
              onClick={() => dispatch({ type: 'inputCode', value: '' })}
            >
              清空
            </button>
          </div>
          <p className={`mt-2 text-lg font-bold ${ok ? 'text-lagoon-700' : 'text-ink-muted'}`} role="status">
            {ok
              ? '验证码正确，可以点“下一步”了。'
              : state.code.length === 6
                ? '这一串和短信上的数字不一样，再对一遍。'
                : state.sentCode
                  ? '还差几位，照着上面那条短信输完。'
                  : '先点“获取验证码”，再填数字。'}
          </p>
        </>
      ) : null}

      {state.verifyMethod === 'face' ? (
        <>
          <GroupTitle index={2} text="把脸对准框子" />
          <div
            className={`mx-auto mt-4 flex h-44 w-44 items-center justify-center rounded-full border-4 ${
              ok ? 'border-lagoon-500 bg-lagoon-50 text-lagoon-700' : 'border-dashed border-brand-300 bg-paper text-brand-300'
            }`}
            aria-hidden="true"
          >
            <span className="h-20 w-20">
              <FaceIcon />
            </span>
          </div>
          <button
            type="button"
            className={`btn mt-4 min-h-[64px] w-full text-xl ${ok ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => dispatch({ type: 'face' })}
          >
            {ok ? '再刷一次' : '开始刷脸'}
          </button>
          <p className={`mt-2 text-lg font-bold ${ok ? 'text-lagoon-700' : 'text-ink-muted'}`} role="status">
            {ok ? '刷脸通过（练习不会真的采集影像），点“下一步”。' : '光线亮一点、别戴帽子和口罩，通过率更高。'}
          </p>
        </>
      ) : null}

      <NoteCard
        tone="amber"
        title="验证码谁都不能给"
        text="验证码就等于您的医保账户钥匙。自称医保局、社保中心、银行、公安的人打电话来要验证码、要密码、让您把二维码截图发过去，全是骗子。真有事请挂断电话，让家人陪您去窗口或打官方电话核实。"
      />
      <p className="mt-3 flex items-start gap-2 text-base leading-relaxed text-ink-muted">
        <span className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true">
          <LockIcon />
        </span>
        练习中的验证码直接显示在屏幕上，不会给任何真实手机发短信。
      </p>
    </>
  )
}
