import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Article, getArticleBySlug, getRelatedArticles } from '../../lib/articles'

// Update Props type to match Next.js 15 requirements
type Props = {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// This function would normally fetch the article data based on the slug
async function getArticleData(slug: string): Promise<Article | null> {
  return getArticleBySlug('road-trips', slug);
}

// Generate metadata for the page dynamically based on the article
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getArticleData(resolvedParams.slug)
  
  if (!article) {
    return {
      title: 'Article Not Found | MPGCalculator.net Blog',
      description: 'The requested article could not be found.'
    }
  }

  // This would be dynamically generated based on actual article data
  return {
    title: `${article.title} | Road Trip Guides | MPGCalculator.net Blog`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: ['MPGCalculator.net'],
    },
  }
}

export default async function ArticlePage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const article = await getArticleData(resolvedParams.slug)
  
  // If article not found, show 404 page
  if (!article) {
    notFound()
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb navigation */}
      <div className="mb-4 text-sm">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800">
          Blog Home
        </Link>{' '}
        &gt;{' '}
        <Link href="/blog/road-trips" className="text-blue-600 hover:text-blue-800">
          Road Trip Guides
        </Link>{' '}
        &gt;{' '}
        <span className="text-gray-600">Article Title</span>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <main className="w-full lg:w-2/3">
          {/* Article Header */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h1 className="text-3xl font-bold mb-4 text-blue-900">
              {/* This would be the actual article title from the data */}
              Article Title
            </h1>
            
            <div className="flex items-center text-gray-600 mb-6">
              <div className="flex items-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">
                  {/* This would show the actual publication date */}
                  Published: January 1, 2023
                </span>
              </div>
              
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="text-sm">
                  {/* These would be the actual categories */}
                  Road Trips, Travel Guides
                </span>
              </div>
            </div>
            
            {/* Featured Image Placeholder */}
            <div className="bg-gray-100 h-64 rounded-lg mb-6 flex items-center justify-center">
              <span className="text-gray-400">Featured Image</span>
            </div>
            
            {/* Article Introduction */}
            <div className="prose max-w-none">
              <p>
                This is where the article introduction would appear. The actual content would be loaded dynamically based on the slug parameter.
              </p>
            </div>
          </div>
          
          {/* Main Article Content */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <div className="prose max-w-none">
              <p>
                The main article content would be rendered here. This template is set up to display any road trip article content when implemented.
              </p>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-3">Plan Your Road Trip</h2>
            <p className="text-gray-700 mb-4">
              Ready to plan your own adventure? Use our Road Trip Cost Calculator to estimate expenses for your journey.
            </p>
            <Link href="/road-trip-cost-calculator" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
              Try the Road Trip Calculator
            </Link>
          </div>
          
          {/* Related Articles */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Related Road Trip Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* These would be dynamically populated based on related articles */}
              <div className="flex items-start">
                <div className="bg-gray-100 h-16 w-16 rounded flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs text-gray-400">Image</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-base font-medium text-gray-800">Related Article Title</h3>
                  <p className="text-sm text-gray-600">Brief description of the related article</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-gray-100 h-16 w-16 rounded flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs text-gray-400">Image</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-base font-medium text-gray-800">Related Article Title</h3>
                  <p className="text-sm text-gray-600">Brief description of the related article</p>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* Sidebar */}
        <aside className="w-full lg:w-1/3 space-y-6">
          {/* Table of Contents */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Table of Contents</h3>
            <ul className="space-y-2">
              <li>
                <a href="#section1" className="text-blue-600 hover:text-blue-800">
                  Section 1
                </a>
              </li>
              <li>
                <a href="#section2" className="text-blue-600 hover:text-blue-800">
                  Section 2
                </a>
              </li>
              <li>
                <a href="#section3" className="text-blue-600 hover:text-blue-800">
                  Section 3
                </a>
              </li>
            </ul>
          </div>
          
          {/* Road Trip Planning Tools */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h3 className="text-lg font-semibold mb-4">Road Trip Planning Tools</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/road-trip-cost-calculator" className="flex items-start hover:bg-blue-100 p-2 rounded transition-colors">
                  <div className="mr-3 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium block">Road Trip Cost Calculator</span>
                    <span className="text-sm text-gray-600">Plan your journey costs</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/" className="flex items-start hover:bg-blue-100 p-2 rounded transition-colors">
                  <div className="mr-3 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium block">MPG Calculator</span>
                    <span className="text-sm text-gray-600">Calculate fuel efficiency</span>
                  </div>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Newsletter signup */}
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl border border-indigo-200">
            <h3 className="text-lg font-semibold mb-2">Travel Tips Newsletter</h3>
            <p className="text-sm text-gray-700 mb-4">Get road trip ideas, destination guides, and travel tips delivered to your inbox.</p>
            <div className="space-y-2">
              <input type="email" placeholder="Your email address" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
} 