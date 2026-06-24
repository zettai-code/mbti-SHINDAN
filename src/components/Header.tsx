import Link from "next/link"

export function Header() {
  return (
    <header className="sticky top-0 z-50" style={{ background: "#0b3a6e" }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-center gap-4">
        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href="/diagnosis"
            className="relative text-sm text-white/70 hover:text-white transition-colors whitespace-nowrap group py-1"
          >
            性格診断
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#7c5e99] group-hover:w-full transition-all duration-300" />
          </Link>
          <Link
            href="/job-fit"
            className="relative text-sm text-white/70 hover:text-white transition-colors whitespace-nowrap group py-1"
          >
            職種適合度
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#7c5e99] group-hover:w-full transition-all duration-300" />
          </Link>
        </nav>
        <Link href="/" className="relative text-base sm:text-lg font-bold tracking-tight mx-8 shrink-0 text-white group py-1">
          <span className="hidden sm:inline">就活MBTI診断</span>
          <span className="sm:hidden">MBTI診断</span>
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#7c5e99] group-hover:w-full transition-all duration-300" />
        </Link>
        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href="/companies"
            className="relative text-sm text-white/70 hover:text-white transition-colors whitespace-nowrap group py-1"
          >
            企業一覧
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#7c5e99] group-hover:w-full transition-all duration-300" />
          </Link>
          <Link
            href="/terms"
            className="relative text-sm text-white/70 hover:text-white transition-colors whitespace-nowrap group py-1"
          >
            利用規約
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#7c5e99] group-hover:w-full transition-all duration-300" />
          </Link>
        </nav>
      </div>
    </header>
  )
}
