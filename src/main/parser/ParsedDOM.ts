import { IDOM, IParsedDOM, IProblemItem } from "Types";
import libxmljs from "libxmljs2";
import {
  getNodeFromXPath,
  getNodeFromXPathLibXML,
} from "src/commons/utils/xpath";

export default class ParsedDOM implements IParsedDOM {
  private _xmlDoc: libxmljs.Document;
  private _idom: IDOM;
  private _problems: IProblemItem[];

  constructor(xmlDoc: libxmljs.Document, idom: IDOM, problems: IProblemItem[]) {
    this._xmlDoc = xmlDoc;
    this._idom = idom;
    this._problems = problems;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  get xmlDoc(): any {
    return this._xmlDoc;
  }

  get IDOM(): IDOM {
    return this._idom;
  }

  get problems(): IProblemItem[] {
    return this._problems;
  }

  updateAttribute(xpath: string, key: string, value: string): void {
    const libXMLNode = getNodeFromXPathLibXML(this._xmlDoc, xpath);
    if (libXMLNode) {
      // Update libxmljs's DOM document
      libXMLNode.attr(key)?.value(value);
      // Update IDOM's representation
      getNodeFromXPath(this._idom, xpath).attributes = libXMLNode
        .attrs()
        .map((attribute: libxmljs.Attribute) => {
          return {
            key: attribute.name(),
            value: attribute.value(),
          };
        });
    }
  }

  toString(): string {
    return this._xmlDoc.toString(false);
  }
}
