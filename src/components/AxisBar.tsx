import type { AxisResult } from "@/lib/diagnosis"

interface AxisBarProps {
  readonly data: AxisResult
}

export function AxisBar({ data }: AxisBarProps) {
  const total = data.left.score + data.right.score
  const leftPercent = total > 0 ? Math.round((data.left.score / total) * 100) : 50

  return (
    <div className="mb-4">
      <p className="text-xs text-gray-500 mb-1">{data.axis}</p>
      <div className="flex items-center gap-2 text-sm">
        <span
          className={`w-16 text-right font-medium ${
            leftPercent >= 50 ? "text-indigo-600" : "text-gray-400"
          }`}
        >
          {data.left.label}
        </span>
        <div className="flex-1 flex h-3 rounded-full overflow-hidden bg-gray-200">
          <div
            className="bg-indigo-500 transition-all duration-500"
            style={{ width: `${leftPercent}%` }}
          />
          <div
            className="bg-pink-400 transition-all duration-500"
            style={{ width: `${100 - leftPercent}%` }}
          />
        </div>
        <span
          className={`w-16 font-medium ${
            leftPercent < 50 ? "text-pink-500" : "text-gray-400"
          }`}
        >
          {data.right.label}
        </span>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-0.5 px-18">
        <span>{leftPercent}%</span>
        <span>{100 - leftPercent}%</span>
      </div>
    </div>
  )
}
