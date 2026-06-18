import Link from "next/link"

export function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-base font-bold text-gray-800 tracking-tight">
          就活MBTI診断
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/diagnosis"
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            診断テスト
          </Link>
          <Link
            href="/companies"
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            企業一覧
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            データDB
          </Link>
        </nav>
      </div>
    </header>
  )
}
