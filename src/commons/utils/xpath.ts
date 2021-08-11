import { IDOM } from "Types";
import libxmljs from "libxmljs2";

export function getXPath(text: string): string {
  const dom = new DOMParser().parseFromString(text, "text/xml");
  let node = dom.lastElementChild;
  while (
    node.lastElementChild &&
    node.lastElementChild.tagName !== "parsererror"
  ) {
    node = node.lastElementChild;
  }
  return _xpath(node);
}

// https://gist.github.com/iimos/e9e96f036a3c174d0bf4
function _xpath(node: Node): string {
  const el = node as Element;
  if (!el || el.nodeType != 1) return "";
  if (el.id) return "//*[@id='" + el.id + "']";
  const sames = [].filter.call(el.parentNode.children, function (x: Element) {
    return x.tagName == el.tagName;
  });
  return (
    _xpath(el.parentNode) +
    "/" +
    el.tagName.toLowerCase() +
    (sames.length > 1 ? "[" + ([].indexOf.call(sames, el) + 1) + "]" : "")
  );
}

export function getNodeFromXPath(dom: IDOM, xpath: string): IDOM {
  if (!dom || !xpath) return;
  const xpathNodes = xpath.split("/").slice(2);
  let node = dom;
  for (const xpathNodeName of xpathNodes) {
    let found = false;
    let nodeName = xpathNodeName;
    let nth = 0;
    const match = xpathNodeName.match(/(.*)\[(\d)\]$/);
    if (match) {
      nodeName = match[1];
      nth = Number.parseInt(match[2]);
    }
    for (const child of node.children) {
      if (child.name == nodeName) {
        if (--nth <= 0) {
          node = child;
          found = true;
          break;
        }
      }
    }
    if (!found) return null;
  }
  return node;
}

export function getNodeFromXPathLibXML(
  doc: libxmljs.Document,
  xpath: string
): libxmljs.Element {
  if (!doc || !xpath) return;
  const xpathNodes = xpath.split("/").slice(2);
  let node = doc.root();
  for (const xpathNodeName of xpathNodes) {
    let found = false;
    let nodeName = xpathNodeName;
    let nth = 0;
    const match = xpathNodeName.match(/(.*)\[(\d)\]$/);
    if (match) {
      nodeName = match[1];
      nth = Number.parseInt(match[2]);
    }
    for (const child of node.childNodes()) {
      if (child.type() == "element") {
        const childElement = child as libxmljs.Element;
        if (childElement.name() == nodeName) {
          if (--nth <= 0) {
            node = childElement;
            found = true;
            break;
          }
        }
      }
    }
    if (!found) return null;
  }
  return node;
}
