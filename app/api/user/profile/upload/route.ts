import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
		}

		// Convert the file to a Buffer/ArrayBuffer for uploading
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Generate a unique filename
		const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
		const filePath = `uploads/profiles/${filename}`;

		// Upload the file to Supabase Storage
		const { data, error: uploadError } = await supabaseAdmin.storage
			.from('profiles')
			.upload(filePath, buffer, {
				contentType: file.type,
				upsert: true,
			});

		if (uploadError) {
			console.error('Supabase upload error:', uploadError);
			throw new Error('Supabase upload failed');
		}

		// Get the public URL of the uploaded image
		const { data: publicUrlData } = supabaseAdmin.storage
			.from('profiles')
			.getPublicUrl(filePath);

		return NextResponse.json({ path: publicUrlData.publicUrl });
	} catch (error) {
		console.error('Upload error:', error);
		return NextResponse.json(
			{ error: 'Unable to process upload.' },
			{ status: 500 },
		);
	}
}
