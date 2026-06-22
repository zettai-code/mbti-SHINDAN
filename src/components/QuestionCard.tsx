import type { Question } from "@/types"

interface QuestionCardProps {
  readonly question: Question
  readonly selectedValue: number | undefined
  readonly onSelect: (value: number) => void
}

const SCALE_OPTIONS = [
  { value: 1, size: "w-12 h-12 sm:w-14 sm:h-14" },
  { value: 2, size: "w-10 h-10 sm:w-11 sm:h-11" },
  { value: 3, size: "w-8 h-8 sm:w-9 sm:h-9" },
  { value: 4, size: "w-10 h-10 sm:w-11 sm:h-11" },
  { value: 5, size: "w-12 h-12 sm:w-14 sm:h-14" },
] as const

function getButtonStyle(value: number, isSelected: boolean): string {
  const base = "border-2 transition-all duration-200"
  if (!isSelected) {
    return `${base} bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100`
  }
  if (value <= 2) return `${base} bg-[#7c5e99] border-[#7c5e99] shadow-lg shadow-[#7c5e99]/20`
  if (value === 3) return `${base} bg-gray-300 border-gray-300`
  return `${base} bg-[#33a474] border-[#33a474] shadow-lg shadow-[#33a474]/20`
}

export function QuestionCard({
  question,
  selectedValue,
  onSelect,
}: QuestionCardProps) {
  const buttons = SCALE_OPTIONS.map((option) => {
    const isSelected = selectedValue === option.value
    return (
      <button
        key={option.value}
        type="button"
        onClick={() => onSelect(option.value)}
        aria-label={`同意度 ${option.value}`}
        aria-pressed={isSelected}
        className={`${option.size} rounded-full active:scale-90 ${getButtonStyle(
          option.value,
          isSelected
        )}`}
      />
    )
  })

  return (
    <div className="animate-fade-in-scale">
      <p className="text-lg sm:text-2xl font-bold text-gray-800 text-center mb-8 sm:mb-10 leading-relaxed">
        {question.text}
      </p>

      {/* Mobile: circles row + labels below */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between">{buttons}</div>
        <div className="flex items-center justify-between mt-3 px-0.5">
          <span className="text-xs font-medium text-[#7c5e99]">同意しない</span>
          <span className="text-xs font-medium text-[#33a474]">同意する</span>
        </div>
      </div>

      {/* Desktop: labels on the sides */}
      <div className="hidden sm:flex items-center justify-between gap-2 px-2">
        <span className="text-sm font-medium text-[#7c5e99] shrink-0 w-20 text-center">
          同意しない
        </span>
        <div className="flex items-center justify-center gap-3">{buttons}</div>
        <span className="text-sm font-medium text-[#33a474] shrink-0 w-20 text-center">
          同意する
        </span>
      </div>
    </div>
  )
}
