"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import Link from "next/link"
import type { JobFitQuestion, JobProfile, JobResult, Gender, UniversityRank, Background } from "@/lib/job-fit-types"
import {
  SCALE_OPTIONS, UNIVERSITY_RANKS, UNIVERSITY_LABELS,
  BACKGROUNDS, RADAR_AXES, SCORE_CATEGORIES,
} from "@/lib/job-fit-types"
import { computeUserScores, calculateResults, generateInsight } from "@/lib/job-fit-engine"
import questionsData from "@/data/job-fit-questions.json"
import jobsData from "@/data/job-fit-jobs.json"

const questions = questionsData as JobFitQuestion[]
const jobs = jobsData as JobProfile[]

type Screen = "top" | "attributes" | "questions" | "loading" | "results"

export default function JobFitPage() {
  const [screen, setScreen] = useState<Screen>("top")
  const [gender, setGender] = useState<Gender | null>(null)
  const [uni, setUni] = useState<UniversityRank | null>(null)
  const [bgs, setBgs] = useState<Background[]>([])
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [results, setResults] = useState<JobResult[]>([])
  const [userScores, setUserScores] = useState<Record<string, number>>({})
  const [loadPct, setLoadPct] = useState(0)
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ msg: string; type: "error" | "success" } | null>(null)

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
            const scores = computeUserScores(questions, newAnswers, jobs)
            const res = calculateResults(scores, jobs, uni!, bgs)
            setUserScores(scores)
            setResults(res)
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
    setAnswers({}); setResults([]); setUserScores({}); setLoadPct(0)
    setExpandedJobs(new Set())
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
          <p className="text-gray-400 text-xs">28パラメーター × 8職種のベクトルマッチングを実行しています</p>
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

          {/* Job Cards */}
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🏆</span> レコメンド職種
            <span className="text-xs text-gray-400 font-normal">マッチ度順</span>
          </h3>
          <div className="space-y-4 mb-8">
            {results.map((r, i) => {
              const insight = generateInsight(userScores, r)
              const isExpanded = expandedJobs.has(r.id)
              const rankEmoji = i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`
              const uniCorrVal = r.uniCorr[uni!] ?? 0
              const totalCorr = r.correction

              return (
                <div key={r.id}
                  className={`bg-white rounded-2xl shadow-sm border p-5 transition-all ${
                    i === 0 ? "border-indigo-200 ring-1 ring-indigo-100" : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Rank + Emoji */}
                    <div className="flex flex-col items-center gap-1 min-w-[48px]">
                      <span className="text-2xl">{rankEmoji}</span>
                      <span className="text-3xl">{r.emoji}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h4 className="text-base font-bold text-gray-900">{r.company}</h4>
                        <span className="text-gray-300">|</span>
                        <span className="text-sm text-gray-600">{r.position}</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{r.desc}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {r.tags.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-medium">{t}</span>
                        ))}
                      </div>

                      {/* Insight */}
                      <div className="bg-gray-50 rounded-xl p-3 mb-2">
                        <p className="text-xs text-gray-600 leading-relaxed">
                          <span className="text-indigo-600 font-semibold">💡 なぜ向いているか：</span>
                          {insight.strengths.length > 0 && (
                            <span>あなたの <b>{insight.strengths.join("・")}</b> は、{r.company}が求める水準と高い親和性があります。</span>
                          )}
                          {insight.weaknesses.length > 0 && (
                            <span> <b>{insight.weaknesses.join("・")}</b>の強化が内定確率をさらに高めるカギになります。</span>
                          )}
                          {insight.strengths.length === 0 && insight.weaknesses.length === 0 && (
                            <span>あなたのプロフィールはこの職種の要求と幅広く合致しています。</span>
                          )}
                        </p>
                      </div>

                      {/* Background */}
                      <div className="bg-gray-50 rounded-xl p-3 mb-2">
                        <p className="text-xs font-semibold text-gray-500 mb-1.5">📊 バックグラウンド適合度</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${uniCorrVal > 0 ? "bg-emerald-100 text-emerald-600" : uniCorrVal < 0 ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-500"}`}>
                              {uniCorrVal > 0 ? "+" : ""}{uniCorrVal}%
                            </span>
                            <span className="text-gray-500">{UNIVERSITY_LABELS[uni!]} → {uniCorrVal > 0 ? "採用実績と高い親和性" : uniCorrVal < 0 ? "採用実績は限定的" : "標準的な採用層"}</span>
                          </div>
                          {bgs.filter((b) => b !== "特になし").map((bg) => {
                            const c = r.bgCorr[bg] ?? 0
                            if (c === 0) return null
                            return (
                              <div key={bg} className="flex items-center gap-1.5">
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${c > 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
                                  {c > 0 ? "+" : ""}{c}%
                                </span>
                                <span className="text-gray-500">{bg} → {c > 0 ? "選考で有利に働く経験" : "やや不利"}</span>
                              </div>
                            )
                          })}
                          <div className="pt-1 border-t border-gray-100">
                            <span className={`text-xs font-semibold ${totalCorr >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                              合計補正: {totalCorr >= 0 ? "+" : ""}{totalCorr}%
                            </span>
                            <span className="text-[10px] text-gray-400 ml-1">(上限±10%)</span>
                          </div>
                        </div>
                      </div>

                      {/* Detail toggle */}
                      <button onClick={() => setExpandedJobs((prev) => {
                        const next = new Set(prev)
                        next.has(r.id) ? next.delete(r.id) : next.add(r.id)
                        return next
                      })} className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">
                        {isExpanded ? "▲ 閉じる" : "▼ パラメーター詳細"}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                          {Object.keys(r.scores)
                            .sort((a, b) => r.scores[b] - r.scores[a])
                            .slice(0, 12)
                            .map((p) => {
                              const uVal = Math.round(userScores[p] ?? 50)
                              const jVal = r.scores[p]
                              const diff = uVal - jVal
                              const barColor = diff >= 0 ? "#6366f1" : diff >= -15 ? "#f59e0b" : "#ef4444"
                              return (
                                <div key={p} className="flex items-center gap-2 text-[10px]">
                                  <span className="w-16 text-right text-gray-400 shrink-0">{p}</span>
                                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full relative">
                                    <div className="h-full rounded-full" style={{ width: `${uVal}%`, background: barColor }} />
                                    <div className="absolute top-[-3px] w-0.5 h-[9px] bg-purple-400 rounded-full" style={{ left: `${jVal}%` }} />
                                  </div>
                                  <span className="w-14 text-right shrink-0">
                                    <b className="text-gray-700">{uVal}</b> <span className="text-gray-300">/ {jVal}</span>
                                  </span>
                                </div>
                              )
                            })}
                          <p className="text-[9px] text-gray-400 mt-1">バー = あなた ｜ <span className="text-purple-400">紫マーカー</span> = 要求値</p>
                        </div>
                      )}
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center min-w-[72px]">
                      <div className="relative w-16 h-16">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#6366f1" strokeWidth="2.5"
                            strokeDasharray={`${r.finalScore * 0.974} 100`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-black text-gray-900">{r.finalScore}</span>
                          <span className="text-[8px] text-gray-400">%</span>
                        </div>
                      </div>
                      {r.correction !== 0 && (
                        <span className={`mt-0.5 text-[10px] font-semibold ${r.correction > 0 ? "text-emerald-500" : "text-red-400"}`}>
                          {r.correction > 0 ? "+" : ""}{r.correction}%
                        </span>
                      )}
                    </div>
                  </div>
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
