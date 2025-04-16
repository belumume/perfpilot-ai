// lib/analysis/rules.ts
export interface PerformanceRule {
    id: string;
    name: string;
    description: string;
    pattern: RegExp | ((code: string) => boolean);
    severity: 'critical' | 'warning' | 'info';
    category: 'images' | 'rendering' | 'imports' | 'fonts' | 'scripts' | 'general' | 'components' | 'data' | 'routing';
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
    },
    // New rules below
    {
      id: 'client-component-with-server-actions',
      name: 'Client component with server actions',
      description: 'Using server actions in a client component through props can cause unnecessary client-server round trips',
      pattern: (code) => {
        // Check if it's a client component that passes server actions as props
        return /^["']use client["'];/m.test(code) && 
               /function.*\(.*\{.*async function.*\(.*\{/.test(code) &&
               /\.bind\(null\)/.test(code);
      },
      severity: 'warning',
      category: 'components',
      recommendation: 'Move server actions to a separate server component or use Form Action instead of passing as props.',
      codeExample: `// Before - Client Component
"use client";
import { submitAction } from './actions';

export default function MyForm() {
  return (
    <form action={submitAction.bind(null, id)}>
      <button type="submit">Submit</button>
    </form>
  );
}

// After - Better Pattern
"use client";

export default function MyForm() {
  return (
    <form action={async (formData) => {
      const result = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });
      // Handle result
    }}>
      <button type="submit">Submit</button>
    </form>
  );
}`,
      docs: 'https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations'
    },
    {
      id: 'missing-metadata',
      name: 'Missing metadata in App Router',
      description: 'App Router pages should define metadata for SEO optimization',
      pattern: (code) => {
        // Check if it's an App Router page without metadata
        return /export\s+default\s+function\s+\w+Page/.test(code) && 
               !/export\s+const\s+metadata\s*=/.test(code) &&
               !/export\s+async\s+function\s+generateMetadata/.test(code);
      },
      severity: 'warning',
      category: 'routing',
      recommendation: 'Define metadata for better SEO and social sharing.',
      codeExample: `// Before
export default function BlogPage() {
  return <div>Blog content</div>;
}

// After
export const metadata = {
  title: 'Blog Post Title',
  description: 'Description of the blog post for better SEO',
  openGraph: {
    title: 'Blog Post Title',
    description: 'Description for social sharing',
    images: ['/images/blog-post.jpg'],
  },
};

export default function BlogPage() {
  return <div>Blog content</div>;
}`,
      docs: 'https://nextjs.org/docs/app/building-your-application/optimizing/metadata'
    },
    {
      id: 'inefficient-route-handlers',
      name: 'Inefficient Route Handlers',
      description: 'Route handlers without edge runtime or proper caching headers',
      pattern: (code) => {
        // Check if it's a route handler without edge runtime or caching
        return /export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)/.test(code) && 
               !(/export\s+const\s+runtime\s*=\s*['"]edge['"]/.test(code) || 
                 /headers\s*\(\s*\{\s*['"]Cache-Control['"]/.test(code));
      },
      severity: 'warning',
      category: 'routing',
      recommendation: 'Use edge runtime and set appropriate caching headers for route handlers.',
      codeExample: `// Before
export async function GET(request) {
  const data = await fetchData();
  return Response.json(data);
}

// After
export const runtime = 'edge';
export const revalidate = 3600; // 1 hour

export async function GET(request) {
  const data = await fetchData();
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}`,
      docs: 'https://nextjs.org/docs/app/building-your-application/routing/route-handlers'
    },
    {
      id: 'client-fetch-without-revalidation',
      name: 'Client-side fetch without revalidation',
      description: 'Using fetch in client components without proper revalidation strategy',
      pattern: (code) => {
        // Check if it's a client component with fetch but no revalidation or SWR/React Query
        return /^["']use client[""];/m.test(code) && 
               /\bfetch\s*\(/.test(code) && 
               !(/revalidatePath|revalidateTag|next\/cache/.test(code) ||
                 /useSWR|useQuery/.test(code));
      },
      severity: 'info',
      category: 'data',
      recommendation: 'Use SWR, React Query, or Next.js data fetching patterns for better caching and revalidation.',
      codeExample: `// Before
"use client";
import { useState, useEffect } from 'react';

export function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]);
  
  return <div>{user?.name}</div>;
}

// After - Using SWR
"use client";
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then(res => res.json());

export function UserProfile({ userId }) {
  const { data: user, error, isLoading } = useSWR(
    \`/api/users/\${userId}\`, 
    fetcher
  );
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user</div>;
  
  return <div>{user?.name}</div>;
}`,
      docs: 'https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating'
    },
    {
      id: 'non-dynamic-imports',
      name: 'Non-dynamic imports in client components',
      description: 'Client components importing server-only code',
      pattern: (code) => {
        // Check if it's a client component importing server-only modules
        return /^["']use client[""];/m.test(code) && 
               /import.*from\s+['"]server-only|["']\.\.\/.*\.server['"]/i.test(code);
      },
      severity: 'critical',
      category: 'imports',
      recommendation: 'Avoid importing server-only code in client components.',
      codeExample: `// Before - Client Component
"use client";
import { getUser } from '../lib/db.server';

export default function UserProfile({ userId }) {
  // This will cause errors - server code cannot be imported in client components
  const user = getUser(userId);
  return <div>{user.name}</div>;
}

// After - Better Pattern
// UserProfile.tsx (client component)
"use client";

export default function UserProfile({ user }) {
  return <div>{user.name}</div>;
}

// page.tsx (server component)
import { getUser } from '../lib/db.server';
import UserProfile from './UserProfile';

export default async function Page({ params }) {
  const user = await getUser(params.id);
  return <UserProfile user={user} />;
}`,
      docs: 'https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns'
    },
    {
      id: 'missing-error-boundary',
      name: 'Missing error boundary',
      description: 'Components that fetch data without error handling',
      pattern: (code) => {
        return (/async\s+function|await\s+fetch|useEffect/.test(code) &&
               !/error\.tsx|ErrorBoundary|try\s*\{/.test(code));
      },
      severity: 'warning',
      category: 'rendering',
      recommendation: 'Add error handling with error.js files or try/catch blocks.',
      codeExample: `// Before
export default async function Page() {
  const data = await fetch('/api/data');
  const posts = await data.json();
  
  return <PostList posts={posts} />;
}

// After - Using error.js
// page.tsx
export default async function Page() {
  const data = await fetch('/api/data');
  const posts = await data.json();
  
  return <PostList posts={posts} />;
}

// error.tsx (in the same directory)
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}`,
      docs: 'https://nextjs.org/docs/app/building-your-application/routing/error-handling'
    },
    {
      id: 'improper-link-usage',
      name: 'Improper Link usage',
      description: 'Using a tags instead of Next.js Link component for internal navigation',
      pattern: /<a\s+[^>]*href=["']\/|<a\s+[^>]*href=["'][^"':]+["']/i,
      severity: 'warning',
      category: 'routing',
      recommendation: 'Use the Next.js Link component for client-side navigation between routes.',
      codeExample: `// Before
<a href="/about">About</a>

// After
import Link from 'next/link';

<Link href="/about">About</Link>`,
      docs: 'https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating'
    }
  ];