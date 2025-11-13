import { NextRequest, NextResponse } from 'next/server';

import cloudinary from 'src/core/lib/cloudinary';
import type { File as AppFile } from 'src/features/file/types/File';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
): Promise<NextResponse> {
  const { publicId } = await params;
  const rt = request.nextUrl.searchParams.get('resourceType');
  if (!rt || !['image', 'video', 'raw'].includes(rt)) {
    return NextResponse.json(
      { error: 'resourceType must be "image","video" or "raw"' },
      { status: 400 },
    );
  }
  const resourceType = rt as AppFile['resourceType'];
  try {
    const info = await cloudinary.api.resource(publicId, { resource_type: resourceType });
    const createdAt = new Date(info.created_at);
    const file: AppFile = {
      id: info.public_id,
      url: info.secure_url,
      publicId: info.public_id,
      resourceType,
      trashed: false,
      createdAt,
      updatedAt: createdAt,
      isSynced: true,
    };
    return NextResponse.json({ file });
  } catch (err) {
    console.error('Fetch failed', err);
    return NextResponse.json({ error: 'Could not fetch file' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
): Promise<NextResponse> {
  const { publicId } = await params;
  const { newPublicId, resourceType } = (await request.json()) as {
    newPublicId: string;
    resourceType: AppFile['resourceType'];
  };
  if (!newPublicId || !['image', 'video', 'raw'].includes(resourceType)) {
    return NextResponse.json(
      { error: 'newPublicId and valid resourceType required' },
      { status: 400 },
    );
  }
  try {
    const update = await cloudinary.uploader.rename(publicId, newPublicId, {
      resource_type: resourceType,
      type: 'upload',
    });
    const createdAt = new Date(update.created_at);
    const file: AppFile = {
      id: update.public_id,
      url: update.secure_url,
      publicId: update.public_id,
      resourceType,
      trashed: false,
      createdAt,
      updatedAt: new Date(),
      isSynced: true,
    };
    return NextResponse.json({ file });
  } catch (err) {
    console.error('Update failed', err);
    return NextResponse.json({ error: 'Could not update file' }, { status: 500 });
  }
}
