"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { Header } from "@/components/Header"
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
    <div className="min-h-screen bg-gradient-to-br from-[#5b4a8a] via-[#7c5e99] to-[#4a8a7a] flex flex-col">
      <Header variant="dark" />
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-white/60 mb-4">{message}</p>
          <Link
            href="/diagnosis"
            className="text-[#6dd4a8] underline hover:text-[#33a474] transition-colors"
          >
            診断をやり直す
          </Link>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-[#5b4a8a] via-[#7c5e99] to-[#4a8a7a]">
      <Header variant="dark" />

      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Type Header - compact */}
        <div className="text-center mb-6 animate-fade-in">
          <p className="text-sm text-white/50 mb-2 uppercase tracking-widest">
            あなたのタイプ
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-1 tracking-tight">
            {typeData.type}
          </h1>
          <p className="text-lg text-[#c4a8d8] font-medium">{typeData.name}</p>
        </div>

        {/* Axis Scores - compact */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-8 border border-white/10 animate-slide-up">
          {axisResults.map((axis) => (
            <AxisBar key={axis.axis} data={axis} />
          ))}
        </div>

        {/* ===== MAIN: Career Matching Section ===== */}
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-1">
              あなたに合った就職先
            </h2>
            <p className="text-sm text-white/40">
              {typeData.type}の性格特性に基づく提案
            </p>
          </div>

          {/* Suitable Jobs */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-4 border border-white/10">
            <h3 className="text-base font-bold text-[#6dd4a8] mb-3">
              向いている職種
            </h3>
            <div className="flex flex-wrap gap-2">
              {typeData.suitableJobs.map((job) => (
                <span
                  key={job}
                  className="text-sm bg-[#33a474]/20 text-[#6dd4a8] px-3 py-1.5 rounded-full border border-[#33a474]/20"
                >
                  {job}
                </span>
              ))}
            </div>
          </div>

          {/* Suitable Industries */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-4 border border-white/10">
            <h3 className="text-base font-bold text-[#88c4e8] mb-3">
              向いている業界
            </h3>
            <div className="flex flex-wrap gap-2">
              {typeData.suitableIndustries.map((ind) => (
                <span
                  key={ind}
                  className="text-sm bg-[#4a8ab8]/20 text-[#88c4e8] px-3 py-1.5 rounded-full border border-[#4a8ab8]/20"
                >
                  {ind}
                </span>
              ))}
            </div>
          </div>

          {/* Recommended Company Types */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-white/10">
            <h3 className="text-base font-bold text-[#e8d46d] mb-3">
              おすすめの企業タイプ
            </h3>
            <div className="flex flex-wrap gap-2">
              {typeData.recommendedCompanyTypes.map((ct) => (
                <span
                  key={ct}
                  className="text-sm bg-[#b8a440]/20 text-[#e8d46d] px-3 py-1.5 rounded-full border border-[#b8a440]/20"
                >
                  {ct}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Company Recommendations (実名) ===== */}
        {matchedCompanies.length > 0 && (
          <div className="mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-xl font-bold text-white mb-1">
              おすすめ企業
            </h2>
            <p className="text-sm text-white/40 mb-5">
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
        <div className="space-y-4 mb-8 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <h2 className="text-xl font-bold text-white mb-1">
            働き方の相性
          </h2>
          <ResultSection
            title="合う働き方"
            items={typeData.suitableWorkStyles}
            icon="&#x25B2;"
            color="text-[#6dd4a8]"
          />
          <ResultSection
            title="合わない働き方"
            items={typeData.unsuitableWorkStyles}
            icon="&#x25BC;"
            color="text-[#e88888]"
          />
        </div>

        {/* ===== Personality (supplementary) ===== */}
        <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <h2 className="text-xl font-bold text-white mb-4">
            あなたの性格特性
          </h2>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-4 border border-white/10">
            <p className="text-white/80 leading-relaxed text-sm">
              {typeData.description}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <ResultSection
              title="強み"
              items={typeData.strengths}
              icon="&#x25B2;"
              color="text-[#6dd4a8]"
            />
            <ResultSection
              title="弱み"
              items={typeData.weaknesses}
              icon="&#x25BC;"
              color="text-[#e8a87c]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pb-8 animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <Link
            href="/diagnosis"
            className="w-full text-center bg-white text-[#5b4a8a] font-bold py-4 rounded-full text-sm hover:bg-white/90 transition-all shadow-xl shadow-black/10 hover:scale-[1.01] active:scale-[0.99]"
          >
            もう一度診断する
          </Link>
          <Link
            href="/"
            className="w-full text-center text-white/40 text-sm py-2 hover:text-white/70 transition-colors"
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
        <div className="min-h-screen bg-gradient-to-br from-[#5b4a8a] via-[#7c5e99] to-[#4a8a7a] flex items-center justify-center">
          <div className="text-white/40 animate-pulse">読み込み中...</div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  )
}
