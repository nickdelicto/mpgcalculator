// "Need wheels for this trip?" rental car / RV partner cards.
// Hidden until the affiliate links exist in the server env (set them in .env.local on the VPS):
//   RENTAL_CAR_AFFILIATE_URL  e.g. Discover Cars link with your a_aid
//   RV_AFFILIATE_URL          e.g. Outdoorsy link from AvantLink/CJ
// Either URL may contain {route} (replaced with the page's route slug) for sub-ID tracking.

interface Props {
  routeSlug: string
  fromName: string
  toName: string
  distanceMi: number
}

const fill = (url: string, slug: string) => url.replace(/\{route\}/g, encodeURIComponent(slug))

export default function RentalOffers({ routeSlug, fromName, toName, distanceMi }: Props) {
  const car = process.env.RENTAL_CAR_AFFILIATE_URL
  const rv = process.env.RV_AFFILIATE_URL
  if (!car && !rv) return null
  const long = distanceMi >= 300
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Need a vehicle for this trip?</h2>
      <p className="text-gray-600 mb-4">
        {long
          ? `Flying into ${toName} and driving back, or don't want ${Math.round(distanceMi * 2).toLocaleString()} miles on your own car? Compare rentals before you go.`
          : `No car, or want something bigger for the ${fromName} to ${toName} drive? Compare rentals before you go.`}
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {car && (
          <a href={fill(car, routeSlug)} target="_blank" rel="sponsored noopener" className="block bg-white rounded-xl border border-emerald-200 p-4 shadow-sm hover:shadow-md hover:border-emerald-400 transition">
            <div className="text-xs uppercase text-emerald-700 font-semibold">Rental car</div>
            <div className="font-bold text-gray-900">Compare car rental prices in {fromName}</div>
            <div className="text-sm text-gray-600 mt-1">Hundreds of rental companies in one search, free cancellation on most bookings.</div>
            <div className="text-sm text-blue-700 mt-2">Search rental cars →</div>
          </a>
        )}
        {rv && (
          <a href={fill(rv, routeSlug)} target="_blank" rel="sponsored noopener" className="block bg-white rounded-xl border border-orange-200 p-4 shadow-sm hover:shadow-md hover:border-orange-400 transition">
            <div className="text-xs uppercase text-orange-700 font-semibold">RV or campervan</div>
            <div className="font-bold text-gray-900">Make the drive the trip: rent an RV</div>
            <div className="text-sm text-gray-600 mt-1">Sleep on the road instead of paying for hotels along the way.</div>
            <div className="text-sm text-blue-700 mt-2">Browse RV rentals →</div>
          </a>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">Partner links. We may earn a commission at no cost to you.</p>
    </section>
  )
}
