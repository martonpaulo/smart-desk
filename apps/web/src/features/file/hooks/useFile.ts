import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileListResponse, fileService } from 'src/features/file/services/fileService';
import { File } from 'src/features/file/types/File';

export function useFiles(resourceType: File['resourceType']) {
  return useInfiniteQuery<
    FileListResponse,
    Error,
    FileListResponse,
    [string, File['resourceType']]
  >({
    queryKey: ['files', resourceType],
    queryFn: ({ pageParam, queryKey }) =>
      fileService.list({ resourceType: queryKey[1], nextCursor: pageParam as string | undefined }),
    getNextPageParam: (last: FileListResponse) => last.nextCursor ?? undefined,
    initialPageParam: undefined,
  });
}

export function useFile(publicId: string | undefined, resourceType: File['resourceType']) {
  return useQuery<
    File | undefined,
    Error,
    File | undefined,
    [string, string | undefined, File['resourceType']]
  >({
    queryKey: ['file', publicId, resourceType],
    queryFn: async () => {
      if (!publicId) return undefined;
      const result = await fileService.get(publicId, resourceType);
      return result.file;
    },
    enabled: !!publicId,
  });
}

// Use the DOM File type for uploads
type UploadFileVariables = { file: globalThis.File; resourceType: File['resourceType'] };
type UploadFileResponse = { file: File };

export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation<UploadFileResponse, Error, UploadFileVariables>({
    mutationFn: ({ file, resourceType }) => fileService.upload(file, resourceType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}

type SaveFileVariables = { file: File };

export function useSaveFile() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, SaveFileVariables>({
    mutationFn: ({ file }) => fileService.add(file),
    onSuccess: () => {
      // Update any components relying on the files query
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}
