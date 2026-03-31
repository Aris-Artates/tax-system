import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { ref_number, date_received, subject, category, origin, status } =
      body as {
        ref_number: string;
        date_received: string;
        subject: string;
        category: string;
        origin: string;
        status?: string;
      };

    if (!ref_number || !date_received || !subject || !category || !origin) {
      return NextResponse.json(
        { error: "Reference number, date, subject, category, and origin are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("documents")
      .insert({
        ref_number,
        date_received,
        subject,
        category,
        origin,
        status: status || "Received",
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Reference number already exists." },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Document registered successfully.", document: data },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to register document." },
      { status: 500 }
    );
  }
}
