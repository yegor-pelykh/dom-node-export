# 🧩 dom-node-export

[![npm version](https://img.shields.io/npm/v/dom-node-export.svg?style=flat-square)](https://www.npmjs.com/package/dom-node-export)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

> **Export any DOM node, including styles, images, and web fonts, into a standalone XHTML document as a data URL.**

---

## 🚀 Overview

**dom-node-export** is a modern TypeScript library that allows you to export any DOM element from your web application or site as a fully self-contained XHTML document. All styles, images, and web fonts are preserved, so the exported node looks exactly as it does on your page.

Unlike popular "Save as image" tools that simply capture a static screenshot, **dom-node-export** gives you much more: it exports a live, interactive copy of any part of your web page. The result is not just a picture, but a real, editable mini-page that you can open in the browser, inspect, modify, make your own screenshots, or even study the code structure and styles in detail. This makes sharing, archiving, or analyzing UI fragments far more powerful and flexible.

Use it to:

- Save parts of a page for sharing or archiving
- Generate printable or distributable documents from UI components
- Create design snapshots for documentation or QA

---

## ✨ Features

- **Full Style Preservation:** Export with computed styles (snapshot) or original CSS rules.
- **Font Embedding:** Automatically embeds web fonts and local fonts.
- **Image Embedding:** All images are inlined as data URLs.
- **Customizable:** Set document title, favicon, and inject custom styles.
- **Filtering:** Exclude or include nodes with a filter function.
- **TypeScript-first:** Full type safety and modern ES module support.
- **Advanced Options:** Cache busting, image placeholders and fetch customization.

---

## 📦 Installation

```bash
npm install dom-node-export
```

---

## 🛠️ Usage

### Basic Example

```typescript
import { exportNode } from 'dom-node-export';

const node = document.getElementById('export-me');
const dataUrl = await exportNode(node);

console.log(dataUrl); // data:application/xhtml+xml;base64,...
```

### Download as File

```typescript
import { exportNode } from 'dom-node-export';

async function downloadNodeAsFile(node: HTMLElement) {
  const dataUrl = await exportNode(node, {
    docTitle: 'Exported Node',
    docFaviconUrl: '/favicon.ico',
    styles: {
      body: { margin: '2rem', background: '#fafafa' },
    },
  });

  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = 'exported-node.xhtml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Usage
const node = document.querySelector('.exportable');
if (node) downloadNodeAsFile(node as HTMLElement);
```

### Advanced: Filtering and Custom Styles

```typescript
import { exportNode, StyleMode } from 'dom-node-export';

const node = document.querySelector('.doc');

const dataUrl = await exportNode(node, {
  styleMode: StyleMode.Computed,
  filter: (el) => !el.classList.contains('hidden'),
  styles: {
    node: { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    selectors: {
      html: {
        fontSize: '18px',
      },
      body: {
        padding: '2rem',
        background: '#fff',
      },
    },
  },
  docTitle: 'My Exported Component',
  docFaviconUrl: 'data:image/png;base64,...',
});
```

---

## ⚙️ API

### `exportNode<T extends HTMLElement>(node: T, options?: ExportOptions): Promise<string>`

Exports a DOM node as a standalone XHTML document (data URL).

#### **Parameters**

- `node` - The DOM element to export.
- `options` - (Optional) Export options:

| Option             | Type                             | Description                                                                             |
| ------------------ | -------------------------------- | --------------------------------------------------------------------------------------- |
| `styleMode`        | `StyleMode`                      | `'Computed'` (default) or `'Declared'` for style application                            |
| `styles`           | `StyleMap`                       | Custom styles for `html`, `body`, or the exported node                                  |
| `docTitle`         | `string`                         | Document title                                                                          |
| `docFaviconUrl`    | `string`                         | Favicon URL or data URI                                                                 |
| `filter`           | `(node: HTMLElement) => boolean` | Filter function to include/exclude nodes                                                |
| `cacheBust`        | `boolean`                        | If `true`, appends a cache-busting query param to external resources (default: `false`) |
| `imagePlaceholder` | `string`                         | Data URI or URL to use as a placeholder for failed image loads                          |
| `fetchInit`        | `RequestInit`                    | Custom `fetch` options for loading external resources                                   |

#### **Returns**

- `Promise<string>` - Data URL of the exported XHTML document.

#### **Types**

```typescript
export enum StyleMode {
  Computed = 'computed',
  Declared = 'declared',
}

export interface ExportOptions {
  docFaviconUrl?: string;
  docTitle?: string;
  styleMode?: StyleMode;
  styles?: StyleMap;
  filter?: (node: HTMLElement) => boolean;
  cacheBust?: boolean;
  includeQueryParams?: boolean;
  imagePlaceholder?: string;
  preferredFontFormat?: string;
  fetchInit?: RequestInit;
}

export interface StyleMap {
  node?: Partial<CSSStyleDeclaration>;
  selectors?: Readonly<Record<string, Partial<CSSStyleDeclaration>>>;
}
```

---

## 🧑‍💻 Best Practices

- **Fonts:** For best results, use web fonts or ensure local fonts are accessible.
- **Images:** SVG, PNG, JPEG, and GIF are supported. External images are inlined.
- **Filtering:** Use the `filter` option to exclude hidden or irrelevant nodes.
- **Performance:** For large DOM trees or many images/fonts, export may take longer.

---

## 📚 Example Use Cases

- Export a chart, table, or widget for sharing in messengers or email
- Save a styled component as a design artifact
- Generate printable documents from dynamic UI
- Archive UI states for QA or documentation

---

## 📝 License

MIT © [Yegor Pelykh](mailto:yegor.dev@gmail.com)

---

## 🔗 Links

- [GitHub Repository](https://github.com/yegor-pelykh/dom-node-export)
- [NPM Package](https://www.npmjs.com/package/dom-node-export)
- [Report Issues](https://github.com/yegor-pelykh/dom-node-export/issues)

---

> _Made with ❤️ and TypeScript._
