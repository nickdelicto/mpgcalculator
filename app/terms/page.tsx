import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use | MPGCalculator.net',
  description: 'Terms of Use for MPGCalculator.net - Please read before using our services.',
}

export default function TermsOfUse() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Use</h1>
      <p className="text-sm text-gray-600 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. INTRODUCTION AND ACCEPTANCE</h2>
        <p className="mb-4">
          Welcome to MPGCalculator.net. These Terms of Use constitute a legally binding agreement made between you, 
          whether personally or on behalf of an entity ("you") and MPGCalculator.net ("we," "us," or "our"), 
          concerning your access to and use of the MPGCalculator.net website as well as any other media form, 
          media channel, mobile website, or mobile application related, linked, or otherwise connected thereto 
          (collectively, the "Site").
        </p>
        <p className="mb-4">
          You agree that by accessing the Site, you have read, understood, and agree to be bound by all of these 
          Terms of Use. If you do not agree with all of these Terms of Use, then you are expressly prohibited from 
          using the Site and you must discontinue use immediately.
        </p>
        <p className="mb-4">
          We reserve the right to make changes or modifications to these Terms of Use at any time and for any reason. 
          We will alert you about any changes by updating the "Last Updated" date of these Terms of Use, and you waive 
          any right to receive specific notice of each such change.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. SERVICE DESCRIPTION AND LIMITATIONS</h2>
        <p className="mb-4">
          MPGCalculator.net provides tools for calculating and comparing the fuel economy of vehicles, estimating 
          fuel costs, and comparing the efficiency of different vehicles. Our calculator tools use data from the 
          U.S. Environmental Protection Agency (EPA) and other publicly available datasets.
        </p>
        <p className="mb-4">
          <strong>Accuracy of Information:</strong> While we strive to provide accurate information, all calculations, 
          estimations, and data provided through our Service are for informational purposes only. Actual fuel economy 
          and costs may vary based on driving conditions, maintenance, fuel prices, and other factors beyond our control.
        </p>
        <p className="mb-4">
          <strong>No Guarantee:</strong> We do not guarantee the accuracy, completeness, or usefulness of any information 
          on the Site or the results of any calculations. Any reliance you place on such information is strictly at your own risk.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. INTELLECTUAL PROPERTY RIGHTS</h2>
        <p className="mb-4">
          Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, 
          software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") 
          and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or 
          licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights.
        </p>
        <p className="mb-4">
          The Content and Marks are provided on the Site "AS IS" for your information and personal use only. Except as 
          expressly provided in these Terms of Use, no part of the Site and no Content or Marks may be copied, reproduced, 
          aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, 
          licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
        </p>
        <h3 className="text-xl font-semibold mb-2">3.1 Embedding</h3>
        <p className="mb-4">
          We may provide specific tools to allow you to embed our calculator on your website. If such functionality is 
          available, you may only use the embedding functionality we provide and must not modify or attempt to extract 
          the underlying code. All embedded calculators must clearly display attribution to MPGCalculator.net.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. USER REPRESENTATIONS</h2>
        <p className="mb-4">
          By using the Site, you represent and warrant that:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>All information you provide to us is true, accurate, current, and complete</li>
          <li>You have the legal capacity to understand and agree to these Terms of Use</li>
          <li>You will not access the Site through automated or non-human means</li>
          <li>You will not use the Site for any illegal or unauthorized purpose</li>
          <li>Your use of the Site will not violate any applicable law or regulation</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. PROHIBITED ACTIVITIES</h2>
        <p className="mb-4">
          You may not access or use the Site for any purpose other than that for which we make the Site available. 
          The Site may not be used in connection with any commercial endeavors except those that are specifically 
          endorsed or approved by us.
        </p>
        <p className="mb-4">
          As a user of the Site, you agree not to:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>Systematically retrieve data or other content from the Site to create or compile, directly or indirectly, a collection, compilation, database, or directory</li>
          <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive information</li>
          <li>Circumvent, disable, or otherwise interfere with security-related features of the Site</li>
          <li>Use any information obtained from the Site to harass, abuse, or harm another person</li>
          <li>Make improper use of our support services or submit false reports of abuse or misconduct</li>
          <li>Use the Site in a manner inconsistent with any applicable laws or regulations</li>
          <li>Upload or transmit viruses, Trojan horses, or other material that interferes with any party's use of the Site</li>
          <li>Attempt to bypass any measures of the Site designed to prevent or restrict access</li>
          <li>Copy or adapt the Site's software, including but not limited to HTML, JavaScript, or other code</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. THIRD-PARTY LINKS AND SERVICES</h2>
        <p className="mb-4">
          The Site may contain links to third-party websites and services, including but not limited to Amazon affiliate links, 
          vehicle manufacturer websites, or other information sources. These links are provided for your convenience only.
        </p>
        <p className="mb-4">
          We have no control over the contents of those sites or resources, and accept no responsibility for them or for any 
          loss or damage that may arise from your use of them. If you decide to access any of the third-party websites linked 
          to the Site, you do so entirely at your own risk and subject to the terms and conditions of use for such websites.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. DISCLAIMER OF WARRANTIES</h2>
        <p className="mb-4">
          THE SITE IS PROVIDED ON AN "AS-IS" AND "AS AVAILABLE" BASIS. YOU AGREE THAT YOUR USE OF THE SITE AND OUR SERVICES 
          WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, 
          IN CONNECTION WITH THE SITE AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF 
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p className="mb-4">
          WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SITE'S CONTENT OR THE CONTENT 
          OF ANY WEBSITES LINKED TO THE SITE AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS</li>
          <li>PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SITE</li>
          <li>ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN</li>
          <li>ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SITE</li>
          <li>ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THE SITE</li>
          <li>ANY ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SITE</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. LIMITATION OF LIABILITY</h2>
        <p className="mb-4">
          IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, 
          INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, 
          LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SITE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY 
          OF SUCH DAMAGES.
        </p>
        <p className="mb-4">
          NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND 
          REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO THE LESSER OF THE AMOUNT PAID, IF ANY, 
          BY YOU TO US OR $100.00 USD.
        </p>
        <p className="mb-4">
          CERTAIN STATE LAWS DO NOT ALLOW LIMITATIONS ON IMPLIED WARRANTIES OR THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. 
          IF THESE LAWS APPLY TO YOU, SOME OR ALL OF THE ABOVE DISCLAIMERS OR LIMITATIONS MAY NOT APPLY TO YOU, AND YOU MAY 
          HAVE ADDITIONAL RIGHTS.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. INDEMNIFICATION</h2>
        <p className="mb-4">
          You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our 
          respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or 
          demand, including reasonable attorneys' fees and expenses, made by any third party due to or arising out of:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>Your use of the Site</li>
          <li>Your breach of these Terms of Use</li>
          <li>Any breach of your representations and warranties set forth in these Terms of Use</li>
          <li>Your violation of the rights of a third party, including but not limited to intellectual property rights</li>
          <li>Any overt harmful act toward any other user of the Site</li>
        </ul>
        <p className="mb-4">
          Notwithstanding the foregoing, we reserve the right, at your expense, to assume the exclusive defense and control 
          of any matter for which you are required to indemnify us, and you agree to cooperate, at your expense, with our 
          defense of such claims. We will use reasonable efforts to notify you of any such claim, action, or proceeding 
          which is subject to this indemnification upon becoming aware of it.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. GOVERNING LAW AND DISPUTE RESOLUTION</h2>
        <p className="mb-4">
          These Terms of Use and your use of the Site are governed by and construed in accordance with the laws of the 
          State of New York applicable to agreements made and to be entirely performed within the State of New York, 
          without regard to its conflict of law principles.
        </p>
        <p className="mb-4">
          Any legal action of whatever nature brought by either you or us shall be commenced or prosecuted in the state 
          and federal courts located in New York, and you hereby consent to, and waive all defenses of lack of personal 
          jurisdiction and forum non conveniens with respect to venue and jurisdiction in such state and federal courts.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">11. CHANGES TO TERMS</h2>
        <p className="mb-4">
          We reserve the right, in our sole discretion, to make changes or modifications to these Terms of Use at any time 
          and for any reason. We will alert you about any changes by updating the "Last Updated" date of these Terms of Use, 
          and you waive any right to receive specific notice of each such change.
        </p>
        <p className="mb-4">
          It is your responsibility to periodically review these Terms of Use to stay informed of updates. You will be 
          subject to, and will be deemed to have been made aware of and to have accepted, the changes in any revised 
          Terms of Use by your continued use of the Site after the date such revised Terms of Use are posted.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">12. TERMINATION</h2>
        <p className="mb-4">
          We reserve the right to terminate or suspend your access to all or part of the Site, without notice, for any or 
          no reason, including without limitation, any violation of these Terms of Use.
        </p>
        <p className="mb-4">
          Upon termination, your right to use the Site will immediately cease. If you wish to terminate your account or 
          your relationship with us, you may simply discontinue using the Site. All provisions of these Terms of Use which 
          by their nature should survive termination shall survive termination, including, without limitation, ownership 
          provisions, warranty disclaimers, indemnity, and limitations of liability.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">13. MPG CALCULATOR SPECIFIC TERMS</h2>
        <p className="mb-4">
          <strong>Fuel Economy Calculations:</strong> Our calculators use EPA data and other publicly available data sources 
          to estimate fuel efficiency. Actual fuel consumption may vary significantly based on driving habits, road conditions, 
          vehicle maintenance, and other factors.
        </p>
        <p className="mb-4">
          <strong>Fuel Savings Estimates:</strong> Any projected savings are estimates only and should not be relied upon 
          for financial planning purposes. Future fuel prices are unpredictable, and actual savings may vary significantly 
          from our calculations.
        </p>
        <p className="mb-4">
          <strong>Email Reports:</strong> When using our email report feature, you agree that we may send you an 
          email with your requested information. We store your email address only for the purpose of sending this report 
          and for occasional marketing communications in accordance with our Privacy Policy.
        </p>
        <p className="mb-4">
          <strong>Vehicle Data:</strong> The vehicle data we provide comes from EPA ratings and other publicly available 
          datasets. While we strive for accuracy, we cannot guarantee that all data is current or error-free.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">14. SEVERABILITY AND ENTIRE AGREEMENT</h2>
        <p className="mb-4">
          If any provision of these Terms of Use is determined to be unlawful, void, or unenforceable, such provision shall 
          nonetheless be enforceable to the fullest extent permitted by applicable law, and the unenforceable portion shall 
          be deemed to be severed from these Terms of Use. Such determination shall not affect the validity and enforceability 
          of any other remaining provisions.
        </p>
        <p className="mb-4">
          These Terms of Use constitute the entire agreement between you and MPGCalculator.net regarding your use of the Site, 
          and supersede all prior or contemporaneous communications and proposals, whether electronic, oral, or written, 
          between you and MPGCalculator.net regarding your use of the Site.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">15. CONTACT US</h2>
        <p className="mb-4">
          If you have any questions about these Terms of Use, please contact us by visiting our 
          <a href="/feedback" className="text-blue-600 hover:underline"> feedback page</a>.
        </p>
      </section>
    </div>
  )
} 