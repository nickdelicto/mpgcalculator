import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | MPGCalculator.net',
  description: 'Privacy Policy for MPGCalculator.net - Learn how we collect, use, and protect your information.',
}

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-600 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. INTRODUCTION</h2>
        
        <h3 className="text-xl font-semibold mb-2">1.1 About Us</h3>
        <p className="mb-4">
          MPGCalculator.net ("we," "our," or "us") operates the website mpgcalculator.net (the "Service"). 
          This page informs you of our policies regarding the collection, use, and disclosure of personal 
          information when you use our Service.
        </p>
        
        <h3 className="text-xl font-semibold mb-2">1.2 Acceptance of Terms</h3>
        <p className="mb-4">
          By accessing or using the Service, you agree to the collection and use of information in accordance 
          with this policy. If you do not agree with any part of this policy, please do not use our Service.
        </p>
        
        <h3 className="text-xl font-semibold mb-2">1.3 Changes to This Privacy Policy</h3>
        <p className="mb-4">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
          the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically 
          for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. INFORMATION COLLECTION</h2>
        
        <h3 className="text-xl font-semibold mb-2">2.1 Personal Information</h3>
        <p className="mb-4">
          While using our Service, we may ask you to provide us with certain personally identifiable 
          information that can be used to contact or identify you. Personally identifiable information 
          may include, but is not limited to:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>Email address (when you request to receive a report)</li>
        </ul>
        
        <h3 className="text-xl font-semibold mb-2">2.2 Usage Data</h3>
        <p className="mb-4">
          We may also collect information on how the Service is accessed and used ("Usage Data"). 
          This Usage Data may include:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>Your computer's Internet Protocol address (IP address)</li>
          <li>Browser type and version</li>
          <li>The pages of our Service that you visit</li>
          <li>The time and date of your visit</li>
          <li>Referrer information (the website you visited before coming to our site)</li>
          <li>Time spent on those pages</li>
          <li>Other diagnostic data</li>
        </ul>
        
        <h3 className="text-xl font-semibold mb-2">2.3 Tracking & Cookies Data</h3>
        <p className="mb-4">
          We use cookies and similar tracking technologies to track activity on our Service and hold 
          certain information. Cookies are files with a small amount of data that may include an 
          anonymous unique identifier.
        </p>
        <p className="mb-4">
          We use the following types of cookies:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li><strong>Essential Cookies</strong>: Required for the operation of our Service, such as authentication cookies.</li>
          <li><strong>Analytics Cookies</strong>: Help us understand how you interact with our Service, helping us improve our offerings.</li>
        </ul>
        <p className="mb-4">
          You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
          However, if you do not accept cookies, you may not be able to use some portions of our Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. USE OF DATA</h2>
        <p className="mb-4">
          We use the collected data for various purposes:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>To provide and maintain our Service</li>
          <li>To notify you about changes to our Service</li>
          <li>To provide customer support</li>
          <li>To provide the specific services you request, such as generating fuel economy comparisons and reports</li>
          <li>To send you requested reports via email</li>
          <li>To gather analysis or valuable information so that we can improve our Service</li>
          <li>To monitor the usage of our Service</li>
          <li>To detect, prevent and address technical issues</li>
          <li>To track referrals and understand where our users come from</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. DATA SHARING AND DISCLOSURE</h2>
        
        <h3 className="text-xl font-semibold mb-2">4.1 Service Providers</h3>
        <p className="mb-4">
          We may employ third-party companies and individuals to facilitate our Service ("Service Providers"), 
          to provide the Service on our behalf, to perform Service-related services, or to assist us in 
          analyzing how our Service is used. These third parties have access to your Personal Data only to 
          perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
        </p>
        <p className="mb-4">
          Our Service Providers may include:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>Email service providers (to send reports you've requested)</li>
          <li>Hosting and database providers</li>
          <li>Analytics services</li>
        </ul>
        
        <h3 className="text-xl font-semibold mb-2">4.2 Legal Requirements</h3>
        <p className="mb-4">
          We may disclose your Personal Data in the good faith belief that such action is necessary to:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>Comply with a legal obligation</li>
          <li>Protect and defend the rights or property of MPGCalculator.net</li>
          <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
          <li>Protect the personal safety of users of the Service or the public</li>
          <li>Protect against legal liability</li>
        </ul>
        
        <h3 className="text-xl font-semibold mb-2">4.3 Business Transfers</h3>
        <p className="mb-4">
          If we are involved in a merger, acquisition, or asset sale, your Personal Data may be transferred. 
          We will provide notice before your Personal Data is transferred and becomes subject to a different 
          Privacy Policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. DATA SECURITY</h2>
        <p className="mb-4">
          The security of your data is important to us, but remember that no method of transmission over 
          the Internet or method of electronic storage is 100% secure. While we strive to use commercially 
          acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
        </p>
        <p className="mb-4">
          We implement a variety of security measures to maintain the safety of your personal information 
          when you enter, submit, or access your personal information, including:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>Use of secure servers</li>
          <li>Regular database backups</li>
          <li>Limited access to personal information</li>
          <li>Encryption of sensitive data</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. DATA RETENTION</h2>
        <p className="mb-4">
          We will retain your Personal Data only for as long as is necessary for the purposes set out in 
          this Privacy Policy. We will retain and use your Personal Data to the extent necessary to comply 
          with our legal obligations, resolve disputes, and enforce our legal agreements and policies.
        </p>
        <p className="mb-4">
          We will also retain Usage Data for internal analysis purposes. Usage Data is generally retained 
          for a shorter period, except when this data is used to strengthen the security or to improve the 
          functionality of our Service, or we are legally obligated to retain this data for longer periods.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. USER RIGHTS</h2>
        
        <h3 className="text-xl font-semibold mb-2">7.1 Access, Correction, and Deletion</h3>
        <p className="mb-4">
          You have the right to:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>Access the personal information we have about you</li>
          <li>Correct inaccuracies in your personal information</li>
          <li>Request the deletion of your personal information</li>
        </ul>
        
        <h3 className="text-xl font-semibold mb-2">7.2 Opt-Out Rights</h3>
        <p className="mb-4">
          You can opt out of receiving promotional communications from us by following the unsubscribe 
          instructions included in each email or by contacting us directly.
        </p>
        
        <h3 className="text-xl font-semibold mb-2">7.3 Do Not Track</h3>
        <p className="mb-4">
          We currently do not respond to "Do Not Track" signals as there is no common industry standard 
          for this. However, we do offer you choices regarding how your data is used and collected as 
          described in this policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. CHILDREN'S PRIVACY</h2>
        <p className="mb-4">
          Our Service does not address anyone under the age of 13 ("Children"). We do not knowingly 
          collect personally identifiable information from anyone under the age of 13. If you are a 
          parent or guardian and you are aware that your Child has provided us with Personal Data, 
          please contact us. If we become aware that we have collected Personal Data from children 
          without verification of parental consent, we take steps to remove that information from our servers.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. INTERNATIONAL DATA TRANSFERS</h2>
        <p className="mb-4">
          Your information, including Personal Data, may be transferred to — and maintained on — computers 
          located outside of your state, province, country, or other governmental jurisdiction where the 
          data protection laws may differ from those of your jurisdiction.
        </p>
        <p className="mb-4">
          If you are located outside the United States and choose to provide information to us, please 
          note that we transfer the data, including Personal Data, to the United States and process it there.
        </p>
        <p className="mb-4">
          Your consent to this Privacy Policy followed by your submission of such information represents 
          your agreement to that transfer.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. CALIFORNIA PRIVACY RIGHTS (CCPA)</h2>
        <p className="mb-4">
          If you are a California resident, the California Consumer Privacy Act (CCPA) provides you with 
          specific rights regarding your personal information. This section describes your CCPA rights and 
          explains how to exercise those rights.
        </p>
        
        <h3 className="text-xl font-semibold mb-2">10.1 Access and Data Portability Rights</h3>
        <p className="mb-4">
          You have the right to request that we disclose certain information to you about our collection 
          and use of your personal information over the past 12 months.
        </p>
        
        <h3 className="text-xl font-semibold mb-2">10.2 Deletion Request Rights</h3>
        <p className="mb-4">
          You have the right to request that we delete any of your personal information that we collected 
          from you and retained, subject to certain exceptions.
        </p>
        
        <h3 className="text-xl font-semibold mb-2">10.3 Non-Discrimination</h3>
        <p className="mb-4">
          We will not discriminate against you for exercising any of your CCPA rights.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">11. GDPR COMPLIANCE (FOR EUROPEAN USERS)</h2>
        <p className="mb-4">
          If you are a resident of the European Economic Area (EEA), you have certain data protection 
          rights under the General Data Protection Regulation (GDPR).
        </p>
        <p className="mb-4">
          We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of 
          your Personal Data. The legal basis for processing your personal information is:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>Performance of a contract when we provide you with the services you request</li>
          <li>Legitimate interests in operating and improving our business</li>
          <li>Your consent, where required</li>
        </ul>
        <p className="mb-4">
          In certain circumstances, you have the following data protection rights:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>The right to access, update, or delete the information we have on you</li>
          <li>The right of rectification</li>
          <li>The right to object</li>
          <li>The right of restriction</li>
          <li>The right to data portability</li>
          <li>The right to withdraw consent</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">12. LINKS TO OTHER SITES</h2>
        <p className="mb-4">
          Our Service may contain links to other sites that are not operated by us. If you click on a 
          third-party link, you will be directed to that third party's site. We strongly advise you to 
          review the Privacy Policy of every site you visit.
        </p>
        <p className="mb-4">
          We have no control over and assume no responsibility for the content, privacy policies, or 
          practices of any third-party sites or services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">13. CONTACT US</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us by visiting our 
          <a href="/feedback" className="text-blue-600 hover:underline"> feedback page</a>.
        </p>
      </section>
    </div>
  )
} 