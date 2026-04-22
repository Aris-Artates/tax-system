import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authorize, getCurrentUser } from '@/lib/auth-guard';
import { logActivity } from '@/lib/activity-log';

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

    const currentUser = await getCurrentUser();

    if (error) {
      if (currentUser) {
        await logActivity(currentUser.id, 'DELETE', 'User Management', `Failed to delete user (${empID}): ${error.message}`, 'Failed');
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If count is 0, it means no user was found with that ID
    if (count === 0) {
      if (currentUser) {
        await logActivity(currentUser.id, 'DELETE', 'User Management', `Failed to delete user: User with empID ${empID} not found.`, 'Failed');
      }
      return NextResponse.json({ error: 'User not found. No rows deleted.' }, { status: 404 });
    }

    if (currentUser) {
      await logActivity(currentUser.id, 'DELETE', 'User Management', `Deleted user with empID: ${empID}`);
    }

    return NextResponse.json({ message: 'User deleted successfully.' });
  } catch (err: any) {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await logActivity(currentUser.id, 'DELETE', 'User Management', `Error deleting user: ${err.message || 'Unknown error'}`, 'Failed');
    }
    return NextResponse.json({ error: 'Unable to process request.' }, { status: 500 });
  }
}
