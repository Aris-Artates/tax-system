import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
		}

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Define the upload directory
		const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
		
		// Ensure the directory exists
		await fs.mkdir(uploadDir, { recursive: true });

		// Generate a unique filename
		const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
		const filePath = path.join(uploadDir, filename);

		// Write the file
		await fs.writeFile(filePath, buffer);

		// Return the public path
		const publicPath = `/uploads/profiles/${filename}`;

		return NextResponse.json({ path: publicPath });
	} catch (error) {
		console.error('Upload error:', error);
		return NextResponse.json(
			{ error: 'Unable to process upload.' },
			{ status: 500 },
		);
	}
}
