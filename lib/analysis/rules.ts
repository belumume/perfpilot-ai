// lib/analysis/rules.ts
export interface PerformanceRule {
    id: string;
    name: string;
    description: string;
    pattern: RegExp | ((code: string) => boolean);
    severity: 'critical' | 'warning' | 'info';
    category: 'images' | 'rendering' | 'imports' | 'fonts' | 'scripts' | 'general';
    recommendation: string;
    codeExample?: string;
    docs?: string;
  }
  
  export const performanceRules: PerformanceRule[] = [
    {
      id: 'img-tag-usage',
      name: 'HTML img tag usage',
      description: 'Using HTML img tags instead of next/image component',
      pattern: /<img\s+[^>]*src=/i,
      severity: 'critical',
      category: 'images',
      recommendation: 'Replace HTML img tags with the next/image component for automatic image optimization.',
      codeExample: `// Before
  <img src="/profile.jpg" width="500" height="300" alt="Profile" />
  
  // After
  import Image from 'next/image'
  
  <Image 
    src="/profile.jpg" 
    width={500} 
    height={300} 
    alt="Profile" 
  />`,
      docs: 'https://nextjs.org/docs/api-reference/next/image'
    },
    {
      id: 'missing-image-dimensions',
      name: 'Missing image dimensions',
      description: 'Using next/image without width and height props',
      pattern: /import\s+\w+\s+from\s+['"]next\/image['"][\s\S]*?<\w+[^>]*src=(?!.*width=.*height=)/,
      severity: 'warning',
      category: 'images',
      recommendation: 'Always specify width and height props for next/image to prevent layout shifts.',
      codeExample: `// Before
  <Image src="/profile.jpg" alt="Profile" />
  
  // After
  <Image 
    src="/profile.jpg" 
    width={500} 
    height={300} 
    alt="Profile" 
  />`,
      docs: 'https://nextjs.org/docs/api-reference/next/image#width'
    },
    {
      id: 'missing-image-priority',
      name: 'Missing priority on LCP image',
      description: 'The main hero/banner image should have the priority prop',
      pattern: (code) => {
        // Check if there's an Image import and a likely hero image without priority
        return /import\s+\w+\s+from\s+['"]next\/image['"]/.test(code) && 
               /className=["'].*hero.*["']/.test(code) && 
               !/<\w+[^>]*className=["'].*hero.*["'][^>]*priority/.test(code);
      },
      severity: 'warning',
      category: 'images',
      recommendation: 'Add the priority prop to your hero/banner images to improve LCP.',
      codeExample: `// Before
  <Image 
    src="/hero.jpg" 
    className="hero-image" 
    width={1200} 
    height={600} 
    alt="Hero" 
  />
  
  // After
  <Image 
    src="/hero.jpg" 
    className="hero-image" 
    width={1200} 
    height={600} 
    alt="Hero" 
    priority
  />`,
      docs: 'https://nextjs.org/docs/api-reference/next/image#priority'
    },
    {
      id: 'font-without-next-font',
      name: 'Font without next/font',
      description: 'Using custom fonts without next/font optimization',
      pattern: /@font-face/i,
      severity: 'warning',
      category: 'fonts',
      recommendation: 'Use next/font to automatically optimize and load custom fonts.',
      codeExample: `// Before
  @font-face {
    font-family: 'CustomFont';
    src: url('/fonts/CustomFont.woff2');
  }
  
  // After
  import { Inter } from 'next/font/google'
  // or for local fonts:
  // import localFont from 'next/font/local'
  
  const inter = Inter({ subsets: ['latin'] })
  // const customFont = localFont({ src: './fonts/CustomFont.woff2' })
  
  export default function Layout({ children }) {
    return (
      <html lang="en" className={inter.className}>
        <body>{children}</body>
      </html>
    )
  }`,
      docs: 'https://nextjs.org/docs/basic-features/font-optimization'
    },
    {
      id: 'large-dependencies',
      name: 'Large dependencies import',
      description: 'Importing large libraries that could be loaded dynamically',
      pattern: /import\s+\w+\s+from\s+['"]chart\.js|three|monaco-editor|draft-js|codemirror|highlight\.js|pdf\.js|quill|react-big-calendar|react-data-grid|react-beautiful-dnd['"]/i,
      severity: 'warning',
      category: 'imports',
      recommendation: 'Use dynamic imports for large libraries to reduce initial bundle size.',
      codeExample: `// Before
  import Chart from 'chart.js';
  
  // After
  import dynamic from 'next/dynamic';
  
  const Chart = dynamic(() => import('chart.js'), {
    ssr: false, // Optional: disable server-side rendering
    loading: () => <p>Loading chart...</p>
  });`,
      docs: 'https://nextjs.org/docs/advanced-features/dynamic-import'
    },
    {
      id: 'missing-suspense',
      name: 'Missing Suspense boundaries',
      description: 'Components that fetch data without Suspense boundaries',
      pattern: (code) => {
        // Check for fetch or useQuery without Suspense
        return (/\bfetch\s*\(/.test(code) || /useQuery\s*\(/.test(code)) && 
               !/import\s+{\s*Suspense\s*}/.test(code);
      },
      severity: 'info',
      category: 'rendering',
      recommendation: 'Use Suspense boundaries around components that fetch data to improve perceived performance.',
      codeExample: `// Before
  function Dashboard() {
    return (
      <div>
        <Profile />
        <DataTable />
      </div>
    );
  }
  
  // After
  import { Suspense } from 'react';
  
  function Dashboard() {
    return (
      <div>
        <Profile />
        <Suspense fallback={<div>Loading data...</div>}>
          <DataTable />
        </Suspense>
      </div>
    );
  }`,
      docs: 'https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming'
    },
    {
      id: 'no-partial-prerendering',
      name: 'Not using Partial Prerendering',
      description: 'App Router pages without Partial Prerendering configuration',
      pattern: (code) => {
        // Check if it's likely an App Router page without PPR
        return /export\s+default\s+function\s+\w+Page/.test(code) && 
               !/export\s+const\s+experimental_ppr/.test(code);
      },
      severity: 'info',
      category: 'rendering',
      recommendation: 'Consider using Partial Prerendering for faster initial page loads.',
      codeExample: `// Before
  export default function ProductPage() {
    return (
      <div>
        <ProductInfo />
        <RelatedProducts />
      </div>
    );
  }
  
  // After
  // Enable Partial Prerendering
  export const experimental_ppr = true;
  
  export default function ProductPage() {
    return (
      <div>
        <ProductInfo />
        <Suspense fallback={<RelatedProductsSkeleton />}>
          <RelatedProducts />
        </Suspense>
      </div>
    );
  }`,
      docs: 'https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering'
    },
    {
      id: 'inline-scripts',
      name: 'Inline scripts without next/script',
      description: 'Using inline script tags instead of next/script component',
      pattern: /<script\s+[^>]*>/i,
      severity: 'warning',
      category: 'scripts',
      recommendation: 'Use the next/script component to properly manage script loading.',
      codeExample: `// Before
  <script src="https://example.com/analytics.js"></script>
  
  // After
  import Script from 'next/script';
  
  <Script 
    src="https://example.com/analytics.js" 
    strategy="afterInteractive"
  />`,
      docs: 'https://nextjs.org/docs/basic-features/script'
    }
  ];