import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type DelinquentTaxpayer = {
  id: number;
  full_name: string;
  tin: string;
  barangay_name: string;
  property_count: number;
  bucket: "Current" | "1 Year" | "2 Years" | "3 Years" | "5+ Years";
  total_due: string;
  years_due: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get params from URL
    const search = searchParams.get("search")?.toLowerCase() || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Fetch taxpayers with their declarations and barangay
    let query = supabaseAdmin
      .from('taxpayers')
      .select(`
        id,
        owner_name,
        tin,
        barangays (name),
        tax_declarations (
          id,
          total_assessed_value,
          effectivity_year,
          status
        )
      `)
      .eq('tax_declarations.status', 'Active'); // Only consider active declarations as potentially delinquent

    const { data: taxpayers, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const currentYear = 2026;

    // Filter and Map the data
    const allDelinquents: DelinquentTaxpayer[] = (taxpayers ?? [])
      .filter((t: any) => t.tax_declarations && t.tax_declarations.length > 0)
      .map((t: any) => {
        const declarations = t.tax_declarations;
        const totalAssessedValue = declarations.reduce((sum: number, decl: any) => sum + (decl.total_assessed_value || 0), 0);
        const oldestYear = Math.min(...declarations.map((decl: any) => decl.effectivity_year || currentYear));
        const diff = currentYear - oldestYear;

        let bucket: DelinquentTaxpayer["bucket"] = "Current";
        if (diff >= 5) bucket = "5+ Years";
        else if (diff === 3) bucket = "3 Years";
        else if (diff === 2) bucket = "2 Years";
        else if (diff === 1) bucket = "1 Year";

        const barangayName = Array.isArray(t.barangays) ? t.barangays[0]?.name : t.barangays?.name;

        return {
          id: t.id,
          full_name: t.owner_name,
          tin: t.tin || "N/A",
          barangay_name: barangayName || "Unknown",
          property_count: declarations.length,
          bucket,
          total_due: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(totalAssessedValue),
          years_due: oldestYear === currentYear ? `${currentYear}` : `${oldestYear}-${currentYear}`,
        };
      })
      .filter((d) => 
        d.full_name.toLowerCase().includes(search) ||
        d.tin.toLowerCase().includes(search) ||
        d.barangay_name.toLowerCase().includes(search)
      );

    // Paginate in memory (since we have to filter/calculate some things that are hard to do in a single Supabase query without a view)
    const totalItems = allDelinquents.length;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;
    const paginatedData = allDelinquents.slice(offset, offset + limit);

    const payloadString = JSON.stringify({
      data: paginatedData,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
      },
    });

    const l1 = Buffer.from(payloadString).toString("base64");
    const l2 = Buffer.from(l1).toString("base64");
    const obscuredPayload = Buffer.from(l2).toString("base64");

    return NextResponse.json({ _data: obscuredPayload });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unable to load delinquents.' },
      { status: 500 },
    );
  }
}