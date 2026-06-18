"use client"

import { useState, useMemo } from "react"

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
import snsData from "@/data/sns_hiring_data.json"

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
  mbti_ranking: { rank: number; type: string; reason: string }[]
  big_five: Record<string, number>
  values: Record<string, number>
  work_style: { suitable_environments: string[]; unsuitable_environments: string[] }
  career_aptitude: { suitable_careers: string[]; unsuitable_careers: string[] }
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

type SnsEntry = {
  company_or_industry: string
  data_type: string
  finding: string
  source_type: string
  confidence: string
  details?: Record<string, unknown>
}

const allProfiles: Profile[] = [
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
const socialData = snsData as unknown as SnsEntry[]

const SCORE_LABELS: Record<string, string> = {
  logic: "論理性", creativity: "創造性", empathy: "共感力", cooperativeness: "協調性",
  competitiveness: "競争性", initiative: "主体性", planning: "計画性", action_orientation: "行動力",
  stress_tolerance: "ストレス耐性", learning_speed: "学習速度", intellectual_curiosity: "知的好奇心",
  analytical_ability: "分析力", abstract_thinking: "抽象思考力", communication: "コミュ力",
  presentation: "プレゼン力", negotiation: "交渉力", leadership: "リーダーシップ",
  patience: "忍耐力", flexibility: "柔軟性", discipline: "規律性",
}

const BIG5_LABELS: Record<string, string> = {
  openness: "開放性", conscientiousness: "誠実性", extraversion: "外向性",
  agreeableness: "協調性", neuroticism: "神経症傾向",
}

const VALUE_LABELS: Record<string, string> = {
  growth: "成長志向", stability: "安定志向", social_contribution: "社会貢献",
  income: "収入志向", autonomy: "裁量志向", expertise: "専門性志向", teamwork: "チーム志向",
}

const TIER_COLORS: Record<string, string> = {
  S: "bg-red-100 text-red-800", A: "bg-orange-100 text-orange-800",
  B: "bg-yellow-100 text-yellow-800", C: "bg-green-100 text-green-800",
  D: "bg-gray-100 text-gray-800",
}

function ScoreBar({ label, value, color = "indigo" }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-gray-500 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-${color}-500`}
          style={{ width: `${value}%`, backgroundColor: color === "indigo" ? "#6366f1" : color === "emerald" ? "#10b981" : "#f59e0b" }}
        />
      </div>
      <span className="w-8 text-right text-gray-600 font-mono">{value}</span>
    </div>
  )
}

function ProfileCard({ profile, uniEntry, genderEntry }: {
  profile: Profile
  uniEntry?: UniEntry
  genderEntry?: GenderEntry
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-gray-900 text-sm">{profile.company}</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-indigo-600 text-sm font-medium">{profile.position}</span>
          </div>
          <div className="flex items-center gap-2">
            {profile.mbti_ranking?.[0] && (
              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">
                {profile.mbti_ranking[0].type}
              </span>
            )}
            {uniEntry && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIER_COLORS[uniEntry.university_tier] || "bg-gray-100"}`}>
                Tier {uniEntry.university_tier}
              </span>
            )}
            {profile.applies_to && (
              <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                {profile.applies_to.length}社適用
              </span>
            )}
            <span className={`text-gray-400 transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{profile.description}</p>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-5">
          {/* 適用企業 */}
          {profile.applies_to && profile.applies_to.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-700 mb-2">適用企業</h4>
              <div className="flex flex-wrap gap-1">
                {profile.applies_to.map((c) => (
                  <span key={c} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-md">{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* 向いている人物像 */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-2">向いている人物像</h4>
            <p className="text-xs text-gray-600 mb-2">{profile.ideal_profile.description}</p>
            <ul className="space-y-1">
              {profile.ideal_profile.concrete_examples.map((ex, i) => (
                <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
                  <span className="text-indigo-400 mt-0.5">-</span>{ex}
                </li>
              ))}
            </ul>
          </div>

          {/* 性格特性スコア */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-2">性格特性スコア（20項目）</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {Object.entries(profile.personality_scores).map(([key, val]) => (
                <ScoreBar key={key} label={SCORE_LABELS[key] || key} value={val} />
              ))}
            </div>
          </div>

          {/* MBTI適性ランキング */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-2">MBTI適性ランキング（全16タイプ）</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
              {profile.mbti_ranking.map((m) => (
                <div key={m.rank} className={`px-2 py-1.5 rounded-lg text-xs ${
                  m.rank <= 3 ? "bg-purple-50 border border-purple-200" :
                  m.rank <= 8 ? "bg-gray-50 border border-gray-100" :
                  "bg-gray-50/50"
                }`}>
                  <div className="flex items-center gap-1">
                    <span className={`font-bold ${m.rank <= 3 ? "text-purple-700" : "text-gray-400"}`}>
                      {m.rank}.
                    </span>
                    <span className={`font-bold ${m.rank <= 3 ? "text-purple-700" : "text-gray-600"}`}>
                      {m.type}
                    </span>
                  </div>
                  <p className="text-gray-400 text-[10px] mt-0.5 line-clamp-2">{m.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Big Five */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-2">Big Five</h4>
            <div className="space-y-1.5">
              {Object.entries(profile.big_five).map(([key, val]) => (
                <ScoreBar key={key} label={BIG5_LABELS[key] || key} value={val} color="emerald" />
              ))}
            </div>
          </div>

          {/* 価値観 */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-2">価値観</h4>
            <div className="space-y-1.5">
              {Object.entries(profile.values).map(([key, val]) => (
                <ScoreBar key={key} label={VALUE_LABELS[key] || key} value={val} color="amber" />
              ))}
            </div>
          </div>

          {/* 働き方・キャリア */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold text-green-700 mb-1">向いている環境</h4>
              <ul className="space-y-0.5">
                {profile.work_style.suitable_environments.map((e, i) => (
                  <li key={i} className="text-xs text-gray-600">+ {e}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-700 mb-1">向いていない環境</h4>
              <ul className="space-y-0.5">
                {profile.work_style.unsuitable_environments.map((e, i) => (
                  <li key={i} className="text-xs text-gray-600">- {e}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 学生時代の特徴 */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-2">学生時代の特徴</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(profile.student_features).map(([key, items]) => (
                <div key={key}>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    {key === "high_school" ? "高校" : key === "university" ? "大学" :
                     key === "part_time_job" ? "バイト" : key === "club_activities" ? "部活" : "インターン"}
                  </span>
                  <ul className="mt-0.5">
                    {items.map((item: string, i: number) => (
                      <li key={i} className="text-[10px] text-gray-500">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* 採用大学データ */}
          {uniEntry && (
            <div className="bg-blue-50/50 rounded-xl p-3">
              <h4 className="text-xs font-bold text-blue-800 mb-2">採用大学データ</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {Object.entries(uniEntry.hiring_universities).map(([tier, data]) => (
                  <div key={tier} className="text-center">
                    <div className="text-[10px] text-gray-500 uppercase">{tier}</div>
                    <div className="text-lg font-bold text-blue-700">{data.percentage}%</div>
                  </div>
                ))}
              </div>
              {uniEntry.position_university_pattern && (
                <div className="mt-2 space-y-1">
                  {Object.entries(uniEntry.position_university_pattern).map(([pos, pat]) => (
                    <div key={pos} className="text-[10px] text-gray-600">
                      <span className="font-bold">{pos}</span>: 最低Tier {pat.min_tier} - {pat.notes}
                    </div>
                  ))}
                </div>
              )}
              {uniEntry.gender_pattern && (
                <div className="mt-2 space-y-1">
                  {Object.entries(uniEntry.gender_pattern).map(([gen, pat]) => (
                    <div key={gen} className="text-[10px] text-gray-600">
                      <span className="font-bold">{gen === "male" ? "男性" : "女性"}</span>: 最低Tier {pat.min_tier} {pat.notes && `- ${pat.notes}`}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-1 text-[10px] text-gray-400">信頼度: {uniEntry.confidence}</div>
            </div>
          )}

          {/* 男女比・バックグラウンド */}
          {genderEntry && (
            <div className="bg-pink-50/50 rounded-xl p-3">
              <h4 className="text-xs font-bold text-pink-800 mb-2">男女比・バックグラウンド</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-[10px] text-gray-500">男性</div>
                  <div className="text-lg font-bold text-blue-600">{genderEntry.gender_data.overall_male_pct}%</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-gray-500">女性</div>
                  <div className="text-lg font-bold text-pink-600">{genderEntry.gender_data.overall_female_pct}%</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-gray-500">体育会</div>
                  <div className="text-lg font-bold text-orange-600">{genderEntry.background_data.athlete_pct}%</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-gray-500">帰国子女</div>
                  <div className="text-lg font-bold text-green-600">{genderEntry.background_data.returnee_pct}%</div>
                </div>
              </div>
              {genderEntry.gender_data.by_position && (
                <div className="mt-2 space-y-1">
                  {Object.entries(genderEntry.gender_data.by_position).map(([pos, ratio]) => (
                    <div key={pos} className="text-[10px] text-gray-600">
                      <span className="font-bold">{pos}</span>: 男{ratio.male}% / 女{ratio.female}%
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Feature Tags */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-2">特徴タグ（{profile.feature_tags.length}個）</h4>
            <div className="flex flex-wrap gap-1">
              {profile.feature_tags.map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"profiles" | "university" | "gender" | "sns">("profiles")

  const uniMap = useMemo(() => {
    const map: Record<string, UniEntry> = {}
    for (const u of uniData) map[u.company] = u
    return map
  }, [])

  const genderMap = useMemo(() => {
    const map: Record<string, GenderEntry> = {}
    for (const g of genData) map[g.company] = g
    return map
  }, [])

  const filteredProfiles = useMemo(() => {
    if (!search) return allProfiles
    const lower = search.toLowerCase()
    return allProfiles.filter((p) =>
      p.company.toLowerCase().includes(lower) ||
      p.position.toLowerCase().includes(lower) ||
      p.industry.toLowerCase().includes(lower) ||
      p.feature_tags.some((t) => t.toLowerCase().includes(lower)) ||
      p.mbti_ranking[0]?.type.toLowerCase().includes(lower)
    )
  }, [search])

  const filteredUni = useMemo(() => {
    if (!search) return uniData
    const lower = search.toLowerCase()
    return uniData.filter((u) =>
      u.company.toLowerCase().includes(lower) || u.industry.toLowerCase().includes(lower)
    )
  }, [search])

  const filteredGender = useMemo(() => {
    if (!search) return genData
    const lower = search.toLowerCase()
    return genData.filter((g) =>
      g.company.toLowerCase().includes(lower) || g.industry.toLowerCase().includes(lower)
    )
  }, [search])

  const filteredSns = useMemo(() => {
    if (!search) return socialData
    const lower = search.toLowerCase()
    return socialData.filter((s) =>
      s.company_or_industry.toLowerCase().includes(lower) ||
      s.finding.toLowerCase().includes(lower)
    )
  }, [search])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Stats */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">就活データダッシュボード</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-indigo-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-indigo-700">{allProfiles.length}</div>
            <div className="text-xs text-indigo-500">職種プロファイル</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-700">{uniData.length}</div>
            <div className="text-xs text-blue-500">採用大学データ</div>
          </div>
          <div className="bg-pink-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-pink-700">{genData.length}</div>
            <div className="text-xs text-pink-500">男女比データ</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-700">{socialData.length}</div>
            <div className="text-xs text-green-500">SNS口コミ</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="企業名・職種・MBTIタイプ・タグで検索..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
        {[
          { id: "profiles" as const, label: `職種プロファイル (${filteredProfiles.length})` },
          { id: "university" as const, label: `採用大学 (${filteredUni.length})` },
          { id: "gender" as const, label: `男女比 (${filteredGender.length})` },
          { id: "sns" as const, label: `SNS口コミ (${filteredSns.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
              tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "profiles" && (
        <div className="space-y-3">
          {filteredProfiles.map((p, i) => (
            <ProfileCard
              key={`${p.company}-${p.position}-${i}`}
              profile={p}
              uniEntry={uniMap[p.company]}
              genderEntry={genderMap[p.company]}
            />
          ))}
        </div>
      )}

      {tab === "university" && (
        <div className="space-y-2">
          {filteredUni.map((u, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-bold text-sm text-gray-900">{u.company}</span>
                  <span className="text-xs text-gray-400 ml-2">{u.industry}</span>
                </div>
                <div className="flex gap-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIER_COLORS[u.university_tier]}`}>
                    Tier {u.university_tier}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    u.confidence === "high" ? "bg-green-100 text-green-700" :
                    u.confidence === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"
                  }`}>{u.confidence}</span>
                </div>
              </div>
              <div className="flex gap-4 text-xs">
                {Object.entries(u.hiring_universities).map(([tier, data]) => (
                  <span key={tier} className="text-gray-500">
                    <span className="font-medium text-gray-700">{tier}</span>: {data.percentage}%
                  </span>
                ))}
              </div>
              {u.background_preference && (
                <div className="flex gap-3 mt-1.5">
                  {Object.entries(u.background_preference).map(([key, val]) => (
                    <span key={key} className={`text-[10px] px-1.5 py-0.5 rounded ${
                      val.preference === "高" ? "bg-red-50 text-red-600" :
                      val.preference === "中" ? "bg-yellow-50 text-yellow-600" : "bg-gray-50 text-gray-500"
                    }`}>
                      {key}: {val.preference}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "gender" && (
        <div className="space-y-2">
          {filteredGender.map((g, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-gray-900">{g.company}</span>
                <span className="text-xs text-gray-400">{g.industry}</span>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-20 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${g.gender_data.overall_male_pct}%` }} />
                  </div>
                  <span className="text-xs text-blue-600 font-medium">{g.gender_data.overall_male_pct}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-20 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-pink-500 rounded-full" style={{ width: `${g.gender_data.overall_female_pct}%` }} />
                  </div>
                  <span className="text-xs text-pink-600 font-medium">{g.gender_data.overall_female_pct}%</span>
                </div>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-orange-600">体育会 {g.background_data.athlete_pct}%</span>
                <span className="text-xs text-green-600">帰国子女 {g.background_data.returnee_pct}%</span>
                <span className="text-xs text-purple-600">理系院 {g.background_data.stem_grad_pct}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "sns" && (
        <div className="space-y-2">
          {filteredSns.map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-gray-900">{s.company_or_industry}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  s.confidence === "high" ? "bg-green-100 text-green-700" :
                  s.confidence === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"
                }`}>{s.confidence}</span>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{s.data_type}</span>
              </div>
              <p className="text-xs text-gray-600">{s.finding}</p>
              <p className="text-[10px] text-gray-400 mt-1">{s.source_type}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
