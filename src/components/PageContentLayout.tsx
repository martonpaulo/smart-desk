import { ReactNode } from 'react';

import { Stack, StackProps, Typography } from '@mui/material';

interface PageContentLayoutProps extends StackProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export function PageContentLayout({
  title,
  description,
  children,
  ...props
}: PageContentLayoutProps) {
  return (
    <Stack gap={2} {...props}>
      <Typography variant="h2">{title}</Typography>

      <Typography variant="subtitle1" color="textSecondary">
        {description}
      </Typography>

      {children}
    </Stack>
  );
}
