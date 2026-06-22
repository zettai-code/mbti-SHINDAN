"use client"

import { useState } from "react"
import Link from "next/link"

const NAV_LINKS = [
  { href: "/diagnosis", label: "診断テスト" },
  { href: "/job-fit", label: "職種適合度" },
  { href: "/companies", label: "企業一覧" },
  { href: "/dashboard", label: "データDB" },
] as const

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-base font-bold text-gray-800 tracking-tight"
          onClick={() => setOpen(false)}
        >
          就活MBTI診断
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="メニュー"
          aria-expanded={open}
          className="md:hidden -mr-2 p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span className="relative block w-5 h-4">
            <span
              className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition-transform duration-200 ${
                open ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[7px] h-0.5 w-5 bg-current transition-opacity duration-200 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 bottom-0 h-0.5 w-5 bg-current transition-transform duration-200 ${
                open ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {/* Mobile dropdown panel */}
      {open && (
        <nav className="md:hidden border-t border-gray-100 bg-white">
          <div className="max-w-5xl mx-auto px-6 py-2 flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-50 last:border-b-0"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
