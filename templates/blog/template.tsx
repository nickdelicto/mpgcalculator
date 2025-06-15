/**
 * Blog Post Template
 * 
 * This template is not part of the Next.js build process.
 * Copy this file to create new blog posts in the app/blog directory.
 * 
 * IMPORTANT: When copying this template to a new location, update the import paths below
 * to match the correct relative paths from your new file location.
 */

import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
// Update these paths when copying the template to a new location
// For example, if placing in app/blog/your-category/your-post/page.tsx:
// import '../../blog.css'
// import ExternalLink from '../../../../components/ExternalLink'
// import ShareButtons from '../../../../components/ShareButtons'
// import BlogShareManager from '../../../../components/BlogShareManager'
// import TableOfContents from '../../../../components/TableOfContents'

// UNCOMMENT AND UPDATE THESE PATHS WHEN USING THIS TEMPLATE:
// import '../blog.css'
// import ExternalLink from '../../components/ExternalLink'
// import ShareButtons from '../../components/ShareButtons'
// import BlogShareManager from '../../components/BlogShareManager'
// import TableOfContents from '../../components/TableOfContents'

// Type declarations for template purposes only
type ExternalLinkProps = { href: string; children: React.ReactNode };
type ShareButtonsProps = { url: string; title: string; description: string };
type BlogShareManagerProps = { url: string; title: string; description: string };
type TableOfContentsProps = { items: Array<{ id: string; title: string; level: number }> };

// Mock components for template purposes
const ExternalLink = ({ href, children }: ExternalLinkProps) => (
  <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
);
const ShareButtons = (props: ShareButtonsProps) => <div>[Share Buttons Placeholder]</div>;
const BlogShareManager = (props: BlogShareManagerProps) => <div>[Blog Share Manager Placeholder]</div>;
const TableOfContents = (props: TableOfContentsProps) => <div>[Table of Contents Placeholder]</div>;

/**
 * Blog Template with External Link Support
 * 
 * External links are automatically styled with an orange external link icon.
 * There are three ways to create external links:
 * 
 * 1. Use the ExternalLink component:
 *    <ExternalLink href="https://example.com">Link text</ExternalLink>
 * 
 * 2. Use the isExternalLink helper function with conditional rendering:
 *    {isExternalLink(url) ? (
 *      <a href={url} target="_blank" rel="noopener noreferrer">External link</a>
 *    ) : (
 *      <Link href={url}>Internal link</Link>
 *    )}
 * 
 * 3. Manually add the required attributes:
 *    <a href="https://example.com" target="_blank" rel="noopener noreferrer">External link</a>
 * 
 * The styling is applied to any link with target="_blank" attribute.
 */

// Helper function to check if a URL is external
const isExternalLink = (href: string) => {
  return href.startsWith('http') || href.startsWith('https')
}

// UPDATE THESE VALUES FOR YOUR BLOG POST
export const metadata: Metadata = {
  title: 'Your Blog Post Title | MPGCalculator.net',
  description: 'A brief, compelling description of your article that includes keywords and encourages clicks (150-160 characters).',
  // Remove the robots meta tag for production posts
  robots: {
    index: true,
    follow: true,
  }
}

export default function BlogPostPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* REMOVE THIS NOTICE WHEN COPYING THE TEMPLATE */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong className="font-medium">Template File:</strong> Copy this template to create new blog posts. This file is not part of the production build. Remember to update import paths and remove this notice.
            </p>
          </div>
        </div>
      </div>
      
      {/* Article Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl p-8 text-white">
          {/* UPDATE THIS LINK TO POINT TO THE CORRECT CATEGORY */}
          <Link href="/blog/category" className="text-blue-200 hover:text-white mb-2 inline-block">
            ← Back to Category
          </Link>
          {/* UPDATE THIS TITLE */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Blog Post Title Here</h1>
          <div className="flex items-center text-blue-100 space-x-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {/* UPDATE THIS DATE */}
              <span>Last Updated: Month YYYY</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {/* UPDATE THESE CATEGORIES AND TAGS */}
              <span>Category, Tags</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <main className="w-full lg:w-2/3">
          <article className="blog-content">
            {/* Introduction */}
            <section className="article-intro">
              <p className="lead text-xl text-gray-700 mb-6">
                This is your introductory paragraph. It should be engaging and provide a brief overview of what the article will cover. Aim for 2-3 sentences that hook the reader and make them want to continue reading.
              </p>
              
              <div className="key-takeaways bg-green-50 border border-green-100 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-green-800 mb-4">Key Takeaways</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>First key point that readers will learn from this article</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Second important takeaway from the content</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Third valuable insight readers will gain</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Fourth key benefit or piece of knowledge</span>
                  </li>
                </ul>
              </div>

              {/* Table of Contents - UPDATE THE ITEMS ARRAY WITH YOUR ACTUAL SECTIONS */}
              <TableOfContents 
                items={[
                  { id: "main-section", title: "Main Section Heading", level: 1 },
                  { id: "another-section", title: "Another Main Section", level: 1 },
                  { id: "conclusion", title: "Conclusion", level: 1 }
                ]} 
              />

              {/* Share Buttons - UPDATE URL, TITLE AND DESCRIPTION */}
              <ShareButtons 
                url="/blog/your-post-slug" 
                title="Your Blog Post Title Here" 
                description="This is a brief description of your blog post content."
              />
            </section>

            {/* Main Content Section 1 */}
            <section className="content-section">
              <h2 id="main-section" className="text-2xl font-bold text-blue-900 mb-4">Main Section Heading</h2>
              <p className="text-gray-700 mb-6">
                This is a standard paragraph. Use paragraphs to break up your content into digestible chunks. Each paragraph should focus on a single idea or point. This helps readers scan your content and improves readability.
              </p>

              {/* External Link Example */}
              <h3 className="text-xl font-semibold text-blue-800 mb-4">External Link Example</h3>
              <p className="text-gray-700 mb-6">
                This is an example of an <a href="https://www.example.com" target="_blank" rel="noopener noreferrer">external link</a> that will display with an icon. You can also use the helper function like this:
                {isExternalLink('https://www.example.com') ? (
                  <a href="https://www.example.com" target="_blank" rel="noopener noreferrer">another external link</a>
                ) : (
                  <Link href="https://www.example.com">internal link</Link>
                )}
                <br />
                Or use the ExternalLink component: <ExternalLink href="https://www.example.com">component-based external link</ExternalLink>
              </p>
            </section>

            {/* ADD MORE SECTIONS AS NEEDED */}

            {/* Conclusion */}
            <section>
              <h2 id="conclusion" className="text-2xl font-bold text-blue-900 mb-4">Conclusion</h2>
              <p className="text-gray-700 mb-6">
                Summarize the key points from your article. The conclusion should reinforce the main message and provide any final thoughts or recommendations for the reader.
              </p>
            </section>

            {/* Share Buttons at the bottom of the article */}
            <div className="mt-8">
              <ShareButtons 
                url="/blog/your-post-slug" 
                title="Your Blog Post Title Here" 
                description="This is a brief description of your blog post content."
              />
            </div>
          </article>
        </main>

        {/* Sidebar */}
        <aside className="w-full lg:w-1/3 space-y-6">
          {/* Related Articles */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/blog/related-article-1" className="text-blue-600 hover:text-blue-800">
                  Related Article Title 1
                </Link>
              </li>
              <li>
                <Link href="/blog/related-article-2" className="text-blue-600 hover:text-blue-800">
                  Related Article Title 2
                </Link>
              </li>
              <li>
                <Link href="/blog/related-article-3" className="text-blue-600 hover:text-blue-800">
                  Related Article Title 3
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h3 className="text-lg font-semibold mb-4">Our Tools</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/tool-page" className="flex items-start hover:bg-blue-100 p-2 rounded transition-colors">
                  <div className="mr-3 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium block">Tool Name</span>
                    <span className="text-sm text-gray-600">Brief description of the tool</span>
                  </div>
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Floating Share Button and Modal */}
      <BlogShareManager 
        url="/blog/your-post-slug" 
        title="Your Blog Post Title Here" 
        description="This is a brief description of your blog post content."
      />
    </div>
  )
} 