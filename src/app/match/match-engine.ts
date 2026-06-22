// マッチング計算: MBTI × ガクチカ × 学歴 → 企業ランキング
// 既存エンジンの scoreCompany() を再利用（読み取りのみ・既存ファイルは変更しない）

import { scoreCompany } from "@/lib/job-fit-engine"
import type { UniversityRank, JobFitQuestion } from "@/lib/job-fit-types"
import { SCALE_OPTIONS } from "@/lib/job-fit-types"
import type { Company, IndustryGroup } from "@/types"
import typeIndustryMap from "@/data/type-industry-map.json"
import {
  mbtiToVector, ACTIVITIES, DURATIONS, lookupRank,
  type MbtiType,
} from "./match-config"

const INDUSTRY_MAP = typeIndustryMap as Record<string, string[]>

// ユーザーが選んだガクチカ1件
export interface GakuchikaSelection {
  activityKey: string
  durationKey: string
}

// 結果1社分
export interface MatchedCompany {
  name: string
  name_en: string
  industry: string
  emoji: string
  positions: string[]
  note: string
  tags: string[]
  baseScore: number      // 適性ベースのスコア
  industryBonus: number  // MBTI・ガクチカの業界マッチ加点
  correction: number     // 学歴・経歴補正（±10）
  finalScore: number     // 最終スコア(0-100)
  reasons: { label: string; value: number }[]
}

/**
 * MBTI + ガクチカ + 30問の回答 から 28パラメータのユーザーベクトルを生成
 * questions / answers は任意（未回答ならMBTI+ガクチカのみで算出）
 */
export function buildUserScores(
  mbti: MbtiType,
  selections: GakuchikaSelection[],
  questions: JobFitQuestion[] = [],
  answers: Record<number, number> = {},
): Record<string, number> {
  const v = mbtiToVector(mbti)

  // ガクチカの反映
  selections.forEach((sel) => {
    const act = ACTIVITIES.find((a) => a.key === sel.activityKey)
    const dur = DURATIONS.find((d) => d.key === sel.durationKey)
    if (!act) return
    const mult = dur?.mult ?? 1
    Object.entries(act.effects).forEach(([p, delta]) => {
      v[p] = Math.max(0, Math.min(100, (v[p] ?? 50) + (delta ?? 0) * mult))
    })
  })

  // 30問の回答の反映（7段階スケール × 各設問の効果）
  questions.forEach((q) => {
    const si = answers[q.id]
    if (si === undefined || si < 0 || si >= SCALE_OPTIONS.length) return
    const val = SCALE_OPTIONS[si].value
    q.effects.forEach((e) => {
      v[e.p] = Math.max(0, Math.min(100, (v[e.p] ?? 50) + val * e.w))
    })
  })

  return v
}

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))

/** 全企業をスコアリングして降順で返す */
export function rankCompanies(
  mbti: MbtiType,
  universityName: string,
  selections: GakuchikaSelection[],
  industries: IndustryGroup[],
  questions: JobFitQuestion[] = [],
  answers: Record<number, number> = {},
): MatchedCompany[] {
  const userScores = buildUserScores(mbti, selections, questions, answers)
  const rank: UniversityRank = lookupRank(universityName)

  // MBTIで推奨される業界（順位つき）
  const mbtiIndustries = INDUSTRY_MAP[mbti] ?? []

  const out: MatchedCompany[] = []

  industries.forEach((group) => {
    // 業界マッチ加点（MBTI由来）: 推奨リストの上位ほど高い
    const mbtiIdx = mbtiIndustries.indexOf(group.industry)
    const mbtiIndustryBonus = mbtiIdx >= 0 ? Math.max(3, 8 - mbtiIdx) : 0

    // 業界マッチ加点（ガクチカ由来）
    let gakuIndustryBonus = 0
    selections.forEach((sel) => {
      const act = ACTIVITIES.find((a) => a.key === sel.activityKey)
      const dur = DURATIONS.find((d) => d.key === sel.durationKey)
      if (act && act.industries.includes(group.industry)) {
        gakuIndustryBonus += 4 * (dur?.mult ?? 1)
      }
    })

    const industryBonus = clamp(mbtiIndustryBonus + gakuIndustryBonus, 0, 15)

    group.companies.forEach((c: Company) => {
      if (!c.requiredProfile || Object.keys(c.requiredProfile).length === 0) return
      const base = scoreCompany(userScores, c.requiredProfile)
      if (base === null) return

      // 学歴・経歴補正（±10）
      let corr = 0
      const reasons: { label: string; value: number }[] = []

      const uVal = c.uniCorr?.[rank] ?? 0
      if (uVal !== 0) { corr += uVal }

      // ガクチカ→経歴(bgCorr)への反映
      selections.forEach((sel) => {
        const act = ACTIVITIES.find((a) => a.key === sel.activityKey)
        if (act?.bg) {
          const bVal = c.bgCorr?.[act.bg] ?? 0
          if (bVal !== 0) corr += bVal
        }
      })
      corr = clamp(corr, -10, 10)

      const final = clamp(base + industryBonus + corr, 0, 100)

      if (industryBonus > 0) reasons.push({ label: "業界マッチ", value: Math.round(industryBonus * 10) / 10 })
      if (uVal !== 0) reasons.push({ label: "学歴", value: uVal })
      if (corr - uVal !== 0) reasons.push({ label: "ガクチカ", value: Math.round((corr - uVal) * 10) / 10 })

      out.push({
        name: c.name,
        name_en: c.name_en,
        industry: group.industry,
        emoji: c.emoji ?? "🏢",
        positions: c.positions ?? [],
        note: c.note ?? "",
        tags: c.tags ?? [],
        baseScore: Math.round(base * 10) / 10,
        industryBonus: Math.round(industryBonus * 10) / 10,
        correction: Math.round(corr * 10) / 10,
        finalScore: Math.round(final * 10) / 10,
        reasons,
      })
    })
  })

  out.sort((a, b) => b.finalScore - a.finalScore)
  return out
}
