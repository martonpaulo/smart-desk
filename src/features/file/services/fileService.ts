import axios from 'axios';

import type { File } from '@/features/file/types/File';

export interface FileListResponse {
  files: File[];
  nextCursor: string | null;
}

export const fileService = {
  list: async (opts: {
    resourceType: File['resourceType'];
    perPage?: number;
    nextCursor?: string;
  }): Promise<FileListResponse> => {
    const { resourceType, perPage = 20, nextCursor } = opts;
    const params = new URLSearchParams();
    params.append('resourceType', resourceType);
    params.append('perPage', String(perPage));
    if (nextCursor) params.append('nextCursor', nextCursor);
    const { data } = await axios.get<FileListResponse>('/api/files', { params });
    return data;
  },

  get: async (publicId: string, resourceType: File['resourceType']): Promise<{ file: File }> => {
    const { data } = await axios.get<{ file: File }>(`/api/files/${encodeURIComponent(publicId)}`, {
      params: { resourceType },
    });
    return data;
  },

  upload: async (
    file: globalThis.File,
    resourceType: File['resourceType'],
  ): Promise<{ file: File }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('resourceType', resourceType);
    const { data } = await axios.post<{ file: File }>('/api/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
