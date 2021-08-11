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
import { IProblemItem } from "Types";

import "./MonacoLoader";

const CellMLID = "CellML2";

interface TEProps {
  hidden?: boolean;
  filepath: string;
  defaultValue: string;
  problems: IProblemItem[];
  onMountCallback?: () => void;
  onChangeCallback?: (content: string) => void;
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
    // set up handler to check cursor position
    this.editorInstance.onDidChangeCursorPosition((event) => {
      // Do things
      // console.log(JSON.stringify(event));
      const model = this.editorInstance.getModel();
      const offset = model.getOffsetAt(event.position);
      // console.log("Offset: " + offset.toString());

      const str = model.getValue();
      const regex = /<math .*>[\s\S]*<\/math>/gm;

      const matches = [...str.matchAll(regex)];
      let isFound = false;
      let m;
      
      for (const match of matches) {
        const open = match.index;
        const close = open + match[0].length;
        if (open <= offset && offset <= close) {
          isFound = true;
          m = match;
          break;
        }
      }

      if (isFound) {
        console.log("math found: " + m.index.toString() + "->" + (m.index + m[0].length).toString());
        // console.log(m[0]);
      }

    });
    this.props.onMountCallback();
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
      markers.push({
        severity: severity,
        message: error.description,
        startColumn: error.startColumn,
        endColumn: error.endColumn,
        startLineNumber: error.startLineNumber,
        endLineNumber: error.endLineNumber,
      });
    });
    this.monacoInstance?.editor.setModelMarkers(
      model ? model : this.editorInstance.getModel(),
      CellMLID,
      markers
    );
  }

  goToLine(lineNum: number): void {
    this.editorInstance.focus();
    this.editorInstance.revealLineInCenter(lineNum);
    this.editorInstance.setPosition({
      lineNumber: lineNum,
      column: this.editorInstance.getModel().getLineLength(lineNum) + 1,
    });
  }

  componentDidUpdate(): void {
    this.highlightErrors(this.props.problems);
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
