import type { IndustryGroup } from "@/types"
import companiesData from "@/data/companies.json"
import typeIndustryMap from "@/data/type-industry-map.json"

const allIndustries = companiesData as IndustryGroup[]
const industryMap = typeIndustryMap as Record<string, string[]>

export interface MatchedIndustry {
  industry: string
  companies: {
    name: string
    nameEn: string
    positions: string[]
    note: string
  }[]
}

export function getMatchedCompanies(mbtiType: string): MatchedIndustry[] {
  const targetIndustries = industryMap[mbtiType]
  if (!targetIndustries) return []

  return targetIndustries
    .map((industryName) => {
      const found = allIndustries.find((g) => g.industry === industryName)
      if (!found) return null

      return {
        industry: found.industry,
        companies: found.companies.slice(0, 5).map((c) => ({
          name: c.name,
          nameEn: c.name_en,
          positions: c.positions,
          note: c.note,
        })),
      }
    })
    .filter((item): item is MatchedIndustry => item !== null)
}
