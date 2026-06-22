# MBTI SHINDAN

MBTI 風の性格診断と、就活向けの職種・企業適合度診断を組み合わせた Next.js アプリです。

30問の回答から、ユーザーの素養・能力・価値観・働き方の傾向をスコア化し、企業・職種ごとの要求プロファイルと照合してマッチ度を表示します。

## 主な機能

- MBTI 風の性格タイプ診断
- 30問による職種適性診断
- 28個の能力・価値観パラメータのスコアリング
- 大学ランク・性別・バックグラウンドを考慮した補正
- 企業・職種ごとのマッチ度ランキング
- 企業データ、採用大学データ、男女比データの表示
- アクセス集計用の管理ページ

## 技術スタック

- Next.js
- React
- TypeScript
- Tailwind CSS
- ESLint

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで以下を開きます。

```text
http://localhost:3000
```

## よく使うコマンド

```bash
npm run dev
npm run build
npm run lint
npm run scrape:universities
```

## ディレクトリ構成

```text
src/app          ページと API Routes
src/components   UI コンポーネント
src/data         診断・企業・職種・採用関連データ
src/lib          診断ロジック、職種適合度計算、アクセス集計
src/types        共通型定義
scripts          データ生成・スクレイピング用スクリプト
```

## 注意

このアプリの診断結果は就活準備の参考情報です。実際の選考結果や企業適性を保証するものではありません。
