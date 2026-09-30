import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '../../../../lib/auth';
import { connectDB } from '../../../../lib/db';
import Submission from '../../../../lib/model';
import { sanitizeSubmission, validateSevaDates } from '../../../../lib/submission';

async function isAdmin() {
  const token = cookies().get('admin_token')?.value;
  return verifyAdminToken(token || '');
}

export async function GET(req, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const d = await Submission.findById(params.id).lean();
  if (!d) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(d);
}

export async function PUT(req, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = sanitizeSubmission(await req.json());

    const dateError = validateSevaDates(data);
    if (dateError) return NextResponse.json({ error: dateError }, { status: 400 });

    await connectDB();
    const d = await Submission.findByIdAndUpdate(params.id, { $set: data }, { new: true, runValidators: true }).lean();
    if (!d) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ ok: true, id: d._id });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Unable to update form' }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const d = await Submission.findByIdAndDelete(params.id);
    if (!d) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Unable to delete form' }, { status: 400 });
  }
}
