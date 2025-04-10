// components/analyze/code-uploader.tsx
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, FileCode, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface CodeUploaderProps {
  files: File[];
  setFiles: (files: File[]) => void;
}

export function CodeUploader({ files, setFiles }: CodeUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter for JavaScript, TypeScript, JSX, TSX files
    const jsFiles = acceptedFiles.filter(file => 
      /\.(js|jsx|ts|tsx)$/.test(file.name)
    );
    
    setFiles(prev => [...prev, ...jsFiles]);
  }, [setFiles]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/javascript': ['.js', '.jsx'],
      'text/typescript': ['.ts', '.tsx'],
    }
  });
  
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <h3 className="font-medium text-lg">Drag & drop files here</h3>
          <p className="text-sm text-muted-foreground">
            or click to browse (.js, .jsx, .ts, .tsx)
          </p>
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Uploaded Files ({files.length})</h4>
          <div className="border rounded-lg divide-y">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-3">
                  <FileCode className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{file.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeFile(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}