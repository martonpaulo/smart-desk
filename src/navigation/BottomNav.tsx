'use client';

import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';

import { routes } from '@/navigation/routes';

export function BottomNav() {
  const pathname = usePathname(); // current URL path
  const router = useRouter(); // router for client‑side navigation

  // when tab changes, push the new route
  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    router.push(newValue);
  };

  // Filter routes that should be shown on mobile navigation
  const routesToRender = [...routes.primary, ...routes.secondary].filter(
    route => route.showOnMobile,
  );

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation value={pathname} onChange={handleChange} showLabels>
        {routesToRender.map(route => (
          <BottomNavigationAction key={route.href} value={route.href} icon={route.icon} />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
