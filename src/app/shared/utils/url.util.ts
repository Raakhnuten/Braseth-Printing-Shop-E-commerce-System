export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getSafeUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http:') || url.startsWith('https:')) {
    return url;
  }
  return null;
}
