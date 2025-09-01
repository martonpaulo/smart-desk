'use client';

import { PageSection } from 'src/core/components/PageSection';
import { FileManager } from 'src/features/file/components/FileManager';

export default function GalleryPage() {
  const handleSelect = (url: string) => {
    console.log('Selected file:', url);
  };

  return (
    <PageSection
      title="File Library"
      description="Upload new files or browse and manage your existing Cloudinary media"
    >
      <FileManager onSelectAction={handleSelect} />
    </PageSection>
  );
}
