'use client';

import { Typography } from '@mui/material';

import { PageSection } from '@/core/components/PageSection';

export function TagsManagerView() {
  return (
    <PageSection title="Tags Manager" description="Manage your tags here">
      <Typography variant="h6">Tags</Typography>
    </PageSection>
  );
}
