"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ProgressBar } from "@/components/ProgressBar"
import { QuestionCard } from "@/components/QuestionCard"
import type { Question } from "@/types"
import questionsData from "@/data/questions.json"

const questions = questionsData as Question[]

export default function DiagnosisPage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})

  const currentQuestion = questions[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === questions.length - 1
  const answeredCount = Object.keys(answers).length

  const handleSelect = useCallback(
    (value: number) => {
      const newAnswers = { ...answers, [currentQuestion.id]: value }
      setAnswers(newAnswers)

      if (isLast) return

      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
      }, 200)
    },
    [answers, currentQuestion.id, isLast]
  )

  const handlePrev = useCallback(() => {
    if (!isFirst) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [isFirst])

  const handleSubmit = useCallback(() => {
    if (answeredCount < questions.length) return
    const encoded = btoa(JSON.stringify(answers))
    router.push(`/result?d=${encodeURIComponent(encoded)}`)
  }, [answers, answeredCount, router])

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <ProgressBar current={answeredCount} total={questions.length} />

      <div className="mt-6">
        <QuestionCard
          question={currentQuestion}
          selectedValue={answers[currentQuestion.id]}
          onSelect={handleSelect}
        />
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={handlePrev}
          disabled={isFirst}
          className="px-6 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
        >
          戻る
        </button>

        {isLast && answers[currentQuestion.id] !== undefined ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={answeredCount < questions.length}
            className="px-6 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            結果を見る
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))}
            disabled={answers[currentQuestion.id] === undefined}
            className="px-6 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
          >
            次へ
          </button>
        )}
      </div>
    </div>
  )
}
