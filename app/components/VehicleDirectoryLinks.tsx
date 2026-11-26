import Link from 'next/link'
import { CarFront } from 'lucide-react'
import { getVehicleIndex, type FamilyGroup } from '../lib/vehicleIndexing'

/**
 * Server-rendered, crawlable list of the newest model year's main (keeper)
 * vehicle pages, grouped by make. Renders nothing if the vehicle index is
 * unavailable.
 */
export default async function VehicleDirectoryLinks() {
  const index = await getVehicleIndex()
  if (!index) return null

  // Latest model year that has indexable keepers
  const year = index.newestYear
  const keepers = index.groups.filter((g) => g.year === year && g.keeperIndexable)
  if (keepers.length === 0) return null

  const byMake = new Map<string, FamilyGroup[]>()
  for (const g of keepers) {
    let list = byMake.get(g.make)
    if (!list) byMake.set(g.make, (list = []))
    list.push(g)
  }
  const makes = [...byMake.keys()].sort((a, b) => a.localeCompare(b))

  return (
    <section className="bg-gray-800 rounded-2xl p-8 border border-gray-700 mt-12">
      <h2 className="text-2xl font-bold text-white mb-2 font-heading flex items-center gap-2">
        <CarFront className="h-6 w-6 text-blue-400" />
        {year} Models: MPG by Make
      </h2>
      <p className="text-gray-400 mb-6 font-heading">
        Official EPA fuel economy for every {year} model. Each page also links to the model&apos;s other trims and model years.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {makes.map((make) => (
          <div key={make}>
            <h3 className="text-lg font-semibold text-white mb-2">{year} {make}</h3>
            <ul className="space-y-1">
              {byMake
                .get(make)!
                .sort((a, b) => a.familyName.localeCompare(b.familyName))
                .map((g) => (
                  <li key={g.keeperSlug}>
                    <Link
                      href={`/vehicles/${g.keeperSlug}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {year} {make} {g.familyName} MPG
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
