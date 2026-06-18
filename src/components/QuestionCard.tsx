import type { Question } from "@/types"

interface QuestionCardProps {
  readonly question: Question
  readonly selectedValue: number | undefined
  readonly onSelect: (value: number) => void
}

const LABELS = [
  "全く当てはまらない",
  "あまり当てはまらない",
  "どちらでもない",
  "やや当てはまる",
  "とても当てはまる",
] as const

export function QuestionCard({
  question,
  selectedValue,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <p className="text-base font-medium text-gray-800 mb-6 leading-relaxed">
        Q{question.id}. {question.text}
      </p>
      <div className="flex flex-col gap-2">
        {LABELS.map((label, index) => {
          const value = index + 1
          const isSelected = selectedValue === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect(value)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                isSelected
                  ? "bg-indigo-500 text-white shadow-md"
                  : "bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
