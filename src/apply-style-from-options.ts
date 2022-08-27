import { Options } from './options';

export function applyStyleFromOptions<T extends HTMLElement>(doc: Document, node: T, options: Options): void {
  if (options.styles != null) {
    if (options.styles.html != null) {
      const manual = options.styles.html;
      const { style } = doc.firstElementChild as HTMLHtmlElement;
      Object.keys(manual).forEach((key: any) => {
        style[key] = manual[key] as string;
      });
    }

    if (options.styles.body != null) {
      const manual = options.styles.body;
      const { style } = doc.body;
      Object.keys(manual).forEach((key: any) => {
        style[key] = manual[key] as string;
      });
    }

    if (options.styles.node != null) {
      const manual = options.styles.node;
      const { style } = node;
      Object.keys(manual).forEach((key: any) => {
        style[key] = manual[key] as string;
      });
    }
  }
}
