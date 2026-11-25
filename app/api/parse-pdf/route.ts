export const runtime = 'nodejs';

import dbConnect from '@/utils/dbConnection';
import { PasswordException, PDFParse } from 'pdf-parse';
import { Resume } from '@/models/model';
import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { cleanResumeText, findSuspiciousPhrases, MAX_RESUME_CHARS } from '@/lib/resume';
import { isPdf, MAX_PDF_BYTES, MAX_PDF_PAGES } from '@/lib/uploads';

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

  // D8 #27: size first, then the file's real content (never its claimed type).
  if (file.size > MAX_PDF_BYTES) {
    return Response.json({ error: 'Resume must be 5 MB or smaller.' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (!isPdf(buffer)) {
    return Response.json({ error: 'File must be a PDF' }, { status: 400 });
  }

  const parser = new PDFParse({ data: buffer });

  try {
    // Only the first pages are read: enough for a resume, and a huge PDF can't tie up the server.
    const result = await parser.getText({ first: MAX_PDF_PAGES });
    const text = cleanResumeText(result.text);

    if (!text) {
      return Response.json(
        { error: 'No readable text found in this PDF (is it a scanned image?). Please upload a text-based PDF.' },
        { status: 400 }
      );
    }

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
    if (err instanceof PasswordException) {
      return Response.json({ error: 'This PDF is password-protected. Please upload an unprotected copy.' }, { status: 400 });
    }
    return Response.json({ error: 'Failed to parse PDF' }, { status: 500 });
  } finally {
    await parser.destroy();
  }
}