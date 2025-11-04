import type { ExportOptions } from '../types/options';

export interface BlobMeta {
    blob: string;
    contentType: string;
}

const cache: Record<string, Promise<BlobMeta>> = {};

/**
 * Fetches a resource as base64 blob with content type.
 */
export async function fetchBlob(
    url: string,
    opts: ExportOptions,
): Promise<BlobMeta> {
    const key = url.replace(/\?.*/, '');
    if (key in cache) return cache[key];

    let fetchUrl = url;
    if (opts.cacheBust) {
        fetchUrl += (/\?/.test(url) ? '&' : '?') + Date.now();
    }

    const failed = (): BlobMeta => ({
        blob: opts.imagePlaceholder?.split(',')[1] || '',
        contentType: '',
    });

    const deferred = window
        .fetch(fetchUrl, opts.fetchInit)
        .then(async (res) => {
            const blob = await res.blob();
            const contentType = res.headers.get('Content-Type') || '';
            return new Promise<BlobMeta>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () =>
                    resolve({
                        contentType,
                        blob: (reader.result as string).split(',')[1] ?? '',
                    });
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        })
        .catch(failed);

    cache[key] = deferred;
    return deferred;
}

/**
 * Fetches a resource as plain text (for CSS).
 */
export async function fetchText(
    url: string,
    opts: ExportOptions,
): Promise<string> {
    let fetchUrl = url;
    if (opts.cacheBust) {
        fetchUrl += (/\?/.test(url) ? '&' : '?') + Date.now();
    }
    const res = await window.fetch(fetchUrl, opts.fetchInit);
    return await res.text();
}