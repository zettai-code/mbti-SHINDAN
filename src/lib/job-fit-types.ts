// Job-Fit Engine types

export interface JobFitEffect {
  p: string
  w: number
}

export interface JobFitQuestion {
  id: number
  text: string
  sec: string
  icon: string
  effects: JobFitEffect[]
}

export interface JobProfile {
  id: string
  company: string
  position: string
  emoji: string
  desc: string
  tags: string[]
  scores: Record<string, number>
  uniCorr: Record<string, number>
  bgCorr: Record<string, number>
}

export interface JobResult extends JobProfile {
  baseScore: number
  correction: number
  finalScore: number
}

export type UniversityRank = "東大京大一橋東工" | "早慶" | "旧帝大" | "GMARCH" | "海外大" | "その他"
export type Gender = "男" | "女"
export type Background = "体育会主将" | "体育会一般" | "帰国子女" | "留学" | "理系院生" | "学生起業" | "特になし"

export const SCALE_OPTIONS = [
  { label: "非常に当てはまる",     value:  25 },
  { label: "当てはまる",           value:  18 },
  { label: "やや当てはまる",       value:  10 },
  { label: "どちらでもない",       value:   0 },
  { label: "やや当てはまらない",   value: -10 },
  { label: "当てはまらない",       value: -18 },
  { label: "非常に当てはまらない", value: -25 },
] as const

export const UNIVERSITY_RANKS: UniversityRank[] = [
  "東大京大一橋東工", "早慶", "旧帝大", "GMARCH", "海外大", "その他",
]

export const UNIVERSITY_LABELS: Record<UniversityRank, string> = {
  "東大京大一橋東工": "東大・京大・一橋・東工",
  "早慶": "早慶",
  "旧帝大": "旧帝大",
  "GMARCH": "GMARCH・関関同立",
  "海外大": "海外大",
  "その他": "その他",
}

export const BACKGROUNDS: { key: Background; label: string }[] = [
  { key: "体育会主将", label: "体育会（主将・幹部）" },
  { key: "体育会一般", label: "体育会（一般）" },
  { key: "帰国子女",   label: "帰国子女（3年以上）" },
  { key: "留学",       label: "留学経験（1年以上）" },
  { key: "理系院生",   label: "理系院生" },
  { key: "学生起業",   label: "学生起業・長期インターン" },
  { key: "特になし",   label: "特になし" },
]

export const RADAR_AXES = [
  { label: "行動力",       params: ["主体性", "曖昧耐性", "好奇心"] },
  { label: "対人力",       params: ["外向性", "協調性", "チーム志向"] },
  { label: "分析力",       params: ["論理思考", "数学力", "IT理解"] },
  { label: "表現力",       params: ["言語化能力", "プレゼン力", "交渉力"] },
  { label: "耐久力",       params: ["ストレス耐性", "激務耐性", "誠実性"] },
  { label: "野心",         params: ["成長", "お金", "権限", "競争心"] },
  { label: "リーダーシップ", params: ["リーダーシップ", "影響力"] },
  { label: "グローバル",   params: ["英語力", "海外志向", "海外"] },
] as const

export const SCORE_CATEGORIES = [
  { name: "性格",         color: "#6366f1", params: ["主体性","外向性","協調性","曖昧耐性","競争心","ストレス耐性","好奇心","誠実性"] },
  { name: "能力",         color: "#3b82f6", params: ["論理思考","数学力","言語化能力","プレゼン力","英語力","IT理解","交渉力","リーダーシップ"] },
  { name: "モチベーション", color: "#f59e0b", params: ["成長","影響力","お金","安定","承認","権限","社会貢献","海外"] },
  { name: "働き方",       color: "#8b5cf6", params: ["激務耐性","出張許容","チーム志向","海外志向"] },
] as const
