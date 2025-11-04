import type { ExportOptions } from '../types/options';
import { getMime } from './mime';

/**
 * Creates a new XHTML document.
 */
export function createDoc(opts: ExportOptions): Document {
    const doc = document.implementation.createDocument(
        'http://www.w3.org/1999/xhtml',
        'html',
        document.implementation.createDocumentType(
            'html',
            '-//W3C//DTD XHTML 1.1//EN',
            'http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd',
        ),
    );
    const html = doc.firstElementChild as HTMLHtmlElement | null;
    if (html) {
        const head = doc.createElement('head');
        if (opts.docTitle) {
            const title = doc.createElement('title');
            title.textContent = opts.docTitle;
            head.appendChild(title);
        }
        if (opts.docFaviconUrl) {
            const link = doc.createElement('link');
            link.rel = 'icon';
            link.type = getMime(opts.docFaviconUrl);
            link.href = opts.docFaviconUrl;
            head.appendChild(link);
        }
        html.appendChild(head);
        html.appendChild(doc.createElement('body'));
    }
    return doc;
}

/**
 * Serializes a document to a data URL.
 */
export function docToDataUrl(doc: Document): string {
    const data = encodeURIComponent(new XMLSerializer().serializeToString(doc));
    return `data:application/xhtml+xml;charset=utf-8,${data}`;
}

/**
 * Returns width and height of an element including borders.
 */
export function getSize(node: HTMLElement): { width: number; height: number } {
    const px = (prop: string) =>
        parseFloat(
            (node.ownerDocument.defaultView ?? window)
                .getComputedStyle(node)
                .getPropertyValue(prop)
                .replace('px', ''),
        ) || 0;
    return {
        width: node.clientWidth + px('border-left-width') + px('border-right-width'),
        height: node.clientHeight + px('border-top-width') + px('border-bottom-width'),
    };
}

/**
 * Creates an image element from a URL.
 */
export function createImg(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.crossOrigin = 'anonymous';
        img.decoding = 'sync';
        img.src = url;
    });
}