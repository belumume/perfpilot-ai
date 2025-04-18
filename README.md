# PerfPilot AI - Next.js Performance Optimization Tool

![PerfPilot AI](https://img.shields.io/badge/PerfPilot%20AI-Next.js%20Performance-blue)
![Next.js 14](https://img.shields.io/badge/Next.js-14%2F15-black)
![Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-Powered-black)
![Recharts](https://img.shields.io/badge/Recharts-Data%20Visualization-blue)
![Hackathon](https://img.shields.io/badge/Next.js-Global%20Hackathon%202025-orange)

PerfPilot AI is an intelligent tool designed to analyze Next.js applications, identify performance issues, and provide actionable recommendations to improve speed and user experience. Built for the Next.js Global Hackathon 2025, PerfPilot AI focuses on optimizing applications for the latest Next.js 14/15 features.

## 📹 Demo Video

> **Coming Soon!** Watch our demo video to see PerfPilot AI in action. The video will demonstrate the key features, analysis process, and how the tool can help optimize your Next.js applications.

## 🚀 Features

- **Comprehensive Code Analysis**: Detect performance issues in Next.js components and applications
- **Bundle Size Analysis**: Identify heavy dependencies, unnecessary packages, and tree-shaking issues
- **Multi-file Support**: Upload and analyze multiple files at once for a holistic performance assessment
- **Visual Performance Dashboard**: Intuitive performance score and category breakdowns
- **Interactive Data Visualizations**: Beautiful, interactive charts powered by Recharts showing performance metrics and issue distribution
- **AI-Powered Recommendations**: Get personalized, priority-ranked recommendations from GPT-4o
- **Code Examples**: Actionable code snippets to fix detected issues
- **Export Functionality**: Save analysis results as JSON or formatted HTML reports
- **Next.js 14/15 Features**: Support for the latest Next.js features including:
  - Partial Prerendering (PPR)
  - React Server Components
  - Server Actions
  - Metadata API
  - Route Handlers with Edge Runtime
- **Core Web Vitals Focus**: Optimize for LCP, CLS, and INP metrics
- **Performance History Dashboard**: Track performance improvements over time
- **Copy/Paste Code Fixes**: Easily implement recommended solutions

## 📊 What PerfPilot AI Analyzes

### Code Analysis
- **Images**: Missing next/image components, dimensions, and priority props
- **Rendering Strategy**: Opportunities for Partial Prerendering and Suspense boundaries
- **Imports**: Large dependencies that could be loaded dynamically
- **Fonts**: Font optimization with next/font
- **Scripts**: Script loading strategies with next/script
- **Components**: Proper use of Server Components and Client Components
- **Routing**: Efficient route handlers and metadata optimization
- **Data Fetching**: Optimized data fetching and revalidation strategies

### Bundle Analysis
- **Heavy Dependencies**: Identify large packages increasing bundle size
- **Unnecessary Dependencies**: Detect packages that aren't needed in Next.js projects
- **Duplicate Functionality**: Find multiple packages serving the same purpose
- **Tree-shaking Issues**: Identify import patterns preventing effective tree-shaking
- **Bundle Score**: Get an overall assessment of your bundle health

## 📈 Data Visualization

PerfPilot AI provides rich, interactive data visualizations to help you understand your performance metrics:

- **Performance Score Distribution**: Area chart showing your score in relation to performance zones
- **Issues by Category**: Bar chart showing the distribution of issues across different categories
- **Issues by Severity**: Pie chart displaying the proportion of critical, warning, and info issues
- **Performance by Category**: Radar chart visualizing performance scores across all categories
- **Bundle Size Distribution**: Pie chart showing the distribution of dependency issues
- **Heaviest Dependencies**: Bar chart identifying the largest packages in your bundle

## 🔧 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/perfpilot-ai.git
   cd perfpilot-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   Create a `.env.local` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to use PerfPilot AI.

## 💡 How to Use

1. Navigate to the "Analyze" page
2. Choose to either:
   - Upload your Next.js files (supports multiple files)
   - Paste your Next.js code directly
3. Click "Analyze Performance"
4. View the detailed analysis results, including:
   - Performance score and interactive charts
   - Issue categories and severity breakdown
   - Specific detected issues
   - AI recommendations with code examples
   - Performance insights and metrics
   - Bundle analysis (when applicable)
5. Optionally:
   - Export your results as JSON or HTML reports
   - Save your analysis to the dashboard to track improvements over time

## 🧪 Test Files

We've included sample files for testing PerfPilot AI's analysis capabilities. These are organized into two categories:

### JSX Test Files
Located in the `test_files/jsx` directory:
- `blog-page.jsx`: Example blog page component with various performance issues
- `dashboard.jsx`: Dashboard component with optimization opportunities
- `hero-section.jsx`: Hero section with image and layout issues
- `layout.jsx`: Layout component with font and metadata optimization needs
- `product-page.jsx`: Product page with data fetching and rendering issues

**Usage Tip**: For best results, upload all JSX files together for a more comprehensive analysis.

### Bundle Analysis Test Files
Located in the `test_files/bundle` directory:
- `comprehensive-package.json`: Contains multiple types of bundle issues
- `duplicate-functionality-package.json`: Features redundant packages serving similar purposes
- `heavy-deps-package.json`: Includes unnecessarily large dependencies
- `treeshaking-package.json`: Demonstrates problematic import patterns
- `unnecessary-deps-package.json`: Contains packages not needed in Next.js projects

**Usage Tip**: Upload these files individually to see different types of bundle analysis insights.

## 🌱 Development

### Branch Information
- **main**: Contains the stable, submitted version for the Next.js Global Hackathon
- **test**: Contains the latest development work and improvements

> **Note for Judges**: Our official hackathon submission is in the `main` branch. For those interested in our latest developments and experimental features, please check the `test` branch.

## 🏗️ Built With

- [Next.js 14/15](https://nextjs.org/) - The React Framework with App Router
- [Vercel AI SDK](https://sdk.vercel.ai) - For AI-powered recommendations
- [OpenAI GPT-4o](https://openai.com) - Advanced language model for analysis
- [Recharts](https://recharts.org/) - A composable charting library for React
- [Shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives

## 🏆 Next.js Global Hackathon 2025

PerfPilot AI is an entry for the Next.js Global Hackathon 2025. The project aims to win in the following categories:

- **Fastest App**: By implementing Partial Prerendering, optimized code loading, and edge runtime
- **Best Use of AI**: Leveraging the Vercel AI SDK for intelligent performance analysis
- **Highest Quality App**: With attention to design detail, accessibility, and user experience

For more details about our hackathon strategy and implementation plan, see:
- [Next.js Hackathon Project Planning](Next.js%20Hackathon%20Project%20Planning_.md)
- [PerfPilot AI - Development Summary & Context](PerfPilot%20AI%20-%20Development%20Summary%20%26%20Context.md)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Vercel](https://vercel.com) for the Next.js framework and AI SDK
- [Shadcn](https://twitter.com/shadcn) for the excellent UI components
- [Recharts](https://recharts.org/) for the interactive data visualization library
- The Next.js team for organizing the Global Hackathon
