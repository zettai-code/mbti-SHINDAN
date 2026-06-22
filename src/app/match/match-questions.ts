// 30問の質問データの読み込み口（差し替えはこの1ファイルだけ）
//
// ▼ もう片方（ロジック/データ担当）が作る30問について
//   形式は JobFitQuestion[] で統一してください:
//     { id: number, text: string, sec: string, icon: string,
//       effects: { p: パラメータ名(28種), w: 重み(例 1, 0.5, -0.4) }[] }
//   パラメータ名(p)は src/lib/job-fit-types.ts の SCORE_CATEGORIES の28項目を使用。
//   スケールは7段階（SCALE_OPTIONS）。
//
//   新しい設問ファイルが用意できたら、下の import を
//   そのファイル（例: "@/data/match-questions.json"）に差し替えるだけでUIに反映されます。
//   暫定で既存の job-fit 30問を使用しています。

import data from "@/data/job-fit-questions.json"
import type { JobFitQuestion } from "@/lib/job-fit-types"

export const MATCH_QUESTIONS = data as JobFitQuestion[]
