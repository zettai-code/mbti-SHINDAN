"use client"

const NAV_LINKS = [
  { href: "/job-fit", label: "職種適合度" },
  { href: "/companies", label: "企業一覧" },
  { href: "/terms", label: "利用規約" },
  { href: "/dashboard", label: "データDB" },
]

const BG = "#0b3a6e"

function Header1() {
  return (
    <header className="h-16" style={{ background: BG }}>
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-center gap-4">
        <nav className="flex items-center gap-6">
          {NAV_LINKS.slice(0, 2).map((l) => (
            <span key={l.href} className="relative text-sm text-white/70 hover:text-white transition-colors cursor-pointer group py-1">
              {l.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
            </span>
          ))}
        </nav>
        <span className="text-base font-bold text-white mx-8">職種適合度診断</span>
        <nav className="flex items-center gap-6">
          {NAV_LINKS.slice(2).map((l) => (
            <span key={l.href} className="relative text-sm text-white/70 hover:text-white transition-colors cursor-pointer group py-1">
              {l.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
            </span>
          ))}
        </nav>
      </div>
    </header>
  )
}

function Header2() {
  return (
    <header className="h-16" style={{ background: BG }}>
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-center gap-4">
        <nav className="flex items-center gap-4">
          {NAV_LINKS.slice(0, 2).map((l) => (
            <span key={l.href} className="text-sm text-white/70 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer">
              {l.label}
            </span>
          ))}
        </nav>
        <span className="text-base font-bold text-white mx-8">職種適合度診断</span>
        <nav className="flex items-center gap-4">
          {NAV_LINKS.slice(2).map((l) => (
            <span key={l.href} className="text-sm text-white/70 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer">
              {l.label}
            </span>
          ))}
        </nav>
      </div>
    </header>
  )
}

function Header3() {
  return (
    <header className="h-16" style={{ background: BG }}>
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-center gap-4">
        <nav className="flex items-center gap-6">
          {NAV_LINKS.slice(0, 2).map((l) => (
            <span key={l.href} className="text-sm text-white/70 hover:text-white hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 cursor-pointer">
              {l.label}
            </span>
          ))}
        </nav>
        <span className="text-base font-bold text-white mx-8">職種適合度診断</span>
        <nav className="flex items-center gap-6">
          {NAV_LINKS.slice(2).map((l) => (
            <span key={l.href} className="text-sm text-white/70 hover:text-white hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 cursor-pointer">
              {l.label}
            </span>
          ))}
        </nav>
      </div>
    </header>
  )
}

function Header4() {
  return (
    <header className="h-16" style={{ background: BG }}>
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-center gap-4">
        <nav className="flex items-center gap-6">
          {NAV_LINKS.slice(0, 2).map((l) => (
            <span key={l.href} className="relative text-sm text-white/70 hover:text-white transition-colors cursor-pointer group py-1">
              {l.label}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </span>
          ))}
        </nav>
        <span className="text-base font-bold text-white mx-8">職種適合度診断</span>
        <nav className="flex items-center gap-6">
          {NAV_LINKS.slice(2).map((l) => (
            <span key={l.href} className="relative text-sm text-white/70 hover:text-white transition-colors cursor-pointer group py-1">
              {l.label}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </span>
          ))}
        </nav>
      </div>
    </header>
  )
}

function Header5() {
  return (
    <header className="h-16" style={{ background: BG }}>
      <style>{`
        .glow-link:hover { text-shadow: 0 0 8px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.4); }
      `}</style>
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-center gap-4">
        <nav className="flex items-center gap-6">
          {NAV_LINKS.slice(0, 2).map((l) => (
            <span key={l.href} className="glow-link text-sm text-white/70 hover:text-white transition-all duration-300 cursor-pointer">
              {l.label}
            </span>
          ))}
        </nav>
        <span className="text-base font-bold text-white mx-8">職種適合度診断</span>
        <nav className="flex items-center gap-6">
          {NAV_LINKS.slice(2).map((l) => (
            <span key={l.href} className="glow-link text-sm text-white/70 hover:text-white transition-all duration-300 cursor-pointer">
              {l.label}
            </span>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default function HeaderAnimPreview() {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6 space-y-10">
      <h1 className="text-2xl font-bold text-gray-800 text-center">ヘッダーアニメーション比較</h1>
      <p className="text-sm text-gray-500 text-center">各リンクにカーソルを合わせてください</p>

      <div className="space-y-8 max-w-6xl mx-auto">
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-3">案1: 下線スライドイン</h2>
          <div className="rounded-xl overflow-hidden shadow-md"><Header1 /></div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-3">案2: 背景がふわっと光る</h2>
          <div className="rounded-xl overflow-hidden shadow-md"><Header2 /></div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-3">案3: 文字が上にスライド＋拡大</h2>
          <div className="rounded-xl overflow-hidden shadow-md"><Header3 /></div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-3">案4: ドットが現れる</h2>
          <div className="rounded-xl overflow-hidden shadow-md"><Header4 /></div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-3">案5: グロー（発光）エフェクト</h2>
          <div className="rounded-xl overflow-hidden shadow-md"><Header5 /></div>
        </div>
      </div>
    </div>
  )
}
