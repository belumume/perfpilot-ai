const fs = require('fs');
const path = require('path');

// Import the bundle analyzer (using require since this is a Node.js script)
// Note: We're importing from a CommonJS context, but our code is in ES modules
// So we'll just define the function signature here to test it
async function analyzeBundleSize(packageJsonContent) {
  try {
    // Parse JSON
    const packageJson = JSON.parse(packageJsonContent);
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    // Simple analysis to match our main analyzer
    const totalDependencies = Object.keys(dependencies).length;
    
    // Check for some common heavy dependencies
    const heavyDeps = [
      'moment', 'lodash', 'jquery', 'chart.js', 'bootstrap', 
      '@mui/material', 'antd', 'gatsby', 'axios', 'redux'
    ];
    
    const heavyDependencies = Object.keys(dependencies)
      .filter(dep => heavyDeps.includes(dep))
      .map(dep => ({ name: dep }));
    
    // Check for unnecessary dependencies in Next.js
    const unnecessaryDeps = [
      'react-router', 'react-router-dom', 'webpack', 'babel',
      'express', 'parcel', 'serve'
    ];
    
    const unnecessaryDependencies = Object.keys(dependencies)
      .filter(dep => unnecessaryDeps.includes(dep))
      .map(dep => ({ name: dep }));
    
    // Simple duplication check
    const stateLibs = ['redux', 'zustand', 'jotai', 'recoil', 'mobx'].filter(
      lib => Object.keys(dependencies).includes(lib)
    );
    
    const uiLibs = ['@mui/material', '@chakra-ui/react', 'antd'].filter(
      lib => Object.keys(dependencies).includes(lib)
    );
    
    const httpLibs = ['axios', 'superagent', 'got'].filter(
      lib => Object.keys(dependencies).includes(lib)
    );
    
    const duplicateDependencies = [];
    if (stateLibs.length > 1) {
      duplicateDependencies.push({ names: stateLibs, reason: 'Multiple state management libraries' });
    }
    if (uiLibs.length > 1) {
      duplicateDependencies.push({ names: uiLibs, reason: 'Multiple UI libraries' });
    }
    if (httpLibs.length > 1) {
      duplicateDependencies.push({ names: httpLibs, reason: 'Multiple HTTP clients' });
    }
    
    // Calculate score
    let score = 100;
    score -= heavyDependencies.length * 5;
    score -= unnecessaryDependencies.length * 3;
    score -= duplicateDependencies.length * 8;
    score = Math.max(0, Math.min(100, score));
    
    return {
      totalDependencies,
      heavyDependencies,
      unnecessaryDependencies,
      duplicateDependencies,
      treeshakingIssues: [],
      score,
      summary: {
        totalIssues: heavyDependencies.length + unnecessaryDependencies.length + duplicateDependencies.length,
        size: {
          estimated: `~${totalDependencies * 20}KB`,
          breakdown: {
            dependencies: `${totalDependencies} dependencies`,
            devDependencies: `${Object.keys(devDependencies).length} devDependencies`
          }
        }
      }
    };
  } catch (error) {
    console.error('Error analyzing bundle:', error);
    return {
      error: `Failed to analyze: ${error.message}`,
      totalDependencies: 0,
      heavyDependencies: [],
      unnecessaryDependencies: [],
      duplicateDependencies: [],
      treeshakingIssues: [],
      score: 0
    };
  }
}

// Test samples
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
  }
];

async function runTests() {
  console.log('Testing Bundle Analyzer with sample package.json files\n');
  
  for (const sample of samples) {
    console.log(`\n==== Testing ${sample.name} ====`);
    
    // Convert to JSON string if it's an object
    const content = typeof sample.content === 'string' 
      ? sample.content 
      : JSON.stringify(sample.content, null, 2);
    
    try {
      const result = await analyzeBundleSize(content);
      console.log('Analysis Result:');
      console.log(`- Total Dependencies: ${result.totalDependencies}`);
      console.log(`- Score: ${result.score}`);
      console.log(`- Heavy Dependencies: ${result.heavyDependencies.length}`);
      if (result.heavyDependencies.length > 0) {
        console.log('  ' + result.heavyDependencies.map(d => d.name).join(', '));
      }
      console.log(`- Unnecessary Dependencies: ${result.unnecessaryDependencies.length}`);
      if (result.unnecessaryDependencies.length > 0) {
        console.log('  ' + result.unnecessaryDependencies.map(d => d.name).join(', '));
      }
      console.log(`- Duplicate Functionality: ${result.duplicateDependencies.length}`);
      if (result.duplicateDependencies.length > 0) {
        console.log('  ' + result.duplicateDependencies.map(d => d.names.join(', ')).join(' | '));
      }
      console.log(`- Total Issues: ${result.summary.totalIssues}`);
      console.log(`- Estimated Size: ${result.summary.size.estimated}`);
    } catch (error) {
      console.error(`Error testing ${sample.name}:`, error);
    }
  }
}

runTests().catch(console.error); 