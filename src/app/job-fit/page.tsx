"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import Link from "next/link"
import type { JobFitQuestion, Gender, UniversityRank, Background } from "@/lib/job-fit-types"
import {
  SCALE_OPTIONS, UNIVERSITY_RANKS, UNIVERSITY_LABELS,
  BACKGROUNDS, SCORE_CATEGORIES,
} from "@/lib/job-fit-types"
import { computeUserScores, scoreCompany } from "@/lib/job-fit-engine"
import type { IndustryGroup, Company } from "@/types"
import questionsData from "@/data/job-fit-questions.json"
import companiesData from "@/data/companies.json"

const questions = questionsData as JobFitQuestion[]
const allIndustries = companiesData as IndustryGroup[]

interface ScoredCompany extends Company {
  industry: string
  baseScore: number
  correction: number
  finalScore: number
  strengths: string[]
  weaknesses: string[]
  corrDetails: { label: string; value: number; reason: string }[]
}

type Screen = "top" | "attributes" | "questions" | "loading" | "results"

export default function JobFitPage() {
  const [screen, setScreen] = useState<Screen>("top")
  const [gender, setGender] = useState<Gender | null>(null)
  const [uni, setUni] = useState<UniversityRank | null>(null)
  const [bgs, setBgs] = useState<Background[]>([])
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [userScores, setUserScores] = useState<Record<string, number>>({})
  const [loadPct, setLoadPct] = useState(0)
  const [toast, setToast] = useState<{ msg: string; type: "error" | "success" } | null>(null)
  const [expandedIndustries, setExpandedIndustries] = useState<Set<string>>(new Set())
  const [companySearch, setCompanySearch] = useState("")

  // Score all companies that have requiredProfile data
  const scoredCompanies = useMemo(() => {
    if (Object.keys(userScores).length === 0 || !uni) return []
    const scored: ScoredCompany[] = []
    allIndustries.forEach((group) => {
      group.companies.forEach((c) => {
        if (c.requiredProfile && Object.keys(c.requiredProfile).length > 0) {
          const base = scoreCompany(userScores, c.requiredProfile)
          if (base !== null) {
            // Apply university and background corrections
            let corr = 0
            const corrDetails: { label: string; value: number; reason: string }[] = []

            // Uni correction
            if (c.uniCorr && uni in c.uniCorr) {
              const uVal = c.uniCorr[uni] ?? 0
              if (uVal !== 0) {
                corr += uVal
                corrDetails.push({
                  label: UNIVERSITY_LABELS[uni] || uni,
                  value: uVal,
                  reason: uVal > 0 ? "採用実績と高い親和性" : "採用傾向に基づく調整"
                })
              }
            }

            // Bg corrections
            if (c.bgCorr) {
              bgs.forEach((bg) => {
                const bVal = c.bgCorr?.[bg] ?? 0
                if (bVal !== 0) {
                  corr += bVal
                  const bgLabel = BACKGROUNDS.find((item) => item.key === bg)?.label || bg
                  corrDetails.push({
                    label: bgLabel,
                    value: bVal,
                    reason: bVal > 0 ? "選考で有利に働く経験" : "採用傾向に基づく調整"
                  })
                }
              })
            }

            // Clamp correction between -10% and +10%
            const clampedCorr = Math.max(-10, Math.min(10, corr))
            const final = Math.max(0, Math.min(100, base + clampedCorr))

            // Compute dynamic strengths / weaknesses
            const comps = Object.keys(c.requiredProfile).map((p) => {
              const u = Math.round(userScores[p] ?? 50)
              const j = c.requiredProfile[p]
              return {
                name: p,
                user: u,
                job: j,
                excess: u - j,
              }
            })

            // Strengths: User exceeds or is close to job requirements, sorted by user score descending
            const strengths = comps
              .filter((comp) => comp.excess >= -5)
              .sort((a, b) => b.user - a.user)
              .slice(0, 3)
              .map((s) => `${s.name}(${s.user})`)

            // Weaknesses: User is lacking, sorted by deficiency descending
            const weaknesses = comps
              .filter((comp) => comp.excess < 0)
              .sort((a, b) => a.excess - b.excess)
              .slice(0, 2)
              .map((w) => w.name)

            scored.push({
              ...c,
              industry: group.industry,
              baseScore: Math.round(base * 10) / 10,
              correction: Math.round(clampedCorr * 10) / 10,
              finalScore: Math.round(final * 10) / 10,
              strengths,
              weaknesses,
              corrDetails
            })
          }
        }
      })
    })
    scored.sort((a, b) => b.finalScore - a.finalScore)
    return scored
  }, [userScores, uni, bgs])

  const showToast = useCallback((msg: string, type: "error" | "success" = "error") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  // ── Background toggle logic ──
  const toggleBg = useCallback((bg: Background) => {
    setBgs((prev) => {
      if (bg === "特になし") return ["特になし"]
      const next = prev.filter((b) => b !== "特になし")
      return next.includes(bg) ? next.filter((b) => b !== bg) : [...next, bg]
    })
  }, [])

  // ── Submit attributes ──
  const submitAttrs = useCallback(() => {
    if (!gender) { showToast("性別を選択してください"); return }
    if (!uni) { showToast("大学ランクを選択してください"); return }
    const finalBgs = bgs.length === 0 ? ["特になし" as Background] : bgs
    setBgs(finalBgs)
    setQIdx(0)
    setAnswers({})
    setScreen("questions")
  }, [gender, uni, bgs, showToast])

  // ── Answer a question ──
  const answerQ = useCallback((scaleIdx: number) => {
    const newAnswers = { ...answers, [questions[qIdx].id]: scaleIdx }
    setAnswers(newAnswers)
    setTimeout(() => {
      if (qIdx < questions.length - 1) {
        setQIdx(qIdx + 1)
      } else {
        // Loading → Results
        setScreen("loading")
        let pct = 0
        const iv = setInterval(() => {
          pct += Math.random() * 6 + 3
          if (pct >= 100) {
            pct = 100
            clearInterval(iv)
            const scores = computeUserScores(questions, newAnswers)
            setUserScores(scores)
            setTimeout(() => setScreen("results"), 300)
          }
          setLoadPct(Math.floor(pct))
        }, 80)
      }
    }, 200)
  }, [answers, qIdx, uni, bgs])

  // ── Restart ──
  const restart = useCallback(() => {
    setGender(null); setUni(null); setBgs([]); setQIdx(0)
    setAnswers({}); setUserScores({}); setLoadPct(0)
    setExpandedIndustries(new Set())
    setScreen("top")
  }, [])

  // Scroll to top on screen change
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }) }, [screen])

  return (
    <div className="min-h-[calc(100vh-52px)]">
      {/* ── TOP ── */}
      {screen === "top" && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> BETA
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 leading-tight">
            職種適合度エンジン
          </h1>
          <p className="text-gray-500 text-sm max-w-md leading-relaxed mb-3">
            30問の質問に答えるだけで、あなたの素養ベクトルと企業の要求ベクトルを照合。
            学歴・バックグラウンド補正を加えた<span className="text-indigo-600 font-semibold">リアルな適合度</span>を算出します。
          </p>
          <p className="text-gray-400 text-xs mb-10">28パラメーター × 8職種 × 重み付きマッチング + 統計フィルター</p>
          <button
            onClick={() => setScreen("attributes")}
            className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl text-base hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            診断を始める →
          </button>
        </div>
      )}

      {/* ── ATTRIBUTES ── */}
      {screen === "attributes" && (
        <div className="max-w-lg mx-auto px-4 py-12 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-indigo-600 tracking-wider">STEP 1</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">あなたのプロフィール</h2>

            {/* Gender */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-500 mb-2 block">性別</label>
              <div className="flex gap-3">
                {(["男", "女"] as Gender[]).map((g) => (
                  <button key={g} onClick={() => setGender(g)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-colors ${
                      gender === g ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >{g === "男" ? "男性" : "女性"}</button>
                ))}
              </div>
            </div>

            {/* University */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-500 mb-2 block">大学ランク</label>
              <div className="grid grid-cols-2 gap-2">
                {UNIVERSITY_RANKS.map((u) => (
                  <button key={u} onClick={() => setUni(u)}
                    className={`py-3 px-2 rounded-xl text-xs font-medium border transition-colors text-center ${
                      uni === u ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >{UNIVERSITY_LABELS[u]}</button>
                ))}
              </div>
            </div>

            {/* Backgrounds */}
            <div className="mb-8">
              <label className="text-xs font-semibold text-gray-500 mb-2 block">
                バックグラウンド属性 <span className="text-gray-400">（複数選択可）</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {BACKGROUNDS.map(({ key, label }) => (
                  <button key={key} onClick={() => toggleBg(key)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                      bgs.includes(key) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >{label}</button>
                ))}
              </div>
            </div>

            <button onClick={submitAttrs}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >次へ進む →</button>
          </div>
        </div>
      )}

      {/* ── QUESTIONS ── */}
      {screen === "questions" && (
        <div className="max-w-lg mx-auto px-4 py-6 animate-fadeIn">
          {/* Progress */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-xs font-medium">
              {questions[qIdx].icon} {questions[qIdx].sec}
            </span>
            <span>{qIdx + 1} / {questions.length}</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${((qIdx + 1) / questions.length) * 100}%` }} />
          </div>

          {/* Question */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <p className="text-base font-semibold text-gray-800 leading-relaxed mb-6 min-h-[60px]">
              {questions[qIdx].text}
            </p>
            <div className="space-y-2">
              {SCALE_OPTIONS.map((opt, si) => {
                const selected = answers[questions[qIdx].id] === si
                const colors = [
                  "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
                  "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100",
                  "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100",
                  "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100",
                  "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
                  "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
                  "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
                ]
                return (
                  <button key={si} onClick={() => answerQ(si)}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-medium border transition-all ${colors[si]} ${
                      selected ? "ring-2 ring-indigo-400 scale-[1.01]" : ""
                    }`}
                  >{opt.label}</button>
                )
              })}
            </div>
          </div>

          {qIdx > 0 && (
            <button onClick={() => setQIdx(qIdx - 1)} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← 前の質問に戻る
            </button>
          )}
        </div>
      )}

      {/* ── LOADING ── */}
      {screen === "loading" && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center animate-fadeIn">
          <div className="relative w-24 h-24 mb-8">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#6366f1" strokeWidth="2.5"
                strokeDasharray={`${loadPct * 0.974} 100`} strokeLinecap="round"
                className="transition-all duration-100" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-indigo-600">{loadPct}%</span>
            </div>
          </div>
          <p className="text-gray-800 font-semibold text-lg mb-1">AIがあなたの適性を分析中…</p>
          <p className="text-gray-400 text-xs">28パラメーター × {allIndustries.reduce((s, g) => s + g.companies.length, 0)}社のベクトルマッチングを実行しています</p>
        </div>
      )}

      {/* ── RESULTS ── */}
      {screen === "results" && (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ANALYSIS COMPLETE
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">あなたの適合度分析結果</h2>
            <p className="text-xs text-gray-400">
              {gender === "男" ? "男性" : "女性"} ・ {UNIVERSITY_LABELS[uni!]} ・ {bgs.join(", ")}
            </p>
          </div>

          {/* Score Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-4">SCORE SUMMARY</h3>
            <div className="space-y-4">
              {SCORE_CATEGORIES.map((cat) => {
                const avg = Math.round(cat.params.reduce((s, p) => s + (userScores[p] ?? 50), 0) / cat.params.length)
                return (
                  <div key={cat.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-semibold" style={{ color: cat.color }}>{cat.name}</span>
                      <span className="text-sm font-bold text-gray-800">{avg}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${avg}%`, background: cat.color }} />
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[10px] text-gray-400">
                      {cat.params.map((p) => (
                        <span key={p}>{p}: <b className="text-gray-600">{Math.round(userScores[p] ?? 50)}</b></span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── SCORED RECOMMENDATIONS (when requiredProfile data exists) ── */}
          {scoredCompanies.length > 0 && (
            <>
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🏆</span> レコメンド企業
                <span className="text-xs text-gray-400 font-normal">マッチ度順</span>
              </h3>
              <div className="space-y-4 mb-8">
                {scoredCompanies.slice(0, 20).map((c, i) => {
                  const rankEmoji = i < 3 ? ["🥇", "🥈", "🥉"][i] : null;
                  const rankText = rankEmoji ? "" : `#${i + 1}`;
                  return (
                    <div key={`${c.industry}-${c.name}-${i}`}
                      className={`bg-white rounded-2xl shadow-sm border p-6 transition-all ${
                        i === 0 ? "border-indigo-300 ring-2 ring-indigo-50" : "border-gray-100"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        {/* Left Info Column */}
                        <div className="flex-1 min-w-0">
                          {/* Rank, Icon, and Name */}
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            {rankEmoji ? (
                              <span className="text-3xl filter drop-shadow-sm">{rankEmoji}</span>
                            ) : (
                              <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{rankText}</span>
                            )}
                            <span className="text-2xl">{c.emoji || "🏢"}</span>
                            <h4 className="text-lg font-black text-gray-900 leading-tight">
                              {c.name} <span className="text-gray-400 font-normal mx-1">|</span> <span className="text-indigo-600 font-bold">{c.positions.join("・")}</span>
                            </h4>
                          </div>

                          {c.note && (
                            <p className="text-xs text-gray-600 font-medium mb-3 pl-1 border-l-2 border-indigo-200">
                              {c.note}
                            </p>
                          )}

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold">{c.industry}</span>
                            {(c.tags || []).map((t) => (
                              <span key={t} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-semibold">{t}</span>
                            ))}
                          </div>

                          {/* Why Suitable Insight */}
                          {c.strengths.length > 0 && (
                            <div className="bg-indigo-50/40 rounded-xl p-3 mb-4 text-xs leading-relaxed text-gray-700">
                              <span className="font-bold text-indigo-700">💡 なぜ向いているか：</span>
                              あなたの <span className="font-bold text-gray-900">{c.strengths.join("・")}</span> は、{c.name}が求める水準と高い親和性があります。
                              {c.weaknesses.length > 0 && (
                                <>
                                  {" "}<span className="font-bold text-amber-700">{c.weaknesses.join("・")}</span> の強化が内定確率をさらに高めるカギになります。
                                </>
                              )}
                            </div>
                          )}

                          {/* Background Fit */}
                          {c.corrDetails.length > 0 && (
                            <div className="bg-emerald-50/30 rounded-xl p-3 mb-4 border border-emerald-50">
                              <p className="text-[10px] font-bold text-emerald-800 mb-1.5 flex items-center gap-1">
                                <span>📊</span> バックグラウンド適合度
                              </p>
                              <div className="space-y-1">
                                {c.corrDetails.map((det, di) => (
                                  <div key={di} className="flex justify-between items-center text-[10px]">
                                    <span className="text-gray-500">{det.label} → {det.reason}</span>
                                    <span className={`font-bold ${det.value > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                                      {det.value > 0 ? `+${det.value}%` : `${det.value}%`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Parameter bars */}
                          <details className="group">
                            <summary className="text-[11px] font-bold text-gray-400 cursor-pointer hover:text-gray-600 select-none list-none flex items-center gap-1">
                              <span className="transition-transform group-open:rotate-90">▶</span> 求められる人物像とあなたの素養（詳細）
                            </summary>
                            <div className="bg-gray-50 rounded-xl p-4 mt-2 space-y-2">
                              {Object.keys(c.requiredProfile)
                                .sort((a, b) => c.requiredProfile[b] - c.requiredProfile[a])
                                .slice(0, 8)
                                .map((p) => {
                                  const uVal = Math.round(userScores[p] ?? 50)
                                  const jVal = c.requiredProfile[p]
                                  const diff = uVal - jVal
                                  const barColor = diff >= 0 ? "#6366f1" : diff >= -15 ? "#f59e0b" : "#ef4444"
                                  return (
                                    <div key={p} className="flex items-center gap-2 text-[10px]">
                                      <span className="w-16 text-right text-gray-400 shrink-0 font-semibold">{p}</span>
                                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full relative">
                                        <div className="h-full rounded-full" style={{ width: `${uVal}%`, background: barColor }} />
                                        <div className="absolute top-[-3px] w-0.5 h-[9px] bg-indigo-800 rounded-full" style={{ left: `${jVal}%` }} />
                                      </div>
                                      <span className="w-14 text-right shrink-0">
                                        <b className="text-gray-700">{uVal}</b> <span className="text-gray-400">/ {jVal}</span>
                                      </span>
                                    </div>
                                  )
                                })}
                            </div>
                          </details>
                        </div>

                        {/* Right Score Column */}
                        <div className="flex flex-row md:flex-col items-center justify-between md:justify-center shrink-0 p-3 bg-gray-50/50 rounded-2xl border border-gray-100 min-w-[120px] self-stretch md:self-auto">
                          <div className="flex flex-col items-center">
                            <div className="relative w-20 h-20">
                              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
                                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#6366f1" strokeWidth="3"
                                  strokeDasharray={`${c.finalScore * 0.974} 100`} strokeLinecap="round" />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">MATCH</span>
                                <div className="flex items-baseline">
                                  <span className="text-lg font-black text-gray-900">{Math.round(c.finalScore)}</span>
                                  <span className="text-[10px] text-gray-400 font-bold">%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-center md:mt-2 text-[10px] text-gray-400">
                            <div>ベース: {c.baseScore}%</div>
                            {c.correction !== 0 && (
                              <div className={c.correction > 0 ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                                補正: {c.correction > 0 ? `+${c.correction}%` : `${c.correction}%`}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* ── ALL COMPANIES ── */}
          <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span>🏢</span> 企業・職種一覧
            <span className="text-xs text-gray-400 font-normal">全{allIndustries.reduce((s, g) => s + g.companies.length, 0)}社</span>
          </h3>
          <p className="text-xs text-gray-400 mb-4">各企業の「求められる人物像」データが揃い次第、適合度スコアが自動計算されます。</p>

          <input
            type="text"
            placeholder="企業名・職種で検索..."
            value={companySearch}
            onChange={(e) => setCompanySearch(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />

          <div className="space-y-3 mb-8">
            {allIndustries
              .map((group) => {
                if (!companySearch) return group
                const lower = companySearch.toLowerCase()
                const filtered = group.companies.filter(
                  (c) => c.name.toLowerCase().includes(lower) || c.name_en.toLowerCase().includes(lower) || c.positions.some((p) => p.toLowerCase().includes(lower))
                )
                return { ...group, companies: filtered }
              })
              .filter((g) => g.companies.length > 0)
              .map((group) => {
                const isOpen = expandedIndustries.has(group.industry)
                return (
                  <div key={group.industry} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setExpandedIndustries((prev) => {
                        const next = new Set(prev)
                        next.has(group.industry) ? next.delete(group.industry) : next.add(group.industry)
                        return next
                      })}
                      className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-gray-400 text-xs transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>
                        <span className="font-bold text-gray-800 text-sm">{group.industry}</span>
                      </div>
                      <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">{group.companies.length}社</span>
                    </button>
                    {isOpen && (
                      <div className="border-t border-gray-100">
                        {group.companies.map((company, ci) => {
                          const hasProfile = Object.keys(company.requiredProfile).length > 0
                          const matchScore = hasProfile ? scoreCompany(userScores, company.requiredProfile) : null
                          return (
                            <div key={`${group.industry}-${ci}`} className={`px-5 py-3 ${ci !== group.companies.length - 1 ? "border-b border-gray-50" : ""} hover:bg-indigo-50/30 transition-colors`}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-sm font-semibold text-gray-900">{company.name}</span>
                                    {company.name_en && <span className="text-[10px] text-gray-400">{company.name_en}</span>}
                                  </div>
                                  <div className="flex flex-wrap gap-1 mb-1">
                                    {company.positions.map((pos) => (
                                      <span key={pos} className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md">{pos}</span>
                                    ))}
                                  </div>
                                  {company.note && <p className="text-[10px] text-gray-500 leading-relaxed">{company.note}</p>}
                                  <div className="mt-1.5">
                                    <span className="text-[10px] text-gray-400">求められる人物像：</span>
                                    {hasProfile ? (
                                      <span className="text-[10px] text-gray-600">{Object.entries(company.requiredProfile).map(([k,v]) => `${k}:${v}`).join(" / ")}</span>
                                    ) : (
                                      <span className="text-[10px] text-gray-300 italic">データ準備中</span>
                                    )}
                                  </div>
                                </div>
                                <div className="shrink-0 min-w-[48px] text-center">
                                  {matchScore !== null ? (
                                    <div>
                                      <span className="text-sm font-black text-indigo-600">{matchScore}</span>
                                      <span className="text-[8px] text-gray-400">%</span>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-gray-300">—</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={restart}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >もう一度診断する</button>
            <Link href="/"
              className="px-8 py-3 text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >トップに戻る</Link>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full font-semibold text-sm text-white shadow-lg transition-all ${
          toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
        }`}>{toast.msg}</div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease forwards; }
      `}</style>
    </div>
  )
}
