import { Options } from './options';
import { cloneNode } from './cloner';
import { embedImages } from './embed-images';
import { applyStyleFromOptions } from './apply-style-from-options';
import { getStyleNodes } from './styles-provider';
import { createDocument, documentToDataURL } from './util';

export { StyleTransferMode, StyleDeclarations, Options } from './options';

export async function exportNode<T extends HTMLElement>(node: T, options: Options = {}): Promise<string> {
  const cloneDocument = createDocument(options);
  const clonedNode = (await cloneNode<T>(node, options, true)) as T;
  cloneDocument.body.appendChild(clonedNode);
  const nativeDocument = node.ownerDocument;
  const styleNodes = await getStyleNodes(nativeDocument, options);
  for (const styleNode of styleNodes) {
    cloneDocument.head.appendChild(styleNode);
  }
  await embedImages(clonedNode, options);
  applyStyleFromOptions(cloneDocument, clonedNode, options);
  return await documentToDataURL(cloneDocument);
}
