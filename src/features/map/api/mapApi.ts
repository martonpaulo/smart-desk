import { getSupabaseClient } from '@/legacy/lib/supabaseClient';

/** Uploads a map file (image or GeoJSON) to Supabase Storage and returns the public URL. */
export async function uploadMapFile(file: File): Promise<string> {
  const supabase = getSupabaseClient();
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage.from('maps').upload(fileName, file, {
    upsert: false,
  });
  if (error) throw error;
  const { data: publicUrlData } = supabase.storage.from('maps').getPublicUrl(data.path);
  return publicUrlData.publicUrl;
}
