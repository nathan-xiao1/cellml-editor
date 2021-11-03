import LibCellMLParser from "./LibCellMLParser";
import CellMLSchema from "src/commons/CellMLSchema";
import libxmljs from "libxmljs2";
import {
  IDOM,
  IParsedDOM,
  IParser,
  IProblemItem,
  ProblemSeverity,
} from "Types";
import ParsedDOM from "./ParsedDOM";

interface LibxmlsjsToIDOMResult {
  dom: IDOM;
  problems: IProblemItem[];
}

export default class Parser implements IParser {
  private cellMLParser: LibCellMLParser;
  private id: number;

  async init(): Promise<void> {
    this.id = 0;
    this.cellMLParser = new LibCellMLParser();
    return this.cellMLParser.init();
  }

  parse(content: string): IParsedDOM {
    if (!this.cellMLParser)
      throw Error("Must call and await init() before parsing");
    if (!content) return new ParsedDOM(null, null, []);
    const problems: IProblemItem[] = [];
    // libXMLjs2 Parser
    let dom: IDOM;
    let xmlDoc: libxmljs.Document;
    try {
      xmlDoc = libxmljs.parseXmlString(content, { recover: true });
      this.id = 0;
      const ret = this.libxmljsToIDOM(xmlDoc.root(), true);
      dom = ret.dom;
      problems.push(...ret.problems);
      xmlDoc.errors.forEach((error) => {
        let severity: ProblemSeverity;
        switch (error.code) {
          case 0:
            severity = "info";
            break;
          case 1:
            severity = "warning";
            break;
          default:
            severity = "error";
            break;
        }
        const lineNum = Number.parseInt(
          error.message.match(/line (\d+)/i)?.[1]
        );
        problems.push({
          description: ensureCapital(error.message),
          severity: severity,
          startColumn: error.column,
          endColumn: error.column + 1,
          startLineNumber: lineNum ? lineNum : error.line,
          endLineNumber: lineNum ? lineNum : error.line,
        });
      });
    } catch (error) {
      dom = null;
      problems.push({
        description: ensureCapital(error.message),
        severity: "error",
        startColumn: 0,
        endColumn: 0,
        startLineNumber: 0,
        endLineNumber: 0,
      });
    }

    // libCellML Parser
    const result = this.cellMLParser.parse(content);
    [result.hints, result.warnings, result.errors].forEach((type) => {
      type.forEach((error, idx) => {
        if (error.description().startsWith("LibXml2 error:")) return;
        let level: ProblemSeverity;
        switch (idx) {
          case 0:
          case 1:
            level = "warning";
            break;
          default:
            level = "error";
            break;
        }
        problems.push({
          description: ensureCapital(error.description()),
          severity: level,
          startColumn: 0,
          endColumn: 0,
          startLineNumber: 0,
          endLineNumber: 0,
        });
      });
    });
    return new ParsedDOM(xmlDoc, dom, problems);
  }

  private libxmljsToIDOM(
    root: libxmljs.Element,
    isRealRoot?: boolean
  ): LibxmlsjsToIDOMResult {
    if (root.type() !== "element") return null;

    // Parse to IDOM
    const children: IDOM[] = [];
    const problems: IProblemItem[] = [];
    for (const node of root.childNodes()) {
      const ret = this.libxmljsToIDOM(node as libxmljs.Element);
      if (ret) {
        children.push(ret.dom);
        problems.push(...ret.problems);
      }
    }

    // Check required attributes
    const schemaElement = CellMLSchema.get(root.name());
    if (schemaElement) {
      const missingAttrs: string[] = [];
      const currentAttrs = root.attrs().map((attr) => attr.name());
      for (const attr of schemaElement.attributes) {
        if (!attr.required) continue;
        if (attr.name == "xmlns") continue;
        if (currentAttrs.find((attrName) => attrName == attr.name)) continue;
        missingAttrs.push(attr.name);
      }
      if (missingAttrs.length != 0) {
        const errorMsg = `Missing attributes: ` + missingAttrs.join(", ");
        problems.push({
          description: errorMsg,
          severity: "error",
          startColumn: 0,
          endColumn: 0,
          startLineNumber: root.line(),
          endLineNumber: root.line(),
          hidden: true,
        });
      }
    }

    return {
      dom: {
        id: isRealRoot ? -1 : this.id++,
        name: root.name(),
        altName: getAltName(root),
        lineNumber: root.line(),
        attributes: root.attrs().map((attribute: libxmljs.Attribute) => {
          return {
            key: attribute.name(),
            value: attribute.value(),
          };
        }),
        children: children,
      },
      problems: problems,
    };
  }
}

function ensureCapital(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getAltName(element: libxmljs.Element): string {
  const attributes = ["name", "component"];
  let altName;
  attributes.forEach((attribute) => {
    if (element.attr(attribute)) altName = element.attr(attribute).value();
  });
  return altName;
}
