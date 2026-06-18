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

function getButtonColor(value: number, isSelected: boolean): string {
  if (!isSelected) {
    return "bg-white/15 hover:bg-white/30 border-2 border-white/20"
  }
  if (value <= 2) return "bg-[#88619a] border-2 border-[#a87bbe] shadow-lg shadow-[#88619a]/40"
  if (value === 3) return "bg-white/30 border-2 border-white/40"
  return "bg-[#33a474] border-2 border-[#4cc493] shadow-lg shadow-[#33a474]/40"
}

export function QuestionCard({
  question,
  selectedValue,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className="animate-fade-in-scale">
      <p className="text-xl sm:text-2xl font-semibold text-white text-center mb-10 leading-relaxed px-2">
        {question.text}
      </p>

      <div className="flex items-center justify-between gap-1 sm:gap-2 mb-4 px-2">
        <span className="text-xs sm:text-sm font-medium text-[#c4a8d8] shrink-0 w-16 sm:w-20 text-center">
          同意しない
        </span>
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {SCALE_OPTIONS.map((option) => {
            const isSelected = selectedValue === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className={`${option.size} rounded-full transition-all duration-200 active:scale-90 ${getButtonColor(
                  option.value,
                  isSelected
                )}`}
              />
            )
          })}
        </div>
        <span className="text-xs sm:text-sm font-medium text-[#6dd4a8] shrink-0 w-16 sm:w-20 text-center">
          同意する
        </span>
      </div>
    </div>
  )
}
