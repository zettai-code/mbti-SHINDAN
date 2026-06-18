import Link from "next/link"

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-indigo-600">
          就活MBTI診断
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/job-fit"
            className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            職種適合度
          </Link>
          <Link
            href="/companies"
            className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            企業一覧
          </Link>
        </div>
      </div>
    </header>
  )
}
