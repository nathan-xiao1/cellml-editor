import LibCellMLParser from "./LibCellMLParser";
import libxmljs from "libxmljs2";
import {
  IDOM,
  IParser,
  IParserResult,
  IProblemItem,
  ProblemSeverity,
} from "Types";

export default class Parser implements IParser {
  private cellMLParser: LibCellMLParser;
  private id: number;

  async init(): Promise<void> {
    this.id = 0;
    this.cellMLParser = new LibCellMLParser();
    return this.cellMLParser.init();
  }

  parse(content: string): IParserResult {
    if (!this.cellMLParser)
      throw Error("Must call and await init() before parsing");
    if (!content)
      return {
        dom: null,
        problems: [],
      };
    const problems: IProblemItem[] = [];
    // libXMLjs2 Parser
    let dom: IDOM;
    try {
      const result = libxmljs.parseXmlString(content, { recover: true });
      this.id = 0;
      dom = this.libxmljsToIDOM(result.root(), true);
      result.errors.forEach((error) => {
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
        problems.push({
          description: ensureCapital(error.message),
          severity: severity,
          startColumn: error.column,
          endColumn: error.column + 1,
          startLineNumber: error.line,
          endLineNumber: error.line,
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
    return {
      dom: dom,
      problems: problems,
    };
  }

  private libxmljsToIDOM(root: libxmljs.Element, isRealRoot?: boolean): IDOM {
    if (root.type() !== "element") return null;
    const children: IDOM[] = [];
    for (const node of root.childNodes()) {
      const s = this.libxmljsToIDOM(node as libxmljs.Element);
      if (s) children.push(s);
    }
    return {
      id: isRealRoot ? -1 : this.id++,
      name: root.name(),
      lineNumber: root.line(),
      children: children,
    };
  }
}

function ensureCapital(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
