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
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
      <h3
        className={`text-base font-bold mb-3 flex items-center gap-2 ${color}`}
      >
        <span>{icon}</span>
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="text-sm text-white/80 flex items-start gap-3"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/30 mt-1.5 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
