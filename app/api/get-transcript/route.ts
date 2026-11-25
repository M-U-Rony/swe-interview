import { Interview } from '@/models/model';
import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { env } from '@/lib/env';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }


  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
      {
        headers: {
          'xi-api-key': env().ELEVENLABS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch from ElevenLabs: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    let dialogue = [];

    if (data.transcript && data.transcript.length > 0) {
      dialogue = data.transcript.map((item: any) => ({
        role: item.role,
        message: item.message,
        time_in_call_secs: item.time_in_call_secs
      }));
    } 

    else {
      const historyStr = data.conversation_initiation_client_data?.dynamic_variables?.system__conversation_history;
      if (historyStr) {
        try {
          const parsedHistory = JSON.parse(historyStr);
          dialogue = parsedHistory.entries || [];
        } catch (parseErr) {
          console.error("Failed to parse system__conversation_history:", parseErr);
        }
      }
    }

    // save transcript to db

    await Interview.create({
        user: userId,
        transcript: JSON.stringify(dialogue),
        conversationId: conversationId
    })
    
    return NextResponse.json({ 
      success: true,
    });
  } catch (error: any) {
    console.error("Error fetching transcript:", error);
    return NextResponse.json(
      { error: 'Failed to retrieve transcript', details: error.message },
      { status: 500 }
    );
  }
}
