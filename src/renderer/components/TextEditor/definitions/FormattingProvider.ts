import monaco from "monaco-editor";

const formatter: monaco.languages.DocumentFormattingEditProvider = {
  provideDocumentFormattingEdits: (
    model: monaco.editor.ITextModel,
    options: monaco.languages.FormattingOptions
  ) => {
    return [
      {
        text: model.getValue(),
        range: model.getFullModelRange(),
      },
    ];
  },
};

export default formatter;
