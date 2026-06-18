import Link from "next/link"
import { Header } from "@/components/Header"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5b4a8a] via-[#7c5e99] to-[#4a8a7a] flex flex-col">
      <Header variant="dark" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="text-center animate-fade-in max-w-md">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            あなたに合った
            <br />
            就職先を見つけよう
          </h1>
          <p className="text-white/80 text-lg mb-12 leading-relaxed">
            40問の性格診断から
            <br />
            向いている企業・職種・業界を提案します
          </p>

          <Link
            href="/diagnosis"
            className="inline-block bg-white text-[#5b4a8a] font-bold py-4 px-12 rounded-full text-lg hover:bg-white/90 transition-all duration-200 shadow-xl shadow-black/20 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
          >
            診断スタート
          </Link>

          <p className="text-white/50 text-sm mt-6">所要時間：約5分 / 40問</p>
        </div>

        <div className="mt-16 max-w-sm w-full animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h2 className="text-white/90 font-bold text-sm mb-4 tracking-wide uppercase">
              診断結果で提案されること
            </h2>
            <ul className="space-y-3 text-sm text-white/70">
              {[
                "あなたの性格に合った企業（実名付き）",
                "向いている職種・ポジション",
                "マッチする業界",
                "合う働き方・合わない働き方",
                "性格タイプに基づく強み・弱み",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#33a474] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
