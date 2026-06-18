import type { AxisScores, Question } from "@/types"

export function calculateScores(
  questions: readonly Question[],
  answers: Record<number, number>
): AxisScores {
  const scores: AxisScores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }

  for (const question of questions) {
    const answer = answers[question.id]
    if (answer === undefined) continue
    scores[question.direction] += answer
  }

  return scores
}

export function determineMbtiType(scores: AxisScores): string {
  const ei = scores.E >= scores.I ? "E" : "I"
  const sn = scores.S >= scores.N ? "S" : "N"
  const tf = scores.T >= scores.F ? "T" : "F"
  const jp = scores.J >= scores.P ? "J" : "P"

  return `${ei}${sn}${tf}${jp}`
}

export interface AxisResult {
  axis: string
  left: { label: string; score: number }
  right: { label: string; score: number }
  result: string
}

export function getAxisResults(scores: AxisScores): AxisResult[] {
  return [
    {
      axis: "エネルギーの方向",
      left: { label: "E (外向)", score: scores.E },
      right: { label: "I (内向)", score: scores.I },
      result: scores.E >= scores.I ? "E" : "I",
    },
    {
      axis: "情報の取り方",
      left: { label: "S (感覚)", score: scores.S },
      right: { label: "N (直観)", score: scores.N },
      result: scores.S >= scores.N ? "S" : "N",
    },
    {
      axis: "判断の仕方",
      left: { label: "T (思考)", score: scores.T },
      right: { label: "F (感情)", score: scores.F },
      result: scores.T >= scores.F ? "T" : "F",
    },
    {
      axis: "生活のスタイル",
      left: { label: "J (判断)", score: scores.J },
      right: { label: "P (知覚)", score: scores.P },
      result: scores.J >= scores.P ? "J" : "P",
    },
  ]
}
