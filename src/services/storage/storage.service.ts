import { File } from 'expo-file-system';

import { devError, devLog, devWarn } from '@/lib/dev-logger';
import { apiDelete, apiUpload } from '@/services/api/client';
import { withImageCacheBuster } from '@/shared/utils/image-uri';

const MAX_REVIEW_EVIDENCE_IMAGES = 3;
const MAX_REQUEST_PHOTOS = 5;

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

async function uploadToPath(path: string, uri: string, fileName?: string): Promise<string> {
  const contentType = resolveContentType(uri);
  const resolvedFileName = resolveFileName(uri, fileName);

  devLog('storage', 'upload:start', {
    path,
    contentType,
    uriScheme: getUriScheme(uri),
  });

  await assertUriReadable(uri);

  const formData = new FormData();
  formData.append('file', {
    uri,
    name: resolvedFileName,
    type: contentType,
  } as unknown as Blob);

  const response = await apiUpload<{ url: string }>(path, formData);
  const publicUrl = withImageCacheBuster(response.url);

  devLog('storage', 'upload:success', { urlPreview: publicUrl.slice(0, 120) });
  return publicUrl;
}

async function deleteStoredFile(path: string, url: string): Promise<void> {
  try {
    await apiDelete(path, true, { url });
    devLog('storage', 'delete:success', { path, urlPreview: url.slice(0, 120) });
  } catch (error) {
    devWarn('storage', 'delete:failed', { path, urlPreview: url.slice(0, 120), error });
  }
}

async function uploadAvatar(
  userId: string,
  uri: string,
  _previousAvatarUrl?: string | null,
): Promise<string> {
  devLog('storage', 'uploadAvatar:start', { userId, uriScheme: getUriScheme(uri) });

  const extension = resolveFileExtension(uri);

  return uploadToPath('/v1/app/profile/avatar', uri, `avatar-${Date.now()}.${extension}`);
}

async function uploadChatImage(conversationId: string, uri: string): Promise<string> {
  devLog('storage', 'uploadChatImage:start', {
    conversationId,
    uriScheme: getUriScheme(uri),
  });

  const extension = resolveFileExtension(uri);

  return uploadToPath(
    `/v1/app/conversations/${conversationId}/media`,
    uri,
    `${Date.now()}.${extension}`,
  );
}

async function uploadReviewEvidence(
  userId: string,
  reviewId: string,
  uri: string,
  index: number,
): Promise<string> {
  void userId;
  void reviewId;
  void index;

  const extension = resolveFileExtension(uri);

  return uploadToPath(
    '/v1/app/reviews/evidence',
    uri,
    `evidence-${Date.now()}.${extension}`,
  );
}

async function deleteReviewEvidenceUrls(urls: string[]): Promise<void> {
  for (const url of urls) {
    await deleteStoredFile('/v1/app/reviews/evidence', url);
  }
}

async function uploadRequestPhoto(
  clientId: string,
  requestId: string,
  uri: string,
  index: number,
): Promise<string> {
  void clientId;
  void index;

  const extension = resolveFileExtension(uri);

  return uploadToPath(
    `/v1/app/jobs/${requestId}/photos`,
    uri,
    `photo-${Date.now()}.${extension}`,
  );
}

async function deleteRequestPhotoUrls(requestId: string, urls: string[]): Promise<void> {
  for (const url of urls) {
    await deleteStoredFile(`/v1/app/jobs/${requestId}/photos`, url);
  }
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
