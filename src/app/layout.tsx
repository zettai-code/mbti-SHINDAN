import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Header } from "@/components/Header"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "就活MBTI診断 | あなたに合った仕事を見つけよう",
  description:
    "40問の質問であなたのMBTIタイプを診断。向いている職種・業界・働き方がわかる就活特化型MBTI診断です。",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-geist-sans)]">
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
