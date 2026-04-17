import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

import { authorize } from "@/lib/auth-guard";

export async function GET() {
  try {
    if (!(await authorize('property', 'can_view'))) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }
    const { data, error } = await supabaseAdmin
      .from("tax_declarations")
      .select(
        `
        id,
        property_id,
        td_number,
        classification,
        land_area,
        total_market_value,
        land_assessment_level,
        total_assessed_value,
        status,
        taxpayers ( owner_name ),
        properties ( pin, barangays ( name ) )
      `,
      )
      .order("id", { ascending: false })
      .limit(5000);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const payloadString = JSON.stringify(data ?? []);
    const l1 = Buffer.from(payloadString).toString("base64");
    const l2 = Buffer.from(l1).toString("base64");
    const obscuredPayload = Buffer.from(l2).toString("base64");
    return NextResponse.json({ _data: obscuredPayload });
  } catch {
    return NextResponse.json(
      { error: "Unable to load property listing." },
      { status: 500 },
    );
  }
}
