import { Metadata } from 'next'
import Link from 'next/link'
import FuelSavingsCalculator from '../components/FuelSavingsCalculator'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Calculator, DollarSign } from 'lucide-react'
import EmbedSection from '../components/EmbedSection'
import SupportButton from '../components/SupportButton'
import ScrollToTopButton from '../components/ScrollToTopButton'
import Script from 'next/script'

// Structured Data Component
const StructuredData = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Fuel Savings Calculator",
    "applicationCategory": "CalculatorApplication",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "provider": {
      "@type": "Organization",
      "name": "MPGCalculator.net",
      "url": "https://mpgcalculator.net"
    },
    "description": "Calculate and compare fuel costs between different vehicles. See potential savings over time with our interactive fuel cost savings comparison tool.",
    "featureList": [
      "Compare fuel costs between vehicles",
      "Calculate potential savings over time",
      "Support for gas, electric, and hybrid vehicles",
      "Interactive cost comparison visualization",
      "Customizable mileage and fuel price inputs"
    ]
  }

  return (
    <Script id="structured-data" type="application/ld+json">
      {JSON.stringify(structuredData)}
    </Script>
  )
}

export const metadata: Metadata = {
  title: 'Fuel Savings Calculator | Compare Gas, Hybrid & EV Costs',
  description: 'Compare what two cars cost to fuel and see how much you\'d save switching to a hybrid or EV. Free calculator for gas, hybrid, and electric vehicles, by month and year.',
  keywords: 'fuel savings calculator, gas savings calculator, ev savings calculator, phev savings calculator, gas vs ev savings calculator, hybrid vs gas cost calculator, fuel efficiency savings, car fuel cost comparison',
}

export default function FuelSavingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <StructuredData />
      
      <div className="flex flex-col">
        <main className="w-full">
          {/* Hero Section */}
          <div className="relative mb-12 bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading">
                Fuel Savings Calculator
              </h1>
              <p className="text-blue-100 text-lg md:text-xl font-heading max-w-2xl">
                Compare fuel costs between vehicles and see your potential savings over time
              </p>
            </div>
            {/* Decorative calculator icon */}
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4">
              <Calculator size={300} />
            </div>
          </div>

          {/* Calculator Card */}
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700 mb-12">
            <CardHeader className="border-b border-gray-700">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-white flex items-center gap-2 text-2xl">
                  <DollarSign className="h-6 w-6 text-green-400" />
                  Calculate Your Fuel Savings
                </CardTitle>
                <SupportButton />
              </div>
            </CardHeader>
            <CardContent className="pt-6 font-heading">
              <FuelSavingsCalculator />
            </CardContent>
          </Card>

          {/* Embed Section */}
          <div className="mb-12">
            <EmbedSection />
          </div>

          {/* Informational content (SEO) */}
          <article className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-gray-900 font-heading mb-4">
              Will a more efficient car actually save you money?
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              A more fuel-efficient car always sounds like it'll save you money. But how much, exactly? That comes down to a few things the window sticker never tells you, like how far you actually drive, what you pay for gas or electricity, and how big the efficiency gap is between the car you have now and the one you're considering.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              This tool runs that math for you. Enter two vehicles, your current car and one you're thinking about (or any two you're weighing against each other), and it shows what each costs to fuel per month and per year, plus how much you'd save with the more efficient one. It handles gas, hybrid, and electric vehicles, so you can pit a gas car against an EV, a hybrid against a regular gas model, or compare two gas cars directly. If you don't have a car's MPG handy, you can <Link href="/vehicles" className="text-blue-700 hover:underline">look up its fuel economy</Link> first. And if you'd like to weigh two models on MPG, emissions, and specs side by side before running the costs, our <Link href="/fuel-economy-compare" className="text-blue-700 hover:underline">vehicle comparison tool</Link> does that.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              It won't tell you a more efficient car is always the right call. Sometimes the savings are big enough to tip your decision; other times they're smaller than people expect. Either way, you get a real number to work with instead of a hunch.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-gray-900 font-heading mt-10 mb-4">
              Making sense of your Fuel Savings Calculator results
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Once you've entered both vehicles, the calculator breaks the comparison down in a few ways, and each one answers a slightly different question.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              The monthly and yearly fuel cost is the headline number. It's simply what each car costs to keep moving, based on the miles you drive and the prices you pay. Seeing the two side by side is usually the moment the difference gets real, because a gap that looks tiny per gallon adds up quickly over a year of driving.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              The savings figure is the difference between them, and it's what most people came here for. It tells you how much the more efficient car actually puts back in your pocket. You'll see it by the month and by the year, so you can think about it whatever way money makes sense to you.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              It's worth remembering that fuel savings are only part of the story. If the more efficient car also costs more to buy, those monthly savings are really chipping away at that price difference. A car that saves you $80 a month but costs $4,000 more takes a little over four years to pay for itself on fuel alone. The tool gives you a clear savings number so you can run that gut-check yourself before you decide.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-gray-900 font-heading mt-10 mb-4">
              Gas vs hybrid vs EV, and when each one pays off
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The right answer depends less on the car than on how you drive. Here's how the three tend to shake out once you run real numbers.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              A hybrid is the easy middle ground for most people. You get a big jump in MPG over a regular gas car, often something like 50 against 28, without changing a thing about how you refuel. There's usually a price bump over the plain gas version, but if you drive a lot, and especially if a lot of that is city driving where hybrids do their best work, the fuel savings tend to cover that bump within a few years. For a high-mileage commuter who doesn't want to think about plugging in, a hybrid is often the sweet spot.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              An EV gives you the biggest fuel savings of the three, because electricity is usually much cheaper per mile than gas. The catch is that those savings lean heavily on two things, whether you can charge at home and what you pay per kWh. Charge overnight at home on a normal rate and the running cost can be a fraction of what gas costs. Lean on public fast chargers, which run pricier, and a good chunk of that advantage disappears. If you drive a lot, can plug in at home, and the price premium isn't wild, an EV usually pulls ahead over time.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              And sometimes sticking with gas is the sensible call. If you don't rack up many miles, your fuel bill is small to begin with, so even a much more efficient car saves you little in absolute dollars and takes a long time to justify a higher price. The calculator makes this easy to see. Drop in a gas car and an EV or hybrid, set your real annual mileage, and the yearly savings will tell you pretty quickly whether switching is worth it for someone who drives the way you do.
            </p>

            <div className="my-8 text-center">
              <ScrollToTopButton
                buttonText="Calculate your savings"
                className="inline-block bg-green-600 text-white hover:bg-green-700 font-semibold py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-gray-900 font-heading mt-10 mb-4">
              What actually moves your savings number
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you play with the inputs, you'll notice the savings figure swings a lot. Three things are doing most of that work.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              The first is how far you drive. Mileage is the multiplier on everything else, so it matters more than people expect. A small difference in efficiency barely registers if you only drive 6,000 miles a year, but the same difference can be worth real money at 20,000. It's why a thirsty truck is a bigger deal for a delivery driver than for someone who mostly works from home. If you're not sure of your number, check your odometer against last year or your last oil change and estimate from there.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              The second is the gap between the two cars, not how efficient either one is on its own. Going from 20 to 30 MPG saves you more fuel than going from 40 to 50, even though both are a 10 MPG jump, because the thirstier car was burning so much more to begin with. That surprises a lot of people, and it's worth keeping in mind when you're deciding how far to stretch for efficiency.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              The third is what you pay for fuel. Higher gas prices make an efficient car save more, which is why these comparisons look very different at $3 a gallon than at $5. For EVs, the equivalent lever is your electricity rate, and that varies a lot by where you live and when you charge. The calculator lets you set both, so plug in your real local prices instead of a national average if you want the honest answer.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-gray-900 font-heading mt-10 mb-4">
              A few examples of how this plays out
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Numbers make this easier to picture, so here are a few rough scenarios. Yours will differ, but they show how much the situation matters.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Take a commuter driving 15,000 miles a year who trades a 25 MPG gas car for a 50 MPG hybrid. At around $3.50 a gallon, the gas car burns through roughly $2,100 of fuel a year and the hybrid about half that. That's close to $1,000 saved a year, a little under $90 a month, which over the years you own the car is enough to seriously offset a hybrid's higher sticker price.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Now picture someone with a longer commute, say 18,000 miles a year, going from a gas car to an EV they charge at home. Cheap overnight electricity can cut their yearly fuel bill from well over $2,000 down to roughly a quarter of that. That's the kind of gap that makes an EV an easy financial yes. The same driver leaning on public fast charging instead would still save, just a lot less, which is exactly why home charging keeps coming up.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              And then there's the light driver. Someone covering 6,000 miles a year doesn't spend much on fuel to start with, so even a big jump in efficiency might save them only a few hundred dollars a year. For them the decision usually comes down to things other than fuel, like the price of the car, how it drives, or simply what they want. The savings are real, but they're rarely what tips the scale.
            </p>

            <div className="my-8 text-center">
              <ScrollToTopButton
                buttonText="Run your own numbers"
                className="inline-block bg-green-600 text-white hover:bg-green-700 font-semibold py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-gray-900 font-heading mt-10 mb-4">
              What this calculator leaves out
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              This tool does one job and tries to do it well, which is comparing what two vehicles cost to fuel. That keeps it simple and honest, but it does mean the fuel savings are only one line in a bigger budget. A few other costs are worth weighing before you decide.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              The biggest one is the price of the car itself. A more efficient model often costs more up front, and as we mentioned, your fuel savings are partly going toward paying that off. Maintenance is another. EVs tend to be cheaper to keep running since they have far fewer moving parts, while a hybrid sits somewhere between an EV and a regular gas car. Insurance usually climbs with a newer or pricier vehicle, so that can quietly eat into your savings too.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              EVs come with a couple of extras of their own. If you want to charge at home, factor in the cost of a charger and possibly an electrician, which is a one-time expense but a real one. On the other side, tax credits and local rebates can knock a serious amount off the purchase price, and those aren't in the fuel math either.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              None of this is a reason to ignore the fuel numbers. They're often the largest ongoing cost of owning a car and the easiest to underestimate, which is the whole point of running them. Just treat the savings figure as your starting point, then layer in these other costs to get to the real picture.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-gray-900 font-heading mt-10 mb-6">
              Frequently asked questions
            </h2>

            <h3 className="text-lg font-semibold text-gray-900 font-heading mb-2">
              Is switching to an electric car worth it just for the fuel savings?
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Sometimes, but it depends on how much you drive and whether you can charge at home. A high-mileage driver with cheap overnight electricity can save well over a thousand dollars a year. Someone who drives little or relies on public charging will save a lot less. Run your real numbers above and you'll see where you land, then weigh that against the car's price and any tax credits.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 font-heading mb-2">
              Do hybrids really save money?
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              For most people who drive a fair amount, yes. A hybrid often gets close to double the MPG of a comparable gas car, especially in city driving, and there's no charging to deal with. The savings usually need a few years to cover the higher purchase price, so the more you drive, the faster a hybrid pays for itself.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 font-heading mb-2">
              What gas price should I use?
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Use what you actually pay locally rather than a national headline number, since prices swing a lot by region and over time. It's also worth trying a slightly higher price, because efficient cars look even better when fuel gets expensive. The calculator lets you change it freely, so test a few scenarios.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 font-heading mb-2">
              How accurate are these numbers?
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              They're a solid estimate, not a guarantee. The math is straightforward, but the result is only as good as your inputs, mainly your real annual mileage and local prices. Actual MPG also varies with how and where you drive, so treat the figure as a close ballpark for comparison rather than an exact prediction.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 font-heading mb-2">
              How do you compare an electric car to a gas one when they use different fuel?
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The calculator handles the conversion for you. It works out what each vehicle costs per mile, gas in dollars per gallon and electricity in dollars per kWh, then scales both to your annual mileage so you're comparing like for like. That's how a gas car and an EV can sit side by side and still give you a fair dollar comparison.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              And if you're pricing out one specific drive rather than comparing cars to own, our <Link href="/road-trip-cost-calculator" className="text-blue-700 hover:underline">road trip cost calculator</Link> estimates fuel for a route from start to finish.
            </p>
          </article>

          {/* FAQ structured data for rich results */}
          <Script id="faq-structured-data" type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Is switching to an electric car worth it just for the fuel savings?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Sometimes, but it depends on how much you drive and whether you can charge at home. A high-mileage driver with cheap overnight electricity can save well over a thousand dollars a year. Someone who drives little or relies on public charging will save a lot less. Run your real numbers, then weigh that against the car's price and any tax credits." }
                },
                {
                  "@type": "Question",
                  "name": "Do hybrids really save money?",
                  "acceptedAnswer": { "@type": "Answer", "text": "For most people who drive a fair amount, yes. A hybrid often gets close to double the MPG of a comparable gas car, especially in city driving, and there's no charging to deal with. The savings usually need a few years to cover the higher purchase price, so the more you drive, the faster a hybrid pays for itself." }
                },
                {
                  "@type": "Question",
                  "name": "What gas price should I use in a fuel savings calculator?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Use what you actually pay locally rather than a national headline number, since prices swing a lot by region and over time. It's also worth trying a slightly higher price, because efficient cars look even better when fuel gets expensive." }
                },
                {
                  "@type": "Question",
                  "name": "How accurate are fuel savings estimates?",
                  "acceptedAnswer": { "@type": "Answer", "text": "They're a solid estimate, not a guarantee. The result is only as good as your inputs, mainly your real annual mileage and local prices. Actual MPG also varies with how and where you drive, so treat the figure as a close ballpark for comparison rather than an exact prediction." }
                },
                {
                  "@type": "Question",
                  "name": "How do you compare an electric car to a gas car when they use different fuel?",
                  "acceptedAnswer": { "@type": "Answer", "text": "The calculator works out what each vehicle costs per mile, gas in dollars per gallon and electricity in dollars per kWh, then scales both to your annual mileage so you are comparing like for like. That is how a gas car and an EV can sit side by side and still give a fair dollar comparison." }
                }
              ]
            })}
          </Script>

          {/* Calculator CTA */}
          <div className="mb-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white text-center shadow-lg">
            <h3 className="text-2xl font-bold mb-3 font-heading">Ready to see what you'd save?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Plug in two vehicles and your real mileage, and get your monthly and yearly fuel savings in seconds.
            </p>
            <ScrollToTopButton
              buttonText="Calculate My Fuel Savings"
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            />
          </div>

          {/* Escape the Grind Promo */}
          <div className="mb-12">
            <Link href="/escape-the-grind" className="block">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl shadow-lg overflow-hidden border border-amber-400 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer">
                <div className="px-6 py-5">
                  <div className="inline-block bg-amber-200 text-amber-900 font-bold text-xs px-3 py-1 rounded-full mb-3">FREE GAME</div>
                  <h3 className="text-xl font-bold text-white mb-2">Think You Can Reach Financial Independence?</h3>
                  <p className="text-amber-100 text-sm mb-3">Put your savings skills to the test in Escape the Grind — a free financial independence simulator. Invest in 40+ assets, navigate life events, and see if you can build enough passive income to never need a paycheck again.</p>
                  <span className="inline-flex items-center font-semibold text-white text-sm">
                    Play Escape the Grind →
                  </span>
                </div>
              </div>
            </Link>
          </div>

        </main>
      </div>
    </div>
  )
} 