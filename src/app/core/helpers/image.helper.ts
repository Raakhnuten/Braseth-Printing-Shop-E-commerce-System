const PLACEHOLDER_SVG = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">' +
  '<rect width="400" height="400" fill="#f3f4f6"/>' +
  '<text x="200" y="180" text-anchor="middle" fill="#9ca3af" font-family="Arial" font-size="18">No Image</text>' +
  '<text x="200" y="210" text-anchor="middle" fill="#d1d5db" font-family="Arial" font-size="12">Available</text>' +
  '</svg>'
);

export function normalizeImageUrl(url: string | undefined | null): string | null {
  if (!url) return null;

  let cleaned = url.trim();

  if (cleaned.length === 0) return null;

  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cleaned = String(parsed[0]).trim();
        if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
            (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
          cleaned = cleaned.slice(1, -1).trim();
        }
      }
    } catch {
      const match = cleaned.match(/["']([^"']+)["']/);
      if (match) {
        cleaned = match[1].trim();
      }
    }
  }

  if (cleaned.startsWith('http://') || cleaned.startsWith('https://') || cleaned.startsWith('/')) {
    return cleaned;
  }

  return null;
}

export function normalizeImages(images: string[]): string[] {
  if (!Array.isArray(images)) {
    const cleaned = normalizeImageUrl(String(images));
    return cleaned ? [cleaned] : [];
  }
  const result: string[] = [];
  for (const img of images) {
    const normalized = normalizeImageUrl(img);
    if (normalized) {
      result.push(normalized);
    }
  }
  return result;
}

export function getSafeImageUrl(url: string | undefined | null): string {
  return normalizeImageUrl(url) ?? PLACEHOLDER_SVG;
}

export function onImageError(event: Event): void {
  const img = event.target as HTMLImageElement;
  if (img.src !== PLACEHOLDER_SVG) {
    img.src = PLACEHOLDER_SVG;
    img.onerror = null;
  }
}
