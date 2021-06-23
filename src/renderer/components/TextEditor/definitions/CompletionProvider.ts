import monaco, { languages } from "monaco-editor";

function createDependencyProposals(
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  return [
    {
      label: '"<model>"',
      kind: languages.CompletionItemKind.Property,
      documentation: `The top-level element information item in a CellML infoset MUST be an element in the CellML namespace with a
      local name equal to model.`,
      insertText: '<model name="${1}">$0</model>',
      insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    },
  ];
}

const completionProvider: monaco.languages.CompletionItemProvider = {
  provideCompletionItems: function (
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ) {
    const word = model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    };
    return {
      suggestions: createDependencyProposals(range),
    };
  },
};

export default completionProvider;
