// components/analyze/code-input.tsx
"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Code } from "lucide-react";

interface CodeInputProps {
  code: string;
  setCode: (code: string) => void;
  isPackageJson?: boolean;
}

export function CodeInput({ code, setCode, isPackageJson = false }: CodeInputProps) {
  const componentPlaceholder = `// Example Next.js component with performance issues
import React from 'react'
import Image from 'next/legacy/image'
import moment from 'moment'
import lodash from 'lodash'

// Try analyzing this component or paste your own
export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img 
        src={product.image} 
        alt={product.name}
        width={300}
        height={200}
      />
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <div>{moment(product.date).format('MMMM Do YYYY')}</div>
    </div>
  )
}`;

  const packageJsonPlaceholder = `{
  "name": "sample-next-app",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "next": "14.0.1",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "moment": "2.29.4",
    "lodash": "4.17.21",
    "axios": "1.6.0",
    "framer-motion": "10.16.4",
    "three": "0.157.0",
    "chart.js": "4.4.0",
    "react-icons": "4.11.0",
    "styled-components": "6.1.0"
  },
  "devDependencies": {
    "typescript": "5.2.2",
    "eslint": "8.52.0",
    "jest": "29.7.0"
  }
}`;

  const handleLoadExample = () => {
    setCode(isPackageJson ? packageJsonPlaceholder : componentPlaceholder);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs text-muted-foreground">
          {isPackageJson 
            ? "Paste your package.json to analyze bundle size and dependency issues."
            : "For best results, include complete components with imports."}
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLoadExample}
          className="text-xs"
        >
          <Code className="h-3 w-3 mr-1" />
          Load Example
        </Button>
      </div>
      <Textarea
        placeholder={isPackageJson ? packageJsonPlaceholder : componentPlaceholder}
        className="font-mono h-[300px] resize-none"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
    </div>
  );
}