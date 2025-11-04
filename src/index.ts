import type { ExportOptions, StyleMap } from './types/options';
import { StyleMode } from './types/options';
import { cloneNode } from './core/cloner';
import { embedImages } from './core/image-embedder';
import { applyStyles } from './core/styler';
import { getStyles } from './core/style-provider';
import { createDoc, docToDataUrl } from './utils/dom';

/**
 * Exports a DOM node as a standalone XHTML document encoded as a data URL.
 *
 * @template T - The type of the DOM node to export.
 * @param {T} node - The DOM element to export.
 * @param {Readonly<ExportOptions>} [opts] - Optional export settings.
 * @param {string} [opts.docFaviconUrl] - URL or data URI for the document favicon.
 * @param {string} [opts.docTitle] - Title of the exported document.
 * @param {StyleMode} [opts.styleMode] - Style application mode: `StyleMode.Computed` (default) for computed styles snapshot, or `StyleMode.Declared` for original CSS rules.
 * @param {StyleMap} [opts.styles] - Custom styles to apply to the exported document, including per-node and selector-based overrides.
 * @param {(node: HTMLElement) => boolean} [opts.filter] - Function to filter which nodes are included in the export. Return `true` to include, `false` to exclude.
 * @param {boolean} [opts.cacheBust=false] - If `true`, appends a cache-busting query parameter to external resources (images, fonts, stylesheets).
 * @param {string} [opts.imagePlaceholder] - Data URI or URL to use as a placeholder for images that fail to load.
 * @param {RequestInit} [opts.fetchInit] - Custom options for `fetch` requests when loading external resources.
 * @returns {Promise<string>} A promise that resolves to a data URL containing the exported XHTML document.
 *
 * @example
 * ```typescript
 * const dataUrl = await exportNode(document.getElementById('export-me'), {
 *   docTitle: 'Exported Node',
 *   styleMode: StyleMode.Computed,
 *   styles: { body: { background: '#fff' } },
 *   filter: el => !el.classList.contains('hidden'),
 * });
 * ```
 */
export async function exportNode<T extends HTMLElement>(
  node: T,
  opts: Readonly<ExportOptions> = {},
): Promise<string> {
  const doc = createDoc(opts);
  const clone = await cloneNode<T>(node, opts, true);
  if (!clone) throw new Error('Failed to clone node');
  doc.body.appendChild(clone);

  const styleNodes = await getStyles(node.ownerDocument, opts);
  for (const s of styleNodes) doc.head.appendChild(s);

  await embedImages(clone, opts);
  applyStyles(doc, clone, opts);

  return docToDataUrl(doc);
}

export type { ExportOptions, StyleMap };
export { StyleMode };