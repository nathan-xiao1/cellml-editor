import { IDOM } from "Types";
import libxmljs from "libxmljs2";

export function getXPath(text: string, target: string): string {
  const dom = new DOMParser().parseFromString(text, "text/xml");
  let targetNode;
  let node = dom.lastElementChild;
  while (node && node.tagName != "parsererror") {
    if (node.tagName == target) {
      targetNode = node;
    }
    node = node.lastElementChild;
  }
  return _xpath(targetNode);
}

export function getCursorElement(text: string): string {
  const regex = /<(\/?[^/>\s]+[^>]*)>/g; // /<(\/?[^/>\s]+[^>]*)>.*$/
  const matches = text.match(regex);
  if (!matches || matches.length == 0) return null;
  const match = matches[matches.length - 1].match(/<(\/?[^/>\s]+[^>]*)>/);
  console.log(match);
  const tagName = match[1].split(" ")[0];
  if (tagName.endsWith("/")) return tagName.substring(0, tagName.length - 1);
  if (tagName.startsWith("/")) return tagName.substring(1);
  return tagName;
}

function getCursorElement2(text: string): string {
  const regex = /<(\/?[^/>\s]+[^>]*)>/g;
  const stack = [];
  let match;
  while ((match = regex.exec(text)) != null) {
    const selfClosing = match[1].endsWith("/");
    if (selfClosing) continue;

    const endTag = match[1].startsWith("/");
    let tagName = match[1].split(" ")[0];
    if (endTag) tagName = tagName.substring(1);
    // Start tag
    if (!endTag) {
      stack.push(tagName);
    }
    // End tag
    else if (stack.length == 0) {
      // throw Error("Pop on empty stack");
    } else {
      const lastTag = stack[stack.length - 1];
      if (lastTag == tagName) {
        stack.pop();
      } else {
        return tagName;
      }
    }
  }
  return stack[stack.length - 1];
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
