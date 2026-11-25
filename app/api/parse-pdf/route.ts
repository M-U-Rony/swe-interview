export const runtime = 'nodejs';

import dbConnect from '@/utils/dbConnection';
import { PDFParse } from 'pdf-parse';
import { Resume } from '@/models/model';
import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { cleanResumeText, findSuspiciousPhrases, MAX_RESUME_CHARS } from '@/lib/resume';

export async function POST(req: Request) {

    const userId = await getUserId();

    if (!userId) {
        return NextResponse.json({
            success: false,
            isAuthenticated: false,
            message: "No session or invalid token"
        }, { status: 401 });
    }

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
    const text = cleanResumeText(result.text);

    if (text.length > MAX_RESUME_CHARS) {
      return Response.json(
        { error: `This resume is too long (${text.length} characters). Please keep it under ${MAX_RESUME_CHARS}.` },
        { status: 400 }
      );
    }

    try {
        await Resume.findOneAndUpdate({author: userId},
            {$set: {rawText: text, fileName: file.name}},
            {new: true, upsert: true}
        )
    } catch {
        return Response.json({ error: 'Failed to upload resume' }, { status: 500 });
    }

    const suspicious = findSuspiciousPhrases(text);
    return Response.json({
      text,
      warning: suspicious.length
        ? `Your resume contains text that looks like instructions to an AI (${suspicious.join(", ")}). The interviewer will ignore it, but you may want to remove it.`
        : null,
    });
  } catch (err) {
    console.error('PDF parse error:', err);
    return Response.json({ error: 'Failed to parse PDF' }, { status: 500 });
  } finally {
    await parser.destroy();
  }
}