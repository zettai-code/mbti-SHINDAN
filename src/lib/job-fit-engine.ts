import type {
  JobFitQuestion,
  JobProfile,
  JobResult,
  Background,
  UniversityRank,
  CandidateMarketProfile,
  CompanyMarketProfile,
  JobHuntingDeviationResult,
  CompanyMarketResult,
  WeightedCompanyScore,
  MarketReach,
} from "./job-fit-types"
import { SCALE_OPTIONS } from "./job-fit-types"

const ALL_PARAMS = [
  "主体性","外向性","協調性","曖昧耐性","競争心","ストレス耐性","好奇心","誠実性",
  "論理思考","数学力","言語化能力","プレゼン力","英語力","IT理解","交渉力","リーダーシップ",
  "成長","影響力","お金","安定","承認","権限","社会貢献","海外",
  "激務耐性","出張許容","チーム志向","海外志向",
]

const UNIVERSITY_DEVIATION_BY_NAME: Record<string, number> = {
  東京大学: 75.0,
  一橋大学: 75.0,
  京都大学: 75.0,
  東京科学大学: 75.0,
  東京工業大学: 75.0,
  北海道大学: 72.5,
  東京外国語大学: 72.5,
  お茶の水女子大学: 72.5,
  九州大学: 72.5,
  大阪大学: 72.5,
  東北大学: 72.5,
  早稲田大学: 72.5,
  慶應義塾大学: 72.5,
  名古屋大学: 72.5,
  神戸大学: 70.0,
  国際教養大学: 70.0,
  筑波大学: 70.0,
  海外大学: 70.0,
  千葉大学: 67.5,
  東京学芸大学: 67.5,
  上智大学: 67.5,
  東京理科大学: 67.5,
  岡山大学: 65.0,
  広島大学: 65.0,
  横浜市立大学: 65.0,
  明治大学: 65.0,
  同志社大学: 65.0,
  金沢大学: 65.0,
  ICU: 62.5,
  国際基督教大学: 62.5,
  青山学院大学: 62.5,
  立教大学: 62.5,
  立命館大学: 62.5,
  京都府立大学: 62.5,
  東京都立大学: 62.5,
  岐阜大学: 62.5,
  神戸市外国語大学: 62.5,
  大阪公立大学: 62.5,
  横浜国立大学: 62.5,
  名古屋市立大学: 62.5,
  関西学院大学: 62.5,
  中央大学: 60.0,
  法政大学: 60.0,
  関西大学: 60.0,
  学習院大学: 60.0,
  日本女子大学: 57.5,
  小樽商科大学: 57.5,
  茨城大学: 57.5,
  高崎経済大学: 57.5,
  都留文科大学: 57.5,
  奈良女子大学: 57.5,
  信州大学: 57.5,
  静岡大学: 57.5,
  明治学院大学: 57.5,
  成蹊大学: 57.5,
  成城大学: 57.5,
  埼玉大学: 57.5,
  大阪教育大学: 57.5,
  宇都宮大学: 57.5,
  電気通信大学: 57.5,
  愛知県立大学: 57.5,
  三重大学: 57.5,
  滋賀大学: 57.5,
  熊本大学: 57.5,
  日本大学: 55.0,
  専修大学: 55.0,
  工学院大学: 55.0,
  國學院大學: 55.0,
  東洋大学: 55.0,
  武蔵大学: 55.0,
  南山大学: 55.0,
  獨協大学: 52.5,
  文教大学: 52.5,
  玉川大学: 52.5,
  中京大学: 52.5,
  龍谷大学: 52.5,
  駒澤大学: 50.0,
  昭和女子大学: 50.0,
  東京女子大学: 50.0,
  東京農業大学: 50.0,
  武蔵野美術大学: 50.0,
  甲南大学: 50.0,
  西南学院大学: 50.0,
  神田外語大学: 47.5,
  東京経済大学: 47.5,
  神奈川大学: 47.5,
  帝京大学: 45.0,
  福岡大学: 45.0,
  拓殖大学: 45.0,
  関東学院大学: 45.0,
  桜美林大学: 42.5,
  亜細亜大学: 42.5,
}

const UNIVERSITY_RANK_DEVIATION: Record<UniversityRank, number> = {
  東大京大一橋東工: 75.0,
  早慶: 72.5,
  旧帝大: 72.5,
  GMARCH: 62.5,
  海外大: 70.0,
  その他: 50.0,
}

const EDUCATION_ADJUSTMENTS: Record<string, number> = {
  修士卒: 1,
  博士卒: 2,
  高専卒: -1,
  短大卒: -3,
  専門卒: -4,
  高卒: -6,
}

const INDUSTRY_DIFFICULTY_BASE: Record<string, number> = {
  "コンサルティング（戦略）": 78,
  "コンサルティング（総合）": 72,
  "コンサルティング（FAS / 監査法人系アドバイザリー）": 71,
  "コンサルティング（シンクタンク / その他）": 66,
  "IT / ITサービス（外資系）": 73,
  "IT / ITサービス（日系）": 65,
  "SI（システムインテグレーター）": 62,
  総合商社: 77,
  専門商社: 60,
  "金融（銀行）": 67,
  "金融（証券）": 68,
  "金融（保険 - 損害保険）": 64,
  "金融（保険 - 生命保険）": 61,
  "金融（アセットマネジメント）": 74,
  "金融（その他 - 取引所・インフラ・業界団体）": 69,
  "金融（その他 - カード・リース・ファイナンス）": 63,
  "金融（その他 - M&A・VC・投資育成）": 70,
  "金融（その他 - 共済・短資）": 60,
  "製造業（電機・精密・半導体）": 66,
  "製造業（素材・化学）": 63,
  "食料品・飲料・嗜好品": 62,
  "医薬品": 67,
  "マスコミ／広告（テレビ）": 72,
  "マスコミ／広告（新聞）": 66,
  "マスコミ／広告（出版）": 62,
  "マスコミ／広告（通信社）": 67,
  "マスコミ／広告（広告代理店）": 72,
  "マスコミ／広告（映画・音楽）": 66,
  "マスコミ／広告（ゲーム）": 65,
  "サービス業": 58,
  "流通／小売業／外食": 57,
  "通信サービス": 66,
  "日用品・化粧品": 64,
  "大学／教育／研究機関（大学職員）": 60,
  "官公庁／公共団体／公益法人": 65,
  "その他（倉庫・物流）": 55,
  "その他（スポーツ・玩具・住設・OA機器）": 59,
  "不動産": 70,
  "建設業": 60,
  "運輸": 62,
  "エネルギー": 66,
}

const COMPANY_DIFFICULTY_RULES = [
  { score: 80, exact: ["日本銀行", "日本政策投資銀行"], includes: ["ゴールドマン", "JPモルガン", "マッキンゼー", "ボストンコンサルティンググループ", "BCG", "A.T.カーニー", "ATカーニー"] },
  { score: 79, exact: ["三菱商事", "三井物産", "伊藤忠商事", "Strategy&（PwC）", "ブラックロック・ジャパン"], includes: ["PwCStrategy", "アクセンチュア戦略"] },
  { score: 78, exact: ["電通", "住友商事", "丸紅", "三菱地所", "三井不動産", "キーエンス", "マイクロソフト（日本マイクロソフト）"], includes: ["日本マイクロソフト"] },
  { score: 75, exact: ["トヨタ自動車", "ソニーグループ", "東京エレクトロン", "武田薬品工業", "Amazonジャパン", "AWSジャパン"], includes: ["アマゾンウェブサービス"] },
  { score: 72, exact: ["アクセンチュア", "デロイト トーマツ コンサルティング", "KPMGコンサルティング", "PwCコンサルティング", "関西電力", "デンソー", "東日本旅客鉄道"], includes: ["JR東日本"] },
  { score: 70, exact: ["三菱UFJ銀行", "オリックス", "NTTデータ", "富士通", "バンダイナムコエンターテインメント"], includes: ["バンダイナムコ"] },
  { score: 65, exact: ["LINEヤフー", "DeNA", "SCSK", "TIS", "JCB"], includes: ["ANA"] },
  { score: 60, exact: ["ニトリ", "楽天銀行", "船井総研", "リンクアンドモチベーション"], includes: [] },
  { score: 55, exact: ["福山通運", "メイテック", "トランスコスモス"], includes: ["信用金庫"] },
  { score: 50, exact: ["レオパレス21", "旅工房", "スタジオアリス", "AppBank"], includes: [] },
] as const

/**
 * Initialize all parameter scores to 50
 */
export function initScores(): Record<string, number> {
  const scores: Record<string, number> = {}
  ALL_PARAMS.forEach((p) => { scores[p] = 50 })
  return scores
}

/**
 * Apply all answers to compute final user scores
 */
export function computeUserScores(
  questions: JobFitQuestion[],
  answers: Record<number, number>,
): Record<string, number> {
  const scores = initScores()

  questions.forEach((q) => {
    const si = answers[q.id]
    if (si === undefined || si < 0) return
    const val = SCALE_OPTIONS[si].value
    q.effects.forEach((e) => {
      scores[e.p] = clamp(scores[e.p] + val * e.w, 0, 100)
    })
  })

  return scores
}


/**
 * Calculate match results for all jobs
 */
export function calculateResults(
  userScores: Record<string, number>,
  jobs: JobProfile[],
  universityRank: UniversityRank,
  backgrounds: Background[]
): JobResult[] {
  const results = jobs.map((job) => {
    const params = Object.keys(job.scores)
    let wSum = 0
    let wTotal = 0

    params.forEach((p) => {
      const u = userScores[p] ?? 50
      const j = job.scores[p]
      const diff = u - j
      let match: number
      if (diff >= 0) {
        match = Math.max(0.85, 1 - diff / 200)
      } else {
        match = Math.pow(Math.max(0, 1 + diff / 100), 1.5)
      }
      const weight = j / 100
      wSum += match * weight
      wTotal += weight
    })

    const base = (wSum / wTotal) * 100

    // Background correction (capped ±10%)
    let corr = 0
    corr += job.uniCorr[universityRank] ?? 0
    backgrounds.forEach((bg) => { corr += job.bgCorr[bg] ?? 0 })
    corr = clamp(corr, -10, 10)

    const final = clamp(base + corr, 0, 100)

    return {
      ...job,
      baseScore: Math.round(base * 10) / 10,
      correction: corr,
      finalScore: Math.round(final * 10) / 10,
    }
  })

  results.sort((a, b) => b.finalScore - a.finalScore)
  return results
}

/**
 * Generate insight text for a job result
 */
export function generateInsight(
  userScores: Record<string, number>,
  job: JobResult
): { strengths: string[]; weaknesses: string[] } {
  const comps = Object.keys(job.scores).map((p) => ({
    name: p,
    user: Math.round(userScores[p] ?? 50),
    job: job.scores[p],
    excess: (userScores[p] ?? 50) - job.scores[p],
  }))

  const strengths = comps
    .filter((c) => c.excess >= -5 && c.job >= 70)
    .sort((a, b) => (b.job + b.excess) - (a.job + a.excess))
    .slice(0, 3)
    .map((s) => `${s.name}(${s.user})`)

  const weaknesses = comps
    .filter((c) => c.excess < -15 && c.job >= 60)
    .sort((a, b) => a.excess - b.excess)
    .slice(0, 2)
    .map((w) => w.name)

  return { strengths, weaknesses }
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function normalizeForMatch(value = ""): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[（）()・\s　、,./／|｜&＆]/g, "")
}

function getToeicAdjustment(toeic?: number): number {
  if (!toeic) return 0
  if (toeic >= 900) return 1
  if (toeic >= 800) return 0.5
  if (toeic >= 730) return 0.2
  return 0
}

function getUniversityBaseScore(profile: CandidateMarketProfile): number {
  if (profile.universityName) {
    const normalizedInput = normalizeForMatch(profile.universityName)
    const matched = Object.entries(UNIVERSITY_DEVIATION_BY_NAME).find(([name]) => (
      normalizeForMatch(name) === normalizedInput || normalizedInput.includes(normalizeForMatch(name))
    ))
    if (matched) return matched[1]
  }

  if (profile.universityRank) return UNIVERSITY_RANK_DEVIATION[profile.universityRank]
  return 50
}

function getJobHuntingLevel(score: number): string {
  if (score >= 78) return "最上位、外資金融・商社トップ級"
  if (score >= 75) return "東京一工・大勝レベル"
  if (score >= 70) return "東京一工・勝ちレベル"
  if (score >= 66) return "地帝早慶・大勝レベル"
  if (score >= 61) return "MARCH・大勝レベル"
  if (score >= 56) return "MARCH・勝ちレベル"
  if (score >= 50) return "日東駒専・勝ちレベル"
  return "一般層"
}

export function calculateJobHuntingDeviation(profile: CandidateMarketProfile): JobHuntingDeviationResult {
  const adjustments: JobHuntingDeviationResult["adjustments"] = []
  const baseUniversityScore = getUniversityBaseScore(profile)
  let score = baseUniversityScore

  const addAdjustment = (label: string, value: number, reason: string) => {
    if (value === 0) return
    score += value
    adjustments.push({ label, value, reason })
  }

  if (profile.educationLevel) {
    addAdjustment(profile.educationLevel, EDUCATION_ADJUSTMENTS[profile.educationLevel] ?? 0, "学歴補正")
  }
  if (profile.majorType === "理系") addAdjustment("理系", 2, "理系補正")
  if (profile.gender === "女") addAdjustment("女性", 2, "女性採用ニーズ補正")

  addAdjustment("TOEIC", getToeicAdjustment(profile.toeic), `${profile.toeic ?? 0}点`)
  addAdjustment("留年", -(profile.repeatYears ?? 0), `${profile.repeatYears ?? 0}年`)
  addAdjustment("浪人", -0.5 * (profile.roninYears ?? 0), `${profile.roninYears ?? 0}年`)

  const backgrounds = profile.backgrounds ?? []
  if (backgrounds.includes("理系院生")) {
    addAdjustment("理系院生", 3, "修士卒+理系として換算")
  }
  if (backgrounds.includes("体育会主将") || backgrounds.includes("体育会一般")) {
    addAdjustment("体育会経験", 3, "わかりやすい加点属性")
  }
  if (backgrounds.includes("帰国子女")) addAdjustment("帰国子女", 3, "わかりやすい加点属性")
  if (backgrounds.includes("留学")) addAdjustment("留学", 1, "わかりやすい加点属性")
  if (backgrounds.includes("学生起業")) addAdjustment("長期インターン", 0.5, "学生起業・長期インターンとして換算")
  if (profile.hasLongInternship) addAdjustment("長期インターン", 0.5, "わかりやすい加点属性")
  if (profile.hasVolunteer) addAdjustment("ボランティア", 0.5, "わかりやすい加点属性")
  if (profile.hasSeminarPresentation) addAdjustment("ゼミでの発表", 0.5, "わかりやすい加点属性")

  const finalScore = round1(score)
  return {
    score: finalScore,
    level: getJobHuntingLevel(finalScore),
    baseUniversityScore,
    adjustments,
  }
}

function matchesCompanyRule(company: CompanyMarketProfile, rule: (typeof COMPANY_DIFFICULTY_RULES)[number]): boolean {
  const normalizedName = normalizeForMatch(company.name)
  const normalizedEnglishName = normalizeForMatch(company.nameEn)
  const searchable = `${normalizedName}${normalizedEnglishName}${normalizeForMatch((company.positions ?? []).join(""))}`

  if (rule.exact.some((name) => {
    const exactName = normalizeForMatch(name)
    return normalizedName === exactName || normalizedEnglishName === exactName
  })) {
    return true
  }

  return rule.includes.some((name) => searchable.includes(normalizeForMatch(name)))
}

export function estimateCompanyRecruitingDifficulty(company: CompanyMarketProfile): number {
  const explicitRule = COMPANY_DIFFICULTY_RULES.find((rule) => matchesCompanyRule(company, rule))
  if (explicitRule) return explicitRule.score

  const industryBase = company.industry ? INDUSTRY_DIFFICULTY_BASE[company.industry] : undefined
  let difficulty = industryBase ?? 60

  const profileValues = Object.values(company.requiredProfile ?? {})
  if (profileValues.length > 0) {
    const avgRequired = profileValues.reduce((sum, value) => sum + value, 0) / profileValues.length
    const topRequired = profileValues.slice().sort((a, b) => b - a).slice(0, 8)
    const topAvg = topRequired.reduce((sum, value) => sum + value, 0) / topRequired.length
    difficulty += (avgRequired - 75) * 0.08 + (topAvg - 85) * 0.05
  }

  return round1(clamp(difficulty, 50, 80))
}

export function classifyMarketReach(candidateScore: number, companyDifficulty: number): MarketReach {
  const gap = companyDifficulty - candidateScore
  if (gap <= -5) return "余裕"
  if (gap <= 2) return "実力相応"
  if (gap < 5) return "挑戦"
  return "高望み"
}

export function scoreMarketReach(candidateScore: number, companyDifficulty: number): number {
  const gap = companyDifficulty - candidateScore

  if (gap >= 5) return 0
  if (gap <= -15) return 86
  if (gap <= -5) return 92
  if (gap <= 2) return 100
  return 82
}

export function evaluateCompanyMarketFit(
  candidate: CandidateMarketProfile,
  company: CompanyMarketProfile,
): CompanyMarketResult {
  const candidateResult = calculateJobHuntingDeviation(candidate)
  const companyDifficulty = estimateCompanyRecruitingDifficulty(company)
  const gap = round1(companyDifficulty - candidateResult.score)

  return {
    candidateScore: candidateResult.score,
    candidateLevel: candidateResult.level,
    companyDifficulty,
    gap,
    reach: classifyMarketReach(candidateResult.score, companyDifficulty),
    marketScore: scoreMarketReach(candidateResult.score, companyDifficulty),
  }
}

/**
 * Score a single company from companies.json against user scores.
 * Returns null if requiredProfile is empty (data not yet available).
 */
export function scoreCompany(
  userScores: Record<string, number>,
  requiredProfile: Record<string, number>
): number | null {
  const params = Object.keys(requiredProfile)
  if (params.length === 0) return null

  let wSum = 0
  let wTotal = 0
  params.forEach((p) => {
    const u = userScores[p] ?? 50
    const j = requiredProfile[p]
    const diff = u - j
    let match: number
    if (diff >= 0) {
      match = Math.max(0.85, 1 - diff / 200)
    } else {
      match = Math.pow(Math.max(0, 1 + diff / 100), 1.5)
    }
    const weight = j / 100
    wSum += match * weight
    wTotal += weight
  })

  return wTotal > 0 ? Math.round((wSum / wTotal) * 1000) / 10 : null
}

export function scoreCompanyWithMarketReality(
  userScores: Record<string, number>,
  requiredProfile: Record<string, number>,
  candidate: CandidateMarketProfile,
  company: CompanyMarketProfile,
): WeightedCompanyScore | null {
  const personalityScore = scoreCompany(userScores, requiredProfile)
  if (personalityScore === null) return null

  const market = evaluateCompanyMarketFit(candidate, {
    ...company,
    requiredProfile,
  })
  const weightedScore = round1(market.marketScore * 0.7 + personalityScore * 0.3)
  const finalScore = market.gap >= 5 ? 0 : weightedScore

  return {
    ...market,
    personalityScore,
    finalScore,
  }
}
