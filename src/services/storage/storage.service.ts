import { File } from 'expo-file-system';

import { devError, devLog, devWarn } from '@/lib/dev-logger';
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

function getUriScheme(uri: string): string {
  const match = uri.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  return match?.[1] ?? 'unknown';
}

async function readUriAsArrayBuffer(uri: string): Promise<ArrayBuffer> {
  devLog('storage', 'readUriAsArrayBuffer:start', {
    scheme: getUriScheme(uri),
    uriPreview: uri.slice(0, 120),
  });

  try {
    const file = new File(uri);
    const info = file.info();

    devLog('storage', 'readUriAsArrayBuffer:file-info', {
      exists: info.exists,
      size: info.size ?? null,
      uri: info.uri ?? uri.slice(0, 120),
    });

    if (!info.exists) {
      throw new Error('El archivo de imagen no existe o no es accesible.');
    }

    const buffer = await file.arrayBuffer();

    devLog('storage', 'readUriAsArrayBuffer:success', {
      byteLength: buffer.byteLength,
    });

    return buffer;
  } catch (error) {
    devError('storage', 'readUriAsArrayBuffer:failed', error, { uriPreview: uri.slice(0, 120) });
    throw error;
  }
}

async function uploadImage(input: UploadImageInput): Promise<string> {
  const supabase = getSupabaseClient();
  const contentType = resolveContentType(input.uri, input.contentType);

  devLog('storage', 'uploadImage:start', {
    bucket: input.bucket,
    path: input.path,
    contentType,
    uriScheme: getUriScheme(input.uri),
  });

  let body: ArrayBuffer;

  try {
    body = await readUriAsArrayBuffer(input.uri);
  } catch (error) {
    devWarn('storage', 'uploadImage:fallback-fetch-blob');

    const response = await fetch(input.uri);

    if (!response.ok) {
      devError('storage', 'uploadImage:fetch-failed', error, {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error('No pudimos leer la imagen seleccionada.');
    }

    body = await response.arrayBuffer();
    devLog('storage', 'uploadImage:fallback-fetch-success', { byteLength: body.byteLength });
  }

  if (body.byteLength === 0) {
    throw new Error('La imagen seleccionada está vacía.');
  }

  const { data: uploadData, error } = await supabase.storage.from(input.bucket).upload(input.path, body, {
    contentType,
    upsert: true,
  });

  if (error) {
    devError('storage', 'uploadImage:supabase-upload-failed', error, {
      bucket: input.bucket,
      path: input.path,
    });
    throw error;
  }

  devLog('storage', 'uploadImage:supabase-upload-success', {
    bucket: input.bucket,
    path: uploadData?.path ?? input.path,
  });

  if (input.bucket === AVATARS_BUCKET) {
    const { data } = supabase.storage.from(input.bucket).getPublicUrl(input.path);
    devLog('storage', 'uploadImage:public-url', { urlPreview: data.publicUrl.slice(0, 120) });
    return data.publicUrl;
  }

  const { data, error: signedUrlError } = await supabase.storage
    .from(input.bucket)
    .createSignedUrl(input.path, 60 * 60 * 24 * 7);

  if (signedUrlError || !data?.signedUrl) {
    devError('storage', 'uploadImage:signed-url-failed', signedUrlError ?? new Error('missing signed url'), {
      bucket: input.bucket,
      path: input.path,
    });
    throw signedUrlError ?? new Error('No pudimos generar la URL de la imagen.');
  }

  devLog('storage', 'uploadImage:signed-url-success', {
    urlPreview: data.signedUrl.slice(0, 120),
  });

  return data.signedUrl;
}

async function uploadAvatar(userId: string, uri: string): Promise<string> {
  devLog('storage', 'uploadAvatar:start', { userId, uriScheme: getUriScheme(uri) });

  const extension = uri.endsWith('.png') ? 'png' : uri.endsWith('.webp') ? 'webp' : 'jpg';

  return uploadImage({
    bucket: AVATARS_BUCKET,
    path: `${userId}/avatar.${extension}`,
    uri,
  });
}

async function uploadChatImage(conversationId: string, uri: string): Promise<string> {
  devLog('storage', 'uploadChatImage:start', {
    conversationId,
    uriScheme: getUriScheme(uri),
  });

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
