'use client';

import { useEffect } from 'react';

import { usePathname } from 'next/navigation';

import { PageContentLayout } from '@/components/PageContentLayout';

export default function Page() {
  const pathname = usePathname();

  useEffect(() => {
    // This effect runs when the component mounts or pathname changes
    console.log('Current pathname:', pathname);
  }, [pathname]);

  return (
    <PageContentLayout title="Calendar Date">
      <h1>Calendar Page</h1>
      <p>Current Path: {pathname}</p>
    </PageContentLayout>
  );
}
