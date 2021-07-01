import monaco, { languages } from "monaco-editor";
import CellMLSchema from "./CellMLSchema";

const hoverProvider: languages.HoverProvider = {
  provideHover: (
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ) => {
    const word = model.getWordAtPosition(position);
    if (
      !word ||
      model.getValueInRange({
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn - 1,
        endColumn: word.startColumn,
      }) != "<"
    )
      return undefined;
    const tagName = word.word;
    if (CellMLSchema.has(tagName)) {
      return {
        contents: [
          { value: `**${tagName}**` },
          { value: `${CellMLSchema.get(tagName).documentation}` },
        ],
      };
    }

    return undefined;
  },
};

export default hoverProvider;
