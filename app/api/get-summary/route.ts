import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
  try {
    const transcriptText = await request.text();

    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY }); 

    const response = await ai.models.generateContent({ 
      model: "gemini-2.5-flash", 
      contents: `Here is the interview transcript to evaluate:\n\n${transcriptText}`,
      config: {
        systemInstruction: `You are Marcus, an empathetic and professional Tech Recruiter. Analyze the provided interview transcript and assess the candidate. Determine an overall score (1-10) and compile a professional feedback summary focusing on strengths, improvement areas, and English fluency. Return your response strictly as a JSON object containing "score" (number) and "feedback" (string).`,
        responseMimeType: "application/json"
      } 
    });

    // Parse the generated JSON response
    const evaluation = JSON.parse(response.text!);

    return NextResponse.json({
      success: true,
      score: evaluation.score,
      feedback: evaluation.feedback
    });

  } catch (error: any) {
    console.error("Evaluation generation failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
