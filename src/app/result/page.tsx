"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { calculateScores, determineMbtiType, getAxisResults } from "@/lib/diagnosis"
import { AxisBar } from "@/components/AxisBar"
import { ResultSection } from "@/components/ResultSection"
import { CompanyCard } from "@/components/CompanyCard"
import { getMatchedCompanies } from "@/lib/companies"
import type { Question, MbtiTypeData } from "@/types"
import questionsData from "@/data/questions.json"
import typesData from "@/data/types.json"

const questions = questionsData as Question[]
const types = typesData as Record<string, MbtiTypeData>

function ErrorState({ message }: { readonly message: string }) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#f8f8f8] flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-gray-400 mb-4">{message}</p>
        <Link href="/diagnosis" className="text-[#4298b4] underline hover:text-[#3a89a3]">
          診断をやり直す
        </Link>
      </div>
    </div>
  )
}

function ResultContent() {
  const searchParams = useSearchParams()
  const encoded = searchParams.get("d")

  if (!encoded) {
    return <ErrorState message="診断データがありません" />
  }

  let answers: Record<number, number>
  try {
    answers = JSON.parse(atob(decodeURIComponent(encoded)))
  } catch {
    return <ErrorState message="データの読み込みに失敗しました" />
  }

  const scores = calculateScores(questions, answers)
  const mbtiType = determineMbtiType(scores)
  const axisResults = getAxisResults(scores)
  const typeData = types[mbtiType]
  const matchedCompanies = getMatchedCompanies(mbtiType)

  if (!typeData) {
    return <ErrorState message="診断結果の取得に失敗しました" />
  }

  return (
    <div className="bg-[#f8f8f8] min-h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <section className="bg-white border-b border-gray-100 py-12 sm:py-16">
        <div className="max-w-lg mx-auto px-6 text-center animate-fade-in">
          <p className="text-sm text-gray-400 mb-2 uppercase tracking-widest">
            あなたのタイプ
          </p>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-1 tracking-tight">
            {typeData.type}
          </h1>
          <p className="text-lg text-[#7c5e99] font-medium">{typeData.name}</p>
        </div>
      </section>

      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Axis Scores */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100 animate-fade-in">
          {axisResults.map((axis) => (
            <AxisBar key={axis.axis} data={axis} />
          ))}
        </div>

        {/* ===== Career Matching ===== */}
        <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#4298b4] rounded-full" />
            あなたに合った就職先
          </h2>

          {/* Suitable Jobs */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-4 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-3">向いている職種</h3>
            <div className="flex flex-wrap gap-2">
              {typeData.suitableJobs.map((job) => (
                <span
                  key={job}
                  className="text-sm bg-[#eef7fa] text-[#4298b4] px-3 py-1.5 rounded-full border border-[#4298b4]/15"
                >
                  {job}
                </span>
              ))}
            </div>
          </div>

          {/* Suitable Industries */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-4 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-3">向いている業界</h3>
            <div className="flex flex-wrap gap-2">
              {typeData.suitableIndustries.map((ind) => (
                <span
                  key={ind}
                  className="text-sm bg-[#eef8f3] text-[#33a474] px-3 py-1.5 rounded-full border border-[#33a474]/15"
                >
                  {ind}
                </span>
              ))}
            </div>
          </div>

          {/* Company Types */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-8 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-3">おすすめの企業タイプ</h3>
            <div className="flex flex-wrap gap-2">
              {typeData.recommendedCompanyTypes.map((ct) => (
                <span
                  key={ct}
                  className="text-sm bg-[#f5f0fa] text-[#7c5e99] px-3 py-1.5 rounded-full border border-[#7c5e99]/15"
                >
                  {ct}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Company Recommendations ===== */}
        {matchedCompanies.length > 0 && (
          <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#33a474] rounded-full" />
              おすすめ企業
            </h2>
            <p className="text-xs text-gray-400 mb-5 ml-3.5">
              あなたのタイプに合う業界から厳選
            </p>
            <div className="space-y-4">
              {matchedCompanies.map((industry) => (
                <CompanyCard key={industry.industry} data={industry} />
              ))}
            </div>
          </div>
        )}

        {/* ===== Work Style ===== */}
        <div className="space-y-4 mb-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#d4a34a] rounded-full" />
            働き方の相性
          </h2>
          <ResultSection
            title="合う働き方"
            items={typeData.suitableWorkStyles}
            icon="&#x25B2;"
            color="text-[#33a474]"
          />
          <ResultSection
            title="合わない働き方"
            items={typeData.unsuitableWorkStyles}
            icon="&#x25BC;"
            color="text-[#c47070]"
          />
        </div>

        {/* ===== Personality ===== */}
        <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#7c5e99] rounded-full" />
            あなたの性格特性
          </h2>

          <div className="bg-white rounded-xl shadow-sm p-5 mb-4 border border-gray-100">
            <p className="text-sm text-gray-600 leading-relaxed">
              {typeData.description}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <ResultSection
              title="強み"
              items={typeData.strengths}
              icon="&#x25B2;"
              color="text-[#4298b4]"
            />
            <ResultSection
              title="弱み"
              items={typeData.weaknesses}
              icon="&#x25BC;"
              color="text-[#d4a34a]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pb-10">
          <Link
            href="/diagnosis"
            className="w-full text-center bg-[#4298b4] text-white font-bold py-4 rounded-full text-sm hover:bg-[#3a89a3] transition-colors shadow-sm"
          >
            もう一度診断する
          </Link>
          <Link
            href="/"
            className="w-full text-center text-gray-400 text-sm py-2 hover:text-gray-600 transition-colors"
          >
            トップに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-3.5rem)] bg-[#f8f8f8] flex items-center justify-center">
          <div className="text-gray-300 animate-pulse">読み込み中...</div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  )
}
