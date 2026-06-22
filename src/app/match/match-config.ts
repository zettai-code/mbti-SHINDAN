// 設定: MBTI × ガクチカ × 学歴 マッチング用のパラメータ定義
// このフォルダ内で完結する設定ファイル（既存の src/lib・src/data は変更しない）

import type { UniversityRank, Background } from "@/lib/job-fit-types"

// ───────────────────────────────────────────────
// MBTI 16タイプ
// ───────────────────────────────────────────────
export const MBTI_TYPES = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ",
] as const

export type MbtiType = (typeof MBTI_TYPES)[number]

// 各タイプの日本語ニックネーム（types.json と整合する短縮名）
export const MBTI_NICKNAMES: Record<MbtiType, string> = {
  ISTJ: "実務家", ISFJ: "守護者", INFJ: "理想家", INTJ: "戦略家",
  ISTP: "職人",   ISFP: "芸術家", INFP: "仲介者", INTP: "研究者",
  ESTP: "実行者", ESFP: "エンタメ", ENFP: "広報家", ENTP: "発明家",
  ESTJ: "統率者", ESFJ: "世話役",   ENFJ: "教育者", ENTJ: "指揮官",
}

// ───────────────────────────────────────────────
// MBTI → 28パラメータ ベクトル（各letterの傾向を加算）
// ───────────────────────────────────────────────
type Delta = Partial<Record<string, number>>

const AXIS_DELTAS: Record<string, Delta> = {
  E: { 外向性: 18, 主体性: 8, プレゼン力: 10, 影響力: 10, リーダーシップ: 8, チーム志向: 8, 交渉力: 6 },
  I: { 外向性: -18, 論理思考: 8, 好奇心: 6, 誠実性: 4 },
  S: { 誠実性: 10, 安定: 10, "IT理解": 4, 出張許容: 4, 数学力: 2 },
  N: { 好奇心: 12, 成長: 10, 海外: 6, 海外志向: 6, 論理思考: 4 },
  T: { 論理思考: 12, 数学力: 10, 競争心: 8, 交渉力: 6, 協調性: -8 },
  F: { 協調性: 12, 社会貢献: 10, チーム志向: 8, 承認: 6, 競争心: -4 },
  J: { 誠実性: 10, 安定: 8, 主体性: 6, ストレス耐性: 6, 曖昧耐性: -6 },
  P: { 曖昧耐性: 12, 好奇心: 8, 海外志向: 6, 安定: -8, 誠実性: -4 },
}

const ALL_PARAMS = [
  "主体性","外向性","協調性","曖昧耐性","競争心","ストレス耐性","好奇心","誠実性",
  "論理思考","数学力","言語化能力","プレゼン力","英語力","IT理解","交渉力","リーダーシップ",
  "成長","影響力","お金","安定","承認","権限","社会貢献","海外",
  "激務耐性","出張許容","チーム志向","海外志向",
]

/** MBTIタイプから28パラメータの基礎ベクトルを生成（base 50） */
export function mbtiToVector(type: MbtiType): Record<string, number> {
  const v: Record<string, number> = {}
  ALL_PARAMS.forEach((p) => { v[p] = 50 })
  type.split("").forEach((letter) => {
    const d = AXIS_DELTAS[letter]
    if (!d) return
    Object.entries(d).forEach(([p, delta]) => {
      v[p] = (v[p] ?? 50) + (delta ?? 0)
    })
  })
  ALL_PARAMS.forEach((p) => { v[p] = Math.max(0, Math.min(100, v[p])) })
  return v
}

// ───────────────────────────────────────────────
// ガクチカ「何を」（選択式）
//   effects: 28パラメータへの加点 / industries: 親和性の高い業界 / bg: 既存bgCorrに対応する経歴
// ───────────────────────────────────────────────
export interface Activity {
  key: string
  label: string
  emoji: string
  effects: Delta
  industries: string[]
  bg?: Background
}

export const ACTIVITIES: Activity[] = [
  {
    key: "taikai_captain", label: "体育会・部活（主将・幹部）", emoji: "🏆",
    effects: { ストレス耐性: 14, 激務耐性: 12, リーダーシップ: 14, 主体性: 12, チーム志向: 10, 誠実性: 6 },
    industries: ["総合商社", "金融（銀行）", "金融（証券）", "不動産", "マスコミ／広告（広告代理店）", "専門商社"],
    bg: "体育会主将",
  },
  {
    key: "taikai_member", label: "体育会・部活（一般）", emoji: "💪",
    effects: { ストレス耐性: 8, 激務耐性: 6, チーム志向: 8, 協調性: 6, 誠実性: 4 },
    industries: ["金融（銀行）", "総合商社", "不動産", "建設業", "製造業（電機・精密・半導体）"],
    bg: "体育会一般",
  },
  {
    key: "intern", label: "長期インターン", emoji: "💼",
    effects: { 主体性: 12, 成長: 12, "IT理解": 8, 論理思考: 8, 言語化能力: 6 },
    industries: ["IT / ITサービス（日系）", "IT / ITサービス（外資系）", "コンサルティング（総合）", "金融（その他 - M&A・VC・投資育成）"],
    bg: "学生起業",
  },
  {
    key: "startup", label: "学生起業", emoji: "🚀",
    effects: { 主体性: 16, 成長: 16, 競争心: 12, 曖昧耐性: 12, 影響力: 10 },
    industries: ["IT / ITサービス（日系）", "コンサルティング（戦略）", "金融（その他 - M&A・VC・投資育成）", "IT / ITサービス（外資系）"],
    bg: "学生起業",
  },
  {
    key: "research_stem", label: "研究・学業（理系）", emoji: "🔬",
    effects: { 論理思考: 14, 数学力: 14, "IT理解": 8, 好奇心: 10, 誠実性: 6 },
    industries: ["製造業（電機・精密・半導体）", "製造業（素材・化学）", "医薬品", "SI（システムインテグレーター）", "IT / ITサービス（日系）"],
    bg: "理系院生",
  },
  {
    key: "studyabroad", label: "留学・海外経験", emoji: "✈️",
    effects: { 英語力: 18, 海外志向: 14, 海外: 12, 曖昧耐性: 8, 外向性: 6 },
    industries: ["総合商社", "IT / ITサービス（外資系）", "金融（証券）", "コンサルティング（戦略）", "金融（アセットマネジメント）"],
    bg: "留学",
  },
  {
    key: "seminar", label: "ゼミ・学業（文系）", emoji: "📚",
    effects: { 論理思考: 8, 言語化能力: 10, 誠実性: 6, プレゼン力: 6 },
    industries: ["金融（銀行）", "コンサルティング（総合）", "マスコミ／広告（新聞）", "官公庁／公共団体／公益法人"],
  },
  {
    key: "arbeit", label: "アルバイト・接客リーダー", emoji: "🛍️",
    effects: { 協調性: 10, チーム志向: 8, ストレス耐性: 8, 交渉力: 6, 外向性: 6 },
    industries: ["サービス業", "流通／小売業／外食", "不動産", "食料品・飲料・嗜好品"],
  },
  {
    key: "volunteer", label: "ボランティア・社会活動", emoji: "🤝",
    effects: { 社会貢献: 16, 協調性: 8, 誠実性: 6 },
    industries: ["官公庁／公共団体／公益法人", "大学／教育／研究機関（大学職員）", "サービス業", "金融（保険 - 生命保険）"],
  },
  {
    key: "programming", label: "プログラミング・開発", emoji: "💻",
    effects: { "IT理解": 18, 論理思考: 12, 主体性: 8, 好奇心: 8 },
    industries: ["IT / ITサービス（日系）", "IT / ITサービス（外資系）", "SI（システムインテグレーター）", "マスコミ／広告（ゲーム）"],
  },
  {
    key: "circle_event", label: "サークル運営・イベント企画", emoji: "🎪",
    effects: { 主体性: 10, リーダーシップ: 10, 言語化能力: 8, 外向性: 8, チーム志向: 6 },
    industries: ["マスコミ／広告（広告代理店）", "サービス業", "IT / ITサービス（日系）", "流通／小売業／外食"],
  },
]

// ───────────────────────────────────────────────
// ガクチカ「何年」（取り組み期間 → 効果の倍率）
// ───────────────────────────────────────────────
export interface Duration {
  key: string
  label: string
  mult: number
}

export const DURATIONS: Duration[] = [
  { key: "u6m",    label: "半年未満",   mult: 0.5 },
  { key: "6m1y",   label: "半年〜1年",  mult: 0.8 },
  { key: "1y2y",   label: "1〜2年",     mult: 1.0 },
  { key: "2y3y",   label: "2〜3年",     mult: 1.2 },
  { key: "3yplus", label: "3年以上",    mult: 1.4 },
]

// ───────────────────────────────────────────────
// 学歴: 大学名 → ランク（既存の uniCorr に使う UniversityRank へ写像）
// ───────────────────────────────────────────────
export const UNIVERSITY_TO_RANK: Record<string, UniversityRank> = {
  // 東大京大一橋東工
  "東京大学": "東大京大一橋東工",
  "京都大学": "東大京大一橋東工",
  "一橋大学": "東大京大一橋東工",
  "東京工業大学": "東大京大一橋東工",
  "東京科学大学": "東大京大一橋東工",
  // 早慶
  "早稲田大学": "早慶",
  "慶應義塾大学": "早慶",
  "上智大学": "早慶",
  // 旧帝大・難関国立
  "北海道大学": "旧帝大",
  "東北大学": "旧帝大",
  "名古屋大学": "旧帝大",
  "大阪大学": "旧帝大",
  "九州大学": "旧帝大",
  "神戸大学": "旧帝大",
  "筑波大学": "旧帝大",
  "横浜国立大学": "旧帝大",
  "東京外国語大学": "旧帝大",
  "お茶の水女子大学": "旧帝大",
  "千葉大学": "旧帝大",
  "広島大学": "旧帝大",
  // GMARCH・関関同立
  "明治大学": "GMARCH",
  "青山学院大学": "GMARCH",
  "立教大学": "GMARCH",
  "中央大学": "GMARCH",
  "法政大学": "GMARCH",
  "学習院大学": "GMARCH",
  "東京理科大学": "GMARCH",
  "関西大学": "GMARCH",
  "関西学院大学": "GMARCH",
  "同志社大学": "GMARCH",
  "立命館大学": "GMARCH",
  // 海外大
  "海外大学": "海外大",
  // その他
  "日本大学": "その他",
  "東洋大学": "その他",
  "駒澤大学": "その他",
  "専修大学": "その他",
  "その他の大学": "その他",
}

/** 大学名 → ランク（未登録は「その他」） */
export function lookupRank(name: string): UniversityRank {
  return UNIVERSITY_TO_RANK[name.trim()] ?? "その他"
}

/** datalist 用の大学名候補（登録順） */
export const UNIVERSITY_NAMES = Object.keys(UNIVERSITY_TO_RANK)
