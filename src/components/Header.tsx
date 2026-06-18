import Link from "next/link"

interface HeaderProps {
  readonly variant?: "light" | "dark"
}

export function Header({ variant = "dark" }: HeaderProps) {
  const isLight = variant === "light"

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/10">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className={`text-lg font-bold tracking-tight ${
            isLight ? "text-gray-800" : "text-white"
          }`}
        >
          就活MBTI診断
        </Link>
        <Link
          href="/companies"
          className={`text-sm font-medium transition-colors ${
            isLight
              ? "text-gray-500 hover:text-gray-800"
              : "text-white/70 hover:text-white"
          }`}
        >
          企業一覧
        </Link>
      </div>
    </header>
  )
}
