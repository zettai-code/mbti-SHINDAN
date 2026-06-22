/* eslint-disable @next/next/no-img-element */
import Link from "next/link"

const DIAGNOSE_CARDS = [
  { img: "/characters/telescope.png", title: "あなたの性格タイプ", desc: "16タイプの中から、あなたの性格を明らかにします。" },
  { img: "/characters/gardener.png", title: "強みと得意なこと", desc: "あなたが自然に発揮できる強みがわかります。" },
  { img: "/characters/compass.png", title: "向いている仕事", desc: "性格タイプに合った職種・業界を提案します。" },
  { img: "/characters/reader.png", title: "相性の良いタイプ", desc: "一緒に働きやすい性格タイプがわかります。" },
] as const

const STEPS = [
  { n: "01", title: "質問に答える", desc: "直感で選ぶだけの簡単な質問に答えていきます。" },
  { n: "02", title: "結果を受け取る", desc: "あなたの性格タイプと適性が即座にわかります。" },
  { n: "03", title: "キャリアに活かす", desc: "自分の強みを就活・キャリア選択に役立てましょう。" },
] as const

const TYPE_CARDS = [
  { img: "/characters/telescope.png", code: "INTJ", name: "建築家", desc: "論理的なアイデアを形にする戦略家。", color: "#7c5e99" },
  { img: "/characters/sitting.png", code: "ENFP", name: "運動家", desc: "好奇心旺盛で人を巻き込む情熱家。", color: "#33a474" },
  { img: "/characters/compass.png", code: "ESFJ", name: "領事官", desc: "協調性に富み、チーム調和を大切に。", color: "#4298b4" },
  { img: "/characters/reader.png", code: "INTP", name: "論理学者", desc: "本質を探究する知的な分析家。", color: "#d4a34a" },
] as const

const TESTIMONIALS = [
  { initial: "K", color: "#7c5e99", text: "自分の強みや向いている仕事が明確になり、就活の軸が決まりました。", meta: "大学4年生 / ESFJ" },
  { initial: "R", color: "#4298b4", text: "チームでの役割や相性の良い環境がわかって参考になりました。", meta: "大学3年生 / INTP" },
  { initial: "M", color: "#33a474", text: "診断結果をもとに自己分析が深まり、面接でも話しやすくなりました。", meta: "大学4年生 / ENFP" },
] as const

const PURPLE = "#7c5e99"

const HERO_BADGES = [
  {
    label: "約10分で完了",
    icon: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  },
  {
    label: "正確で信頼性の\n高い診断",
    icon: (<><path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" /><path d="M9 12l2 2 4-4" /></>),
  },
  {
    label: "世界中で\n愛用者多数",
    icon: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" /></>),
  },
] as const

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* ───────── Hero (FV) ───────── */}
      <section className="relative overflow-hidden" style={{ background: "#0361a8" }}>
        {/* 島イラスト（少し小さめ・右寄せ。左側は背景の青で埋める） */}
        <img
          src="/hero-island.jpg"
          alt="MBTI診断のイメージイラスト"
          className="block w-[85%] h-auto ml-auto select-none"
        />
        {/* 左を少し暗くして文字を読みやすく */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg,rgba(8,40,86,0.72) 0%,rgba(8,40,86,0.30) 32%,rgba(8,40,86,0) 55%)" }} />

        {/* テキストオーバーレイ：画像と同じ座標系（左からの%）で配置し、島の青い余白ゾーン内に固定 */}
        <div className="absolute inset-0 flex items-center">
          <div style={{ paddingLeft: "6.5%", width: "55%", transform: "translateY(-6%)" }}>
            <h1
              className="font-extrabold text-white leading-tight"
              style={{ fontSize: "clamp(1rem,3vw,2.85rem)", letterSpacing: "0.07em" }}
            >
              自分らしい強みを見つけて、<br />理想のキャリアを見つけよう。
            </h1>
            <p
              className="text-white/85 leading-snug mt-[3%] mb-[5%]"
              style={{ fontSize: "clamp(0.78rem,2vw,1.35rem)", letterSpacing: "0.04em" }}
            >
              就活に役立つMBTI診断で、<br />自分の性格や価値観を深く理解し、<br />あなたに合った仕事や働き方を見つけます。
            </p>
            <Link
              href="/diagnosis"
              className="inline-flex items-center gap-2 text-white font-bold rounded-full shadow-lg transition-opacity hover:opacity-90"
              style={{ background: PURPLE, fontSize: "clamp(0.7rem,1.95vw,1.15rem)", padding: "clamp(0.45rem,1.5vw,1.1rem) clamp(1.6rem,4.6vw,3.6rem)" }}
            >
              無料で診断を始める
              <span aria-hidden>→</span>
            </Link>

            <div className="flex gap-[8%] mt-[7%]">
              {HERO_BADGES.map((b) => (
                <div key={b.label} className="flex flex-col items-center text-center text-white/90" style={{ width: "clamp(3.6rem,9vw,6.8rem)" }}>
                  <span className="flex items-center justify-center mb-[14%]" style={{ width: "clamp(1.9rem,4.2vw,3.2rem)", height: "clamp(1.9rem,4.2vw,3.2rem)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white" style={{ width: "100%", height: "100%" }}>{b.icon}</svg>
                  </span>
                  <span className="leading-tight whitespace-pre-line" style={{ fontSize: "clamp(0.6rem,1.5vw,0.95rem)" }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── この診断でわかること ───────── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">この診断でわかること</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DIAGNOSE_CARDS.map((c) => (
              <div key={c.title} className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-shadow">
                <div className="h-32 flex items-end justify-center mb-4">
                  <img src={c.img} alt="" className="max-h-32 w-auto object-contain" />
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-2">{c.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── 診断はかんたん3ステップ ───────── */}
      <section className="py-14 sm:py-20" style={{ background: "#eef4fb" }}>
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">診断はかんたん3ステップ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4" style={{ color: PURPLE }}>
                  <span className="text-lg font-extrabold">{s.n}</span>
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-2">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[16rem] mx-auto">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <span className="hidden sm:block absolute top-8 -right-2 text-gray-300 text-xl">›</span>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/diagnosis" className="inline-flex items-center gap-2 text-white font-bold py-3.5 px-9 rounded-full text-sm shadow-md hover:opacity-90 transition-opacity" style={{ background: PURPLE }}>
              無料で診断を始める <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── 16タイプの性格 ───────── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">16タイプの性格</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {TYPE_CARDS.map((t) => (
              <div key={t.code} className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-shadow">
                <div className="h-28 flex items-end justify-center mb-3">
                  <img src={t.img} alt="" className="max-h-28 w-auto object-contain" />
                </div>
                <div className="text-sm font-extrabold tracking-wide" style={{ color: t.color }}>{t.code}</div>
                <div className="text-sm font-bold text-gray-800 mb-1">{t.name}</div>
                <p className="text-[11px] text-gray-500 leading-relaxed mb-3">{t.desc}</p>
                <Link href="/diagnosis" className="text-[11px] font-medium" style={{ color: t.color }}>詳細を見る →</Link>
              </div>
            ))}
            {/* 全16タイプ */}
            <Link href="/diagnosis" className="rounded-2xl border-2 border-dashed border-gray-200 p-5 flex flex-col items-center justify-center text-center hover:border-gray-300 transition-colors">
              <span className="w-12 h-12 rounded-full flex items-center justify-center mb-3 text-white text-xl" style={{ background: PURPLE }}>⋯</span>
              <span className="text-sm font-bold text-gray-700">全16タイプを<br />表示する</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── 利用者の声 ───────── */}
      <section className="py-14 sm:py-20" style={{ background: "#f7f9fc" }}>
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">利用者の声</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.initial} className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold" style={{ background: t.color }}>{t.initial}</span>
                  <span className="text-xs text-gray-400">{t.meta}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── 下部CTA（島イラスト再利用） ───────── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#073d7a 0%,#0b5aa3 60%,#1670b5 100%)" }}>
        <div className="absolute inset-y-0 right-0 w-1/2 opacity-40 pointer-events-none">
          <img src="/hero-island.jpg" alt="" className="h-full w-full object-cover object-left" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg,#0b5aa3 0%,rgba(22,112,181,0) 80%)" }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 py-16 sm:py-20">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">あなたの可能性を、<br className="sm:hidden" />今すぐ診断してみませんか？</h2>
            <p className="text-white/80 text-sm mb-8">たった5分で、未来のキャリアのヒントが見つかります。</p>
            <Link href="/diagnosis" className="inline-flex items-center gap-2 text-white font-bold py-4 px-10 rounded-full text-base shadow-lg hover:opacity-90 transition-opacity" style={{ background: PURPLE }}>
              無料で診断を始める <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── Footer（テキストのみ・画像なし） ───────── */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 sm:col-span-1">
            <div className="font-bold text-gray-800 mb-2">就活MBTI診断</div>
            <p className="text-xs text-gray-400 leading-relaxed">MBTIで強みを知り、<br />納得のいくキャリアへ。</p>
          </div>
          <div>
            <div className="font-semibold text-gray-700 mb-3">サービス</div>
            <ul className="space-y-2 text-xs text-gray-500">
              <li><Link href="/diagnosis" className="hover:text-gray-800">MBTI診断</Link></li>
              <li><Link href="/job-fit" className="hover:text-gray-800">職種適合度</Link></li>
              <li><Link href="/match" className="hover:text-gray-800">企業マッチ診断</Link></li>
              <li><Link href="/companies" className="hover:text-gray-800">企業一覧</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-gray-700 mb-3">サポート</div>
            <ul className="space-y-2 text-xs text-gray-500">
              <li><Link href="/dashboard" className="hover:text-gray-800">データDB</Link></li>
              <li><Link href="/terms" className="hover:text-gray-800">利用規約</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-gray-700 mb-3">運営</div>
            <p className="text-xs text-gray-500 leading-relaxed">就活MBTI診断<br />キャリア支援チーム</p>
          </div>
        </div>
        <div className="border-t border-gray-50">
          <p className="max-w-6xl mx-auto px-6 py-5 text-[11px] text-gray-400">© 2026 就活MBTI診断 All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}
