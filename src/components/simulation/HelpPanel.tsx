import { useEffect, useState } from 'react'
import { BridgeBuddy, RepeatIcon, SpeakerIcon, StopIcon } from '../icons'
import type { HelpRequest } from '../../simulation/helpRequest'
import { requestTeaching, teachingConfigured } from '../../simulation/teachingAssistant'
import { SPEECH_RATE_VALUES, useSettings } from '../../settings/SettingsContext'
import { getSpeechState, speak, speechSupported, stopSpeech, subscribeSpeechState } from '../../speech/speechReader'

type HelpPanelProps = {
  /** 本地规则生成的提示文字，始终先显示，AI 返回后替换。 */
  text: string
  payload: HelpRequest
  onDismiss: () => void
}

type AssistStatus = 'local' | 'loading' | 'ai' | 'failed'

const SOURCE_LABELS: Record<AssistStatus, string> = {
  local: '本地规则提示 · 不是实时 AI 回答',
  loading: '桥桥正在思考…',
  ai: 'AI 智能指导 · 教学助手生成',
  failed: '本地规则提示 · 智能助手暂不可用',
}

export default function HelpPanel({ text, payload, onDismiss }: HelpPanelProps) {
  const [assist, setAssist] = useState<{ status: AssistStatus; text: string }>({ status: 'local', text })
  const [speechState, setSpeechState] = useState(getSpeechState)
  const [speechTouched, setSpeechTouched] = useState(false)
  const { settings } = useSettings()
  const speechRate = SPEECH_RATE_VALUES[settings.speechRate]

  // 配置了安全代理时异步请求 AI 指导；失败自动回退本地规则，文字提示始终先显示
  useEffect(() => {
    if (!teachingConfigured) return
    let active = true
    setAssist({ status: 'loading', text })
    void requestTeaching(payload, text).then((result) => {
      if (!active) return
      if (result.source === 'ai') {
        stopSpeech()
        setAssist({ status: 'ai', text: result.text })
      } else {
        setAssist({ status: 'failed', text: result.text })
      }
    })
    return () => {
      active = false
    }
    // 面板按求助次数重新挂载，每次打开提示都基于最新状态请求一次
  }, [])

  useEffect(() => subscribeSpeechState(setSpeechState), [])

  // 关闭提示或切换步骤（面板卸载）时停止朗读，不让旧语音追着用户跑
  useEffect(() => () => stopSpeech(), [])

  const speaking = speechState === 'speaking'
  const displayedText = assist.text

  const handleToggle = () => {
    setSpeechTouched(true)
    if (speaking) stopSpeech()
    else speak(displayedText, speechRate)
  }

  const handleReplay = () => {
    setSpeechTouched(true)
    speak(displayedText, speechRate)
  }

  return (
    <div id="help-panel" role="status" className="mt-3 rounded-2xl border-2 border-lagoon-200 bg-lagoon-50 px-4 py-4">
      <div className="flex items-center gap-3">
        <span className="h-11 w-11 shrink-0">
          <BridgeBuddy />
        </span>
        <div className="min-w-0">
          <p className="text-lg font-bold leading-snug text-lagoon-800">桥桥来帮您</p>
          <p id="help-source" className="flex items-center gap-2 text-base leading-snug text-ink-soft">
            {assist.status === 'loading' ? (
              <span className="h-2.5 w-2.5 shrink-0 animate-pulse-soft rounded-full bg-lagoon-600" aria-hidden="true" />
            ) : null}
            {SOURCE_LABELS[assist.status]}
          </p>
        </div>
      </div>
      <p id="help-text" className="mt-3 text-lg leading-relaxed text-ink">
        {displayedText}
      </p>

      {speechSupported ? (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              id="speech-toggle"
              onClick={handleToggle}
              aria-label={speaking ? '停止朗读当前提示' : '朗读当前提示内容'}
              className="btn btn-help min-h-[52px] min-w-0 flex-1 basis-[9rem] px-3 text-lg"
            >
              <span className="h-6 w-6 shrink-0">{speaking ? <StopIcon /> : <SpeakerIcon />}</span>
              {speaking ? '停止朗读' : '读给我听'}
            </button>
            <button
              type="button"
              id="speech-replay"
              onClick={handleReplay}
              aria-label="从头重新朗读当前提示"
              className="btn btn-help min-h-[52px] min-w-0 flex-1 basis-[9rem] px-3 text-lg"
            >
              <span className="h-6 w-6 shrink-0">
                <RepeatIcon />
              </span>
              重新朗读
            </button>
          </div>
          {speaking ? (
            <p className="mt-2 flex items-center gap-2 text-base leading-snug text-lagoon-800">
              <span className="h-2.5 w-2.5 shrink-0 animate-pulse-soft rounded-full bg-lagoon-600" aria-hidden="true" />
              正在朗读，读完会自动停止
            </p>
          ) : null}
          <p id="speech-status" role="status" className="sr-only">
            {speechTouched ? (speaking ? '正在朗读提示内容' : '朗读已停止') : ''}
          </p>
        </>
      ) : (
        <p id="speech-unavailable" className="mt-3 text-base leading-snug text-ink-soft">
          这个浏览器不支持朗读，请阅读上面的文字提示。
        </p>
      )}

      <button type="button" onClick={onDismiss} className="btn btn-secondary mt-4 min-h-[52px] w-full text-lg">
        我明白了，继续操作
      </button>
    </div>
  )
}
