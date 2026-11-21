import { useMemo } from 'react'
import { qrMatrix } from '../../data/insurance'

type QrCardProps = {
  code: string
  holder: string
  scene: string
}

const CELL = 8

/** 仿真的医保凭证二维码：方块由凭证码确定性生成，只用于练习展示。 */
export default function QrCard({ code, holder, scene }: QrCardProps) {
  const matrix = useMemo(() => qrMatrix(code), [code])
  const size = matrix.length

  return (
    <div className="mt-4 overflow-hidden rounded-3xl border-2 border-brand-200 bg-white">
      <p className="bg-brand-600 px-4 py-2 text-base font-bold text-white">医保电子凭证（模拟）</p>
      <div className="flex flex-col items-center px-4 py-4">
        <svg
          viewBox={`0 0 ${size * CELL} ${size * CELL}`}
          width="176"
          height="176"
          role="img"
          aria-label={`模拟二维码，凭证编号 ${code}`}
          className="rounded-xl bg-white"
        >
          {matrix.map((row, rowIndex) =>
            row.map((filled, colIndex) =>
              filled ? (
                <rect
                  key={`${rowIndex}-${colIndex}`}
                  x={colIndex * CELL}
                  y={rowIndex * CELL}
                  width={CELL}
                  height={CELL}
                  fill="#0f2338"
                />
              ) : null,
            ),
          )}
        </svg>
        <p className="mt-3 text-center text-lg font-bold text-ink">{holder}</p>
        <p className="mt-0.5 text-center text-base text-ink-soft">用于：{scene}</p>
        <p className="mt-2 rounded-full bg-paper px-3 py-1 text-base font-medium tracking-wide text-ink-soft">{code}</p>
        <p className="mt-3 text-center text-sm leading-relaxed text-ink-muted">
          真机上这个码每 60 秒自动换一次，别人截走的图很快就用不了。出示时把屏幕对着扫描口。
        </p>
      </div>
    </div>
  )
}
