import { File } from 'expo-file-system';

import { devError, devLog, devWarn } from '@/lib/dev-logger';
import { apiDelete, apiUpload } from '@/services/api/client';
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
  uri: string;
  contentType?: string;
  fileName?: string;
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

function resolveFileName(uri: string, fileName?: string): string {
  if (fileName) {
    return fileName;
  }

  return `upload-${Date.now()}.${resolveFileExtension(uri)}`;
}

async function assertUriReadable(uri: string): Promise<void> {
  devLog('storage', 'assertUriReadable:start', {
    scheme: getUriScheme(uri),
    uriPreview: uri.slice(0, 120),
  });

  try {
    const file = new File(uri);
    const info = file.info();

    if (!info.exists) {
      throw new Error('El archivo de imagen no existe o no es accesible.');
    }
  } catch (error) {
    devError('storage', 'assertUriReadable:failed', error, { uriPreview: uri.slice(0, 120) });
    throw error;
  }
}

async function uploadImage(input: UploadImageInput): Promise<string> {
  const contentType = resolveContentType(input.uri, input.contentType);
  const fileName = resolveFileName(input.uri, input.fileName);

  devLog('storage', 'uploadImage:start', {
    bucket: input.bucket,
    contentType,
    uriScheme: getUriScheme(input.uri),
  });

  await assertUriReadable(input.uri);

  const formData = new FormData();
  formData.append('file', {
    uri: input.uri,
    name: fileName,
    type: contentType,
  } as unknown as Blob);

  const response = await apiUpload<{ url: string }>(`/v1/app/storage/${input.bucket}`, formData);
  const publicUrl = withImageCacheBuster(response.url);

  devLog('storage', 'uploadImage:success', { urlPreview: publicUrl.slice(0, 120) });
  return publicUrl;
}

function extractStoragePath(publicUrl: string, bucket: StorageBucket): string | null {
  try {
    const pathname = new URL(publicUrl.split('?')[0]).pathname;
    const segments = pathname.split('/').filter(Boolean);
    const bucketIndex = segments.indexOf(bucket);

    if (bucketIndex === -1) {
      return null;
    }

    return segments.slice(bucketIndex + 1).join('/');
  } catch {
    return null;
  }
}

async function deleteStorageObjects(bucket: StorageBucket, urls: string[]): Promise<void> {
  for (const url of urls) {
    const path = extractStoragePath(url, bucket);

    if (!path) {
      devWarn('storage', 'delete:invalid-url', { bucket, urlPreview: url.slice(0, 120) });
      continue;
    }

    try {
      await apiDelete(`/v1/app/storage/${bucket}/${path}`);
      devLog('storage', 'delete:success', { bucket, path });
    } catch (error) {
      devWarn('storage', 'delete:failed', { bucket, path, error });
    }
  }
}

async function uploadAvatar(
  userId: string,
  uri: string,
  _previousAvatarUrl?: string | null,
): Promise<string> {
  devLog('storage', 'uploadAvatar:start', { userId, uriScheme: getUriScheme(uri) });

  const extension = resolveFileExtension(uri);

  return uploadImage({
    bucket: AVATARS_BUCKET,
    uri,
    fileName: `avatar-${Date.now()}.${extension}`,
  });
}

async function uploadChatImage(conversationId: string, uri: string): Promise<string> {
  devLog('storage', 'uploadChatImage:start', {
    conversationId,
    uriScheme: getUriScheme(uri),
  });

  const extension = resolveFileExtension(uri);

  return uploadImage({
    bucket: CHAT_MEDIA_BUCKET,
    uri,
    fileName: `${Date.now()}.${extension}`,
  });
}

async function uploadReviewEvidence(
  userId: string,
  reviewId: string,
  uri: string,
  index: number,
): Promise<string> {
  const extension = resolveFileExtension(uri);

  return uploadImage({
    bucket: WORK_EVIDENCE_BUCKET,
    uri,
    fileName: `${reviewId}-${Date.now()}-${index}.${extension}`,
  });
}

async function deleteReviewEvidenceUrls(urls: string[]): Promise<void> {
  await deleteStorageObjects(WORK_EVIDENCE_BUCKET, urls);
}

async function uploadRequestPhoto(
  clientId: string,
  requestId: string,
  uri: string,
  index: number,
): Promise<string> {
  const extension = resolveFileExtension(uri);

  return uploadImage({
    bucket: REQUEST_PHOTOS_BUCKET,
    uri,
    fileName: `${requestId}-${Date.now()}-${index}.${extension}`,
  });
}

async function deleteRequestPhotoUrls(urls: string[]): Promise<void> {
  await deleteStorageObjects(REQUEST_PHOTOS_BUCKET, urls);
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
