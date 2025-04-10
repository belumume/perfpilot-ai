// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { analyzeCode, analyzeFiles } from "@/lib/analysis/analyzer";
import { generateRecommendations } from "@/lib/ai/generate-recommendations";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const codeSource = formData.get("codeSource") as string;
    
    let analysisResult;
    let code = "";
    let filename = "";
    
    if (codeSource === "input") {
      code = formData.get("code") as string;
      filename = "input.tsx";
      analysisResult = await analyzeCode(code, filename);
    } else if (codeSource === "upload") {
      const file = formData.get("file") as File;
      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }
      
      code = await file.text();
      filename = file.name;
      analysisResult = await analyzeCode(code, filename);
    } else {
      return NextResponse.json(
        { error: "Invalid code source" },
        { status: 400 }
      );
    }
    
    // Generate AI recommendations
    const aiRecommendations = await generateRecommendations(
      analysisResult,
      code,
      filename
    );
    
    return NextResponse.json({
      analysis: analysisResult,
      recommendations: aiRecommendations
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "An error occurred during analysis" },
      { status: 500 }
    );
  }
}