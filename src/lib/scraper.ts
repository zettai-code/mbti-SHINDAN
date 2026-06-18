/**
 * BAN対策付きスクレイピングユーティリティ
 * - リクエスト間にランダム遅延を挿入
 * - 指数バックオフ付きリトライ
 * - User-Agentローテーション
 */

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:126.0) Gecko/20100101 Firefox/126.0",
] as const

type ScraperConfig = {
  readonly minDelayMs: number
  readonly maxDelayMs: number
  readonly maxRetries: number
  readonly backoffMultiplier: number
  readonly jitterRatio: number
}

const DEFAULT_CONFIG: ScraperConfig = {
  minDelayMs: 2000,
  maxDelayMs: 7000,
  maxRetries: 3,
  backoffMultiplier: 2,
  jitterRatio: 0.3,
}

function getRandomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomUserAgent(): string {
  const index = Math.floor(Math.random() * USER_AGENTS.length)
  return USER_AGENTS[index]
}

function addJitter(baseDelay: number, jitterRatio: number): number {
  const jitter = baseDelay * jitterRatio * (Math.random() * 2 - 1)
  return Math.max(500, Math.floor(baseDelay + jitter))
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type FetchResult = {
  readonly ok: boolean
  readonly status: number
  readonly text: string
  readonly url: string
}

type ScrapeOptions = {
  readonly config?: Partial<ScraperConfig>
  readonly headers?: Record<string, string>
}

/**
 * ランダム遅延付きの単一URLフェッチ
 * 指数バックオフ + ジッター付きリトライ
 */
export async function scrapePage(
  url: string,
  options: ScrapeOptions = {}
): Promise<FetchResult> {
  const config = { ...DEFAULT_CONFIG, ...options.config }
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    if (attempt > 0) {
      const backoffBase = config.minDelayMs * Math.pow(config.backoffMultiplier, attempt)
      const backoffDelay = addJitter(backoffBase, config.jitterRatio)
      console.log(`[scraper] リトライ ${attempt}/${config.maxRetries} - ${backoffDelay}ms 待機`)
      await sleep(backoffDelay)
    }

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": getRandomUserAgent(),
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
          "Cache-Control": "no-cache",
          ...options.headers,
        },
      })

      const text = await response.text()

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After")
        const waitMs = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : config.maxDelayMs * 3
        console.log(`[scraper] 429 Rate Limited - ${waitMs}ms 待機`)
        await sleep(waitMs)
        continue
      }

      return {
        ok: response.ok,
        status: response.status,
        text,
        url,
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`[scraper] エラー (attempt ${attempt + 1}): ${lastError.message}`)
    }
  }

  throw new Error(`[scraper] ${url} の取得に失敗 (${config.maxRetries}回リトライ済み): ${lastError?.message}`)
}

/**
 * 複数URLを順次スクレイピング（ランダム間隔）
 * BAN回避のため一定でない間隔でリクエスト
 */
export async function scrapePages(
  urls: readonly string[],
  options: ScrapeOptions = {},
  onProgress?: (completed: number, total: number, url: string) => void
): Promise<readonly FetchResult[]> {
  const config = { ...DEFAULT_CONFIG, ...options.config }
  const results: FetchResult[] = []

  for (let i = 0; i < urls.length; i++) {
    if (i > 0) {
      const delay = getRandomDelay(config.minDelayMs, config.maxDelayMs)
      console.log(`[scraper] ${i + 1}/${urls.length} - ${delay}ms 待機 (ランダム)`)
      await sleep(delay)
    }

    const result = await scrapePage(urls[i], options)
    results.push(result)

    onProgress?.(i + 1, urls.length, urls[i])
  }

  return results
}

/**
 * バッチスクレイピング（チャンク分割 + チャンク間に長めの休憩）
 */
export async function scrapeBatched(
  urls: readonly string[],
  options: ScrapeOptions & {
    readonly chunkSize?: number
    readonly chunkDelayMin?: number
    readonly chunkDelayMax?: number
  } = {},
  onProgress?: (completed: number, total: number, url: string) => void
): Promise<readonly FetchResult[]> {
  const chunkSize = options.chunkSize ?? 10
  const chunkDelayMin = options.chunkDelayMin ?? 15000
  const chunkDelayMax = options.chunkDelayMax ?? 30000

  const results: FetchResult[] = []

  for (let i = 0; i < urls.length; i += chunkSize) {
    if (i > 0) {
      const chunkDelay = getRandomDelay(chunkDelayMin, chunkDelayMax)
      console.log(`[scraper] チャンク休憩: ${chunkDelay}ms (${Math.floor(i / chunkSize)}チャンク完了)`)
      await sleep(chunkDelay)
    }

    const chunk = urls.slice(i, i + chunkSize)
    const chunkResults = await scrapePages(chunk, options, (completed, _, url) => {
      onProgress?.(i + completed, urls.length, url)
    })
    results.push(...chunkResults)
  }

  return results
}
