"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import Link from "next/link"
import type { JobFitQuestion, Gender, UniversityRank, Background, MajorType } from "@/lib/job-fit-types"
import {
  SCALE_OPTIONS, UNIVERSITY_LABELS,
  BACKGROUNDS, SCORE_CATEGORIES,
} from "@/lib/job-fit-types"
import {
  computeUserScores,
  getUniversityDeviationByName,
  getUniversityRankByName,
  scoreCompanyWithMarketReality,
  UNIVERSITY_DEVIATION_BY_NAME,
} from "@/lib/job-fit-engine"
import type { IndustryGroup, Company } from "@/types"
import questionsData from "@/data/job-fit-questions.json"
import companiesData from "@/data/companies.json"
import accentureDeloitte from "@/data/job-profiles/accenture_deloitte.json"
import pwcNri from "@/data/job-profiles/pwc_nri.json"
import gafa from "@/data/job-profiles/gafa.json"
import tradingCompanies from "@/data/job-profiles/trading_companies.json"
import finance from "@/data/job-profiles/finance.json"
import manufacturing from "@/data/job-profiles/manufacturing.json"
import infraSi from "@/data/job-profiles/infra_si.json"
import mediaServiceIt from "@/data/job-profiles/media_service_it.json"
import universityData from "@/data/university_data.json"
import genderData from "@/data/gender_background_data.json"

const questions = questionsData as JobFitQuestion[]
const allIndustries = companiesData as IndustryGroup[]
const OTHER_UNIVERSITY_VALUE = "その他・リストにない大学"
const UNIVERSITY_DATALIST_ID = "job-fit-university-options"
const UNIVERSITY_OPTIONS = Object.entries(UNIVERSITY_DEVIATION_BY_NAME)
  .map(([name, deviation]) => ({ name, deviation }))
  .sort((a, b) => b.deviation - a.deviation || a.name.localeCompare(b.name, "ja"))

type Profile = {
  company: string
  position: string
  industry: string
  description: string
  archetype_id?: string
  applies_to?: string[]
  ideal_profile: {
    description: string
    concrete_examples: string[]
  }
  personality_scores: Record<string, number>
  mbti_ranking: (string | { rank?: number; type?: string; reason?: string })[]
  big_five: Record<string, number>
  values: Record<string, number>
  work_style: { suitable_environments: string[]; unsuitable_environments: string[] }
  career_aptitude?: { suitable_careers: string[]; unsuitable_careers: string[] }
  student_features: Record<string, string[]>
  feature_tags: string[]
}

type UniEntry = {
  company: string
  industry: string
  university_tier: string
  hiring_universities: Record<string, { universities?: string[]; percentage: number }>
  position_university_pattern: Record<string, { min_tier: string; notes: string }>
  gender_pattern: Record<string, { min_tier: string; notes?: string }>
  background_preference: Record<string, { preference: string; notes?: string }>
  confidence: string
}

type GenderEntry = {
  company: string
  industry: string
  gender_data: {
    overall_male_pct: number
    overall_female_pct: number
    new_grad_male_pct?: number
    new_grad_female_pct?: number
    by_position?: Record<string, { male: number; female: number }>
    confidence: string
  }
  background_data: {
    athlete_pct: number
    returnee_pct: number
    stem_grad_pct: number
    study_abroad_pct?: number
    confidence: string
  }
  hiring_volume?: { total: number }
}

const allJobProfiles: Profile[] = [
  ...accentureDeloitte,
  ...pwcNri,
  ...gafa,
  ...tradingCompanies,
  ...finance,
  ...manufacturing,
  ...infraSi,
  ...mediaServiceIt,
] as Profile[]

const uniData = universityData as unknown as UniEntry[]
const genData = genderData as unknown as GenderEntry[]

const SCORE_LABELS: Record<string, string> = {
  logic: "論理性",
  creativity: "創造性",
  empathy: "共感力",
  cooperativeness: "協調性",
  competitiveness: "競争性",
  initiative: "主体性",
  planning: "計画性",
  action_orientation: "行動力",
  stress_tolerance: "ストレス耐性",
  learning_speed: "学習速度",
  intellectual_curiosity: "知的好奇心",
  analytical_ability: "分析力",
  abstract_thinking: "抽象思考力",
  communication: "コミュ力",
  presentation: "プレゼン力",
  negotiation: "交渉力",
  leadership: "リーダーシップ",
  patience: "忍耐力",
  flexibility: "柔軟性",
  discipline: "規律性",
}

const BIG5_LABELS: Record<string, string> = {
  openness: "開放性",
  conscientiousness: "誠実性",
  extraversion: "外向性",
  agreeableness: "協調性",
  neuroticism: "神経症傾向",
}

const VALUE_LABELS: Record<string, string> = {
  growth: "成長志向",
  stability: "安定志向",
  social_contribution: "社会貢献",
  income: "収入志向",
  autonomy: "裁量志向",
  expertise: "専門性志向",
  teamwork: "チーム志向",
}

const STUDENT_FEATURE_LABELS: Record<string, string> = {
  high_school: "高校",
  university: "大学",
  part_time_job: "バイト",
  club_activities: "部活",
  internship: "インターン",
}

const TIER_COLORS: Record<string, string> = {
  S: "bg-red-100 text-red-800",
  A: "bg-orange-100 text-orange-800",
  B: "bg-yellow-100 text-yellow-800",
  C: "bg-green-100 text-green-800",
  D: "bg-gray-100 text-gray-800",
}

interface ScoredCompany extends Company {
  industry: string
  baseScore: number
  correction: number
  finalScore: number
  strengths: string[]
  weaknesses: string[]
  corrDetails: { label: string; value: number; reason: string; unit?: string }[]
  personalityScore: number
  marketScore: number
  candidateMarketScore: number
  candidateMarketLevel: string
  companyDifficulty: number
  marketGap: number
  marketReach: string
  detailProfiles: Profile[]
  uniEntries: UniEntry[]
  genderEntries: GenderEntry[]
}

type Screen = "top" | "attributes" | "questions" | "loading" | "results"

function normalizeText(value = "") {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[（）()・\s　、,./／|｜]/g, "")
}

function namesOverlap(left = "", right = "") {
  const a = normalizeText(left)
  const b = normalizeText(right)
  return Boolean(a && b && (a.includes(b) || b.includes(a)))
}

function profileMatchesCompany(company: Company, profile: Profile) {
  if (namesOverlap(company.name, profile.company) || namesOverlap(company.name_en, profile.company)) {
    return true
  }

  return Boolean(profile.applies_to?.some((name) => (
    namesOverlap(company.name, name) || namesOverlap(company.name_en, name)
  )))
}

const POSITION_KEYWORDS = [
  "事務系",
  "技術系",
  "総合職",
  "営業",
  "マーケティング",
  "企画",
  "コーポレート",
  "ネットワーク",
  "研究開発",
  "データサイエンス",
  "SE",
  "エンジニア",
  "コンサルタント",
  "デザイン",
  "クリエイティブ",
]

function positionMatchesCompany(company: Company, profile: Profile) {
  const profilePosition = normalizeText(profile.position)
  return company.positions.some((position) => {
    const companyPosition = normalizeText(position)
    if (companyPosition.includes(profilePosition) || profilePosition.includes(companyPosition)) {
      return true
    }

    return POSITION_KEYWORDS.some((keyword) => {
      const normalizedKeyword = normalizeText(keyword)
      return companyPosition.includes(normalizedKeyword) && profilePosition.includes(normalizedKeyword)
    })
  })
}

function getProfilesForCompany(company: Company) {
  const companyProfiles = allJobProfiles.filter((profile) => profileMatchesCompany(company, profile))
  const positionMatched = companyProfiles.filter((profile) => positionMatchesCompany(company, profile))
  return positionMatched.length > 0 ? positionMatched : companyProfiles
}

function getUniEntriesForCompany(company: Company) {
  return uniData.filter((entry) => (
    namesOverlap(company.name, entry.company) || namesOverlap(company.name_en, entry.company)
  ))
}

function getGenderEntriesForCompany(company: Company) {
  return genData.filter((entry) => (
    namesOverlap(company.name, entry.company) || namesOverlap(company.name_en, entry.company)
  ))
}

function DetailScoreBar({ label, value, color = "primary" }: { label: string; value: number; color?: "primary" | "emerald" | "amber" }) {
  const barColor = color === "primary" ? "#4298b4" : color === "emerald" ? "#33a474" : "#f59e0b"

  return (
    <div className="flex items-center gap-2 text-[10px] sm:text-xs">
      <span className="w-20 shrink-0 text-right font-semibold text-gray-400">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-gray-200">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: barColor }} />
      </div>
      <span className="w-8 shrink-0 text-right font-mono font-bold text-gray-600">{value}</span>
    </div>
  )
}

function normalizeMbtiRankingItem(
  item: string | { rank?: number; type?: string; reason?: string },
  index: number,
) {
  if (typeof item === "string") {
    return {
      rank: index + 1,
      type: item,
      reason: "",
    }
  }

  return {
    rank: item.rank ?? index + 1,
    type: item.type ?? `TYPE${index + 1}`,
    reason: item.reason ?? "",
  }
}

function getProfileKey(profile: Profile, index: number) {
  return [
    profile.company || "company",
    profile.position || "position",
    profile.archetype_id || "profile",
    index,
  ].join("-")
}

function ProfileDetailCard({ profile, defaultOpen = false }: { profile: Profile; defaultOpen?: boolean }) {
  const topMbti = profile.mbti_ranking?.[0]
    ? normalizeMbtiRankingItem(profile.mbti_ranking[0], 0).type
    : null

  return (
    <details open={defaultOpen} className="group/profile rounded-xl border border-gray-100 bg-white">
      <summary className="cursor-pointer list-none px-4 py-3 select-none">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-black text-gray-900">{profile.company}</span>
              <span className="text-gray-300">|</span>
              <span className="text-sm font-bold text-[#4298b4]">{profile.position}</span>
              {topMbti && (
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                  {topMbti}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">{profile.description}</p>
          </div>
          <span className="shrink-0 text-xs font-bold text-gray-400 transition-transform group-open/profile:rotate-90">▶</span>
        </div>
      </summary>

      <div className="space-y-5 border-t border-gray-100 px-4 py-4">
        {profile.applies_to && profile.applies_to.length > 0 && (
          <section>
            <h6 className="mb-2 text-xs font-bold text-gray-700">適用企業</h6>
            <div className="flex flex-wrap gap-1">
              {profile.applies_to.map((companyName) => (
                <span key={companyName} className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                  {companyName}
                </span>
              ))}
            </div>
          </section>
        )}

        <section>
          <h6 className="mb-2 text-xs font-bold text-gray-700">向いている人物像</h6>
          <p className="mb-2 text-xs leading-relaxed text-gray-600">{profile.ideal_profile.description}</p>
          <ul className="space-y-1">
            {profile.ideal_profile.concrete_examples.map((example, index) => (
              <li key={index} className="flex items-start gap-1.5 text-xs leading-relaxed text-gray-500">
                <span className="mt-0.5 text-[#4298b4]">-</span>
                <span>{example}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h6 className="mb-2 text-xs font-bold text-gray-700">性格特性スコア（20項目）</h6>
          <div className="grid gap-1.5 md:grid-cols-2">
            {Object.entries(profile.personality_scores).map(([key, value]) => (
              <DetailScoreBar key={key} label={SCORE_LABELS[key] || key} value={value} />
            ))}
          </div>
        </section>

        <section>
          <h6 className="mb-2 text-xs font-bold text-gray-700">タイプ適性ランキング（全16タイプ）</h6>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
            {profile.mbti_ranking.map((rawItem, index) => {
              const item = normalizeMbtiRankingItem(rawItem, index)
              return (
                <div
                  key={`${profile.company}-${profile.position}-mbti-${item.rank}-${item.type}-${index}`}
                  className={`rounded-lg px-2 py-1.5 text-xs ${
                    item.rank <= 3
                      ? "border border-purple-200 bg-purple-50"
                      : item.rank <= 8
                        ? "border border-gray-100 bg-gray-50"
                        : "bg-gray-50/70"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className={`font-black ${item.rank <= 3 ? "text-purple-700" : "text-gray-400"}`}>{item.rank}.</span>
                    <span className={`font-black ${item.rank <= 3 ? "text-purple-700" : "text-gray-700"}`}>{item.type}</span>
                  </div>
                  {item.reason && <p className="mt-0.5 text-[10px] leading-relaxed text-gray-500">{item.reason}</p>}
                </div>
              )
            })}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div>
            <h6 className="mb-2 text-xs font-bold text-gray-700">Big Five</h6>
            <div className="space-y-1.5">
              {Object.entries(profile.big_five).map(([key, value]) => (
                <DetailScoreBar key={key} label={BIG5_LABELS[key] || key} value={value} color="emerald" />
              ))}
            </div>
          </div>
          <div>
            <h6 className="mb-2 text-xs font-bold text-gray-700">価値観</h6>
            <div className="space-y-1.5">
              {Object.entries(profile.values).map(([key, value]) => (
                <DetailScoreBar key={key} label={VALUE_LABELS[key] || key} value={value} color="amber" />
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div>
            <h6 className="mb-1 text-xs font-bold text-green-700">向いている環境</h6>
            <ul className="space-y-0.5">
              {profile.work_style.suitable_environments.map((environment, index) => (
                <li key={index} className="text-xs leading-relaxed text-gray-600">+ {environment}</li>
              ))}
            </ul>
          </div>
          <div>
            <h6 className="mb-1 text-xs font-bold text-red-700">向いていない環境</h6>
            <ul className="space-y-0.5">
              {profile.work_style.unsuitable_environments.map((environment, index) => (
                <li key={index} className="text-xs leading-relaxed text-gray-600">- {environment}</li>
              ))}
            </ul>
          </div>
        </section>

        {profile.career_aptitude && (
          <section className="grid gap-4 md:grid-cols-2">
            <div>
              <h6 className="mb-1 text-xs font-bold text-[#4298b4]">向いているキャリア</h6>
              <ul className="space-y-0.5">
                {profile.career_aptitude.suitable_careers.map((career, index) => (
                  <li key={index} className="text-xs leading-relaxed text-gray-600">+ {career}</li>
                ))}
              </ul>
            </div>
            <div>
              <h6 className="mb-1 text-xs font-bold text-amber-700">向いていないキャリア</h6>
              <ul className="space-y-0.5">
                {profile.career_aptitude.unsuitable_careers.map((career, index) => (
                  <li key={index} className="text-xs leading-relaxed text-gray-600">- {career}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section>
          <h6 className="mb-2 text-xs font-bold text-gray-700">学生時代の特徴</h6>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {Object.entries(profile.student_features).map(([key, items]) => (
              <div key={key} className="rounded-lg bg-gray-50 p-2">
                <span className="text-[10px] font-bold text-gray-500">{STUDENT_FEATURE_LABELS[key] || key}</span>
                <ul className="mt-1 space-y-0.5">
                  {items.map((item, index) => (
                    <li key={index} className="text-[10px] leading-relaxed text-gray-500">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h6 className="mb-2 text-xs font-bold text-gray-700">特徴タグ（{profile.feature_tags.length}個）</h6>
          <div className="flex flex-wrap gap-1">
            {profile.feature_tags.map((tag) => (
              <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                {tag}
              </span>
            ))}
          </div>
        </section>
      </div>
    </details>
  )
}

function UniversityDataPanel({ entries }: { entries: UniEntry[] }) {
  if (entries.length === 0) return null

  return (
    <section className="rounded-xl bg-blue-50/60 p-4">
      <h6 className="mb-3 text-xs font-bold text-blue-800">採用大学データ</h6>
      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={`${entry.company}-${entry.industry}`} className="rounded-lg bg-white/70 p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-gray-800">{entry.company}</span>
              <span className="text-[10px] text-gray-500">{entry.industry}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${TIER_COLORS[entry.university_tier] || "bg-gray-100 text-gray-700"}`}>
                Tier {entry.university_tier}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {Object.entries(entry.hiring_universities).map(([tier, data]) => (
                <div key={tier} className="rounded-lg bg-blue-50 px-2 py-2 text-center">
                  <div className="text-[10px] uppercase text-gray-500">{tier}</div>
                  <div className="text-lg font-black text-blue-700">{data.percentage}%</div>
                </div>
              ))}
            </div>
            {entry.position_university_pattern && (
              <div className="mt-2 space-y-1">
                {Object.entries(entry.position_university_pattern).map(([position, pattern]) => (
                  <p key={position} className="text-[10px] leading-relaxed text-gray-600">
                    <span className="font-bold">{position}</span>: 最低Tier {pattern.min_tier} - {pattern.notes}
                  </p>
                ))}
              </div>
            )}
            {entry.gender_pattern && (
              <div className="mt-2 space-y-1">
                {Object.entries(entry.gender_pattern).map(([genderKey, pattern]) => (
                  <p key={genderKey} className="text-[10px] leading-relaxed text-gray-600">
                    <span className="font-bold">{genderKey === "male" ? "男性" : "女性"}</span>: 最低Tier {pattern.min_tier}
                    {pattern.notes ? ` - ${pattern.notes}` : ""}
                  </p>
                ))}
              </div>
            )}
            {entry.background_preference && (
              <div className="mt-2 flex flex-wrap gap-1">
                {Object.entries(entry.background_preference).map(([key, value]) => (
                  <span key={key} className="rounded bg-white px-1.5 py-0.5 text-[10px] text-gray-500">
                    {key}: {value.preference}{value.notes ? ` / ${value.notes}` : ""}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-2 text-[10px] text-gray-400">信頼度: {entry.confidence}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function GenderDataPanel({ entries }: { entries: GenderEntry[] }) {
  if (entries.length === 0) return null

  return (
    <section className="rounded-xl bg-pink-50/60 p-4">
      <h6 className="mb-3 text-xs font-bold text-pink-800">男女比・バックグラウンド</h6>
      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={`${entry.company}-${entry.industry}`} className="rounded-lg bg-white/70 p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-gray-800">{entry.company}</span>
              <span className="text-[10px] text-gray-500">{entry.industry}</span>
              {entry.hiring_volume && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                  採用数 {entry.hiring_volume.total}名
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="rounded-lg bg-blue-50 p-2 text-center">
                <div className="text-[10px] text-gray-500">男性</div>
                <div className="text-lg font-black text-blue-600">{entry.gender_data.overall_male_pct}%</div>
              </div>
              <div className="rounded-lg bg-pink-50 p-2 text-center">
                <div className="text-[10px] text-gray-500">女性</div>
                <div className="text-lg font-black text-pink-600">{entry.gender_data.overall_female_pct}%</div>
              </div>
              <div className="rounded-lg bg-orange-50 p-2 text-center">
                <div className="text-[10px] text-gray-500">体育会</div>
                <div className="text-lg font-black text-orange-600">{entry.background_data.athlete_pct}%</div>
              </div>
              <div className="rounded-lg bg-green-50 p-2 text-center">
                <div className="text-[10px] text-gray-500">帰国子女</div>
                <div className="text-lg font-black text-green-600">{entry.background_data.returnee_pct}%</div>
              </div>
              <div className="rounded-lg bg-purple-50 p-2 text-center">
                <div className="text-[10px] text-gray-500">理系</div>
                <div className="text-lg font-black text-purple-600">{entry.background_data.stem_grad_pct}%</div>
              </div>
            </div>
            {entry.gender_data.by_position && (
              <div className="mt-2 space-y-1">
                {Object.entries(entry.gender_data.by_position).map(([position, ratio]) => (
                  <p key={position} className="text-[10px] leading-relaxed text-gray-600">
                    <span className="font-bold">{position}</span>: 男{ratio.male}% / 女{ratio.female}%
                  </p>
                ))}
              </div>
            )}
            <p className="mt-2 text-[10px] text-gray-400">信頼度: {entry.gender_data.confidence} / 背景データ: {entry.background_data.confidence}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function CompanyProfileDetails({
  profiles,
  uniEntries,
  genderEntries,
  defaultOpen = false,
}: {
  profiles: Profile[]
  uniEntries: UniEntry[]
  genderEntries: GenderEntry[]
  defaultOpen?: boolean
}) {
  if (profiles.length === 0 && uniEntries.length === 0 && genderEntries.length === 0) return null

  return (
    <details open={defaultOpen} className="group/company mt-3">
      <summary className="w-full cursor-pointer list-none select-none rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-[#4298b4]/40 hover:bg-[#eef7fa]/50 sm:w-[18rem] md:w-1/3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black text-gray-700">職種詳細プロフィール</p>
            <p className="mt-0.5 text-[10px] text-gray-400">
              {profiles.length}職種 / 採用大学{uniEntries.length}件 / 男女比{genderEntries.length}件
            </p>
          </div>
          <span className="text-xs font-bold text-gray-400 transition-transform group-open/company:rotate-90">▶</span>
        </div>
      </summary>
      <div className="mt-3 space-y-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-3">
        {profiles.map((profile, index) => (
          <ProfileDetailCard
            key={getProfileKey(profile, index)}
            profile={profile}
            defaultOpen={index === 0}
          />
        ))}
        <UniversityDataPanel entries={uniEntries} />
        <GenderDataPanel entries={genderEntries} />
      </div>
    </details>
  )
}

export default function JobFitPage() {
  const [screen, setScreen] = useState<Screen>("attributes")
  const [gender, setGender] = useState<Gender | null>(null)
  const [majorType, setMajorType] = useState<MajorType | null>(null)
  const [uni, setUni] = useState<UniversityRank | null>(null)
  const [universityName, setUniversityName] = useState("")
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
    const candidateMarketProfile = {
      universityName: universityName === OTHER_UNIVERSITY_VALUE ? undefined : universityName,
      universityRank: uni,
      gender: gender ?? undefined,
      backgrounds: bgs,
    }

    allIndustries.forEach((group) => {
      group.companies.forEach((c) => {
        if (c.requiredProfile && Object.keys(c.requiredProfile).length > 0) {
          const weighted = scoreCompanyWithMarketReality(userScores, c.requiredProfile, candidateMarketProfile, {
            name: c.name,
            nameEn: c.name_en,
            industry: group.industry,
            positions: c.positions,
          })

          if (weighted !== null) {
            const base = weighted.personalityScore
            const realismCorrection = Math.round((weighted.finalScore - weighted.personalityScore) * 10) / 10
            const marketAdvantage = Math.round((weighted.candidateScore - weighted.companyDifficulty) * 10) / 10
            const corrDetails: { label: string; value: number; reason: string; unit?: string }[] = [
              {
                label: "就活偏差値",
                value: marketAdvantage,
                reason: `${weighted.reach}：あなた${weighted.candidateScore} / 企業${weighted.companyDifficulty}`,
                unit: "pt",
              },
              {
                label: "現実補正",
                value: realismCorrection,
                reason: "就活偏差値70%・性格適合30%で最終MATCHに反映",
                unit: "%",
              },
            ]

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
              correction: realismCorrection,
              finalScore: weighted.finalScore,
              strengths,
              weaknesses,
              corrDetails,
              personalityScore: weighted.personalityScore,
              marketScore: weighted.marketScore,
              candidateMarketScore: weighted.candidateScore,
              candidateMarketLevel: weighted.candidateLevel,
              companyDifficulty: weighted.companyDifficulty,
              marketGap: weighted.gap,
              marketReach: weighted.reach,
              detailProfiles: getProfilesForCompany(c),
              uniEntries: getUniEntriesForCompany(c),
              genderEntries: getGenderEntriesForCompany(c),
            })
          }
        }
      })
    })
    scored.sort((a, b) => b.finalScore - a.finalScore)
    return scored
  }, [userScores, uni, universityName, gender, bgs])

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

  const selectUniversity = useCallback((value: string) => {
    setUniversityName(value)
    if (!value) {
      setUni(null)
      return
    }
    setUni(value === OTHER_UNIVERSITY_VALUE ? "その他" : getUniversityRankByName(value))
  }, [])

  // ── Submit attributes ──
  const submitAttrs = useCallback(() => {
    if (!gender) { showToast("性別を選択してください"); return }
    if (!uni || !universityName) { showToast("大学を選択してください"); return }
    const finalBgs = bgs.length === 0 ? ["特になし" as Background] : bgs
    setBgs(finalBgs)
    setQIdx(0)
    setAnswers({})
    setScreen("questions")
  }, [gender, uni, universityName, bgs, showToast])

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
  }, [answers, qIdx])

  // ── Restart ──
  const restart = useCallback(() => {
    setGender(null); setMajorType(null); setUni(null); setUniversityName(""); setBgs([]); setQIdx(0)
    setAnswers({}); setUserScores({}); setLoadPct(0)
    setExpandedIndustries(new Set())
    setScreen("attributes")
  }, [])

  // Scroll to top on screen change
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }) }, [screen])

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden" style={{ background: "url('/job-fit-bg.png') center top / cover no-repeat, #f4f2f7" }}>
      {/* ── ATTRIBUTES ── */}
      {screen === "attributes" && (
        <div className="max-w-3xl mx-auto px-4 h-full flex items-center animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 w-full">
            {/* Step header with progress bar and feature badges */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#1a56a8] tracking-wider">STEP 1 / 3</span>
                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1a56a8] rounded-full" style={{ width: "33%" }} />
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                  約5〜7分
                </span>
                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" /><path d="M9 12l2 2 4-4" /></svg>
                  精度の高い診断
                </span>
                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" /></svg>
                  最適な仕事探索
                </span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">あなたのプロフィール</h2>
            <p className="text-[11px] text-gray-400 mb-5">ご回答いただいた内容は、あなたに合った職種をより正確に診断するために利用します。</p>

            {/* Gender */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-[#1a56a8]"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                性別
                <span className="text-[9px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded">必須</span>
              </label>
              <div className="flex gap-3">
                {(["男", "女"] as Gender[]).map((g) => (
                  <button key={g} onClick={() => setGender(g)}
                    className={`flex-1 relative flex flex-col items-center gap-1 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                      gender === g ? "bg-[#eef4fb] text-[#1a56a8] border-[#1a56a8]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {gender === g && (
                      <span className="absolute top-2 right-2 w-5 h-5 bg-[#1a56a8] rounded-full flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3"><path d="M5 12l5 5L20 7" /></svg>
                      </span>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={g === "男" ? "/characters/male.png" : "/characters/female.png"}
                      alt=""
                      className="h-16 w-auto object-contain"
                    />
                    <span className="font-bold">{g === "男" ? "男性" : "女性"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Major Type */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-[#1a56a8]"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>
                文理
                <span className="text-[9px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded">必須</span>
              </label>
              <div className="flex gap-3">
                {(["文系", "理系"] as MajorType[]).map((m) => (
                  <button key={m} onClick={() => setMajorType(m)}
                    className={`flex-1 relative py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                      majorType === m ? "bg-[#eef4fb] text-[#1a56a8] border-[#1a56a8]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {majorType === m && (
                      <span className="absolute top-2 right-2 w-5 h-5 bg-[#1a56a8] rounded-full flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3"><path d="M5 12l5 5L20 7" /></svg>
                      </span>
                    )}
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* University */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-[#1a56a8]"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" /></svg>
                大学
                <span className="text-[9px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded">必須</span>
              </label>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                <input
                  type="text"
                  list={UNIVERSITY_DATALIST_ID}
                  value={universityName}
                  autoComplete="off"
                  placeholder="大学名を検索・選択してください"
                  onChange={(event) => selectUniversity(event.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition-colors focus:border-[#1a56a8] focus:ring-2 focus:ring-[#1a56a8]/10"
                />
              </div>
              <datalist id={UNIVERSITY_DATALIST_ID}>
                {UNIVERSITY_OPTIONS.map((item) => (
                  <option key={item.name} value={item.name} label={`就活偏差値 ${item.deviation}`} />
                ))}
                <option value={OTHER_UNIVERSITY_VALUE} label="就活偏差値 50.0" />
              </datalist>
              {universityName && (
                <p className="mt-1 text-[10px] text-gray-400">
                  {universityName === OTHER_UNIVERSITY_VALUE
                    ? "その他として計算します。"
                    : `${UNIVERSITY_LABELS[getUniversityRankByName(universityName)]} / 就活偏差値 ${getUniversityDeviationByName(universityName) ?? 50}`}
                </p>
              )}
            </div>

            {/* Backgrounds */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-[#1a56a8]"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                バックグラウンド属性
                <span className="text-[10px] text-gray-400 font-normal">（複数選択可）</span>
                <span className="text-[9px] text-gray-400 font-normal bg-gray-100 px-1.5 py-0.5 rounded">任意</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {BACKGROUNDS.map(({ key, label }) => (
                  <button key={key} onClick={() => toggleBg(key)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium border-2 transition-all ${
                      bgs.includes(key) ? "bg-[#eef4fb] text-[#1a56a8] border-[#1a56a8]" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {bgs.includes(key) && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M5 12l5 5L20 7" /></svg>
                    )}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={submitAttrs}
              className="w-full py-3.5 bg-[#1a56a8] text-white font-bold rounded-full text-sm hover:bg-[#154a91] transition-colors shadow-md flex items-center justify-center gap-2"
            >
              質問へ進む
              <span aria-hidden>&#8250;</span>
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-3 flex items-center justify-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" /></svg>
              ご入力いただいた情報は診断の目的のみに使用し、第三者に提供することはありません。
            </p>
          </div>
        </div>
      )}

      {/* ── QUESTIONS ── */}
      {screen === "questions" && (
        <div className="max-w-xl mx-auto w-full px-6 pt-6 pb-10 animate-fadeIn">
          {/* Progress */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white text-xs font-medium border border-gray-100">
              {questions[qIdx].icon} {questions[qIdx].sec}
            </span>
            <span>{qIdx + 1} / {questions.length}</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-[#4298b4] rounded-full transition-all duration-300" style={{ width: `${((qIdx + 1) / questions.length) * 100}%` }} />
          </div>

          {/* Question */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 mb-4">
            <p className="text-xl sm:text-2xl font-bold text-gray-800 text-center leading-relaxed mb-10 min-h-[84px] break-words">
              {questions[qIdx].text}
            </p>
            <div className="px-1 sm:px-2">
              <div className="mx-auto flex w-full max-w-[17rem] sm:max-w-[22rem] flex-nowrap items-center justify-center gap-1.5 sm:gap-2">
              {SCALE_OPTIONS.map((opt, si) => {
                const selected = answers[questions[qIdx].id] === si
                const sizes = [
                  "w-8 h-8 sm:w-12 sm:h-12",
                  "w-7 h-7 sm:w-10 sm:h-10",
                  "w-6 h-6 sm:w-9 sm:h-9",
                  "w-5 h-5 sm:w-7 sm:h-7",
                  "w-6 h-6 sm:w-9 sm:h-9",
                  "w-7 h-7 sm:w-10 sm:h-10",
                  "w-8 h-8 sm:w-12 sm:h-12",
                ]
                const selectedColor =
                  si < 3
                    ? "bg-[#33a474] border-[#33a474] shadow-lg shadow-[#33a474]/20"
                    : si === 3
                      ? "bg-gray-300 border-gray-300"
                      : "bg-[#7c5e99] border-[#7c5e99] shadow-lg shadow-[#7c5e99]/20"
                return (
                  <button key={si} onClick={() => answerQ(si)}
                    aria-label={opt.label}
                    title={opt.label}
                    className={`${sizes[si]} shrink-0 rounded-full border-2 active:scale-90 transition-all duration-200 ${
                      selected ? selectedColor : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                    }`}
                  />
                )
              })}
              </div>
              <div className="mx-auto mt-3 flex w-full max-w-[17rem] sm:max-w-[22rem] items-center justify-between text-xs sm:text-sm font-medium">
                <span className="text-[#33a474]">当てはまる</span>
                <span className="text-[#7c5e99]">当てはまらない</span>
              </div>
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
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#4298b4" strokeWidth="2.5"
                strokeDasharray={`${loadPct * 0.974} 100`} strokeLinecap="round"
                className="transition-all duration-100" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-[#4298b4]">{loadPct}%</span>
            </div>
          </div>
          <p className="text-gray-800 font-semibold text-lg mb-1">あなたの適性を分析中...</p>
          <p className="text-gray-400 text-xs">28パラメーター × {allIndustries.reduce((s, g) => s + g.companies.length, 0)}社のベクトルマッチングを実行しています</p>
        </div>
      )}

      {/* ── RESULTS ── */}
      {screen === "results" && (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eef8f3] text-[#33a474] text-xs font-bold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#33a474]" /> 分析完了
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">あなたの適合度分析結果</h2>
            <p className="text-xs text-gray-400">
              {gender === "男" ? "男性" : "女性"} ・ {majorType ?? "未選択"} ・ {universityName === OTHER_UNIVERSITY_VALUE ? "その他・リストにない大学" : universityName} ・ {bgs.join(", ")}
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
                <span className="w-1 h-5 bg-[#4298b4] rounded-full" /> レコメンド企業
                <span className="text-xs text-gray-400 font-normal">マッチ度順</span>
              </h3>
              <div className="space-y-4 mb-8">
                {scoredCompanies.slice(0, 20).map((c, i) => {
                  const rankEmoji = i < 3 ? ["🥇", "🥈", "🥉"][i] : null;
                  const rankText = rankEmoji ? "" : `#${i + 1}`;
                  return (
                    <div key={`${c.industry}-${c.name}-${i}`}
                      className={`bg-white rounded-2xl shadow-sm border p-6 transition-all ${
                        i === 0 ? "border-[#4298b4]/40 ring-2 ring-[#eef7fa]" : "border-gray-100"
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
                              <span className="text-sm font-black text-[#4298b4] bg-[#eef7fa] px-2 py-0.5 rounded-md">{rankText}</span>
                            )}
                            <span className="text-2xl">{c.emoji || "🏢"}</span>
                            <h4 className="text-lg font-black text-gray-900 leading-tight">
                              {c.name} <span className="text-gray-400 font-normal mx-1">|</span> <span className="text-[#4298b4] font-bold">{c.positions.join("・")}</span>
                            </h4>
                          </div>

                          {c.note && (
                            <p className="text-xs text-gray-600 font-medium mb-3 pl-1 border-l-2 border-[#4298b4]/25">
                              {c.note}
                            </p>
                          )}

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold">{c.industry}</span>
                            {(c.tags || []).map((t) => (
                              <span key={t} className="px-2 py-0.5 rounded-full bg-[#eef7fa] text-[#4298b4] text-[10px] font-semibold">{t}</span>
                            ))}
                          </div>

                          {/* Why Suitable Insight */}
                          {c.strengths.length > 0 && (
                            <div className="bg-[#eef7fa] rounded-xl p-3 mb-4 text-xs leading-relaxed text-gray-700">
                              <span className="font-bold text-[#4298b4]">なぜ向いているか：</span>
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
                                <span>📊</span> 就活偏差値・現実判定
                              </p>
                              <div className="space-y-1">
                                {c.corrDetails.map((det, di) => (
                                  <div key={di} className="flex justify-between items-center text-[10px]">
                                    <span className="text-gray-500">{det.label} → {det.reason}</span>
                                    <span className={`font-bold ${det.value > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                                      {det.value > 0 ? `+${det.value}${det.unit ?? "%"}` : `${det.value}${det.unit ?? "%"}`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Parameter bars */}
                          <details className="group mt-3">
                            <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[11px] font-black text-gray-700 shadow-sm transition-colors hover:border-[#4298b4]/40 hover:bg-[#eef7fa]/50 sm:w-[18rem] md:w-1/3">
                              <span>求められる人物像と素養</span>
                              <span className="text-xs text-gray-400 transition-transform group-open:rotate-90">▶</span>
                            </summary>
                            <div className="bg-gray-50 rounded-xl p-4 mt-2 space-y-2">
                              {Object.keys(c.requiredProfile)
                                .sort((a, b) => c.requiredProfile[b] - c.requiredProfile[a])
                                .slice(0, 8)
                                .map((p) => {
                                  const uVal = Math.round(userScores[p] ?? 50)
                                  const jVal = c.requiredProfile[p]
                                  const diff = uVal - jVal
                                  const barColor = diff >= 0 ? "#4298b4" : diff >= -15 ? "#f59e0b" : "#ef4444"
                                  return (
                                    <div key={p} className="flex items-center gap-2 text-[10px]">
                                      <span className="w-16 text-right text-gray-400 shrink-0 font-semibold">{p}</span>
                                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full relative">
                                        <div className="h-full rounded-full" style={{ width: `${uVal}%`, background: barColor }} />
                                        <div className="absolute top-[-3px] w-0.5 h-[9px] bg-[#7c5e99] rounded-full" style={{ left: `${jVal}%` }} />
                                      </div>
                                      <span className="w-14 text-right shrink-0">
                                        <b className="text-gray-700">{uVal}</b> <span className="text-gray-400">/ {jVal}</span>
                                      </span>
                                    </div>
                                  )
                              })}
                            </div>
                          </details>

                          <CompanyProfileDetails
                            profiles={c.detailProfiles}
                            uniEntries={c.uniEntries}
                            genderEntries={c.genderEntries}
                            defaultOpen={i === 0}
                          />
                        </div>

                        {/* Right Score Column */}
                        <div className="flex flex-row md:flex-col items-center justify-between md:justify-center shrink-0 p-3 bg-gray-50/50 rounded-2xl border border-gray-100 min-w-[120px] self-stretch md:self-auto">
                          <div className="flex flex-col items-center">
                            <div className="relative w-20 h-20">
                              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
                                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#4298b4" strokeWidth="3"
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
                            <div>就活: {c.candidateMarketScore}</div>
                            <div>企業: {c.companyDifficulty}</div>
                            <div className={c.marketReach === "高望み" ? "text-amber-600 font-medium" : "text-emerald-600 font-medium"}>
                              {c.marketReach}
                            </div>
                            <div>性格: {c.personalityScore}%</div>
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#4298b4] focus:border-transparent"
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
                        if (next.has(group.industry)) {
                          next.delete(group.industry)
                        } else {
                          next.add(group.industry)
                        }
                        return next
                      })}
                      className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-gray-400 text-xs transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>
                        <span className="font-bold text-gray-800 text-sm">{group.industry}</span>
                      </div>
                      <span className="bg-[#eef7fa] text-[#4298b4] text-xs font-medium px-2 py-0.5 rounded-full">{group.companies.length}社</span>
                    </button>
                    {isOpen && (
                      <div className="border-t border-gray-100">
                        {group.companies.map((company, ci) => {
                          const hasProfile = Object.keys(company.requiredProfile).length > 0
                          const weightedMatchScore = hasProfile && uni
                            ? scoreCompanyWithMarketReality(userScores, company.requiredProfile, {
                                universityName: universityName === OTHER_UNIVERSITY_VALUE ? undefined : universityName,
                                universityRank: uni,
                                gender: gender ?? undefined,
                                backgrounds: bgs,
                              }, {
                                name: company.name,
                                nameEn: company.name_en,
                                industry: group.industry,
                                positions: company.positions,
                              })
                            : null
                          const matchScore = weightedMatchScore?.finalScore ?? null
                          return (
                            <div key={`${group.industry}-${ci}`} className={`px-5 py-3 ${ci !== group.companies.length - 1 ? "border-b border-gray-50" : ""} hover:bg-[#eef7fa]/60 transition-colors`}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-sm font-semibold text-gray-900">{company.name}</span>
                                    {company.name_en && <span className="text-[10px] text-gray-400">{company.name_en}</span>}
                                  </div>
                                  <div className="flex flex-wrap gap-1 mb-1">
                                    {company.positions.map((pos) => (
                                      <span key={pos} className="text-[10px] bg-[#eef7fa] text-[#4298b4] px-1.5 py-0.5 rounded-md">{pos}</span>
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
                                      <span className="text-sm font-black text-[#4298b4]">{matchScore}</span>
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
              className="px-8 py-3 bg-[#4298b4] text-white font-bold rounded-full text-sm hover:bg-[#3a89a3] transition-colors shadow-sm"
            >もう一度チェックする</button>
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
