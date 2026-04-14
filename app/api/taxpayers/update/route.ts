import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type UpdateTaxpayerPayload = {
  id: number | string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  owner_name?: string;
  tin?: string;
  owner_type: string;
  barangay_id?: number | string;
  address_details?: string;
  address?: string;
  phone?: string;
  email?: string;
};

type BarangayRecord = { name: string };

const ALLOWED_OWNER_TYPES = ['Individual', 'Corporate', 'Corporation', 'Government'] as const;

const TIN_PATTERN = /^\d{3}-\d{3}-\d{3}(-\d{3})?$/;
const PHONE_PATTERN = /^[1-9]\d{2} \d{3} \d{4}$/;
const EMAIL_PATTERN = /^.+@.+\..+$/;
import { authorize } from '@/lib/auth-guard';

export async function PUT(req: NextRequest) {
  try {
    if (!(await authorize('taxpayers', 'can_edit'))) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }
    const body = (await req.json()) as Partial<UpdateTaxpayerPayload>;

    const rawId = body.id;
    const id = typeof rawId === 'string' ? rawId.trim() : rawId;
    const firstName = body.first_name?.trim() ?? '';
    const middleName = body.middle_name?.trim() ?? '';
    const lastName = body.last_name?.trim() ?? '';
    const suffix = body.suffix?.trim() ?? '';
    const ownerType = body.owner_type?.trim() ?? '';
    const addressDetails = body.address_details?.trim() ?? body.address?.trim() ?? '';
    const tin = body.tin?.trim() ?? '';
    const phone = body.phone?.trim() ?? '';
    const email = body.email?.trim() ?? '';
    const rawBarangayId = body.barangay_id;
    const normalizedBarangayId =
      rawBarangayId == null || rawBarangayId === ''
        ? null
        : Number(rawBarangayId);

    const hasInvalidId =
      (typeof id !== 'string' && typeof id !== 'number') ||
      (typeof id === 'string' && id.length === 0) ||
      (typeof id === 'number' && !Number.isFinite(id));

    if (hasInvalidId) {
      return NextResponse.json({ error: 'Taxpayer ID is required.' }, { status: 400 });
    }

    if (!firstName || !lastName || !ownerType || !addressDetails) {
      return NextResponse.json(
        {
          error:
            'First name, last name, owner type, and address details are required.',
        },
        { status: 400 },
      );
    }

    if (
      normalizedBarangayId !== null &&
      (!Number.isInteger(normalizedBarangayId) || normalizedBarangayId <= 0)
    ) {
      return NextResponse.json({ error: 'Invalid barangay.' }, { status: 400 });
    }

    if (!ALLOWED_OWNER_TYPES.includes(ownerType as (typeof ALLOWED_OWNER_TYPES)[number])) {
      return NextResponse.json({ error: 'Invalid owner type.' }, { status: 400 });
    }

    if (tin && !TIN_PATTERN.test(tin)) {
      return NextResponse.json({ error: 'Invalid TIN format.' }, { status: 400 });
    }

    if (phone && !PHONE_PATTERN.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone format.' }, { status: 400 });
    }

    if (email && !EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }

    // Keep compatibility with existing values and create endpoint normalization.
    const normalizedOwnerType = ownerType === 'Corporate' ? 'Corporation' : ownerType;
    const ownerName = [firstName, middleName, lastName, suffix]
      .filter(Boolean)
      .join(' ');

    const updatePayload: Record<string, unknown> = {
      owner_name: ownerName,
      first_name: firstName,
      middle_name: middleName || null,
      last_name: lastName,
      suffix: suffix || null,
      tin: tin || null,
      owner_type: normalizedOwnerType,
      address_details: addressDetails,
      phone: phone || null,
      email: email || null,
    };

    if (normalizedBarangayId !== null) {
      updatePayload.barangay_id = normalizedBarangayId;
    }

    const { data, error } = await supabaseAdmin
      .from('taxpayers')
      .update(updatePayload)
      .eq('id', id)
      .select(
        'id, owner_name, first_name, middle_name, last_name, suffix, tin, owner_type, status, phone, email, address_details, barangay_id, barangays(name)',
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const barangayRecord = Array.isArray(data?.barangays)
      ? (data?.barangays[0] as BarangayRecord | undefined)
      : (data?.barangays as BarangayRecord | null | undefined);
    const formattedTaxpayer = {
      ...data,
      address:
        [data?.address_details?.trim() || '', barangayRecord?.name?.trim() || '']
          .filter(Boolean)
          .join(', ') || null,
    };

    return NextResponse.json({ message: 'Taxpayer updated successfully.', taxpayer: formattedTaxpayer });
  } catch {
    return NextResponse.json({ error: 'Unable to update taxpayer.' }, { status: 500 });
  }
}
