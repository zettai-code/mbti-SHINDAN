import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Header } from "@/components/Header"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "職種適合度診断 | あなたに合った仕事を見つけよう",
  description:
    "30問の質問であなたの素養を分析。向いている企業・職種・業界がわかる就活特化型の職種適合度診断です。",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full w-full overflow-x-hidden flex flex-col font-[family-name:var(--font-geist-sans)]">
        <Header />
        <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
      </body>
    </html>
  )
}
