import { NextRequest, NextResponse } from 'next/server';

import cloudinary from '@/core/lib/cloudinary';
import type { File as AppFile } from '@/features/file/types/File';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rt = searchParams.get('resourceType');
  if (!rt || !['image', 'video', 'raw'].includes(rt)) {
    return NextResponse.json(
      { error: 'resourceType must be "image", "video" or "raw"' },
      { status: 400 },
    );
  }
  const resourceType = rt as AppFile['resourceType'];
  const perPage = parseInt(searchParams.get('perPage') ?? '100', 10);
  const nextCursor = searchParams.get('nextCursor') ?? undefined;

  try {
    const result = await cloudinary.api.resources({
      resource_type: resourceType,
      type: 'upload',
      prefix: 'Smart Desk/',
      max_results: perPage,
      next_cursor: nextCursor,
    });

    interface CloudinaryResource {
      secure_url: string;
      public_id: string;
      created_at: string;
    }

    const files: AppFile[] = result.resources.map((r: CloudinaryResource) => {
      const createdAt = new Date(r.created_at);
      return {
        id: r.public_id,
        url: r.secure_url,
        publicId: r.public_id,
        resourceType,
        trashed: false,
        createdAt,
        updatedAt: createdAt,
        isSynced: true,
      };
    });

    return NextResponse.json({
      files,
      nextCursor: result.next_cursor ?? null,
    });
  } catch (err) {
    console.error('Cloudinary list failed', err);
    return NextResponse.json({ error: 'Could not list files' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const fileData = form.get('file');
  const type = form.get('resourceType');

  if (
    !(fileData instanceof globalThis.File) ||
    typeof type !== 'string' ||
    !['image', 'video', 'raw'].includes(type)
  ) {
    return NextResponse.json(
      { error: 'file and valid resourceType are required' },
      { status: 400 },
    );
  }
  const resourceType = type as AppFile['resourceType'];

  try {
    const buffer = Buffer.from(await fileData.arrayBuffer());
    const dataUri = `data:${fileData.type};base64,${buffer.toString('base64')}`;

    const upload = await cloudinary.uploader.upload(dataUri, {
      resource_type: resourceType,
      folder: 'Smart Desk',
      public_id: fileData.name.replace(/\.[^.]+$/, ''),
    });

    const createdAt = new Date(upload.created_at);
    const file: AppFile = {
      id: upload.public_id,
      url: upload.secure_url,
      publicId: upload.public_id,
      resourceType,
      trashed: false,
      createdAt,
      updatedAt: createdAt,
      isSynced: true,
    };

    return NextResponse.json({ file });
  } catch (err) {
    console.error('Cloudinary upload failed', err);
    return NextResponse.json({ error: 'Could not upload file' }, { status: 500 });
  }
}
