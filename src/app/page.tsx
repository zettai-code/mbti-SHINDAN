import Link from "next/link"

export default function HomePage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <div className="mb-8">
        <div className="text-6xl mb-4">&#x1F50D;</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          就活MBTI診断
        </h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          40問の質問に答えるだけで、
          <br />
          あなたのMBTIタイプと
          <br />
          向いている仕事がわかります。
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 text-left">
        <h2 className="text-sm font-bold text-gray-800 mb-3">
          診断でわかること
        </h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="text-indigo-500">&#x2713;</span>
            あなたのMBTIタイプと性格特徴
          </li>
          <li className="flex items-center gap-2">
            <span className="text-indigo-500">&#x2713;</span>
            強み・弱み
          </li>
          <li className="flex items-center gap-2">
            <span className="text-indigo-500">&#x2713;</span>
            向いている職種・業界
          </li>
          <li className="flex items-center gap-2">
            <span className="text-indigo-500">&#x2713;</span>
            向いている働き方・向いていない働き方
          </li>
          <li className="flex items-center gap-2">
            <span className="text-indigo-500">&#x2713;</span>
            おすすめ企業タイプ
          </li>
        </ul>
      </div>

      <div className="text-xs text-gray-400 mb-6">所要時間：約5分</div>

      <Link
        href="/diagnosis"
        className="inline-block w-full bg-indigo-600 text-white font-bold py-4 px-8 rounded-2xl text-base hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
      >
        診断を始める
      </Link>
    </div>
  )
}
