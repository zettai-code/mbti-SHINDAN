import Link from "next/link"

const STEPS = [
  {
    step: "ステップ 1",
    title: "40問に回答",
    description: "自分の性格タイプを知るために、直感で正直に回答してください。",
    color: "border-[#4298b4]",
    bg: "bg-[#eef7fa]",
  },
  {
    step: "ステップ 2",
    title: "就職先を確認",
    description: "あなたの性格に合った企業・職種・業界がわかります。",
    color: "border-[#33a474]",
    bg: "bg-[#eef8f3]",
  },
  {
    step: "ステップ 3",
    title: "就活に活かす",
    description: "自分の強みと適性を理解して、納得のいく就職活動を進めましょう。",
    color: "border-[#7c5e99]",
    bg: "bg-[#f5f0fa]",
  },
] as const

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-[#f8f8f8] py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
            あなたに合った
            <br />
            就職先を見つけよう
          </h1>
          <p className="text-gray-500 text-base sm:text-lg mb-10">
            40問の性格診断であなたのMBTIタイプを判定し、
            <br className="hidden sm:block" />
            向いている企業・職種・業界を提案します。
          </p>
          <Link
            href="/diagnosis"
            className="inline-block bg-[#4298b4] text-white font-bold py-4 px-14 rounded-full text-base hover:bg-[#3a89a3] transition-colors shadow-sm"
          >
            テストを受ける
          </Link>
          <p className="text-gray-400 text-xs mt-5">所要時間：約5分 / 全40問</p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div
                key={s.step}
                className={`rounded-xl border-t-4 ${s.color} ${s.bg} p-6 sm:p-8`}
              >
                <span className="inline-block text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full mb-4">
                  {s.step}
                </span>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#f8f8f8] py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-10">
            診断結果でわかること
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "向いている職種", color: "bg-[#4298b4]" },
              { label: "向いている業界", color: "bg-[#33a474]" },
              { label: "おすすめ企業（実名付き）", color: "bg-[#7c5e99]" },
              { label: "合う働き方・合わない働き方", color: "bg-[#d4a34a]" },
              { label: "性格タイプの強み・弱み", color: "bg-[#4298b4]" },
              { label: "おすすめ企業タイプ", color: "bg-[#33a474]" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-3 bg-white rounded-lg px-5 py-4 shadow-sm"
              >
                <span className={`w-2 h-2 rounded-full ${f.color} shrink-0`} />
                <span className="text-sm text-gray-700">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 text-center">
        <div className="max-w-md mx-auto px-6">
          <p className="text-gray-500 mb-6 text-sm">
            自分に合った就職先を見つける第一歩
          </p>
          <Link
            href="/diagnosis"
            className="inline-block bg-[#4298b4] text-white font-bold py-4 px-14 rounded-full text-base hover:bg-[#3a89a3] transition-colors shadow-sm"
          >
            診断を始める
          </Link>
        </div>
      </section>
    </div>
  )
}
