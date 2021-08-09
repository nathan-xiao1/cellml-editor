import monaco from "monaco-editor";
import xmlFormat from "xml-formatter";

const formatter: monaco.languages.DocumentFormattingEditProvider = {
  provideDocumentFormattingEdits: (
    model: monaco.editor.ITextModel,
    options: monaco.languages.FormattingOptions
  ) => {
    return [
      {
        text: xmlFormat(model.getValue(), {
          indentation: " ".repeat(options.tabSize),
        }),
        range: model.getFullModelRange(),
      },
    ];
  },
};

export default formatter;
