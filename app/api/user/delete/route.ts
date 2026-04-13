import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authorize } from '@/lib/auth-guard';

export async function POST(request: Request) {
  try {
    // 1. Authorize the user (Server-side)
    if (!(await authorize('user', 'can_delete'))) {
      return NextResponse.json({ error: 'Unauthorized: You do not have permission to delete users.' }, { status: 403 });
    }

    const body = await request.json();
    const empID = body.empID;

    if (!empID) {
      return NextResponse.json({ error: 'empID is required.' }, { status: 400 });
    }

    // Use { count: 'exact' } to see how many rows were actually deleted
    const { error, count } = await supabaseAdmin
      .from('users')
      .delete({ count: 'exact' }) 
      .eq('empID', empID);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If count is 0, it means no user was found with that ID
    if (count === 0) {
      return NextResponse.json({ error: 'User not found. No rows deleted.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully.' });
  } catch {
    return NextResponse.json({ error: 'Unable to process request.' }, { status: 500 });
  }
}
