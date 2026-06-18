"use client"

import { useState, useMemo } from "react"
import companiesData from "@/data/companies.json"

type Company = {
  name: string
  name_en: string
  positions: string[]
  note: string
}

type IndustryGroup = {
  industry: string
  companies: Company[]
}

const data = companiesData as IndustryGroup[]

const INDUSTRY_CATEGORIES: Record<string, string[]> = {
  "コンサルティング": ["コンサルティング"],
  "IT・SI": ["IT", "SI"],
  "商社": ["商社"],
  "金融": ["金融"],
  "製造業": ["製造業"],
  "食料品・飲料": ["食料品"],
  "医薬品": ["医薬品"],
  "マスコミ・広告": ["マスコミ"],
  "不動産": ["不動産"],
  "建設業": ["建設"],
  "運輸": ["運輸"],
  "エネルギー": ["エネルギー"],
  "サービス・通信・その他": ["サービス", "流通", "通信", "日用品", "大学", "官公庁", "その他"],
}

function matchCategory(industry: string, keywords: string[]): boolean {
  return keywords.some((kw) => industry.includes(kw))
}

export default function CompaniesPage() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("すべて")
  const [expandedIndustries, setExpandedIndustries] = useState<Set<string>>(new Set())

  const filteredData = useMemo(() => {
    return data
      .filter((group) => {
        if (selectedCategory === "すべて") return true
        const keywords = INDUSTRY_CATEGORIES[selectedCategory]
        return keywords ? matchCategory(group.industry, keywords) : true
      })
      .map((group) => {
        if (!search) return group
        const lower = search.toLowerCase()
        const filtered = group.companies.filter(
          (c) =>
            c.name.toLowerCase().includes(lower) ||
            c.name_en.toLowerCase().includes(lower) ||
            c.positions.some((p) => p.toLowerCase().includes(lower)) ||
            (c.note && c.note.toLowerCase().includes(lower))
        )
        return { ...group, companies: filtered }
      })
      .filter((group) => group.companies.length > 0)
  }, [search, selectedCategory])

  const totalCompanies = filteredData.reduce(
    (sum, group) => sum + group.companies.length,
    0
  )

  function toggleIndustry(industry: string) {
    setExpandedIndustries((prev) => {
      const next = new Set(prev)
      if (next.has(industry)) {
        next.delete(industry)
      } else {
        next.add(industry)
      }
      return next
    })
  }

  function expandAll() {
    setExpandedIndustries(new Set(filteredData.map((g) => g.industry)))
  }

  function collapseAll() {
    setExpandedIndustries(new Set())
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          新卒就活 企業・職種一覧
        </h1>
        <p className="text-sm text-gray-500">
          全{data.reduce((s, g) => s + g.companies.length, 0)}社の新卒採用職種データ
        </p>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 space-y-4">
        <input
          type="text"
          placeholder="企業名・職種で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />

        <div className="flex flex-wrap gap-2">
          {["すべて", ...Object.keys(INDUSTRY_CATEGORIES)].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {totalCompanies}社表示中
          </span>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              すべて開く
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={collapseAll}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              すべて閉じる
            </button>
          </div>
        </div>
      </div>

      {/* 企業一覧 */}
      <div className="space-y-4">
        {filteredData.map((group) => {
          const isExpanded = expandedIndustries.has(group.industry)
          return (
            <div
              key={group.industry}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => toggleIndustry(group.industry)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-gray-400 transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  >
                    ▶
                  </span>
                  <span className="font-bold text-gray-800 text-sm">
                    {group.industry}
                  </span>
                </div>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {group.companies.length}社
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100">
                  {/* テーブルヘッダー */}
                  <div className="hidden md:grid md:grid-cols-[minmax(160px,1fr)_minmax(140px,1fr)_2fr_2fr] gap-2 px-5 py-2 bg-gray-50 text-xs font-medium text-gray-500">
                    <div>企業名</div>
                    <div>英語名</div>
                    <div>新卒採用職種</div>
                    <div>補足</div>
                  </div>

                  {group.companies.map((company, i) => (
                    <div
                      key={`${group.industry}-${i}`}
                      className={`px-5 py-3 ${
                        i !== group.companies.length - 1
                          ? "border-b border-gray-50"
                          : ""
                      } hover:bg-indigo-50/30 transition-colors`}
                    >
                      {/* モバイル */}
                      <div className="md:hidden space-y-1.5">
                        <div className="font-medium text-gray-900 text-sm">
                          {company.name}
                        </div>
                        {company.name_en && (
                          <div className="text-xs text-gray-400">
                            {company.name_en}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {company.positions.map((pos) => (
                            <span
                              key={pos}
                              className="inline-block bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-md"
                            >
                              {pos}
                            </span>
                          ))}
                        </div>
                        {company.note && (
                          <div className="text-xs text-gray-500 leading-relaxed">
                            {company.note}
                          </div>
                        )}
                      </div>

                      {/* デスクトップ */}
                      <div className="hidden md:grid md:grid-cols-[minmax(160px,1fr)_minmax(140px,1fr)_2fr_2fr] gap-2 items-start">
                        <div className="font-medium text-gray-900 text-sm">
                          {company.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {company.name_en}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {company.positions.map((pos) => (
                            <span
                              key={pos}
                              className="inline-block bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-md"
                            >
                              {pos}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 leading-relaxed">
                          {company.note}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          該当する企業が見つかりません
        </div>
      )}
    </div>
  )
}
