# PerfPilot AI - Next.js Performance Optimization Tool

![PerfPilot AI](https://img.shields.io/badge/PerfPilot%20AI-Next.js%20Performance-blue)
![Next.js 14](https://img.shields.io/badge/Next.js-14%2F15-black)
![Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-Powered-black)
![Recharts](https://img.shields.io/badge/Recharts-Data%20Visualization-blue)

PerfPilot AI is an intelligent tool designed to analyze Next.js applications, identify performance issues, and provide actionable recommendations to improve speed and user experience. Built for the Next.js Global Hackathon 2025, PerfPilot AI focuses on optimizing applications for the latest Next.js 14/15 features.

## 🚀 Features

- **Comprehensive Analysis**: Detect performance issues in Next.js components and applications
- **Multi-file Support**: Upload and analyze multiple files at once for a holistic performance assessment
- **Visual Performance Dashboard**: Intuitive performance score and category breakdowns
- **Interactive Data Visualizations**: Beautiful, interactive charts powered by Recharts showing performance metrics and issue distribution
- **AI-Powered Recommendations**: Get personalized, priority-ranked recommendations from GPT-4o
- **Code Examples**: Actionable code snippets to fix detected issues
- **Next.js 14/15 Features**: Support for the latest Next.js features including:
  - Partial Prerendering (PPR)
  - React Server Components
  - Server Actions
  - Metadata API
  - Route Handlers with Edge Runtime
- **Core Web Vitals Focus**: Optimize for LCP, CLS, and INP metrics
- **Copy/Paste Code Fixes**: Easily implement recommended solutions

## 📊 What PerfPilot AI Analyzes

- **Images**: Missing next/image components, dimensions, and priority props
- **Rendering Strategy**: Opportunities for Partial Prerendering and Suspense boundaries
- **Imports**: Large dependencies that could be loaded dynamically
- **Fonts**: Font optimization with next/font
- **Scripts**: Script loading strategies with next/script
- **Components**: Proper use of Server Components and Client Components
- **Routing**: Efficient route handlers and metadata optimization
- **Data Fetching**: Optimized data fetching and revalidation strategies

## 📈 Data Visualization

PerfPilot AI provides rich, interactive data visualizations to help you understand your performance metrics:

- **Performance Score Distribution**: Area chart showing your score in relation to performance zones
- **Issues by Category**: Bar chart showing the distribution of issues across different categories
- **Issues by Severity**: Pie chart displaying the proportion of critical, warning, and info issues
- **Performance by Category**: Radar chart visualizing performance scores across all categories

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

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Vercel](https://vercel.com) for the Next.js framework and AI SDK
- [Shadcn](https://twitter.com/shadcn) for the excellent UI components
- [Recharts](https://recharts.org/) for the interactive data visualization library
- The Next.js team for organizing the Global Hackathon
