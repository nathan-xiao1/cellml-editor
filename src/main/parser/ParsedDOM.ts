import { IDOM, IParsedDOM, IProblemItem } from "Types";
import libxmljs from "libxmljs2";
import CellMLSchema from "src/commons/CellMLSchema";
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

  addChildNode(xpath: string, childName: string): void {
    const libXMLNode = getNodeFromXPathLibXML(this._xmlDoc, xpath);
    if (libXMLNode) {
      let selfClosing = false;
      const schema = CellMLSchema.get(childName);
      if (schema) {
        selfClosing = schema.children.length == 0;
      }
      const childElement = new libxmljs.Element(
        this._xmlDoc,
        childName,
        selfClosing ? "" : "\n"
      );
      if (schema) {
        for (const attr of schema.attributes) {
          childElement.attr(attr, "");
        }
      }
      libXMLNode.addChild(childElement);
    }
  }

  removeChildNode(xpath: string): void {
    const libXMLNode = getNodeFromXPathLibXML(this._xmlDoc, xpath);
    if (libXMLNode) {
      libXMLNode.remove();
    }
  }

  toString(): string {
    return this._xmlDoc.toString(false);
  }
}
