"use client"

import Link from "next/link"

const PURPLE = "#7c5e99"

const NAV_LINKS = [
  { href: "/job-fit", label: "職種適合度" },
  { href: "/companies", label: "企業一覧" },
  { href: "/terms", label: "利用規約" },
  { href: "/dashboard", label: "データDB" },
] as const

function Header1() {
  return (
    <header className="h-20" style={{ background: "linear-gradient(90deg, #073d7a 0%, #0b5aa3 60%, #1670b5 100%)" }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-full flex items-center justify-between gap-4">
        <span className="text-sm sm:text-base font-bold text-white tracking-tight">職種適合度診断</span>
        <nav className="flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <span key={l.href} className="text-sm text-white/70 hover:text-white transition-colors whitespace-nowrap cursor-pointer">{l.label}</span>
          ))}
        </nav>
      </div>
    </header>
  )
}

function Header2() {
  return (
    <header className="h-20 bg-transparent" style={{ backgroundImage: "url(/hero-island.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="h-full" style={{ background: "rgba(8,40,86,0.5)", backdropFilter: "blur(8px)" }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-full flex items-center justify-between gap-4">
          <span className="text-sm sm:text-base font-bold text-white tracking-tight">職種適合度診断</span>
          <nav className="flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <span key={l.href} className="text-sm text-white/80 hover:text-white transition-colors whitespace-nowrap cursor-pointer">{l.label}</span>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

function Header3() {
  return (
    <header className="h-20" style={{ background: "#0a1f3d" }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-full flex items-center justify-between gap-4">
        <span className="text-sm sm:text-base font-bold text-white tracking-tight">職種適合度診断</span>
        <nav className="flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <span key={l.href} className="text-sm text-gray-400 transition-colors whitespace-nowrap cursor-pointer" style={{ ["--tw-text-opacity" as string]: 1 }} onMouseOver={() => {}} >{l.label}</span>
          ))}
          <span className="text-sm font-bold text-white px-4 py-2 rounded-full cursor-pointer" style={{ background: PURPLE }}>診断する</span>
        </nav>
      </div>
    </header>
  )
}

function Header4() {
  return (
    <div className="pt-3 px-4" style={{ background: "#f0f2f5" }}>
      <header className="h-16 bg-white rounded-2xl shadow-lg">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-full flex items-center justify-between gap-4">
          <span className="text-sm sm:text-base font-bold text-gray-800 tracking-tight">職種適合度診断</span>
          <nav className="flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <span key={l.href} className="text-sm text-gray-500 hover:text-gray-800 transition-colors whitespace-nowrap cursor-pointer">{l.label}</span>
            ))}
          </nav>
        </div>
      </header>
    </div>
  )
}

function Header5() {
  return (
    <header className="h-20 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-full flex items-center justify-center gap-4">
        <nav className="flex items-center gap-6">
          <span className="text-sm text-gray-500 hover:text-gray-800 transition-colors whitespace-nowrap cursor-pointer">職種適合度</span>
          <span className="text-sm text-gray-500 hover:text-gray-800 transition-colors whitespace-nowrap cursor-pointer">企業一覧</span>
        </nav>
        <span className="text-base sm:text-lg font-bold tracking-tight mx-8" style={{ color: PURPLE }}>職種適合度診断</span>
        <nav className="flex items-center gap-6">
          <span className="text-sm text-gray-500 hover:text-gray-800 transition-colors whitespace-nowrap cursor-pointer">利用規約</span>
          <span className="text-sm text-gray-500 hover:text-gray-800 transition-colors whitespace-nowrap cursor-pointer">データDB</span>
        </nav>
      </div>
    </header>
  )
}

export default function HeaderPreview() {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6 space-y-10">
      <h1 className="text-2xl font-bold text-gray-800 text-center">ヘッダーデザイン比較</h1>

      <div className="space-y-8 max-w-6xl mx-auto">
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-3">案1: グラデーション背景 + 白文字</h2>
          <div className="rounded-xl overflow-hidden shadow-md">
            <Header1 />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-3">案2: 透明ヘッダー（ブラー背景）</h2>
          <div className="rounded-xl overflow-hidden shadow-md">
            <Header2 />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-3">案3: ダークネイビー + アクセントカラー</h2>
          <div className="rounded-xl overflow-hidden shadow-md">
            <Header3 />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-3">案4: 角丸フローティング</h2>
          <div className="rounded-xl overflow-hidden shadow-md">
            <Header4 />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-3">案5: ロゴ中央 + ナビ左右分割</h2>
          <div className="rounded-xl overflow-hidden shadow-md">
            <Header5 />
          </div>
        </div>
      </div>
    </div>
  )
}
