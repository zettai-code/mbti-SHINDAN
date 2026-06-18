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

      if (isLast && answeredCount + 1 >= questions.length) {
        setTimeout(() => {
          const encoded = btoa(JSON.stringify(newAnswers))
          router.push(`/result?d=${encodeURIComponent(encoded)}`)
        }, 400)
        return
      }

      setTimeout(() => {
        setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))
      }, 300)
    },
    [answers, currentQuestion.id, isLast, answeredCount, router]
  )

  const handlePrev = useCallback(() => {
    if (!isFirst) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [isFirst])

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#f8f8f8] flex flex-col">
      <div className="max-w-xl mx-auto w-full px-6 pt-6">
        <ProgressBar current={answeredCount} total={questions.length} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm p-8 sm:p-12" key={currentQuestion.id}>
          <QuestionCard
            question={currentQuestion}
            selectedValue={answers[currentQuestion.id]}
            onSelect={handleSelect}
          />
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={isFirst}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-0 disabled:cursor-default"
          >
            ← 戻る
          </button>
          <span className="text-xs text-gray-300">
            Q{currentQuestion.id} / {questions.length}
          </span>
        </div>
      </div>
    </div>
  )
}
