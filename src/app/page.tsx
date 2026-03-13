import { Suspense } from 'react';

import { CalendarOverview } from '@/features/calendar/components/calendar-overview';

export default function Home() {
  return (
    <Suspense fallback={null}>
      <CalendarOverview />
    </Suspense>
  );
}
