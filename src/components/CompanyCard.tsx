import type { MatchedIndustry } from "@/lib/companies"

interface CompanyCardProps {
  readonly data: MatchedIndustry
}

export function CompanyCard({ data }: CompanyCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h4 className="text-sm font-bold text-[#4298b4] mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#4298b4]" />
        {data.industry}
      </h4>
      <div className="space-y-2.5">
        {data.companies.map((company) => (
          <div
            key={company.name}
            className="bg-[#f8f8f8] rounded-lg p-3"
          >
            <p className="text-sm font-semibold text-gray-800">
              {company.name}
            </p>
            <p className="text-xs text-gray-400 mb-2">{company.nameEn}</p>
            {company.positions.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {company.positions.slice(0, 3).map((pos) => (
                  <span
                    key={pos}
                    className="text-xs bg-white text-[#4298b4] px-2 py-0.5 rounded-full border border-[#4298b4]/20"
                  >
                    {pos}
                  </span>
                ))}
                {company.positions.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{company.positions.length - 3}
                  </span>
                )}
              </div>
            )}
            {company.note && (
              <p className="text-xs text-gray-500 leading-relaxed">
                {company.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
