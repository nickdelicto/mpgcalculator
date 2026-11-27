import { readFileSync } from 'fs'
import path from 'path'

// Weekly U.S. regular gas history (EIA EMM_EPMR_PTE_NUS_DPG). The weekly cron refreshes
// data/eia-us-weekly.live.json (git-ignored); data/eia-us-weekly.json is the committed baseline.
export type Week = [string, number]

export function getHistory(): Week[] {
  for (const f of ['eia-us-weekly.live.json', 'eia-us-weekly.json']) {
    try {
      return (JSON.parse(readFileSync(path.join(process.cwd(), 'data', f), 'utf8')) as { weeks: Week[] }).weeks
    } catch {
      // try the next file
    }
  }
  return []
}

export type Holiday = 'thanksgiving' | 'christmas'

/** Monday-dated EIA week that contains the holiday. */
export function holidayWeek(holiday: Holiday, year: number) {
  if (holiday === 'thanksgiving') {
    const first = new Date(Date.UTC(year, 10, 1)).getUTCDay()
    const firstThu = 1 + ((4 - first + 7) % 7)
    return new Date(Date.UTC(year, 10, firstThu + 21 - 3)).toISOString().slice(0, 10)
  }
  const xmas = new Date(Date.UTC(year, 11, 25))
  const back = (xmas.getUTCDay() + 6) % 7 // days since Monday
  return new Date(Date.UTC(year, 11, 25 - back)).toISOString().slice(0, 10)
}

export function holidaySeries(holiday: Holiday, toYear: number, weeks = getHistory()) {
  const m = new Map(weeks)
  const out: { year: number; week: string; price: number }[] = []
  for (let y = 1990; y <= toYear; y++) {
    const week = holidayWeek(holiday, y)
    const price = m.get(week)
    if (price) out.push({ year: y, week, price })
  }
  return out
}

/** 1-based rank of `price` among `series` prices (highest = 1). */
export function rankOf(price: number, series: { price: number }[]) {
  return series.filter((s) => s.price > price).length + 1
}
