import { ReactNode } from 'react';

import { Stack, StackProps, Typography } from '@mui/material';

import { appMetadata } from '@/config/seo';

export const metadata = appMetadata;

interface PageContentLayoutProps extends StackProps {
  title?: string;
  hideTitleLabel?: boolean;
  description?: string;
  children: ReactNode;
}

export function PageContentLayout({
  title,
  hideTitleLabel = false,
  description,
  children,
  ...props
}: PageContentLayoutProps) {
  return (
    <>
      <title>{`${title} | Smart Desk`}</title>

      <Stack gap={2} {...props}>
        {!hideTitleLabel && <Typography variant="h2">{title}</Typography>}

        {description && (
          <Typography variant="subtitle1" color="textSecondary">
            {description}
          </Typography>
        )}

        {children}
      </Stack>
    </>
  );
}
