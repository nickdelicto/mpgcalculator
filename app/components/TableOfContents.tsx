'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  title?: string;
  items: TOCItem[];
}

export default function TableOfContents({ title = "Table of Contents", items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Set up intersection observer to highlight the active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '0px 0px -80% 0px',
        threshold: 0.1,
      }
    );

    // Observe all section headings
    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      items.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [items]);

  // Handle smooth scrolling
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveId(id);
      
      // Update URL hash without jumping
      window.history.pushState(null, '', `#${id}`);
    }
  };

  // Toggle expanded/collapsed state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8">
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={toggleExpanded}
      >
        <h3 className="text-xl font-semibold text-blue-800 flex items-center">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          {title}
        </h3>
        <button 
          className="text-blue-700 hover:text-blue-900 transition-colors"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse table of contents" : "Expand table of contents"}
        >
          {isExpanded ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>
      
      {isExpanded && (
        <nav className="mt-4">
          <ul className="space-y-2">
            {items.map((item) => (
              <li 
                key={item.id} 
                className={`${item.level > 1 ? 'ml-4' : ''}`}
              >
                <Link 
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className={`
                    flex items-center text-gray-700 hover:text-blue-700 transition-colors no-underline
                    ${activeId === item.id ? 'font-medium text-blue-700' : ''}
                  `}
                >
                  <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-lg">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
} 