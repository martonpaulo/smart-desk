'use client';

import Link from 'next/link';

import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import { Button, Stack, Typography } from '@mui/material';

export default function NotFoundPage() {
  return (
    <Stack
      component="main"
      spacing={2}
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: '100vh',
        textAlign: 'center',
        p: 2,
      }}
    >
      <SentimentDissatisfiedIcon color="primary" fontSize="large" aria-hidden />

      <Typography variant="h4" component="h1">
        Oops! This page doesn&apos;t exist
      </Typography>

      <Button component={Link as React.ElementType} href="/" variant="contained">
        Go back home
      </Button>
    </Stack>
  );
}
