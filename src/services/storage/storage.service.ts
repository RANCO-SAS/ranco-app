import { getSupabaseClient } from '@/services/supabase/client';

const AVATARS_BUCKET = 'avatars';
const CHAT_MEDIA_BUCKET = 'chat-media';

type UploadImageInput = {
  bucket: typeof AVATARS_BUCKET | typeof CHAT_MEDIA_BUCKET;
  path: string;
  uri: string;
  contentType?: string;
};

function resolveContentType(uri: string, contentType?: string): string {
  if (contentType) {
    return contentType;
  }

  if (uri.endsWith('.png')) {
    return 'image/png';
  }

  if (uri.endsWith('.webp')) {
    return 'image/webp';
  }

  return 'image/jpeg';
}

async function uploadImage(input: UploadImageInput): Promise<string> {
  const supabase = getSupabaseClient();
  const response = await fetch(input.uri);

  if (!response.ok) {
    throw new Error('No pudimos leer la imagen seleccionada.');
  }

  const blob = await response.blob();
  const contentType = resolveContentType(input.uri, input.contentType);

  const { error } = await supabase.storage.from(input.bucket).upload(input.path, blob, {
    contentType,
    upsert: true,
  });

  if (error) {
    throw error;
  }

  if (input.bucket === AVATARS_BUCKET) {
    const { data } = supabase.storage.from(input.bucket).getPublicUrl(input.path);
    return data.publicUrl;
  }

  const { data, error: signedUrlError } = await supabase.storage
    .from(input.bucket)
    .createSignedUrl(input.path, 60 * 60 * 24 * 7);

  if (signedUrlError || !data?.signedUrl) {
    throw signedUrlError ?? new Error('No pudimos generar la URL de la imagen.');
  }

  return data.signedUrl;
}

async function uploadAvatar(userId: string, uri: string): Promise<string> {
  const extension = uri.endsWith('.png') ? 'png' : uri.endsWith('.webp') ? 'webp' : 'jpg';

  return uploadImage({
    bucket: AVATARS_BUCKET,
    path: `${userId}/avatar.${extension}`,
    uri,
  });
}

async function uploadChatImage(conversationId: string, uri: string): Promise<string> {
  const extension = uri.endsWith('.png') ? 'png' : uri.endsWith('.webp') ? 'webp' : 'jpg';
  const fileName = `${Date.now()}.${extension}`;

  return uploadImage({
    bucket: CHAT_MEDIA_BUCKET,
    path: `${conversationId}/${fileName}`,
    uri,
  });
}

export const storageService = {
  uploadAvatar,
  uploadChatImage,
};
