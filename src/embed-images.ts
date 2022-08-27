import { Options } from './options';
import { getBlobFromURL } from './get-blob-from-url';
import { embedResources } from './embed-resources';
import { getMimeType, isDataUrl, makeDataUrl, toArray } from './util';

async function embedBackground<T extends HTMLElement>(clonedNode: T, options: Options): Promise<T> {
  const background = clonedNode.style?.getPropertyValue('background');
  if (!background) {
    return clonedNode;
  }

  const cssString = await embedResources(background, null, options);
  clonedNode.style.setProperty('background', cssString, clonedNode.style.getPropertyPriority('background'));
  return clonedNode;
}

async function embedImageNode<T extends HTMLElement | SVGImageElement>(clonedNode: T, options: Options): Promise<T> {
  if (
    !(clonedNode instanceof HTMLImageElement && !isDataUrl(clonedNode.src)) &&
    !(clonedNode instanceof SVGImageElement && !isDataUrl(clonedNode.href.baseVal))
  ) {
    return clonedNode;
  }

  const src = clonedNode instanceof HTMLImageElement ? clonedNode.src : clonedNode.href.baseVal;
  const data = await getBlobFromURL(src, options);
  const dataURL = await makeDataUrl(data.blob, getMimeType(src) || data.contentType);
  await new Promise((resolve, reject) => {
    clonedNode.onload = resolve;
    clonedNode.onerror = reject;
    if (clonedNode instanceof HTMLImageElement) {
      clonedNode.srcset = '';
      clonedNode.src = dataURL;
    } else {
      clonedNode.href.baseVal = dataURL;
    }
  });
  return clonedNode;
}

async function embedChildren<T extends HTMLElement>(clonedNode: T, options: Options): Promise<T> {
  const children = toArray<HTMLElement>(clonedNode.childNodes);
  // eslint-disable-next-line no-use-before-define
  const deferreds = children.map((child) => embedImages(child, options));
  return Promise.all(deferreds).then(() => clonedNode);
}

export async function embedImages<T extends HTMLElement>(clonedNode: T, options: Options): Promise<T> {
  if (!(clonedNode instanceof Element)) {
    return Promise.resolve(clonedNode);
  }

  await embedBackground(clonedNode, options);
  await embedImageNode(clonedNode, options);
  await embedChildren(clonedNode, options);

  return clonedNode;
}
