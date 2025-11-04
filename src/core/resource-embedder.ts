import type { ExportOptions } from '../types/options';
import { fetchBlob } from '../utils/fetch';
import { getMime } from '../utils/mime';

const URL_RE = /url\((['"]?)([^'")]+?)\1\)/g;

/**
 * Embeds all resources (images, fonts) in the CSS text as data URLs.
 */
export async function embedRes(
    css: string,
    base: string | null,
    opts: Readonly<ExportOptions>,
): Promise<string> {
    if (!URL_RE.test(css)) return css;
    const urls = parseUrls(css);
    let res = css;
    for (const url of urls) {
        res = await embed(res, url, base, opts);
    }
    return res;
}

function parseUrls(css: string): string[] {
    const out: string[] = [];
    css.replace(URL_RE, (raw, _, url) => {
        if (!url.startsWith('data:')) out.push(url);
        return raw;
    });
    return out;
}

async function embed(
    css: string,
    url: string,
    base: string | null,
    opts: Readonly<ExportOptions>,
): Promise<string> {
    const abs = base ? resolveUrl(url, base) : url;
    try {
        const data = await fetchBlob(abs, opts);
        const dataUrl = `data:${getMime(url)};base64,${data.blob}`;
        return css.replace(new RegExp(`(url\\(['"]?)(${escapeReg(url)})(['"]?\\))`, 'g'), `$1${dataUrl}$3`);
    } catch {
        return css;
    }
}

function escapeReg(url: string): string {
    return url.replace(/([.*+?^${}()|[\]/\\])/g, '\\$1');
}

function resolveUrl(url: string, base: string): string {
    if (/^[a-z]+:\/\//i.test(url)) return url;
    if (/^\/\//.test(url)) return window.location.protocol + url;
    if (/^[a-z]+:/i.test(url)) return url;
    const doc = document.implementation.createHTMLDocument('');
    const baseEl = doc.createElement('base');
    const a = doc.createElement('a');
    doc.head.appendChild(baseEl);
    doc.body.appendChild(a);
    baseEl.href = base;
    a.href = url;
    return a.href;
}