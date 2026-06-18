interface ProgressBarProps {
  readonly current: number
  readonly total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100)

  return (
    <div className="w-full">
      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#4298b4] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>{current} / {total}</span>
        <span>{percentage}%</span>
      </div>
    </div>
  )
}
