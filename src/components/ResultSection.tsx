interface ResultSectionProps {
  readonly title: string
  readonly items: readonly string[]
  readonly icon: string
  readonly color: string
}

export function ResultSection({
  title,
  items,
  icon,
  color,
}: ResultSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className={`text-base font-bold mb-3 flex items-center gap-2 ${color}`}>
        <span>{icon}</span>
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="text-sm text-gray-700 flex items-start gap-2"
          >
            <span className="text-gray-300 mt-0.5">-</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
