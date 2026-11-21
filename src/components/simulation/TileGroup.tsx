import { CheckIcon } from '../icons'

export type Tile = {
  id: string
  /** 主文字，例如“明天”。 */
  title: string
  /** 次要文字，例如“11月22日”。 */
  subtitle?: string
  /** 未选中时补充说明，例如星期几。 */
  note?: string
}

type TileGroupProps = {
  tiles: Tile[]
  selectedId: string | null
  onSelect: (id: string) => void
  /** 一行放几个，默认 3 个。 */
  columns?: 2 | 3 | 4
}

/** 日期、金额这类短选项用小方块并排，比长列表一眼看得清。 */
export default function TileGroup({ tiles, selectedId, onSelect, columns = 3 }: TileGroupProps) {
  const gridCols = columns === 2 ? 'grid-cols-2' : columns === 4 ? 'grid-cols-4' : 'grid-cols-3'

  return (
    <div className={`mt-3 grid gap-2 ${gridCols}`} data-choice-group="tiles">
      {tiles.map((tile) => {
        const selected = tile.id === selectedId
        return (
          <button
            key={tile.id}
            type="button"
            onClick={() => onSelect(tile.id)}
            aria-pressed={selected}
            className={`flex min-h-[92px] w-full flex-col items-center justify-center gap-0.5 rounded-2xl border-2 px-1 py-2 text-center transition-all duration-150 ${
              selected
                ? 'border-brand-600 bg-brand-50 shadow-card'
                : 'border-brand-100 bg-white hover:border-brand-400 hover:shadow-card active:scale-[0.99]'
            }`}
          >
            <span className="text-xl font-bold leading-tight text-ink">{tile.title}</span>
            {tile.subtitle ? <span className="text-base leading-tight text-ink-soft">{tile.subtitle}</span> : null}
            {selected ? (
              <span className="flex items-center gap-1 text-base font-bold leading-tight text-brand-700">
                <span className="h-4 w-4">
                  <CheckIcon />
                </span>
                已选择
              </span>
            ) : (
              <span className="text-base leading-tight text-ink-muted">{tile.note}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
