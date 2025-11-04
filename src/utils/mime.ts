const MIME: Record<string, string> = {
    woff: 'application/font-woff',
    woff2: 'application/font-woff2',
    ttf: 'application/font-truetype',
    eot: 'application/vnd.ms-fontobject',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    tiff: 'image/tiff',
    svg: 'image/svg+xml',
};

/**
 * Returns file extension from URL.
 */
export function getExt(url: string): string {
    const m = /\.([^./?#]+)(?:[?#].*)?$/.exec(url);
    return m ? m[1] : '';
}

/**
 * Returns MIME type for a given URL or data URL.
 */
export function getMime(url: string): string {
    if (url.startsWith('data:')) {
        const m = /^data:([^;]+);/.exec(url);
        return m ? m[1] : '';
    }
    const ext = getExt(url).toLowerCase();
    return MIME[ext] || '';
}