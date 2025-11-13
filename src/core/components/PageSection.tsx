import { Stack, StackProps, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { appMetadata } from 'src/legacy/config/seo';

export const metadata = appMetadata;

interface PageContentLayoutProps extends StackProps {
  title: string;
  hideTitle?: boolean;
  description?: string;
  hideDescription?: boolean;
  children: ReactNode;
}

export function PageSection({
  title,
  hideTitle = false,
  description = metadata.description || undefined,
  hideDescription = false,
  children,
  ...props
}: PageContentLayoutProps) {
  return (
    <>
      <title>{`${title} | Smart Desk`}</title>
      <meta name="description" content={description} />

      <Stack gap={2} {...props}>
        {!hideTitle && <Typography variant="h2">{title}</Typography>}

        {description && !hideDescription && (
          <Typography variant="subtitle1" color="textSecondary">
            {description}
          </Typography>
        )}

        {children}
      </Stack>
    </>
  );
}
