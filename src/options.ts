export enum StyleTransferMode {
  computed,
  declared,
}

export interface StyleDeclarations {
  html?: Partial<CSSStyleDeclaration>;
  body?: Partial<CSSStyleDeclaration>;
  node?: Partial<CSSStyleDeclaration>;
}

export interface Options {
  /**
   * The favicon of the document.
   */
  docFaviconUrl?: string;
  /**
   * The title of the document.
   */
  docTitle?: string;
  /**
   * Style transfer mode. Default is StyleTransferMode.calculated
   */
  styleTransferMode?: StyleTransferMode;
  /**
   * Styles for new document elements such as "html", "body", and the exported node.
   * If the styleTransferMode property is set to "declared" and some of the referenced elements already have styles of their own, the styles specified in this property will take precedence, as they are set on the element itself.
   */
  styles?: StyleDeclarations;
  /**
   * A function taking DOM node as argument. Should return `true` if passed
   * node should be included in the output. Excluding node means excluding
   * it's children as well.
   */
  filter?: (domNode: HTMLElement) => boolean;
  /**
   * Set to `true` to append the current time as a query string to URL
   * requests to enable cache busting.
   */
  cacheBust?: boolean;
  /**
   * Set false to use all URL as cache key.
   * Default: false | undefined - which strips away the query parameters
   */
  includeQueryParams?: boolean;
  /**
   * A data URL for a placeholder image that will be used when fetching
   * an image fails. Defaults to an empty string and will render empty
   * areas for failed images.
   */
  imagePlaceholder?: string;
  /**
   * The preferred font format. If specified all other font formats are ignored.
   */
  preferredFontFormat?: 'woff' | 'woff2' | 'truetype' | 'opentype' | 'embedded-opentype' | 'svg' | string;
  /**
   * The second parameter of  window.fetch (Promise<Response> fetch(input[, init]))
   */
  fetchRequestInit?: RequestInit;
}
