import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryResource {
  secure_url: string;
  public_id: string;
}

export async function GET() {
  try {
    const result = (await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'image',
      prefix: 'Smart Desk/',
      max_results: 100,
    })) as { resources: CloudinaryResource[] };

    const images = result.resources.map(resource => ({
      url: resource.secure_url,
      publicId: resource.public_id,
    }));

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Cloudinary list failed', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}
