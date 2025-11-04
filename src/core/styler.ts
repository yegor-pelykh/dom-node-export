import type { ExportOptions } from '../types/options';
import { uuid } from '../utils/uuid';

/**
 * Applies styles from options to the specified document and node.
 */
export function applyStyles<T extends HTMLElement>(
    doc: Document,
    node: T,
    opts: Readonly<ExportOptions>,
): void {
    const { styles } = opts;
    if (!styles) return;
    if (styles.node) setStyle(node, styles.node);
    if (styles.selectors) {
        for (const sel in styles.selectors) {
            if (!Object.prototype.hasOwnProperty.call(styles.selectors, sel)) continue;
            const style = styles.selectors[sel];
            doc.querySelectorAll<HTMLElement>(sel).forEach((el) => setStyle(el, style));
        }
    }
}

/**
 * Copies computed pseudo-element styles from src to tgt.
 */
export function clonePseudo<T extends HTMLElement>(src: T, tgt: T): void {
    [':before', ':after'].forEach((pseudo) => {
        const style = window.getComputedStyle(src, pseudo);
        const content = style.getPropertyValue('content');
        if (!content || content === 'none') return;
        const cls = uuid();
        tgt.classList.add(cls);
        const styleEl = document.createElement('style');
        styleEl.textContent = `.${cls}${pseudo}{${style.cssText}}`;
        tgt.appendChild(styleEl);
    });
}

function setStyle(
    el: HTMLElement,
    style?: Partial<CSSStyleDeclaration>,
): void {
    if (!el || !style) return;
    for (const k in style) {
        if (Object.prototype.hasOwnProperty.call(style, k)) {
            el.style[k] = style[k] as string;
        }
    }
}