import { useEffect, useRef } from 'react'
import {
  useSettings,
  type ContrastLevel,
  type FontLevel,
  type SpeechRate,
} from '../settings/SettingsContext'
import { CheckIcon, SettingsIcon } from './icons'
import { speechSupported } from '../speech/speechReader'

const FONT_OPTIONS: { value: FontLevel; label: string; hint: string }[] = [
  { value: 'standard', label: '标准', hint: '默认大小' },
  { value: 'large', label: '大字', hint: '放大一档' },
  { value: 'xl', label: '超大字', hint: '放大两档' },
]

const CONTRAST_OPTIONS: { value: ContrastLevel; label: string; hint: string }[] = [
  { value: 'standard', label: '标准', hint: '柔和蓝绿' },
  { value: 'high', label: '高对比度', hint: '文字边框更清楚' },
]

const RATE_OPTIONS: { value: SpeechRate; label: string; hint: string }[] = [
  { value: 'slow', label: '慢', hint: '听得更清楚' },
  { value: 'normal', label: '标准', hint: '默认语速' },
  { value: 'fast', label: '稍快', hint: '节省时间' },
]

type OptionButtonProps = {
  id: string
  label: string
  hint: string
  selected: boolean
  onSelect: () => void
}

function OptionButton({ id, label, hint, selected, onSelect }: OptionButtonProps) {
  return (
    <button
      type="button"
      id={id}
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex min-h-[64px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl border-2 px-2 py-2 text-lg font-semibold transition-colors ${
        selected
          ? 'border-brand-700 bg-brand-700 text-white'
          : 'border-brand-200 bg-white text-ink-soft hover:bg-brand-50'
      }`}
    >
      <span className="flex items-center gap-1.5">
        {selected ? (
          <span className="h-5 w-5 shrink-0">
            <CheckIcon />
          </span>
        ) : null}
        {label}
      </span>
      <span className={`text-sm font-normal leading-snug ${selected ? 'text-brand-100' : 'text-ink-muted'}`}>
        {hint}
      </span>
    </button>
  )
}

type SwitchRowProps = {
  id: string
  label: string
  note: string
  checked: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}

function SwitchRow({ id, label, note, checked, onChange, disabled = false }: SwitchRowProps) {
  return (
    <div className="mt-2 rounded-2xl border-2 border-brand-100 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span id={`${id}-label`} className="text-lg font-semibold">
          {label}
        </span>
        <button
          type="button"
          id={id}
          role="switch"
          aria-checked={checked}
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-note`}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className="flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border-2 border-brand-200 px-3 text-base font-semibold text-ink-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span
            aria-hidden="true"
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              checked ? 'bg-lagoon-600' : 'bg-brand-100'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                checked ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </span>
          {checked ? '已开启' : '已关闭'}
        </button>
      </div>
      <p id={`${id}-note`} className="mt-1.5 text-base leading-relaxed text-ink-muted">
        {note}
      </p>
    </div>
  )
}

export default function SettingsPanel() {
  const {
    settings,
    setFont,
    setContrast,
    setReduceMotion,
    setSimple,
    setGuided,
    setVoiceGuide,
    setSpeechRate,
    setProactive,
    reset,
    open,
    setOpen,
    canPersist,
    systemReducedMotion,
  } = useSettings()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="settings-title"
      aria-describedby="settings-note"
      onCancel={(event) => {
        event.preventDefault()
        setOpen(false)
      }}
      onClose={() => setOpen(false)}
      className="settings-dialog phone-scroll w-[min(92vw,29rem)] rounded-3xl border-2 border-brand-200 bg-white p-5 text-ink shadow-card sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="settings-title" className="flex items-center gap-2 text-2xl font-bold">
          <span className="h-7 w-7 shrink-0 text-brand-600">
            <SettingsIcon />
          </span>
          显示与辅助设置
        </h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn btn-ghost min-h-[44px] shrink-0 px-4 text-lg"
        >
          关闭
        </button>
      </div>

      <h3 className="mt-4 flex items-center gap-2 text-xl font-bold text-brand-800">阅读</h3>

      <div role="group" aria-label="字号大小" className="mt-2">
        <p className="text-lg font-semibold">字号大小</p>
        <div className="mt-2 flex gap-2">
          {FONT_OPTIONS.map((option) => (
            <OptionButton
              key={option.value}
              id={`font-${option.value}`}
              label={option.label}
              hint={option.hint}
              selected={settings.font === option.value}
              onSelect={() => setFont(option.value)}
            />
          ))}
        </div>
      </div>

      <div role="group" aria-label="对比度" className="mt-4">
        <p className="text-lg font-semibold">对比度</p>
        <div className="mt-2 flex gap-2">
          {CONTRAST_OPTIONS.map((option) => (
            <OptionButton
              key={option.value}
              id={`contrast-${option.value}`}
              label={option.label}
              hint={option.hint}
              selected={settings.contrast === option.value}
              onSelect={() => setContrast(option.value)}
            />
          ))}
        </div>
      </div>

      <SwitchRow
        id="simple-switch"
        label="简洁模式"
        note="只保留当前要做的事，收起地址等次要信息；纠错提醒和安全说明不会被收起。"
        checked={settings.simple}
        onChange={setSimple}
      />

      <h3 className="mt-5 text-xl font-bold text-brand-800">操作</h3>

      <SwitchRow
        id="guided-switch"
        label="逐步操作模式"
        note="把每一步拆成更小的动作，桥桥逐条带您做；熟练后可以关掉。"
        checked={settings.guided}
        onChange={setGuided}
      />

      <SwitchRow
        id="proactive-switch"
        label="桥桥主动提示"
        note="停在一页太久，或同一步连续出错时，桥桥会主动问一句，不会打断操作。"
        checked={settings.proactive}
        onChange={setProactive}
      />

      <h3 className="mt-5 text-xl font-bold text-brand-800">语音</h3>

      <SwitchRow
        id="voice-switch"
        label="语音引导"
        note={
          speechSupported
            ? '朗读主要给视力障碍用户使用：进入首页和每一步都会自动朗读，任何页面都能随时关闭。'
            : '这个浏览器不支持语音朗读。可以用大字和高对比度设置，或换用 Chrome / Edge 浏览器。'
        }
        checked={speechSupported ? settings.voiceGuide : false}
        onChange={setVoiceGuide}
        disabled={!speechSupported}
      />

      {speechSupported ? (
        <div role="group" aria-label="朗读速度" className="mt-3">
          <p className="text-lg font-semibold">朗读速度</p>
          <div className="mt-2 flex gap-2">
            {RATE_OPTIONS.map((option) => (
              <OptionButton
                key={option.value}
                id={`voice-rate-${option.value}`}
                label={option.label}
                hint={option.hint}
                selected={settings.speechRate === option.value}
                onSelect={() => setSpeechRate(option.value)}
              />
            ))}
          </div>
        </div>
      ) : null}

      <h3 className="mt-5 text-xl font-bold text-brand-800">动画</h3>

      <SwitchRow
        id="motion-switch"
        label="减少动画"
        note={
          systemReducedMotion
            ? '您的系统已开启“减少动态效果”，本站自动跟随；开关仍可单独控制。'
            : '开启后关闭飘动、渐变等装饰动画，不影响任何操作。'
        }
        checked={settings.reduceMotion}
        onChange={setReduceMotion}
      />

      <p className="mt-4 rounded-2xl border-2 border-lagoon-200 bg-lagoon-50 px-4 py-3 text-lg leading-relaxed text-lagoon-900">
        预览：请先选择医院，再点“下一步”。
      </p>

      <p id="settings-note" className="mt-3 text-base leading-relaxed text-ink-muted">
        {canPersist
          ? '设置只保存在这台设备的浏览器里，不会上传；刷新或下次打开仍然有效。'
          : '当前浏览器不允许保存设置：本次打开期间设置仍然有效，关闭后不会保留。'}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          id="settings-reset"
          onClick={reset}
          className="btn btn-secondary min-h-[52px] min-w-0 flex-1 px-4 text-lg"
        >
          恢复默认设置
        </button>
        <button
          type="button"
          id="settings-done"
          onClick={() => setOpen(false)}
          className="btn btn-primary min-h-[52px] min-w-0 flex-1 px-4 text-lg"
        >
          完成
        </button>
      </div>
    </dialog>
  )
}