import type { MatchedIndustry } from "@/lib/companies"

interface CompanyCardProps {
  readonly data: MatchedIndustry
}

export function CompanyCard({ data }: CompanyCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
      <h4 className="text-sm font-bold text-[#6dd4a8] mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#33a474]" />
        {data.industry}
      </h4>
      <div className="space-y-2.5">
        {data.companies.map((company) => (
          <div
            key={company.name}
            className="bg-white/5 rounded-xl p-3 border border-white/5"
          >
            <p className="text-sm font-semibold text-white/90">
              {company.name}
            </p>
            <p className="text-xs text-white/40 mb-2">{company.nameEn}</p>
            {company.positions.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {company.positions.slice(0, 3).map((pos) => (
                  <span
                    key={pos}
                    className="text-xs bg-[#88619a]/30 text-[#c4a8d8] px-2 py-0.5 rounded-full"
                  >
                    {pos}
                  </span>
                ))}
                {company.positions.length > 3 && (
                  <span className="text-xs text-white/30">
                    +{company.positions.length - 3}
                  </span>
                )}
              </div>
            )}
            {company.note && (
              <p className="text-xs text-white/50 leading-relaxed">
                {company.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
