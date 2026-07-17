export const runtime = 'nodejs';

import dbConnect from '@/utils/dbConnection';
import { PDFParse } from 'pdf-parse';
import { Resume } from '@/models/model';
import { cookies } from "next/headers";
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
        return NextResponse.json({
            success: false,
            isAuthenticated: false,
            message: "No session found"
        }, { status: 401 });
    }

    let payload: any = null;
    try {
        payload = jwt.verify(sessionToken, process.env.JWT_SECRET!);
    } catch (err) {
        return NextResponse.json({
            success: false,
            isAuthenticated: false,
            message: "Invalid or expired session"
        }, { status: 401 });
    }

    const userId = payload.userId;

  await dbConnect();
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return Response.json({ error: 'No file uploaded' }, { status: 400 });
  }

  if (file.type !== 'application/pdf') {
    return Response.json({ error: 'File must be a PDF' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();

    try {
        const resume = await Resume.findOneAndUpdate({author: userId},
            {$set: {rawText: result.text, fileName: file.name}}, 
            {new: true, upsert: true}
        )
    } catch (error) {
        return Response.json({ error: 'Failed to upload resume' }, { status: 500 });
    }
    return Response.json({
      text: result.text,
    });
  } catch (err) {
    console.error('PDF parse error:', err);
    return Response.json({ error: 'Failed to parse PDF' }, { status: 500 });
  } finally {
    await parser.destroy();
  }
}