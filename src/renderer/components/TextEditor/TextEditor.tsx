import React from "react";
import monaco, { editor, MarkerSeverity } from "monaco-editor";
import Editor, { Monaco } from "@monaco-editor/react";
import autoTagClose from "./definitions/AutoTagClose";
import ContextProvider from "./definitions/ContextProvider";
import CellMLTokeniser from "./definitions/Tokeniser";
import CellMLCompletionProvider from "./definitions/CompletionProvider";
import CellMLDocumentFormattingProvider from "./definitions/FormattingProvider";
import CellMLLanguageConfiguration from "./definitions/LanguageConfiguration";
import CellMLHoverProvider from "./definitions/HoverProvider";
import CellMLFormattingProvider from "./definitions/FormattingProvider";
import { getXPath } from "src/commons/utils/xpath";
import { IProblemItem } from "Types";

import "./MonacoLoader";

const CellMLID = "CellML2";

interface TEProps {
  hidden?: boolean;
  filepath: string;
  defaultValue: string;
  problems: IProblemItem[];
  exportComponentHandler: () => void;
  onMountCallback?: () => void;
  onChangeCallback?: (content: string) => void;
  onCursorPositionChangedCallback?: (path: string) => void;
}

interface TEState {
  currentFile?: string;
}

export default class TextEditor extends React.Component<TEProps, TEState> {
  private monacoInstance: Monaco;
  private editorInstance: monaco.editor.IStandaloneCodeEditor;
  private contextProvider: ContextProvider;
  constructor(props: TEProps) {
    super(props);
    this.contextProvider = new ContextProvider();
  }

  // prettier-ignore
  handleEditorWillMount(monacoInstance: Monaco): void {
    this.monacoInstance = monacoInstance;
    monacoInstance.languages.register({ id: CellMLID });
    monacoInstance.languages.setMonarchTokensProvider(CellMLID, CellMLTokeniser);
    monacoInstance.languages.registerCompletionItemProvider(CellMLID, CellMLCompletionProvider(this.contextProvider));
    monacoInstance.languages.registerDocumentFormattingEditProvider(CellMLID, CellMLDocumentFormattingProvider);
    monacoInstance.languages.setLanguageConfiguration(CellMLID, CellMLLanguageConfiguration);
    monacoInstance.languages.registerHoverProvider(CellMLID, CellMLHoverProvider);
    monacoInstance.languages.registerDocumentFormattingEditProvider(CellMLID, CellMLFormattingProvider);
    monacoInstance.editor.onDidCreateModel((model) => {
      this.highlightErrors(this.props.problems, model);
    })
  }

  handleEditorDidMount(
    editorInstance: monaco.editor.IStandaloneCodeEditor
  ): void {
    this.editorInstance = editorInstance;
    this.props.onMountCallback();

    // Register callback for cursor position change event
    this.editorInstance.onDidChangeCursorPosition(
      (event: editor.ICursorPositionChangedEvent) => {
        const model = this.editorInstance.getModel();
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: event.position.lineNumber,
          endColumn: model.getLineLength(event.position.lineNumber) + 1,
        });
        const xpath = getXPath(textUntilPosition);
        this.props.onCursorPositionChangedCallback(xpath);
      }
    );

    // Register new context menu action
    this.editorInstance.addAction({
      id: "export-component",
      label: "Export component",
      contextMenuGroupId: "import-export",
      contextMenuOrder: 0,
      run: () => {
        this.props.exportComponentHandler();
      },
    });
  }

  handleContentOnChange(
    value: string,
    event: monaco.editor.IModelContentChangedEvent
  ): void {
    const position = this.editorInstance.getPosition();
    const textUntilPosition = this.editorInstance.getModel().getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column + 1,
    });
    this.contextProvider.update(textUntilPosition);
    this.props.onChangeCallback(value);
    autoTagClose(this.contextProvider, this.editorInstance, event);
  }

  highlightErrors(
    errors: IProblemItem[],
    model?: monaco.editor.ITextModel
  ): void {
    if (!errors) return;
    if (!model) {
      model = this.editorInstance?.getModel();
      if (!model) return;
    }
    const fullRange = model.getFullModelRange();
    const markers: monaco.editor.IMarkerData[] = [];
    errors.forEach((error) => {
      let severity;
      switch (error.severity) {
        case "hint":
          severity = MarkerSeverity.Hint;
          break;
        case "warning":
          severity = MarkerSeverity.Warning;
          break;
        case "info":
          severity = MarkerSeverity.Info;
          break;
        default:
          severity = MarkerSeverity.Error;
          break;
      }
      if (
        error.startLineNumber < fullRange.startLineNumber ||
        error.endLineNumber > fullRange.endLineNumber
      )
        return;
      markers.push({
        severity: severity,
        message: error.description,
        startColumn: model.getLineFirstNonWhitespaceColumn(
          error.startLineNumber
        ),
        endColumn: model.getLineLastNonWhitespaceColumn(error.endLineNumber),
        startLineNumber: error.startLineNumber,
        endLineNumber: error.endLineNumber,
      });
    });
    this.monacoInstance?.editor.setModelMarkers(model, CellMLID, markers);
  }

  goToLine(lineNum: number): void {
    this.editorInstance.focus();
    this.editorInstance.revealLineInCenter(lineNum);
    this.editorInstance.setPosition({
      lineNumber: lineNum,
      column: this.editorInstance.getModel().getLineLength(lineNum) + 1,
    });
  }

  setValue(value: string): void {
    const position = this.editorInstance.getPosition();
    const range = this.editorInstance.getModel().getFullModelRange();
    this.editorInstance.executeEdits(null, [
      {
        text: value,
        range: range,
      },
    ]);
    this.editorInstance.getAction("editor.action.formatDocument").run();
    this.editorInstance.setPosition(position);
  }

  componentDidUpdate(prevProps: TEProps): void {
    if (prevProps.problems != this.props.problems) {
      this.highlightErrors(this.props.problems);
    }
  }

  render(): React.ReactNode {
    return (
      <Editor
        wrapperClassName={this.props.hidden ? "hidden" : ""}
        height="100%"
        theme="vs-dark-custom"
        language={CellMLID}
        path={this.props.filepath}
        defaultValue={this.props.defaultValue}
        onChange={this.handleContentOnChange.bind(this)}
        beforeMount={this.handleEditorWillMount.bind(this)}
        onMount={this.handleEditorDidMount.bind(this)}
        options={{ minimap: { enabled: false } }}
      />
    );
  }
}
