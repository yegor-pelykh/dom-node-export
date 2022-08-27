import { toArray } from './util';
import { Options, StyleTransferMode } from './options';
import { shouldEmbed, embedResources } from './embed-resources';

interface Metadata {
  url: string;
  cssText: Promise<string>;
}

const cssFetchCache: {
  [href: string]: Promise<void | Metadata>;
} = {};

function fetchCSS(url: string): Promise<void | Metadata> {
  const cache = cssFetchCache[url];
  if (cache != null) {
    return cache;
  }

  const deferred = window.fetch(url).then((res) => ({
    url,
    cssText: res.text(),
  }));

  cssFetchCache[url] = deferred;

  return deferred;
}

async function embedFonts(meta: Metadata, options: Options): Promise<string> {
  return meta.cssText.then((raw: string) => {
    let cssText = raw;
    const regexUrl = /url\(["']?([^"')]+)["']?\)/g;
    const fontLocs = cssText.match(/url\([^)]+\)/g) || [];
    const loadFonts = fontLocs.map((location: string) => {
      let url = location.replace(regexUrl, '$1');
      if (!url.startsWith('https://')) {
        url = new URL(url, meta.url).href;
      }

      // eslint-disable-next-line promise/no-nesting
      return window
        .fetch(url, options.fetchRequestInit)
        .then((res) => res.blob())
        .then(
          (blob) =>
            new Promise<[string, string | ArrayBuffer | null]>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                // Side Effect
                cssText = cssText.replace(location, `url(${reader.result})`);
                resolve([location, reader.result]);
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            }),
        );
    });

    // eslint-disable-next-line promise/no-nesting
    return Promise.all(loadFonts).then(() => cssText);
  });
}

function parseCSS(source: string) {
  if (source == null) {
    return [];
  }

  const result: string[] = [];
  const commentsRegex = /(\/\*[\s\S]*?\*\/)/gi;
  // strip out comments
  let cssText = source.replace(commentsRegex, '');

  // eslint-disable-next-line prefer-regex-literals
  const keyframesRegex = new RegExp('((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})', 'gi');

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const matches = keyframesRegex.exec(cssText);
    if (matches === null) {
      break;
    }
    result.push(matches[0]);
  }
  cssText = cssText.replace(keyframesRegex, '');

  const importRegex = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi;
  // to match css & media queries together
  const combinedCSSRegex =
    '((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]' + '*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})';
  // unified regex
  const unifiedRegex = new RegExp(combinedCSSRegex, 'gi');
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let matches = importRegex.exec(cssText);
    if (matches === null) {
      matches = unifiedRegex.exec(cssText);
      if (matches === null) {
        break;
      } else {
        importRegex.lastIndex = unifiedRegex.lastIndex;
      }
    } else {
      unifiedRegex.lastIndex = importRegex.lastIndex;
    }
    result.push(matches[0]);
  }

  return result;
}

async function getCSSRules(styleSheets: CSSStyleSheet[], options: Options): Promise<CSSRule[]> {
  const ret: CSSRule[] = [];
  const deferreds: Promise<number | void>[] = [];

  // First loop inlines imports
  styleSheets.forEach((sheet) => {
    if ('cssRules' in sheet) {
      try {
        toArray<CSSRule>(sheet.cssRules || []).forEach((item, index) => {
          if (item.type === CSSRule.IMPORT_RULE) {
            let importIndex = index + 1;
            const url = (item as CSSImportRule).href;
            const deferred = fetchCSS(url)
              .then((metadata) => (metadata ? embedFonts(metadata, options) : ''))
              .then((cssText) =>
                parseCSS(cssText).forEach((rule) => {
                  try {
                    sheet.insertRule(rule, rule.startsWith('@import') ? (importIndex += 1) : sheet.cssRules.length);
                  } catch (error) {
                    // tslint:disable-next-line:no-console
                    console.error('Error inserting rule from remote css', {
                      rule,
                      error,
                    });
                  }
                }),
              )
              .catch((e) => {
                // tslint:disable-next-line:no-console
                console.error('Error loading remote css', e.toString());
              });

            deferreds.push(deferred);
          }
        });
      } catch (e: any) {
        const inline = styleSheets.find((a) => a.href == null) || document.styleSheets[0];
        if (sheet.href != null) {
          deferreds.push(
            fetchCSS(sheet.href)
              .then((metadata) => (metadata ? embedFonts(metadata, options) : ''))
              .then((cssText) =>
                parseCSS(cssText).forEach((rule) => {
                  inline.insertRule(rule, sheet.cssRules.length);
                }),
              )
              .catch((err) => {
                // tslint:disable-next-line:no-console
                console.error('Error loading remote stylesheet', err.toString());
              }),
          );
        }
        // tslint:disable-next-line:no-console
        console.error('Error inlining remote css file', e.toString());
      }
    }
  });

  return Promise.all(deferreds).then(() => {
    // Second loop parses rules
    styleSheets.forEach((sheet) => {
      if ('cssRules' in sheet) {
        try {
          toArray<CSSRule>(sheet.cssRules || []).forEach((item) => {
            ret.push(item);
          });
        } catch (e: any) {
          // tslint:disable-next-line:no-console
          console.error(`Error while reading CSS rules from ${sheet.href}`, e.toString());
        }
      }
    });

    return ret;
  });
}

export async function getStyleNodes(doc: Document, options: Options): Promise<HTMLStyleElement[]> {
  if (doc == null) {
    throw new Error('Provided element is not within a Document');
  }
  const styleSheets = toArray<CSSStyleSheet>(doc.styleSheets);
  const cssRules = await getCSSRules(styleSheets, options);

  const styleNodes = new Array<HTMLStyleElement>();

  const rulesFontFace = cssRules.filter(
    (rule) =>
      rule.type === CSSRule.FONT_FACE_RULE && shouldEmbed((rule as CSSFontFaceRule).style.getPropertyValue('src')),
  );
  const nodeFontFace = document.createElement('style') as HTMLStyleElement;
  nodeFontFace.textContent = (
    await Promise.all(
      rulesFontFace.map((rule) => {
        const baseUrl = rule.parentStyleSheet ? rule.parentStyleSheet.href : null;
        return embedResources(rule.cssText, baseUrl, options);
      }),
    )
  ).join('\n');
  styleNodes.push(nodeFontFace);

  if (options.styleTransferMode === StyleTransferMode.declared) {
    const rulesOther = cssRules.filter((rule) => rule.type !== CSSRule.FONT_FACE_RULE);
    const nodeOther = document.createElement('style') as HTMLStyleElement;
    nodeOther.textContent = rulesOther.map((r) => r.cssText).join('\n');
    styleNodes.push(nodeOther);
  }

  return styleNodes;
}
