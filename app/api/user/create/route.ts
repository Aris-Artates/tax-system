import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authorize, getCurrentUser } from '@/lib/auth-guard';
import { logActivity } from '@/lib/activity-log';

type CreateUserPayload = {
	empID: string;
	username: string;
	firstname: string;
	middlename: string;
	lastname: string;
	suffix: string;
	birthdate: string;
	age: string;
	sex: boolean;
	temp_pass: string;
	password: string;
	emails: string[];
	phones: string[];
	role_id: number;
	department: string;
	position: string;
	status: boolean;
};

function isMissingText(value: unknown) {
	return typeof value !== 'string' || value.trim().length === 0;
}

function isValidBirthdate(value: string) {
	return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function POST(request: Request) {
	try {
		// 1. Authorize the user (Server-side)
		if (!(await authorize('user', 'can_edit'))) {
			return NextResponse.json({ error: 'Unauthorized: You do not have permission to create users.' }, { status: 403 });
		}

		const body = (await request.json()) as Partial<CreateUserPayload>;
		const roleId = Number(body.role_id);
		const primaryEmail = body.emails?.[0];
		const primaryPhone = body.phones?.[0];

		const requiredTextFields: Array<keyof CreateUserPayload> = [
			'empID',
			'username',
			'firstname',
			'lastname',
			'birthdate',
			'age',
			'temp_pass',
			'password',
			'department',
			'position',
		];

		for (const field of requiredTextFields) {
			if (isMissingText(body[field])) {
				return NextResponse.json(
					{ error: `${field} is required.` },
					{ status: 400 },
				);
			}
		}

		if (!primaryEmail) return NextResponse.json({ error: 'Primary email is required.' }, { status: 400 });
		if (!primaryPhone) return NextResponse.json({ error: 'Primary phone is required.' }, { status: 400 });

		if (typeof body.sex !== 'boolean') {
			return NextResponse.json({ error: 'sex is required.' }, { status: 400 });
		}

		if (typeof body.status !== 'boolean') {
			return NextResponse.json({ error: 'status is required.' }, { status: 400 });
		}

		if (!Number.isInteger(roleId) || roleId <= 0) {
			return NextResponse.json({ error: 'role_id is required.' }, { status: 400 });
		}

		const { data: roleData, error: roleError } = await supabaseAdmin
			.from('roles')
			.select('id, name')
			.eq('id', roleId)
			.single();

		if (roleError || !roleData) {
			return NextResponse.json({ error: 'Selected role is invalid.' }, { status: 400 });
		}

		if (!isValidBirthdate(body.birthdate!)) {
			return NextResponse.json(
				{ error: 'birthdate must be in yyyy-mm-dd format.' },
				{ status: 400 },
			);
		}

		// Backend duplicate check for empID and email
		const empID = body.empID!.trim();
		const email = primaryEmail.trim();

		const { data: existingEmpID } = await supabaseAdmin
			.from('users')
			.select('empID')
			.eq('empID', empID)
			.maybeSingle();

		if (existingEmpID) {
			return NextResponse.json(
				{ error: 'Employee ID already exists.' },
				{ status: 409 }
			);
		}

		const { data: existingEmailUser } = await supabaseAdmin
			.from('users')
			.select('email')
			.eq('email', email)
			.maybeSingle();

		if (existingEmailUser) {
			return NextResponse.json(
				{ error: 'Primary email already registered.' },
				{ status: 409 }
			);
		}

		if (body.temp_pass !== body.password) {
			return NextResponse.json(
				{ error: 'temp_pass and password must match.' },
				{ status: 400 },
			);
		}

		const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
			email: email,
			password: body.temp_pass!,
			email_confirm: true,
			user_metadata: {
				empID: empID,
				username: body.username!.trim(),
				firstname: body.firstname!.trim(),
				middlename: body.middlename?.trim() || '',
				lastname: body.lastname!.trim(),
				suffix: body.suffix?.trim() || '',
				birthdate: body.birthdate!.trim(),
				age: body.age!.trim(),
				sex: body.sex,
				mobile_number: primaryPhone.trim(),
				role_id: roleId,
				role: roleData.name,
				department: body.department!.trim(),
				position: body.position!.trim(),
				status: body.status,
			},
		});

		if (authError) {
			return NextResponse.json({ error: authError.message }, { status: 400 });
		}

		const authUserId = authData.user?.id;

		if (!authUserId) {
			return NextResponse.json(
				{ error: 'Auth user creation returned no user id.' },
				{ status: 500 },
			);
		}

		const { data: userData, error: insertError } = await supabaseAdmin.from('users').insert({
			empID: empID,
			username: body.username!.trim(),
			firstname: body.firstname!.trim(),
			middlename: body.middlename?.trim() || '',
			lastname: body.lastname!.trim(),
			suffix: body.suffix?.trim() || '',
			birthdate: body.birthdate!.trim(),
			age: body.age!.trim(),
			sex: body.sex,
			temp_pass: body.temp_pass!,
			password: body.password!,
			email: email,
			mobile_number: primaryPhone.trim(),
			role_id: roleId,
			department: body.department!.trim(),
			position: body.position!.trim(),
			status: body.status,
		}).select('id').single();

		if (insertError) {
			await supabaseAdmin.auth.admin.deleteUser(authUserId);
			return NextResponse.json({ error: insertError.message }, { status: 400 });
		}

		const internalUserId = userData.id;

		// Store extra emails
		if (body.emails && body.emails.length > 0) {
			const extraEmails = body.emails.map((e, idx) => ({
				user_id: internalUserId,
				email: e.trim(),
				is_primary: idx === 0,
			})).filter(e => e.email.length > 0);

			if (extraEmails.length > 0) {
				await supabaseAdmin.from('user_emails').insert(extraEmails);
			}
		}

		// Store extra phone numbers
		if (body.phones && body.phones.length > 0) {
			const subPhones = body.phones.map((p, idx) => ({
				user_id: internalUserId,
				mobile_number: p.trim(),
			})).filter(p => p.mobile_number.length > 0);

			if (subPhones.length > 0) {
				await supabaseAdmin.from('user_mobile_numbers').insert(subPhones);
			}
		}

		const currentUser = await getCurrentUser();
		if (currentUser) {
			await logActivity(
				currentUser.id,
				'CREATE',
				'User Management',
				`Created new user: ${body.firstname} ${body.lastname} (${empID})`
			);
		}

		return NextResponse.json({
			message: 'User created successfully.',
			userId: authUserId,
		});
	} catch (error: any) {
		console.error('Create User Error:', error);
		
		const currentUser = await getCurrentUser();
		if (currentUser) {
			await logActivity(
				currentUser.id,
				'CREATE',
				'User Management',
				`Failed to create user: ${error.message || 'Unknown error'}`,
				'Failed'
			);
		}

		return NextResponse.json(
			{ error: 'Unable to process request.' },
			{ status: 500 },
		);
	}
}
