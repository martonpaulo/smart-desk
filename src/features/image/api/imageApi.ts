import axios from 'axios';

import type { CloudinaryImage } from '@/features/image/types/CloudinaryImage';

export async function listImages(): Promise<CloudinaryImage[]> {
  const response = await axios.get('/api/images/list');
  return response.data.images as CloudinaryImage[];
}

export async function uploadImage(file: File): Promise<CloudinaryImage> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post('/api/images/upload', formData);
  return response.data as CloudinaryImage;
}
