import monaco, { languages } from "monaco-editor";
import CellMLSchema from "./CellMLSchema";

const hoverProvider: languages.HoverProvider = {
  provideHover: (
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ) => {
    const word = model.getWordAtPosition(position)?.word;
    console.log(word);
    if (CellMLSchema.has(word)) {
      console.log(`${CellMLSchema.get(word).insertText}`)
      return {
        contents: [
          { value: `**${word}**` },
          { value: `${CellMLSchema.get(word).documentation}` },
        ],
      };
    }

    return undefined;
  },
};

export default hoverProvider;
