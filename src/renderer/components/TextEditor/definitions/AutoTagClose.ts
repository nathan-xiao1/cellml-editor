import monaco from "monaco-editor";
import { IContextProvider } from "Types";
import { TagContextType } from "./ContextProvider";

export default function onDidChangeTextDocument(
  contextProvider: IContextProvider,
  editor: monaco.editor.IStandaloneCodeEditor,
  event: monaco.editor.IModelContentChangedEvent
): void {
  if (event == undefined || event.changes == undefined) return;

  const lastChange = event.changes[event.changes.length - 1];
  const lastCharacter = lastChange.text[lastChange.text.length - 1];
  if (
    lastChange.text.length > 1 ||
    (lastCharacter !== ">" && lastCharacter !== "/") ||
    !contextProvider.lastOpenedTag
  ) {
    return;
  }
  const text =
    lastCharacter === "/"
      ? `${contextProvider.lastOpenedTag}>`
      : `</${contextProvider.lastOpenedTag}>`;
  const range = {
    startLineNumber: lastChange.range.startLineNumber,
    endLineNumber: lastChange.range.endLineNumber,
    startColumn: lastChange.range.startColumn + 1,
    endColumn: lastChange.range.endColumn + text.length + 1,
  };
  editor.executeEdits("auto-tag-close", [
    {
      text: text,
      range: range,
    },
  ]);
}
