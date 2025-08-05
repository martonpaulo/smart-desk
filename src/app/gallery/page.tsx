'use client';

import { PageSection } from '@/core/components/PageSection';
import { CloudinaryImageManager } from '@/features/image/components/CloudinaryImageManager';

export default function GalleryPage() {
  const handleSelect = (url: string) => {
    console.log('Selected image:', url);
  };

  return (
    <PageSection
      title="Image Library"
      description="Upload new images or browse and manage your existing Cloudinary media"
    >
      <CloudinaryImageManager onSelect={handleSelect} />
    </PageSection>
  );
}
