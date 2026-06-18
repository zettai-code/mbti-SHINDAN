import type { AxisResult } from "@/lib/diagnosis"

interface AxisBarProps {
  readonly data: AxisResult
}

export function AxisBar({ data }: AxisBarProps) {
  const total = data.left.score + data.right.score
  const leftPercent = total > 0 ? Math.round((data.left.score / total) * 100) : 50
  const rightPercent = 100 - leftPercent

  return (
    <div className="mb-5 last:mb-0">
      <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
        {data.axis}
      </p>
      <div className="flex items-center gap-3">
        <div className="w-20 text-right">
          <span
            className={`text-sm font-bold ${
              leftPercent >= 50 ? "text-[#4298b4]" : "text-gray-300"
            }`}
          >
            {data.left.label}
          </span>
          <span className="block text-xs text-gray-400">{leftPercent}%</span>
        </div>
        <div className="flex-1 flex h-2.5 rounded-full overflow-hidden bg-gray-100">
          <div
            className="bg-[#4298b4] rounded-l-full transition-all duration-700 ease-out"
            style={{ width: `${leftPercent}%` }}
          />
          <div
            className="bg-[#33a474] rounded-r-full transition-all duration-700 ease-out"
            style={{ width: `${rightPercent}%` }}
          />
        </div>
        <div className="w-20">
          <span
            className={`text-sm font-bold ${
              rightPercent > 50 ? "text-[#33a474]" : "text-gray-300"
            }`}
          >
            {data.right.label}
          </span>
          <span className="block text-xs text-gray-400">{rightPercent}%</span>
        </div>
      </div>
    </div>
  )
}
