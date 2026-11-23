import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Restrict access to authenticated dashboard users
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agentId = process.env.ELEVENLABS_AGENT_ID || process.env.NEXT_PUBLIC_AGENT_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

    if (!agentId || !apiKey) {
      return NextResponse.json(
        { error: "Agent ID or ElevenLabs API Key is missing in environment variables." },
        { status: 500 }
      );
    }

    // Call ElevenLabs to update the agent's data collection settings programmatically
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${agentId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          platform_settings: {
            data_collection: {
              interview_feedback: {
                type: "string",
                description:
                  "Provide a concise summary of the candidate's strengths, weaknesses, and overall performance during the interview also english fluency.",
              },
              interview_score: {
                type: "number",
                description:
                  "Evaluate the candidate's performance and assign an overall score from 1 to 10.",
              },
            },
            evaluation_criteria: {
              completed_all_questions: {
                description:
                  "Mark as successful if the candidate answered all core technical and behavioral questions asked by the interviewer.",
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs agent setup failed:", response.status, errorText);
      return NextResponse.json(
        { error: "ElevenLabs API update failed", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: "Agent data collection settings updated successfully.",
      agent: data,
    });
  } catch (error: any) {
    console.error("Error setting up ElevenLabs agent:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
