import type { MatchedIndustry } from "@/lib/companies"

interface CompanyCardProps {
  readonly data: MatchedIndustry
}

export function CompanyCard({ data }: CompanyCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h4 className="text-sm font-bold text-indigo-600 mb-3 flex items-center gap-2">
        <span>&#x1F3E2;</span>
        {data.industry}
      </h4>
      <div className="space-y-3">
        {data.companies.map((company) => (
          <div
            key={company.name}
            className="border border-gray-100 rounded-xl p-3"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-sm font-semibold text-gray-800">
                {company.name}
              </p>
            </div>
            <p className="text-xs text-gray-400 mb-2">{company.nameEn}</p>
            {company.positions.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {company.positions.slice(0, 3).map((pos) => (
                  <span
                    key={pos}
                    className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full"
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
