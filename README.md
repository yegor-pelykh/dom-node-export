# dom-node-export

<a href="https://nodei.co/npm/dom-node-export/"><img src="https://nodei.co/npm/dom-node-export.png"></a>

This npm package allows you to export individual nodes from your web application or website into a separate XHTML document in the form in which you see them on your page.

## Features

- Saves element with final computed styles (as a "snapshot") or injects styles taken from the source document as they were declared, allowing the exported element to be more "flexible".
- Has the ability to embed the fonts of the original document. Markup, styles, fonts, images - all in one document.
- Allows you to customize the styles of the document, body and exported element in the final document.
- Easy customization of document title and favicon.
- Allows you to filter the items that will be exported.
- ES6 types and importing.

Given the above, it may be used to save part of a page as a document for later distribution.

## Example

Package installation:

```console
npm install dom-node-export
```

Including in your code (Typescript):
```typescript
import { exportNode } from 'dom-node-export';
```

Using (Typescript):
```typescript

const faviconUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHdSURBVDiNhZPNbtNAFIW/scdJHLeO3R81CYkUIQUItIJUqtRngHWREAKJHY8Ba16AFazYdFveARb8CIESQIiyMJDQ1qUlDVixPSwiK3GbtEcajeZe3XPPmbkjXntqvWTzJCtpcAaUoL3v0azXRZDEJDGFKGYGYDAY0Ol0U0VGxqC4tARAHNE4zPECWE3yGgACOa2rQByTwez4UQKoeEhkGAbVauUsJylIAE0gOt0uX7e3UWqULJWKnK/Vho0VfPz8CWvh4kkCQGi6zqxtp5JH/T7vWy0AypULBN4H7LybO2kBNMcukM1kpkqNpaThdrDCTXeSAs3f9/G+/5hKUL+0TGgInPCdpd7er4nm42+QvMJon4hq5Ry2adC3rvFvkIkg3Egp0EAsLiziOM5EAiGGi/k1/C9bqmwHt4BH4xbEzu7OqRauriwzkzPYC4uizG5Tvbl3Waw+bSWDdKqFBLkMdDPr/TAIfiP0mykFc66LaZpTi6VhEMcQOWte0O315Hz2NvBADgWg9XpH7Pn+VALLzIMmcSxNi8KwpeL4bvBqY0VqMX/8Pr0IJ2fOjS4xUjA2lHgHECuFoQtdwcPDXz/bhezftgB49jK8Hmk8Vxz/OWnoggM3L7ZuXNHvJLH/OsuW2UnvU0cAAAAASUVORK5CYII='

function downloadFile(dataUrl: string, title: string) {
    const anchor = document.createElement('a');
    anchor.href = dataUrl;
    anchor.download = title;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}

async function saveToFile(element: HtmlElement) {
    const dataUrl = await exportNode(node, {
        docFaviconUrl: faviconUrl,
        docTitle: 'Exported element',
        styles: {
            body: {
                padding: '2rem'
            }
        },
        filter: node => !node.classList?.contains('hidden'),
    });
    if (dataUrl != null) {
        this.downloadFile(dataUrl, 'Document')
    }
}

async function main() {
    const elements = document.getElementsByClassName('doc')
    if (elements.length > 0) {
        await saveToFile(elements[0])
    }
}

```