"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import type { IndustryGroup } from "@/types"
import companiesData from "@/data/companies.json"
import { SCALE_OPTIONS, UNIVERSITY_LABELS } from "@/lib/job-fit-types"
import {
  MBTI_TYPES, MBTI_NICKNAMES, ACTIVITIES, DURATIONS,
  UNIVERSITY_NAMES, lookupRank, type MbtiType,
} from "./match-config"
import { rankCompanies, type GakuchikaSelection } from "./match-engine"
import { MATCH_QUESTIONS } from "./match-questions"

const allIndustries = companiesData as IndustryGroup[]
const questions = MATCH_QUESTIONS

const PRIMARY = "#4298b4"

type Screen = "input" | "questions" | "results"

export default function MatchPage() {
  const [screen, setScreen] = useState<Screen>("input")
  const [mbti, setMbti] = useState<MbtiType | null>(null)
  const [university, setUniversity] = useState("")
  const [selections, setSelections] = useState<Record<string, string>>({}) // activityKey -> durationKey
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [showAll, setShowAll] = useState(false)

  const rankLabel = university ? UNIVERSITY_LABELS[lookupRank(university)] : null

  const toggleActivity = (key: string) => {
    setSelections((prev) => {
      const next = { ...prev }
      if (key in next) delete next[key]
      else next[key] = "1y2y"
      return next
    })
  }

  const setDuration = (key: string, dur: string) =>
    setSelections((prev) => ({ ...prev, [key]: dur }))

  const results = useMemo(() => {
    if (screen !== "results" || !mbti) return []
    const sels: GakuchikaSelection[] = Object.entries(selections).map(
      ([activityKey, durationKey]) => ({ activityKey, durationKey })
    )
    return rankCompanies(mbti, university, sels, allIndustries, questions, answers)
  }, [screen, mbti, university, selections, answers])

  const canStart = mbti !== null && university.trim() !== ""
  const visible = showAll ? results.slice(0, 50) : results.slice(0, 15)

  // 回答 → 自動で次へ（最後なら結果へ）
  const answer = (scaleIdx: number) => {
    const q = questions[qIdx]
    setAnswers((prev) => ({ ...prev, [q.id]: scaleIdx }))
    if (qIdx < questions.length - 1) {
      setQIdx((i) => i + 1)
    } else {
      setShowAll(false)
      setScreen("results")
    }
  }

  // ───────────────────────── 入力画面 ─────────────────────────
  if (screen === "input") {
    return (
      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="text-center mb-10 animate-fade-in">
          <span
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3"
            style={{ background: `${PRIMARY}15`, color: PRIMARY }}
          >
            MBTI × ガクチカ × 学歴 × 30問
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            あなたに合う企業を診断
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            基本情報を入力したあと30問の質問に答えると、<br className="hidden sm:block" />
            全{allIndustries.reduce((s, g) => s + g.companies.length, 0)}社の中で相性の良い企業を算出します。
          </p>
        </div>

        {/* STEP 1: MBTI */}
        <section className="mb-8">
          <h2 className="text-sm font-bold text-gray-700 mb-3">
            <span className="text-white text-xs px-2 py-0.5 rounded mr-2" style={{ background: PRIMARY }}>1</span>
            MBTIタイプを選択
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MBTI_TYPES.map((t) => {
              const active = mbti === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMbti(t)}
                  className={`rounded-xl border px-3 py-2.5 text-center transition-all ${
                    active ? "text-white border-transparent shadow-sm" : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                  style={active ? { background: PRIMARY } : undefined}
                >
                  <div className="text-sm font-bold tracking-wide">{t}</div>
                  <div className={`text-[11px] ${active ? "text-white/80" : "text-gray-400"}`}>{MBTI_NICKNAMES[t]}</div>
                </button>
              )
            })}
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            自分のタイプが分からない方は{" "}
            <Link href="/diagnosis" className="underline" style={{ color: PRIMARY }}>40問の診断テスト</Link>
            {" "}へ
          </p>
        </section>

        {/* STEP 2: 学歴 */}
        <section className="mb-8">
          <h2 className="text-sm font-bold text-gray-700 mb-3">
            <span className="text-white text-xs px-2 py-0.5 rounded mr-2" style={{ background: PRIMARY }}>2</span>
            学歴（大学名）
          </h2>
          <input
            list="university-list"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder="例: 早稲田大学"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-gray-400 transition-colors"
          />
          <datalist id="university-list">
            {UNIVERSITY_NAMES.map((n) => <option key={n} value={n} />)}
          </datalist>
          {rankLabel && (
            <p className="text-[11px] text-gray-500 mt-2">
              判定ランク: <span className="font-semibold text-gray-700">{rankLabel}</span>
            </p>
          )}
        </section>

        {/* STEP 3: ガクチカ */}
        <section className="mb-8">
          <h2 className="text-sm font-bold text-gray-700 mb-1">
            <span className="text-white text-xs px-2 py-0.5 rounded mr-2" style={{ background: PRIMARY }}>3</span>
            ガクチカ（学生時代に力を入れたこと）
          </h2>
          <p className="text-[11px] text-gray-400 mb-3">「何を」を選び「何年」取り組んだか設定（複数選択可・任意）</p>
          <div className="space-y-2">
            {ACTIVITIES.map((a) => {
              const active = a.key in selections
              return (
                <div
                  key={a.key}
                  className={`rounded-xl border transition-all ${active ? "border-transparent shadow-sm" : "bg-white border-gray-200"}`}
                  style={active ? { background: `${PRIMARY}0d` } : undefined}
                >
                  <button type="button" onClick={() => toggleActivity(a.key)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                    <span className="text-xl">{a.emoji}</span>
                    <span className={`flex-1 text-sm font-medium ${active ? "text-gray-800" : "text-gray-600"}`}>{a.label}</span>
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${active ? "text-white border-transparent" : "border-gray-300 text-transparent"}`}
                      style={active ? { background: PRIMARY } : undefined}
                    >✓</span>
                  </button>
                  {active && (
                    <div className="px-4 pb-3 flex items-center gap-2">
                      <span className="text-[11px] text-gray-500">期間</span>
                      <select
                        value={selections[a.key]}
                        onChange={(e) => setDuration(a.key, e.target.value)}
                        className="text-xs rounded-lg border border-gray-200 px-2 py-1.5 bg-white text-gray-700 outline-none"
                      >
                        {DURATIONS.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <button
          type="button"
          disabled={!canStart}
          onClick={() => { setQIdx(0); setScreen("questions") }}
          className={`w-full rounded-xl py-4 text-white font-bold text-base transition-all ${canStart ? "shadow-sm hover:opacity-90" : "opacity-40 cursor-not-allowed"}`}
          style={{ background: PRIMARY }}
        >
          30問の質問へ進む
        </button>
        {!canStart && <p className="text-[11px] text-gray-400 text-center mt-2">MBTIタイプと大学名を入力してください</p>}
      </div>
    )
  }

  // ───────────────────────── 質問画面 ─────────────────────────
  if (screen === "questions") {
    if (questions.length === 0) {
      return (
        <div className="max-w-2xl mx-auto px-5 py-16 text-center">
          <p className="text-sm text-gray-500">質問データが準備中です。</p>
          <button type="button" onClick={() => setScreen("input")} className="mt-4 text-sm underline" style={{ color: PRIMARY }}>戻る</button>
        </div>
      )
    }
    const q = questions[qIdx]
    const progress = Math.round(((qIdx) / questions.length) * 100)
    const selected = answers[q.id]
    return (
      <div className="max-w-2xl mx-auto px-5 py-10">
        {/* 進捗 */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>質問 {qIdx + 1} / {questions.length}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: PRIMARY }} />
          </div>
        </div>

        {/* 設問 */}
        <div key={q.id} className="animate-fade-in">
          <div className="text-center mb-8">
            <div className="text-3xl mb-3">{q.icon}</div>
            <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mb-3" style={{ background: `${PRIMARY}15`, color: PRIMARY }}>
              {q.sec}
            </span>
            <p className="text-base sm:text-lg font-medium text-gray-800 leading-relaxed">{q.text}</p>
          </div>

          <div className="space-y-2">
            {SCALE_OPTIONS.map((opt, i) => {
              const active = selected === i
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => answer(i)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm font-medium text-left transition-all ${
                    active ? "text-white border-transparent shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                  style={active ? { background: PRIMARY } : undefined}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 戻る */}
        <button
          type="button"
          onClick={() => { if (qIdx > 0) setQIdx((i) => i - 1); else setScreen("input") }}
          className="mt-6 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← {qIdx > 0 ? "前の質問へ" : "基本情報に戻る"}
        </button>
      </div>
    )
  }

  // ───────────────────────── 結果画面 ─────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <section className="animate-fade-in">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">診断結果</h2>
          <span className="text-xs text-gray-400">{results.length}社をスコアリング</span>
        </div>
        {mbti && (
          <p className="text-xs text-gray-500 mb-4">
            <span className="font-semibold" style={{ color: PRIMARY }}>{mbti}</span>
            （{MBTI_NICKNAMES[mbti]}）× {rankLabel}
            {Object.keys(selections).length > 0 && ` × ガクチカ${Object.keys(selections).length}件`}
            {" × 30問"}の結果、相性の良い順に表示しています。
          </p>
        )}

        <ol className="space-y-2.5">
          {visible.map((c, i) => (
            <li key={`${c.name}-${i}`} className="rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-3">
                <span className="shrink-0 w-7 text-center text-sm font-bold" style={{ color: i < 3 ? PRIMARY : "#9ca3af" }}>{i + 1}</span>
                <span className="text-xl shrink-0">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-800 truncate">{c.name}</div>
                  <div className="text-[11px] text-gray-400 truncate">{c.industry}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold" style={{ color: PRIMARY }}>
                    {c.finalScore.toFixed(0)}<span className="text-xs font-normal text-gray-400 ml-0.5">%</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${c.finalScore}%`, background: PRIMARY }} />
              </div>
              {c.reasons.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.reasons.map((r, ri) => (
                    <span
                      key={ri}
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: r.value >= 0 ? "#33a47415" : "#ef444415", color: r.value >= 0 ? "#2b8a61" : "#dc2626" }}
                    >
                      {r.label} {r.value > 0 ? "+" : ""}{r.value}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>

        {!showAll && results.length > 15 && (
          <button type="button" onClick={() => setShowAll(true)} className="w-full mt-4 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            もっと見る（TOP50まで表示）
          </button>
        )}

        <button
          type="button"
          onClick={() => { setScreen("input"); setQIdx(0); setAnswers({}) }}
          className="w-full mt-3 rounded-xl py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          style={{ background: PRIMARY }}
        >
          もう一度診断する
        </button>

        <p className="text-[10px] text-gray-400 mt-6 leading-relaxed">
          ※ スコアは MBTI由来の特性ベクトル・30問の回答・各企業の要求プロファイルの適合度に、業界マッチ・学歴・ガクチカ補正を加えた参考値です。実際の選考結果を保証するものではありません。
        </p>
      </section>
    </div>
  )
}
