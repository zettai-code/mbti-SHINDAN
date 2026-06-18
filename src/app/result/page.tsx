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

function ResultContent() {
  const searchParams = useSearchParams()
  const encoded = searchParams.get("d")

  if (!encoded) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">診断データがありません</p>
        <Link href="/diagnosis" className="text-indigo-600 underline">
          診断をやり直す
        </Link>
      </div>
    )
  }

  let answers: Record<number, number>
  try {
    answers = JSON.parse(atob(decodeURIComponent(encoded)))
  } catch {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">データの読み込みに失敗しました</p>
        <Link href="/diagnosis" className="text-indigo-600 underline">
          診断をやり直す
        </Link>
      </div>
    )
  }

  const scores = calculateScores(questions, answers)
  const mbtiType = determineMbtiType(scores)
  const axisResults = getAxisResults(scores)
  const typeData = types[mbtiType]
  const matchedCompanies = getMatchedCompanies(mbtiType)

  if (!typeData) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">診断結果の取得に失敗しました</p>
        <Link href="/diagnosis" className="text-indigo-600 underline">
          診断をやり直す
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <p className="text-sm text-gray-500 mb-2">あなたのタイプは</p>
        <h1 className="text-4xl font-bold text-indigo-600 mb-1">
          {typeData.type}
        </h1>
        <p className="text-lg font-medium text-gray-800">{typeData.name}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="text-sm font-bold text-gray-800 mb-4">各軸のスコア</h2>
        {axisResults.map((axis) => (
          <AxisBar key={axis.axis} data={axis} />
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="text-sm font-bold text-gray-800 mb-2">性格特徴</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          {typeData.description}
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <ResultSection
          title="強み"
          items={typeData.strengths}
          icon="&#x1F4AA;"
          color="text-green-600"
        />
        <ResultSection
          title="弱み"
          items={typeData.weaknesses}
          icon="&#x26A0;&#xFE0F;"
          color="text-amber-600"
        />
        <ResultSection
          title="向いている職種"
          items={typeData.suitableJobs}
          icon="&#x1F4BC;"
          color="text-blue-600"
        />
        <ResultSection
          title="向いている業界"
          items={typeData.suitableIndustries}
          icon="&#x1F3E2;"
          color="text-purple-600"
        />
        <ResultSection
          title="向いている働き方"
          items={typeData.suitableWorkStyles}
          icon="&#x2705;"
          color="text-emerald-600"
        />
        <ResultSection
          title="向いていない働き方"
          items={typeData.unsuitableWorkStyles}
          icon="&#x274C;"
          color="text-red-500"
        />
        <ResultSection
          title="おすすめ企業タイプ"
          items={typeData.recommendedCompanyTypes}
          icon="&#x2B50;"
          color="text-yellow-600"
        />
      </div>

      {matchedCompanies.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span>&#x1F3AF;</span>
            あなたにおすすめの企業
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            {typeData.type}タイプに合う業界の企業をピックアップしました
          </p>
          <div className="space-y-4">
            {matchedCompanies.map((industry) => (
              <CompanyCard key={industry.industry} data={industry} />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Link
          href="/diagnosis"
          className="w-full text-center bg-indigo-600 text-white font-bold py-4 rounded-2xl text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          もう一度診断する
        </Link>
        <Link
          href="/"
          className="w-full text-center text-gray-500 text-sm py-2 hover:text-gray-700 transition-colors"
        >
          トップに戻る
        </Link>
      </div>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto px-4 py-12 text-center text-gray-400">
          読み込み中...
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  )
}
