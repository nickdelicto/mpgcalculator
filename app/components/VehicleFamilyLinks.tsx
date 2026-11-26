import Link from 'next/link'
import { CarFront, LineChart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { vehicleSlug, type FamilyGroup } from '../lib/vehicleIndexing'

interface Props {
  /** slug of the page being rendered */
  currentSlug: string
  /** family group for this model year */
  group: FamilyGroup
  /** same make + family across all model years, newest first */
  years: FamilyGroup[]
}

/**
 * Crawlable internal links between a model's trims (same year) and its other
 * model years. Server component — plain <Link>s, no client JS.
 */
export default function VehicleFamilyLinks({ currentSlug, group, years }: Props) {
  const trims = group.members
  const otherYears = years.filter((y) => y.year !== group.year)
  if (trims.length < 2 && otherYears.length === 0) return null

  const familyLabel = `${group.make} ${group.familyName}`

  return (
    <section className="border-t border-gray-700 pt-12 mb-8 space-y-8" aria-label={`${familyLabel} trims and model years`}>
      {trims.length > 1 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <CarFront className="h-6 w-6 text-blue-400" />
              {group.year} {familyLabel} Trims &amp; Versions
            </CardTitle>
            <p className="text-gray-400 text-sm mt-2">
              The EPA rates {trims.length} versions of the {group.year} {familyLabel}. Compare the MPG of each one:
            </p>
          </CardHeader>
          <CardContent>
            <ul className="grid sm:grid-cols-2 gap-2">
              {trims.map((t) => {
                const slug = vehicleSlug(t)
                const isCurrent = slug === currentSlug
                const isMain = slug === group.keeperSlug
                return (
                  <li key={slug}>
                    {isCurrent ? (
                      <span className="block rounded-lg border border-blue-500 bg-blue-900/40 px-3 py-2 text-blue-100">
                        {t.year} {t.make} {t.model} <span className="text-xs text-blue-300">(this page)</span>
                      </span>
                    ) : (
                      <Link
                        href={`/vehicles/${slug}`}
                        className="block rounded-lg border border-gray-700 px-3 py-2 text-blue-400 hover:border-blue-500 hover:text-blue-300 transition-colors"
                      >
                        {t.year} {t.make} {t.model} MPG
                        {isMain && <span className="ml-1 text-xs text-gray-400">(main page)</span>}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {otherYears.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <LineChart className="h-6 w-6 text-blue-400" />
              {familyLabel} MPG by Model Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-wrap gap-2">
              {years.map((y) =>
                y.year === group.year ? (
                  <li key={y.year}>
                    <span className="inline-block rounded-lg border border-blue-500 bg-blue-900/40 px-3 py-1 text-blue-100">
                      {y.year}
                    </span>
                  </li>
                ) : (
                  <li key={y.year}>
                    <Link
                      href={`/vehicles/${y.keeperSlug}`}
                      title={`${y.year} ${familyLabel} MPG`}
                      className="inline-block rounded-lg border border-gray-700 px-3 py-1 text-blue-400 hover:border-blue-500 hover:text-blue-300 transition-colors"
                    >
                      {y.year}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
