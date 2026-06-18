import type { JobFitQuestion, JobProfile, JobResult, Background, UniversityRank } from "./job-fit-types"
import { SCALE_OPTIONS } from "./job-fit-types"

/**
 * Initialize all parameter scores to 50
 */
export function initScores(jobs: JobProfile[]): Record<string, number> {
  const scores: Record<string, number> = {}
  const allParams = new Set<string>()
  jobs.forEach((j) => Object.keys(j.scores).forEach((p) => allParams.add(p)))
  allParams.forEach((p) => { scores[p] = 50 })
  return scores
}

/**
 * Apply all answers to compute final user scores
 */
export function computeUserScores(
  questions: JobFitQuestion[],
  answers: Record<number, number>,  // questionId → scaleIndex
  jobs: JobProfile[]
): Record<string, number> {
  const scores = initScores(jobs)

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
