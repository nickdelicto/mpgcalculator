import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclaimer | MPGCalculator.net',
  description: 'Legal disclaimer for MPGCalculator.net - Important information about our fuel economy calculations and estimates.',
}

export default function Disclaimer() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Disclaimer</h1>
      <p className="text-sm text-gray-600 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. INFORMATION ACCURACY</h2>
        <p className="mb-4">
          The information provided on MPGCalculator.net is for general informational and educational purposes only. 
          All fuel economy calculations, cost estimates, and comparisons are approximations based on EPA data and 
          other publicly available datasets. While we strive to keep the information up to date and correct, we make 
          no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, 
          suitability, or availability of the information, products, services, or related graphics contained on the website.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. NO FINANCIAL ADVICE</h2>
        <p className="mb-4">
          Any cost savings calculations, fuel economy comparisons, or financial projections provided by MPGCalculator.net 
          should not be construed as financial advice. The decision to purchase, lease, or sell a vehicle should not be 
          based solely on the calculations provided by this website. We strongly recommend consulting with a qualified 
          financial advisor and conducting thorough research before making any vehicle purchase decisions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. REAL-WORLD VARIATIONS</h2>
        <p className="mb-4">
          Actual fuel economy and costs will vary based on numerous factors including but not limited to: driving habits, 
          vehicle maintenance, road conditions, weather, traffic patterns, fuel prices, and vehicle modifications. The EPA 
          ratings and calculations provided are based on standardized test procedures that may not reflect real-world driving 
          conditions. Your actual mileage and fuel costs will likely differ from the estimates provided.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. EPA DATA LIMITATIONS</h2>
        <p className="mb-4">
          While MPGCalculator.net uses data from the EPA and other reliable sources, we do not claim that our database is 
          complete or comprehensive. Some vehicles, particularly older models, rare vehicles, or vehicles with aftermarket 
          modifications may have incomplete or inaccurate data. Always verify information with the vehicle manufacturer or 
          EPA directly for the most current and accurate specifications.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. THIRD-PARTY CONTENT</h2>
        <p className="mb-4">
          MPGCalculator.net may include links to third-party websites, affiliate links, or references to third-party content. 
          These links are provided for your convenience only. We have no control over, and assume no responsibility for the 
          content, privacy policies, or practices of any third-party websites or services. You acknowledge and agree that 
          MPGCalculator.net shall not be responsible or liable, directly or indirectly, for any damage or loss caused or 
          alleged to be caused by or in connection with the use of any such content, goods, or services available on or 
          through any such websites or resources.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. USE AT YOUR OWN RISK</h2>
        <p className="mb-4">
          Your use of MPGCalculator.net and reliance on any information on the site is solely at your own risk. 
          MPGCalculator.net shall not be liable for any damages, direct or indirect, arising from the use of this website 
          or reliance on its content. By using this website, you acknowledge and agree that you assume full responsibility 
          for your use of the information provided.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. CHANGES TO THIS DISCLAIMER</h2>
        <p className="mb-4">
          We reserve the right to modify this disclaimer at any time without notice. By using this website, you are agreeing 
          to be bound by the current version of this disclaimer.
        </p>
      </section>

      <p className="text-gray-700 italic">
        If you have any questions about this disclaimer, please contact us through our 
        <a href="/feedback" className="text-blue-600 hover:underline"> feedback page</a>.
      </p>
    </div>
  )
} 