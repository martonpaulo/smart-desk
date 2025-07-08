import type { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';

export async function getSessionFromRequest(req: NextRequest) {
  // Hack to convert NextRequest to a format getServerSession accepts
  const request = {
    headers: Object.fromEntries(req.headers.entries()),
  } as unknown as NextApiRequest;

  const response = {} as NextApiResponse;

  return await getServerSession(request, response, authOptions);
}
