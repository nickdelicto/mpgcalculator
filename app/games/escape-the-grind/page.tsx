import { Metadata } from 'next'
import Script from 'next/script'

// SetForMoney Logo SVG Component
const SetForMoneyLogo = ({ size = 32 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={size} height={size}>
    <defs>
      <linearGradient id="sfm-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fbbf24"/>
        <stop offset="100%" stopColor="#d97706"/>
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#sfm-gradient)"/>
    <path d="M16 6v2m0 16v2m-3-4.82l.88.66c1.17.88 3.07.88 4.24 0 1.17-.88 1.17-2.3 0-3.18C17.54 18.22 16.77 18 16 18c-.73 0-1.45-.22-2-.66-1.11-.88-1.11-2.3 0-3.18s2.9-.88 4 0l.42.33" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const StructuredData = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": "Escape the Grind - Financial Independence Simulator",
    "description": "A turn-based financial simulator where you start with a salary and try to build enough passive income to never need a paycheck again. Features daily challenges, leaderboards, 40+ assets to invest in, stress mechanics, and life events.",
    "genre": "Simulation",
    "playMode": "SinglePlayer",
    "applicationCategory": "Game",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "provider": {
      "@type": "Organization",
      "name": "SetForMoney",
      "url": "https://setformoney.com"
    }
  }

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Escape the Grind?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Escape the Grind is a free turn-based financial independence simulator. You start with a salary and must strategically invest in over 40 different assets—stocks, real estate, bonds, side hustles, and more—while managing stress, navigating life events, and building enough passive income to never need a paycheck again."
        }
      },
      {
        "@type": "Question",
        "name": "Is Escape the Grind free to play?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Escape the Grind is completely free to play. You can access Free Play mode anytime, and there's also a Daily Challenge mode where all players face the same market conditions and compete on a global leaderboard."
        }
      },
      {
        "@type": "Question",
        "name": "How do daily challenges work in Escape the Grind?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Every day, a new challenge is generated with the same starting conditions, market events, and life events for all players. You choose Easy, Medium, or Hard difficulty and try to reach financial independence as efficiently as possible. Your score is ranked on a global leaderboard against other players who played the same challenge."
        }
      },
      {
        "@type": "Question",
        "name": "Does Escape the Grind teach real financial concepts?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. The game models real-world financial concepts including compound interest, diversification, asset allocation, passive income streams, market volatility, inflation, and the impact of lifestyle inflation on your path to financial independence. It's an engaging way to learn about personal finance without risking real money."
        }
      },
      {
        "@type": "Question",
        "name": "Can I play Escape the Grind on my phone?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Escape the Grind works on all devices including phones, tablets, and desktop computers. The game is fully responsive and adapts to any screen size."
        }
      }
    ]
  }

  return (
    <>
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      <Script id="faq-structured-data" type="application/ld+json">
        {JSON.stringify(faqStructuredData)}
      </Script>
    </>
  )
}

export const metadata: Metadata = {
  title: 'Escape the Grind - Free Financial Independence Simulator | MPG Calculator',
  description: 'Play Escape the Grind, a free turn-based financial simulator. Start with a salary, invest in 40+ assets, manage stress, and build enough passive income to never need a paycheck again. Daily challenges and leaderboards.',
  keywords: 'escape the grind, financial independence simulator, money game, investing game, passive income game, financial freedom game, budget simulator, financial literacy game, FIRE simulator, retire early game',
  openGraph: {
    title: 'Escape the Grind - Free Financial Independence Simulator',
    description: 'A turn-based financial simulator. Start with a salary, invest in 40+ assets, and build enough passive income to escape the rat race. Daily challenges and global leaderboards.',
    url: 'https://mpgcalculator.net/games/escape-the-grind',
    siteName: 'MPGCalculator.net',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://mpgcalculator.net/games/escape-the-grind',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function EscapeTheGrindPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <StructuredData />

      <div className="flex flex-col">
        <main className="w-full">
          {/* Hero Section */}
          <div className="relative mb-12 bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading">
                Escape the Grind
              </h1>
              <p className="text-blue-100 text-lg md:text-xl font-heading max-w-2xl">
                A <span className="font-bold underline decoration-2 decoration-blue-400">free</span> turn-based financial independence simulator. Start with a salary, invest in 40+ assets,
                navigate life events, and build enough passive income to never need a paycheck again.
              </p>
            </div>
            {/* Decorative dollar sign icon */}
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4">
              <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>

          {/* Game Embed */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-4">
            <div className="w-full" style={{ minHeight: '600px' }}>
              <iframe
                src="https://setformoney.com/embed/escape-the-grind?ref=mpgcalculator"
                width="100%"
                height="800"
                frameBorder="0"
                allowFullScreen
                style={{ border: 'none' }}
                title="Escape the Grind - Financial Independence Simulator"
              />
            </div>
          </div>

          {/* Powered by SetForMoney branding */}
          <div className="flex items-center justify-center mb-12 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <SetForMoneyLogo size={28} />
            <p className="ml-3 text-gray-600 text-sm">
              <span className="font-semibold text-gray-800">Powered by</span>{' '}
              <a href="https://setformoney.com" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 font-semibold underline decoration-1 underline-offset-2">
                SetForMoney.com
              </a>
              {' '}&mdash; Budget by chatting. No spreadsheets.
            </p>
          </div>

          {/* How to Play Section */}
          <div className="text-gray-900 space-y-8 font-heading">
            <h2 className="text-3xl font-bold font-heading bg-gradient-to-r from-blue-700 to-blue-900 text-transparent bg-clip-text">How to Play Escape the Grind</h2>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                Escape the Grind is a strategic financial simulator that puts you in control of your financial destiny. Each turn represents a period in your working life where you must decide how to allocate your income. The goal is simple but challenging: build enough passive income from your investments to cover all your living expenses, so you never need to rely on a paycheck again.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="bg-emerald-100 p-3 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Start Your Journey</h3>
                    <p className="text-gray-600">
                      Begin with a salary and make strategic decisions about how to allocate your income across 40+ different investment assets including stocks, real estate, bonds, and side hustles.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="bg-red-100 p-3 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Manage Risks</h3>
                    <p className="text-gray-600">
                      Navigate unexpected life events, manage your stress meter, resist lifestyle inflation, and balance short-term needs against your long-term financial independence goals.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="bg-amber-100 p-3 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Achieve Freedom</h3>
                    <p className="text-gray-600">
                      Build enough passive income to cover your expenses and escape the grind forever. Compete on daily leaderboards to prove you have the best strategy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Game Features Section */}
          <div className="mt-12 text-gray-900 space-y-8 font-heading">
            <h2 className="text-3xl font-bold font-heading bg-gradient-to-r from-blue-700 to-blue-900 text-transparent bg-clip-text">Game Features</h2>

            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Daily Challenges</h3>
                    <p className="text-gray-600">
                      Every day brings a new challenge with the same starting conditions for all players. Same markets, same events — pick your difficulty (Easy, Medium, or Hard) and compete for the top spot on the global leaderboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="bg-purple-100 p-3 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">40+ Investment Assets</h3>
                    <p className="text-gray-600">
                      Diversify your portfolio across stocks, index funds, real estate, bonds, crypto, side hustles, and more. Each asset class behaves differently based on market conditions, teaching you real diversification strategies.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="bg-rose-100 p-3 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Stress &amp; Life Events</h3>
                    <p className="text-gray-600">
                      Just like real life, unexpected events can derail your plans. Medical emergencies, market crashes, job changes, and lifestyle temptations all affect your stress level and financial trajectory.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="bg-teal-100 p-3 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Learn Real Finance</h3>
                    <p className="text-gray-600">
                      The game models real-world financial concepts: compound interest, diversification, asset allocation, market volatility, inflation, and the FIRE (Financial Independence, Retire Early) movement — all without risking real money.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What is Financial Independence Section */}
          <div className="mt-12 text-gray-900 space-y-6 font-heading">
            <h2 className="text-3xl font-bold font-heading bg-gradient-to-r from-blue-700 to-blue-900 text-transparent bg-clip-text">What Is Financial Independence?</h2>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                Financial independence (FI) means having enough passive income from investments, rental properties, or other sources to cover all your living expenses without needing to work for a paycheck. It's the core concept behind the FIRE movement (Financial Independence, Retire Early) that has gained massive popularity in recent years.
              </p>

              <p className="text-lg leading-relaxed">
                The path to financial independence typically involves three key principles: earning more, spending less, and investing the difference wisely. Escape the Grind lets you practice all three in a risk-free environment where you can experiment with different strategies and see their long-term results in minutes rather than decades.
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-5 my-6 rounded-r-lg">
              <p className="italic text-blue-800">
                The average person needs roughly 25 times their annual expenses invested to achieve financial independence (the &ldquo;4% rule&rdquo;). In Escape the Grind, you'll discover firsthand why some strategies reach this goal faster than others — and how quickly lifestyle inflation can derail even the best plans.
              </p>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-12 text-gray-900 space-y-6 font-heading">
            <h2 className="text-3xl font-bold font-heading bg-gradient-to-r from-blue-700 to-blue-900 text-transparent bg-clip-text">Tips for Winning Escape the Grind</h2>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                Whether you're a first-time player or trying to climb the daily leaderboard, these strategies will help you on your path to financial freedom:
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                  Diversify Early
                </h3>
                <p className="text-gray-600 ml-11">
                  Don't put all your money into one asset class. Spread your investments across multiple categories to protect against market downturns and maximize your passive income streams.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                  Resist Lifestyle Inflation
                </h3>
                <p className="text-gray-600 ml-11">
                  As your income grows, it's tempting to upgrade your lifestyle. But every dollar spent on luxuries is a dollar not working toward your financial independence. Keep expenses low, especially in the early turns.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                  Watch Your Stress
                </h3>
                <p className="text-gray-600 ml-11">
                  High stress leads to poor decisions and can force you to liquidate assets at bad times. Balance aggressive investing with activities that keep your stress manageable.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
                  Focus on Passive Income
                </h3>
                <p className="text-gray-600 ml-11">
                  The goal isn't just to grow your net worth — it's to build reliable passive income. Prioritize assets that generate recurring cash flow over those that only appreciate in value.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12 text-gray-900 space-y-6 font-heading">
            <h2 className="text-3xl font-bold font-heading bg-gradient-to-r from-blue-700 to-blue-900 text-transparent bg-clip-text">Frequently Asked Questions</h2>

            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">What is Escape the Grind?</h3>
                <p className="text-gray-600">
                  Escape the Grind is a free turn-based financial independence simulator. You start with a salary and must strategically invest in over 40 different assets — stocks, real estate, bonds, side hustles, and more — while managing stress, navigating life events, and building enough passive income to never need a paycheck again.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Is Escape the Grind free to play?</h3>
                <p className="text-gray-600">
                  Yes, Escape the Grind is completely free to play. You can access Free Play mode anytime, and there's also a Daily Challenge mode where all players face the same market conditions and compete on a global leaderboard.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">How do daily challenges work?</h3>
                <p className="text-gray-600">
                  Every day, a new challenge is generated with the same starting conditions, market events, and life events for all players. You choose Easy, Medium, or Hard difficulty and try to reach financial independence as efficiently as possible. Your score is ranked on a global leaderboard against other players who played the same challenge.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Does this game teach real financial concepts?</h3>
                <p className="text-gray-600">
                  Yes. The game models real-world financial concepts including compound interest, diversification, asset allocation, passive income streams, market volatility, inflation, and the impact of lifestyle inflation on your path to financial independence. It's an engaging way to learn about personal finance without risking real money.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Can I play on my phone?</h3>
                <p className="text-gray-600">
                  Yes, Escape the Grind works on all devices including phones, tablets, and desktop computers. The game is fully responsive and adapts to any screen size.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Who made Escape the Grind?</h3>
                <p className="text-gray-600">
                  Escape the Grind is built by{' '}
                  <a href="https://setformoney.com" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 font-semibold underline decoration-1 underline-offset-2">
                    SetForMoney.com
                  </a>
                  , a personal finance platform. The game has been played by thousands of players and has received over 105,000 views on Reddit, with an active community at r/EscapeTheGrindGame.
                </p>
              </div>
            </div>
          </div>

          {/* Community callout */}
          <div className="mt-12 mb-8 bg-gradient-to-r from-rose-200 to-teal-200 rounded-2xl p-4 sm:p-8 border border-rose-300 shadow-lg">
            <div className="text-center space-y-4">
              <h3 className="text-xl sm:text-2xl font-heading font-semibold bg-gradient-to-r from-rose-700 to-teal-700 inline-block text-transparent bg-clip-text">
                Join 105K+ Players
              </h3>
              <p className="text-gray-700 max-w-lg mx-auto text-sm sm:text-base">
                Escape the Grind has a growing community of players sharing strategies, competing on daily leaderboards, and discussing their path to financial independence. Can you escape the rat race before going broke?
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
