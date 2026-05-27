export function isRemoteImageUri(uri: string): boolean {
  return uri.startsWith('http://') || uri.startsWith('https://');
}

export function withImageCacheBuster(url: string, version = Date.now()): string {
  if (!isRemoteImageUri(url)) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${version}`;
}

export function resolveImageCachePolicy(uri: string): 'memory-disk' | 'none' {
  if (isRemoteImageUri(uri)) {
    return 'memory-disk';
  }

  return 'none';
}
