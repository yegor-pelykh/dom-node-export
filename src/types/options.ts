export enum StyleMode {
    Computed = 'computed',
    Declared = 'declared',
}

export interface StyleMap {
    node?: Partial<CSSStyleDeclaration>;
    selectors?: Readonly<Record<string, Partial<CSSStyleDeclaration>>>;
}

/**
 * Options for exporting a DOM node.
 */
export interface ExportOptions {
    /**
     * Favicon URL or data URI for the exported document.
     * If not set, favicon is omitted.
     */
    docFaviconUrl?: string;

    /**
     * Title for the exported document.
     * If not set, document will have an empty title.
     */
    docTitle?: string;

    /**
     * Style application mode:
     * - 'computed': snapshot computed styles (default)
     * - 'declared': use original CSS rules
     */
    styleMode?: StyleMode;

    /**
     * Custom styles for html, body, or the exported node.
     */
    styles?: StyleMap;

    /**
     * Filter function to include/exclude nodes during export.
     * Return true to include, false to exclude.
     */
    filter?: (node: HTMLElement) => boolean;

    /**
     * If true, appends a cache-busting query param to external resources (images, fonts, stylesheets).
     * Default: false.
     */
    cacheBust?: boolean;

    /**
     * Data URI to use as a placeholder if an image fails to load or embed.
     * If not set, broken images will remain as-is.
     */
    imagePlaceholder?: string;

    /**
     * Custom fetch options for resource loading (e.g., credentials, headers).
     * Passed to fetch() when loading external resources.
     */
    fetchInit?: RequestInit;
}