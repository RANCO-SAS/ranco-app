import { File } from 'expo-file-system';

import { devError, devLog, devWarn } from '@/lib/dev-logger';
import { getSupabaseClient } from '@/services/supabase/client';
import { withImageCacheBuster } from '@/shared/utils/image-uri';

const AVATARS_BUCKET = 'avatars';
const CHAT_MEDIA_BUCKET = 'chat-media';
const WORK_EVIDENCE_BUCKET = 'work-evidence';
const REQUEST_PHOTOS_BUCKET = 'request-photos';
const MAX_REVIEW_EVIDENCE_IMAGES = 3;
const MAX_REQUEST_PHOTOS = 5;

type StorageBucket =
  | typeof AVATARS_BUCKET
  | typeof CHAT_MEDIA_BUCKET
  | typeof WORK_EVIDENCE_BUCKET
  | typeof REQUEST_PHOTOS_BUCKET;

type UploadImageInput = {
  bucket: StorageBucket;
  path: string;
  uri: string;
  contentType?: string;
  upsert?: boolean;
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

function resolveFileExtension(uri: string): 'png' | 'webp' | 'jpg' {
  if (uri.endsWith('.png')) {
    return 'png';
  }

  if (uri.endsWith('.webp')) {
    return 'webp';
  }

  return 'jpg';
}

function extractStoragePath(publicUrl: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;

  if (!publicUrl.includes(marker)) {
    return null;
  }

  const path = publicUrl.split(marker)[1]?.split('?')[0];
  return path ? decodeURIComponent(path) : null;
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

async function deleteStorageObjects(bucket: StorageBucket, paths: string[]): Promise<void> {
  if (paths.length === 0) {
    return;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from(bucket).remove(paths);

  if (error) {
    devWarn('storage', 'deleteStorageObjects:failed', { bucket, pathCount: paths.length });
  }
}

async function deleteAvatarFiles(userId: string, keepPath?: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { data: files, error } = await supabase.storage.from(AVATARS_BUCKET).list(userId);

  if (error) {
    devWarn('storage', 'deleteAvatarFiles:list-failed');
    return;
  }

  const pathsToDelete =
    files?.map((file) => `${userId}/${file.name}`).filter((path) => path !== keepPath) ?? [];

  await deleteStorageObjects(AVATARS_BUCKET, pathsToDelete);
}

async function deletePreviousAvatarUrl(previousAvatarUrl?: string | null): Promise<void> {
  if (!previousAvatarUrl) {
    return;
  }

  const path = extractStoragePath(previousAvatarUrl, AVATARS_BUCKET);

  if (!path) {
    return;
  }

  await deleteStorageObjects(AVATARS_BUCKET, [path]);
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
    upsert: input.upsert ?? true,
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

  if (input.bucket === AVATARS_BUCKET || input.bucket === WORK_EVIDENCE_BUCKET || input.bucket === REQUEST_PHOTOS_BUCKET) {
    const { data } = supabase.storage.from(input.bucket).getPublicUrl(input.path);
    const publicUrl = withImageCacheBuster(data.publicUrl);
    devLog('storage', 'uploadImage:public-url', { urlPreview: publicUrl.slice(0, 120) });
    return publicUrl;
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

async function uploadAvatar(
  userId: string,
  uri: string,
  previousAvatarUrl?: string | null,
): Promise<string> {
  devLog('storage', 'uploadAvatar:start', { userId, uriScheme: getUriScheme(uri) });

  const extension = resolveFileExtension(uri);
  const nextPath = `${userId}/avatar-${Date.now()}.${extension}`;

  await deleteAvatarFiles(userId, nextPath);
  await deletePreviousAvatarUrl(previousAvatarUrl);

  return uploadImage({
    bucket: AVATARS_BUCKET,
    path: nextPath,
    uri,
  });
}

async function uploadChatImage(conversationId: string, uri: string): Promise<string> {
  devLog('storage', 'uploadChatImage:start', {
    conversationId,
    uriScheme: getUriScheme(uri),
  });

  const extension = resolveFileExtension(uri);
  const fileName = `${Date.now()}.${extension}`;

  return uploadImage({
    bucket: CHAT_MEDIA_BUCKET,
    path: `${conversationId}/${fileName}`,
    uri,
  });
}

async function uploadReviewEvidence(
  userId: string,
  reviewId: string,
  uri: string,
  index: number,
): Promise<string> {
  const extension = resolveFileExtension(uri);
  const path = `${userId}/${reviewId}/${Date.now()}-${index}.${extension}`;

  return uploadImage({
    bucket: WORK_EVIDENCE_BUCKET,
    path,
    uri,
  });
}

async function deleteReviewEvidenceUrls(urls: string[]): Promise<void> {
  const paths = urls
    .map((url) => extractStoragePath(url, WORK_EVIDENCE_BUCKET))
    .filter((path): path is string => Boolean(path));

  await deleteStorageObjects(WORK_EVIDENCE_BUCKET, paths);
}

async function uploadRequestPhoto(
  clientId: string,
  requestId: string,
  uri: string,
  index: number,
): Promise<string> {
  const extension = resolveFileExtension(uri);
  const path = `${clientId}/${requestId}/${Date.now()}-${index}.${extension}`;

  return uploadImage({
    bucket: REQUEST_PHOTOS_BUCKET,
    path,
    uri,
  });
}

async function deleteRequestPhotoUrls(urls: string[]): Promise<void> {
  const paths = urls
    .map((url) => extractStoragePath(url, REQUEST_PHOTOS_BUCKET))
    .filter((path): path is string => Boolean(path));

  await deleteStorageObjects(REQUEST_PHOTOS_BUCKET, paths);
}

export const storageService = {
  uploadAvatar,
  uploadChatImage,
  uploadReviewEvidence,
  uploadRequestPhoto,
  deleteReviewEvidenceUrls,
  deleteRequestPhotoUrls,
  maxReviewEvidenceImages: MAX_REVIEW_EVIDENCE_IMAGES,
  maxRequestPhotos: MAX_REQUEST_PHOTOS,
};
