import Link from 'next/link'
import { getGasPrices, VEHICLE_TYPES, prettyDate } from '../road-trip-cost/lib'

// Homepage guide: "how to calculate miles per gallon", good MPG, cost per mile at this
// week's EIA price, FAQ. Server component; numbers come from EIA + our EPA vehicle data.
export default function MpgGuide() {
  const gas = getGasPrices()
  const us = gas.prices.US
  const week = prettyDate(gas.weekOf)
  const example = { miles: 312, gallons: 11.4 }
  const exMpg = example.miles / example.gallons
  const costRows = [15, 20, 25, 30, 40, 50].map((mpg) => ({ mpg, perMile: us / mpg, per1000: (1000 / mpg) * us }))

  const faqs = [
    { q: 'How do I calculate miles per gallon?', a: `Divide the miles you drove by the gallons it took to refill the tank. For example, ${example.miles} miles on ${example.gallons} gallons is ${example.miles} ÷ ${example.gallons} = ${exMpg.toFixed(1)} MPG. Fill the tank completely both times so the gallons match the miles.` },
    { q: 'How do I work out the gas cost of a trip?', a: `Divide the trip distance by your car's MPG to get gallons, then multiply by the price per gallon. A 300-mile drive in a 30 MPG car uses 10 gallons, about $${(10 * us).toFixed(2)} at this week's U.S. average of $${us.toFixed(2)}. Our Road Trip Cost Calculator does this for any route, using gas prices for each state you drive through.` },
    { q: 'What is good gas mileage?', a: `It depends on the type of vehicle. In our EPA data for 2024 and 2025 models, the average is about ${VEHICLE_TYPES.find((v) => v.key === 'midsize')!.mpg} MPG for a midsize sedan, ${VEHICLE_TYPES.find((v) => v.key === 'smallsuv')!.mpg} MPG for a small SUV, ${VEHICLE_TYPES.find((v) => v.key === 'pickup')!.mpg} MPG for a full-size pickup and ${VEHICLE_TYPES.find((v) => v.key === 'hybrid')!.mpg} MPG for a hybrid car. Beating the average for your class is good.` },
    { q: 'How do I convert MPG to liters per 100 km?', a: 'Divide 235.21 by your MPG. For example, 30 MPG is 235.21 ÷ 30 = 7.8 L/100km. To go the other way, divide 235.21 by the L/100km figure.' },
    { q: 'What does MPG mean for an electric car?', a: 'Electric cars are rated in MPGe, miles per gallon equivalent, where 33.7 kWh of electricity counts as one gallon of gas. What you actually pay depends on your electricity price, which you can check in our EV charging cost calculator.' },
  ]

  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'HowTo',
      name: 'How to calculate miles per gallon (MPG)',
      description: 'Work out your car’s real gas mileage from two fill-ups.',
      totalTime: 'PT5M',
      step: [
        { '@type': 'HowToStep', name: 'Fill the tank', text: 'Fill your tank completely and note the odometer reading, or reset your trip meter to zero.' },
        { '@type': 'HowToStep', name: 'Drive normally', text: 'Drive as you usually do until you need gas again. A full tank gives the most accurate result.' },
        { '@type': 'HowToStep', name: 'Fill up again', text: 'Fill the tank completely again and note how many gallons it took from the pump or receipt.' },
        { '@type': 'HowToStep', name: 'Divide miles by gallons', text: 'Subtract the first odometer reading from the second (or read the trip meter) and divide those miles by the gallons. The result is your MPG.' },
      ],
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ]

  const h2 = 'text-2xl md:text-3xl font-bold font-heading text-blue-900 mt-12 mb-4'
  return (
    <div className="mt-12 text-gray-900 space-y-4 font-sans leading-relaxed">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <h2 className={h2.replace('mt-12', 'mt-0')}>How to calculate miles per gallon</h2>
      <p>
        The formula is simple: <strong>MPG = miles driven ÷ gallons used</strong>. The trick is measuring the gallons honestly, which is why
        the best way to check your real gas mileage is the full-tank method.
      </p>
      <ol className="list-decimal pl-6 space-y-2">
        <li><strong>Fill the tank all the way</strong> and reset your trip meter (or write down the odometer reading).</li>
        <li><strong>Drive normally</strong> until you need gas again. The more miles, the more accurate the result.</li>
        <li><strong>Fill up again</strong> and note how many gallons it took. It&apos;s on the pump display and your receipt.</li>
        <li><strong>Divide the miles by the gallons.</strong> That&apos;s your MPG.</li>
      </ol>
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <div className="font-semibold text-blue-900 mb-1">Worked example</div>
        You drove <strong>{example.miles} miles</strong> and the second fill-up took <strong>{example.gallons} gallons</strong>:{' '}
        {example.miles} ÷ {example.gallons} = <strong>{exMpg.toFixed(1)} MPG</strong>. At this week&apos;s U.S. average of ${us.toFixed(2)} a gallon,
        that tank cost about ${(example.gallons * us).toFixed(2)}, or {((us / exMpg) * 100).toFixed(1)}¢ a mile.
      </div>
      <p>
        Track a few tanks with the calculator above (Advanced mode adds several trips and your fuel cost) and you&apos;ll see your true average,
        which is usually more useful than any single tank.
      </p>

      <h3 className="text-xl font-semibold font-heading mt-6">Kilometers and liters</h3>
      <p>
        Outside the U.S., fuel economy is usually given in liters per 100 km. To convert, divide <strong>235.21 by your MPG</strong> (30 MPG is 7.8 L/100km).
        For kilometers per liter, multiply MPG by 0.425. The calculator above switches units for you.
      </p>

      <h2 className={h2}>What is good gas mileage?</h2>
      <p>Good depends on what you drive. These are the EPA combined averages for 2024 and 2025 models in our vehicle database:</p>
      <div className="overflow-x-auto bg-white rounded-xl border border-blue-100 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-blue-50 text-gray-700"><tr><th className="text-left p-3">Vehicle type</th><th className="text-right p-3">Average MPG</th><th className="text-left p-3 hidden sm:table-cell">Examples</th></tr></thead>
          <tbody>
            {VEHICLE_TYPES.map((v) => (
              <tr key={v.key} className="border-t border-blue-50"><td className="p-3 font-medium">{v.label}</td><td className="p-3 text-right">{v.mpg}</td><td className="p-3 text-gray-600 hidden sm:table-cell">{v.example.replace(/^e\.g\. /, '')}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Want the official rating for your exact car? Look it up in the <Link href="/vehicles" className="text-blue-700 underline">vehicle MPG checker</Link> or
        compare up to three cars with the <Link href="/fuel-economy-compare" className="text-blue-700 underline">fuel economy comparison tool</Link>.
      </p>

      <h2 className={h2}>What your gas mileage costs you this week</h2>
      <p>At the U.S. average of <strong>${us.toFixed(2)} a gallon</strong> for regular gas (EIA, week of {week}):</p>
      <div className="overflow-x-auto bg-white rounded-xl border border-blue-100 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-blue-50 text-gray-700"><tr><th className="text-left p-3">Your MPG</th><th className="text-right p-3">Cost per mile</th><th className="text-right p-3">Cost per 1,000 miles</th></tr></thead>
          <tbody>
            {costRows.map((r) => (
              <tr key={r.mpg} className="border-t border-blue-50"><td className="p-3 font-medium">{r.mpg} MPG</td><td className="p-3 text-right">{(r.perMile * 100).toFixed(1)}¢</td><td className="p-3 text-right">${Math.round(r.per1000)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Prices vary a lot by state. See <Link href="/gas-prices" className="text-blue-700 underline">gas prices by state this week</Link>, or get your own
        weekly cost by email with our <Link href="/gas-price-alerts" className="text-blue-700 underline">gas price alerts</Link>.
      </p>

      <h2 className={h2}>Why your MPG is lower than the sticker</h2>
      <p>The EPA rating is measured in a lab under set conditions, so real-world mileage often comes in lower. The usual reasons:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Highway speed.</strong> Most cars use noticeably more fuel above about 50 to 60 mph.</li>
        <li><strong>Hard acceleration and braking.</strong> Smooth driving saves the most fuel of anything you can control.</li>
        <li><strong>Cold weather and short trips.</strong> A cold engine and a cabin heater both burn extra fuel.</li>
        <li><strong>Extra weight and drag.</strong> Roof racks, cargo boxes and a full trunk cost mileage, especially at speed.</li>
        <li><strong>Low tire pressure.</strong> Check it monthly against the label inside the driver&apos;s door.</li>
      </ul>

      <h2 className={h2}>Planning a drive?</h2>
      <p>
        The <Link href="/road-trip-cost-calculator" className="text-blue-700 underline">Road Trip Cost Calculator</Link> works out the gas cost of any route
        with each state&apos;s gas price, plus stops and hotels. Or browse <Link href="/road-trip-cost" className="text-blue-700 underline">gas costs for 159 popular road trips</Link>.
        Thinking about a more efficient car? The <Link href="/fuel-savings-calculator" className="text-blue-700 underline">Fuel Savings Calculator</Link> shows
        what a hybrid or EV would save you.
      </p>

      <h2 className={h2}>MPG calculator questions</h2>
      <div className="space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm" open>
            <summary className="font-semibold cursor-pointer">{f.q}</summary>
            <p className="text-gray-700 mt-2">
              {f.a}{' '}
              {f.q.startsWith('What does MPG mean') && <Link href="/ev-charging-cost-calculator" className="text-blue-700 underline">Open the EV charging cost calculator →</Link>}
            </p>
          </details>
        ))}
      </div>
      <p className="text-xs text-gray-500">Gas price: U.S. Energy Information Administration. Vehicle averages: EPA fuel economy data.</p>
    </div>
  )
}
