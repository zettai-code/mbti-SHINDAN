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
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <h3
        className={`text-sm font-bold mb-3 flex items-center gap-2 ${color}`}
      >
        <span>{icon}</span>
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="text-sm text-gray-600 flex items-start gap-2.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-200 mt-1.5 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
