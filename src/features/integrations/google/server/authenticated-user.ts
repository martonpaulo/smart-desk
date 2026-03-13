import type { NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase-server';

const AUTHORIZATION_HEADER = 'authorization';
const BEARER_PREFIX = 'Bearer ';

function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get(AUTHORIZATION_HEADER);
  return authHeader?.startsWith(BEARER_PREFIX) ? authHeader.slice(BEARER_PREFIX.length) : null;
}

export async function getAuthenticatedUser(request: NextRequest): Promise<{ id: string } | null> {
  const token = getBearerToken(request);
  if (!token) {
    return null;
  }

  const supabase = createAdminClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return { id: user.id };
}
