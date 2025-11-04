import type { ExportOptions } from '../types/options';
import { StyleMode } from '../types/options';
import { embedRes } from './resource-embedder';
import { fetchText } from '../utils/fetch';

/**
 * Returns all style nodes (<style> elements) for the given document and options.
 * Now also inlines external <link rel="stylesheet"> (e.g. Google Fonts).
 */
export async function getStyles(
    doc: Document,
    opts: Readonly<ExportOptions>,
): Promise<HTMLStyleElement[]> {
    if (!doc) throw new Error('Provided element is not within a Document');
    const nodes: HTMLStyleElement[] = [];

    const links = Array.from(doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]'));
    for (const link of links) {
        try {
            const css = await fetchText(link.href, opts);
            const inlined = await embedRes(css, link.href, opts);
            const styleEl = document.createElement('style');
            styleEl.textContent = inlined;
            nodes.push(styleEl);
        } catch {
        }
    }

    const sheets = Array.from(doc.styleSheets);
    const rules = await getRules(sheets);

    const fontRules = rules.filter(
        (r) =>
            r.type === CSSRule.FONT_FACE_RULE &&
            /url\(/.test((r as CSSFontFaceRule).style.getPropertyValue('src')),
    );
    if (fontRules.length) {
        const el = document.createElement('style');
        el.textContent = (
            await Promise.all(
                fontRules.map((r) => {
                    const base = r.parentStyleSheet ? r.parentStyleSheet.href : null;
                    return embedRes(r.cssText, base, opts);
                }),
            )
        ).join('\n');
        nodes.push(el);
    }

    if (opts.styleMode === StyleMode.Declared) {
        const other = rules.filter((r) => r.type !== CSSRule.FONT_FACE_RULE);
        if (other.length) {
            const el = document.createElement('style');
            el.textContent = other.map((r) => r.cssText).join('\n');
            nodes.push(el);
        }
    }

    return nodes;
}

async function getRules(
    sheets: readonly CSSStyleSheet[],
): Promise<CSSRule[]> {
    const out: CSSRule[] = [];
    for (const sheet of sheets) {
        if ('cssRules' in sheet) {
            try {
                Array.from(sheet.cssRules || []).forEach((r) => out.push(r));
            } catch { }
        }
    }
    return out;
}