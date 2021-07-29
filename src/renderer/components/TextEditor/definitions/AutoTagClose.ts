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
    event.isUndoing ||
    event.isRedoing ||
    lastChange.text.length > 1 ||
    (lastCharacter !== ">" && lastCharacter !== "/") ||
    !contextProvider.lastOpenedTag ||
    contextProvider.tagContextPrev == TagContextType.IN_CLOSE_TAG ||
    contextProvider.tagContextPrev == TagContextType.NOT_IN_TAG
  ) {
    return;
  }

  // Return if the tag is a self closed tag e.g. <tag/>
  const prevCharacter = editor.getModel().getValueInRange({
    startLineNumber: lastChange.range.startLineNumber,
    endLineNumber: lastChange.range.endLineNumber,
    startColumn: lastChange.range.startColumn - 1,
    endColumn: lastChange.range.endColumn,
  });
  if (
    (lastCharacter === "/" && prevCharacter !== "<") ||
    (lastCharacter === ">" && prevCharacter === "/")
  )
    return;

  // Insert the correct closing tag based on the context
  const text =
    lastCharacter === "/"
      ? `${contextProvider.lastOpenedTag}|`
      : `</${contextProvider.lastOpenedTag}|`;
  const range = {
    startLineNumber: lastChange.range.startLineNumber,
    endLineNumber: lastChange.range.endLineNumber,
    startColumn: lastChange.range.startColumn + 1,
    endColumn: lastChange.range.endColumn + 1,
  };

  // Insert text into editor
  editor.setPosition(editor.getPosition());
  editor.pushUndoStop();
  editor.executeEdits("auto-tag-close", [
    {
      forceMoveMarkers: true,
      text: text,
      range: range,
    },
  ]);
}
