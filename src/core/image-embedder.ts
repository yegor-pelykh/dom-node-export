import type { ExportOptions } from '../types/options';
import { fetchBlob } from '../utils/fetch';
import { getMime } from '../utils/mime';
import { embedRes } from './resource-embedder';

/**
 * Embeds all images and backgrounds in the node and its subtree.
 */
export async function embedImages<T extends HTMLElement>(
    node: T,
    opts: Readonly<ExportOptions>,
): Promise<T> {
    if (!(node instanceof Element)) return node;
    await embedBg(node, opts);
    await embedImg(node, opts);
    await embedChildren(node, opts);
    return node;
}

async function embedBg<T extends HTMLElement>(
    node: T,
    opts: Readonly<ExportOptions>,
): Promise<void> {
    const bg = node.style?.getPropertyValue('background');
    if (!bg) return;
    const css = await embedRes(bg, null, opts);
    node.style.setProperty('background', css, node.style.getPropertyPriority('background'));
}

async function embedImg<T extends HTMLElement | SVGImageElement>(
    node: T,
    opts: Readonly<ExportOptions>,
): Promise<void> {
    if (
        !(node instanceof HTMLImageElement && !node.src.startsWith('data:')) &&
        !(node instanceof SVGImageElement && !node.href.baseVal.startsWith('data:'))
    ) return;
    const src = node instanceof HTMLImageElement ? node.src : node.href.baseVal;
    const data = await fetchBlob(src, opts);
    const url = `data:${getMime(src)};base64,${data.blob}`;
    await new Promise<void>((res, rej) => {
        node.onload = () => res();
        node.onerror = rej;
        if (node instanceof HTMLImageElement) {
            node.srcset = '';
            node.src = url;
        } else {
            node.href.baseVal = url;
        }
    });
}

async function embedChildren<T extends HTMLElement>(
    node: T,
    opts: Readonly<ExportOptions>,
): Promise<void> {
    await Promise.all(
        Array.from(node.childNodes).map((c) =>
            c instanceof HTMLElement ? embedImages(c, opts) : Promise.resolve(),
        ),
    );
}