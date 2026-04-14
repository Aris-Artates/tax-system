import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

import { authorize } from '@/lib/auth-guard';

export async function GET(req: NextRequest) {
  try {
    if (!(await authorize('document', 'can_view'))) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }
    const { data, error } = await supabaseAdmin
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ documents: data || [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to retrieve documents." },
      { status: 500 }
    );
  }
}
