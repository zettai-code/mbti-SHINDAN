import Link from "next/link"

export function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/job-fit" className="text-sm sm:text-base font-bold text-gray-800 tracking-tight shrink-0">
          <span className="hidden sm:inline">職種適合度診断</span>
          <span className="sm:hidden">適合度診断</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href="/job-fit"
            className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-colors whitespace-nowrap"
          >
            職種適合度
          </Link>
          <Link
            href="/companies"
            className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-colors whitespace-nowrap"
          >
            企業一覧
          </Link>
          <Link
            href="/terms"
            className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-colors whitespace-nowrap"
          >
            利用規約
          </Link>
          <Link
            href="/dashboard"
            className="hidden sm:inline text-sm text-gray-500 hover:text-gray-800 transition-colors whitespace-nowrap"
          >
            データDB
          </Link>
        </nav>
      </div>
    </header>
  )
}
