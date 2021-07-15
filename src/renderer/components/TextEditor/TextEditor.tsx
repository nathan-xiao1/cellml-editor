import React from "react";
import monaco from 'monaco-editor';
import Editor, { Monaco } from "@monaco-editor/react";
import autoTagClose from "./definitions/AutoTagClose";
import ContextProvider from "./definitions/ContextProvider";
import CellMLTokeniser from "./definitions/Tokeniser";
import CellMLCompletionProvider from "./definitions/CompletionProvider";
import CellMLDocumentFormattingProvider from "./definitions/FormattingProvider";
import CellMLLanguageConfiguration from './definitions/LanguageConfiguration';
import CellMLHoverProvider from './definitions/HoverProvider';
import CellMLFormattingProvider from './definitions/FormattingProvider';
import "./MonacoLoader";

const CellMLID = "CellML2";

interface TEProps {
  hidden?: boolean;
  filepath: string;
  defaultValue: string;
  onMountCallback?: () => void;
  onChangeCallback?: (content: string) => void;
}

interface TEState {
  currentFile?: string;
}

export default class TextEditor extends React.Component<TEProps, TEState> {

  private editorInstance: monaco.editor.IStandaloneCodeEditor;
  private contextProvider: ContextProvider;
  constructor(props: TEProps) {
    super(props);
    this.contextProvider = new ContextProvider()
  }

  handleEditorWillMount(monacoInstance: Monaco): void {
    monacoInstance.languages.register({ id: CellMLID });
    monacoInstance.languages.setMonarchTokensProvider(CellMLID, CellMLTokeniser);
    monacoInstance.languages.registerCompletionItemProvider(CellMLID, CellMLCompletionProvider(this.contextProvider));
    monacoInstance.languages.registerDocumentFormattingEditProvider(CellMLID, CellMLDocumentFormattingProvider);
    monacoInstance.languages.setLanguageConfiguration(CellMLID, CellMLLanguageConfiguration);
    monacoInstance.languages.registerHoverProvider(CellMLID, CellMLHoverProvider)
    monacoInstance.languages.registerDocumentFormattingEditProvider(CellMLID, CellMLFormattingProvider)
  }

  handleEditorDidMount(editorInstance: monaco.editor.IStandaloneCodeEditor): void {
    this.editorInstance = editorInstance; 
    this.props.onMountCallback();
  }

  handleContentOnChange(value: string, event: monaco.editor.IModelContentChangedEvent): void {
    const position = this.editorInstance.getPosition();
    const textUntilPosition = this.editorInstance.getModel().getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    })
    this.contextProvider.update(textUntilPosition);
    autoTagClose(this.contextProvider, this.editorInstance, event);
    this.props.onChangeCallback(value);
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
