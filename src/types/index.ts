export type Axis = "EI" | "SN" | "TF" | "JP"

export type AxisDirection = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P"

export interface Question {
  id: number
  text: string
  axis: Axis
  direction: AxisDirection
}

export interface MbtiTypeData {
  type: string
  name: string
  description: string
  strengths: string[]
  weaknesses: string[]
  suitableJobs: string[]
  suitableIndustries: string[]
  suitableWorkStyles: string[]
  unsuitableWorkStyles: string[]
  recommendedCompanyTypes: string[]
}

export interface AxisScores {
  E: number
  I: number
  S: number
  N: number
  T: number
  F: number
  J: number
  P: number
}
