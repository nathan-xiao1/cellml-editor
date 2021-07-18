import LibCellMLParser from "./LibCellMLParser";
import libxmljs from "libxmljs2";
import { IProblemItem, ProblemSeverity } from "Types";

export default class Parser {
  private cellMLParser: LibCellMLParser;

  async init(): Promise<void> {
    this.cellMLParser = new LibCellMLParser();
    return this.cellMLParser.init();
  }

  parse(content: string): IProblemItem[] {
    if (!this.cellMLParser)
      throw Error("Must call and await init() before parsing");
    const problems: IProblemItem[] = [];
    // libXMLjs2 Parser
    try {
      const result = libxmljs.parseXmlString(content, { recover: true });
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
          description: error.message,
          severity: severity,
          startColumn: error.column,
          endColumn: error.column + 1,
          startLineNumber: error.line,
          endLineNumber: error.line,
        });
      });
    } catch (error) {
      problems.push({
        description:
          error.message.charAt(0).toUpperCase() + error.message.slice(1),
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
            level = "hint";
            break;
          case 1:
            level = "warning";
            break;
          default:
            level = "error";
            break;
        }
        problems.push({
          description: error.description(),
          severity: level,
          startColumn: 0,
          endColumn: 0,
          startLineNumber: 0,
          endLineNumber: 0,
        });
      });
    });

    return problems;
  }
}
