import { analyzeBundleSize } from "@/lib/analysis/bundle-analyzer";

// Sample JSON files
const samples = [
  {
    name: 'Heavy Dependencies',
    content: {
      name: "heavy-deps-test",
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint"
      },
      dependencies: {
        next: "14.0.4",
        react: "^18.2.0",
        "react-dom": "^18.2.0",
        moment: "^2.29.4",
        lodash: "^4.17.21",
        "chart.js": "^4.4.1",
        bootstrap: "^5.3.2",
        "@mui/material": "^5.15.1",
        "@emotion/react": "^11.11.1",
        "@emotion/styled": "^11.11.0"
      },
      devDependencies: {
        typescript: "^5.3.3",
        "@types/react": "^18.2.45",
        "@types/node": "^20.10.5",
        "@types/lodash": "^4.14.202",
        eslint: "^8.56.0",
        "eslint-config-next": "14.0.4"
      }
    }
  },
  {
    name: 'Unnecessary Dependencies',
    content: {
      name: "unnecessary-deps-test",
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint"
      },
      dependencies: {
        next: "14.0.4",
        react: "^18.2.0",
        "react-dom": "^18.2.0",
        "react-router-dom": "^6.21.0",
        webpack: "^5.89.0",
        express: "^4.18.2",
        serve: "^14.2.1",
        "babel-core": "^6.26.3",
        "parcel-bundler": "^1.12.5"
      },
      devDependencies: {
        typescript: "^5.3.3",
        "@types/react": "^18.2.45",
        "@types/node": "^20.10.5",
        eslint: "^8.56.0",
        "eslint-config-next": "14.0.4"
      }
    }
  },
  {
    name: 'Duplicate Functionality',
    content: {
      name: "duplicate-functionality-test",
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint"
      },
      dependencies: {
        next: "14.0.4",
        react: "^18.2.0",
        "react-dom": "^18.2.0",
        redux: "^4.2.1",
        "react-redux": "^9.0.4",
        zustand: "^4.4.7",
        jotai: "^2.6.0",
        recoil: "^0.7.7",
        "@mui/material": "^5.15.1",
        "@chakra-ui/react": "^2.8.2",
        antd: "^5.12.2",
        axios: "^1.6.2",
        superagent: "^8.1.2",
        got: "^13.0.0"
      },
      devDependencies: {
        typescript: "^5.3.3",
        "@types/react": "^18.2.45",
        "@types/node": "^20.10.5",
        eslint: "^8.56.0",
        "eslint-config-next": "14.0.4"
      }
    }
  },
  {
    name: 'Broken JSON with Comments',
    content: `{
      "name": "broken-json-test",
      "version": "0.1.0",
      "private": true,
      // This is a comment that breaks JSON parsing
      "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint"
      },
      "dependencies": {
        "next": "14.0.4",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "moment": "^2.29.4",
      }, /* Another comment */
      "devDependencies": {
        "typescript": "^5.3.3",
      }
    }`
  },
  {
    name: 'Comprehensive test',
    content: {
      name: "comprehensive-test",
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint"
      },
      dependencies: {
        next: "14.0.4",
        react: "^18.2.0",
        "react-dom": "^18.2.0",
        
        // Heavy dependencies
        moment: "^2.29.4",
        lodash: "^4.17.21",
        "@mui/material": "^5.15.1",
        "@emotion/react": "^11.11.1",
        "@emotion/styled": "^11.11.0",
        
        // Unnecessary in Next.js
        "react-router-dom": "^6.21.0",
        webpack: "^5.89.0",
        
        // Duplicate functionality
        redux: "^4.2.1",
        "react-redux": "^9.0.4",
        zustand: "^4.2.0",
        
        axios: "^1.6.2",
        superagent: "^8.1.2",
        
        // Common dependencies prone to tree-shaking issues
        "react-icons": "^4.12.0",
        antd: "^5.12.2"
      },
      devDependencies: {
        typescript: "^5.3.3",
        "@types/react": "^18.2.45",
        "@types/node": "^20.10.5",
        "@types/lodash": "^4.14.202",
        eslint: "^8.56.0",
        "eslint-config-next": "14.0.4"
      }
    }
  }
];

export default async function handler(req, res) {
  try {
    const results = [];
    
    // Analyze each sample
    for (const sample of samples) {
      const content = typeof sample.content === 'string' 
        ? sample.content 
        : JSON.stringify(sample.content, null, 2);
      
      // Use our actual analyzer
      const result = await analyzeBundleSize(content);
      
      results.push({
        name: sample.name,
        result: {
          totalDependencies: result.totalDependencies,
          heavyDependencies: result.heavyDependencies.length > 0 
            ? result.heavyDependencies.map(d => d.name) 
            : [],
          unnecessaryDependencies: result.unnecessaryDependencies.length > 0 
            ? result.unnecessaryDependencies.map(d => d.name) 
            : [],
          duplicateDependencies: result.duplicateDependencies.length > 0 
            ? result.duplicateDependencies.map(d => d.names) 
            : [],
          score: result.score,
          totalIssues: result.summary.totalIssues,
          estimatedSize: result.summary.size.estimated
        }
      });
    }
    
    // Return the results
    res.status(200).json({ 
      success: true, 
      message: 'Bundle analyzer test completed successfully',
      results 
    });
  } catch (error) {
    console.error('Test bundle analyzer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Bundle analyzer test failed', 
      error: error.message 
    });
  }
} 