import type { ExportOptions } from '../types/options';
import { StyleMode } from '../types/options';
import { createImg } from '../utils/dom';
import { clonePseudo } from './styler';

/**
 * Deeply clones a node and its subtree, applying styles and values.
 */
export async function cloneNode<T extends HTMLElement>(
    node: T,
    opts: Readonly<ExportOptions>,
    root = false,
): Promise<T | null> {
    if (!root && opts.filter && !opts.filter(node)) return null;
    const clone = await cloneSingle(node);
    await cloneChildren(node, clone, opts);
    decorate(node, clone, opts);
    return clone;
}

async function cloneSingle<T extends HTMLElement>(
    node: T,
): Promise<T> {
    if (node instanceof HTMLCanvasElement) {
        const url = node.toDataURL();
        if (url === 'data:,') return node.cloneNode(false) as T;
        return (await createImg(url)) as unknown as T;
    }
    if (node instanceof HTMLVideoElement && node.poster) {
        const img = await createImg(node.poster);
        return img as unknown as T;
    }
    return node.cloneNode(false) as T;
}

async function cloneChildren<T extends HTMLElement>(
    src: T,
    tgt: T,
    opts: Readonly<ExportOptions>,
): Promise<void> {
    const children: Node[] = Array.from(
        (src.shadowRoot ?? src).childNodes,
    );
    if (!children.length || src instanceof HTMLVideoElement) return;
    const clones = await Promise.all(
        children.map((c) => cloneNode(c as HTMLElement, opts)),
    );
    for (const c of clones) if (c) tgt.appendChild(c);
}

function decorate<T extends HTMLElement>(
    src: T,
    tgt: T,
    opts: Readonly<ExportOptions>,
): void {
    if (!(tgt instanceof Element)) return;
    if (opts.styleMode === StyleMode.Computed) {
        cloneStyle(src, tgt);
        clonePseudo(src, tgt);
    }
    cloneInput(src, tgt);
    cloneSelect(src, tgt);
}

function cloneStyle<T extends HTMLElement>(src: T, tgt: T): void {
    const s = window.getComputedStyle(src);
    const t = tgt.style;
    if (!t) return;
    if (s.cssText) {
        t.cssText = s.cssText;
        t.transformOrigin = s.transformOrigin;
        return;
    }
    for (let i = 0; i < s.length; i++) {
        const name = s.item(i);
        let val = s.getPropertyValue(name);
        t.setProperty(name, val, s.getPropertyPriority(name));
    }
}

function cloneInput<T extends HTMLElement>(src: T, tgt: T): void {
    if (src instanceof HTMLTextAreaElement) {
        tgt.textContent = src.value;
    } else if (src instanceof HTMLInputElement) {
        tgt.setAttribute('value', src.value);
    }
}

function cloneSelect<T extends HTMLElement>(src: T, tgt: T): void {
    if (!(src instanceof HTMLSelectElement)) return;
    const sel = tgt as unknown as HTMLSelectElement;
    for (const c of Array.from(sel.children)) {
        if ((c as HTMLOptionElement).value === src.value) {
            (c as HTMLOptionElement).selected = true;
            break;
        }
    }
}