import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import Submission from '../../../lib/model';
import { sanitizeSubmission, validateSevaDates } from '../../../lib/submission';

export async function POST(req) {
  try {
    const data = sanitizeSubmission(await req.json());

    const dateError = validateSevaDates(data);
    if (dateError) return NextResponse.json({ error: dateError }, { status: 400 });

    await connectDB();
    const doc = await Submission.create(data);
    return NextResponse.json({ ok: true, id: doc._id });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Unable to save form' }, { status: 400 });
  }
}
