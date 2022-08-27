import { Options } from './options';

const WOFF = 'application/font-woff';
const JPEG = 'image/jpeg';
const mimes: { [key: string]: string } = {
  woff: WOFF,
  woff2: WOFF,
  ttf: 'application/font-truetype',
  eot: 'application/vnd.ms-fontobject',
  png: 'image/png',
  jpg: JPEG,
  jpeg: JPEG,
  gif: 'image/gif',
  tiff: 'image/tiff',
  svg: 'image/svg+xml',
};

export function getExtension(url: string): string {
  const match = /\.([^./]*?)$/g.exec(url);
  return match ? match[1] : '';
}

export function getMimeType(url: string): string {
  if (isDataUrl(url)) {
    return url.substring(url.indexOf(':') + 1, url.indexOf(';'));
  } else {
    const extension = getExtension(url).toLowerCase();
    return mimes[extension] || '';
  }
}

export function resolveUrl(url: string, baseUrl: string | null): string {
  // url is absolute already
  if (url.match(/^[a-z]+:\/\//i)) {
    return url;
  }

  // url is absolute already, without protocol
  if (url.match(/^\/\//)) {
    return window.location.protocol + url;
  }

  // dataURI, mailto:, tel:, etc.
  if (url.match(/^[a-z]+:/i)) {
    return url;
  }

  const doc = document.implementation.createHTMLDocument();
  const base = doc.createElement('base') as HTMLBaseElement;
  const a = doc.createElement('a') as HTMLAnchorElement;

  doc.head.appendChild(base);
  doc.body.appendChild(a);

  if (baseUrl) {
    base.href = baseUrl;
  }

  a.href = url;

  return a.href;
}

export function isDataUrl(url: string) {
  return url.startsWith('data:');
}

export function makeDataUrl(content: string, mimeType: string) {
  return `data:${mimeType};base64,${content}`;
}

export function parseDataUrlContent(dataURL: string) {
  return dataURL.split(/,/)[1];
}

export const uuid = (() => {
  // generate uuid for className of pseudo elements.
  // We should not use GUIDs, otherwise pseudo elements sometimes cannot be captured.
  let counter = 0;

  // ref: http://stackoverflow.com/a/6248722/2519373
  const random = () =>
    // tslint:disable-next-line:no-bitwise
    `0000${((Math.random() * 36 ** 4) << 0).toString(36)}`.slice(-4);

  return () => {
    counter += 1;
    return `u${random()}${counter}`;
  };
})();

export function delay<T>(ms: number) {
  return (args: T) =>
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(args), ms);
    });
}

export function toArray<T>(arrayLike: any): T[] {
  const arr: T[] = [];

  for (let i = 0, l = arrayLike.length; i < l; i++) {
    arr.push(arrayLike[i]);
  }

  return arr;
}

function px(node: HTMLElement, styleProperty: string) {
  const win = node.ownerDocument.defaultView || window;
  const val = win.getComputedStyle(node).getPropertyValue(styleProperty);
  return val ? parseFloat(val.replace('px', '')) : 0;
}

function getNodeWidth(node: HTMLElement) {
  const leftBorder = px(node, 'border-left-width');
  const rightBorder = px(node, 'border-right-width');
  return node.clientWidth + leftBorder + rightBorder;
}

function getNodeHeight(node: HTMLElement) {
  const topBorder = px(node, 'border-top-width');
  const bottomBorder = px(node, 'border-bottom-width');
  return node.clientHeight + topBorder + bottomBorder;
}

export function getImageSize(targetNode: HTMLElement) {
  const width = getNodeWidth(targetNode);
  const height = getNodeHeight(targetNode);

  return { width, height };
}

// @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas#maximum_canvas_size
const canvasDimensionLimit = 16384;

export function checkCanvasDimensions(canvas: HTMLCanvasElement) {
  if (canvas.width > canvasDimensionLimit || canvas.height > canvasDimensionLimit) {
    if (canvas.width > canvasDimensionLimit && canvas.height > canvasDimensionLimit) {
      if (canvas.width > canvas.height) {
        canvas.height *= canvasDimensionLimit / canvas.width;
        canvas.width = canvasDimensionLimit;
      } else {
        canvas.width *= canvasDimensionLimit / canvas.height;
        canvas.height = canvasDimensionLimit;
      }
    } else if (canvas.width > canvasDimensionLimit) {
      canvas.height *= canvasDimensionLimit / canvas.width;
      canvas.width = canvasDimensionLimit;
    } else {
      canvas.width *= canvasDimensionLimit / canvas.height;
      canvas.height = canvasDimensionLimit;
    }
  }
}

export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = 'anonymous';
    img.decoding = 'sync';
    img.src = url;
  });
}

export function documentToDataURL(doc: Document): string {
  const data = encodeURIComponent(new XMLSerializer().serializeToString(doc));
  return `data:application/xhtml+xml;charset=utf-8,${data}`;
}

export function copyCSSWithoutWebFonts(doc: Document): HTMLStyleElement[] {
  const styleElements = Array<HTMLStyleElement>();
  for (const styleSheet of doc.styleSheets) {
    const element = document.createElement('style') as HTMLStyleElement;
    element.type = styleSheet.type;
    let cssContent = '';
    for (const cssRule of styleSheet.cssRules) {
      if (cssRule.type !== CSSRule.FONT_FACE_RULE) {
        cssContent += cssRule.cssText;
      }
    }
    element.textContent = cssContent;
    styleElements.push(element);
  }
  return styleElements;
}

export function createDocument(options: Options): Document {
  const doc = document.implementation.createDocument(
    'http://www.w3.org/1999/xhtml',
    'html',
    document.implementation.createDocumentType(
      'html',
      '-//W3C//DTD XHTML 1.1//EN',
      'http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd',
    ),
  );
  const html = doc.firstElementChild as HTMLHtmlElement;
  if (html != null) {
    const head = doc.createElement('head') as HTMLHeadElement;
    if (options.docTitle != null) {
      const title = doc.createElement('title') as HTMLTitleElement;
      title.textContent = options.docTitle;
      head.appendChild(title);
    }
    if (options.docFaviconUrl != null) {
      const link = doc.createElement('link') as HTMLLinkElement;
      link.rel = 'icon';
      link.type = getMimeType(options.docFaviconUrl);
      link.href = options.docFaviconUrl;
      head.appendChild(link);
    }
    html.appendChild(head);
    html.appendChild(doc.createElement('body'));
  }
  return doc;
}
