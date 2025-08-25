'use client';

import { ComponentType } from 'react';

import CollectionsIcon from '@mui/icons-material/Collections';
import EventIcon from '@mui/icons-material/Event';
import LabelIcon from '@mui/icons-material/Label';
import PlaceIcon from '@mui/icons-material/Place';
import {
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Stack,
  SvgIconProps,
  Typography,
} from '@mui/material';
import Link from 'next/link';

import { PageSection } from '@/core/components/PageSection';

type ManageItem = {
  title: string;
  description: string;
  href: string;
  Icon: ComponentType<SvgIconProps>;
};

const MANAGE_ITEMS: ManageItem[] = [
  {
    title: 'File Library',
    description: 'Upload and browse your media',
    href: '/gallery',
    Icon: CollectionsIcon,
  },
  {
    title: 'Calendar Manager',
    description: 'Add and edit ICS calendars',
    href: '/ics',
    Icon: EventIcon,
  },
  {
    title: 'Tags Manager',
    description: 'Create and organize tags',
    href: '/tags',
    Icon: LabelIcon,
  },
  {
    title: 'Locations & Dates',
    description: 'Plan stays, moves, and trips',
    href: '/location',
    Icon: PlaceIcon,
  },
];

export default function ManagePage() {
  return (
    <PageSection
      title="Manage"
      description="Navigate to manage your files, calendars, tags, and locations"
    >
      <Grid container spacing={2}>
        {MANAGE_ITEMS.map(item => (
          <Grid key={item.href} size={{ mobileSm: 12, mobileMd: 6, tabletSm: 4, laptopSm: 3 }}>
            <Card
              variant="outlined"
              sx={theme => ({
                height: '100%',
                background:
                  theme.palette.mode === 'dark'
                    ? theme.palette.background.paper
                    : theme.palette.background.default,
                ':hover': {
                  borderColor: 'primary.main',
                },
              })}
            >
              <CardActionArea
                component={Link}
                href={`/manage${item.href}`}
                aria-label={`Open ${item.title}`}
                sx={{ height: '100%' }}
              >
                <CardContent>
                  <Stack gap={2}>
                    <item.Icon color="primary" fontSize="large" />
                    <Stack gap={0.5}>
                      <Typography variant="h5">{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </PageSection>
  );
}
