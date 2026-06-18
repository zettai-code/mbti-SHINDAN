import Link from "next/link"

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-lg mx-auto px-4 py-3">
        <Link href="/" className="text-lg font-bold text-indigo-600">
          就活MBTI診断
        </Link>
      </div>
    </header>
  )
}
