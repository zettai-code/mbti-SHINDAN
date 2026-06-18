"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
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
    <div className="min-h-screen bg-gradient-to-br from-[#5b4a8a] via-[#7c5e99] to-[#4a8a7a] flex flex-col">
      <Header variant="dark" />

      <div className="max-w-xl mx-auto w-full px-6 pt-4">
        <ProgressBar current={answeredCount} total={questions.length} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-xl" key={currentQuestion.id}>
          <QuestionCard
            question={currentQuestion}
            selectedValue={answers[currentQuestion.id]}
            onSelect={handleSelect}
          />
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={handlePrev}
            disabled={isFirst}
            className="text-sm text-white/40 hover:text-white/70 transition-colors disabled:opacity-0 disabled:cursor-default"
          >
            ← 前の質問
          </button>
        </div>
      </div>

      <div className="pb-8 text-center">
        <p className="text-white/30 text-xs">
          Q{currentQuestion.id} / {questions.length}
        </p>
      </div>
    </div>
  )
}
