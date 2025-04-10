// components/analyze/code-input.tsx
"use client";

import { Textarea } from "@/components/ui/textarea";

interface CodeInputProps {
  code: string;
  setCode: (code: string) => void;
}

export function CodeInput({ code, setCode }: CodeInputProps) {
  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Paste your Next.js component or page code here..."
        className="font-mono h-[300px] resize-none"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <p className="text-xs text-muted-foreground">
        For best results, include complete components with imports.
      </p>
    </div>
  );
}